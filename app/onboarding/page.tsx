"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CakraMark } from "@/components/CakraMark";
import { CityInput } from "@/components/CityInput";
import { auth, db, rpc, toWaE164 } from "@/lib/supabase";

type FType = "text" | "email" | "tel" | "password" | "textarea" | "choice" | "multi" | "theme" | "font" | "domain" | "social" | "city";
type Field = { id: string; label: string; type: FType; ph?: string; optional?: boolean; options?: string[] };
type Page = { section: string; title: string; sub?: string; fields: Field[] };

const PAGES: Page[] = [
  {
    section: "Tentang Anda", title: "Kenalan dulu, yuk.", sub: "Data dasar untuk profil dan tombol kontak Anda.",
    fields: [
      { id: "nama", label: "Nama lengkap", type: "text", ph: "mis. Andi Pratama" },
      { id: "wa", label: "Nomor WhatsApp", type: "tel", ph: "08xx-xxxx-xxxx" },
      { id: "email", label: "Email", type: "email", ph: "anda@email.com" },
      { id: "password", label: "Kata sandi (untuk masuk nanti)", type: "password", ph: "Minimal 6 karakter" },
      { id: "kota", label: "Kota / area utama", type: "city", ph: "Ketik kota — mis. Denpasar, Bali" },
    ],
  },
  {
    section: "Brand Anda", title: "Bagaimana Anda ingin dikenal?", sub: "Ini yang tampil besar di website Anda.",
    fields: [
      { id: "brand", label: "Nama brand atau nama tampilan", type: "text", ph: "mis. Andi Pratama Property" },
      { id: "tagline", label: "Tagline singkat (opsional)", type: "text", ph: "mis. Properti tepercaya di Bali", optional: true },
      { id: "pengalaman", label: "Pengalaman sebagai agen", type: "choice", options: ["< 2 tahun", "2–5 tahun", "5–10 tahun", "10+ tahun"] },
      { id: "tahun_mulai", label: "Tahun mulai berkarier di properti (opsional)", type: "text", ph: "mis. 2015", optional: true },
      { id: "keunggulan", label: "Apa yang membuat Anda berbeda? (opsional)", type: "multi", optional: true, options: ["Respons cepat", "Jaringan luas", "Ahli legalitas", "Negosiator ulung", "Paham area lokal", "Layanan personal", "Portofolio premium"] },
      { id: "bio_cerita", label: "Ceritakan singkat tentang Anda — kenapa properti? (opsional)", type: "textarea", ph: "Latar belakang, pendekatan, dan kenapa klien memercayai Anda…", optional: true },
    ],
  },
  {
    section: "Keahlian & pasar", title: "Apa keahlian Anda?", sub: "Agar listing dan konten Anda tepat sasaran.",
    fields: [
      { id: "spesialisasi", label: "Spesialisasi (pilih satu atau lebih)", type: "multi", options: ["Rumah", "Apartemen", "Tanah", "Vila", "Komersial", "Sewa"] },
      { id: "layanan", label: "Layanan yang Anda tawarkan", type: "multi", options: ["Jual", "Sewa", "Investasi & konsultasi", "Legal & serah terima", "Manajemen properti"] },
      { id: "area", label: "Area layanan", type: "text", ph: "mis. Canggu, Seminyak, Ubud" },
      { id: "harga", label: "Rentang harga properti", type: "choice", options: ["< Rp 1 M", "Rp 1–3 M", "Rp 3–10 M", "Rp 10 M+", "Beragam"] },
      { id: "pembeli_asing", label: "Melayani pembeli asing / ekspat?", type: "choice", options: ["Ya", "Tidak"] },
      { id: "bahasa_lisan", label: "Bahasa yang Anda kuasai (opsional)", type: "multi", optional: true, options: ["Indonesia", "English", "Mandarin", "Jepang", "Korea"] },
    ],
  },
  {
    section: "Tampilan website", title: "Pilih gayanya.", sub: "Bisa Anda ubah kapan saja nanti.",
    fields: [
      { id: "theme", label: "Nuansa warna", type: "theme" },
      { id: "font", label: "Gaya huruf", type: "font" },
      { id: "mood", label: "Mood tampilan", type: "choice", options: ["Elegan & tenang", "Berani & modern", "Hangat & personal"] },
    ],
  },
  {
    section: "Alamat & bahasa", title: "Alamat website Anda.", sub: "Di subdomain cakra — bisa pakai domain sendiri nanti.",
    fields: [
      { id: "domain", label: "Alamat website", type: "domain", ph: "namaanda" },
      { id: "bahasa", label: "Bahasa website (dwibahasa ID + EN didukung penuh)", type: "choice", options: ["Indonesia", "English", "Keduanya (ID + EN)"] },
    ],
  },
  {
    section: "Kehadiran & konten", title: "Sambungkan kehadiran Anda.", sub: "Untuk ditautkan di website Anda.",
    fields: [
      { id: "social", label: "Akun sosial (opsional, tanpa @)", type: "social", optional: true },
      { id: "google_business", label: "Link Google Business Profile (opsional — bagus untuk SEO lokal)", type: "text", ph: "https://g.page/…", optional: true },
      { id: "alamat_kantor", label: "Alamat kantor / basis operasi (opsional)", type: "text", ph: "mis. Jl. Sunset Road No. 8, Kuta", optional: true },
      { id: "jam_operasional", label: "Jam operasional (opsional)", type: "text", ph: "mis. Sen–Sab, 09.00–18.00", optional: true },
      { id: "listing", label: "Sudah punya listing untuk ditampilkan?", type: "choice", options: ["Ya, banyak", "Beberapa", "Belum ada"] },
    ],
  },
  {
    section: "Tujuan Anda", title: "Apa yang ingin Anda capai?", sub: "Ini membantu kami menyusun prioritas Anda.",
    fields: [
      { id: "tujuan", label: "Tujuan utama (pilih semua yang penting)", type: "multi", options: ["Lebih banyak lead", "Brand yang kuat", "Ditemukan di Google & AI", "Konten lebih efisien", "Reputasi terukur"] },
      { id: "target", label: "Target penjualan per bulan", type: "choice", options: ["< Rp 500 jt", "Rp 500 jt – 1 M", "Rp 1–5 M", "Rp 5 M+"] },
      { id: "kanal", label: "Kanal utama Anda saat ini", type: "choice", options: ["Marketplace", "Media sosial", "Referral", "Website sendiri"] },
    ],
  },
  {
    section: "Terakhir", title: "Hampir selesai!", sub: "Tambahkan sentuhan akhir, lalu kami rangkai website Anda.",
    fields: [
      { id: "sertifikasi", label: "Lisensi / sertifikasi / brokerage (opsional — mis. AREBI)", type: "text", ph: "mis. Bersertifikat AREBI", optional: true },
      { id: "testimoni", label: "Testimoni klien nyata (opsional — nama · peran · kutipan, satu per baris)", type: "textarea", ph: "Budi · Investor · “Prosesnya cepat & transparan.”", optional: true },
      { id: "catatan", label: "Ada permintaan khusus? (opsional)", type: "textarea", ph: "Ceritakan di sini…", optional: true },
    ],
  },
];

