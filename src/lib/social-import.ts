import "server-only";

import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import type { SocialImportItem, SocialImportSource } from "@/lib/social-import-types";

const maximumFeedBytes = 1_500_000;

function cleanText(value: string, maximumLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maximumLength);
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripMarkup(value: string) {
  return cleanText(decodeXml(value).replace(/<[^>]*>/g, " "), 30_000);
}

function elementValue(block: string, names: string[]) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match) return decodeXml(match[1]).trim();
  }
  return "";
}

function attributeValue(block: string, elementNames: string[], attribute: string) {
  for (const name of elementNames) {
    const match = block.match(new RegExp(`<${name}\\b[^>]*\\b${attribute}=["']([^"']+)["'][^>]*>`, "i"));
    if (match) return decodeXml(match[1]).trim();
  }
  return "";
}

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function safeDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? new Date().toISOString() : new Date(timestamp).toISOString();
}

function titleFromDescription(description: string) {
  const firstLine = description.split(/\r?\n/).find((line) => line.trim()) || description;
  return cleanText(firstLine, 140) || "ข่าวจาก Facebook";
}

function isPrivateIp(address: string) {
  if (address === "::1" || address.startsWith("fe80:") || address.startsWith("fc") || address.startsWith("fd")) return true;
  const mapped = address.startsWith("::ffff:") ? address.slice(7) : address;
  if (isIP(mapped) !== 4) return false;
  const octets = mapped.split(".").map(Number);
  return octets[0] === 10 || octets[0] === 127 || octets[0] === 0 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168);
}

async function assertPublicFeedUrl(value: string) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("RSS ต้องใช้ลิงก์ HTTP หรือ HTTPS");
  if (url.username || url.password || url.port && !["80", "443"].includes(url.port)) throw new Error("ลิงก์ RSS มีรูปแบบที่ไม่อนุญาต");
  if (url.hostname === "localhost" || url.hostname.endsWith(".local")) throw new Error("ไม่อนุญาต RSS จากเครือข่ายภายใน");
  const addresses = await lookup(url.hostname, { all: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateIp(address))) throw new Error("ไม่อนุญาต RSS จากเครือข่ายภายใน");
  return url;
}

async function fetchPublicXml(value: string) {
  let current = await assertPublicFeedUrl(value);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(current, {
      cache: "no-store",
      redirect: "manual",
      headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9" },
      signal: AbortSignal.timeout(12_000),
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new Error("RSS เปลี่ยนเส้นทางมากเกินไป");
      current = await assertPublicFeedUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new Error(`โหลด RSS ไม่สำเร็จ (${response.status})`);
    const declaredSize = Number(response.headers.get("content-length") || "0");
    if (declaredSize > maximumFeedBytes) throw new Error("ไฟล์ RSS มีขนาดใหญ่เกินไป");
    const xml = await response.text();
    if (Buffer.byteLength(xml, "utf8") > maximumFeedBytes) throw new Error("ไฟล์ RSS มีขนาดใหญ่เกินไป");
    return xml;
  }
  throw new Error("โหลด RSS ไม่สำเร็จ");
}

export function parseRssItems(xml: string): SocialImportItem[] {
  const rssBlocks = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
  const atomBlocks = rssBlocks.length === 0
    ? [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map((match) => match[1])
    : [];

  return [...rssBlocks, ...atomBlocks].slice(0, 30).flatMap((block, index) => {
    const rawDescription = elementValue(block, ["content:encoded", "description", "content", "summary"]);
    const description = stripMarkup(rawDescription);
    const rawLink = elementValue(block, ["link"]) || attributeValue(block, ["link"], "href");
    const url = safeHttpUrl(rawLink);
    if (!url) return [];
    const rawTitle = stripMarkup(elementValue(block, ["title"]));
    const id = cleanText(stripMarkup(elementValue(block, ["guid", "id"])) || url || `rss-${index}`, 500);
    const publishedAt = safeDate(elementValue(block, ["pubDate", "published", "updated", "dc:date"]));
    const imageUrl = safeHttpUrl(attributeValue(block, ["media:content", "media:thumbnail", "enclosure"], "url"));
    return [{
      id,
      title: cleanText(rawTitle || titleFromDescription(description), 240),
      description,
      url,
      publishedAt,
      imageUrl,
      source: "rss" as const,
    }];
  });
}

export async function fetchRssItems(url: string) {
  if (!url) throw new Error("กรุณาเพิ่มลิงก์ RSS ในข้อมูลเว็บไซต์ก่อน");
  const items = parseRssItems(await fetchPublicXml(url));
  if (items.length === 0) throw new Error("ไม่พบข่าวใน RSS หรือลิงก์นี้ไม่ใช่ RSS 2.0 / Atom");
  return items;
}

type FacebookGraphPost = {
  id?: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  full_picture?: string;
};

export function isFacebookImportConfigured() {
  return Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim());
}

export async function fetchFacebookItems(): Promise<SocialImportItem[]> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("ยังไม่ได้ตั้งค่า FACEBOOK_PAGE_ACCESS_TOKEN");
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim() || "100057388091241";
  const version = process.env.FACEBOOK_GRAPH_VERSION?.trim() || process.env.FACEBOOK_GRAPH_API_VERSION?.trim() || "v26.0";
  const endpoint = new URL(`https://graph.facebook.com/${version}/${encodeURIComponent(pageId)}/published_posts`);
  endpoint.searchParams.set("fields", "id,message,created_time,permalink_url,full_picture");
  endpoint.searchParams.set("limit", "20");
  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(12_000),
  });
  const payload = await response.json() as { data?: FacebookGraphPost[]; error?: { message?: string } };
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Facebook Graph API ตอบกลับ ${response.status}`);

  return (payload.data || []).flatMap((post) => {
    const description = cleanText(post.message || "", 30_000);
    const url = safeHttpUrl(post.permalink_url || "");
    if (!post.id || !description || !url) return [];
    return [{
      id: post.id,
      title: titleFromDescription(description),
      description,
      url,
      publishedAt: safeDate(post.created_time || ""),
      imageUrl: safeHttpUrl(post.full_picture || ""),
      source: "facebook" as const,
    }];
  });
}

export function fetchSocialImportItems(source: SocialImportSource, rssUrl: string) {
  return source === "facebook" ? fetchFacebookItems() : fetchRssItems(rssUrl);
}
