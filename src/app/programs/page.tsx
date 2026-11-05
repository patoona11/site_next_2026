import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, GraduationCap, Home, School, Wrench } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "หลักสูตรที่เปิดสอน | คณะเทคโนโลยีอุตสาหกรรม",
  description: "รวมหลักสูตรระดับ ปวช. ปวส. ปริญญาตรี ปริญญาโท และปริญญาเอก ของคณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม",
};

type ProgramGroup = {
  title: string;
  programs: readonly string[];
};

type ProgramLevel = {
  id: string;
  shortTitle: string;
  title: string;
  description: string;
  href: string;
  groups: readonly ProgramGroup[];
};

const levels: readonly ProgramLevel[] = [
  {
    id: "vocational",
    shortTitle: "ปวช.",
    title: "หลักสูตรประกาศนียบัตรวิชาชีพ (ปวช.)",
    description: "สำหรับผู้สำเร็จการศึกษาระดับมัธยมศึกษาตอนต้น (ม.3) หรือเทียบเท่า เน้นทักษะวิชาชีพและการปฏิบัติงานจริง",
    href: "/programs/vocational",
    groups: [
      { title: "ประเภทวิชาอุตสาหกรรม", programs: ["ช่างยนต์", "ช่างกลโรงงานอุตสาหกรรม", "ช่างก่อสร้าง", "สถาปัตยกรรม", "ช่างเชื่อมโลหะ", "ช่างไฟฟ้า", "อิเล็กทรอนิกส์"] },
      { title: "ประเภทวิชาบริหารธุรกิจ", programs: ["การบัญชี", "การตลาด", "การจัดการสำนักงานดิจิทัล"] },
      { title: "ประเภทวิชาอุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ", programs: ["เทคโนโลยีธุรกิจดิจิทัล"] },
      { title: "ประเภทวิชาอุตสาหกรรมท่องเที่ยว", programs: ["การโรงแรม"] },
    ],
  },
  {
    id: "high-vocational",
    shortTitle: "ปวส.",
    title: "หลักสูตรประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)",
    description: "สำหรับผู้สำเร็จการศึกษาระดับ ปวช., ม.6 หรือเทียบเท่า มุ่งพัฒนากำลังคนระดับเทคนิคที่มีทักษะขั้นสูง",
    href: "/programs/high-vocational",
    groups: [
      { title: "ประเภทวิชาอุตสาหกรรม", programs: ["เทคนิคเครื่องกล", "เทคนิคการผลิต", "เทคนิคโลหะ", "ไฟฟ้า", "ช่างก่อสร้าง", "เทคนิคสถาปัตยกรรม", "เทคนิคยานยนต์ไฟฟ้า", "เทคโนโลยีอิเล็กทรอนิกส์", "ไฟฟ้า (สาขางานเทคโนโลยีลิฟต์และระบบงานอาคารสูง)"] },
      { title: "ประเภทวิชาบริหารธุรกิจ", programs: ["การบัญชี", "การจัดการสำนักงานดิจิทัล", "การตลาด"] },
      { title: "ประเภทวิชาอุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ", programs: ["เทคโนโลยีธุรกิจดิจิทัล"] },
      { title: "ประเภทวิชาอุตสาหกรรมท่องเที่ยว", programs: ["การโรงแรม"] },
    ],
  },
  {
    id: "bachelor",
    shortTitle: "ปริญญาตรี",
    title: "หลักสูตรระดับปริญญาตรี (2 ปีต่อเนื่อง)",
    description: "ต่อยอดผู้สำเร็จการศึกษาระดับ ปวส. สู่ความเชี่ยวชาญทางเทคโนโลยีอุตสาหกรรมและการประยุกต์ใช้ในวิชาชีพ",
    href: "/programs/bachelor",
    groups: [
      { title: "หลักสูตรอุตสาหกรรมศาสตรบัณฑิต (อส.บ.)", programs: ["สาขาวิชาวิศวกรรมอุตสาหการ", "สาขาวิชาวิศวกรรมเครื่องกล", "สาขาวิชาวิศวกรรมไฟฟ้า", "สาขาวิชาวิศวกรรมอิเล็กทรอนิกส์และหุ่นยนต์"] },
      { title: "หลักสูตรวิทยาศาสตรบัณฑิต (วท.บ.)", programs: ["สาขาเทคโนโลยีสถาปัตยกรรมและการก่อสร้าง"] },
    ],
  },
  {
    id: "master",
    shortTitle: "ปริญญาโท",
    title: "หลักสูตรระดับปริญญาโท",
    description: "พัฒนาผู้เชี่ยวชาญและนักวิจัยด้านวิศวกรรมและเทคโนโลยีอุตสาหกรรม เพื่อประยุกต์ใช้ในองค์กรและภาคการผลิต",
    href: "/programs/master",
    groups: [
      { title: "หลักสูตรอุตสาหกรรมศาสตรมหาบัณฑิต (อส.ม.)", programs: ["สาขาวิชาวิศวกรรมไฟฟ้า", "สาขาวิชาเทคโนโลยีอุตสาหกรรม"] },
    ],
  },
  {
    id: "phd",
    shortTitle: "ปริญญาเอก",
    title: "หลักสูตรระดับปริญญาเอก",
    description: "สร้างองค์ความรู้และงานวิจัยขั้นสูง เพื่อขับเคลื่อนนวัตกรรมด้านวิศวกรรมและเทคโนโลยีอุตสาหกรรม",
    href: "/programs/phd",
    groups: [
      { title: "หลักสูตรปรัชญาดุษฎีบัณฑิต (ปร.ด.)", programs: ["สาขาวิชาวิศวกรรมไฟฟ้า", "สาขาวิชาเทคโนโลยีอุตสาหกรรม"] },
    ],
  },
] as const;

