import { supabase } from "./supabase";

export interface CMSContent {
  id: string;
  title: string;
  content: string;
  published_at: string;
  category: "News" | "Announcement" | "System Link" | "Event";
  image_url?: string;
  link?: string;
}

// Mock data to simulate Headless CMS response (e.g. Strapi / Payload CMS)
const mockData: CMSContent[] = [
  {
    id: "1",
    title: "Global Tech Innovation Summit 2026",
    content: "Join us for the annual technology summit featuring keynote speakers from top tech giants, showcasing our students' latest AI and Robotics projects.",
    published_at: "2026-06-20T10:00:00Z",
    category: "Event",
    image_url: "/banner1.png",
  },
  {
    id: "2",
    title: "Fall Semester Registration Open",
    content: "Course registration for the upcoming Fall Semester is now available. Please ensure all prerequisites are met before enrolling.",
    published_at: "2026-06-21T08:30:00Z",
    category: "Announcement",
    image_url: "/banner2.png",
  },
  {
    id: "3",
    title: "New AI Research Lab Inaugurated",
    content: "The university has opened a new state-of-the-art AI research laboratory equipped with the latest quantum computing simulators.",
    published_at: "2026-06-18T14:00:00Z",
    category: "News",
    image_url: "/banner3.png",
  },
  {
    id: "4",
    title: "Student Portal (SIS)",
    content: "Access your grades, schedules, and financial information.",
    published_at: "2026-01-01T00:00:00Z",
    category: "System Link",
    link: "https://sis.example.edu",
    image_url: "/dean.png",
  },
  {
    id: "5",
    title: "Library Resources",
    content: "Digital archives and study room bookings.",
    published_at: "2026-01-01T00:00:00Z",
    category: "System Link",
    link: "https://library.example.edu",
  }
];

export async function fetchNewsAndAnnouncements(): Promise<CMSContent[]> {
  try {
    // Attempt to fetch from Supabase if configured
    if (supabase) {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .order('published_at', { ascending: false });
        
      if (!error && data && data.length > 0) {
        return data as CMSContent[];
      }
    }
  } catch (error) {
    console.error("Supabase fetch failed, falling back to mock data", error);
  }

  // Fallback to mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, 800);
  });
}
