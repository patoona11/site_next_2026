import { NextRequest, NextResponse } from "next/server";
import { contentCategories, type ContentCategory } from "@/lib/cms-types";
import { getPublishedPosts } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const categoryValue = request.nextUrl.searchParams.get("category");
  const category = categoryValue && contentCategories.includes(categoryValue as ContentCategory) ? categoryValue as ContentCategory : undefined;
  return NextResponse.json({ posts: await getPublishedPosts(category) }, { headers: { "Cache-Control": "no-store" } });
}