const PALETTES = [
  { id: "earthy", name: "Earthy Lux", sw: ["#F7F2E9", "#A9762B", "#2C6355", "#211A11"] },
  { id: "coastal", name: "Coastal Calm", sw: ["#F2F6F6", "#357482", "#B0812F", "#1E2A2E"] },
  { id: "noir", name: "Modern Noir", sw: ["#17130D", "#CBA35A", "#DACCAE", "#8C6120"] },
  { id: "terracotta", name: "Warm Terracotta", sw: ["#FBF1E8", "#B0503A", "#5E8850", "#3B3020"] },
  { id: "slate", name: "Slate Modern", sw: ["#EEF1F5", "#2E4A6B", "#7A9CC6", "#1B2430"] },
  { id: "olive", name: "Olive Grove", sw: ["#F3F2E8", "#5E7346", "#C08A3E", "#2A2A1E"] },
];

const FONTS = [
  { id: "elegan", name: "Elegan", roles: "Playfair · Manrope · JetBrains · Dancing", fam: "'Playfair Display', var(--font-display), Georgia, serif", weight: 600 },
  { id: "modern", name: "Modern", roles: "Sora · Inter · IBM Plex · Caveat", fam: "var(--font-sans), system-ui, sans-serif", weight: 800 },
  { id: "klasik", name: "Klasik", roles: "Fraunces · Work Sans · Space Mono · Kalam", fam: "Georgia, 'Times New Roman', serif", weight: 700 },
];

