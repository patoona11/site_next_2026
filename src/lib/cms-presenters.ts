import type { ContentPost } from "@/lib/cms-types";

export function formatThaiDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(date);
}

export function postHref(post: ContentPost) {
  return `/posts/${post.slug}`;
}
