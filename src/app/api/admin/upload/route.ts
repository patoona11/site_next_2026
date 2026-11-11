import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { ensureSupabaseCmsBucket, getCmsBackend, getSupabaseCmsClient, getSupabaseStorageBucket } from "@/lib/supabase-server";

export const runtime = "nodejs";

const maximumSize = 5 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function validSignature(buffer: Buffer, type: string) {
  if (type === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === "image/webp") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  if (type === "image/gif") return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString());
  return false;
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request) || !isSameOrigin(request)) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบผู้ดูแล" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "กรุณาเลือกไฟล์ภาพ" }, { status: 400 });
  if (!allowedTypes[file.type]) return NextResponse.json({ error: "รองรับเฉพาะ JPG, PNG, WebP และ GIF" }, { status: 400 });
  if (file.size <= 0 || file.size > maximumSize) return NextResponse.json({ error: "ไฟล์ภาพต้องมีขนาดไม่เกิน 5 MB" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validSignature(buffer, file.type)) return NextResponse.json({ error: "ชนิดไฟล์ไม่ตรงกับข้อมูลภาพ" }, { status: 400 });

  const fileName = `${Date.now()}-${randomUUID()}.${allowedTypes[file.type]}`;

  if (getCmsBackend() === "supabase") {
    try {
      await ensureSupabaseCmsBucket();
      const client = getSupabaseCmsClient();
      const bucket = getSupabaseStorageBucket();
      const objectPath = `content/${fileName}`;
      const { data, error } = await client.storage.from(bucket).upload(objectPath, buffer, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data: publicData } = client.storage.from(bucket).getPublicUrl(data.path);
      return NextResponse.json({ url: publicData.publicUrl }, { status: 201 });
    } catch (error) {
      console.error("Supabase CMS upload failed", error instanceof Error ? error.message : error);
      return NextResponse.json({ error: "อัปโหลดไปยัง Supabase Storage ไม่สำเร็จ กรุณาตรวจสอบ bucket และ secret key" }, { status: 502 });
    }
  }

  const uploadDirectory = process.env.CMS_UPLOAD_DIR ? path.resolve(process.env.CMS_UPLOAD_DIR) : path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(path.join(uploadDirectory, fileName), buffer, { flag: "wx" });
  return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
}
