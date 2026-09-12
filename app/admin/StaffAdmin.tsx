"use client";
import { useEffect, useState } from "react";
import { rpc } from "@/lib/supabase";
import { AssetLibrary } from "@/components/AssetLibrary";
import { VoiceLibrary } from "@/components/VoiceLibrary";
import { MarketingScore } from "@/components/MarketingScore";
import { CakraMark } from "@/components/CakraMark";
import { ThemeToggle } from "@/components/ThemeToggle";

type Section = "dashboard" | "member" | "assets" | "listing" | "hub" | "editor" | "learning" | "marketing" | "llm" | "setting";

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" },
  { id: "member", label: "Member", icon: "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.7 0-6 1.3-6 4v3h8v-3c0-1 .4-1.9 1-2.6C7.9 13.1 6.9 13 8 13Zm8 0c-2.7 0-8 1.3-8 4v3h16v-3c0-2.7-5.3-4-8-4Z" },
  { id: "assets", label: "Assets", icon: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z" },
  { id: "listing", label: "Listing", icon: "M12 3 2.5 11H5v10h5v-6h4v6h5V11h2.5z" },
  { id: "hub", label: "Hub", icon: "M6 2h9l5 5v14.2A.8.8 0 0 1 19.2 22H6a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 6 2Zm2 9h8v1.8H8zm0 4h8v1.8H8z" },
  { id: "editor", label: "Editor setting", icon: "M4 20h4L18.5 9.5l-4-4L4 16v4ZM17 3.5l3.5 3.5 1.4-1.4a1.5 1.5 0 0 0 0-2.1L20.6 2.1a1.5 1.5 0 0 0-2.1 0L17 3.5Z" },
  { id: "learning", label: "Learning", icon: "M12 3 2 8l10 5 8-4v6h2V8L12 3ZM6 12.2V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.8l-6 3-6-3Z" },
  { id: "marketing", label: "Marketing", icon: "M3 3v18h18M7 14l3.5-3.5 3 3L21 7M21 7h-4M21 7v4" },
  { id: "llm", label: "LLM & API", icon: "M9 3h6v3h4v4h-3v4h3v4h-4v3H9v-3H5v-4h3v-4H5V6h4V3Zm2 8v2h2v-2h-2Z" },
  { id: "setting", label: "Setting", icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 4-2 .3a7 7 0 0 1-.5 1.3l1.2 1.7-1.4 1.4-1.7-1.2a7 7 0 0 1-1.3.5L14.3 20H9.7l-.3-2a7 7 0 0 1-1.3-.5l-1.7 1.2-1.4-1.4 1.2-1.7a7 7 0 0 1-.5-1.3L3 12l.3-2a7 7 0 0 1 .5-1.3L2.6 7 4 5.6l1.7 1.2A7 7 0 0 1 7 6.3L9.7 4h4.6l.3 2c.5.1.9.3 1.3.5l1.7-1.2L19 6.7l-1.2 1.7c.2.4.4.8.5 1.3L21 10v2Z" },
];

type ApiItem = { name: string; purpose: string; env: string; where: ("Vercel" | "Supabase")[]; ph?: string };
const API_KEYS: { group: string; items: ApiItem[] }[] = [
  { group: "Backend & infra", items: [
    { name: "Supabase URL", purpose: "Project URL", env: "NEXT_PUBLIC_SUPABASE_URL", where: ["Vercel"], ph: "https://xxxx.supabase.co" },
    { name: "Supabase anon key", purpose: "Kunci klien publik", env: "NEXT_PUBLIC_SUPABASE_ANON_KEY", where: ["Vercel"] },
    { name: "Supabase service role", purpose: "Rahasia server/edge", env: "SUPABASE_SERVICE_ROLE_KEY", where: ["Supabase"] },
  ] },
  { group: "Layer 1 — Riset (per kota, cached)", items: [
    { name: "Perplexity", purpose: "Riset & sumber · 20/15 base Sonar", env: "PERPLEXITY_API_KEY", where: ["Supabase"] },
    { name: "SerpAPI", purpose: "Pencarian sumber · 8/6 · free tier", env: "SERPAPI_API_KEY", where: ["Supabase"] },
    { name: "Firecrawl", purpose: "Scrape halaman · 34/25 basic · free tier", env: "FIRECRAWL_API_KEY", where: ["Supabase"] },
  ] },
  { group: "Layer 2–3 — Index & konten", items: [
    { name: "Gemini (Google AI Studio)", purpose: "Index Flash-Lite · Nano Banana 2 gambar (batch + real-time) · Kling 3 via Studio", env: "GEMINI_API_KEY", where: ["Supabase"] },
    { name: "Anthropic (Claude Sonnet)", purpose: "Komposisi konten · cron (MCP untuk interaktif)", env: "ANTHROPIC_API_KEY", where: ["Supabase"] },
    { name: "OpenAI (GPT)", purpose: "LLM alternatif / cadangan · GPT Image", env: "OPENAI_API_KEY", where: ["Supabase"] },
  ] },
  { group: "Proxy & scoring (marketing)", items: [
    { name: "Zernio proxy", purpose: "Proxy scraping social media & crawl pesaing untuk scoring", env: "ZERNIO_PROXY_API_KEY", where: ["Supabase"], ph: "zrn_••••••••" },
    { name: "Google PageSpeed", purpose: "Skor Lighthouse website (SEO/kecepatan/a11y) · kuota lebih tinggi", env: "PAGESPEED_API_KEY", where: ["Supabase"], ph: "AIza…" },
  ] },
  { group: "Email & analytics", items: [
    { name: "Resend", purpose: "Email transaksional + buletin", env: "RESEND_API_KEY", where: ["Supabase"] },
    { name: "GA4 Measurement ID", purpose: "Google Analytics", env: "NEXT_PUBLIC_GA_ID", where: ["Vercel"], ph: "G-XXXXXXXXXX" },
    { name: "Google Maps Places", purpose: "Autocomplete lokasi Web Builder · local SEO", env: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", where: ["Vercel"], ph: "AIza…" },
  ] },
  { group: "Media generation (gambar #4 · video #5)", items: [
    { name: "Nano Banana 2 (gambar)", purpose: "Batch in-house + real-time member · pakai kunci Gemini di atas", env: "GEMINI_API_KEY", where: ["Supabase"] },
    { name: "Kling 3 (video)", purpose: "Render video · API langsung + via Google AI Studio", env: "KLING_API_KEY", where: ["Supabase"] },
    { name: "ElevenLabs (voice)", purpose: "Voice karakter · 3 permanen per agen", env: "ELEVENLABS_API_KEY", where: ["Supabase"] },
  ] },
];
const whereColor = (w: string) => (w === "Vercel" ? "--c-eye" : "--c-throat");

const L1_PROMPT = `Anda adalah Senior CMO, Analis, dan Direktur Riset Pemasaran Digital untuk pasar properti Indonesia. Tugas: meriset & menganalisis pasar properti di {kota} secara ketat, objektif, dan jujur — untuk menemukan 2 topik terbaik hari ini.

Prinsip kerja (kaidah riset):
• FAKTA dulu — hanya klaim yang bisa diverifikasi; sertakan sumber (URL + tanggal). Jangan berspekulasi atau membesar-besarkan.
• TREN — arah pasar terkini: harga, permintaan, area naik daun, perilaku & pertanyaan pembeli, sinyal pencarian AI.
• KUALITAS — utamakan sumber tepercaya & data terbaru; buang informasi usang, duplikat, atau tak relevan.
• TIPE/KATEGORI — klasifikasikan temuan (primer/sekunder, hunian/komersial/tanah, segmen harga, sub-area).

Untuk tiap topik hasilkan JSON terstruktur: { judul, ringkasan_berbasis_fakta, benih_5w1h, angle_untuk_pembeli, target_kpi, kategori, sumber:[{url,tanggal}] }. Ringkas, objektif, tanpa hype.`;

const L2_PROMPT = `Anda adalah Senior Content Creator sekaligus Direktur SEO, GEO, dan CMO Pemasaran properti. Ubah paket riset (Lapis 1) menjadi konten siap terbit yang DIPERSONALISASI penuh untuk persona agen ini.

Persona agen (variabel): nama {name} · brand {brand} · gaya bahasa {tone} · area {areas} · produk/segmen {price_band} · audiens target {audience}.

Prinsip kerja:
• SUARA AGEN — tulis seolah agen sendiri yang menulis; jaga gaya bahasa & positioning-nya. Jangan pernah generik.
• SEO — struktur, judul, dan kata kunci lokal yang tepat sasaran untuk audiens {audience}.
• GEO — susun agar mudah dikutip mesin pencari AI: jawaban jelas & terstruktur, faktual, dengan entitas, lokasi, dan angka eksplisit.
• SOCIAL SEARCH — hook kuat, format sesuai platform.
• Ikuti kerangka 5W+1H dan capai target KPI dari Lapis 1.

Output: konten final (judul + isi) + perkiraan skor SEO/GEO/Social + catatan singkat cara memaksimalkannya. Bahasa Indonesia, profesional, hangat, meyakinkan — dan selalu akurat (klaim harus benar, foto tidak menyesatkan).`;

// Flatten a content jsonb piece into copy-ready text so cakra can grab it for its own channels.
function contentText(c: any): string {
  if (!c) return "";
  if (typeof c === "string") return c;
  const tags = Array.isArray(c.hashtags) ? c.hashtags.map((h: string) => (h.startsWith("#") ? h : "#" + h)).join(" ") : c.hashtags;
  const parts = [c.hook, c.caption, c.body, c.script, tags].filter(Boolean);
  return parts.length ? parts.join("\n\n") : JSON.stringify(c, null, 2);
}
const SLOT_LABEL: Record<number, string> = { 1: "Feed · IG/FB/Blog", 2: "Vertikal · Story/Reels/TikTok" };
function Ic({ d }: { d: string }) { return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d={d} /></svg>; }
function stColor(st: string) { return st === "Aktif" ? "var(--good)" : st === "Trial" ? "var(--warn)" : "var(--crit)"; }
function Panel({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return <div><h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }} className="display">{title}</h1>{sub && <p className="muted" style={{ margin: "4px 0 22px" }}>{sub}</p>}{children}</div>;
}
function Placeholder({ title, sub, note }: { title: string; sub: string; note: string }) {
  return <Panel title={title} sub={sub}><div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>{note}</div></Panel>;
}

export function StaffAdmin({ email, onSignOut }: { email?: string; onSignOut?: () => void }) {
  const [sec, setSec] = useState<Section>("dashboard");
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Record<string, { is_set: boolean; is_public: boolean }>>({});
  const [statusErr, setStatusErr] = useState<string | null>(null);
  const [savingEnv, setSavingEnv] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [listBusy, setListBusy] = useState<string | null>(null);
  const [dataErr, setDataErr] = useState<string | null>(null);
  const [masters, setMasters] = useState<any[]>([]);
  const [pieces, setPieces] = useState<any[]>([]);
  const [hubTab, setHubTab] = useState<"master" | "agen">("master");
  const [assetTab, setAssetTab] = useState<"media" | "voice">("media");
  const [learn, setLearn] = useState<any | null>(null);
  const [learnBusy, setLearnBusy] = useState(false);
  const [learnTab, setLearnTab] = useState<string>("overview");
  const [srcDraft, setSrcDraft] = useState<Record<string, string>>({});
  const [stepDraft, setStepDraft] = useState<Record<number, any>>({});

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  const loadLearn = async () => {
    setLearnBusy(true); setDataErr(null);
    try { setLearn(await rpc("admin_learning_panel")); }
    catch (e: any) { setDataErr(e?.message || "Gagal memuat Learning."); }
    finally { setLearnBusy(false); }
  };
  const saveSource = async (id: string) => {
    try { await rpc("admin_set_learning_source", { p_id: id, p_handle: srcDraft[id] || "" }); flash("Handle disimpan ✓"); loadLearn(); }
    catch (e: any) { setDataErr(e?.message || "Gagal simpan handle."); }
  };
  const startIngest = async (id: string, limit?: number) => {
    try {
      const r = await rpc("admin_start_ingest", { p_id: id, p_limit: limit ?? null });
      if (r && r.kicked === false) setDataErr(r.message || "Permintaan belum dikirim."); else flash((r && r.message) || "Ingest via Apify dimulai ✓");
      loadLearn();
    } catch (e: any) { setDataErr(e?.message || "Isi handle Instagram dulu."); }
  };
  const resetSource = async (id: string) => {
    try { await rpc("admin_reset_learning_source", { p_id: id }); flash("Sumber direset ke pending"); loadLearn(); }
    catch (e: any) { setDataErr(e?.message || "Gagal reset."); }
  };
  const ackRelearn = async (id: string) => {
    try { await rpc("admin_ack_relearn", { p_recipe_id: id }); flash("Relearn ditandai selesai ✓"); loadLearn(); }
    catch (e: any) { setDataErr(e?.message || "Gagal."); }
  };
  const saveStep = async (n: number) => {
    const d = stepDraft[n] || {};
    try {
      await rpc("admin_score_step", { p_step_no: n, p_quality: d.quality ?? null, p_efficiency: d.efficiency ?? null, p_status: d.status || null, p_notes: d.notes ?? null });
      flash("Penilaian step disimpan ✓"); loadLearn();
    } catch (e: any) { setDataErr(e?.message || "Gagal simpan step."); }
  };

  const loadListings = async () => {
    setDataErr(null);
    try { setListings((await rpc("admin_list_listings", { p_limit: 300 })) || []); }
    catch (e: any) { setDataErr(e?.message || "Gagal memuat listing."); }
  };
  const toggleFeatured = async (id: string, on: boolean) => {
    setListBusy(id);
    try {
      await rpc("admin_set_listing_featured", { p_id: id, p_on: on });
      setListings((ls) => ls.map((l) => (l.id === id ? { ...l, public_featured: on } : l)));
      flash(on ? "Tayang di cakra.xyz/listing ✓" : "Disembunyikan dari feed publik");
    } catch (e: any) { setDataErr(e?.message || "Gagal memperbarui listing."); }
    finally { setListBusy(null); }
  };
  const loadHub = async () => {
    setDataErr(null);
    try {
      const [m, p] = await Promise.all([
        rpc("admin_content_masters", { p_days: 14 }),
        rpc("admin_content_pieces", { p_days: 14 }),
      ]);
      setMasters(m || []); setPieces(p || []);
    } catch (e: any) { setDataErr(e?.message || "Gagal memuat konten Hub."); }
  };

  const [members, setMembers] = useState<any[]>([]);
  const [memBusy, setMemBusy] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<any | null>(null);
  const loadMembers = async () => {
    setDataErr(null);
    try { setMembers((await rpc("admin_list_members")) || []); }
    catch (e: any) { setDataErr(e?.message || "Gagal memuat member."); }
  };
  const deleteMember = async (m: any) => {
    setMemBusy(m.id);
    try {
      await rpc("admin_delete_user", { p_id: m.id });
      setMembers((ls) => ls.filter((x) => x.id !== m.id));
      setConfirmDel(null);
      flash(`${m.email || m.name || "Member"} dihapus`);
    } catch (e: any) { setDataErr(e?.message || "Gagal menghapus member."); }
    finally { setMemBusy(null); }
  };

  const loadStatus = async () => {
    setStatusErr(null);
    try {
      const rows = await rpc("admin_secret_status");
      const m: Record<string, { is_set: boolean; is_public: boolean }> = {};
      (rows || []).forEach((r: any) => { m[r.name] = { is_set: r.is_set, is_public: r.is_public }; });
      setStatus(m);
    } catch (e: any) { setStatusErr(e?.message || "Gagal memuat status kunci."); }
  };
  useEffect(() => {
    if (sec === "llm") loadStatus();
    if (sec === "listing") loadListings();
    if (sec === "hub") loadHub();
    if (sec === "member" || sec === "dashboard") loadMembers();
    if (sec === "learning") loadLearn();
    /* eslint-disable-next-line */
  }, [sec]);

  const saveKey = async (env: string) => {
    const val = (keys[env] || "").trim();
    if (!val) return;
    setSavingEnv(env); setStatusErr(null);
    try {
      await rpc("admin_set_secret", { p_name: env, p_value: val });
      setStatus((s) => ({ ...s, [env]: { is_set: true, is_public: s[env]?.is_public || false } }));
      setKeys((k) => ({ ...k, [env]: "" }));
      setToast(`${env} tersimpan & terenkripsi`); setTimeout(() => setToast(null), 2800);
    } catch (e: any) { setStatusErr(e?.message || "Gagal menyimpan kunci."); }
    finally { setSavingEnv(null); }
  };

  const Members = (
    <div className="card" style={{ overflow: "hidden" }}>
      {members.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>Belum ada member. Agen yang mendaftar lewat onboarding muncul di sini.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".92rem", minWidth: 640 }}>
            <thead><tr style={{ textAlign: "left", color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{["Member", "Paket", "Subdomain", "Kota"].map((h) => <th key={h} style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>{h}</th>)}</tr></thead>
            <tbody>
              {members.slice(0, 8).map((m: any) => (
                <tr key={m.id}>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 32, height: 32, borderRadius: "50%", background: "color-mix(in oklab, var(--brand) 18%, var(--surface))", color: "var(--brand)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: ".82rem" }}>{(m.name || m.brand || m.email || "?")[0].toUpperCase()}</span>
                      <div><div style={{ fontWeight: 600 }}>{m.name || m.brand || "—"}</div><div className="muted" style={{ fontSize: ".82rem" }}>{m.email}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}><span className="pill">{m.plan || "trial"}</span></td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}><span className="mono" style={{ fontSize: ".84rem" }}>{m.subdomain ? `${m.subdomain}.cakra.xyz` : "—"}</span></td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }} className="muted">{m.city || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const content = () => {
    switch (sec) {
      case "dashboard":
        return (
          <Panel title="Dashboard" sub="Ringkasan platform cakra.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18, marginBottom: 26 }}>
              {[
                { l: "Total member", v: String(members.length), d: "terdaftar", c: "--c-eye" },
                { l: "Website aktif", v: String(members.filter((m: any) => m.subdomain).length), d: "punya subdomain", c: "--c-heart" },
                { l: "Paket Pro", v: String(members.filter((m: any) => String(m.plan).toLowerCase() === "pro").length), d: "member Pro", c: "--c-throat" },
              ].map((s) => (
                <div key={s.l} className="card" style={{ padding: 22 }}>
                  <div className="muted" style={{ fontSize: ".85rem" }}>{s.l}</div>
                  <div className="display" style={{ fontSize: "2rem", fontWeight: 700, color: `var(${s.c})`, marginTop: 6, lineHeight: 1 }}>{s.v}</div>
                  <div className="muted" style={{ fontSize: ".8rem", marginTop: 6 }}>{s.d}</div>
                </div>
              ))}
            </div>
            <h2 className="display" style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 12px" }}>Member terbaru</h2>
            {Members}
          </Panel>
        );
      case "member":
        return (
          <Panel title="Member" sub="Agen yang terdaftar di cakra — kelola dan hapus akun.">
            {dataErr && <p style={{ color: "var(--crit)", fontSize: ".85rem", margin: "0 0 12px" }}>{dataErr}</p>}
            {toast && <p style={{ color: "var(--good)", fontSize: ".85rem", margin: "0 0 12px" }}>✓ {toast}</p>}
            <div className="card" style={{ padding: "12px 16px", marginBottom: 16, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: ".9rem" }}><b>{members.length}</b> <span className="muted">member terdaftar</span></span>
              <button onClick={loadMembers} style={{ marginLeft: "auto", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 9, padding: ".45rem .8rem", font: "inherit", fontSize: ".82rem", fontWeight: 600, color: "var(--ink-2)", cursor: "pointer" }}>↻ Muat ulang</button>
            </div>
            {members.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Belum ada member. Agen yang mendaftar lewat onboarding akan muncul di sini.</div>
            ) : (
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem", minWidth: 780 }}>
                    <thead><tr style={{ textAlign: "left", color: "var(--muted)", fontSize: ".74rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{["Member", "Kota", "Subdomain", "Paket", "Listing", "Aksi"].map((h) => <th key={h} style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {members.map((m) => {
                        const isAdm = m.email && email && m.email.toLowerCase() === email.toLowerCase();
                        return (
                          <tr key={m.id}>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", background: "color-mix(in oklab, var(--brand) 18%, var(--surface))", color: "var(--brand)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: ".82rem" }}>{(m.name || m.email || "?")[0].toUpperCase()}</span>
                                <div><div style={{ fontWeight: 600 }}>{m.name || m.brand || "—"}</div><div className="muted" style={{ fontSize: ".8rem" }}>{m.email}</div></div>
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }} className="muted">{m.city || "—"}</td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}><span className="mono" style={{ fontSize: ".82rem" }}>{m.subdomain ? `${m.subdomain}.cakra.xyz` : "—"}</span></td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}><span className="pill" style={{ fontSize: ".72rem" }}>{m.plan || "trial"}</span></td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }} className="mono">{m.listings ?? 0}</td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                              <button onClick={() => setConfirmDel(m)} disabled={isAdm} title={isAdm ? "Tidak bisa menghapus akun admin" : "Hapus member"} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: isAdm ? "var(--muted)" : "var(--crit)", border: `1px solid ${isAdm ? "var(--line-2)" : "color-mix(in oklab, var(--crit) 40%, var(--line))"}`, borderRadius: 8, padding: ".38rem .7rem", font: "inherit", fontSize: ".8rem", fontWeight: 600, cursor: isAdm ? "not-allowed" : "pointer", opacity: isAdm ? .5 : 1 }}>
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>Hapus
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {confirmDel && (
              <div onClick={() => setConfirmDel(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,15,9,.55)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
                <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: "min(440px, 96vw)", padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ width: 40, height: 40, flex: "none", borderRadius: 10, display: "grid", placeItems: "center", background: "color-mix(in oklab, var(--crit) 14%, var(--surface))", color: "var(--crit)" }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
                    </span>
                    <h3 className="display" style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Hapus member ini?</h3>
                  </div>
                  <p className="muted" style={{ fontSize: ".92rem", lineHeight: 1.55, margin: "0 0 6px" }}>
                    <b>{confirmDel.name || confirmDel.brand || confirmDel.email}</b> ({confirmDel.email}) akan dihapus permanen beserta seluruh website, listing, konten, dan asetnya. Tindakan ini <b>tidak bisa dibatalkan</b>.
                  </p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
                    <button onClick={() => setConfirmDel(null)} className="btn btn-ghost" style={{ padding: ".6rem 1.1rem" }}>Batal</button>
                    <button onClick={() => deleteMember(confirmDel)} disabled={memBusy === confirmDel.id} style={{ background: "var(--crit)", color: "#fff", border: "none", borderRadius: 11, padding: ".6rem 1.2rem", font: "inherit", fontWeight: 700, cursor: "pointer", opacity: memBusy === confirmDel.id ? .6 : 1 }}>{memBusy === confirmDel.id ? "Menghapus…" : "Hapus permanen"}</button>
                  </div>
                </div>
              </div>
            )}
          </Panel>
        );
      case "llm":
        return (
          <Panel title="LLM & API" sub="Kunci API untuk seluruh platform — masukkan sekali, dipakai bersama Supabase & Vercel.">
            <div className="card" style={{ padding: "14px 18px", marginBottom: 18, background: "color-mix(in oklab, var(--brand) 7%, var(--surface))", borderColor: "color-mix(in oklab, var(--brand) 22%, var(--line))" }}>
              <span style={{ fontSize: ".9rem", display: "block", lineHeight: 1.55 }}>
                🔒 Kunci disimpan <b>terenkripsi di Supabase Vault</b>, hanya bisa diubah admin ber-2FA. Kunci rahasia dipakai server (<b style={{ color: "var(--c-throat)" }}>Supabase</b> Edge); kunci <b style={{ color: "var(--c-eye)" }}>publik</b> (NEXT_PUBLIC_*) ikut disinkron agar dipakai frontend (<b style={{ color: "var(--c-eye)" }}>Vercel</b>). Nilai tak pernah ditampilkan kembali — tempel untuk mengganti.
              </span>
              {statusErr && <p style={{ fontSize: ".82rem", color: "var(--crit)", margin: "8px 0 0" }}>{statusErr}</p>}
              {toast && <p style={{ fontSize: ".82rem", color: "var(--good)", margin: "8px 0 0" }}>✓ {toast}</p>}
            </div>
            <div style={{ display: "grid", gap: 18 }}>
              {API_KEYS.map((grp) => (
                <div key={grp.group} className="card" style={{ padding: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>{grp.group}</div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {grp.items.map((it) => {
                      const managed = it.env in status;
                      const isSet = !!status[it.env]?.is_set;
                      const saving = savingEnv === it.env;
                      const val = (keys[it.env] || "").trim();
                      return (
                        <div key={it.env} style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1fr) 1.6fr", gap: 14, alignItems: "center" }} className="api-row">
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 600, fontSize: ".95rem" }}>{it.name}</span>
                              {it.where.map((w) => (
                                <span key={w} style={{ fontSize: ".64rem", fontWeight: 700, color: `var(${whereColor(w)})`, background: `color-mix(in oklab, var(${whereColor(w)}) 14%, var(--surface))`, padding: ".12rem .45rem", borderRadius: 999 }}>{w}</span>
                              ))}
                            </div>
                            <div className="muted" style={{ fontSize: ".8rem", marginTop: 2 }}>{it.purpose}</div>
                            <div className="mono muted" style={{ fontSize: ".72rem", marginTop: 2 }}>{it.env}</div>
                          </div>
                          {managed ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input type="password" value={keys[it.env] || ""} placeholder={isSet ? "•••••• terpasang — tempel untuk ganti" : (it.ph || "tempel kunci")} onChange={(e) => setKeys((k) => ({ ...k, [it.env]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") saveKey(it.env); }} style={{ flex: 1, minWidth: 0, background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 9, padding: ".55rem .8rem", font: "inherit", fontSize: ".86rem", color: "var(--ink)" }} />
                              <button onClick={() => saveKey(it.env)} disabled={saving || !val} style={{ flex: "none", background: val && !saving ? "var(--brand)" : "var(--surface-2)", color: val && !saving ? "#fff" : "var(--muted)", border: `1px solid ${val && !saving ? "transparent" : "var(--line-2)"}`, borderRadius: 9, padding: ".55rem .9rem", font: "inherit", fontSize: ".82rem", fontWeight: 600, cursor: val && !saving ? "pointer" : "default" }}>{saving ? "…" : "Simpan"}</button>
                              <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 5, fontSize: ".74rem", fontWeight: 600, color: isSet ? "var(--good)" : "var(--muted)", width: 88 }} title={isSet ? "Terpasang (terenkripsi)" : "Belum diisi"}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: isSet ? "var(--good)" : "var(--line-2)" }} />{isSet ? "Terpasang" : "Kosong"}
                              </span>
                            </div>
                          ) : (
                            <div className="muted" style={{ fontSize: ".8rem" }}>Otomatis · dikelola infra ({it.where.join(", ")})</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22 }}>
              <h2 className="display" style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 4px" }}>Prompt Enhancer</h2>
              <p className="muted" style={{ fontSize: ".9rem", margin: "0 0 14px" }}>System prompt berbeda untuk tiap lapisan — memperkaya setiap panggilan sebelum dikirim ke model.</p>
              <div style={{ display: "grid", gap: 16 }}>
                <div className="card" style={{ padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span className="pill" style={{ background: "color-mix(in oklab, var(--c-eye) 16%, var(--surface))", color: "var(--c-eye)", fontSize: ".68rem", fontWeight: 700 }}>Lapis 1 · Riset</span>
                    <span style={{ fontWeight: 600, fontSize: ".95rem" }}>Persona: CMO · Analis · Direktur Riset senior</span>
                  </div>
                  <p className="muted" style={{ fontSize: ".85rem", margin: "0 0 10px" }}>Mengutamakan fakta, tren, kualitas, dan tipe/kategori. Dipakai untuk Perplexity + SerpAPI + Firecrawl → Gemini index.</p>
                  <textarea rows={9} defaultValue={L1_PROMPT} style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: 12, font: "inherit", fontSize: ".88rem", lineHeight: 1.5, color: "var(--ink)", resize: "vertical" }} />
                </div>
                <div className="card" style={{ padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span className="pill" style={{ background: "color-mix(in oklab, var(--c-heart) 16%, var(--surface))", color: "var(--c-heart)", fontSize: ".68rem", fontWeight: 700 }}>Lapis 2 · Konten</span>
                    <span style={{ fontWeight: 600, fontSize: ".95rem" }}>Persona: Content · SEO · GEO · CMO senior</span>
                  </div>
                  <p className="muted" style={{ fontSize: ".85rem", margin: "0 0 10px" }}>Dipersonalisasi untuk persona tiap agen (nama, brand, gaya bahasa, area, produk, audiens). Dipakai untuk Claude Sonnet.</p>
                  <textarea rows={11} defaultValue={L2_PROMPT} style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: 12, font: "inherit", fontSize: ".88rem", lineHeight: 1.5, color: "var(--ink)", resize: "vertical" }} />
                </div>
              </div>
            </div>
            <style>{`@media (max-width:640px){ .api-row{ grid-template-columns:1fr !important; } }`}</style>
          </Panel>
        );
      case "assets": return (
        <Panel title="Aset" sub="Pustaka gambar, video b-roll, musik (BGM) & voice karakter cakra — cari, filter, pratinjau, dan salin URL untuk listing, konten, & video.">
          <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 4, marginBottom: 16 }}>
            {([["media", "Media"], ["voice", "Voice karakter"]] as const).map(([id, l]) => (
              <button key={id} onClick={() => setAssetTab(id)} style={{ border: "none", cursor: "pointer", font: "inherit", fontWeight: 600, fontSize: ".84rem", padding: ".45rem .95rem", borderRadius: 999, background: assetTab === id ? "var(--brand)" : "transparent", color: assetTab === id ? "#fff" : "var(--muted)" }}>{l}</button>
            ))}
          </div>
          {assetTab === "media" ? <AssetLibrary /> : (
            <>
              <p className="muted" style={{ fontSize: ".86rem", margin: "0 0 14px", lineHeight: 1.5 }}>Seluruh katalog voice ElevenLabs. Setiap member dikurasikan 8 perempuan + 8 laki-laki dari sini dan memilih 1 tiap gender (bisa diganti 1× / 30 hari).</p>
              <VoiceLibrary mode="catalog" />
            </>
          )}
        </Panel>
      );
      case "listing": {
        const pub = listings.filter((l) => l.public_featured).length;
        return (
          <Panel title="Listing" sub="Semua listing dari member. Setujui satu per satu agar tayang di feed publik cakra.xyz/listing.">
            {dataErr && <p style={{ color: "var(--crit)", fontSize: ".85rem", margin: "0 0 12px" }}>{dataErr}</p>}
            {toast && <p style={{ color: "var(--good)", fontSize: ".85rem", margin: "0 0 12px" }}>✓ {toast}</p>}
            <div className="card" style={{ padding: "12px 16px", marginBottom: 16, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: ".9rem" }}><b>{listings.length}</b> <span className="muted">total listing</span></span>
              <span style={{ fontSize: ".9rem" }}><b style={{ color: "var(--good)" }}>{pub}</b> <span className="muted">tayang di feed publik</span></span>
              <button onClick={loadListings} style={{ marginLeft: "auto", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 9, padding: ".45rem .8rem", font: "inherit", fontSize: ".82rem", fontWeight: 600, color: "var(--ink-2)", cursor: "pointer" }}>↻ Muat ulang</button>
            </div>
            {listings.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Belum ada listing dari member. Listing yang dibuat agen di dashboard akan muncul di sini untuk persetujuan.</div>
            ) : (
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem", minWidth: 760 }}>
                    <thead><tr style={{ textAlign: "left", color: "var(--muted)", fontSize: ".74rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{["Properti", "Agen", "Lokasi", "Status", "Harga", "Feed publik"].map((h) => <th key={h} style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {listings.map((l) => {
                        const img = Array.isArray(l.images) && l.images[0];
                        const on = !!l.public_featured;
                        const busy = listBusy === l.id;
                        return (
                          <tr key={l.id}>
                            <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ width: 46, height: 40, flex: "none", borderRadius: 8, overflow: "hidden", background: "var(--surface-2)", display: "grid", placeItems: "center" }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="muted" style={{ fontSize: ".7rem" }}>—</span>}
                                </span>
                                <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>{l.title}</div><div className="muted" style={{ fontSize: ".78rem" }}>{l.beds || 0} KT · {l.baths || 0} KM · {l.size_m2 || 0} m²</div></div>
                              </div>
                            </td>
                            <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }}><div style={{ fontWeight: 500 }}>{l.agent_brand || l.agent_name || "—"}</div>{l.agent_subdomain && <div className="mono muted" style={{ fontSize: ".74rem" }}>{l.agent_subdomain}.cakra.xyz</div>}</td>
                            <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }} className="muted">{l.area || l.location || "—"}</td>
                            <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }}><span className="pill" style={{ fontSize: ".72rem" }}>{l.status === "disewa" ? "Disewa" : l.status === "dijual" ? "Dijual" : l.status}</span></td>
                            <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }} className="mono">{l.price_label || "—"}</td>
                            <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }}>
                              <button onClick={() => toggleFeatured(l.id, !on)} disabled={busy} title={on ? "Sembunyikan dari feed publik" : "Setujui untuk tayang di cakra.xyz/listing"} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: on ? "color-mix(in oklab, var(--good) 16%, var(--surface))" : "var(--surface-2)", color: on ? "var(--good)" : "var(--muted)", border: `1px solid ${on ? "color-mix(in oklab, var(--good) 40%, var(--line))" : "var(--line-2)"}`, borderRadius: 999, padding: ".4rem .8rem", font: "inherit", fontSize: ".8rem", fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy ? .6 : 1 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor" }} />{busy ? "…" : on ? "Tayang" : "Setujui"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Panel>
        );
      }
      case "hub": {
        const items = hubTab === "master" ? masters : pieces;
        return (
          <Panel title="Hub" sub="Konten harian yang dihasilkan sistem (2 lapisan). Master = milik cakra untuk sosial media kami; Agen = versi personalisasi tiap member.">
            {dataErr && <p style={{ color: "var(--crit)", fontSize: ".85rem", margin: "0 0 12px" }}>{dataErr}</p>}
            {toast && <p style={{ color: "var(--good)", fontSize: ".85rem", margin: "0 0 12px" }}>✓ {toast}</p>}
            <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 4 }}>
                {([["master", `Master cakra (${masters.length})`], ["agen", `Konten agen (${pieces.length})`]] as const).map(([id, lbl]) => (
                  <button key={id} onClick={() => setHubTab(id as "master" | "agen")} style={{ border: "none", cursor: "pointer", font: "inherit", fontWeight: 600, fontSize: ".86rem", padding: ".45rem 1rem", borderRadius: 999, background: hubTab === id ? "var(--brand)" : "transparent", color: hubTab === id ? "#fff" : "var(--muted)" }}>{lbl}</button>
                ))}
              </div>
              <button onClick={loadHub} style={{ marginLeft: "auto", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 9, padding: ".45rem .8rem", font: "inherit", fontSize: ".82rem", fontWeight: 600, color: "var(--ink-2)", cursor: "pointer" }}>↻ Muat ulang</button>
            </div>
            {items.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>{hubTab === "master" ? "Belum ada master konten. Sistem membuat 2 setiap pagi jam 8." : "Belum ada konten agen. Dibuat saat member baru bergabung & tiap pagi."}</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {items.map((it: any) => {
                  const isMaster = hubTab === "master";
                  const txt = contentText(it.content);
                  const tag = isMaster ? (SLOT_LABEL[it.slot] || it.format) : (it.mirror === "vertical" ? "Vertikal" : "Feed");
                  const heading = isMaster ? it.topic : it.title;
                  const sub = isMaster ? it.angle : `${it.agent_brand || it.agent_name || "Agen"} · ${it.status || "draft"}`;
                  return (
                    <div key={it.id} className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className="pill" style={{ fontSize: ".68rem", background: it === items[0] && isMaster ? "color-mix(in oklab, var(--brand) 16%, var(--surface))" : undefined }}>{tag}</span>
                        {isMaster && it.day && <span className="muted mono" style={{ fontSize: ".72rem" }}>{it.day}</span>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.3 }}>{heading || "—"}</div>
                      {sub && <div className="muted" style={{ fontSize: ".82rem" }}>{sub}</div>}
                      <div style={{ fontSize: ".85rem", lineHeight: 1.55, color: "var(--ink-2)", whiteSpace: "pre-wrap", maxHeight: 168, overflow: "hidden", position: "relative" }}>{txt}
                        <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 34, background: "linear-gradient(180deg, transparent, var(--surface))" }} />
                      </div>
                      <button onClick={() => { try { navigator.clipboard.writeText(txt); flash("Konten disalin ✓"); } catch { } }} style={{ marginTop: "auto", alignSelf: "flex-start", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 9, padding: ".45rem .85rem", font: "inherit", fontSize: ".8rem", fontWeight: 600, color: "var(--ink-2)", cursor: "pointer" }}>⧉ Salin untuk sosial media</button>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        );
      }
      case "editor": return <Placeholder title="Editor setting" sub="Konfigurasi editor website & video AI." note="Preset tema, blok, dan parameter video (durasi, gaya, musik)." />;
      case "learning": {
        const L = learn || {};
        const routing = (L.routing && L.routing.steps) || {};
        const stepsRows = L.steps || [];
        const experts = L.experts || {};
        const assets = L.assets || {};
        const expertChip = (k: string) => { const e = experts[k]; if (!e) return null; return chip(e.title, e.tone || "--c-eye"); };
        const FACETS: [string, string, string][] = [["video", "Video", "--c-eye"], ["audio", "Audio", "--c-throat"], ["caption", "Caption", "--c-heart"], ["voice_tts", "Voice/TTS", "--c-sacral"], ["image", "Images", "--c-solar"], ["frame", "Frames", "--c-crown"]];
        const rates = (L.rates && L.rates.rates) || {};
        const fx = Number(L.rates && L.rates.fx_usd_idr) || 16000;
        const cap = Number(L.plan_limits && L.plan_limits.generations_per_month) || 10;
        const PLAN = 300000;
        const samples = L.samples || [];
        const sources = L.sources || [];
        const metrics = L.metrics || [];
        const idr = (n: any) => (n == null ? "—" : "Rp " + Number(n).toLocaleString("id-ID"));
        // Measured by learn-selftest (2026-09-12): ~3.1k in / ~4.5k out tokens per Sonnet generation (thinking counts).
        const M_IN = Number(L.plan_limits?.measured?.sonnet_tokens_in) || 3200, M_OUT = Number(L.plan_limits?.measured?.sonnet_tokens_out) || 4500;
        const perGen = (m: string) => { const r = rates[m]; if (!r || r.in == null) return null; return Math.round((M_IN / 1e6 * r.in + M_OUT / 1e6 * r.out) * fx); };
        const qualityFor = (m: string) => { const row = metrics.find((x: any) => x.model === m); return row && row.quality != null ? row.quality + "%" : null; };
        const mTone = (m: string) => (String(m).includes("gpt") ? "--c-sacral" : String(m).includes("gemini") ? "--c-solar" : String(m).includes("mcp") ? "--c-crown" : String(m).match(/ffmpeg|apify|scraper|storage/i) ? "--c-throat" : "--c-eye");
        const chip = (t: string, tone = "--c-eye") => <span key={t} style={{ display: "inline-block", fontSize: ".68rem", fontWeight: 700, padding: ".18rem .5rem", borderRadius: 999, background: `color-mix(in oklab, var(${tone}) 14%, var(--surface))`, color: `var(${tone})`, border: `1px solid color-mix(in oklab, var(${tone}) 30%, transparent)` }}>{t}</span>;
        const modelsForKeys = (keys: string[]) => { const out: string[] = []; (keys || []).forEach((k) => { const st = routing[k] || {}; ["primary", "premium", "heavy", "recipe_vision", "engine"].forEach((f) => { if (st[f] && !out.includes(st[f])) out.push(st[f]); }); }); return out; };
        const sTone: Record<string, string> = { pending: "--muted", active: "--c-eye", done: "--c-heart", blocked: "--c-solar" };
        const stepMetric = (no: number) => no === 1 ? `${L.media_total || 0} video` : no === 2 ? `${L.frames_total || 0} frame` : no === 3 ? `${L.media_analyzed || 0}/${L.media_total || 0} dianalisis` : no === 4 ? `${(L.recipes || []).length} resep` : (no === 6 || no === 7) ? `${L.gen_total || 0} generasi` : no === 8 ? `${L.gen_up || 0}👍 / ${L.gen_down || 0}👎` : no === 9 ? ((L.recipes || []).some((r: any) => r.relearn_due) ? "relearn due" : "—") : "—";
        const sd = (n: number, f: string, fb: any) => { const d = stepDraft[n]; return d && d[f] !== undefined ? d[f] : fb; };
        const setSd = (n: number, f: string, v: any) => setStepDraft((p) => ({ ...p, [n]: { ...(p[n] || {}), [f]: v } }));
        const composeRows = [
          { m: "claude-opus-5", label: "Opus 5", role: "Premium", q: "Terkaya", tone: "--c-crown" },
          { m: "claude-sonnet-5", label: "Sonnet 5", role: "Default", q: "Solid", tone: "--c-heart" },
          { m: "claude-haiku-4-5", label: "Haiku 4.5", role: "Sub-task", q: "Dasar", tone: "--c-throat" },
        ];
        const TABS = [{ k: "overview", label: "Ringkasan" }, ...stepsRows.map((s: any) => ({ k: String(s.step_no), label: String(s.step_no) }))];
        const activeStep = learnTab === "overview" ? null : stepsRows.find((s: any) => String(s.step_no) === learnTab);
        const scoreBar = (v: any, tone: string) => (
          <div style={{ height: 8, borderRadius: 999, background: "var(--line)", overflow: "hidden", marginTop: 6 }}>
            <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, Number(v) || 0))}%`, background: `var(${tone})`, transition: ".2s" }} />
          </div>
        );
        return (
          <Panel title="Learning" sub="Mesin resep konten — belajar dari agen nyata, bangun resep, jalankan otomasi editor. Tiap step bisa dinilai & dioptimalkan sendiri.">
            {learnBusy && !learn ? <div className="muted" style={{ padding: 20 }}>Memuat…</div> : (
            <>
              {/* sub-tab bar */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
                {TABS.map((t: any) => (
                  <button key={t.k} onClick={() => setLearnTab(t.k)} title={t.k === "overview" ? "Ringkasan" : (stepsRows.find((s: any) => String(s.step_no) === t.k)?.title || t.k)}
                    style={{ padding: ".4rem .8rem", borderRadius: 8, border: "none", cursor: "pointer", font: "inherit", fontSize: ".85rem", fontWeight: learnTab === t.k ? 700 : 500, minWidth: t.k === "overview" ? "auto" : 34, background: learnTab === t.k ? "color-mix(in oklab, var(--brand) 14%, var(--surface))" : "transparent", color: learnTab === t.k ? "var(--brand)" : "var(--ink-2)" }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {learnTab === "overview" ? (
                <div style={{ display: "grid", gap: 26 }}>
                  {/* Progress strip — where the process is at */}
                  <section>
                    <h2 className="display" style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 12px" }}>Progres pipeline <span className="muted" style={{ fontSize: ".76rem", fontWeight: 400 }}>· klik untuk nilai & optimalkan tiap step</span></h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
                      {stepsRows.map((s: any) => (
                        <button key={s.step_no} onClick={() => setLearnTab(String(s.step_no))} className="card" style={{ padding: 14, textAlign: "left", cursor: "pointer", border: "1px solid var(--line)", background: "var(--surface)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="display" style={{ fontWeight: 700, color: "var(--brand)" }}>{s.step_no}</span>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: `var(${sTone[s.status] || "--muted"})` }} />
                          </div>
                          <div style={{ fontSize: ".82rem", fontWeight: 600, marginTop: 6, lineHeight: 1.2 }}>{s.title}</div>
                          <div className="muted" style={{ fontSize: ".72rem", marginTop: 4 }}>{s.quality_score != null ? `Kualitas ${s.quality_score} · Efisiensi ${s.efficiency_score ?? "—"}` : "belum dinilai"}</div>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Expert team — the lenses that lead each step */}
                  <section>
                    <h2 className="display" style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 12px" }}>Tim ahli <span className="muted" style={{ fontSize: ".76rem", fontWeight: 400 }}>· lensa yang memimpin tiap step</span></h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
                      {["cto", "art_director", "cmo", "prompt_engineer"].map((k) => { const e = experts[k]; if (!e) return null; const leads = stepsRows.filter((s: any) => (s.experts || []).includes(k)).map((s: any) => s.step_no); return (
                        <div key={k} className="card" style={{ padding: 16, borderTop: `3px solid var(${e.tone || "--c-eye"})` }}>
                          <div style={{ fontWeight: 700, color: `var(${e.tone || "--c-eye"})` }}>{e.title}</div>
                          <div className="muted" style={{ fontSize: ".8rem", marginTop: 6, lineHeight: 1.5 }}>{e.mandate}</div>
                          <div style={{ fontSize: ".74rem", marginTop: 8, color: "var(--ink-2)" }}>Memimpin step: <b>{leads.join(", ") || "—"}</b></div>
                        </div>
                      ); })}
                    </div>
                  </section>

                  {/* Sources — with IG handle input for Apify */}
                  <section>
                    <h2 className="display" style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 12px" }}>Sumber pembelajaran <span className="muted" style={{ fontSize: ".76rem", fontWeight: 400 }}>· handle Instagram untuk Apify</span></h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
                      {sources.map((s: any) => (
                        <div key={s.id} className="card" style={{ padding: 18 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            {chip(s.kind === "inhouse" ? "In-house" : "Agen nyata", s.kind === "inhouse" ? "--c-solar" : "--c-heart")}
                            <span className="muted" style={{ fontSize: ".72rem" }}>{s.status} · {s.video_count}/{s.target_count}</span>
                          </div>
                          <div style={{ fontWeight: 700, marginTop: 10 }}>{s.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                            <span className="muted" style={{ fontSize: ".9rem" }}>@</span>
                            <input value={sd(0, s.id, undefined) ?? (srcDraft[s.id] ?? (s.handle || ""))} onChange={(e) => setSrcDraft((p) => ({ ...p, [s.id]: e.target.value }))} placeholder="handle_instagram"
                              style={{ flex: 1, minWidth: 0, padding: ".5rem .7rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", font: "inherit", fontSize: ".85rem" }} />
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            <button onClick={() => saveSource(s.id)} style={{ padding: ".45rem .8rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer", font: "inherit", fontSize: ".8rem", fontWeight: 600 }}>Simpan</button>
                            {(s.status === "pending" || s.status === "failed") ? (
                              <>
                                <button onClick={() => startIngest(s.id, 5)} disabled={!s.handle} title={!s.handle ? "Isi handle dulu" : "Uji coba 5 video dulu"} style={{ padding: ".45rem .8rem", borderRadius: 9, border: "1px solid color-mix(in oklab, var(--brand) 40%, var(--line-2))", background: "transparent", color: "var(--brand)", cursor: s.handle ? "pointer" : "not-allowed", opacity: s.handle ? 1 : .5, font: "inherit", fontSize: ".8rem", fontWeight: 700 }}>Dry-run 5</button>
                                <button onClick={() => startIngest(s.id)} disabled={!s.handle} title={!s.handle ? "Isi handle dulu" : `Ingest penuh (${s.target_count} video)`} style={{ padding: ".45rem .8rem", borderRadius: 9, border: "none", background: "var(--brand)", color: "#fff", cursor: s.handle ? "pointer" : "not-allowed", opacity: s.handle ? 1 : .5, font: "inherit", fontSize: ".8rem", fontWeight: 700 }}>Ingest penuh</button>
                              </>
                            ) : (
                              <>
                                {s.status === "analyzed" && chip("Siap disintesis → Step 4", "--c-heart")}
                                <button onClick={() => resetSource(s.id)} style={{ padding: ".45rem .8rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "transparent", color: "var(--muted)", cursor: "pointer", font: "inherit", fontSize: ".8rem", fontWeight: 600 }}>Reset ke pending</button>
                              </>
                            )}
                          </div>
                          {s.status === "ingesting" && s.meta?.ingest_target && <div className="muted" style={{ fontSize: ".72rem", marginTop: 6 }}>Target run ini: {s.meta.ingest_target} video{s.meta?.apify_run_id ? ` · run ${String(s.meta.apify_run_id).slice(0, 8)}…` : ""}</div>}
                          {s.last_error && <div style={{ fontSize: ".74rem", color: "var(--crit)", marginTop: 8 }}>{s.last_error}</div>}
                          {(s.media_failed > 0) && <div className="muted" style={{ fontSize: ".72rem", marginTop: 4 }}>{s.media_analyzed || 0} dianalisis · {s.media_failed} gagal</div>}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Ingestion facets — each video decomposed into 6 learnable signals */}
                  <section>
                    <h2 className="display" style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 12px" }}>Hasil ingestion · 6 facet <span className="muted" style={{ fontSize: ".76rem", fontWeight: 400 }}>· tiap video dipecah untuk dipelajari terpisah</span></h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
                      {FACETS.map(([k, label, tone]) => (
                        <div key={k} className="card" style={{ padding: 16, borderTop: `3px solid var(${tone})` }}>
                          <div className="muted" style={{ fontSize: ".78rem" }}>{label}</div>
                          <div className="display" style={{ fontSize: "1.6rem", fontWeight: 700, color: `var(${tone})`, marginTop: 4, lineHeight: 1 }}>{k === "frame" ? (assets[k] || L.frames_total || 0) : (assets[k] || 0)}</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Jobs + recipes — where the engine is at, and the level-2 control */}
                  <section>
                    <h2 className="display" style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 12px" }}>Antrean &amp; resep</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
                      <div className="card" style={{ padding: 16 }}>
                        <div className="muted" style={{ fontSize: ".78rem", marginBottom: 8 }}>Job pipeline</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {["queued", "running", "done", "failed", "dead"].map((st) => chip(`${st} ${(L.jobs || {})[st] || 0}`, st === "done" ? "--c-heart" : st === "running" ? "--c-eye" : st === "failed" || st === "dead" ? "--c-solar" : "--c-throat"))}
                        </div>
                        {(L.last_errors || []).length > 0 && (
                          <div style={{ marginTop: 10, display: "grid", gap: 4 }}>
                            {(L.last_errors || []).map((e: any, i: number) => <div key={i} style={{ fontSize: ".72rem", color: "var(--crit)" }}>{e.kind}: {e.error}</div>)}
                          </div>
                        )}
                        {L.gen_failed > 0 && <div className="muted" style={{ fontSize: ".72rem", marginTop: 8 }}>{L.gen_failed} generasi gagal</div>}
                      </div>
                      {(L.recipes || []).map((r: any) => (
                        <div key={r.id} className="card" style={{ padding: 16, borderTop: `3px solid var(${r.status === "active" ? "--c-heart" : r.status === "archived" ? "--muted" : "--c-throat"})` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: ".9rem", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                            {chip(`${r.status} · v${r.version} · L${r.level}`, r.status === "active" ? "--c-heart" : "--muted")}
                          </div>
                          <div className="muted" style={{ fontSize: ".78rem", marginTop: 6 }}>👍 {r.up} · 👎 {r.down} · persona {r.persona}</div>
                          {r.relearn_due && (
                            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              {chip("Relearn due (level 2)", "--c-solar")}
                              <button onClick={() => ackRelearn(r.id)} style={{ padding: ".38rem .7rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer", font: "inherit", fontSize: ".76rem", fontWeight: 600 }}>Tandai relearn selesai</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Cost vs quality — weekly */}
                  <section>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                      <h2 className="display" style={{ fontSize: "1.05rem", fontWeight: 600, margin: 0 }}>Biaya vs kualitas — Step 6–7</h2>
                      <span className="muted" style={{ fontSize: ".76rem" }}>Kuota {cap} generasi/bln · diperbarui otomatis tiap Senin</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".86rem", minWidth: 520 }}>
                        <thead><tr style={{ textAlign: "left", color: "var(--muted)" }}>
                          {["Model", "Peran", "Biaya / generasi", `× ${cap}/bln`, "% dari Rp 300rb", "Kualitas (minggu ini)"].map((h) => <th key={h} style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {composeRows.map((r) => { const pg = perGen(r.m); const mo = pg == null ? null : pg * cap; const pct = mo == null ? null : Math.round(mo / PLAN * 100); return (
                            <tr key={r.m}>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--line)" }}>{chip(r.label, r.tone)}</td>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>{r.role} · {r.q}</td>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--line)", fontVariantNumeric: "tabular-nums" }}>{idr(pg)}</td>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--line)", fontVariantNumeric: "tabular-nums" }}>{idr(mo)}</td>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--line)", fontVariantNumeric: "tabular-nums", color: pct != null && pct >= 30 ? "var(--warn)" : "var(--ink)" }}>{pct == null ? "—" : pct + "%"}</td>
                              <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>{qualityFor(r.m) || "mengumpulkan data"}</td>
                            </tr>
                          ); })}
                        </tbody>
                      </table>
                    </div>
                    <div className="muted" style={{ fontSize: ".74rem", marginTop: 8 }}>Terukur dari self-test: ~{Math.round(M_IN / 100) / 10}rb token masuk / ~{Math.round(M_OUT / 100) / 10}rb keluar per generasi (termasuk thinking). Tarif di LLM &amp; API. GPT-6, Gemini &amp; Veo di sisi resep/render dihitung terpisah (per gambar / per detik), bukan per token.</div>
                  </section>

                  {/* Sample gallery */}
                  <section>
                    <h2 className="display" style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 12px" }}>Contoh hasil per model <span className="muted" style={{ fontSize: ".76rem", fontWeight: 400 }}>· brief sama, bandingkan kualitas</span></h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
                      {samples.map((s: any, i: number) => (
                        <div key={i} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            {chip(s.model, mTone(s.model))}
                            <span className="muted" style={{ fontSize: ".72rem", fontVariantNumeric: "tabular-nums" }}>{s.cost_idr == null ? (s.source === "pending" ? "pending" : "—") : idr(s.cost_idr)}</span>
                          </div>
                          <div className="muted" style={{ fontSize: ".74rem" }}>{s.role}</div>
                          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: ".8rem", lineHeight: 1.5, background: "color-mix(in oklab, var(--ink) 4%, var(--surface))", border: "1px solid var(--line)", borderRadius: 10, padding: 12, maxHeight: 240, overflowY: "auto", color: s.source === "pending" ? "var(--muted)" : "var(--ink)" }}>{s.output}</pre>
                          {s.note && <div className="muted" style={{ fontSize: ".72rem", fontStyle: "italic" }}>{s.note}</div>}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : activeStep ? (
                <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="display" style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--brand)" }}>{activeStep.step_no}</span>
                      <h2 className="display" style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>{activeStep.title}</h2>
                    </div>
                    <p className="muted" style={{ margin: "8px 0 0", fontSize: ".9rem", lineHeight: 1.5 }}>{activeStep.description}</p>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span className="muted" style={{ fontSize: ".78rem" }}>Model:</span>
                    {modelsForKeys(activeStep.route_keys).map((m: string) => chip(m, mTone(m)))}
                    {modelsForKeys(activeStep.route_keys).length === 0 && <span className="muted" style={{ fontSize: ".78rem" }}>—</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span className="muted" style={{ fontSize: ".78rem" }}>Dipimpin:</span>
                    {(activeStep.experts || []).map((k: string) => expertChip(k))}
                    {(activeStep.experts || []).length === 0 && <span className="muted" style={{ fontSize: ".78rem" }}>—</span>}
                  </div>
                  {(activeStep.experts || []).length > 0 && <div className="card" style={{ padding: 14 }}>{(activeStep.experts || []).map((k: string) => { const e = experts[k]; if (!e) return null; return <div key={k} style={{ fontSize: ".82rem", marginBottom: 4 }}><b style={{ color: `var(${e.tone || "--c-eye"})` }}>{e.title}:</b> <span className="muted">{e.mandate}</span></div>; })}</div>}

                  <div className="card" style={{ padding: 16 }}>
                    <div className="muted" style={{ fontSize: ".8rem" }}>Posisi saat ini</div>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: 4 }}>{stepMetric(activeStep.step_no)}</div>
                  </div>

                  {/* status */}
                  <div>
                    <div className="muted" style={{ fontSize: ".8rem", marginBottom: 6 }}>Status</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["pending", "active", "done", "blocked"].map((st) => { const cur = sd(activeStep.step_no, "status", activeStep.status) === st; return (
                        <button key={st} onClick={() => setSd(activeStep.step_no, "status", st)} style={{ padding: ".4rem .8rem", borderRadius: 999, border: `1px solid ${cur ? `var(${sTone[st]})` : "var(--line-2)"}`, background: cur ? `color-mix(in oklab, var(${sTone[st]}) 14%, var(--surface))` : "transparent", color: cur ? `var(${sTone[st]})` : "var(--ink-2)", cursor: "pointer", font: "inherit", fontSize: ".8rem", fontWeight: 600 }}>{st}</button>
                      ); })}
                    </div>
                  </div>

                  {/* quality + efficiency scores */}
                  {[["quality", "Kualitas", "--c-heart"], ["efficiency", "Efisiensi", "--c-solar"]].map(([field, label, tone]) => { const val = sd(activeStep.step_no, field, activeStep[`${field}_score`] ?? 0); return (
                    <div key={field}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span className="muted" style={{ fontSize: ".8rem" }}>{label}</span>
                        <span className="display" style={{ fontWeight: 700, color: `var(${tone})` }}>{val}</span>
                      </div>
                      <input type="range" min={0} max={100} value={Number(val) || 0} onChange={(e) => setSd(activeStep.step_no, field, Number(e.target.value))} style={{ width: "100%", accentColor: `var(${tone})`, marginTop: 6 }} />
                      {scoreBar(val, tone)}
                    </div>
                  ); })}

                  {/* optimization notes */}
                  <div>
                    <div className="muted" style={{ fontSize: ".8rem", marginBottom: 6 }}>Apa yang membuatnya lebih baik &amp; efisien</div>
                    <textarea value={sd(activeStep.step_no, "notes", activeStep.notes || "")} onChange={(e) => setSd(activeStep.step_no, "notes", e.target.value)} rows={4} placeholder="Catatan optimasi: bottleneck, ide perbaikan, parameter yang berpengaruh…"
                      style={{ width: "100%", padding: ".7rem .8rem", borderRadius: 10, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", font: "inherit", fontSize: ".88rem", lineHeight: 1.5, resize: "vertical" }} />
                  </div>

                  <div>
                    <button onClick={() => saveStep(activeStep.step_no)} style={{ padding: ".6rem 1.2rem", borderRadius: 10, border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer", font: "inherit", fontSize: ".9rem", fontWeight: 700 }}>Simpan penilaian</button>
                  </div>
                </div>
              ) : null}
            </>
            )}
          </Panel>
        );
      }
      case "marketing": return <Panel title="Marketing" sub="Nilai & skor performa website + social media agen: SEO, GEO, social search, kata kunci, kecepatan, engagement, efisiensi, dan potensi ditemukan mesin AI."><MarketingScore /></Panel>;
      case "setting": return <Placeholder title="Setting" sub="Pengaturan umum platform." note="Branding, domain, paket harga, dan notifikasi." />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <aside className="adm-side" style={{ width: 244, flex: "none", background: "var(--surface)", borderRight: "1px solid var(--line)", padding: "18px 14px", position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px 18px" }}>
          <CakraMark size={30} /><span className="hand" style={{ fontSize: "1.7rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>
          <span className="pill" style={{ fontSize: ".62rem", padding: ".15rem .45rem" }}>backend</span>
        </div>
        <nav style={{ display: "grid", gap: 3 }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setSec(n.id)} style={{ display: "flex", alignItems: "center", gap: 11, padding: ".65rem .7rem", borderRadius: 10, border: "none", cursor: "pointer", font: "inherit", fontSize: ".95rem", fontWeight: sec === n.id ? 600 : 500, textAlign: "left", background: sec === n.id ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: sec === n.id ? "var(--brand)" : "var(--ink-2)", transition: ".15s" }}>
              <Ic d={n.icon} />{n.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: "auto", padding: "12px 8px 0", borderTop: "1px solid var(--line)", display: "grid", gap: 10 }}>
          <a href="https://cakra.xyz" className="muted" style={{ fontSize: ".85rem", textDecoration: "none" }}>← Kembali ke situs</a>
          <a href="?view=member" className="muted" style={{ fontSize: ".85rem", textDecoration: "none" }}>↪ Buka dashboard member</a>
          {onSignOut && <button onClick={onSignOut} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 8px", borderRadius: 10, border: "1px solid var(--line)", background: "transparent", color: "var(--ink-2)", cursor: "pointer", font: "inherit", fontSize: ".85rem", fontWeight: 600 }}>⎋ Keluar</button>}
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ height: 62, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(8px,3vw,32px)", background: "color-mix(in oklab, var(--bg) 86%, transparent)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 5 }}>
          <span style={{ fontSize: ".82rem", color: "var(--good)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={email}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor", flex: "none" }} />Admin{email ? ` · ${email}` : ""}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input placeholder="Cari member, listing…" style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 999, padding: ".5rem 1rem", font: "inherit", fontSize: ".88rem", color: "var(--ink)", width: 220, maxWidth: "40vw" }} />
            <ThemeToggle size={34} />
            {onSignOut && <button onClick={onSignOut} title="Keluar" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: ".45rem .85rem", borderRadius: 999, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", cursor: "pointer", font: "inherit", fontSize: ".82rem", fontWeight: 600, flex: "none" }}>⎋ Keluar</button>}
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: ".85rem", flex: "none" }}>{email ? email[0].toUpperCase() : "A"}</span>
          </div>
        </header>
        <main className="adm-main" style={{ padding: "clamp(22px,3vw,36px)", maxWidth: 1100 }}>{content()}</main>
      </div>
      <style>{`@media (max-width: 720px){ .adm-side{ display:none !important; } }`}</style>
    </div>
  );
}
