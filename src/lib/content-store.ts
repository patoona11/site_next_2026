import "server-only";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { contentCategories, contentStatuses, type ContentCategory, type ContentPost, type ContentPostInput } from "@/lib/cms-types";
import { getCmsBackend, getSupabaseCmsClient, getSupabasePublicClient, isAllowedSupabaseImageUrl } from "@/lib/supabase-server";

type ContentDatabase = { posts: ContentPost[] };
type ContentPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: ContentCategory;
  status: ContentPost["status"];
  image_url: string;
  external_url: string;
  published_at: string;
  created_at: string;
  updated_at: string;
};

const contentPostColumns = "id,slug,title,excerpt,body,category,status,image_url,external_url,published_at,created_at,updated_at";

const dataDirectory = process.env.CMS_DATA_DIR ? path.resolve(process.env.CMS_DATA_DIR) : path.join(process.cwd(), "data");
const contentFile = path.join(dataDirectory, "content.json");
let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureDatabase() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(contentFile);
  } catch {
    await fs.writeFile(contentFile, JSON.stringify({ posts: [] }, null, 2), "utf8");
  }
}

async function readDatabase(): Promise<ContentDatabase> {
  await ensureDatabase();
  const raw = await fs.readFile(contentFile, "utf8");
  const parsed = JSON.parse(raw) as Partial<ContentDatabase>;
  return { posts: Array.isArray(parsed.posts) ? parsed.posts : [] };
}

