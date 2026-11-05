"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Maximize2, MessageCircle, Minimize2, RotateCcw, Send, X } from "lucide-react";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  time?: string;
  action?: { label: string; href: string };
};

const welcomeMessage: Message = {
  id: 1,
  role: "assistant",
  text: "สวัสดีครับ 👋 ยินดีต้อนรับสู่คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม\n\nผมช่วยค้นหาข้อมูลหลักสูตร การรับสมัคร บริการนักศึกษา และช่องทางติดต่อได้ครับ",
};

const quickQuestions = ["ดูหลักสูตร", "การรับสมัคร", "บริการนักศึกษา", "ติดต่อคณะ"] as const;

function currentTime() {
  return new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function createReply(question: string): Omit<Message, "id"> {
  const normalized = question.trim().toLowerCase();

  if (normalized.includes("หลักสูตร") || normalized.includes("เรียน")) {
    return {
      role: "assistant",
      text: "คณะเปิดสอนตั้งแต่ระดับ ปวช. ปวส. ปริญญาตรี ปริญญาโท และปริญญาเอก คุณสามารถดูรายชื่อสาขาทั้งหมดและเปิดดูรายละเอียดแยกตามระดับได้ครับ",
      action: { label: "เปิดหน้าหลักสูตร", href: "/programs" },
      time: currentTime(),
    };
  }

  if (normalized.includes("สมัคร") || normalized.includes("รับเข้า") || normalized.includes("admission")) {
    return {
      role: "assistant",
      text: "ข้อมูลรับสมัครจะแตกต่างกันตามระดับการศึกษา แนะนำให้ตรวจสอบหลักสูตรที่สนใจก่อน แล้วติดต่อคณะเพื่อยืนยันคุณสมบัติและรอบรับสมัครครับ",
      action: { label: "ดูข้อมูลรับสมัคร", href: "/#admissions" },
      time: currentTime(),
    };
  }

  if (normalized.includes("บริการ") || normalized.includes("นักศึกษา") || normalized.includes("ระบบ")) {
    return {
      role: "assistant",
      text: "นักศึกษาสามารถเข้าสู่ระบบบริการการศึกษา ปฏิทินวิชาการ ห้องสมุด และบริการออนไลน์ต่าง ๆ จากเมนูบริการของเว็บไซต์ได้ครับ",
      action: { label: "ไปยังบริการออนไลน์", href: "/#services" },
      time: currentTime(),
    };
  }

  if (normalized.includes("ติดต่อ") || normalized.includes("โทร") || normalized.includes("อีเมล") || normalized.includes("ที่อยู่")) {
    return {
      role: "assistant",
      text: "ติดต่อคณะได้ที่ 042-503-777 หรือ itech@npu.ac.th\nที่อยู่ 214 หมู่ 12 ตำบลหนองญาติ อำเภอเมือง จังหวัดนครพนม 48000",
      action: { label: "ดูหน้าติดต่อ", href: "/contact" },
      time: currentTime(),
    };
  }

  return {
    role: "assistant",
    text: "ขณะนี้ผมตอบข้อมูลพื้นฐานเกี่ยวกับหลักสูตร การรับสมัคร บริการนักศึกษา และการติดต่อได้ครับ ลองเลือกหัวข้อด้านล่างหรือพิมพ์คำสำคัญที่ต้องการค้นหา",
    time: currentTime(),
  };
}

export default function CampusChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);

  function askQuestion(question: string) {
    const text = question.trim();
    if (!text) return;

    const now = Date.now();
    setMessages((current) => [
      ...current,
      { id: now, role: "user", text, time: currentTime() },
      { id: now + 1, ...createReply(text) },
    ]);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    askQuestion(input);
  }

  function resetConversation() {
    setMessages([welcomeMessage]);
    setInput("");
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="ITECH NPU Assistant"
            className={`fixed z-[90] flex overflow-hidden rounded-[1.75rem] border border-emerald-900/10 bg-white shadow-[0_24px_80px_rgba(13,75,63,0.28)] ${isExpanded ? "inset-4 bottom-24" : "bottom-24 right-4 h-[min(650px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[410px] sm:right-6"}`}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="relative overflow-hidden bg-[#00695c] px-5 pb-5 pt-4 text-white">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#b4ca32]" />
                <div className="flex items-center gap-3">
                  <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
                    <MessageCircle size={22} />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#00695c] bg-[#b4ca32]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold">ITECH NPU Assistant</h2>
                    <p className="text-xs text-emerald-100">ผู้ช่วยข้อมูลออนไลน์ · พร้อมให้บริการ</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setIsExpanded((value) => !value)} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20" aria-label={isExpanded ? "ย่อหน้าต่างแชต" : "ขยายหน้าต่างแชต"}>{isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
                    <button type="button" onClick={resetConversation} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20" aria-label="เริ่มการสนทนาใหม่"><RotateCcw size={18} /></button>
                    <button type="button" onClick={() => setIsOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20" aria-label="ปิดแชต"><X size={19} /></button>
                  </div>
                </div>
              </header>

              <div className="flex-1 space-y-5 overflow-y-auto bg-[#f6f8f7] px-4 py-5" aria-live="polite">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#00695c] text-white"><Bot size={18} /></span>}
                    <div className={`max-w-[82%] ${message.role === "user" ? "text-right" : ""}`}>
                      <div className={`whitespace-pre-line rounded-2xl px-4 py-3 text-left text-sm leading-6 shadow-sm ${message.role === "user" ? "rounded-br-md bg-[#00695c] text-white" : "rounded-tl-md border border-slate-200 bg-white text-slate-700"}`}>
                        {message.text}
                        {message.action && <a href={message.action.href} className={`mt-3 inline-flex items-center gap-1 font-semibold underline decoration-2 underline-offset-4 ${message.role === "user" ? "text-white" : "text-[#00695c]"}`}>{message.action.label} <span aria-hidden>→</span></a>}
                      </div>
                      {message.time && <p className="mt-1 px-1 text-[10px] text-slate-400">{message.time} น.</p>}
                    </div>
                  </div>
                ))}

                {messages.length === 1 && (
                  <div className="pl-11">
                    <p className="mb-2 text-xs font-medium text-slate-500">คำถามที่พบบ่อย</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((question) => <button key={question} type="button" onClick={() => askQuestion(question)} className="rounded-full border border-emerald-800/15 bg-white px-3 py-2 text-xs font-medium text-[#00695c] shadow-sm transition hover:border-[#00695c] hover:bg-emerald-50">{question}</button>)}
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1.5 pl-4 focus-within:ring-2 focus-within:ring-[#b4ca32]/60">
                  <label htmlFor="campus-chat-input" className="sr-only">พิมพ์คำถาม</label>
                  <input id="campus-chat-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="พิมพ์คำถามของคุณ..." className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400" />
                  <button type="submit" disabled={!input.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#00695c] text-white transition hover:bg-[#005348] disabled:cursor-not-allowed disabled:opacity-35" aria-label="ส่งข้อความ"><Send size={18} /></button>
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-400">ข้อมูลเบื้องต้นจากเว็บไซต์คณะเทคโนโลยีอุตสาหกรรม</p>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="fixed bottom-5 right-4 z-[90] grid h-16 w-16 place-items-center rounded-full bg-[#00695c] text-white shadow-[0_14px_35px_rgba(0,105,92,0.35)] ring-4 ring-white transition hover:-translate-y-1 hover:bg-[#005348] sm:bottom-6 sm:right-6"
        aria-label={isOpen ? "ปิดกล่องแชต" : "เปิดกล่องแชต"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={27} /> : <MessageCircle size={27} />}
        {!isOpen && <span className="absolute right-0 top-0 h-4 w-4 rounded-full border-2 border-white bg-[#b4ca32]" />}
      </button>
    </>
  );
}
