import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/content-store";

export const dynamic = "force-dynamic";

const routes = [
  "",
  "/programs",
  "/programs/vocational",
  "/programs/high-vocational",
  "/programs/bachelor",
  "/programs/master",
  "/programs/phd",
  "/about/history",
  "/news",
  "/news/learning",
  "/news/jobs",
  "/news/announcements",
  "/scholarships",
  "/calendar",
  "/contact",
  "/cookie-policy",
  "/sitemap",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
  const lastModified = new Date();
  const publishedPosts = await getPublishedPosts();

  const pages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : route.startsWith("/news") || route === "/calendar" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/programs" ? 0.9 : 0.7,
  }));

  return [
    ...pages,
    ...publishedPosts.map((post) => ({
      url: `${baseUrl}/posts/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
