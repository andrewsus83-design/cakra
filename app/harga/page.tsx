import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Harga — Rp 300rb/bulan untuk semua alat kehadiran Anda",
  description:
    "Harga cakra: paket Gratis untuk memulai, Pro Rp 300.000/bulan (website + domain, listing tak terbatas, studio video & konten AI, GEO penuh), dan Studio/Agensi untuk tim. Tanpa kartu kredit untuk mulai.",
  alternates: { canonical: "/harga" },
  openGraph: {
    title: "Harga cakra — Rp 300rb/bulan",
    description: "Gratis untuk memulai · Pro Rp 300.000/bulan · Studio/Agensi untuk tim.",
    url: "https://cakra.xyz/harga",
  },
};

const TIERS = [
  {
    name: "Gratis",
    price: "Rp 0",
    per: "",
    tagline: "Bangun & lihat, tanpa risiko.",
    feats: [
      "Situs draf di subdomain cakra (namaanda.cakra.xyz)",
      "Skor Cakra + rincian 7 pusat kehadiran",
      "Hingga 3 listing",
      "Onboarding personalisasi 8 langkah",
    ],
    cta: "Mulai gratis",
    href: "/onboarding",
    hi: false,
  },
  {
    name: "Pro",
    price: "Rp 300rb",
    per: "/bulan",
    tagline: "Semua alat untuk jadi tak terlewatkan.",
    feats: [
      "Semua di Gratis, plus:",
      "Terbitkan situs + domain sendiri",
      "Listing tak terbatas — tiap unit punya halaman & skor GEO sendiri",
      "Studio video AI (film properti 45–90 dtk)",
      "Konten & artikel otomatis + jadwal terbit",
      "GEO penuh — dioptimasi agar dikutip Google & AI",
      "Pustaka aset + 3 voice karakter",
    ],
    cta: "Pilih Pro",
    href: "/signup",
    hi: true,
  },
  {
    name: "Studio / Agensi",
    price: "Hubungi kami",
    per: "",
    tagline: "Untuk tim & brand properti.",
    feats: [
      "Semua di Pro, untuk banyak agen:",
      "Multi-seat & peran tim",
      "Pustaka brand & aset bersama",
      "Analitik & Skor Cakra tingkat tim",
      "Onboarding didampingi",
    ],
    cta: "Bicara dengan kami",
    href: "/contact",
    hi: false,
  },
];

const SOON = [
  ["Otomasi media sosial", "Jadwal & posting otomatis ke Instagram, TikTok, dan lainnya."],
  ["Analitik mendalam", "Lacak lead, sumber, dan konversi — bukan sekadar kunjungan."],
  ["Integrasi WhatsApp", "Balas otomatis & rutekan lead langsung ke WhatsApp Anda."],
  ["Manajemen & analitik ads", "Kelola belanja iklan dan ukur hasilnya dari satu tempat."],
];