async function writeDatabase(database: ContentDatabase) {
  await ensureDatabase();
  const temporaryFile = `${contentFile}.${randomUUID()}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(database, null, 2), "utf8");
  await fs.rename(temporaryFile, contentFile);
}

function queueWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanUrl(value: unknown) {
  const url = cleanText(value, 1000);
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function cleanImageUrl(value: unknown) {
  const url = cleanText(value, 1000);
  return /^\/uploads\/[a-zA-Z0-9.-]+$/.test(url) || isAllowedSupabaseImageUrl(url) ? url : "";
}

function slugify(title: string, id: string) {
  const base = title
    .normalize("NFKC")
    .toLocaleLowerCase("th")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return `${base || "post"}-${id.slice(0, 8)}`;
}

function normalizeSlugParam(slug: string) {
  try {
    return decodeURIComponent(slug).normalize("NFKC");
  } catch {
    return slug.normalize("NFKC");
  }
}

export function validatePostInput(value: unknown): ContentPostInput {
  const input = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const title = cleanText(input.title, 240);
  const excerpt = cleanText(input.excerpt, 600);
  const body = cleanText(input.body, 30000);
  const category = cleanText(input.category, 30) as ContentCategory;
  const status = cleanText(input.status, 20) as ContentPostInput["status"];
  const image = cleanImageUrl(input.image);
  const externalUrl = cleanUrl(input.externalUrl);
  const requestedDate = cleanText(input.publishedAt, 60);
  const publishedAt = Number.isNaN(Date.parse(requestedDate)) ? new Date().toISOString() : new Date(requestedDate).toISOString();

  if (!title) throw new Error("กรุณาระบุชื่อเรื่อง");
  if (!contentCategories.includes(category)) throw new Error("หมวดเนื้อหาไม่ถูกต้อง");
  if (!contentStatuses.includes(status)) throw new Error("สถานะเนื้อหาไม่ถูกต้อง");

  return { title, excerpt, body, category, status, image, externalUrl, publishedAt };
}

async function getAllLocalPosts() {
  const database = await readDatabase();
  return [...database.posts].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

async function getPublishedLocalPosts(category?: ContentCategory) {
  const database = await readDatabase();
  return database.posts
    .filter((post) => post.status === "published" && (!category || post.category === category))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

async function getPublishedLocalPostBySlug(slug: string) {
  const database = await readDatabase();
  const normalizedSlug = normalizeSlugParam(slug);
  return database.posts.find((post) => post.slug.normalize("NFKC") === normalizedSlug && post.status === "published") ?? null;
}

function createLocalPost(input: ContentPostInput) {
  return queueWrite(async () => {
    const database = await readDatabase();
    const id = randomUUID();
    const now = new Date().toISOString();
    const post: ContentPost = { ...input, id, slug: slugify(input.title, id), createdAt: now, updatedAt: now };
    database.posts.push(post);
    await writeDatabase(database);
    return post;
  });
}

function updateLocalPost(id: string, input: ContentPostInput) {
  return queueWrite(async () => {
    const database = await readDatabase();
    const index = database.posts.findIndex((post) => post.id === id);
    if (index < 0) throw new Error("ไม่พบเนื้อหาที่ต้องการแก้ไข");
    const current = database.posts[index];
    const post: ContentPost = { ...current, ...input, slug: current.slug, updatedAt: new Date().toISOString() };
    database.posts[index] = post;
    await writeDatabase(database);
    return post;
  });
}

function deleteLocalPost(id: string) {
  return queueWrite(async () => {
    const database = await readDatabase();
    const nextPosts = database.posts.filter((post) => post.id !== id);
    if (nextPosts.length === database.posts.length) throw new Error("ไม่พบเนื้อหาที่ต้องการลบ");
    await writeDatabase({ posts: nextPosts });
  });
}

function fromSupabaseRow(row: ContentPostRow): ContentPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    body: row.body || "",
    category: row.category,
    status: row.status,
    image: row.image_url || "",
    externalUrl: row.external_url || "",
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSupabaseInput(input: ContentPostInput) {
  return {
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    category: input.category,
    status: input.status,
    image_url: input.image,
    external_url: input.externalUrl,
    published_at: input.publishedAt,
  };
}

function databaseError(action: string, error: { message: string; code?: string }) {
  console.error(`Supabase CMS ${action} failed`, { code: error.code, message: error.message });
  return new Error(`Supabase ${action} ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อและ schema`);
}

async function getAllSupabasePosts() {
  const { data, error } = await getSupabaseCmsClient()
    .from("content_posts")
    .select(contentPostColumns)
    .order("updated_at", { ascending: false });
  if (error) throw databaseError("อ่านเนื้อหา", error);
  return ((data || []) as ContentPostRow[]).map(fromSupabaseRow);
}

async function getPublishedSupabasePosts(category?: ContentCategory) {
  let query = getSupabasePublicClient()
    .from("content_posts")
    .select(contentPostColumns)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw databaseError("อ่านเนื้อหาที่เผยแพร่", error);
  return ((data || []) as ContentPostRow[]).map(fromSupabaseRow);
}

async function getPublishedSupabasePostBySlug(slug: string) {
  const normalizedSlug = normalizeSlugParam(slug);
  const { data, error } = await getSupabasePublicClient()
    .from("content_posts")
    .select(contentPostColumns)
    .eq("slug", normalizedSlug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw databaseError("อ่านบทความ", error);
  return data ? fromSupabaseRow(data as ContentPostRow) : null;
}

async function createSupabasePost(input: ContentPostInput) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseCmsClient()
    .from("content_posts")
    .insert({
      id,
      slug: slugify(input.title, id),
      ...toSupabaseInput(input),
      created_at: now,
      updated_at: now,
    })
    .select(contentPostColumns)
    .single();
  if (error) throw databaseError("สร้างเนื้อหา", error);
  return fromSupabaseRow(data as ContentPostRow);
}

async function updateSupabasePost(id: string, input: ContentPostInput) {
  const { data, error } = await getSupabaseCmsClient()
    .from("content_posts")
    .update({ ...toSupabaseInput(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(contentPostColumns)
    .maybeSingle();
  if (error) throw databaseError("แก้ไขเนื้อหา", error);
  if (!data) throw new Error("ไม่พบเนื้อหาที่ต้องการแก้ไข");
  return fromSupabaseRow(data as ContentPostRow);
}

async function deleteSupabasePost(id: string) {
  const { data, error } = await getSupabaseCmsClient()
    .from("content_posts")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw databaseError("ลบเนื้อหา", error);
  if (!data) throw new Error("ไม่พบเนื้อหาที่ต้องการลบ");
}

export function getAllPosts() {
  return getCmsBackend() === "supabase" ? getAllSupabasePosts() : getAllLocalPosts();
}

export function getPublishedPosts(category?: ContentCategory) {
  return getCmsBackend() === "supabase" ? getPublishedSupabasePosts(category) : getPublishedLocalPosts(category);
}

export function getPublishedPostBySlug(slug: string) {
  return getCmsBackend() === "supabase" ? getPublishedSupabasePostBySlug(slug) : getPublishedLocalPostBySlug(slug);
}

export function createPost(input: ContentPostInput) {
  return getCmsBackend() === "supabase" ? createSupabasePost(input) : createLocalPost(input);
}

export function updatePost(id: string, input: ContentPostInput) {
  return getCmsBackend() === "supabase" ? updateSupabasePost(id, input) : updateLocalPost(id, input);
}

export function deletePost(id: string) {
  return getCmsBackend() === "supabase" ? deleteSupabasePost(id) : deleteLocalPost(id);
}
