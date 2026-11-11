import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import InformationPageShell from "@/components/InformationPageShell";
import InformationListing, { type InformationItem } from "@/components/InformationListing";
import { formatThaiDate, postHref } from "@/lib/cms-presenters";
import { getPublishedPosts } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ทุนการศึกษา",
  description: "ข่าวทุนการศึกษาและโอกาสสนับสนุนนักศึกษาคณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม",
};

const scholarships: readonly InformationItem[] = [
  {
    title: "มอบทุนการศึกษา ‘มูลนิธินายห้างโรงปูนผู้หนึ่ง’ สร้างโอกาสทางการศึกษาแก่นักศึกษา",
    date: "15 ก.ย. 2569",
    description: "ทุนปีละ 30,000 บาท สนับสนุนนักศึกษาระดับ ปวส. ที่ตั้งใจศึกษาและขาดแคลนทุนทรัพย์ ให้มีโอกาสศึกษาต่อระดับปริญญาตรีอย่างต่อเนื่อง",
    href: "http://110.78.83.57/home/?p=3214",
    tag: "ข่าวทุนการศึกษา",
  },
  {
    title: "มูลนิธิในห้างโรงปูนผู้หนึ่ง มอบทุนการศึกษา ประจำปีการศึกษา 2568",
    date: "2 ก.พ. 2569",
    description: "มอบทุนแก่นักศึกษา ปวส. และปริญญาตรี จำนวน 8 ทุน รวมมูลค่า 260,000 บาท เพื่อสนับสนุนนักศึกษาที่มีผลการเรียนดีแต่ขาดแคลนทุนทรัพย์",
    href: "http://110.78.83.57/home/?p=2635",
    tag: "ทุนสนับสนุน",
  },
  {
    title: "สัมภาษณ์รับทุน ‘โครงการไดโชกุน’ ประจำปีการศึกษา 2569",
    date: "19 ม.ค. 2569",
    description: "เปิดโอกาสทางการศึกษาและเส้นทางอาชีพระดับนานาชาติ พร้อมมอบทุนการศึกษาแก่นักศึกษาคณะเทคโนโลยีอุตสาหกรรม จำนวน 4 ทุน",
    href: "http://110.78.83.57/home/?p=2598",
    tag: "โครงการทุน",
  },
  {
    title: "สอบถามงานทุนการศึกษาและสวัสดิการนักศึกษา",
    date: "วันและเวลาราชการ",
    description: "ติดต่อคณะเพื่อสอบถามคุณสมบัติ เอกสารประกอบ และรอบการเปิดรับทุนการศึกษาที่กำลังดำเนินการ",
    href: "/contact",
    tag: "ติดต่อคณะ",
  },
] as const;

export default async function ScholarshipsPage() {
  const managedItems: InformationItem[] = (await getPublishedPosts("scholarships")).map((post) => ({
    title: post.title,
    date: formatThaiDate(post.publishedAt),
    description: post.excerpt || post.body.slice(0, 220),
    href: postHref(post),
    tag: "ทุนจากคณะ",
    status: "เผยแพร่",
  }));
  return (
    <InformationPageShell activePath="/scholarships" eyebrow="Scholarships & Opportunities" title="ทุนการศึกษา" description="รวมข่าวทุน โครงการสนับสนุน และโอกาสทางการศึกษาสำหรับนักศึกษาคณะเทคโนโลยีอุตสาหกรรม" icon={GraduationCap}>
      <InformationListing items={[...managedItems, ...scholarships]} sourceNote="ข้อมูลจากระบบจัดการเนื้อหาและเว็บไซต์เดิมของคณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม" />
    </InformationPageShell>
  );
}
