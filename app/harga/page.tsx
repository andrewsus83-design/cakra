import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Harga — Rp 300rb/bulan untuk semua alat kehadiran Anda",
  description:
    "Harga cakra: paket Pro Rp 300.000/bulan — Website Builder, Smart Listing, Editor video AI, Assets, dan konten relevan yang selalu terkini. Business (segera hadir) dan Studio/Agensi untuk tim.",
  alternates: { canonical: "/harga" },
  openGraph: {
    title: "Harga cakra — Rp 300rb/bulan",
    description: "Website, listing, editor video AI, aset, dan konten terkini — semua dalam satu paket Pro Rp 300.000/bulan.",
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
      "Website Builder + domain sendiri",
      "Smart Listing tak terbatas (halaman & skor GEO per unit)",
      "Editor video AI (film properti 45–90 dtk)",
      "Konten & artikel otomatis + jadwal terbit",
      "Assets: pustaka bebas royalti + 3 voice",
      "GEO penuh, Skor Cakra & analitik kehadiran",
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

const PILLARS = [
  {
    name: "Website Builder",
    tone: "--c-eye",
    icon: "M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-6v2h3v2H7v-2h3v-2H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z",
    tagline: "Situs profesional Anda, jadi dalam hitungan menit.",
    body: "Domain sendiri, desain premium, ngebut di ponsel, dan siap tampil di Google maupun pencarian AI. Tanpa koding, tanpa menunggu developer.",
    replaces: "Menggantikan jasa web developer",
  },
  {
    name: "Smart Listing",
    tone: "--c-throat",
    icon: "M4 5h16v3H4zM4 10.5h16v3H4zM4 16h16v3H4z",
    tagline: "Setiap properti bekerja untuk Anda.",
    body: "Kelola semua unit dari satu tempat. Tiap listing punya halaman & skor pencarian lokal (GEO) sendiri, plus tombol WhatsApp — otomatis dioptimasi agar ditemukan pembeli yang tepat.",
    replaces: "Menggantikan biaya portal + entri manual",
  },
  {
    name: "Editor",
    tone: "--c-heart",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-2.5 5.5 8 4.5-8 4.5v-9Z",
    tagline: "Foto jadi film properti — otomatis.",
    body: "Ubah foto & deskripsi menjadi video sinematik 45–90 detik lengkap dengan musik dan voice. Dirender di latar belakang, bisa antre banyak sekaligus, sambil Anda tetap bekerja.",
    replaces: "Menggantikan videografer & editor",
  },
  {
    name: "Assets",
    tone: "--c-solar",
    icon: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z",
    tagline: "Semua bahan siap pakai.",
    body: "Ribuan gambar & audio bebas royalti plus 3 voice karakter eksklusif Anda, tersortir rapi per format (1:1, 9:16, 16:9). Tanpa biaya lisensi tambahan.",
    replaces: "Menggantikan langganan pustaka stok",
  },
  {
    name: "Konten Relevan & Terkini",
    tone: "--c-crown",
    icon: "M6 2h9l5 5v14.2A.8.8 0 0 1 19.2 22H6a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 6 2Zm2 9h8v1.8H8zm0 4h8v1.8H8z",
    tagline: "Selalu punya sesuatu untuk dibagikan.",
    body: "Artikel pasar, panduan area, dan ide konten segar dari riset AI — disesuaikan dengan properti & area Anda, terbit terjadwal agar Anda tetap relevan minggu demi minggu.",
    replaces: "Menggantikan penulis konten & agensi",
  },
];

const COMPARE: [string, string][] = [
  ["Website + domain profesional", "Rp 500rb–2 jt / bln"],
  ["Video properti (per unit)", "Rp 500rb–1,5 jt / video"],
  ["Artikel & konten pemasaran", "Rp 300rb–1 jt / artikel"],
  ["Pustaka aset & musik", "Rp 150rb–500rb / bln"],
  ["Optimasi SEO/GEO & analitik", "Rp 500rb+ / bln"],
];

export default function Harga() {
  return (
    <main className="wrap" style={{ padding: "clamp(48px, 8vw, 96px) 0 64px" }}>
      <div style={{ textAlign: "center", maxWidth: "min(760px, 94vw)", margin: "0 auto 12px" }}>
        <span className="hand" style={{ fontSize: "1.9rem", color: "var(--brand)", display: "inline-block", transform: "rotate(-2deg)" }}>harga jujur</span>
        <h1 className="display" style={{ fontWeight: 700, fontSize: "clamp(2.2rem, 5vw, 3.4rem)", lineHeight: 1.06, margin: "4px 0 0", textWrap: "balance" }}>
          Satu langganan,<br />seluruh kehadiran Anda.
        </h1>
      </div>
      <p className="lead" style={{ textAlign: "center", margin: "16px auto 8px", maxWidth: "60ch" }}>
        Lima alat yang biasanya dibeli terpisah dan berbiaya jutaan — website, listing, video, aset, dan konten — kini jadi satu paket. Bangun, terbitkan, dan bertumbuh tanpa berpindah aplikasi.
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

      {/* WHAT'S INSIDE — 5 pillars */}
      <section style={{ marginTop: 84 }}>
        <SectionTitle hand="isi paket Pro" max="24ch">Lima alat, satu langganan.</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, maxWidth: 1080, marginInline: "auto" }}>
          {PILLARS.map((p, i) => (
            <div key={p.name} className="card" style={{ padding: "clamp(24px, 2.6vw, 32px)", display: "flex", flexDirection: "column", gridColumn: i === 4 ? undefined : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <span style={{ width: 48, height: 48, borderRadius: 13, flex: "none", display: "grid", placeItems: "center", background: `color-mix(in oklab, var(${p.tone}) 16%, var(--surface))`, color: `var(${p.tone})` }}>
                  <svg viewBox="0 0 24 24" width={26} height={26} fill="currentColor" aria-hidden="true"><path d={p.icon} /></svg>
                </span>
                <div>
                  <div className="mono" style={{ fontSize: ".7rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)" }}>0{i + 1}</div>
                  <h3 className="display" style={{ fontSize: "1.4rem", fontWeight: 600, margin: 0 }}>{p.name}</h3>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: "1.02rem", marginBottom: 6 }}>{p.tagline}</div>
              <p className="muted" style={{ fontSize: ".97rem", lineHeight: 1.6, margin: "0 0 14px" }}>{p.body}</p>
              <div style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 7, fontSize: ".82rem", fontWeight: 600, color: `var(${p.tone})` }}>
                <span aria-hidden="true">↔</span> {p.replaces}
              </div>
            </div>
          ))}
          {/* value note filling the 6th cell on 3-col / balancing on 2-col */}
          <div className="card" style={{ padding: "clamp(24px, 2.6vw, 32px)", background: "color-mix(in oklab, var(--brand) 8%, var(--surface))", borderColor: "color-mix(in oklab, var(--brand) 26%, var(--line))", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span className="hand gold" style={{ fontSize: "1.6rem", transform: "rotate(-2deg)", display: "inline-block" }}>satu langganan</span>
            <div className="display" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)", fontWeight: 700, lineHeight: 1.05, margin: "6px 0 8px" }}>Rp 300rb <span className="muted mono" style={{ fontSize: "1rem", fontWeight: 500 }}>/ bulan</span></div>
            <p className="muted" style={{ fontSize: ".97rem", lineHeight: 1.6, margin: 0 }}>Kelima alat di atas — bekerja bersama, saling terhubung, dan terus diperbarui. Bukan lima tagihan, satu.</p>
          </div>
        </div>
      </section>

      {/* VALUE COMPARISON */}
      <section style={{ marginTop: 84 }}>
        <SectionTitle hand="bandingkan" max="26ch">Rp 300rb, dibanding beli terpisah.</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 980, marginInline: "auto", alignItems: "stretch" }} className="cmp-grid">
          {/* separate */}
          <div className="card" style={{ padding: "clamp(26px, 3vw, 36px)", display: "flex", flexDirection: "column" }}>
            <div className="eyebrow" style={{ color: "var(--muted)" }}>Kalau beli terpisah</div>
            <div style={{ display: "grid", gap: 12, margin: "18px 0 20px" }}>
              {COMPARE.map(([label, price]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
                  <span style={{ fontSize: ".95rem" }}>{label}</span>
                  <span className="mono muted" style={{ fontSize: ".86rem", whiteSpace: "nowrap", flex: "none" }}>{price}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto" }}>
              <div className="muted" style={{ fontSize: ".82rem" }}>Perkiraan total</div>
              <div className="display" style={{ fontSize: "clamp(1.7rem, 3vw, 2.3rem)", fontWeight: 700, color: "var(--muted)", lineHeight: 1.1 }}>Jutaan rupiah <span style={{ fontSize: "1rem", fontWeight: 500 }}>/ bulan</span></div>
              <div className="muted" style={{ fontSize: ".84rem", marginTop: 6 }}>…dan Anda mengelola 5 aplikasi &amp; 5 tagihan berbeda.</div>
            </div>
          </div>
          {/* cakra */}
          <div className="card" style={{ padding: "clamp(26px, 3vw, 36px)", display: "flex", flexDirection: "column", borderColor: "var(--brand)", borderWidth: 2, background: "color-mix(in oklab, var(--brand) 7%, var(--surface))" }}>
            <div className="eyebrow" style={{ color: "var(--brand)" }}>Dengan cakra Pro</div>
            <div style={{ display: "grid", gap: 12, margin: "18px 0 20px" }}>
              {["Website + domain", "Listing tak terbatas + GEO", "Video AI tak terbatas antre", "Pustaka aset + 3 voice", "SEO/GEO, konten & analitik"].map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
                  <span style={{ color: "var(--good)", flex: "none", marginTop: 1 }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.42z" /></svg>
                  </span>
                  <span style={{ fontSize: ".95rem" }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto" }}>
              <div className="muted" style={{ fontSize: ".82rem" }}>Satu harga, semuanya</div>
              <div className="display" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)", fontWeight: 700, color: "var(--brand)", lineHeight: 1.1 }}>Rp 300rb <span className="muted mono" style={{ fontSize: "1rem", fontWeight: 500 }}>/ bulan</span></div>
              <div className="muted" style={{ fontSize: ".84rem", marginTop: 6 }}>Satu aplikasi, satu tagihan, semua saling terhubung.</div>
            </div>
          </div>
        </div>
        <p className="muted" style={{ textAlign: "center", marginTop: 18, fontSize: ".84rem", maxWidth: "60ch", marginInline: "auto" }}>
          Kisaran harga di atas adalah perkiraan pasar untuk layanan sejenis, hanya sebagai gambaran nilai.
        </p>
      </section>

      {/* CTA */}
      <section style={{ marginTop: 84, textAlign: "center" }}>
        <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(1.9rem, 3.6vw, 2.6rem)", margin: "0 auto 10px", maxWidth: "22ch" }}>
          Lima alat. Satu langganan. Rp 300rb.
        </h2>
        <p className="muted" style={{ margin: "0 auto 26px", maxWidth: "46ch", fontSize: "1.05rem" }}>
          Mulai bangun website & Skor Cakra Anda hari ini — onboarding singkat, tanpa kartu kredit.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/onboarding" className="btn btn-brand" style={{ padding: ".9rem 1.7rem", fontSize: "1rem" }}>Mulai sekarang</Link>
          <Link href="/demo" className="btn btn-ghost" style={{ padding: ".9rem 1.7rem", fontSize: "1rem" }}>Lihat contoh website →</Link>
        </div>
      </section>

      <style>{`@media (max-width: 720px){ .cmp-grid{ grid-template-columns:1fr !important; } }`}</style>
    </main>
  );
}