const programCount = levels.reduce((total, level) => total + level.groups.reduce((groupTotal, group) => groupTotal + group.programs.length, 0), 0);

export default function ProgramsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-[var(--color-academic-navy)] text-white">
          <div className="absolute inset-0">
            <Image src="/hero-industrial-v2.png" alt="ห้องปฏิบัติการเทคโนโลยีอุตสาหกรรม" fill priority sizes="100vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,36,53,.96),rgba(21,59,86,.82),rgba(21,59,86,.42))]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-200">Academics</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">หลักสูตรที่เปิดสอน</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-sky-50/85 sm:text-lg">ค้นหาเส้นทางการเรียนรู้ที่เหมาะกับคุณ ตั้งแต่ระดับวิชาชีพจนถึงระดับบัณฑิตศึกษา</p>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
              <span><strong className="mr-2 text-2xl text-white">5</strong>ระดับการศึกษา</span>
              <span><strong className="mr-2 text-2xl text-white">{programCount}</strong>สาขาและสาขางาน</span>
            </div>
          </div>
        </section>

        <nav className="border-b border-slate-200 bg-white" aria-label="ระดับหลักสูตร">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
            <Link href="/programs" className="whitespace-nowrap border-b-2 border-[var(--color-academic-gold-dark)] px-4 py-4 text-sm font-semibold text-[var(--color-academic-navy)]">ภาพรวมหลักสูตร</Link>
            {levels.map((level) => <Link key={level.id} href={`#${level.id}`} className="whitespace-nowrap border-b-2 border-transparent px-4 py-4 text-sm text-slate-500 transition hover:border-sky-200 hover:text-[var(--color-academic-gold-dark)]">{level.shortTitle}</Link>)}
          </div>
        </nav>

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-400"><Home size={14} /><Link href="/" className="hover:text-[var(--color-academic-gold-dark)]">หน้าแรก</Link><span>/</span><span className="text-slate-600">หลักสูตร</span></div>
        </div>

        <section className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">Programs & Curriculum</p>
              <h2 className="section-title">เลือกหลักสูตรที่เหมาะกับคุณ</h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-500">เปิดดูรายชื่อสาขาในแต่ละระดับ หรือเข้าสู่หน้ารายละเอียดเพื่อดูข้อมูลเฉพาะของหลักสูตรนั้น</p>
            </div>
            <Link href="#admission-contact" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--color-academic-gold-dark)]">สอบถามการสมัคร <ArrowRight size={17} /></Link>
          </div>

          <div className="space-y-4">
            {levels.map((level, index) => (
              <details key={level.id} id={level.id} className="group scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm open:border-sky-200 open:shadow-[0_18px_45px_rgba(21,59,86,0.1)]" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 transition hover:bg-sky-50/60 sm:px-7 sm:py-6 [&::-webkit-details-marker]:hidden">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sky-50 text-[var(--color-academic-gold-dark)]"><GraduationCap size={23} strokeWidth={1.7} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-lg font-bold text-[var(--color-academic-navy)] sm:text-xl">{level.title}</span><span className="mt-1 hidden text-sm text-slate-500 sm:block">{level.description}</span></span>
                  <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 sm:block">{level.groups.reduce((total, group) => total + group.programs.length, 0)} สาขา</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-7 sm:px-7 sm:py-8">
                  <p className="mb-6 text-sm leading-7 text-slate-500 sm:hidden">{level.description}</p>
                  <div className="grid gap-5 md:grid-cols-2">
                    {level.groups.map((group) => (
                      <div key={group.title} className="rounded-xl border border-slate-100 bg-white p-5">
                        <h3 className="flex items-start gap-2 font-bold leading-6 text-[var(--color-academic-navy)]"><BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-academic-gold-dark)]" />{group.title}</h3>
                        <ul className="mt-4 space-y-2.5">
                          {group.programs.map((program) => <li key={program} className="flex gap-3 text-sm leading-6 text-slate-600"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-academic-gold)]" />{program}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <Link href={level.href} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-academic-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-academic-gold-dark)]">ดูรายละเอียด{level.shortTitle} <ArrowRight size={16} /></Link>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section id="admission-contact" className="bg-[#f3f7fa] py-16">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
            <div className="flex gap-5">
              <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-[var(--color-academic-gold-dark)] shadow-sm sm:grid"><School size={26} /></span>
              <div><p className="section-eyebrow">Admission</p><h2 className="mt-2 text-2xl font-bold text-[var(--color-academic-navy)] sm:text-3xl">ยังไม่แน่ใจว่าหลักสูตรไหนเหมาะกับคุณ?</h2><p className="mt-3 leading-7 text-slate-500">ติดต่อคณะเพื่อสอบถามคุณสมบัติผู้สมัคร แผนการเรียน และข้อมูลการรับสมัครในแต่ละระดับ</p></div>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end"><Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-[var(--color-academic-gold-dark)] px-6 py-3 font-semibold text-white hover:bg-[var(--color-academic-navy)]">ติดต่อคณะ <ArrowRight size={17} /></Link><Link href="/#admissions" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-[var(--color-academic-navy)] hover:border-sky-300"><Wrench size={17} /> ข้อมูลรับสมัคร</Link></div>
          </div>
        </section>
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}
