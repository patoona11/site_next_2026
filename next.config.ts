import type { NextConfig } from "next";

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  { protocol: "https", hostname: "images.unsplash.com" },
];

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const projectUrl = new URL(supabaseUrl);
    remotePatterns.push({ protocol: "https", hostname: projectUrl.hostname, pathname: "/storage/v1/object/public/**" });
  }
} catch {
  // Invalid optional URL: keep the default image hosts and let runtime config report the issue.
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns,
  },
};

export default nextConfig;
