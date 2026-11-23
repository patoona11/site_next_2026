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

export interface NewsLinkPreview {
  title: string;
  excerpt: string;
  body: string;
  externalUrl: string;
  publishedAt: string;
  image: string;
  sourceImage: string;
}
