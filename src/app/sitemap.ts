import type { MetadataRoute } from "next";

const routes = [
  "",
  "/programs",
  "/programs/vocational",
  "/programs/high-vocational",
  "/programs/bachelor",
  "/programs/master",
  "/programs/phd",
  "/about/history",
  "/contact",
  "/cookie-policy",
  "/sitemap",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : "monthly",
    priority: route === "" ? 1 : route === "/programs" ? 0.9 : 0.7,
  }));
}