const GEN_STEPS = ["Menyiapkan website Anda…", "Menata listing & halaman…", "Mengoptimasi SEO & GEO…", "Menyalakan skor kehadiran…"];

export default function Onboarding() {
  const [phase, setPhase] = useState<"welcome" | "form" | "generating" | "done">("welcome");
  const [pageIdx, setPageIdx] = useState(0);
  const [ans, setAns] = useState<Record<string, string | string[]>>({});
  const [genStep, setGenStep] = useState(0);
  const [obErr, setObErr] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  // Onboarding creates the account + session, which must be same-origin as the dashboard.
  // The member app lives on member.cakra.xyz, so bounce there from the marketing origin.
  useEffect(() => {
    try {
      const h = window.location.hostname;
      if (h === "cakra.xyz" || h === "www.cakra.xyz") { setRedirecting(true); window.location.replace("https://member.cakra.xyz/onboarding"); }
    } catch {}
  }, []);

  // Live subdomain availability check (debounced) with alternative suggestions when taken.
  const [domStatus, setDomStatus] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const [domSug, setDomSug] = useState<string[]>([]);
  useEffect(() => {
    const sub = String(ans.domain || "").trim().toLowerCase();
    if (sub.length < 3) { setDomStatus("idle"); setDomSug([]); return; }
    let alive = true; setDomStatus("checking"); setDomSug([]);
    const t = setTimeout(async () => {
      try {
        const ok = await rpc("subdomain_available", { p_sub: sub });
        if (!alive) return;
        if (ok === true) { setDomStatus("ok"); return; }
        setDomStatus("taken");
        const cands = [`${sub}property`, `${sub}-realty`, `${sub}bali`, `agen-${sub}`, `${sub}${(sub.length % 9) + 1}`];
        const free: string[] = [];
        for (const c of cands) { try { if (await rpc("subdomain_available", { p_sub: c })) free.push(c); } catch {} if (free.length >= 3) break; }
        if (alive) setDomSug(free);
      } catch { if (alive) setDomStatus("idle"); }
    }, 500);
    return () => { alive = false; clearTimeout(t); };
  }, [ans.domain]);

  const strOr = (v: string | string[] | undefined) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const splitList = (v: string | string[] | undefined) => String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
  const TONE_MAP: Record<string, string> = { "Elegan & tenang": "lux", "Berani & modern": "professional", "Hangat & personal": "relax" };
  const LANG_MAP: Record<string, string> = { Indonesia: "id", English: "en", "Keduanya (ID + EN)": "id-en" };
  const profileFromAns = () => {
    const rest: Record<string, string | string[]> = { ...ans }; delete rest.password;
    return {
      name: strOr(ans.nama), brand: strOr(ans.brand) || strOr(ans.nama), tagline: strOr(ans.tagline), whatsapp: toWaE164(strOr(ans.wa) || "") || null,
      city: strOr(ans.kota), areas: splitList(ans.area), specializations: Array.isArray(ans.spesialisasi) ? ans.spesialisasi : [],
      price_band: strOr(ans.harga), target: strOr(ans.target), language: LANG_MAP[String(ans.bahasa)] || "id",
      tone: TONE_MAP[String(ans.mood)] || "normal", palette: strOr(ans.theme), font: strOr(ans.font), subdomain: strOr(ans.domain),
      onboarding: rest, // full rich answer set for the AI advertorial generator
    };
  };
  const previewHref = () => {
    try {
      const pal = PALETTES.find((p) => p.id === ans.theme) || PALETTES[1];
      const uid = auth.getSession()?.user?.id;
      const cfg = { aid: uid, exp: Date.now() + 7 * 24 * 60 * 60 * 1000, brand: strOr(ans.brand) || strOr(ans.nama) || "cakra", col: { bg: pal.sw[0], em: pal.sw[1], go: pal.sw[2], ink: pal.sw[3] }, soc: { wa: toWaE164(strOr(ans.wa) || ""), ig: strOr(ans.ig), tt: strOr(ans.tiktok), fb: strOr(ans.fb) } };
      return `https://cakra.xyz/demo#site=${btoa(encodeURIComponent(JSON.stringify(cfg)))}`;
    } catch { return "https://cakra.xyz/demo"; }
  };

  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    let t: "light" | "dark" = "light";
    try { const s = localStorage.getItem("cakra-theme"); t = s === "dark" || s === "light" ? s : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; } catch {}
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);
  const toggleTheme = () => { const n = theme === "dark" ? "light" : "dark"; setTheme(n); document.documentElement.setAttribute("data-theme", n); try { localStorage.setItem("cakra-theme", n); } catch {} };
  const themeToggleBtn = (variant: "photo" | "solid") => (
    <button type="button" onClick={toggleTheme} aria-label="Ganti tema terang / gelap" className={variant === "photo" ? "btn btn-on-photo" : undefined} style={variant === "photo" ? { width: 40, height: 40, padding: 0, display: "grid", placeItems: "center", borderRadius: 10 } : { width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 10, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>
      {theme === "dark"
        ? <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4 11a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2h2Zm18 0a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2ZM5.6 4.2 7 5.6A1 1 0 0 1 5.6 7L4.2 5.6a1 1 0 0 1 1.4-1.4Zm12.8 12.8 1.4 1.4a1 1 0 0 1-1.4 1.4L17 18.4a1 1 0 0 1 1.4-1.4ZM7 18.4 5.6 19.8a1 1 0 0 1-1.4-1.4L5.6 17A1 1 0 0 1 7 18.4ZM19.8 4.2a1 1 0 0 1 0 1.4L18.4 7A1 1 0 0 1 17 5.6l1.4-1.4a1 1 0 0 1 1.4 0Z" /></svg>
        : <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>}
    </button>
  );

  const page = PAGES[pageIdx];
  const setVal = (id: string, v: string | string[]) => setAns((p) => ({ ...p, [id]: v }));
  const isFilled = (f: Field) => {
    if (f.optional || f.type === "social") return true;
    const v = ans[f.id];
    if (f.type === "multi") return Array.isArray(v) && v.length > 0;
    const str = typeof v === "string" ? v.trim() : "";
    if (!str) return false;
    if (f.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);         // valid email before proceeding
    if (f.type === "password") return str.length >= 6;                            // min length before proceeding
    return true;
  };
  // Block Next until the chosen subdomain is confirmed available (not merely "not yet taken"),
  // so the done screen never advertises a subdomain that was silently dropped on collision.
  const domainOk = !page?.fields.some((f) => f.type === "domain") || domStatus === "ok";
  const canNext = (page ? page.fields.every(isFilled) : true) && domainOk;

  const next = () => { if (!canNext) return; if (pageIdx === PAGES.length - 1) setPhase("generating"); else setPageIdx(pageIdx + 1); };
  const back = () => { if (pageIdx === 0) setPhase("welcome"); else setPageIdx(pageIdx - 1); };

  // Real work behind the "generating" animation: create the account + save the profile from answers.
  useEffect(() => {
    if (phase !== "generating") return;
    let alive = true;
    setGenStep(0); setObErr(null);
    const iv = setInterval(() => setGenStep((g) => Math.min(g + 1, GEN_STEPS.length - 1)), 750);
    (async () => {
      const minDelay = new Promise((r) => setTimeout(r, GEN_STEPS.length * 750 + 400));
      try {
        const s = await auth.signUp(String(ans.email || "").trim(), String(ans.password || ""));
        const uid = s?.user?.id || auth.getSession()?.user?.id;
        if (uid) {
          const base: any = profileFromAns();
          try { await db("profiles", { method: "PATCH", query: `id=eq.${uid}`, body: base }); }
          catch { delete base.subdomain; try { await db("profiles", { method: "PATCH", query: `id=eq.${uid}`, body: base }); } catch {} }
        }
        await minDelay;
        if (alive) setPhase("done");
      } catch (e: any) {
        await minDelay.catch(() => {});
        if (alive) { setObErr(e?.message || "Gagal membuat akun — email mungkin sudah terpakai."); setPhase("form"); setPageIdx(0); }
      }
    })();
    return () => { clearInterval(iv); alive = false; };
  }, [phase]);

  const domain = (ans.domain as string) || "namaanda";

  if (redirecting) return <div style={{ position: "fixed", inset: 0, background: "var(--bg)" }} />;

  /* ── WELCOME (full-bleed) ── */
  if (phase === "welcome")
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 100, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-top.webp" alt="Vila properti mewah saat golden hour" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="photo-scrim" />
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <CakraMark size={38} />
            <span className="hand on-photo" style={{ fontSize: "2.2rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {themeToggleBtn("photo")}
            <Link href="/" aria-label="Keluar" className="btn btn-on-photo" style={{ width: 40, height: 40, padding: 0, display: "grid", placeItems: "center", borderRadius: 10 }}>✕</Link>
          </div>
        </div>
        <div style={{ position: "relative", flex: 1, display: "grid", placeItems: "center", padding: "10px 24px 72px", textAlign: "center" }}>
          <div style={{ maxWidth: "min(680px, 92vw)" }}>
            <p className="hand" style={{ color: "var(--brand)", fontSize: "1.9rem", transform: "rotate(-2deg)", margin: 0 }}>selamat datang</p>
            <h1 className="display on-photo" style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", fontWeight: 700, lineHeight: 1.06, margin: "6px 0 0" }}>Bangun presence Anda<br />dalam beberapa menit.</h1>
            <p className="on-photo-soft" style={{ fontSize: "1.15rem", margin: "18px auto 28px", lineHeight: 1.6, maxWidth: "46ch" }}>Isi 8 langkah singkat — kami rangkai website, listing, dan skor kehadiran Anda secara otomatis.</p>
            <button onClick={() => { setPhase("form"); setPageIdx(0); }} className="btn btn-brand" style={{ fontSize: "1.08rem", padding: "1rem 2.1rem" }}>Mulai →</button>
            <p className="on-photo-soft" style={{ fontSize: ".85rem", marginTop: 16 }}>± 3 menit · tanpa kartu kredit · situs Anda langsung jadi</p>
          </div>
        </div>
      </div>
    );

  const shell = (children: React.ReactNode, showProgress = true) => (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--bg)", display: "flex", flexDirection: "column", overflow: "auto" }}>
      <div style={{ height: 5, background: "var(--line)", flex: "none" }}>
        <div style={{ height: "100%", width: `${showProgress ? ((pageIdx + 1) / PAGES.length) * 100 : 100}%`, background: "var(--brand)", transition: "width .35s" }} />
      </div>
      <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "var(--ink)" }}>
          <CakraMark size={34} />
          <span className="hand" style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>
        </Link>
        {phase === "form" && <span className="mono" style={{ fontSize: ".8rem", color: "var(--muted)" }}>Langkah {pageIdx + 1}/8 · {page.section}</span>}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {themeToggleBtn("solid")}
          <Link href="/" aria-label="Keluar" style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 10, border: "1px solid var(--line-2)", color: "var(--ink)", textDecoration: "none" }}>✕</Link>
        </div>
      </div>
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "12px 24px 48px" }}>{children}</div>
    </div>
  );

  /* ── GENERATING ── */
  if (phase === "generating")
    return shell(
      <div style={{ maxWidth: "34ch", textAlign: "center" }}>
        <div className="spin" style={{ width: 56, height: 56, margin: "0 auto 22px", borderRadius: "50%", border: "3px solid var(--line)", borderTopColor: "var(--brand)" }} />
        <h2 className="display" style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>Membangun cakra Anda…</h2>
        <div style={{ marginTop: 20, display: "grid", gap: 10, textAlign: "left" }}>
          {GEN_STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", gap: 10, alignItems: "center", opacity: i <= genStep ? 1 : 0.4, transition: ".3s" }}>
              <span style={{ color: i < genStep ? "var(--good)" : "var(--brand)" }}>{i < genStep ? "✓" : "•"}</span>
              <span style={{ fontSize: "1rem" }}>{s}</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin .9s linear infinite}`}</style>
      </div>,
      false
    );

  /* ── DONE ── */
  if (phase === "done")
    return shell(
      <div className="ob-done" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(20px,3vw,40px)", width: "100%", maxWidth: "min(960px, 94vw)", alignItems: "stretch" }}>
        {/* LEFT — success */}
        <div style={{ textAlign: "left" }}>
          <div style={{ width: 60, height: 60, marginBottom: 16, borderRadius: "50%", display: "grid", placeItems: "center", background: "color-mix(in oklab, var(--good) 18%, var(--surface))", color: "var(--good)", fontSize: "1.8rem" }}>✓</div>
          <p className="hand gold" style={{ fontSize: "1.6rem", transform: "rotate(-2deg)", margin: 0 }}>website Anda siap</p>
          <h2 className="display" style={{ fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)", fontWeight: 700, margin: "4px 0 0" }}>Selamat, {String(ans.nama || "Agen").split(" ")[0]}!</h2>
          <div className="card" style={{ padding: "14px 18px", margin: "18px 0", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--good)" }} />
            <span className="mono" style={{ fontSize: ".95rem" }}>{domain}.cakra.xyz</span>
          </div>
          <p className="muted" style={{ margin: "0 0 22px", lineHeight: 1.6 }}>Draf website, halaman listing, dan skor kehadiran awal Anda sudah disiapkan. Tinjau lalu terbitkan.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={previewHref()} target="_blank" rel="noopener noreferrer" className="btn btn-brand" style={{ padding: ".9rem 1.6rem", fontSize: "1rem" }}>Lihat situs Anda ↗</a>
            <Link href="/admin" className="btn btn-ghost" style={{ padding: ".9rem 1.6rem", fontSize: "1rem" }}>Buka dashboard →</Link>
          </div>
          <p className="muted" style={{ fontSize: ".82rem", marginTop: 16 }}>Preview gratis aktif 7 hari — lalu dijeda hingga Anda berlangganan.</p>
        </div>
        {/* RIGHT — Pro paywall */}
        <div className="card" style={{ padding: "clamp(24px,3vw,34px)", background: "var(--surface-2)", borderColor: "color-mix(in oklab, var(--brand) 30%, var(--line))", display: "flex", flexDirection: "column", textAlign: "left" }}>
          <span className="pill" style={{ alignSelf: "flex-start", background: "color-mix(in oklab, var(--brand) 14%, var(--surface))", color: "var(--brand)", fontWeight: 700, fontSize: ".72rem", border: "none" }}>Upgrade ke Pro</span>
          <h3 className="display" style={{ fontSize: "clamp(1.5rem,2.6vw,2rem)", fontWeight: 700, margin: "12px 0 6px", lineHeight: 1.12 }}>Aktifkan situs Anda sepenuhnya.</h3>
          <p className="muted" style={{ fontSize: ".94rem", margin: "0 0 16px", lineHeight: 1.55 }}>Optimasi AI menulis ulang seluruh isi situs agar benar-benar sesuai persona &amp; lokasi Anda — plus listing asli, konten harian, dan Editor Studio.</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ textDecoration: "line-through", color: "var(--muted)", fontSize: "1.15rem", fontWeight: 600 }}>Rp 600rb</span>
            <span className="display" style={{ fontSize: "2.4rem", fontWeight: 700, color: "var(--brand)", lineHeight: 1 }}>Rp 300rb</span>
            <span className="muted" style={{ fontSize: ".9rem" }}>/bulan</span>
          </div>
          <p style={{ fontSize: ".8rem", color: "var(--good)", fontWeight: 600, margin: "6px 0 16px" }}>★ Penawaran spesial early access — hemat 50%</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "grid", gap: 10 }}>
            {["Optimasi AI penuh — SEO, GEO & social search", "12 listing live + testimoni & profil asli", "Editor Studio — 10 build video / bulan", "Konten harian otomatis — 2 per hari"].map((f) => (
              <li key={f} style={{ display: "flex", gap: 9, fontSize: ".92rem", lineHeight: 1.4 }}>
                <span style={{ color: "var(--brand)", flex: "none", fontWeight: 800 }}>✓</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/harga" className="btn btn-brand" style={{ marginTop: "auto", justifyContent: "center", padding: "1rem", fontSize: "1.05rem" }}>Langganan Pro →</Link>
          <p className="muted" style={{ fontSize: ".78rem", textAlign: "center", marginTop: 10 }}>Batalkan kapan saja · tanpa kontrak</p>
        </div>
        <style>{`@media (max-width: 760px){ .ob-done{ grid-template-columns:1fr !important; } }`}</style>
      </div>,
      false
    );

  /* ── FORM PAGE ── */
  const renderField = (f: Field) => {
    const v = ans[f.id];
    switch (f.type) {
      case "text": case "email": case "tel": case "password":
        return <input type={f.type} value={(v as string) || ""} placeholder={f.ph} onChange={(e) => setVal(f.id, e.target.value)} className="ob-input" />;
      case "city":
        return <CityInput value={(v as string) || ""} placeholder={f.ph} onChange={(val) => setVal(f.id, val)} />;
      case "textarea":
        return <textarea rows={3} value={(v as string) || ""} placeholder={f.ph} onChange={(e) => setVal(f.id, e.target.value)} className="ob-input" style={{ resize: "vertical", border: "1.5px solid var(--line-2)", borderRadius: 12, padding: "1rem 1.1rem", fontSize: "1.15rem" }} />;
      case "choice":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {f.options!.map((o) => <button key={o} type="button" className="ob-chip" data-on={v === o} onClick={() => setVal(f.id, o)}>{o}</button>)}
          </div>
        );
      case "multi":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {f.options!.map((o) => {
              const on = Array.isArray(v) && v.includes(o);
              return <button key={o} type="button" className="ob-chip" data-on={on} onClick={() => { const c = (v as string[]) || []; setVal(f.id, on ? c.filter((x) => x !== o) : [...c, o]); }}>{on ? "✓ " : ""}{o}</button>;
            })}
          </div>
        );
      case "theme":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            {PALETTES.map((p) => (
              <button key={p.id} type="button" onClick={() => setVal(f.id, p.id)} className="ob-opt" style={{ display: "block", padding: 14, borderColor: v === p.id ? "var(--brand)" : "var(--line-2)" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>{p.sw.map((c) => <span key={c} style={{ width: 26, height: 26, borderRadius: 7, background: c, border: "1px solid rgba(0,0,0,.08)" }} />)}</div>
                <div style={{ fontWeight: 600, fontSize: ".98rem" }}>{v === p.id ? "✓ " : ""}{p.name}</div>
              </button>
            ))}
          </div>
        );
      case "font":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {FONTS.map((ft) => (
              <button key={ft.id} type="button" onClick={() => setVal(f.id, ft.id)} className="ob-opt" style={{ display: "block", padding: 16, borderColor: v === ft.id ? "var(--brand)" : "var(--line-2)" }}>
                <div style={{ fontFamily: ft.fam, fontWeight: ft.weight, fontSize: "1.9rem", lineHeight: 1, marginBottom: 10, color: "var(--ink)" }}>Rumah Impian</div>
                <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{v === ft.id ? "✓ " : ""}{ft.name}</div>
                <div className="mono" style={{ fontSize: ".58rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginTop: 5 }}>Title · Body · Mono · Accent</div>
                <div style={{ fontSize: ".82rem", color: "var(--ink)", marginTop: 2 }}>{ft.roles}</div>
              </button>
            ))}
          </div>
        );
      case "domain":
        return (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, maxWidth: 520, borderBottom: `2px solid ${domStatus === "taken" ? "var(--crit)" : domStatus === "ok" ? "var(--good)" : "var(--line-2)"}` }}>
              <input value={(v as string) || ""} placeholder={f.ph} onChange={(e) => setVal(f.id, e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", padding: ".5rem .1rem", font: "inherit", fontSize: "1.4rem", color: "var(--ink)", outline: "none" }} />
              <span className="mono" style={{ fontSize: "1.1rem", color: "var(--muted)", whiteSpace: "nowrap" }}>.cakra.xyz</span>
            </div>
            <div style={{ minHeight: 24, marginTop: 10, fontSize: ".9rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {domStatus === "checking" && <span className="muted">Memeriksa ketersediaan…</span>}
              {domStatus === "ok" && <span style={{ color: "var(--good)", fontWeight: 700 }}>✓ Tersedia</span>}
              {domStatus === "taken" && <span style={{ color: "var(--crit)", fontWeight: 700 }}>✗ Sudah dipakai{domSug.length ? " — coba:" : ""}</span>}
              {domStatus === "taken" && domSug.map((s) => (
                <button key={s} type="button" onClick={() => setVal("domain", s)} className="ob-chip" style={{ fontSize: ".85rem", padding: ".35rem .8rem" }}>{s}</button>
              ))}
            </div>
          </div>
        );
      case "social":
        return (
          <div style={{ display: "grid", gap: 10, maxWidth: 480 }}>
            {[["ig", "Instagram"], ["tiktok", "TikTok"], ["fb", "Facebook"]].map(([k, label]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="muted" style={{ width: 92, fontSize: ".92rem" }}>{label}</span>
                <input value={(ans[k] as string) || ""} placeholder="username" onChange={(e) => setVal(k, e.target.value)} style={{ flex: 1, background: "var(--surface)", border: "1.5px solid var(--line-2)", borderRadius: 10, padding: ".6rem .9rem", font: "inherit", fontSize: "1rem", color: "var(--ink)" }} />
              </div>
            ))}
          </div>
        );
    }
  };

  return shell(
    <div key={pageIdx} style={{ width: "min(640px, 100%)", animation: "qin .35s ease" }}>
      <div className="mono gold" style={{ fontSize: ".82rem", marginBottom: 12 }}>{pageIdx + 1} → {PAGES.length}</div>
      <h2 className="display" style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, margin: 0 }}>{page.title}</h2>
      {page.sub && <p className="muted" style={{ marginTop: 8, fontSize: "1.05rem" }}>{page.sub}</p>}
      {obErr && <div style={{ marginTop: 16, fontSize: ".88rem", color: "var(--crit)", background: "color-mix(in oklab, var(--crit) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--crit) 30%, var(--line))", borderRadius: 10, padding: "10px 14px" }}>{obErr}</div>}

      <div style={{ marginTop: 28, display: "grid", gap: 24 }}>
        {page.fields.map((f) => (
          <div key={f.id}>
            <label className="ob-label">{f.label}</label>
            {renderField(f)}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 32 }}>
        <button onClick={next} disabled={!canNext} className="btn btn-brand" style={{ padding: ".85rem 1.8rem", fontSize: "1.02rem", opacity: canNext ? 1 : 0.5, cursor: canNext ? "pointer" : "not-allowed" }}>
          {pageIdx === PAGES.length - 1 ? "Buat website saya ✨" : "Lanjut →"}
        </button>
        <button onClick={back} className="btn btn-ghost" style={{ padding: ".8rem 1.3rem" }}>Kembali</button>
      </div>

      <style>{`
        @keyframes qin{ from{ opacity:0; transform:translateY(14px); } to{ opacity:1; transform:none; } }
        .ob-label{ display:block; font-size:.98rem; font-weight:600; color:var(--ink-2); margin-bottom:10px; }
        .ob-input{ width:100%; background:transparent; border:none; border-bottom:2px solid var(--line-2); border-radius:0; color:var(--ink); padding:.5rem .1rem; font:inherit; font-size:1.35rem; outline:none; transition:border-color .2s; }
        .ob-input::placeholder{ color:color-mix(in oklab, var(--muted) 55%, transparent); }
        .ob-input:focus{ border-bottom-color:var(--brand); }
        .ob-opt{ text-align:left; font:inherit; cursor:pointer; border-radius:12px; border:1.5px solid var(--line-2); color:var(--ink); background:var(--surface); transition:.15s; }
        .ob-opt:hover{ border-color:var(--brand); }
        .ob-chip{ font:inherit; font-size:1rem; font-weight:500; cursor:pointer; padding:.6rem 1.1rem; border-radius:999px; border:1.5px solid var(--line-2); background:var(--surface); color:var(--ink); transition:.15s; }
        .ob-chip:hover{ border-color:var(--brand); }
        .ob-chip[data-on="true"]{ border-color:var(--brand); background:color-mix(in oklab, var(--brand) 14%, var(--surface)); color:var(--brand); }
      `}</style>
    </div>
  );
}
