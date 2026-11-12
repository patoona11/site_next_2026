import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

export const adminCookieName = "itech_admin_session";
const sessionDurationMs = 8 * 60 * 60 * 1000;

export function getAdminAuthMode() {
  return process.env.ADMIN_AUTH_MODE?.trim().toLowerCase() === "supabase" ? "supabase" : "password";
}

function config() {
  return {
    username: process.env.ADMIN_USERNAME?.trim() || "admin",
    password: process.env.ADMIN_PASSWORD?.trim() || "",
    secret: process.env.ADMIN_SESSION_SECRET?.trim() || "",
  };
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isAdminConfigured() {
  if (getAdminAuthMode() === "supabase") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
    const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
    return /^https:\/\//.test(url) && key.length > 20 && adminEmailAllowlist().size > 0;
  }
  const { password, secret } = config();
  return password.length >= 8 && secret.length >= 32;
}

export function verifyAdminCredentials(username: string, password: string) {
  const settings = config();
  return isAdminConfigured() && safeEqual(username, settings.username) && safeEqual(password, settings.password);
}

export function createAdminSessionToken() {
  const { secret } = config();
  const expiresAt = String(Date.now() + sessionDurationMs);
  return `${expiresAt}.${signature(expiresAt, secret)}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token || !isAdminConfigured()) return false;
  const [expiresAt, receivedSignature] = token.split(".");
  if (!expiresAt || !receivedSignature || Number(expiresAt) <= Date.now()) return false;
  return safeEqual(receivedSignature, signature(expiresAt, config().secret));
}

function adminEmailAllowlist() {
  return new Set((process.env.ADMIN_EMAIL_ALLOWLIST || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export function isAllowedSupabaseAdmin(user: User | null) {
  if (!user?.email) return false;
  return adminEmailAllowlist().has(user.email.toLowerCase());
}

export async function isAdminRequest(request: NextRequest) {
  if (getAdminAuthMode() === "password") return verifyAdminSessionToken(request.cookies.get(adminCookieName)?.value);
  if (!isAdminConfigured()) return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: () => undefined,
    },
  });
  const { data, error } = await supabase.auth.getUser();
  return !error && isAllowedSupabaseAdmin(data.user);
}

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = new Set([new URL(request.url).origin]);
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) {
    try {
      allowedOrigins.add(new URL(configuredUrl).origin);
    } catch {
      // An invalid public URL should not expand the origin allowlist.
    }
  }
  return allowedOrigins.has(origin);
}
