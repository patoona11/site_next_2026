import type { Metadata } from "next";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import InformationPageShell from "@/components/InformationPageShell";
import { formatThaiDate, postHref } from "@/lib/cms-presenters";
import { getPublishedPosts } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ปฏิทินกิจกรรม",
  description: "ปฏิทินกิจกรรมและกำหนดการสำคัญของคณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม",
};

const weekDays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;
const days = Array.from({ length: 30 }, (_, index) => index + 1);
const calendarEvents: Record<number, string> = {
  2: "อบรม EV Module 8",
  7: "ประกวดวงโยธวาทิต",
  9: "อบรม EV Module 10",
};

const events = [
  {
    date: "2–4 พ.ย. 2569",
    title: "อบรมพื้นฐานยานยนต์ไฟฟ้าและระบบของยานยนต์ไฟฟ้า (Module 8)",
    location: "คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม",
    href: "http://110.78.83.57/home/?p=3315",
    color: "bg-sky-500",
  },
  {
    date: "7–8 พ.ย. 2569",
    title: "การประกวดวงโยธวาทิตจังหวัดนครพนม ชิงแชมป์ประเทศไทย ประจำปี 2569",
    location: "หอประชุมวชิรบพิตร มหาวิทยาลัยนครพนม และลานพญาศรีสัตตนาคราช",
    href: "https://edu.npu.ac.th/",
    color: "bg-amber-500",
  },
  {
    date: "9–11 พ.ย. 2569",
    title: "อบรมระบบปรับอากาศและระบบระบายความร้อนของยานยนต์ไฟฟ้า (Module 10)",
    location: "คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม",
    href: "http://110.78.83.57/home/?p=3315",
    color: "bg-emerald-500",
  },
] as const;

export default async function CalendarPage() {
  const managedEvents = (await getPublishedPosts("events")).map((post) => ({
    date: formatThaiDate(post.publishedAt),
    title: post.title,
    location: post.excerpt || "คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม",
    href: postHref(post),
    color: "bg-sky-500",
  }));
  const displayedEvents = [...managedEvents, ...events];
  return (
    <InformationPageShell activePath="/calendar" eyebrow="Events Calendar" title="ปฏิทินกิจกรรม" description="ตรวจสอบกิจกรรม อบรม และกำหนดการสำคัญของคณะและมหาวิทยาลัย" icon={CalendarDays}>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white px-6 py-5">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Monthly view</p><h2 className="mt-1 text-2xl font-bold text-[var(--color-academic-navy)]">พฤศจิกายน 2569</h2></div>
            <a href="https://reg.npu.ac.th/" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-2 text-sm font-semibold text-[var(--color-academic-navy)] hover:text-sky-700 sm:flex">ปฏิทินการศึกษา <ExternalLink size={15} /></a>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-semibold text-slate-400">
            {weekDays.map((day) => <div key={day} className="py-3">{day}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const event = calendarEvents[day];
              return (
                <div key={day} className={`min-h-24 border-b border-r border-slate-100 p-2 sm:min-h-28 sm:p-3 ${event ? "bg-sky-50/60" : "bg-white"}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-sm font-semibold ${event ? "bg-[var(--color-academic-navy)] text-white" : "text-slate-500"}`}>{day}</span>
                  {event && <p className="mt-2 line-clamp-3 text-[10px] font-semibold leading-4 text-sky-900 sm:text-xs">{event}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <aside>
          <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Upcoming events</p><h2 className="mt-1 text-2xl font-bold text-[var(--color-academic-navy)]">กิจกรรมสำคัญ</h2></div><span className="text-sm text-slate-400">{displayedEvents.length} รายการ</span></div>
          <div className="space-y-4">
            {displayedEvents.map((event) => (
              <a key={event.title} href={event.href} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${event.color}`} /><span className="text-sm font-semibold text-sky-800">{event.date}</span></div>
                <h3 className="mt-3 font-bold leading-6 text-slate-900 transition group-hover:text-[var(--color-academic-navy)]">{event.title}</h3>
                <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-500"><MapPin className="mt-1 h-4 w-4 shrink-0" />{event.location}</p>
              </a>
            ))}
          </div>
          <p className="mt-6 text-xs leading-6 text-slate-400">ข้อมูลกิจกรรมจากเว็บไซต์คณะเทคโนโลยีอุตสาหกรรมและคณะครุศาสตร์ มหาวิทยาลัยนครพนม ตรวจสอบรายละเอียดจากลิงก์ต้นทางก่อนเข้าร่วม</p>
        </aside>
      </section>
    </InformationPageShell>
  );
}
