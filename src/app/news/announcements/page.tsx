import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import InformationPageShell from "@/components/InformationPageShell";
import InformationListing, { type InformationItem } from "@/components/InformationListing";
import { formatThaiDate, postHref } from "@/lib/cms-presenters";
import { getPublishedPosts } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ข่าวประกาศ",
  description: "ข่าวประกาศและเอกสารสำคัญของคณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม",
};

const announcements: readonly InformationItem[] = [
  {
    title: "คู่มืออาจารย์ที่ปรึกษา ปี 2569",
    date: "22 มิ.ย. 2569",
    description: "คู่มือและแนวทางสำหรับอาจารย์ที่ปรึกษา ประจำปีการศึกษา 2569",
    href: "http://110.78.83.57/home/?p=3049",
    tag: "คู่มือ",
  },
  {
    title: "ประกาศผู้ชนะการคัดเลือกผู้ประกอบการให้บริการสนามกอล์ฟภูกระแต",
    date: "10 มิ.ย. 2569",
    description: "ประกาศผลผู้ชนะการคัดเลือกผู้ประกอบการให้บริการสนามกอล์ฟภูกระแต ประจำปี 2569",
    href: "http://110.78.83.57/home/?p=2977",
    tag: "ผลการคัดเลือก",
  },
  {
    title: "ประกาศการคัดเลือกผู้ประกอบการให้บริการสนามกอล์ฟภูกระแต",
    date: "2 มิ.ย. 2569",
    description: "รายละเอียดประกาศการคัดเลือกผู้ประกอบการให้บริการสนามกอล์ฟภูกระแต มหาวิทยาลัยนครพนม",
    href: "http://110.78.83.57/home/?p=2963",
    tag: "ประกาศทั่วไป",
  },
  {
    title: "ประกาศยกเลิกการคัดเลือกผู้ประกอบการให้บริการสนามกอล์ฟภูกระแต",
    date: "27 พ.ค. 2569",
    description: "ประกาศยกเลิกการคัดเลือกผู้ประกอบการให้บริการสนามกอล์ฟภูกระแต",
    href: "http://110.78.83.57/home/?p=2955",
    tag: "ประกาศยกเลิก",
  },
] as const;

export default async function AnnouncementsPage() {
  const managedItems: InformationItem[] = (await getPublishedPosts("announcements")).map((post) => ({
    title: post.title,
    date: formatThaiDate(post.publishedAt),
    description: post.excerpt || post.body.slice(0, 220),
    href: postHref(post),
    tag: "ประกาศจากคณะ",
    status: "เผยแพร่",
  }));
  return (
    <InformationPageShell activePath="/news/announcements" eyebrow="Official Announcements" title="ข่าวประกาศ" description="ติดตามประกาศ คู่มือ เอกสาร และข้อมูลสำคัญจากคณะเทคโนโลยีอุตสาหกรรม" icon={Megaphone}>
      <InformationListing items={[...managedItems, ...announcements]} sourceNote="ข้อมูลจากระบบจัดการเนื้อหาและเว็บไซต์เดิมของคณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม" />
    </InformationPageShell>
  );
}