export default function Harga() {
  return (
    <main className="wrap" style={{ padding: "clamp(48px, 8vw, 96px) 0 64px" }}>
      <div style={{ textAlign: "center", maxWidth: "44ch", margin: "0 auto 12px" }}>
        <span className="hand" style={{ fontSize: "1.9rem", color: "var(--brand)", display: "inline-block", transform: "rotate(-2deg)" }}>harga jujur</span>
        <h1 className="display" style={{ fontWeight: 700, fontSize: "clamp(2.4rem, 5vw, 3.6rem)", lineHeight: 1.05, margin: "4px 0 0" }}>
          Satu langganan, seluruh kehadiran Anda.
        </h1>
      </div>
      <p className="lead" style={{ textAlign: "center", margin: "16px auto 8px", maxWidth: "58ch" }}>
        Rp 300.000/bulan — kurang dari 0,1% komisi dari satu vila Rp 3 M. Satu listing tambahan yang closing menutup biaya cakra setahun penuh.
      </p>

      {/* Tiers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22, alignItems: "stretch", margin: "44px 0 0", maxWidth: 1080, marginInline: "auto" }}>
        {TIERS.map((t) => (
          <div key={t.name} className="card" style={{ padding: "clamp(26px, 3vw, 34px)", display: "flex", flexDirection: "column", position: "relative", borderColor: t.hi ? "var(--brand)" : "var(--line)", borderWidth: t.hi ? 2 : 1, background: t.hi ? "color-mix(in oklab, var(--brand) 6%, var(--surface))" : "var(--surface)" }}>
            {t.hi && <span className="pill" style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "var(--brand)", color: "#fff", fontSize: ".74rem", fontWeight: 700 }}>Paling populer</span>}
            <div className="eyebrow" style={{ color: t.hi ? "var(--brand)" : "var(--muted)" }}>{t.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5, margin: "10px 0 2px" }}>
              <span className="display" style={{ fontSize: "2.3rem", fontWeight: 700 }}>{t.price}</span>
              {t.per && <span className="muted mono" style={{ fontSize: ".95rem" }}>{t.per}</span>}
            </div>
            <div className="muted" style={{ fontSize: ".95rem", marginBottom: 20 }}>{t.tagline}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 26px", display: "grid", gap: 11 }}>
              {t.feats.map((f) => (
                <li key={f} style={{ display: "flex", gap: 10, fontSize: ".96rem", alignItems: "flex-start", lineHeight: 1.4, fontWeight: f.endsWith(":") ? 600 : 400, color: f.endsWith(":") ? "var(--ink-2)" : "var(--ink)" }}>
                  {!f.endsWith(":") && (
                    <span style={{ color: "var(--good)", flex: "none", marginTop: 2 }} aria-hidden="true">
                      <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.42z" /></svg>
                    </span>
                  )}
                  {f}
                </li>
              ))}
            </ul>
            <Link href={t.href} className={t.hi ? "btn btn-brand" : "btn btn-ghost"} style={{ marginTop: "auto", justifyContent: "center", padding: ".9rem" }}>{t.cta}</Link>
          </div>
        ))}
      </div>
      <p className="muted" style={{ textAlign: "center", marginTop: 22, fontSize: ".9rem" }}>
        Gratis untuk memulai — tanpa kartu kredit. Berhenti kapan saja, tanpa penalti. Website, domain, konten, dan lead selalu milik Anda.
      </p>

      {/* Phase 2 roadmap */}
      <section style={{ marginTop: 72 }}>
        <SectionTitle hand="segera hadir" max="24ch">Yang berikutnya masuk paket Pro.</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, maxWidth: 980, marginInline: "auto" }}>
          {SOON.map(([t, d]) => (
            <div key={t} className="card" style={{ padding: 26, background: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className="pill" style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--brand)", background: "color-mix(in oklab, var(--brand) 12%, var(--surface))" }}>Segera</span>
              </div>
              <h3 className="display" style={{ fontSize: "1.3rem", fontWeight: 600, margin: "0 0 6px" }}>{t}</h3>
              <p className="muted" style={{ fontSize: ".95rem", margin: 0, lineHeight: 1.5 }}>{d}</p>
            </div>
          ))}
        </div>
        <p className="muted" style={{ textAlign: "center", marginTop: 20, fontSize: ".92rem" }}>
          Fitur baru masuk paket Pro tanpa biaya tambahan selama Anda berlangganan.
        </p>
      </section>

      {/* CTA */}
      <section style={{ marginTop: 72, textAlign: "center" }}>
        <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(1.9rem, 3.6vw, 2.6rem)", margin: "0 auto 10px", maxWidth: "20ch" }}>
          Coba dulu, gratis. Upgrade saat Anda siap.
        </h2>
        <p className="muted" style={{ margin: "0 auto 26px", maxWidth: "46ch", fontSize: "1.05rem" }}>
          Bangun situs & Skor Cakra Anda tanpa kartu kredit. Rasakan hasilnya sebelum membayar.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/onboarding" className="btn btn-brand" style={{ padding: ".9rem 1.7rem", fontSize: "1rem" }}>Mulai gratis</Link>
          <Link href="/demo" className="btn btn-ghost" style={{ padding: ".9rem 1.7rem", fontSize: "1rem" }}>Lihat contoh website →</Link>
        </div>
      </section>
    </main>
  );
}
