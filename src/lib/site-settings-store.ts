import "server-only";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings-types";
import { getCmsBackend, getSupabaseCmsClient } from "@/lib/supabase-server";

type SiteSettingsRow = {
  faculty_name_th: string;
  faculty_name_en: string;
  university_name_th: string;
  tagline: string;
  description: string;
  phone: string;
  public_relations_phone: string;
  email: string;
  address: string;
  facebook_url: string;
  facebook_rss_url: string;
};

const columns = "faculty_name_th,faculty_name_en,university_name_th,tagline,description,phone,public_relations_phone,email,address,facebook_url,facebook_rss_url";
const dataDirectory = process.env.CMS_DATA_DIR ? path.resolve(process.env.CMS_DATA_DIR) : path.join(process.cwd(), "data");
const settingsFile = path.join(dataDirectory, "settings.json");

function cleanText(value: unknown, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function cleanUrl(value: unknown) {
  const url = cleanText(value, 1000);
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export function validateSiteSettings(value: unknown): SiteSettings {
  const input = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const settings: SiteSettings = {
    facultyNameTh: cleanText(input.facultyNameTh, 160),
    facultyNameEn: cleanText(input.facultyNameEn, 200),
    universityNameTh: cleanText(input.universityNameTh, 160),
    tagline: cleanText(input.tagline, 500),
    description: cleanText(input.description, 600),
    phone: cleanText(input.phone, 80),
    publicRelationsPhone: cleanText(input.publicRelationsPhone, 80),
    email: cleanText(input.email, 240),
    address: cleanText(input.address, 600),
    facebookUrl: cleanUrl(input.facebookUrl),
    facebookRssUrl: cleanUrl(input.facebookRssUrl),
  };

  if (!settings.facultyNameTh || !settings.facultyNameEn || !settings.universityNameTh) {
    throw new Error("กรุณาระบุชื่อคณะและมหาวิทยาลัยให้ครบ");
  }
  if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    throw new Error("รูปแบบอีเมลไม่ถูกต้อง");
  }
  if (input.facebookUrl && !settings.facebookUrl) throw new Error("ลิงก์ Facebook ไม่ถูกต้อง");
  if (input.facebookRssUrl && !settings.facebookRssUrl) throw new Error("ลิงก์ RSS ไม่ถูกต้อง");
  return settings;
}

function fromRow(row: SiteSettingsRow): SiteSettings {
  return {
    facultyNameTh: row.faculty_name_th,
    facultyNameEn: row.faculty_name_en,
    universityNameTh: row.university_name_th,
    tagline: row.tagline || "",
    description: row.description || "",
    phone: row.phone || "",
    publicRelationsPhone: row.public_relations_phone || "",
    email: row.email || "",
    address: row.address || "",
    facebookUrl: row.facebook_url || "",
    facebookRssUrl: row.facebook_rss_url || "",
  };
}

function toRow(settings: SiteSettings) {
  return {
    id: "main",
    faculty_name_th: settings.facultyNameTh,
    faculty_name_en: settings.facultyNameEn,
    university_name_th: settings.universityNameTh,
    tagline: settings.tagline,
    description: settings.description,
    phone: settings.phone,
    public_relations_phone: settings.publicRelationsPhone,
    email: settings.email,
    address: settings.address,
    facebook_url: settings.facebookUrl,
    facebook_rss_url: settings.facebookRssUrl,
    updated_at: new Date().toISOString(),
  };
}

async function getLocalSettings() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    return validateSiteSettings(JSON.parse(await fs.readFile(settingsFile, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("อ่านข้อมูลเว็บไซต์ในเครื่องไม่สำเร็จ", error);
    return { ...defaultSiteSettings };
  }
}

async function updateLocalSettings(settings: SiteSettings) {
  await fs.mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${settingsFile}.${randomUUID()}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(settings, null, 2), "utf8");
  await fs.rename(temporaryFile, settingsFile);
  return settings;
}

async function getSupabaseSettings() {
  const { data, error } = await getSupabaseCmsClient()
    .from("site_settings")
    .select(columns)
    .eq("id", "main")
    .maybeSingle();
  if (error) {
    if (error.code !== "PGRST205") {
      console.error("Supabase site settings read failed", { code: error.code, message: error.message });
    }
    return { ...defaultSiteSettings };
  }
  return data ? fromRow(data as SiteSettingsRow) : { ...defaultSiteSettings };
}

async function updateSupabaseSettings(settings: SiteSettings) {
  const { data, error } = await getSupabaseCmsClient()
    .from("site_settings")
    .upsert(toRow(settings), { onConflict: "id" })
    .select(columns)
    .single();
  if (error) {
    console.error("Supabase site settings update failed", { code: error.code, message: error.message });
    throw new Error("บันทึกข้อมูลเว็บไซต์ไปยัง Supabase ไม่สำเร็จ กรุณาตรวจสอบ migration");
  }
  return fromRow(data as SiteSettingsRow);
}

export function getSiteSettings() {
  return getCmsBackend() === "supabase" ? getSupabaseSettings() : getLocalSettings();
}

export function updateSiteSettings(value: unknown) {
  const settings = validateSiteSettings(value);
  return getCmsBackend() === "supabase" ? updateSupabaseSettings(settings) : updateLocalSettings(settings);
}
