import { NextRequest } from "next/server";
import { categoryLabels } from "@/lib/cms-types";
import { getPublishedPosts } from "@/lib/content-store";
import { getSiteSettings } from "@/lib/site-settings-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rssDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

export async function GET(request: NextRequest) {
  const [posts, settings] = await Promise.all([getPublishedPosts(), getSiteSettings()]);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
  const feedUrl = `${baseUrl}/feed.xml`;
  const latestUpdate = posts.reduce((latest, post) => Math.max(latest, Date.parse(post.updatedAt) || 0), Date.now());
  const items = posts.slice(0, 100).map((post) => {
    const url = `${baseUrl}/posts/${encodeURIComponent(post.slug)}`;
    const description = post.excerpt || post.body.slice(0, 600);
    const imageUrl = post.image ? new URL(post.image, baseUrl).toString() : "";
    return [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <description>${escapeXml(description)}</description>`,
      `      <category>${escapeXml(categoryLabels[post.category])}</category>`,
      `      <pubDate>${rssDate(post.publishedAt)}</pubDate>`,
      post.externalUrl ? `      <source url="${escapeXml(post.externalUrl)}">Facebook / แหล่งข่าวต้นฉบับ</source>` : "",
      imageUrl ? `      <enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" />` : "",
      "    </item>",
    ].filter(Boolean).join("\n");
  }).join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(`${settings.facultyNameTh} - ข่าวสาร`)}</title>`,
    `    <link>${escapeXml(baseUrl)}</link>`,
    `    <description>${escapeXml(settings.description)}</description>`,
    "    <language>th</language>",
    `    <lastBuildDate>${new Date(latestUpdate).toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=900",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
