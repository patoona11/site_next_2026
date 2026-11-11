import Image from "next/image";
import { ArrowRight, Bell, CalendarDays, ChevronRight } from "lucide-react";
import { formatThaiDate, postHref } from "@/lib/cms-presenters";
import { getPublishedPosts } from "@/lib/content-store";
import { categoryLabels } from "@/lib/cms-types";

const fallbackNewsItems = [
  {
    title: "พัฒนากำลังคนทักษะสูงด้านยานยนต์ไฟฟ้า ร่วมกับ มจพ.",
    date: "2 พ.ย. 2569",
    image: "/news/ev-workforce-2026.jpg",
    category: "อบรมและพัฒนาทักษะ",
    href: "http://110.78.83.57/home/?p=3315",
  },
  {
    title: "คณะเทคโนโลยีอุตสาหกรรม มนพ. ร่วมจัดนิทรรศการตลาดนัดหลักสูตร ครั้งที่ 28",
    date: "2 พ.ย. 2569",
    image: "/news/curriculum-fair-2026.jpg",
    category: "ประชาสัมพันธ์หลักสูตร",
    href: "http://110.78.83.57/home/?p=3309",
  },
  {
    title: "คณะเทคโนโลยีอุตสาหกรรม มนพ. ร่วมจัดงานคืนสู่เหย้าศิษย์เก่าชาวภูกระแต ครั้งที่ 9",
    date: "2 พ.ย. 2569",
    image: "/news/alumni-homecoming-2026.jpg",
    category: "กิจกรรม",
    href: "http://110.78.83.57/home/?p=3303",
  },
] as const;

const fallbackAnnouncements = [
  { title: "คู่มืออาจารย์ที่ปรึกษา ปี 2569", date: "22 มิ.ย. 2569", href: "http://110.78.83.57/home/?p=3049" },
  { title: "ประกาศผู้ชนะการคัดเลือกผู้ประกอบการให้บริการสนามกอล์ฟภูกระแต", date: "10 มิ.ย. 2569", href: "http://110.78.83.57/home/?p=2977" },
  { title: "ประกาศการคัดเลือกผู้ประกอบการให้บริการสนามกอล์ฟภูกระแต", date: "2 มิ.ย. 2569", href: "http://110.78.83.57/home/?p=2963" },
  { title: "ประกาศยกเลิกการคัดเลือกผู้ประกอบการให้บริการสนามกอล์ฟภูกระแต", date: "27 พ.ค. 2569", href: "http://110.78.83.57/home/?p=2955" },
] as const;

export default async function NewsSection() {
  const [managedNews, managedAnnouncements] = await Promise.all([getPublishedPosts("news"), getPublishedPosts("announcements")]);
  const newsItems = (managedNews.length > 0
    ? managedNews.map((post) => ({ title: post.title, date: formatThaiDate(post.publishedAt), image: post.image || "/hero-industrial-v2.png", category: categoryLabels[post.category], href: postHref(post) }))
    : [...fallbackNewsItems]).slice(0, 3);
  const announcements = (managedAnnouncements.length > 0
    ? managedAnnouncements.map((post) => ({ title: post.title, date: formatThaiDate(post.publishedAt), href: postHref(post) }))
    : [...fallbackAnnouncements]).slice(0, 4);

  return (
    <section id="news" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex items-end justify-between gap-6">
          <div>
            <p className="section-eyebrow">News & Updates</p>
            <h2 className="section-title">ข่าวสารและกิจกรรม</h2>
            <p className="mt-2 max-w-2xl text-slate-500">ติดตามข่าวประชาสัมพันธ์ กิจกรรมนักศึกษา และความเคลื่อนไหวของคณะ</p>
          </div>
          <a href="/news" className="hidden items-center gap-2 text-sm font-semibold text-[var(--color-academic-navy)] hover:text-[var(--color-academic-gold-dark)] sm:flex">ดูข่าวทั้งหมด <ArrowRight size={17} /></a>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-6 md:grid-cols-2">
            {newsItems.map((news, index) => (
              <article key={news.title} className={`group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${index === 0 ? "md:col-span-2" : ""}`}>
                <a href={news.href} target={news.href.startsWith("http") ? "_blank" : undefined} rel={news.href.startsWith("http") ? "noopener noreferrer" : undefined} className="block h-full" aria-label={`อ่านข่าว: ${news.title}`}>
                  <div className={`relative overflow-hidden ${index === 0 ? "h-72" : "h-52"}`}>
                    <Image src={news.image} alt={news.title} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"} className="object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--color-academic-navy)] shadow-sm">{news.category}</span>
                    {index === 0 && (
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <p className="mb-2 flex items-center gap-2 text-xs text-white/80"><CalendarDays size={14} />{news.date}</p>
                        <h3 className="line-clamp-3 text-xl font-bold leading-snug sm:text-2xl">{news.title}</h3>
                      </div>
                    )}
                  </div>
                  {index !== 0 && (
                    <div className="p-5">
                      <p className="mb-2 flex items-center gap-2 text-xs text-slate-400"><CalendarDays size={14} />{news.date}</p>
                      <h3 className="line-clamp-3 font-bold leading-6 text-slate-800 group-hover:text-[var(--color-academic-navy)]">{news.title}</h3>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-academic-gold-dark)]">อ่านเพิ่มเติม <ChevronRight size={15} /></span>
                    </div>
                  )}
                </a>
              </article>
            ))}
          </div>

          <aside className="self-start overflow-hidden rounded-2xl bg-[var(--color-academic-navy)] text-white shadow-xl shadow-sky-950/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Bell size={20} /></span><div><p className="text-xs uppercase tracking-wider text-sky-200">Announcements</p><h3 className="text-xl font-bold">ข่าวประกาศ</h3></div></div>
            </div>
            <div className="divide-y divide-white/10 px-6">
              {announcements.map(({ title, date, href }) => (
                <a key={`${title}-${date}`} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="group block py-5">
                  <p className="text-xs text-[var(--color-academic-gold-light)]">{date}</p>
                  <p className="mt-2 leading-6 text-sky-50 transition group-hover:text-white">{title}</p>
                </a>
              ))}
            </div>
            <a href="/news/announcements" className="flex items-center justify-center gap-2 bg-white/[0.08] px-6 py-4 text-sm font-semibold transition hover:bg-white/15">ดูประกาศทั้งหมด <ArrowRight size={16} /></a>
          </aside>
        </div>
        <p className="mt-6 text-right text-xs text-slate-400">ข้อมูลจากระบบจัดการเนื้อหาและเว็บไซต์เดิมของคณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม</p>
      </div>
    </section>
  );
}
