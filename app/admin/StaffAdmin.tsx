"use client";
import { useState } from "react";
import { CakraMark } from "@/components/CakraMark";
import { ThemeToggle } from "@/components/ThemeToggle";

type Section = "dashboard" | "member" | "assets" | "listing" | "hub" | "editor" | "llm" | "setting";

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" },
  { id: "member", label: "Member", icon: "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.7 0-6 1.3-6 4v3h8v-3c0-1 .4-1.9 1-2.6C7.9 13.1 6.9 13 8 13Zm8 0c-2.7 0-8 1.3-8 4v3h16v-3c0-2.7-5.3-4-8-4Z" },
  { id: "assets", label: "Assets", icon: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z" },
  { id: "listing", label: "Listing", icon: "M12 3 2.5 11H5v10h5v-6h4v6h5V11h2.5z" },
  { id: "hub", label: "Hub", icon: "M6 2h9l5 5v14.2A.8.8 0 0 1 19.2 22H6a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 6 2Zm2 9h8v1.8H8zm0 4h8v1.8H8z" },
  { id: "editor", label: "Editor setting", icon: "M4 20h4L18.5 9.5l-4-4L4 16v4ZM17 3.5l3.5 3.5 1.4-1.4a1.5 1.5 0 0 0 0-2.1L20.6 2.1a1.5 1.5 0 0 0-2.1 0L17 3.5Z" },
  { id: "llm", label: "LLM & API", icon: "M9 3h6v3h4v4h-3v4h3v4h-4v3H9v-3H5v-4h3v-4H5V6h4V3Zm2 8v2h2v-2h-2Z" },
  { id: "setting", label: "Setting", icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 4-2 .3a7 7 0 0 1-.5 1.3l1.2 1.7-1.4 1.4-1.7-1.2a7 7 0 0 1-1.3.5L14.3 20H9.7l-.3-2a7 7 0 0 1-1.3-.5l-1.7 1.2-1.4-1.4 1.2-1.7a7 7 0 0 1-.5-1.3L3 12l.3-2a7 7 0 0 1 .5-1.3L2.6 7 4 5.6l1.7 1.2A7 7 0 0 1 7 6.3L9.7 4h4.6l.3 2c.5.1.9.3 1.3.5l1.7-1.2L19 6.7l-1.2 1.7c.2.4.4.8.5 1.3L21 10v2Z" },
];

const MEMBERS = [
  { n: "Kirana Sutanto", e: "kirana@email.com", plan: "Pro", st: "Aktif", site: "kirana.cakra.site", area: "Bali" },
  { n: "Andi Pratama", e: "andi@email.com", plan: "Pro", st: "Aktif", site: "andipratama.cakra.site", area: "Jakarta" },
  { n: "Sarah Wijaya", e: "sarah@email.com", plan: "Starter", st: "Aktif", site: "sarahwijaya.cakra.site", area: "Bandung" },
  { n: "Budi Santoso", e: "budi@email.com", plan: "Pro", st: "Trial", site: "budisantoso.cakra.site", area: "Jakarta" },
  { n: "Made Surya", e: "made@email.com", plan: "Starter", st: "Aktif", site: "madesurya.cakra.site", area: "Bali" },
  { n: "Dewi Lestari", e: "dewi@email.com", plan: "Pro", st: "Aktif", site: "dewilestari.cakra.site", area: "Surabaya" },
  { n: "Rian Hakim", e: "rian@email.com", plan: "Starter", st: "Nonaktif", site: "rianhakim.cakra.site", area: "Bogor" },
];
const STATS = [
  { l: "Total member", v: "148", d: "+12 bulan ini", c: "--c-eye" },
  { l: "Website aktif", v: "132", d: "89% dari member", c: "--c-heart" },
  { l: "Total listing", v: "1.240", d: "+86 minggu ini", c: "--c-throat" },
  { l: "MRR", v: "Rp 42 jt", d: "+8% MoM", c: "--c-solar" },
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

function Ic({ d }: { d: string }) { return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d={d} /></svg>; }
function stColor(st: string) { return st === "Aktif" ? "var(--good)" : st === "Trial" ? "var(--warn)" : "var(--crit)"; }
function Panel({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return <div><h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }} className="display">{title}</h1>{sub && <p className="muted" style={{ margin: "4px 0 22px" }}>{sub}</p>}{children}</div>;
}
function Placeholder({ title, sub, note }: { title: string; sub: string; note: string }) {
  return <Panel title={title} sub={sub}><div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>{note}</div></Panel>;
}

export function StaffAdmin() {
  const [sec, setSec] = useState<Section>("dashboard");
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const Members = (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".92rem", minWidth: 720 }}>
          <thead><tr style={{ textAlign: "left", color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{["Member", "Paket", "Status", "Website", "Area"].map((h) => <th key={h} style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>{h}</th>)}</tr></thead>
          <tbody>
            {MEMBERS.map((m) => (
              <tr key={m.e}>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: "color-mix(in oklab, var(--brand) 18%, var(--surface))", color: "var(--brand)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: ".82rem" }}>{m.n[0]}</span>
                    <div><div style={{ fontWeight: 600 }}>{m.n}</div><div className="muted" style={{ fontSize: ".82rem" }}>{m.e}</div></div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}><span className="pill">{m.plan}</span></td>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: stColor(m.st), fontWeight: 600 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor" }} />{m.st}</span></td>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}><span className="mono" style={{ fontSize: ".84rem" }}>{m.site}</span></td>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }} className="muted">{m.area}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const content = () => {
    switch (sec) {
      case "dashboard":
        return (
          <Panel title="Dashboard" sub="Ringkasan platform cakra — data contoh.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18, marginBottom: 26 }}>
              {STATS.map((s) => (
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
      case "member": return <Panel title="Member" sub="Kelola agen yang terdaftar di cakra.">{Members}</Panel>;
      case "llm":
        return (
          <Panel title="LLM & API" sub="Kunci API untuk seluruh platform — masukkan sekali, dipakai bersama Supabase & Vercel.">
            <div className="card" style={{ padding: "14px 18px", marginBottom: 18, background: "color-mix(in oklab, var(--brand) 7%, var(--surface))", borderColor: "color-mix(in oklab, var(--brand) 22%, var(--line))", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: ".9rem", flex: 1, minWidth: 240 }}>
                Isi setiap kunci sekali di sini. Tag <b style={{ color: "var(--c-eye)" }}>Vercel</b> = build env (NEXT_PUBLIC_*), <b style={{ color: "var(--c-throat)" }}>Supabase</b> = Edge Function secret tempat pipeline berjalan. Nama env sama di kedua platform.
              </span>
              <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2200); }} style={{ background: "var(--brand)", color: "#fff", border: "none", borderRadius: 10, padding: ".6rem 1.2rem", font: "inherit", fontWeight: 600, fontSize: ".9rem", cursor: "pointer", flex: "none" }}>{saved ? "✓ Tersimpan" : "Simpan semua"}</button>
            </div>
            {saved && <p style={{ fontSize: ".82rem", color: "var(--good)", margin: "0 0 14px" }}>Kunci akan disinkron ke Supabase Edge secrets & Vercel env saat backend aktif.</p>}
            <div style={{ display: "grid", gap: 18 }}>
              {API_KEYS.map((grp) => (
                <div key={grp.group} className="card" style={{ padding: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>{grp.group}</div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {grp.items.map((it) => {
                      const filled = !!keys[it.env];
                      return (
                        <div key={it.env} style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1fr) 1.4fr", gap: 14, alignItems: "center" }} className="api-row">
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
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <input type="password" value={keys[it.env] || ""} placeholder={it.ph || "•••••••••••• (tempel kunci)"} onChange={(e) => setKeys((k) => ({ ...k, [it.env]: e.target.value }))} style={{ flex: 1, minWidth: 0, background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 9, padding: ".55rem .8rem", font: "inherit", fontSize: ".86rem", color: "var(--ink)" }} />
                            <span style={{ flex: "none", width: 9, height: 9, borderRadius: "50%", background: filled ? "var(--good)" : "var(--line-2)" }} title={filled ? "Terisi" : "Kosong"} />
                          </div>
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
      case "assets": return <Placeholder title="Assets" sub="Pustaka gambar & audio bebas royalti untuk semua member." note="Kelola aset pustaka cakra — unggah, kategorikan, bagikan ke member." />;
      case "listing": return <Placeholder title="Listing" sub="Semua listing properti lintas member." note="Tabel listing global dengan filter lokasi, harga, dan status." />;
      case "hub": return <Placeholder title="Hub" sub="Kurasi artikel & konten yang tampil di Hub." note="Editor konten Hub — publikasikan artikel pasar & panduan." />;
      case "editor": return <Placeholder title="Editor setting" sub="Konfigurasi editor website & video AI." note="Preset tema, blok, dan parameter video (durasi, gaya, musik)." />;
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
        <div style={{ marginTop: "auto", padding: "12px 8px 0", borderTop: "1px solid var(--line)" }}>
          <a href="/" className="muted" style={{ fontSize: ".85rem", textDecoration: "none" }}>← Kembali ke situs</a>
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ height: 62, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(8px,3vw,32px)", background: "color-mix(in oklab, var(--bg) 86%, transparent)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 5 }}>
          <span style={{ fontSize: ".82rem", color: "var(--warn)", fontWeight: 600 }}>● Backend · mode terbuka tanpa autentikasi</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input placeholder="Cari member, listing…" style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 999, padding: ".5rem 1rem", font: "inherit", fontSize: ".88rem", color: "var(--ink)", width: 220, maxWidth: "40vw" }} />
            <ThemeToggle size={34} />
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: ".85rem" }}>A</span>
          </div>
        </header>
        <main className="adm-main" style={{ padding: "clamp(22px,3vw,36px)", maxWidth: 1100 }}>{content()}</main>
      </div>
      <style>{`@media (max-width: 720px){ .adm-side{ display:none !important; } }`}</style>
    </div>
  );
}
