import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Quote } from "lucide-react";

export default function DeansMessage() {
  return (
    <section id="vision" className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-blue-50 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-[var(--color-academic-navy)] shadow-[0_24px_70px_rgba(15,39,71,0.18)] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative min-h-[420px] lg:min-h-[560px]">
            <Image src="/dean.png" alt="คณบดีคณะเทคโนโลยีอุตสาหกรรม" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-academic-navy)] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[var(--color-academic-navy)]" />
          </div>
          <div className="relative flex flex-col justify-center px-6 pb-12 pt-6 text-white sm:px-12 lg:-ml-16 lg:px-16 lg:py-16">
            <Quote className="absolute right-10 top-10 h-28 w-28 text-white/[0.05]" />
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-academic-gold-light)]"><BadgeCheck size={18} /> Dean&apos;s message</p>
            <h2 className="text-3xl font-bold sm:text-4xl">สารจากคณบดี</h2>
            <p className="mt-7 text-lg leading-9 text-blue-50 sm:text-xl">
              “มุ่งผลิตบัณฑิตนักปฏิบัติที่มีความเชี่ยวชาญด้านเทคโนโลยีอุตสาหกรรม มีคุณธรรม และพร้อมสร้างนวัตกรรมที่ตอบโจทย์ภาคอุตสาหกรรมและชุมชนอย่างยั่งยืน”
            </p>
            <div className="mt-8 border-l-2 border-[var(--color-academic-gold)] pl-4">
              <p className="font-bold">คณบดีคณะเทคโนโลยีอุตสาหกรรม</p>
              <p className="mt-1 text-sm text-blue-200">มหาวิทยาลัยนครพนม</p>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/about/history" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[var(--color-academic-navy)] transition hover:-translate-y-0.5">รู้จักคณะของเรา <ArrowRight size={17} /></Link>
              <Link href="#" className="rounded-full border border-white/25 px-6 py-3 font-semibold hover:bg-white/10">วิสัยทัศน์และพันธกิจ</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
