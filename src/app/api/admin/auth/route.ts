import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, createAdminSessionToken, getAdminAuthMode, isAdminConfigured, isAdminRequest, isAllowedSupabaseAdmin, isSameOrigin, verifyAdminCredentials } from "@/lib/admin-auth";
import { getCmsBackend, isSupabaseCmsConfigured } from "@/lib/supabase-server";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

const secureCookie = process.env.NODE_ENV === "production" && (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https://");

const attempts = new Map<string, { count: number; resetAt: number }>();
const maxAttempts = 5;
const windowMs = 15 * 60 * 1000;

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 0, resetAt: now + windowMs });
    return false;
  }
  return entry.count >= maxAttempts;
}

export async function GET(request: NextRequest) {
  const backend = getCmsBackend();
  return NextResponse.json({
    configured: isAdminConfigured(),
    authenticated: await isAdminRequest(request),
    authMode: getAdminAuthMode(),
    backend,
    backendConfigured: backend === "local" || isSupabaseCmsConfigured(),
  });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ได้มาจากเว็บไซต์นี้" }, { status: 403 });
  if (!isAdminConfigured()) return NextResponse.json({ error: getAdminAuthMode() === "supabase" ? "ยังไม่ได้ตั้งค่า Supabase Auth และ ADMIN_EMAIL_ALLOWLIST" : "ยังไม่ได้ตั้งค่า ADMIN_PASSWORD และ ADMIN_SESSION_SECRET" }, { status: 503 });

  const key = clientKey(request);
  if (isRateLimited(key)) return NextResponse.json({ error: "ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอ 15 นาที" }, { status: 429 });

  const body = await request.json().catch(() => ({})) as { username?: string; password?: string };
  if (getAdminAuthMode() === "supabase") {
    const supabase = createClient(await cookies());
    const { data, error } = await supabase.auth.signInWithPassword({ email: body.username || "", password: body.password || "" });
    if (error || !isAllowedSupabaseAdmin(data.user)) {
      await supabase.auth.signOut();
      const entry = attempts.get(key)!;
      entry.count += 1;
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีไม่มีสิทธิ์ผู้ดูแล" }, { status: 401 });
    }
    attempts.delete(key);
    return NextResponse.json({ authenticated: true, backend: getCmsBackend(), authMode: "supabase" });
  }

  if (!verifyAdminCredentials(body.username || "", body.password || "")) {
    const entry = attempts.get(key)!;
    entry.count += 1;
    return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  attempts.delete(key);
  const response = NextResponse.json({ authenticated: true, backend: getCmsBackend() });
  response.cookies.set(adminCookieName, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: secureCookie,
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "คำขอไม่ได้มาจากเว็บไซต์นี้" }, { status: 403 });
  if (getAdminAuthMode() === "supabase") {
    const supabase = createClient(await cookies());
    await supabase.auth.signOut();
  }
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminCookieName, "", { httpOnly: true, sameSite: "strict", secure: secureCookie, path: "/", maxAge: 0 });
  return response;
}
