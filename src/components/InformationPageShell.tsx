import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpenText, CalendarDays, ChevronRight, GraduationCap, Home, Megaphone, BriefcaseBusiness, Newspaper } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const informationLinks = [
  { label: "ข่าวทั้งหมด", href: "/news", icon: Newspaper },
  { label: "การเรียนรู้", href: "/news/learning", icon: BookOpenText },
  { label: "ข่าวรับสมัครงาน", href: "/news/jobs", icon: BriefcaseBusiness },
  { label: "ข่าวประกาศ", href: "/news/announcements", icon: Megaphone },
  { label: "ทุนการศึกษา", href: "/scholarships", icon: GraduationCap },
  { label: "ปฏิทิน", href: "/calendar", icon: CalendarDays },
] as const;

type InformationPageShellProps = {
  activePath: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
};

export default function InformationPageShell({ activePath, eyebrow, title, description, icon: Icon, children }: InformationPageShellProps) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-[var(--color-academic-navy)] px-4 py-14 text-white sm:py-20">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[42px] border-white/[0.04]" />
          <div className="relative mx-auto max-w-7xl sm:px-2">
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <Home size={15} />
              <Link href="/" className="hover:text-white">หน้าแรก</Link>
              <ChevronRight size={14} />
              <span>{title}</span>
            </div>
            <div className="mt-8 flex items-start gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-[var(--color-academic-gold-light)]"><Icon size={28} /></span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-academic-gold-light)]">{eyebrow}</p>
                <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{title}</h1>
                <p className="mt-4 max-w-3xl leading-7 text-blue-100">{description}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="border-b border-slate-200 bg-white">
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 py-4 sm:px-6 md:grid-cols-3 lg:grid-cols-6 lg:px-8" aria-label="ข้อมูลข่าวสารและปฏิทิน">
            {informationLinks.map(({ label, href, icon: NavIcon }) => {
              const isActive = activePath === href;
              return (
                <Link key={href} href={href} aria-current={isActive ? "page" : undefined} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-[var(--color-academic-navy)] text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-[var(--color-academic-navy)]"}`}>
                  <NavIcon size={17} />{label}
                </Link>
              );
            })}
          </nav>
        </div>

        {children}
      </main>
      <Footer />
    </>
  );
}
