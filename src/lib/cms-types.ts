export const contentCategories = ["news", "announcements", "learning", "jobs", "scholarships", "events"] as const;
export type ContentCategory = (typeof contentCategories)[number];

export const contentStatuses = ["draft", "published"] as const;
export type ContentStatus = (typeof contentStatuses)[number];

export const categoryLabels: Record<ContentCategory, string> = {
  news: "ข่าวสารและกิจกรรม",
  announcements: "ข่าวประกาศ",
  learning: "การเรียนรู้",
  jobs: "ข่าวรับสมัครงาน",
  scholarships: "ทุนการศึกษา",
  events: "ปฏิทินกิจกรรม",
};

export interface ContentPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: ContentCategory;
  status: ContentStatus;
  image: string;
  externalUrl: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentPostInput = Pick<ContentPost, "title" | "excerpt" | "body" | "category" | "status" | "image" | "externalUrl" | "publishedAt">;
