"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, ExternalLink, LoaderCircle, Save, Settings2, X } from "lucide-react";
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings-types";

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({})) as { error?: string; settings?: SiteSettings };
  if (!response.ok) throw new Error(data.error || "โหลดข้อมูลไม่สำเร็จ");
  return data;
}

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(readResponse)
      .then((data) => { if (active && data.settings) setSettings(data.settings); })
      .catch((caught: Error) => { if (active) setError(caught.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function update<Key extends keyof SiteSettings>(key: Key, value: SiteSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const data = await readResponse(await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }));
      if (data.settings) setSettings(data.settings);
      setMessage("บันทึกข้อมูลเว็บไซต์แล้ว");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="grid min-h-80 place-items-center rounded-3xl bg-white"><div className="text-center text-slate-500"><LoaderCircle className="mx-auto animate-spin" /><p className="mt-3 text-sm">กำลังโหลดข้อมูลเว็บไซต์</p></div></div>;

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-sky-700">WEBSITE SETTINGS</p><h2 className="mt-1 text-3xl font-bold text-slate-900">ข้อมูลเว็บไซต์</h2><p className="mt-2 text-slate-500">แก้ไขชื่อคณะ ข้อมูลติดต่อ Facebook และแหล่ง RSS ได้จากจุดเดียว</p></div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">ดูเว็บไซต์ <ExternalLink size={16} /></a>
      </div>

      {(message || error) && <div aria-live="polite" className={`flex items-center gap-2 rounded-xl p-4 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{error ? <X size={17} /> : <Check size={17} />}{error || message}</div>}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-sky-800"><Settings2 size={21} /></span><div><h3 className="font-bold text-slate-900">ชื่อและคำอธิบาย</h3><p className="text-sm text-slate-500">ข้อมูลนี้แสดงที่เมนู ส่วนท้าย และหน้าเว็บไซต์</p></div></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">ชื่อคณะ (ไทย) *<input required value={settings.facultyNameTh} onChange={(event) => update("facultyNameTh", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-sky-500" /></label>
          <label className="text-sm font-semibold text-slate-700">ชื่อคณะ (อังกฤษ) *<input required value={settings.facultyNameEn} onChange={(event) => update("facultyNameEn", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-sky-500" /></label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">ชื่อมหาวิทยาลัย *<input required value={settings.universityNameTh} onChange={(event) => update("universityNameTh", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-sky-500" /></label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">คำโปรย<textarea rows={3} value={settings.tagline} onChange={(event) => update("tagline", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal leading-7 outline-none focus:border-sky-500" /></label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">คำอธิบายเว็บไซต์<textarea rows={3} value={settings.description} onChange={(event) => update("description", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal leading-7 outline-none focus:border-sky-500" /></label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="font-bold text-slate-900">ข้อมูลติดต่อ</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">โทรศัพท์หลัก<input value={settings.phone} onChange={(event) => update("phone", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-sky-500" /></label>
          <label className="text-sm font-semibold text-slate-700">งานประชาสัมพันธ์<input value={settings.publicRelationsPhone} onChange={(event) => update("publicRelationsPhone", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-sky-500" /></label>
          <label className="text-sm font-semibold text-slate-700">อีเมล<input type="email" value={settings.email} onChange={(event) => update("email", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-sky-500" /></label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">ที่อยู่<textarea rows={3} value={settings.address} onChange={(event) => update("address", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal leading-7 outline-none focus:border-sky-500" /></label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="font-bold text-slate-900">Facebook และ RSS</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">สร้าง Feed จากเพจด้วย RSS.app, n8n หรือ Make แล้ววาง URL ด้านล่าง จากนั้นไปที่เมนู “นำเข้าจาก Facebook / RSS”</p>
        <div className="mt-5 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">ลิงก์ Facebook Page<input type="url" value={settings.facebookUrl} onChange={(event) => update("facebookUrl", event.target.value)} placeholder="https://www.facebook.com/…" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-sky-500" /></label>
          <label className="block text-sm font-semibold text-slate-700">ลิงก์ RSS ส่วนตัว<input type="url" value={settings.facebookRssUrl} onChange={(event) => update("facebookRssUrl", event.target.value)} placeholder="https://rss.app/feeds/…" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-sky-500" /><span className="mt-2 block text-xs font-normal leading-5 text-amber-700">ระบบเก็บลิงก์นี้ฝั่งเซิร์ฟเวอร์และไม่ส่งออกผ่าน API สาธารณะ หากผู้ให้บริการใส่โทเคนไว้ใน URL ห้ามนำไปเผยแพร่ที่อื่น</span></label>
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-academic-navy)] px-6 py-3.5 font-semibold text-white shadow-lg disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}บันทึกข้อมูลเว็บไซต์</button></div>
    </form>
  );
}
