export type SocialImportSource = "rss" | "facebook";

export interface SocialImportItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  imageUrl: string;
  source: SocialImportSource;
}
