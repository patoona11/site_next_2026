import Link from "next/link";
import { ArrowUpRight, CalendarDays, Info } from "lucide-react";

export type InformationItem = {
  title: string;
  date: string;
  description: string;
  href: string;
  tag: string;
  status?: string;
};

type InformationListingProps = {
  items: readonly InformationItem[];
  notice?: string;
  sourceNote: string;
};

export default function InformationListing({ items, notice, sourceNote }: InformationListingProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {notice && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-5 text-sm leading-7 text-sky-900">
          <Info className="mt-1 h-5 w-5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => {
          const content = (
            <>
              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-[var(--color-academic-navy)]">{item.tag}</span>
                    {item.status && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">{item.status}</span>}
                  </div>
                  <h2 className="mt-3 text-lg font-bold leading-7 text-slate-900 transition group-hover:text-[var(--color-academic-navy)] sm:text-xl">{item.title}</h2>
                  <p className="mt-2 max-w-4xl leading-7 text-slate-500">{item.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm text-slate-400"><CalendarDays size={16} />{item.date}</div>
              </div>
              <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-academic-gold-dark)]" />
            </>
          );

          const className = "group flex items-start gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-100 hover:shadow-lg sm:p-6";
          return item.href.startsWith("http") ? (
            <a key={`${item.title}-${item.date}`} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
          ) : (
            <Link key={`${item.title}-${item.date}`} href={item.href} className={className}>{content}</Link>
          );
        })}
      </div>

      <p className="mt-8 text-right text-xs leading-6 text-slate-400">{sourceNote}</p>
    </section>
  );
}
