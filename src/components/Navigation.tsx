"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Cpu, Globe2, Mail, Menu, Phone, Search, X } from "lucide-react";

const programs = [
  ["ระดับ ปวช.", "/programs/vocational"],
  ["ระดับ ปวส.", "/programs/high-vocational"],
  ["ระดับปริญญาตรี", "/programs/bachelor"],
  ["ระดับปริญญาโท", "/programs/master"],
  ["ระดับปริญญาเอก", "/programs/phd"],
] as const;

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-50 w-full bg-white shadow-[0_1px_0_rgba(21,59,86,0.09)]">
      <div className="bg-[var(--color-academic-gold-dark)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="tel:042503777" className="flex items-center gap-1.5 hover:text-[var(--color-academic-gold-light)]"><Phone size={13} /> 042-503-777</a>
            <a href="mailto:itech@npu.ac.th" className="hidden items-center gap-1.5 hover:text-[var(--color-academic-gold-light)] sm:flex"><Mail size={13} /> itech@npu.ac.th</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/#services" className="hidden hover:text-[var(--color-academic-gold-light)] md:block">สำหรับนักศึกษา</Link>
            <Link href="/#services" className="hidden hover:text-[var(--color-academic-gold-light)] md:block">สำหรับบุคลากร</Link>
            <button type="button" className="flex items-center gap-1.5" aria-label="เปลี่ยนภาษา"><Globe2 size={13} /> TH <span className="text-white/50">|</span> EN</button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="กลับหน้าแรก">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--color-academic-gold)] text-white shadow-lg shadow-sky-900/15 transition-transform group-hover:-translate-y-0.5 sm:h-16 sm:w-16">
            <Cpu className="h-8 w-8" strokeWidth={1.7} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-bold leading-tight text-[var(--color-academic-navy)] sm:text-2xl">คณะเทคโนโลยีอุตสาหกรรม</span>
            <span className="mt-1 block truncate text-[11px] font-medium tracking-wide text-slate-500 sm:text-sm">FACULTY OF INDUSTRIAL TECHNOLOGY · NPU</span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 lg:flex">
          <label className="relative">
            <span className="sr-only">ค้นหาในเว็บไซต์</span>
            <input type="search" placeholder="ค้นหาในเว็บไซต์" className="w-56 rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm text-slate-800 outline-none transition focus:border-[var(--color-academic-navy)] focus:bg-white" />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>
          <Link href="/#admissions" className="rounded-full bg-[var(--color-academic-gold-dark)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-academic-gold)]">สมัครเรียน</Link>
        </div>

        <button type="button" onClick={() => setIsOpen((current) => !current)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-[var(--color-academic-navy)] lg:hidden" aria-expanded={isOpen} aria-controls="mobile-navigation" aria-label={isOpen ? "ปิดเมนู" : "เปิดเมนู"}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="hidden border-t border-slate-100 lg:block">
        <nav className="mx-auto flex max-w-7xl items-stretch px-4 sm:px-6 lg:px-8" aria-label="เมนูหลัก">
          <Link href="/" className="nav-link">หน้าแรก</Link>
          <div className="group relative">
            <button type="button" className="nav-link flex items-center gap-1.5">เกี่ยวกับคณะ <ChevronDown size={14} /></button>
            <div className="nav-dropdown left-0 w-64">
              <Link href="/about/history">ประวัติความเป็นมา</Link>
              <Link href="#vision">วิสัยทัศน์และพันธกิจ</Link>
              <Link href="#">โครงสร้างการบริหาร</Link>
              <Link href="#">บุคลากร</Link>
            </div>
          </div>
          <div className="group relative">
            <Link href="/programs" className="nav-link flex items-center gap-1.5">หลักสูตร <ChevronDown size={14} /></Link>
            <div className="nav-dropdown left-0 w-72">{programs.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
          </div>
          <Link href="/#admissions" className="nav-link">รับสมัครนักศึกษา</Link>
          <Link href="/#news" className="nav-link">ข่าวและกิจกรรม</Link>
          <Link href="/#research" className="nav-link">วิจัยและบริการวิชาการ</Link>
          <Link href="/#services" className="nav-link">บริการออนไลน์</Link>
          <Link href="/contact" className="nav-link">ติดต่อเรา</Link>
        </nav>
      </div>

      <div id="mobile-navigation" className={`overflow-hidden border-t border-slate-100 bg-white transition-[max-height] duration-300 lg:hidden ${isOpen ? "max-h-[42rem]" : "max-h-0"}`}>
        <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4" aria-label="เมนูมือถือ">
          <Link href="/" className="mobile-nav-link" onClick={() => setIsOpen(false)}>หน้าแรก</Link>
          <Link href="/about/history" className="mobile-nav-link" onClick={() => setIsOpen(false)}>เกี่ยวกับคณะ</Link>
          <Link href="/programs" className="mobile-nav-link mt-1" onClick={() => setIsOpen(false)}>หลักสูตร</Link>
          <div className="grid grid-cols-2 gap-1 px-2">{programs.map(([label, href]) => <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-sky-50" onClick={() => setIsOpen(false)}>{label}</Link>)}</div>
          <Link href="/#admissions" className="mobile-nav-link" onClick={() => setIsOpen(false)}>รับสมัครนักศึกษา</Link>
          <Link href="/#news" className="mobile-nav-link" onClick={() => setIsOpen(false)}>ข่าวและกิจกรรม</Link>
          <Link href="/#services" className="mobile-nav-link" onClick={() => setIsOpen(false)}>บริการออนไลน์</Link>
          <Link href="/contact" className="mobile-nav-link" onClick={() => setIsOpen(false)}>ติดต่อเรา</Link>
        </nav>
      </div>
    </header>
  );
}
