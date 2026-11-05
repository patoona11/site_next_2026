import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "นโยบายคุกกี้",
  description: "ข้อมูลการใช้คุกกี้ของเว็บไซต์คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม",
};

const categories = [
  ["คุกกี้ที่จำเป็น", "ใช้เพื่อให้เว็บไซต์ทำงานได้อย่างถูกต้อง เช่น การบันทึกตัวเลือกความยินยอมของผู้ใช้"],
  ["คุกกี้เพื่อการวิเคราะห์", "ช่วยให้เราเข้าใจภาพรวมการใช้งานเว็บไซต์ เพื่อนำไปปรับปรุงเนื้อหาและประสบการณ์ของผู้ใช้"],
  ["คุกกี้เพื่อการตลาด", "ใช้เพื่อนำเสนอข้อมูลที่เกี่ยวข้อง โดยจะทำงานเมื่อผู้ใช้ให้ความยินยอมเท่านั้น"],
] as const;

export default function CookiePolicyPage() {
  return (
    <>
      <Navigation />
      <main className="bg-slate-50">
        <section className="bg-[var(--color-academic-navy)] px-4 py-16 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-academic-gold-light)]">Privacy & Cookies</p>
            <h1 className="mt-3 text-4xl font-bold">นโยบายคุกกี้</h1>
            <p className="mt-4 max-w-2xl leading-7 text-blue-100">เว็บไซต์นี้ใช้คุกกี้เพื่อให้บริการได้อย่างเหมาะสมและพัฒนาประสบการณ์การใช้งานของผู้เข้าชม</p>
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
            <h2 className="text-2xl font-bold text-[var(--color-academic-navy)]">คุกกี้คืออะไร</h2>
            <p className="mt-4 leading-8 text-slate-600">คุกกี้เป็นไฟล์ข้อมูลขนาดเล็กที่เว็บไซต์บันทึกไว้ในอุปกรณ์ของผู้ใช้ เพื่อจดจำการตั้งค่าและช่วยให้บริการทำงานได้ต่อเนื่อง</p>
            <div className="mt-10 space-y-5">
              {categories.map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
            <h2 className="mt-10 text-2xl font-bold text-[var(--color-academic-navy)]">การจัดการความยินยอม</h2>
            <p className="mt-4 leading-8 text-slate-600">ผู้ใช้สามารถยอมรับ ปฏิเสธ หรือเลือกประเภทคุกกี้ได้จากแถบการตั้งค่าคุกกี้ของเว็บไซต์ โดยคุกกี้ที่จำเป็นจะไม่สามารถปิดได้</p>
            <p className="mt-8 text-sm text-slate-400">ปรับปรุงล่าสุด: 26 ตุลาคม 2569</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
