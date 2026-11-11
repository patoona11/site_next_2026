import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Building2, ChevronRight, FileText, Home, Map, Newspaper, Phone } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "แผนผังเว็บไซต์",
  description: "รวมลิงก์สำคัญทั้งหมดของเว็บไซต์คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม",
};

const sections = [
  {
    title: "หน้าหลักและข้อมูลคณะ",
    icon: Building2,
    links: [
      ["หน้าแรก", "/"],
      ["ประวัติความเป็นมา", "/about/history"],
      ["ข่าวสารและกิจกรรม", "/news"],
      ["บริการออนไลน์", "/#services"],
    ],
  },
  {
    title: "หลักสูตร",
    icon: BookOpen,
    links: [
      ["หน้าหลักสูตร", "/programs"],
      ["ระดับประกาศนียบัตรวิชาชีพ (ปวช.)", "/programs/vocational"],
      ["ระดับประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)", "/programs/high-vocational"],
      ["ระดับปริญญาตรี", "/programs/bachelor"],
      ["ระดับปริญญาโท", "/programs/master"],
      ["ระดับปริญญาเอก", "/programs/phd"],
    ],
  },
  {
    title: "ข่าวสารและโอกาส",
    icon: Newspaper,
    links: [
      ["ข่าวสารและกิจกรรม", "/news"],
      ["การเรียนรู้", "/news/learning"],
      ["ข่าวรับสมัครงาน", "/news/jobs"],
      ["ข่าวประกาศ", "/news/announcements"],
      ["ทุนการศึกษา", "/scholarships"],
      ["ปฏิทินกิจกรรม", "/calendar"],
    ],
  },
  {
    title: "การติดต่อและนโยบาย",
    icon: FileText,
    links: [
      ["ติดต่อเรา", "/contact"],
      ["นโยบายคุกกี้และความเป็นส่วนตัว", "/cookie-policy"],
      ["แผนผังเว็บไซต์", "/sitemap"],
    ],
  },
] as const;

export default function SitemapPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-[var(--color-academic-navy)] px-4 py-16 text-white sm:py-20">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[42px] border-white/[0.04]" />
          <div className="relative mx-auto max-w-7xl sm:px-2">
            <div className="flex items-center gap-2 text-sm text-blue-100"><Home size={15} /><Link href="/" className="hover:text-white">หน้าแรก</Link><ChevronRight size={14} /><span>แผนผังเว็บไซต์</span></div>
            <div className="mt-8 flex items-start gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-[var(--color-academic-gold-light)]"><Map size={29} /></span>
              <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-academic-gold-light)]">Site Map</p><h1 className="mt-2 text-4xl font-bold sm:text-5xl">แผนผังเว็บไซต์</h1><p className="mt-4 max-w-2xl leading-7 text-blue-100">ค้นหาและเข้าถึงทุกหน้าสำคัญของคณะเทคโนโลยีอุตสาหกรรมได้จากที่เดียว</p></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {sections.map(({ title, icon: Icon, links }) => (
              <article key={title} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-academic-navy)] text-white"><Icon size={21} /></span>
                  <h2 className="text-xl font-bold text-[var(--color-academic-navy)]">{title}</h2>
                </div>
                <nav className="divide-y divide-slate-100 px-6" aria-label={title}>
                  {links.map(([label, href]) => (
                    <Link key={href} href={href} className="group flex items-center justify-between gap-4 py-4 text-slate-600 transition hover:text-[var(--color-academic-navy)]">
                      <span>{label}</span><ChevronRight size={16} className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[var(--color-academic-gold-dark)]" />
                    </Link>
                  ))}
                </nav>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:p-8">
            <div><h2 className="text-xl font-bold text-[var(--color-academic-navy)]">ยังไม่พบข้อมูลที่ต้องการ?</h2><p className="mt-2 text-slate-500">ติดต่อคณะเพื่อสอบถามข้อมูลเพิ่มเติมได้ในวันและเวลาราชการ</p></div>
            <Link href="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-academic-gold-dark)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--color-academic-gold)]"><Phone size={17} />ติดต่อเรา</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
