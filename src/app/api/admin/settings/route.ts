import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { getSiteSettings, updateSiteSettings } from "@/lib/site-settings-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "กรุณาเข้าสู่ระบบผู้ดูแล" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!await isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ settings: await getSiteSettings() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!await isAdminRequest(request) || !isSameOrigin(request)) return unauthorized();
  try {
    const settings = await updateSiteSettings(await request.json());
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "บันทึกข้อมูลเว็บไซต์ไม่สำเร็จ" }, { status: 400 });
  }
}
