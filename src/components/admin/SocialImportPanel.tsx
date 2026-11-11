"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, ExternalLink, FileInput, LoaderCircle, RefreshCw, Rss, Share2, X } from "lucide-react";
import { categoryLabels, contentCategories, type ContentCategory } from "@/lib/cms-types";
import type { SocialImportItem, SocialImportSource } from "@/lib/social-import-types";

type ImportStatus = {
  facebookConfigured: boolean;
  rssConfigured: boolean;
  facebookUrl: string;
  rssUrl: string;
};

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({})) as ImportStatus & { error?: string; items?: SocialImportItem[] };
  if (!response.ok) throw new Error(data.error || "ทำรายการไม่สำเร็จ");
  return data;
}

export default function SocialImportPanel({ onImported, onManualCreate, onOpenSettings }: {
  onImported: () => Promise<void>;
  onManualCreate: (url: string) => void;
  onOpenSettings: () => void;
}) {
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [source, setSource] = useState<SocialImportSource>("rss");
  const [items, setItems] = useState<SocialImportItem[]>([]);
  const [category, setCategory] = useState<ContentCategory>("news");
  const [busy, setBusy] = useState(false);
  const [importingId, setImportingId] = useState("");
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const [manualUrl, setManualUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/social-import", { cache: "no-store" })
      .then(readResponse)
      .then((data) => { if (active) setStatus(data); })
      .catch((caught: Error) => { if (active) setError(caught.message); });
    return () => { active = false; };
  }, []);

  async function preview(selectedSource = source) {
    setSource(selectedSource);
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const data = await readResponse(await fetch("/api/admin/social-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", source: selectedSource }),
      }));
      setItems(data.items || []);
      setMessage(`พบข่าว ${data.items?.length || 0} รายการ`);
    } catch (caught) {
      setItems([]);
      setError(caught instanceof Error ? caught.message : "โหลดข่าวไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function importItem(item: SocialImportItem) {
    setImportingId(item.id);
    setMessage("");
    setError("");
    try {
      await readResponse(await fetch("/api/admin/social-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", source, itemId: item.id, category }),
      }));
      setImportedIds((current) => [...current, item.id]);
      setMessage(`นำเข้า “${item.title}” เป็นฉบับร่างแล้ว`);
      await onImported();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "นำเข้าไม่สำเร็จ");
    } finally {
      setImportingId("");
    }
  }

  function manualImport(event: FormEvent) {
    event.preventDefault();
    try {
      const url = new URL(manualUrl);
      if (!["facebook.com", "www.facebook.com", "m.facebook.com"].includes(url.hostname)) throw new Error();
      onManualCreate(url.toString());
    } catch {
      setError("กรุณาวางลิงก์โพสต์จาก facebook.com ที่ถูกต้อง");
    }
  }

  const sourceReady = source === "rss" ? status?.rssConfigured : status?.facebookConfigured;

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-semibold text-sky-700">SOCIAL IMPORT</p><h2 className="mt-1 text-3xl font-bold text-slate-900">นำเข้าจาก Facebook / RSS</h2><p className="mt-2 max-w-3xl text-slate-500">ตรวจข่าวจาก RSS.app, n8n, Make หรือ Facebook Graph API แล้วเลือกนำเข้าเป็นฉบับร่างเพื่อตรวจแก้ก่อนเผยแพร่</p></div>

      {(message || error) && <div aria-live="polite" className={`flex items-center gap-2 rounded-xl p-4 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{error ? <X size={17} /> : <Check size={17} />}{error || message}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <button type="button" onClick={() => setSource("rss")} className={`rounded-2xl border p-5 text-left transition ${source === "rss" ? "border-orange-300 bg-orange-50 ring-2 ring-orange-100" : "border-slate-200 bg-white hover:border-orange-200"}`}><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-100 text-orange-700"><Rss size={22} /></span><div><h3 className="font-bold text-slate-900">RSS.app / n8n / Make</h3><p className="text-sm text-slate-500">{status?.rssConfigured ? "พร้อมใช้งาน" : "ยังไม่ได้เพิ่ม RSS URL"}</p></div></div><p className="mt-4 text-sm leading-6 text-slate-600">แนะนำสำหรับเริ่มต้น ตั้งค่าง่ายและไม่ต้องขอสิทธิ์ Facebook App</p></button>
        <button type="button" onClick={() => setSource("facebook")} className={`rounded-2xl border p-5 text-left transition ${source === "facebook" ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-200"}`}><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-[#1877F2]"><Share2 size={22} /></span><div><h3 className="font-bold text-slate-900">Facebook Graph API</h3><p className="text-sm text-slate-500">{status?.facebookConfigured ? "เชื่อมต่อ Page Token แล้ว" : "ยังไม่มี Page Access Token"}</p></div></div><p className="mt-4 text-sm leading-6 text-slate-600">เหมาะกับเพจของคณะ ดึงโพสต์ที่เผยแพร่โดยเพจผ่าน API ทางการ</p></button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-bold text-slate-900">ตรวจข่าวล่าสุด</h3><p className="mt-1 break-all text-sm text-slate-500">{source === "rss" ? status?.rssUrl || "เพิ่ม RSS URL ในข้อมูลเว็บไซต์ก่อน" : status?.facebookUrl || "Facebook Page ของคณะ"}</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {!sourceReady && <button type="button" onClick={onOpenSettings} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">ไปที่การตั้งค่า</button>}
            <button type="button" disabled={busy || !sourceReady} onClick={() => preview()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-academic-navy)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy ? <LoaderCircle className="animate-spin" size={17} /> : <RefreshCw size={17} />}ตรวจข่าวล่าสุด</button>
          </div>
        </div>
      </div>

      <form onSubmit={manualImport} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><FileInput className="text-sky-700" size={22} /><div><h3 className="font-bold text-slate-900">วางลิงก์โพสต์ด้วยตนเอง</h3><p className="text-sm text-slate-500">ใช้ได้แม้ยังไม่มี RSS หรือ Page Token ระบบจะเปิดตัวแก้ไขข่าวพร้อมลิงก์ต้นฉบับ</p></div></div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input type="url" value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} placeholder="https://www.facebook.com/…/posts/…" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-500" /><button className="rounded-xl bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-800">สร้างฉบับร่าง</button></div>
      </form>

      {items.length > 0 && <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-slate-700">เลือกหมวดก่อนนำเข้า</p><select value={category} onChange={(event) => setCategory(event.target.value as ContentCategory)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500">{contentCategories.map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></div>
        {items.map((item) => {
          const imported = importedIds.includes(item.id);
          return <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.source === "rss" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>{item.source === "rss" ? "RSS" : "Facebook"}</span><span className="text-xs text-slate-400">{new Date(item.publishedAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</span></div><h3 className="mt-3 text-lg font-bold leading-7 text-slate-900">{item.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{item.description}</p><a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-700">ดูต้นฉบับ <ExternalLink size={15} /></a></div><button disabled={Boolean(importingId) || imported} onClick={() => importItem(item)} className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${imported ? "bg-emerald-50 text-emerald-700" : "bg-[var(--color-academic-gold-dark)] text-white disabled:opacity-50"}`}>{importingId === item.id ? <LoaderCircle className="animate-spin" size={17} /> : imported ? <Check size={17} /> : <FileInput size={17} />}{imported ? "นำเข้าแล้ว" : "นำเข้าเป็นฉบับร่าง"}</button></div></article>;
        })}
      </div>}
    </section>
  );
}
