"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BookOpenText, Check, ChevronLeft, FileImage, Globe2, LoaderCircle, LogOut, Newspaper, Pencil, Plus, RefreshCw, Save, Search, Settings2, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import { categoryLabels, contentCategories, type ContentPost, type ContentPostInput } from "@/lib/cms-types";
import AdminSettingsPanel from "@/components/admin/AdminSettingsPanel";
import SocialImportPanel from "@/components/admin/SocialImportPanel";

const blankForm: ContentPostInput = {
  title: "",
  excerpt: "",
  body: "",
  category: "news",
  status: "published",
  image: "",
  externalUrl: "",
  publishedAt: "",
};

function dateTimeInputValue(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

async function responseData(response: Response) {
  const data = await response.json().catch(() => ({})) as { error?: string; posts?: ContentPost[]; post?: ContentPost; url?: string; configured?: boolean; authenticated?: boolean; backend?: "local" | "supabase"; backendConfigured?: boolean; authMode?: "password" | "supabase" };
  if (!response.ok) throw new Error(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
  return data;
}

export default function AdminDashboard() {
  const [screen, setScreen] = useState<"loading" | "login" | "unconfigured" | "dashboard">("loading");
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [form, setForm] = useState<ContentPostInput>(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({ username: "admin", password: "" });
  const [backend, setBackend] = useState<"local" | "supabase">("local");
  const [authMode, setAuthMode] = useState<"password" | "supabase">("password");
  const [setupIssue, setSetupIssue] = useState<"admin" | "supabase">("admin");
  const [section, setSection] = useState<"posts" | "import" | "settings">("posts");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ContentPost["category"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ContentPost["status"]>("all");

  const loadPosts = useCallback(async () => {
    const data = await responseData(await fetch("/api/admin/posts", { cache: "no-store" }));
    setPosts(data.posts || []);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/auth", { cache: "no-store" })
      .then(responseData)
      .then(async (data) => {
        if (!active) return;
        setBackend(data.backend || "local");
        setAuthMode(data.authMode || "password");
        if (data.authMode === "supabase") setCredentials({ username: "", password: "" });
        if (!data.configured) {
          setSetupIssue("admin");
          return setScreen("unconfigured");
        }
        if (data.backend === "supabase" && !data.backendConfigured) {
          setSetupIssue("supabase");
          return setScreen("unconfigured");
        }
        if (!data.authenticated) return setScreen("login");
        setScreen("dashboard");
        await loadPosts();
      })
      .catch((caught: Error) => {
        if (active) {
          setError(caught.message);
          setScreen("login");
        }
      });
    return () => { active = false; };
  }, [loadPosts]);

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  function startNewPost() {
    clearFeedback();
    setEditingId(null);
    setForm({ ...blankForm, publishedAt: dateTimeInputValue(new Date().toISOString()) });
    setEditorOpen(true);
  }

  function editPost(post: ContentPost) {
    clearFeedback();
    setEditingId(post.id);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      category: post.category,
      status: post.status,
      image: post.image,
      externalUrl: post.externalUrl,
      publishedAt: dateTimeInputValue(post.publishedAt),
    });
    setEditorOpen(true);
  }

  function startManualPost(url: string) {
    clearFeedback();
    setSection("posts");
    setEditingId(null);
    setForm({ ...blankForm, externalUrl: url, publishedAt: dateTimeInputValue(new Date().toISOString()) });
    setEditorOpen(true);
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    clearFeedback();
    setBusy(true);
    try {
      await responseData(await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials) }));
      setCredentials((current) => ({ ...current, password: "" }));
      setScreen("dashboard");
      await loadPosts();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setPosts([]);
    setScreen("login");
  }

  async function savePost(event: FormEvent) {
    event.preventDefault();
    clearFeedback();
    setBusy(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const data = await responseData(await fetch("/api/admin/posts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId || undefined }),
      }));
      await loadPosts();
      const savedStatus = data.post?.status || form.status;
      setMessage(savedStatus === "published"
        ? `เผยแพร่ “${data.post?.title || form.title}” แล้ว หน้าเว็บไซต์อัปเดตทันที`
        : `บันทึก “${data.post?.title || form.title}” เป็นฉบับร่างแล้ว ข่าวจะยังไม่แสดงบนหน้าเว็บไซต์`);
      setEditorOpen(false);
      setEditingId(null);
      setForm(blankForm);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function removePost(post: ContentPost) {
    if (!window.confirm(`ลบ “${post.title}” ใช่หรือไม่?`)) return;
    clearFeedback();
    setBusy(true);
    try {
      await responseData(await fetch("/api/admin/posts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id }) }));
      await loadPosts();
      setMessage("ลบเนื้อหาแล้ว");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ลบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    clearFeedback();
    setUploading(true);
    try {
      const upload = new FormData();
      upload.append("file", file);
      const data = await responseData(await fetch("/api/admin/upload", { method: "POST", body: upload }));
      setForm((current) => ({ ...current, image: data.url || "" }));
      setMessage("อัปโหลดภาพแล้ว");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  const normalizedQuery = query.trim().toLocaleLowerCase("th");
  const filteredPosts = posts.filter((post) => {
    const matchesQuery = !normalizedQuery || `${post.title} ${post.excerpt}`.toLocaleLowerCase("th").includes(normalizedQuery);
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  if (screen === "loading") {
    return <main className="grid min-h-screen place-items-center bg-slate-950 text-white"><div className="text-center"><LoaderCircle className="mx-auto animate-spin" size={34} /><p className="mt-4 text-sm text-slate-300">กำลังตรวจสอบระบบผู้ดูแล</p></div></main>;
  }

  if (screen === "unconfigured") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
        <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl">
          <ShieldCheck className="text-sky-300" size={42} />
          <h1 className="mt-5 text-3xl font-bold">{setupIssue === "supabase" ? "ตั้งค่า Supabase ให้ครบก่อนใช้งาน" : "ตั้งค่าผู้ดูแลก่อนใช้งาน"}</h1>
          <p className="mt-3 leading-7 text-slate-300">เพิ่มตัวแปรต่อไปนี้ในไฟล์ <code className="rounded bg-black/30 px-2 py-1 text-sky-200">.env.local</code> แล้วเริ่มเซิร์ฟเวอร์ใหม่</p>
          {setupIssue === "supabase" ? (
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/35 p-5 text-sm leading-7 text-sky-100">CMS_BACKEND=supabase{"\n"}NEXT_PUBLIC_SUPABASE_URL=https://…supabase.co{"\n"}SUPABASE_SECRET_KEY=sb_secret_…</pre>
          ) : (
            authMode === "supabase" ? (
              <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/35 p-5 text-sm leading-7 text-sky-100">ADMIN_AUTH_MODE=supabase{"\n"}ADMIN_EMAIL_ALLOWLIST=admin@example.ac.th{"\n"}NEXT_PUBLIC_SUPABASE_URL=https://…supabase.co{"\n"}NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…</pre>
            ) : (
              <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/35 p-5 text-sm leading-7 text-sky-100">ADMIN_USERNAME=admin{"\n"}ADMIN_PASSWORD=รหัสผ่านอย่างน้อย-8-ตัว{"\n"}ADMIN_SESSION_SECRET=สุ่มข้อความยาวอย่างน้อย-32-ตัว</pre>
            )
          )}
          <a href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-white"><ChevronLeft size={16} />กลับหน้าเว็บไซต์</a>
        </section>
      </main>
    );
  }

  if (screen === "login") {
    return (
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#2476a8_0,#102a3c_42%,#07141d_100%)] p-6">
        <form onSubmit={login} className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
          <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-academic-navy)] text-white"><BookOpenText size={25} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">ITECH NPU CMS</p><h1 className="text-2xl font-bold text-slate-900">เข้าสู่ระบบผู้ดูแล</h1></div></div>
          <p className="mt-6 text-sm leading-6 text-slate-500">จัดการข่าว ประกาศ งาน ทุนการศึกษา และกิจกรรมของคณะ</p>
          <label className="mt-6 block text-sm font-semibold text-slate-700">{authMode === "supabase" ? "อีเมลผู้ดูแล" : "ชื่อผู้ใช้"}<input type={authMode === "supabase" ? "email" : "text"} value={credentials.username} onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))} autoComplete="username" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500" /></label>
          <label className="mt-4 block text-sm font-semibold text-slate-700">รหัสผ่าน<input type="password" value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} autoComplete="current-password" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500" /></label>
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-academic-navy)] px-5 py-3.5 font-semibold text-white transition hover:bg-[var(--color-academic-navy-light)] disabled:opacity-50">{busy ? <LoaderCircle className="animate-spin" size={18} /> : <ShieldCheck size={18} />}เข้าสู่ระบบ</button>
          <a href="/" className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ChevronLeft size={15} />กลับหน้าเว็บไซต์</a>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-academic-navy)] text-white"><BookOpenText size={22} /></span><div><h1 className="font-bold text-slate-900">ระบบจัดการเนื้อหา</h1><p className="text-xs text-slate-400">คณะเทคโนโลยีอุตสาหกรรม · {backend === "supabase" ? "Supabase" : "Local"}</p></div></div>
          <div className="flex items-center gap-2"><a href="/" target="_blank" className="hidden rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:block">ดูเว็บไซต์</a><button onClick={logout} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-600" aria-label="ออกจากระบบ"><LogOut size={19} /></button></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8 lg:py-8">
        <aside className="self-start rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">จัดการ</p>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="เมนูระบบจัดการ">
            <button type="button" onClick={() => setSection("posts")} className={`flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${section === "posts" ? "bg-[var(--color-academic-navy)] text-white" : "text-slate-600 hover:bg-slate-50"}`}><Newspaper size={18} />ข่าวและบทความ</button>
            <button type="button" onClick={() => setSection("import")} className={`flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${section === "import" ? "bg-[var(--color-academic-navy)] text-white" : "text-slate-600 hover:bg-slate-50"}`}><RefreshCw size={18} />Facebook / RSS</button>
            <button type="button" onClick={() => setSection("settings")} className={`flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${section === "settings" ? "bg-[var(--color-academic-navy)] text-white" : "text-slate-600 hover:bg-slate-50"}`}><Settings2 size={18} />ข้อมูลเว็บไซต์</button>
          </nav>
          <div className="mt-3 hidden border-t border-slate-100 px-3 pt-4 lg:block"><p className="text-xs leading-5 text-slate-400">ข่าวที่นำเข้าจะเป็นฉบับร่าง เพื่อให้ตรวจสอบก่อนเผยแพร่</p><a href="/feed.xml" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-orange-700"><Globe2 size={14} />เปิด RSS เว็บไซต์</a></div>
        </aside>

        <section className="min-w-0">
        {section === "posts" && <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-sky-700">WORDPRESS-STYLE NEWS CMS</p><h2 className="mt-1 text-3xl font-bold text-slate-900">ข่าวและบทความ</h2><p className="mt-2 text-slate-500">{posts.length} รายการ · เผยแพร่ {posts.filter((post) => post.status === "published").length} · ฉบับร่าง {posts.filter((post) => post.status === "draft").length}</p></div><button onClick={startNewPost} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-academic-gold-dark)] px-5 py-3 font-semibold text-white shadow-sm hover:bg-[var(--color-academic-gold)]"><Plus size={18} />เขียนข่าวใหม่</button></div>

        {(message || error) && <div className={`mt-6 flex items-center justify-between gap-4 rounded-xl p-4 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}><span className="flex items-center gap-2">{error ? <X size={17} /> : <Check size={17} />}{error || message}</span><button onClick={clearFeedback} aria-label="ปิดข้อความ"><X size={16} /></button></div>}

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_180px]">
          <label className="relative"><span className="sr-only">ค้นหาข่าว</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อข่าวหรือคำโปรย" className="w-full rounded-xl border border-slate-200 py-3 pl-4 pr-10 text-sm outline-none focus:border-sky-500" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /></label>
          <select aria-label="กรองตามหมวด" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as typeof categoryFilter)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500"><option value="all">ทุกหมวด</option>{contentCategories.map((category) => <option key={category} value={category}>{categoryLabels[category]}</option>)}</select>
          <select aria-label="กรองตามสถานะ" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500"><option value="all">ทุกสถานะ</option><option value="published">เผยแพร่</option><option value="draft">ฉบับร่าง</option></select>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filteredPosts.length === 0 ? (
            <div className="px-6 py-20 text-center"><BookOpenText className="mx-auto text-slate-300" size={42} /><h3 className="mt-4 text-lg font-bold text-slate-700">ยังไม่มีเนื้อหาในระบบ</h3><p className="mt-2 text-sm text-slate-400">เริ่มสร้างข่าวหรือประกาศรายการแรกได้เลย</p><button onClick={startNewPost} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-50 px-5 py-3 font-semibold text-sky-800"><Plus size={17} />เพิ่มเนื้อหา</button></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPosts.map((post) => (
                <article key={post.id} className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">{categoryLabels[post.category]}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${post.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{post.status === "published" ? "เผยแพร่" : "ฉบับร่าง"}</span></div><h3 className="mt-3 truncate text-lg font-bold text-slate-900">{post.title}</h3><p className="mt-1 text-sm text-slate-400">แก้ไขล่าสุด {new Date(post.updatedAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</p></div>
                  <div className="flex shrink-0 items-center gap-2"><button onClick={() => editPost(post)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"><Pencil size={16} />แก้ไข</button><button disabled={busy} onClick={() => removePost(post)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600" aria-label={`ลบ ${post.title}`}><Trash2 size={17} /></button></div>
                </article>
              ))}
            </div>
          )}
        </div>
        </>}

        {section === "import" && <SocialImportPanel onImported={loadPosts} onManualCreate={startManualPost} onOpenSettings={() => setSection("settings")} />}
        {section === "settings" && <AdminSettingsPanel />}
        </section>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6">
          <form onSubmit={savePost} className="mx-auto my-4 max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7"><div><p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Editor</p><h2 className="text-xl font-bold text-slate-900">{editingId ? "แก้ไขเนื้อหา" : "เพิ่มเนื้อหาใหม่"}</h2></div><button type="button" onClick={() => setEditorOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="ปิดตัวแก้ไข"><X size={20} /></button></div>
            <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_300px]">
              <div className="space-y-5">
                <label className="block text-sm font-semibold text-slate-700">ชื่อเรื่อง *<input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-semibold outline-none focus:border-sky-500" placeholder="ชื่อข่าวหรือประกาศ" /></label>
                <label className="block text-sm font-semibold text-slate-700">คำโปรย<textarea value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} rows={3} className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 font-normal leading-7 outline-none focus:border-sky-500" placeholder="สรุปเนื้อหาแบบสั้นสำหรับหน้ารวม" /></label>
                <label className="block text-sm font-semibold text-slate-700">เนื้อหา<textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} rows={13} className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 font-normal leading-8 outline-none focus:border-sky-500" placeholder="พิมพ์รายละเอียดเนื้อหาที่นี่…" /></label>
                <label className="block text-sm font-semibold text-slate-700">ลิงก์ภายนอก (ถ้ามี)<input type="url" value={form.externalUrl} onChange={(event) => setForm((current) => ({ ...current, externalUrl: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-sky-500" placeholder="https://…" /></label>
              </div>

              <aside className="space-y-5">
                <div className="rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-slate-800">การเผยแพร่</h3><label className="mt-4 block text-sm font-semibold text-slate-600">สถานะ<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ContentPostInput["status"] }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-sky-500"><option value="published">เผยแพร่บนเว็บไซต์</option><option value="draft">ฉบับร่าง (ยังไม่แสดง)</option></select></label><p className={`mt-2 text-xs leading-5 ${form.status === "published" ? "text-emerald-700" : "text-amber-700"}`}>{form.status === "published" ? "ข่าวจะแสดงบนหน้าแรกและหน้าข่าวทันทีหลังบันทึก" : "ฉบับร่างจะเห็นเฉพาะในระบบผู้ดูแล"}</p><label className="mt-4 block text-sm font-semibold text-slate-600">วันที่เผยแพร่<input required type="datetime-local" value={form.publishedAt} onChange={(event) => setForm((current) => ({ ...current, publishedAt: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-sky-500" /></label></div>
                <div className="rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-slate-800">หมวดเนื้อหา</h3><select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ContentPostInput["category"] }))} className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-sky-500">{contentCategories.map((category) => <option key={category} value={category}>{categoryLabels[category]}</option>)}</select></div>
                <div className="rounded-2xl border border-slate-200 p-5"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-800">ภาพหน้าปก</h3>{form.image && <button type="button" onClick={() => setForm((current) => ({ ...current, image: "" }))} className="text-xs font-semibold text-red-500">นำออก</button>}</div>{form.image ? <div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-slate-100"><Image src={form.image} alt="ตัวอย่างภาพหน้าปก" fill sizes="300px" className="object-cover" /></div> : <div className="mt-4 grid aspect-video place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400"><FileImage size={30} /></div>}<label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 hover:bg-sky-100">{uploading ? <LoaderCircle className="animate-spin" size={17} /> : <Upload size={17} />}{uploading ? "กำลังอัปโหลด" : "เลือกภาพ"}<input disabled={uploading} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => uploadImage(event.target.files?.[0])} className="sr-only" /></label><p className="mt-2 text-center text-xs text-slate-400">JPG, PNG, WebP หรือ GIF ไม่เกิน 5 MB</p></div>
              </aside>
            </div>
            {error && <p role="alert" className="mx-5 mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:mx-7">{error}</p>}
            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7"><button type="button" onClick={() => setEditorOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600">ยกเลิก</button><button disabled={busy || uploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-academic-navy)] px-6 py-3 font-semibold text-white hover:bg-[var(--color-academic-navy-light)] disabled:opacity-50">{busy ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}บันทึกเนื้อหา</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
