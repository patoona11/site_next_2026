import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { categoryLabels } from "@/lib/cms-types";
import { formatThaiDate } from "@/lib/cms-presenters";
import { getPublishedPostBySlug } from "@/lib/content-store";

export const dynamic = "force-dynamic";

type PostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPublishedPostBySlug((await params).slug);
  return post ? { title: post.title, description: post.excerpt || post.body.slice(0, 160) } : { title: "ไม่พบเนื้อหา" };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPublishedPostBySlug((await params).slug);
  if (!post) notFound();

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-50">
        <article>
          <header className="bg-[var(--color-academic-navy)] px-4 py-14 text-white sm:py-20">
            <div className="mx-auto max-w-4xl">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white"><ArrowLeft size={16} />กลับหน้าแรก</Link>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm"><span className="rounded-full bg-white/10 px-3 py-1.5 font-semibold text-sky-100">{categoryLabels[post.category]}</span><span className="flex items-center gap-2 text-blue-100"><CalendarDays size={15} />{formatThaiDate(post.publishedAt)}</span></div>
              <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
              {post.excerpt && <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100">{post.excerpt}</p>}
            </div>
          </header>

          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
            {post.image && <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-200 shadow-lg"><Image src={post.image} alt={post.title} fill sizes="(max-width: 900px) 100vw, 900px" className="object-cover" priority /></div>}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
              <div className="whitespace-pre-wrap text-lg leading-9 text-slate-700">{post.body || post.excerpt}</div>
              {post.externalUrl && <a href={post.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 rounded-full bg-[var(--color-academic-gold-dark)] px-6 py-3 font-semibold text-white hover:bg-[var(--color-academic-gold)]">ดูข้อมูลต้นฉบับ <ExternalLink size={17} /></a>}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
