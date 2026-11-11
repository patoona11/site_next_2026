import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { facebookRssUrl: _privateFeedUrl, ...publicSettings } = await getSiteSettings();
  return NextResponse.json({ settings: publicSettings }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
