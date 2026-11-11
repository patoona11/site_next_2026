import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper, Rss, Search, Share2 } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { categoryLabels, type ContentCategory } from "@/lib/cms-types";
import { formatThaiDate } from "@/lib/cms-presenters";
import { getPublishedPosts } from "@/lib/content-store";
import { getSiteSettings } from "@/lib/site-settings-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ข่าวสารทั้งหมด",
  description: "ข่าวสาร กิจกรรม ข่าวประกาศ และบทความการเรียนรู้จากคณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม",
};

const primaryCategories: Array<{ value: "all" | ContentCategory; label: string }> = [
  { value: "all", label: "ข่าวทั้งหมด" },
  { value: "news", label: "ข่าวสารและกิจกรรม" },
  { value: "announcements", label: "ข่าวประกาศ" },
  { value: "learning", label: "การเรียนรู้" },
];

type NewsPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const query = await searchParams;
  const selected = primaryCategories.some(({ value }) => value === query.category) ? query.category || "all" : "all";
  const keyword = (query.q || "").trim().toLocaleLowerCase("th").slice(0, 100);
  const [posts, settings] = await Promise.all([getPublishedPosts(), getSiteSettings()]);
  const filteredPosts = posts.filter((post) => {
    const categoryMatches = selected === "all" || post.category === selected;
    const keywordMatches = !keyword || `${post.title} ${post.excerpt} ${post.body}`.toLocaleLowerCase("th").includes(keyword);
    return categoryMatches && keywordMatches;
  });
  const facebookPluginUrl = settings.facebookUrl
    ? `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(settings.facebookUrl)}&tabs=timeline&width=500&height=620&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`
    : "";

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-[var(--color-academic-navy)] px-4 py-14 text-white sm:py-20">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[42px] border-white/[0.04]" />
          <div className="relative mx-auto max-w-7xl sm:px-2">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-[var(--color-academic-gold-light)]"><Newspaper size={28} /></span>
              <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-academic-gold-light)]">Newsroom</p><h1 className="mt-1 text-4xl font-bold sm:text-5xl">ข่าวสารทั้งหมด</h1></div>
            </div>
            <p className="mt-5 max-w-3xl leading-7 text-blue-100">ติดตามข่าวสาร กิจกรรม ประกาศ และองค์ความรู้จากคณะเทคโนโลยีอุตสาหกรรม</p>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="หมวดข่าว">
              {primaryCategories.map(({ value, label }) => {
                const href = value === "all" ? "/news" : `/news?category=${value}`;
                const active = selected === value;
                return <Link key={value} href={href} aria-current={active ? "page" : undefined} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-[var(--color-academic-navy)] text-white" : "bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-[var(--color-academic-navy)]"}`}>{label}</Link>;
              })}
            </nav>
            <form action="/news" className="flex min-w-0 gap-2">
              {selected !== "all" && <input type="hidden" name="category" value={selected} />}
              <label className="relative min-w-0 flex-1 lg:w-72">
                <span className="sr-only">ค้นหาข่าว</span>
                <input type="search" name="q" defaultValue={query.q} placeholder="ค้นหาชื่อหรือเนื้อหาข่าว" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm outline-none focus:border-sky-500 focus:bg-white" />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              </label>
              <button className="rounded-xl bg-[var(--color-academic-gold-dark)] px-4 py-3 text-sm font-semibold text-white">ค้นหา</button>
            </form>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-16">
          <section>
            <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-sky-700">{primaryCategories.find(({ value }) => value === selected)?.label}</p><h2 className="mt-1 text-2xl font-bold text-slate-900">พบ {filteredPosts.length} รายการ</h2></div><Link href="/feed.xml" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-900"><Rss size={17} />ติดตาม RSS</Link></div>
            {filteredPosts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <Link href={`/posts/${post.slug}`} className="block h-full">
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                        <Image src={post.image || "/hero-industrial-v2.png"} alt={post.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--color-academic-navy)] shadow-sm">{categoryLabels[post.category]}</span>
                      </div>
                      <div className="p-5 sm:p-6">
                        <p className="flex items-center gap-2 text-xs text-slate-400"><CalendarDays size={14} />{formatThaiDate(post.publishedAt)}</p>
                        <h3 className="mt-3 line-clamp-3 text-lg font-bold leading-7 text-slate-900 transition group-hover:text-[var(--color-academic-navy)]">{post.title}</h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{post.excerpt || post.body}</p>
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-academic-gold-dark)]">อ่านข่าว <ArrowRight size={16} /></span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Newspaper className="mx-auto text-slate-300" size={42} /><h3 className="mt-4 text-lg font-bold text-slate-700">ยังไม่พบข่าวในหมวดนี้</h3><p className="mt-2 text-sm text-slate-500">ลองเลือกหมวดอื่นหรือล้างคำค้นหา</p><Link href="/news" className="mt-5 inline-flex rounded-xl bg-sky-50 px-5 py-3 font-semibold text-sky-800">ดูข่าวทั้งหมด</Link></div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl bg-[#1877F2] p-5 text-white"><div className="flex items-center gap-3"><Share2 size={25} /><div><p className="text-xs uppercase tracking-wider text-blue-100">Facebook</p><h2 className="font-bold">ข่าวจากเพจคณะ</h2></div></div><p className="mt-3 text-sm leading-6 text-blue-50">ติดตามโพสต์ล่าสุดจาก Facebook และเปิดดูต้นฉบับได้โดยตรง</p>{settings.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#145dbf]">เปิดเพจ Facebook <ArrowRight size={16} /></a>}</div>
            {facebookPluginUrl && <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><iframe title="ข่าวล่าสุดจาก Facebook ของคณะ" src={facebookPluginUrl} width="500" height="620" className="block w-full border-0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy" /></div>}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
