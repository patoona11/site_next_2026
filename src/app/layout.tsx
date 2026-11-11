import type { Metadata } from "next";
import { Mali } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import CampusChat from "@/components/CampusChat";
import "./globals.css";

const mali = Mali({
  variable: "--font-mali",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

export const metadata: Metadata = {
  title: {
    default: "คณะเทคโนโลยีอุตสาหกรรม | มหาวิทยาลัยนครพนม",
    template: "%s | คณะเทคโนโลยีอุตสาหกรรม มนพ.",
  },
  description: "เว็บไซต์คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม (Faculty of Industrial Technology, Nakhon Phanom University)",
  keywords: ["คณะเทคโนโลยีอุตสาหกรรม", "มหาวิทยาลัยนครพนม", "NPU", "เรียนต่อ", "อาชีวศึกษา"],
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      data-scroll-behavior="smooth"
      className={`${mali.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <CampusChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
