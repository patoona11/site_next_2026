import { ArrowUpRight, BriefcaseBusiness, GraduationCap, UsersRound } from "lucide-react";

const pathways = [
  { title: "ผู้สนใจเข้าศึกษา", subtitle: "ค้นหาหลักสูตร การรับสมัคร และทุนการศึกษา", icon: GraduationCap, href: "/programs" },
  { title: "นักศึกษาปัจจุบัน", subtitle: "เข้าถึงระบบการศึกษา ปฏิทิน และบริการออนไลน์", icon: UsersRound, href: "https://reg.npu.ac.th" },
  { title: "สถานประกอบการและศิษย์เก่า", subtitle: "ร่วมวิจัย พัฒนากำลังคน และสร้างเครือข่ายอุตสาหกรรม", icon: BriefcaseBusiness, href: "/contact" },
] as const;

export default function QuickLinks() {
  return (
    <section id="services" className="bg-[#f3f7fa] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="section-eyebrow">Explore ITECH NPU</p>
          <h2 className="section-title">เริ่มต้นจากสิ่งที่คุณกำลังมองหา</h2>
          <p className="mt-3 leading-7 text-slate-500">รวมข้อมูลสำคัญสำหรับผู้เรียน บุคลากร และเครือข่ายภาคอุตสาหกรรมไว้ในที่เดียว</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {pathways.map((item, index) => {
            const Icon = item.icon;
            const external = item.href.startsWith("http");
            return (
              <a key={item.title} href={item.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`group relative overflow-hidden rounded-2xl border p-7 transition hover:-translate-y-1 hover:shadow-xl ${index === 0 ? "border-[var(--color-academic-gold)] bg-[var(--color-academic-gold-dark)] text-white" : "border-sky-100 bg-white text-[var(--color-academic-navy)]"}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid h-14 w-14 place-items-center rounded-full ${index === 0 ? "bg-white/15" : "bg-sky-50 text-[var(--color-academic-gold-dark)]"}`}><Icon size={26} strokeWidth={1.7} /></span>
                  <ArrowUpRight className="h-5 w-5 opacity-45 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <h3 className="mt-8 text-xl font-bold">{item.title}</h3>
                <p className={`mt-2 text-sm leading-7 ${index === 0 ? "text-white/75" : "text-slate-500"}`}>{item.subtitle}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
