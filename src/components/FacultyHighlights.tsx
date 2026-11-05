import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Factory, Lightbulb, Wrench } from "lucide-react";

const strengths = [
  { icon: Wrench, title: "เรียนรู้จากการปฏิบัติ", text: "ฝึกทักษะในห้องปฏิบัติการและเวิร์กช็อป เพื่อเชื่อมความรู้กับการทำงานจริง" },
  { icon: Lightbulb, title: "สร้างนวัตกรรม", text: "พัฒนาความคิดสร้างสรรค์เป็นโครงงานและเทคโนโลยีที่ตอบโจทย์ผู้ใช้" },
  { icon: Factory, title: "เชื่อมโยงอุตสาหกรรม", text: "เรียนรู้ร่วมกับสถานประกอบการและเข้าใจบริบทการทำงานในโลกอุตสาหกรรม" },
] as const;

export default function FacultyHighlights() {
  return (
    <section id="research" className="bg-[#f3f7fa] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(21,59,86,0.12)] lg:grid-cols-2">
          <div className="relative min-h-[420px] lg:min-h-[640px]">
            <Image src="/banner3.png" alt="การเรียนรู้ด้านเทคโนโลยีและนวัตกรรม" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102a3c]/75 via-transparent to-transparent" />
            <div className="absolute bottom-0 p-8 text-white sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Hands-on learning</p>
              <p className="mt-3 max-w-md text-2xl font-bold leading-snug">พื้นที่เรียนรู้ที่เปลี่ยนทักษะ ให้พร้อมใช้ในโลกการทำงาน</p>
            </div>
          </div>
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-14">
            <p className="section-eyebrow">Why ITECH NPU</p>
            <h2 className="section-title">มากกว่าห้องเรียน คือประสบการณ์ที่ลงมือทำจริง</h2>
            <p className="mt-4 leading-7 text-slate-500">คณะเทคโนโลยีอุตสาหกรรมมุ่งพัฒนาผู้เรียนให้มีทั้งความรู้ ทักษะ และความคิดสร้างสรรค์ พร้อมประยุกต์ใช้เทคโนโลยีเพื่ออุตสาหกรรมและชุมชน</p>
            <div className="mt-8 space-y-6">
              {strengths.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sky-50 text-[var(--color-academic-gold-dark)]"><Icon size={21} strokeWidth={1.7} /></span>
                    <div><h3 className="font-bold text-[var(--color-academic-navy)]">{item.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{item.text}</p></div>
                  </div>
                );
              })}
            </div>
            <Link href="/about/history" className="mt-9 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-academic-navy)] px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-academic-gold-dark)]">รู้จักคณะของเรา <ArrowRight size={17} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
