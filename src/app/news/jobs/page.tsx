import type { Metadata } from "next";
import { BriefcaseBusiness } from "lucide-react";
import InformationPageShell from "@/components/InformationPageShell";
import InformationListing, { type InformationItem } from "@/components/InformationListing";
import { formatThaiDate, postHref } from "@/lib/cms-presenters";
import { getPublishedPosts } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ข่าวรับสมัครงาน",
  description: "ประกาศรับสมัครงานและช่องทางสมัครงานของคณะเทคโนโลยีอุตสาหกรรมและมหาวิทยาลัยนครพนม",
};

const jobs: readonly InformationItem[] = [
  {
    title: "ระบบรับสมัครงานออนไลน์ มหาวิทยาลัยนครพนม",
    date: "ตรวจสอบล่าสุดจากระบบกลาง",
    description: "ค้นหาตำแหน่งงานที่เปิดรับ รายละเอียดคุณสมบัติ เอกสารประกอบ และติดตามผลการสมัครจากระบบกลางของมหาวิทยาลัย",
    href: "https://job.npu.ac.th/",
    tag: "ระบบสมัครงาน",
    status: "ช่องทางหลัก",
  },
  {
    title: "ประกาศรับสมัครบุคคลเพื่อสอบแข่งขันเป็นพนักงานตามสัญญา ประจำปี 2567",
    date: "8 ม.ค. 2568",
    description: "ตำแหน่งอาจารย์สาขาวิชาพลศึกษา สังกัดคณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม พร้อมเอกสารประกาศต้นฉบับ",
    href: "http://110.78.83.57/home/?p=1151",
    tag: "คลังประกาศเดิม",
    status: "ปิดรับสมัครแล้ว",
  },
  {
    title: "สอบถามข้อมูลการรับสมัครงานของคณะ",
    date: "วันและเวลาราชการ",
    description: "ติดต่อสำนักงานคณะเทคโนโลยีอุตสาหกรรมสำหรับคำถามเกี่ยวกับตำแหน่งงาน เอกสาร หรือขั้นตอนการสมัคร",
    href: "/contact",
    tag: "ติดต่อคณะ",
  },
] as const;

export default async function JobsPage() {
  const managedItems: InformationItem[] = (await getPublishedPosts("jobs")).map((post) => ({
    title: post.title,
    date: formatThaiDate(post.publishedAt),
    description: post.excerpt || post.body.slice(0, 220),
    href: postHref(post),
    tag: "ประกาศจากคณะ",
    status: "เผยแพร่",
  }));
  return (
    <InformationPageShell activePath="/news/jobs" eyebrow="Careers & Recruitment" title="ข่าวรับสมัครงาน" description="รวมประกาศรับสมัครบุคลากร ตำแหน่งงาน และช่องทางสมัครงานอย่างเป็นทางการ" icon={BriefcaseBusiness}>
      <InformationListing items={[...managedItems, ...jobs]} notice={managedItems.length === 0 ? "ขณะนี้ยังไม่พบประกาศรับสมัครงานใหม่เฉพาะคณะ กรุณาตรวจสอบระบบรับสมัครงานกลางของมหาวิทยาลัยเพื่อดูข้อมูลล่าสุด" : undefined} sourceNote="ข้อมูลจากระบบจัดการเนื้อหาของคณะ เว็บไซต์เดิม และระบบรับสมัครงานออนไลน์ มหาวิทยาลัยนครพนม" />
    </InformationPageShell>
  );
}
