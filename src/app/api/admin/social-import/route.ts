import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { contentCategories, type ContentCategory } from "@/lib/cms-types";
import { createPost, getAllPosts, validatePostInput } from "@/lib/content-store";
import { getSiteSettings } from "@/lib/site-settings-store";
import { fetchSocialImportItems, isFacebookImportConfigured } from "@/lib/social-import";
import { fetchNewsLinkPreview, newsLinkPreviewFromSocialItem } from "@/lib/news-link-import";
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

function facebookPostId(value: string) {
  try {
    const url = new URL(value);
    if (!["facebook.com", "www.facebook.com", "m.facebook.com"].includes(url.hostname.toLowerCase())) return "";
    const queryId = url.searchParams.get("fbid") || url.searchParams.get("story_fbid");
    if (queryId) return queryId;
    return url.pathname.split("/").filter(Boolean).reverse().find((part) => /^\d{6,}$/.test(part)) || "";
  } catch {
    return "";
  }
}

function isFacebookUrl(value: string) {
  try {
    return ["facebook.com", "www.facebook.com", "m.facebook.com"].includes(new URL(value).hostname.toLowerCase());
  } catch {
    return false;
  }
}

function matchesFacebookPost(item: { id: string; url: string }, requestedUrl: string) {
  const requestedId = facebookPostId(requestedUrl);
  if (requestedId && (item.id === requestedId || item.id.endsWith(`_${requestedId}`) || facebookPostId(item.url) === requestedId)) return true;
  try {
    const left = new URL(item.url);
    const right = new URL(requestedUrl);
    left.hash = "";
    right.hash = "";
    return left.toString() === right.toString();
  } catch {
    return false;
  }
}

async function previewUrl(value: string) {
  if (!isFacebookUrl(value)) return fetchNewsLinkPreview(value);

  const settings = await getSiteSettings();
  const sources: SocialImportSource[] = [];
  if (isFacebookImportConfigured()) sources.push("facebook");
  if (settings.facebookRssUrl) sources.push("rss");
  if (sources.length === 0) {
    throw new Error("Facebook ไม่อนุญาตให้ดึงข้อความจากลิงก์โดยตรง กรุณาตั้งค่า Facebook Page Access Token หรือ RSS.app ก่อนใช้งาน");
  }

  for (const source of sources) {
    try {
      const item = (await fetchSocialImportItems(source, settings.facebookRssUrl)).find((candidate) => matchesFacebookPost(candidate, value));
      if (item) return newsLinkPreviewFromSocialItem(item);
    } catch {
      // Try the next configured source and return one clear message below.
    }
  }
  throw new Error("ไม่พบโพสต์นี้ใน Facebook Graph API หรือ RSS กรุณาตรวจว่าเป็นโพสต์สาธารณะของเพจและ Feed อัปเดตแล้ว");
}

export async function GET(request: NextRequest) {
  if (!await isAdminRequest(request)) return unauthorized();
  const settings = await getSiteSettings();
  return NextResponse.json({
    facebookConfigured: isFacebookImportConfigured(),
    rssConfigured: Boolean(settings.facebookRssUrl),
    facebookUrl: settings.facebookUrl,
    rssUrl: settings.facebookRssUrl,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!await isAdminRequest(request) || !isSameOrigin(request)) return unauthorized();
  try {
    const body = await request.json() as { action?: string; source?: unknown; itemId?: unknown; category?: unknown; url?: unknown };
    if (body.action === "preview-url") {
      if (typeof body.url !== "string" || body.url.length > 2000) throw new Error("กรุณาวางลิงก์ข่าวที่ถูกต้อง");
      return NextResponse.json({ item: await previewUrl(body.url) });
    }
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
