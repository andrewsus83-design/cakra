import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Harga — Rp 300rb/bulan untuk semua alat kehadiran Anda",
  description:
    "Harga cakra: paket Pro Rp 300.000/bulan (website + domain, listing tak terbatas, studio video & konten AI, GEO penuh). Business (segera hadir) dan Studio/Agensi untuk tim.",
  alternates: { canonical: "/harga" },
  openGraph: {
    title: "Harga cakra — Rp 300rb/bulan",
    description: "Pro Rp 300.000/bulan · Business segera hadir · Studio/Agensi untuk tim.",
    url: "https://cakra.xyz/harga",
  },
};

const TIERS = [
  {
    name: "Pro",
    price: "Rp 300rb",
    per: "/bulan",
    tagline: "Semua alat untuk jadi tak terlewatkan.",
    status: "active" as const,
    feats: [
      "Website profesional + domain sendiri",
      "Listing tak terbatas — tiap unit punya halaman & skor GEO sendiri",
      "Studio video AI (film properti 45–90 dtk)",
      "Konten & artikel otomatis + jadwal terbit",
      "GEO penuh — dioptimasi agar dikutip Google & AI",
      "Pustaka aset + 3 voice karakter",
      "Skor Cakra & analitik kehadiran",
    ],
    cta: "Mulai sekarang",
    href: "/onboarding",
    hi: true,
  },
  {
    name: "Business",
    price: "Segera hadir",
    per: "",
    tagline: "Otomasi & pertumbuhan tingkat lanjut.",
    status: "soon" as const,
    feats: [
      "Semua di Pro, plus:",
      "Otomasi media sosial (jadwal & posting otomatis)",
      "Analitik mendalam (lead, sumber, konversi)",
      "Integrasi WhatsApp (balas otomatis & rutekan lead)",
      "Manajemen & analitik belanja iklan",
    ],
    cta: "Beri tahu saya",
    href: "/contact",
    hi: false,
  },
  {
    name: "Studio / Agensi",
    price: "Hubungi kami",
    per: "",
    tagline: "Untuk tim & brand properti.",
    status: "active" as const,
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
        Website, listing, studio video & konten AI, dan Skor Cakra — semuanya dalam satu paket Pro. Bangun, terbitkan, dan bertumbuh tanpa alat terpisah.
      </p>

      {/* Tiers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22, alignItems: "stretch", margin: "44px auto 0", maxWidth: 1080 }}>
        {TIERS.map((t) => {
          const soon = t.status === "soon";
          return (
            <div key={t.name} className="card" style={{ padding: "clamp(26px, 3vw, 34px)", display: "flex", flexDirection: "column", position: "relative", borderColor: t.hi ? "var(--brand)" : "var(--line)", borderWidth: t.hi ? 2 : 1, background: t.hi ? "color-mix(in oklab, var(--brand) 6%, var(--surface))" : "var(--surface)", opacity: soon ? 0.92 : 1 }}>
              {t.hi && <span className="pill" style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "var(--brand)", color: "#fff", fontSize: ".74rem", fontWeight: 700 }}>Paling populer</span>}
              {soon && <span className="pill" style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "var(--bg)", fontSize: ".74rem", fontWeight: 700 }}>Coming soon</span>}
              <div className="eyebrow" style={{ color: t.hi ? "var(--brand)" : "var(--muted)" }}>{t.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, margin: "10px 0 2px" }}>
                <span className="display" style={{ fontSize: soon ? "1.7rem" : "2.3rem", fontWeight: 700 }}>{t.price}</span>
                {t.per && <span className="muted mono" style={{ fontSize: ".95rem" }}>{t.per}</span>}
              </div>
              <div className="muted" style={{ fontSize: ".95rem", marginBottom: 20 }}>{t.tagline}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 26px", display: "grid", gap: 11 }}>
                {t.feats.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, fontSize: ".96rem", alignItems: "flex-start", lineHeight: 1.4, fontWeight: f.endsWith(":") ? 600 : 400, color: f.endsWith(":") ? "var(--ink-2)" : "var(--ink)" }}>
                    {!f.endsWith(":") && (
                      <span style={{ color: soon ? "var(--muted)" : "var(--good)", flex: "none", marginTop: 2 }} aria-hidden="true">
                        <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.42z" /></svg>
                      </span>
                    )}
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={t.href} className={t.hi ? "btn btn-brand" : "btn btn-ghost"} style={{ marginTop: "auto", justifyContent: "center", padding: ".9rem" }}>{t.cta}</Link>
            </div>
          );
        })}
      </div>
      <p className="muted" style={{ textAlign: "center", marginTop: 22, fontSize: ".9rem" }}>
        Berhenti kapan saja, tanpa penalti. Website, domain, konten, dan lead selalu milik Anda.
      </p>

      {/* CTA */}
      <section style={{ marginTop: 76, textAlign: "center" }}>
        <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(1.9rem, 3.6vw, 2.6rem)", margin: "0 auto 10px", maxWidth: "20ch" }}>
          Siap jadi agen yang tak terlewatkan?
        </h2>
        <p className="muted" style={{ margin: "0 auto 26px", maxWidth: "46ch", fontSize: "1.05rem" }}>
          Mulai bangun website & Skor Cakra Anda hari ini — onboarding singkat, tanpa kartu kredit.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/onboarding" className="btn btn-brand" style={{ padding: ".9rem 1.7rem", fontSize: "1rem" }}>Mulai sekarang</Link>
          <Link href="/demo" className="btn btn-ghost" style={{ padding: ".9rem 1.7rem", fontSize: "1rem" }}>Lihat contoh website →</Link>
        </div>
      </section>
    </main>
  );
}
