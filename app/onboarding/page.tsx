"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CakraMark } from "@/components/CakraMark";

type FType = "text" | "email" | "tel" | "textarea" | "choice" | "multi" | "theme" | "font" | "domain" | "social";
type Field = { id: string; label: string; type: FType; ph?: string; optional?: boolean; options?: string[] };
type Page = { section: string; title: string; sub?: string; fields: Field[] };

const PAGES: Page[] = [
  {
    section: "Tentang Anda", title: "Kenalan dulu, yuk.", sub: "Data dasar untuk profil dan tombol kontak Anda.",
    fields: [
      { id: "nama", label: "Nama lengkap", type: "text", ph: "mis. Andi Pratama" },
      { id: "wa", label: "Nomor WhatsApp", type: "tel", ph: "08xx-xxxx-xxxx" },
      { id: "email", label: "Email", type: "email", ph: "anda@email.com" },
      { id: "kota", label: "Kota / area utama", type: "text", ph: "mis. Denpasar, Bali" },
    ],
  },
  {
    section: "Brand Anda", title: "Bagaimana Anda ingin dikenal?", sub: "Ini yang tampil besar di website Anda.",
    fields: [
      { id: "brand", label: "Nama brand atau nama tampilan", type: "text", ph: "mis. Andi Pratama Property" },
      { id: "tagline", label: "Tagline singkat (opsional)", type: "text", ph: "mis. Properti tepercaya di Bali", optional: true },
      { id: "pengalaman", label: "Pengalaman sebagai agen", type: "choice", options: ["< 1 tahun", "1–3 tahun", "3–7 tahun", "7+ tahun"] },
    ],
  },
  {
    section: "Keahlian & pasar", title: "Apa keahlian Anda?", sub: "Agar listing dan konten Anda tepat sasaran.",
    fields: [
      { id: "spesialisasi", label: "Spesialisasi (pilih satu atau lebih)", type: "multi", options: ["Rumah", "Apartemen", "Tanah", "Vila", "Komersial", "Sewa"] },
      { id: "area", label: "Area layanan", type: "text", ph: "mis. Canggu, Seminyak, Ubud" },
      { id: "harga", label: "Rentang harga properti", type: "choice", options: ["< Rp 1 M", "Rp 1–3 M", "Rp 3–10 M", "Rp 10 M+", "Beragam"] },
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
    section: "Alamat & bahasa", title: "Alamat website Anda.", sub: "Gratis di subdomain cakra — bisa pakai domain sendiri nanti.",
    fields: [
      { id: "domain", label: "Alamat website", type: "domain", ph: "namaanda" },
      { id: "bahasa", label: "Bahasa utama website", type: "choice", options: ["Indonesia", "English", "Keduanya"] },
    ],
  },
  {
    section: "Kehadiran & konten", title: "Sambungkan kehadiran Anda.", sub: "Untuk ditautkan di website Anda.",
    fields: [
      { id: "social", label: "Akun sosial (opsional, tanpa @)", type: "social", optional: true },
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
  { id: "elegan", name: "Elegan", pair: "Serif + sans", fam: "var(--font-display), Georgia, serif", weight: 600 },
  { id: "modern", name: "Modern", pair: "Sans tebal", fam: "var(--font-sans), system-ui, sans-serif", weight: 800 },
  { id: "klasik", name: "Klasik", pair: "Serif klasik", fam: "Georgia, 'Times New Roman', serif", weight: 700 },
];

const GEN_STEPS = ["Menyiapkan website Anda…", "Menata listing & halaman…", "Mengoptimasi SEO & GEO…", "Menyalakan skor kehadiran…"];

export default function Onboarding() {
  const [phase, setPhase] = useState<"welcome" | "form" | "generating" | "done">("welcome");
  const [pageIdx, setPageIdx] = useState(0);
  const [ans, setAns] = useState<Record<string, string | string[]>>({});
  const [genStep, setGenStep] = useState(0);

  const page = PAGES[pageIdx];
  const setVal = (id: string, v: string | string[]) => setAns((p) => ({ ...p, [id]: v }));
  const isFilled = (f: Field) => {
    if (f.optional || f.type === "social") return true;
    const v = ans[f.id];
    if (f.type === "multi") return Array.isArray(v) && v.length > 0;
    return typeof v === "string" && v.trim().length > 0;
  };
  const canNext = page ? page.fields.every(isFilled) : true;

  const next = () => { if (!canNext) return; if (pageIdx === PAGES.length - 1) setPhase("generating"); else setPageIdx(pageIdx + 1); };
  const back = () => { if (pageIdx === 0) setPhase("welcome"); else setPageIdx(pageIdx - 1); };

  useEffect(() => {
    if (phase !== "generating") return;
    setGenStep(0);
    const iv = setInterval(() => setGenStep((g) => g + 1), 850);
    const done = setTimeout(() => setPhase("done"), GEN_STEPS.length * 850 + 400);
    return () => { clearInterval(iv); clearTimeout(done); };
  }, [phase]);

  const domain = (ans.domain as string) || "namaanda";

  /* ── WELCOME (full-bleed) ── */
  if (phase === "welcome")
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 100, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-top.jpg" alt="Vila properti mewah saat golden hour" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="photo-scrim" />
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <CakraMark size={38} />
            <span className="hand on-photo" style={{ fontSize: "2.2rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>
          </Link>
          <Link href="/" aria-label="Keluar" className="btn btn-on-photo" style={{ width: 40, height: 40, padding: 0, display: "grid", placeItems: "center", borderRadius: 10 }}>✕</Link>
        </div>
        <div style={{ position: "relative", flex: 1, display: "grid", placeItems: "center", padding: "10px 24px 72px", textAlign: "center" }}>
          <div style={{ maxWidth: "min(680px, 92vw)" }}>
            <p className="hand" style={{ color: "var(--brand)", fontSize: "1.9rem", transform: "rotate(-2deg)", margin: 0 }}>selamat datang</p>
            <h1 className="display on-photo" style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", fontWeight: 700, lineHeight: 1.06, margin: "6px 0 0" }}>Bangun presence Anda<br />dalam beberapa menit.</h1>
            <p className="on-photo-soft" style={{ fontSize: "1.15rem", margin: "18px auto 28px", lineHeight: 1.6, maxWidth: "46ch" }}>Isi 8 langkah singkat — kami rangkai website, listing, dan skor kehadiran Anda secara otomatis.</p>
            <button onClick={() => { setPhase("form"); setPageIdx(0); }} className="btn btn-brand" style={{ fontSize: "1.08rem", padding: "1rem 2.1rem" }}>Mulai →</button>
            <p className="on-photo-soft" style={{ fontSize: ".85rem", marginTop: 16 }}>± 3 menit · gratis · tanpa kartu kredit</p>
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
        <Link href="/" aria-label="Keluar" style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 10, border: "1px solid var(--line-2)", color: "var(--ink)", textDecoration: "none" }}>✕</Link>
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
      <div style={{ maxWidth: "40ch", textAlign: "center" }}>
        <div style={{ width: 66, height: 66, margin: "0 auto 18px", borderRadius: "50%", display: "grid", placeItems: "center", background: "color-mix(in oklab, var(--good) 18%, var(--surface))", color: "var(--good)", fontSize: "1.9rem" }}>✓</div>
        <p className="hand gold" style={{ fontSize: "1.6rem", transform: "rotate(-2deg)", margin: 0 }}>website Anda siap</p>
        <h2 className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 700, margin: "4px 0 0" }}>Selamat, {String(ans.nama || "Agen").split(" ")[0]}!</h2>
        <div className="card" style={{ padding: "16px 20px", margin: "20px auto", display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--good)" }} />
          <span className="mono" style={{ fontSize: ".98rem" }}>{domain}.cakra.site</span>
        </div>
        <p className="muted" style={{ margin: "0 auto 24px", maxWidth: "38ch", lineHeight: 1.6 }}>Kami sudah menyiapkan draf website, halaman listing, dan skor kehadiran awal Anda. Langkah berikutnya: tinjau dan terbitkan.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" className="btn btn-brand" style={{ padding: ".9rem 1.7rem", fontSize: "1rem" }}>Masuk ke dashboard</Link>
          <Link href="/" className="btn btn-ghost" style={{ padding: ".9rem 1.7rem", fontSize: "1rem" }}>Kembali ke beranda</Link>
        </div>
      </div>,
      false
    );

  /* ── FORM PAGE ── */
  const renderField = (f: Field) => {
    const v = ans[f.id];
    switch (f.type) {
      case "text": case "email": case "tel":
        return <input type={f.type} value={(v as string) || ""} placeholder={f.ph} onChange={(e) => setVal(f.id, e.target.value)} className="ob-input" />;
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
                <div style={{ fontFamily: ft.fam, fontWeight: ft.weight, fontSize: "1.9rem", lineHeight: 1, marginBottom: 8, color: "var(--ink)" }}>Rumah Impian</div>
                <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{v === ft.id ? "✓ " : ""}{ft.name}</div>
                <div className="muted" style={{ fontSize: ".82rem" }}>{ft.pair}</div>
              </button>
            ))}
          </div>
        );
      case "domain":
        return (
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, maxWidth: 520, borderBottom: "2px solid var(--line-2)" }}>
            <input value={(v as string) || ""} placeholder={f.ph} onChange={(e) => setVal(f.id, e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", padding: ".5rem .1rem", font: "inherit", fontSize: "1.4rem", color: "var(--ink)", outline: "none" }} />
            <span className="mono" style={{ fontSize: "1.1rem", color: "var(--muted)", whiteSpace: "nowrap" }}>.cakra.site</span>
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
