import "server-only";

import { randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ensureSupabaseCmsBucket, getCmsBackend, getSupabaseCmsClient, getSupabaseStorageBucket } from "@/lib/supabase-server";
import type { NewsLinkPreview } from "@/lib/social-import-types";

const maximumHtmlBytes = 2_000_000;
const maximumImageBytes = 5 * 1024 * 1024;
const allowedImageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function isPrivateIp(address: string) {
  const normalized = address.toLowerCase();
  if (["::", "::1"].includes(normalized) || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  const mapped = normalized.startsWith("::ffff:") ? normalized.slice(7) : normalized;
  if (isIP(mapped) !== 4) return false;
  const octets = mapped.split(".").map(Number);
  return octets[0] === 0 || octets[0] === 10 || octets[0] === 127 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) ||
    (octets[0] >= 224);
}

async function assertPublicHttpUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://");
  if (url.username || url.password || (url.port && !["80", "443"].includes(url.port))) throw new Error("ลิงก์มีรูปแบบที่ไม่อนุญาต");
  if (url.hostname === "localhost" || url.hostname.endsWith(".local")) throw new Error("ไม่อนุญาตลิงก์จากเครือข่ายภายใน");
  const addresses = await lookup(url.hostname, { all: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateIp(address))) throw new Error("ไม่อนุญาตลิงก์จากเครือข่ายภายใน");
  return url;
}

async function fetchWithSafeRedirects(value: string, accept: string) {
  let current = await assertPublicHttpUrl(value);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(current, {
      cache: "no-store",
      redirect: "manual",
      headers: {
        Accept: accept,
        "User-Agent": "Mozilla/5.0 (compatible; ITECH-NPU-News-Importer/1.0)",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new Error("เว็บไซต์เปลี่ยนเส้นทางมากเกินไป");
      current = await assertPublicHttpUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new Error(`เปิดลิงก์ไม่สำเร็จ (${response.status})`);
    return { response, finalUrl: current };
  }
  throw new Error("เปิดลิงก์ไม่สำเร็จ");
}

function decodeHtml(value: string) {
  const named: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&([a-z]+);/gi, (match, name: string) => named[name.toLowerCase()] ?? match);
}

function cleanText(value: string, maximumLength: number) {
  return decodeHtml(value).replace(/\s+/g, " ").trim().slice(0, maximumLength);
}

function cleanBodyText(value: string, maximumLength: number) {
  return decodeHtml(value)
    .split(/\r?\n/)
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1]))
    .join("\n")
    .trim()
    .slice(0, maximumLength);
}

function attribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
  return match ? decodeHtml(match[2]).trim() : "";
}

function metaContent(html: string, keys: string[]) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const key = (attribute(tag, "property") || attribute(tag, "name") || attribute(tag, "itemprop")).toLowerCase();
    if (keys.includes(key)) return attribute(tag, "content");
  }
  return "";
}

function stripHtml(value: string, maximumLength: number) {
  return cleanBodyText(value
    .replace(/<(script|style|svg|nav|header|footer|form|aside)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|h[1-6]|li)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " "), maximumLength);
}

function jsonLdValues(html: string) {
  const values: Record<string, unknown>[] = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]) as unknown;
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const candidate of candidates) {
        if (candidate && typeof candidate === "object") {
          const record = candidate as Record<string, unknown>;
          const graph = Array.isArray(record["@graph"]) ? record["@graph"] : [];
          values.push(record, ...graph.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")));
        }
      }
    } catch {
      // Ignore invalid third-party JSON-LD and continue with Open Graph metadata.
    }
  }
  return values;
}

function firstJsonString(values: Record<string, unknown>[], keys: string[]) {
  for (const value of values) for (const key of keys) if (typeof value[key] === "string" && value[key]) return value[key] as string;
  return "";
}

function absoluteUrl(value: string, base: URL) {
  if (!value) return "";
  try {
    const url = new URL(value, base);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function validImageSignature(buffer: Buffer, type: string) {
  if (type === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === "image/webp") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  if (type === "image/gif") return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString());
  return false;
}

async function copyImageToCms(imageUrl: string) {
  if (!imageUrl || getCmsBackend() !== "supabase") return "";
  try {
    const { response } = await fetchWithSafeRedirects(imageUrl, "image/jpeg,image/png,image/webp,image/gif");
    const type = (response.headers.get("content-type") || "").split(";", 1)[0].toLowerCase();
    const extension = allowedImageTypes[type];
    const declaredSize = Number(response.headers.get("content-length") || "0");
    if (!extension || declaredSize > maximumImageBytes) return "";
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length <= 0 || buffer.length > maximumImageBytes || !validImageSignature(buffer, type)) return "";
    await ensureSupabaseCmsBucket();
    const client = getSupabaseCmsClient();
    const bucket = getSupabaseStorageBucket();
    const objectPath = `imports/${Date.now()}-${randomUUID()}.${extension}`;
    const { data, error } = await client.storage.from(bucket).upload(objectPath, buffer, { cacheControl: "31536000", contentType: type, upsert: false });
    if (error) return "";
    return client.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
  } catch {
    return "";
  }
}

export async function fetchNewsLinkPreview(value: string): Promise<NewsLinkPreview> {
  const { response, finalUrl } = await fetchWithSafeRedirects(value, "text/html,application/xhtml+xml;q=0.9");
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) throw new Error("ลิงก์นี้ไม่ใช่หน้าเว็บข่าว");
  const declaredSize = Number(response.headers.get("content-length") || "0");
  if (declaredSize > maximumHtmlBytes) throw new Error("หน้าเว็บมีขนาดใหญ่เกินไป");
  const html = await response.text();
  if (Buffer.byteLength(html, "utf8") > maximumHtmlBytes) throw new Error("หน้าเว็บมีขนาดใหญ่เกินไป");

  const jsonLd = jsonLdValues(html);
  const titleTag = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
  const articleBlock = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || "";
  const title = cleanText(metaContent(html, ["og:title", "twitter:title"]) || firstJsonString(jsonLd, ["headline", "name"]) || titleTag, 240);
  const description = cleanText(metaContent(html, ["og:description", "twitter:description", "description"]) || firstJsonString(jsonLd, ["description"]), 600);
  const articleBody = firstJsonString(jsonLd, ["articleBody", "text"]);
  const body = stripHtml(articleBody || articleBlock || description, 30_000) || description;
  const rawDate = metaContent(html, ["article:published_time", "date", "datepublished"]) || firstJsonString(jsonLd, ["datePublished", "dateCreated"]) || attribute(html.match(/<time\b[^>]*>/i)?.[0] || "", "datetime");
  const parsedDate = Date.parse(rawDate);
  const rawImage = metaContent(html, ["og:image:secure_url", "og:image", "twitter:image"]) || firstJsonString(jsonLd, ["image", "thumbnailUrl"]);
  const sourceImage = absoluteUrl(rawImage, finalUrl);

  if (!title) throw new Error("ไม่พบชื่อข่าวในลิงก์นี้ กรุณาลองลิงก์หน้าข่าวโดยตรง");
  const image = await copyImageToCms(sourceImage);
  return {
    title,
    excerpt: description || body.slice(0, 600),
    body: body || description,
    externalUrl: finalUrl.toString(),
    publishedAt: Number.isNaN(parsedDate) ? new Date().toISOString() : new Date(parsedDate).toISOString(),
    image,
    sourceImage,
  };
}
