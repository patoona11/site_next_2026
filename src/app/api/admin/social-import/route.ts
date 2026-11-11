import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { contentCategories, type ContentCategory } from "@/lib/cms-types";
import { createPost, getAllPosts, validatePostInput } from "@/lib/content-store";
import { getSiteSettings } from "@/lib/site-settings-store";
import { fetchSocialImportItems, isFacebookImportConfigured } from "@/lib/social-import";
import type { SocialImportSource } from "@/lib/social-import-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "กรุณาเข้าสู่ระบบผู้ดูแล" }, { status: 401 });
}

function getSource(value: unknown): SocialImportSource {
  if (value === "facebook" || value === "rss") return value;
  throw new Error("แหล่งข่าวไม่ถูกต้อง");
}

async function sourceItems(source: SocialImportSource) {
  const settings = await getSiteSettings();
  return fetchSocialImportItems(source, settings.facebookRssUrl);
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  const settings = await getSiteSettings();
  return NextResponse.json({
    facebookConfigured: isFacebookImportConfigured(),
    rssConfigured: Boolean(settings.facebookRssUrl),
    facebookUrl: settings.facebookUrl,
    rssUrl: settings.facebookRssUrl,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request) || !isSameOrigin(request)) return unauthorized();
  try {
    const body = await request.json() as { action?: string; source?: unknown; itemId?: unknown; category?: unknown };
    const source = getSource(body.source);
    const items = await sourceItems(source);
    if (body.action === "preview") return NextResponse.json({ items });
    if (body.action !== "import" || typeof body.itemId !== "string") throw new Error("คำสั่งนำเข้าไม่ถูกต้อง");

    const category = body.category as ContentCategory;
    if (!contentCategories.includes(category)) throw new Error("หมวดข่าวไม่ถูกต้อง");
    const item = items.find((candidate) => candidate.id === body.itemId);
    if (!item) throw new Error("ไม่พบข่าวต้นฉบับ กรุณาโหลดรายการใหม่");
    const existing = (await getAllPosts()).find((post) => post.externalUrl === item.url);
    if (existing) throw new Error("ข่าวนี้อยู่ในระบบแล้ว");

    const post = await createPost(validatePostInput({
      title: item.title,
      excerpt: item.description.slice(0, 600),
      body: item.description,
      category,
      status: "draft",
      image: "",
      externalUrl: item.url,
      publishedAt: item.publishedAt,
    }));
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "นำเข้าข่าวไม่สำเร็จ" }, { status: 400 });
  }
}
