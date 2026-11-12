import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type CmsBackend = "local" | "supabase";

let adminClient: SupabaseClient | null = null;
let adminClientIdentity = "";
let publicClient: SupabaseClient | null = null;
let publicClientIdentity = "";
let bucketSetup: Promise<void> | null = null;

export function getCmsBackend(): CmsBackend {
  const configuredBackend = process.env.CMS_BACKEND?.trim().toLowerCase();
  if (configuredBackend === "supabase" || configuredBackend === "local") return configuredBackend;

  // Vercel Functions have a read-only application filesystem. Never fall back
  // to the JSON-file backend there, because writes to /var/task will fail.
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) return "supabase";

  const { url, secretKey } = supabaseSettings();
  return /^https:\/\//.test(url) && secretKey.length > 20 ? "supabase" : "local";
}

function supabaseSettings() {
  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim(),
    publishableKey: (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
    secretKey: (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim(),
  };
}

export function isSupabasePublicConfigured() {
  const { url, publishableKey } = supabaseSettings();
  return /^https:\/\//.test(url) && publishableKey.length > 20;
}

export function isSupabaseCmsConfigured() {
  const { url, secretKey } = supabaseSettings();
  return getCmsBackend() === "supabase" && /^https:\/\//.test(url) && secretKey.length > 20;
}

export function getSupabaseCmsClient() {
  if (getCmsBackend() !== "supabase") throw new Error("CMS ไม่ได้ตั้งค่าให้ใช้ Supabase");

  const { url, secretKey } = supabaseSettings();
  if (!url || !secretKey) {
    throw new Error("กรุณาตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SECRET_KEY ก่อนใช้งาน Supabase");
  }

  const identity = `${url}\u0000${secretKey}`;
  if (!adminClient || adminClientIdentity !== identity) {
    adminClient = createClient(url, secretKey, {
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (secretKey.startsWith("sb_secret_") && headers.get("Authorization") === `Bearer ${secretKey}`) {
            headers.delete("Authorization");
          }
          return fetch(input, { ...init, headers });
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    adminClientIdentity = identity;
    bucketSetup = null;
  }
  return adminClient;
}

export function getSupabasePublicClient() {
  const { url, publishableKey } = supabaseSettings();
  if (!url || !publishableKey) {
    throw new Error("กรุณาตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  const identity = `${url}\u0000${publishableKey}`;
  if (!publicClient || publicClientIdentity !== identity) {
    publicClient = createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    publicClientIdentity = identity;
  }
  return publicClient;
}

export function getSupabaseStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || "cms-media";
}

async function setupStorageBucket() {
  const client = getSupabaseCmsClient();
  const bucket = getSupabaseStorageBucket();
  const { data, error } = await client.storage.getBucket(bucket);
  if (data && !error) return;

  const notFound = (error as { status?: number } | null)?.status === 404 || error?.message.toLowerCase().includes("not found") || error?.message.includes("404");
  if (error && !notFound) throw new Error(`ตรวจสอบ Supabase Storage ไม่สำเร็จ: ${error.message}`);

  const { error: createError } = await client.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });
  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(`สร้าง Supabase Storage bucket ไม่สำเร็จ: ${createError.message}`);
  }
}

export async function ensureSupabaseCmsBucket() {
  if (!bucketSetup) {
    bucketSetup = setupStorageBucket().catch((error) => {
      bucketSetup = null;
      throw error;
    });
  }
  await bucketSetup;
}

export function isAllowedSupabaseImageUrl(value: string) {
  const { url } = supabaseSettings();
  if (!url) return false;
  try {
    const candidate = new URL(value);
    const project = new URL(url);
    const bucket = encodeURIComponent(getSupabaseStorageBucket());
    return candidate.origin === project.origin && candidate.pathname.startsWith(`/storage/v1/object/public/${bucket}/`);
  } catch {
    return false;
  }
}
