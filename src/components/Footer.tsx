import Link from "next/link";
import { Cpu, Mail, MapPin, Phone } from "lucide-react";
import WeatherWidget from "./WeatherWidget";

export default function Footer() {
  return (
    <footer className="bg-[#102a3c] text-slate-300">
      <div className="h-1 bg-gradient-to-r from-[var(--color-academic-gold-dark)] via-[var(--color-academic-gold-light)] to-[var(--color-academic-gold-dark)]" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.75fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3 text-white">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10"><Cpu size={27} /></span>
              <span><span className="block text-lg font-bold">คณะเทคโนโลยีอุตสาหกรรม</span><span className="text-xs tracking-wide text-slate-400">NAKHON PHANOM UNIVERSITY</span></span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">สร้างนักปฏิบัติมืออาชีพ พัฒนาเทคโนโลยีและนวัตกรรม เพื่ออุตสาหกรรมและชุมชนอย่างยั่งยืน</p>
            <div className="mt-5 flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] hover:bg-[var(--color-academic-gold)] hover:text-[var(--color-academic-navy)]"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
              <a href="mailto:itech@npu.ac.th" aria-label="อีเมล" className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] hover:bg-[var(--color-academic-gold)] hover:text-[var(--color-academic-navy)]"><Mail size={18} /></a>
            </div>
          </div>

          <div>
            <h3 className="footer-title">เมนูหลัก</h3>
            <div className="footer-links"><Link href="/about/history">เกี่ยวกับคณะ</Link><Link href="/programs">หลักสูตร</Link><Link href="/#news">ข่าวสาร</Link><Link href="/#services">บริการออนไลน์</Link></div>
          </div>

          <div>
            <h3 className="footer-title">สำหรับผู้ใช้งาน</h3>
            <div className="footer-links"><a href="https://reg.npu.ac.th" target="_blank" rel="noopener noreferrer">ระบบบริการการศึกษา</a><a href="https://arc.npu.ac.th/" target="_blank" rel="noopener noreferrer">ห้องสมุด</a><Link href="#">ดาวน์โหลดเอกสาร</Link><Link href="/contact">ติดต่อเรา</Link></div>
          </div>

          <div>
            <h3 className="footer-title">ติดต่อคณะ</h3>
            <div className="space-y-4 text-sm leading-6 text-slate-400">
              <p className="flex gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-[var(--color-academic-gold)]" />214 หมู่ 12 ต.หนองญาติ อ.เมือง จ.นครพนม 48000</p>
              <a href="tel:042503777" className="flex items-center gap-3 hover:text-white"><Phone className="h-4 w-4 text-[var(--color-academic-gold)]" />042-503-777</a>
              <a href="mailto:itech@npu.ac.th" className="flex items-center gap-3 hover:text-white"><Mail className="h-4 w-4 text-[var(--color-academic-gold)]" />itech@npu.ac.th</a>
            </div>
            <WeatherWidget />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Faculty of Industrial Technology, Nakhon Phanom University.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/sitemap">แผนผังเว็บไซต์</Link><Link href="/cookie-policy">นโยบายคุกกี้และความเป็นส่วนตัว</Link><Link href="#">ข้อกำหนดการใช้งาน</Link></div>
        </div>
      </div>
    </footer>
  );
}
