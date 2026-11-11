import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest, isSameOrigin } from "@/lib/admin-auth";
import { createPost, deletePost, getAllPosts, updatePost, validatePostInput } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "กรุณาเข้าสู่ระบบผู้ดูแล" }, { status: 401 });
}

function mutationAllowed(request: NextRequest) {
  return isAdminRequest(request) && isSameOrigin(request);
}

function revalidateNewsPages() {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/news/[slug]", "page");
  revalidatePath("/posts/[slug]", "page");
  revalidatePath("/feed.xml");
  revalidatePath("/api/posts");
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({ posts: await getAllPosts() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!mutationAllowed(request)) return unauthorized();
  try {
    const post = await createPost(validatePostInput(await request.json()));
    revalidateNewsPages();
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "บันทึกเนื้อหาไม่สำเร็จ" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  if (!mutationAllowed(request)) return unauthorized();
  try {
    const body = await request.json() as { id?: string } & Record<string, unknown>;
    if (!body.id) throw new Error("ไม่พบรหัสเนื้อหา");
    const post = await updatePost(body.id, validatePostInput(body));
    revalidateNewsPages();
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "แก้ไขเนื้อหาไม่สำเร็จ" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!mutationAllowed(request)) return unauthorized();
  try {
    const body = await request.json() as { id?: string };
    if (!body.id) throw new Error("ไม่พบรหัสเนื้อหา");
    await deletePost(body.id);
    revalidateNewsPages();
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ลบเนื้อหาไม่สำเร็จ" }, { status: 400 });
  }
}
