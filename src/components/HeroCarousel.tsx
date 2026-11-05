"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Download, GraduationCap, Laptop } from "lucide-react";

const slides = [
  {
    image: "/hero-industrial-v2.png",
    eyebrow: "รับสมัครนักศึกษาใหม่ ปีการศึกษา 2570",
    title: "สร้างอนาคตด้วยเทคโนโลยี ลงมือทำด้วยความคิดสร้างสรรค์",
    description: "เรียนรู้จากประสบการณ์จริง พัฒนาทักษะด้านวิศวกรรม นวัตกรรม และเทคโนโลยีอุตสาหกรรม พร้อมก้าวสู่โลกการทำงานยุคใหม่",
  },
] as const;

const heroServices = [
  { label: "หลักสูตร", caption: "Programs", icon: BookOpen, href: "/programs" },
  { label: "สมัครเรียน", caption: "Admissions", icon: GraduationCap, href: "#admissions" },
  { label: "ระบบการศึกษา", caption: "REG NPU", icon: Laptop, href: "https://reg.npu.ac.th" },
  { label: "ปฏิทินวิชาการ", caption: "Calendar", icon: CalendarDays, href: "#services" },
  { label: "ดาวน์โหลด", caption: "Downloads", icon: Download, href: "#services" },
] as const;

export default function HeroCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6500, stopOnInteraction: false })]);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <section id="admissions" className="relative overflow-hidden bg-[var(--color-academic-navy)] text-white">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.image} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative min-h-[800px] sm:min-h-[760px] lg:min-h-[680px]">
                <Image src={slide.image} alt={slide.title} fill sizes="100vw" priority className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,36,53,.94)_0%,rgba(21,59,86,.73)_46%,rgba(21,59,86,.2)_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                <div className="relative mx-auto flex max-w-7xl px-5 pb-80 pt-20 sm:px-8 sm:pb-72 sm:pt-24 lg:px-8 lg:pb-64 lg:pt-28">
                  <div className="max-w-4xl">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-academic-gold-light)] sm:text-sm">{slide.eyebrow}</p>
                    <h1 className="max-w-4xl text-4xl font-bold leading-[1.18] tracking-tight sm:text-6xl lg:text-7xl">{slide.title}</h1>
                    <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">{slide.description}</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link href="/programs" className="inline-flex items-center gap-2 rounded-full bg-[var(--color-academic-gold-dark)] px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-academic-gold)]">ดูหลักสูตร <ArrowRight size={18} /></Link>
                      <Link href="/contact" className="rounded-full border border-white/55 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[var(--color-academic-navy)]">ติดต่อคณะ</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-7 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-2">{slides.length > 1 && slides.map((slide, index) => (
            <button key={slide.image} type="button" onClick={() => emblaApi?.scrollTo(index)} className={`h-1.5 rounded-full transition-all ${selectedIndex === index ? "w-10 bg-[var(--color-academic-gold)]" : "w-4 bg-white/55 hover:bg-white"}`} aria-label={`ไปสไลด์ที่ ${index + 1}`} />
          ))}</div>
          <div className={`hidden gap-2 sm:flex ${slides.length > 1 ? "" : "invisible"}`}>
            <button type="button" onClick={() => emblaApi?.scrollPrev()} className="grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-black/15 backdrop-blur-md transition hover:bg-white hover:text-[var(--color-academic-navy)]" aria-label="สไลด์ก่อนหน้า"><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => emblaApi?.scrollNext()} className="grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-black/15 backdrop-blur-md transition hover:bg-white hover:text-[var(--color-academic-navy)]" aria-label="สไลด์ถัดไป"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/25 bg-white/15 shadow-2xl backdrop-blur-xl sm:grid-cols-5">
          {heroServices.map((service) => {
            const Icon = service.icon;
            const external = service.href.startsWith("http");
            return (
              <a key={service.label} href={service.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex min-h-24 items-center gap-3 border-b border-r border-white/15 px-3 py-4 transition hover:bg-white hover:text-[var(--color-academic-navy)] sm:min-h-28 sm:flex-col sm:justify-center sm:gap-2 sm:text-center">
                <Icon className="h-6 w-6 shrink-0 text-[var(--color-academic-gold-light)] transition group-hover:text-[var(--color-academic-gold-dark)]" strokeWidth={1.7} />
                <span><span className="block text-sm font-semibold">{service.label}</span><span className="hidden text-[10px] uppercase tracking-wider opacity-65 sm:block">{service.caption}</span></span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
