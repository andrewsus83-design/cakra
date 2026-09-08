import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang cakra — Kehadiran Agen Properti di Era AI",
  description:
    "cakra lahir dari sesama agen properti agar Anda ditemukan di Google dan mesin pencari AI lewat website, konten, dan reputasi Anda sendiri.",
  keywords: [
    "agen properti",
    "website agen properti",
    "ditemukan di Google dan AI",
    "era pencarian AI",
    "GEO properti",
    "SEO agen properti",
    "kehadiran digital agen",
    "reputasi agen properti",
    "brand agen properti",
    "cakra",
  ],
  openGraph: {
    title: "cakra — Jadilah Agen Properti yang Tak Bisa Diabaikan AI",
    description:
      "Dunia kini mencari properti lewat Google, ChatGPT, dan media sosial. cakra membantu agen properti membangun kehadiran sendiri agar paling mudah ditemukan.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Tentang cakra",
  description:
    "cakra adalah platform kehadiran digital untuk agen properti di Indonesia agar ditemukan di Google dan mesin pencari AI lewat website, konten, dan reputasi sendiri.",
  inLanguage: "id-ID",
  publisher: { "@type": "Organization", name: "cakra", slogan: "be the agent AI can't ignore" },
};

const MASK_BOTTOM = "linear-gradient(180deg, #000 80%, transparent 100%)";
const MASK_BAND = "linear-gradient(180deg, transparent 0%, #000 17%, #000 83%, transparent 100%)";
const coverAbs: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

export default function Page() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ===== HERO ===== */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: MASK_BOTTOM, maskImage: MASK_BOTTOM }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/about/hero.jpg" alt="Vila mewah tropis Indonesia saat golden hour — kehadiran yang membangun kepercayaan" style={coverAbs} />
          <div className="photo-scrim" />
        </div>
        <div className="wrap" style={{ position: "relative", paddingTop: 128, paddingBottom: "clamp(104px, 14vh, 168px)" }}>
          <p className="hand" style={{ color: "var(--brand)", fontSize: "1.8rem", transform: "rotate(-2deg)", margin: 0 }}>Tentang cakra</p>
          <h1 className="display on-photo" style={{ fontSize: "clamp(2.4rem, 5.6vw, 4.4rem)", fontWeight: 700, maxWidth: "18ch", lineHeight: 1.04, marginTop: 8 }}>
            Di era pencarian AI, agen properti yang ditemukan lebih dulu yang paling dicari.
          </h1>
          <p className="on-photo-soft" style={{ fontSize: "1.22rem", maxWidth: "54ch", marginTop: 20, lineHeight: 1.6 }}>
            Pembeli tak lagi sekadar membuka aplikasi — mereka bertanya. Pada Google, pada ChatGPT, pada lini masa mereka: “Siapa agen properti yang bisa dipercaya di sini?” cakra hadir untuk memastikan satu hal: jawaban itu adalah nama Anda.
          </p>
          <p className="display" style={{ color: "var(--brand)", fontStyle: "italic", fontSize: "1.35rem", marginTop: 18 }}>“Be the agent AI can’t ignore.”</p>
          <div style={{ marginTop: 28 }}>
            <Link href="/signup" className="btn btn-brand" style={{ fontSize: "1.06rem", padding: ".95rem 1.9rem" }}>Klaim kehadiran Anda</Link>
          </div>
        </div>
      </section>

      {/* ===== PERGESERAN — split, image right ===== */}
      <section className="wrap" style={{ padding: "clamp(56px, 8vw, 104px) 0" }}>
        <div className="ab-split">
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Pergeseran era</div>
            <h2 className="display" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.9rem)", fontWeight: 700, lineHeight: 1.14, maxWidth: "16ch" }}>
              Dunia kini mencari properti lewat Google, ChatGPT, dan media sosial.
            </h2>
            <p className="muted" style={{ fontSize: "1.12rem", lineHeight: 1.65, marginTop: 18, maxWidth: "48ch" }}>
              Dulu orang mengetik alamat; kini mereka mengajukan pertanyaan. Mesin pencari dan asisten AI menjawab dalam hitungan detik, dan yang mereka sebut adalah agen yang kehadirannya paling jelas. Perilaku pencarian sudah bergeser — dan agen yang menyadarinya lebih dulu akan dicari lebih dulu.
            </p>
            <blockquote className="display" style={{ fontStyle: "italic", fontSize: "1.3rem", color: "var(--brand)", borderLeft: "3px solid var(--brand)", paddingLeft: 16, margin: "22px 0 0", lineHeight: 1.35 }}>
              Dulu orang mengetik alamat. Kini mereka bertanya.
            </blockquote>
            <div style={{ marginTop: 26 }}>
              <Link href="/faq" className="btn btn-ghost" style={{ fontSize: "1rem", padding: ".85rem 1.5rem" }}>Pahami era pencarian AI →</Link>
            </div>
          </div>
          <div className="ab-img" style={{ aspectRatio: "3 / 2" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/about/shift.jpg" alt="Tangan memegang ponsel di teras rumah saat senja — pencarian properti kini dimulai dari sebuah pertanyaan" />
          </div>
        </div>
      </section>

      {/* ===== ASAL-USUL — split, image left ===== */}
      <section className="wrap" style={{ padding: "clamp(56px, 8vw, 104px) 0" }}>
        <div className="ab-split ab-reverse">
          <div className="ab-img" style={{ aspectRatio: "3 / 2" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/about/origin.jpg" alt="Meja kerja agen properti earthy-lux — cakra dibuat oleh sesama agen" />
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Siapa di balik cakra</div>
            <h2 className="display" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.9rem)", fontWeight: 700, lineHeight: 1.14, maxWidth: "17ch" }}>
              Dibuat oleh sesama agen properti, untuk agen yang ingin namanya abadi.
            </h2>
            <p className="muted" style={{ fontSize: "1.12rem", lineHeight: 1.65, marginTop: 18, maxWidth: "48ch" }}>
              cakra tidak dirancang di menara kaca. Kami pernah menutup penjualan besar, lalu esok paginya kembali menjadi “tak terlihat” — jejak kami selalu menumpang di tempat orang lain. Maka kami membangun alat yang kami sendiri butuhkan, dan menguji setiap keputusan dengan satu pertanyaan: apakah ini membuat seorang agen lebih dipercaya?
            </p>
            <blockquote className="display" style={{ fontStyle: "italic", fontSize: "1.3rem", color: "var(--brand)", borderLeft: "3px solid var(--brand)", paddingLeft: 16, margin: "22px 0 0", lineHeight: 1.35 }}>
              Kalau sebuah alat tak membuat kami lebih dipercaya di lapangan, kami tak akan membangunnya.
            </blockquote>
            <div style={{ marginTop: 26 }}>
              <Link href="/contact" className="btn btn-ghost" style={{ fontSize: "1rem", padding: ".85rem 1.5rem" }}>Sapa tim di balik cakra →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRANSFORMASI — quote band ===== */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "78vh", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: MASK_BAND, maskImage: MASK_BAND }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/about/transform.jpg" alt="Satu rumah dengan pintu bercahaya hangat di ujung jalan — agen yang menjadi rujukan" style={coverAbs} />
          <div className="photo-scrim" />
        </div>
        <div className="wrap" style={{ position: "relative", textAlign: "center", padding: "90px 0" }}>
          <div className="eyebrow on-photo-soft" style={{ marginBottom: 10 }}>Dari tak terlihat menjadi tak terabaikan</div>
          <h2 className="display" style={{ color: "var(--brand)", fontSize: "1.15rem", fontWeight: 600, letterSpacing: ".01em", marginBottom: 18 }}>
            Ketika agen properti punya website, konten, dan reputasi sendiri
          </h2>
          <blockquote className="display on-photo" style={{ fontSize: "clamp(1.7rem, 3.6vw, 3rem)", fontWeight: 600, lineHeight: 1.22, maxWidth: "22ch", margin: "0 auto" }}>
            “Agen yang paling dicari bukan yang paling banyak beriklan — melainkan yang paling mudah ditemukan.”
          </blockquote>
          <p className="on-photo-soft" style={{ maxWidth: "58ch", margin: "22px auto 0", fontSize: "1.12rem", lineHeight: 1.6 }}>
            Bayangkan seorang agen yang dulu hanya dikenal di satu kompleks. Ia mulai memiliki kehadirannya sendiri — website-nya naik ke halaman pertama, kontennya dikutip asisten AI, reputasinya berbicara sebelum ia sempat memperkenalkan diri. Dalam hitungan bulan ia bukan lagi salah satu dari banyak; ia menjadi rujukan.
          </p>
          <div style={{ marginTop: 30 }}>
            <Link href="/listing" className="btn btn-on-photo" style={{ fontSize: "1.02rem", padding: ".9rem 1.7rem" }}>Lihat listing yang siap ditemukan →</Link>
          </div>
        </div>
      </section>

      {/* ===== VISI — 2-lane split ===== */}
      <section className="wrap" style={{ padding: "clamp(56px, 8vw, 104px) 0" }}>
        <div className="ab-split">
          <div className="ab-img" style={{ aspectRatio: "4 / 5" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/about/vision-hill.jpg" alt="Vila modern di lereng bukit saat fajar keemasan — masa depan agen properti cerdas" />
          </div>
          <div>
            <p className="hand gold" style={{ fontSize: "1.55rem", transform: "rotate(-2deg)", margin: 0 }}>Visi kami</p>
            <h2 className="display" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.9rem)", fontWeight: 700, lineHeight: 1.14, marginTop: 6, maxWidth: "16ch" }}>
              Masa depan milik agen properti cerdas yang ditemukan di Google dan AI.
            </h2>
            <p className="muted" style={{ fontSize: "1.12rem", lineHeight: 1.65, marginTop: 18, maxWidth: "48ch" }}>
              Kami membayangkan Indonesia di mana setiap agen hebat memutar roda kehadiran-nya sendiri — website, konten, dan reputasi yang selaras dan tak pernah padam. Bukan menggantikan cara lama, melainkan memperkuat agen di setiap titik pencarian baru. Sebab di dunia yang kini dijawab oleh AI, agen yang punya presence-lah yang menjadi jawaban.
            </p>
            <blockquote className="display" style={{ fontStyle: "italic", fontSize: "1.3rem", color: "var(--brand)", borderLeft: "3px solid var(--brand)", paddingLeft: 16, margin: "22px 0 0", lineHeight: 1.35 }}>
              Kehadiran yang Anda miliki, bukan yang Anda pinjam.
            </blockquote>
            <div style={{ marginTop: 26 }}>
              <Link href="/hub" className="btn btn-ghost" style={{ fontSize: "1rem", padding: ".85rem 1.5rem" }}>Jelajahi wawasan di Hub →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AJAKAN — closing invite band ===== */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "72vh", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: MASK_BAND, maskImage: MASK_BAND }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/about/invite.jpg" alt="Ambang pintu rumah Indonesia terbuka saat golden hour — undangan untuk melangkah masuk" style={coverAbs} />
          <div className="photo-scrim" />
        </div>
        <div className="wrap" style={{ position: "relative", textAlign: "center", padding: "90px 0" }}>
          <p className="hand" style={{ color: "var(--brand)", fontSize: "1.6rem", transform: "rotate(-2deg)", margin: 0 }}>Ajakan bergabung</p>
          <h2 className="display on-photo" style={{ fontSize: "clamp(2.1rem, 4.4vw, 3.4rem)", fontWeight: 700, maxWidth: "18ch", margin: "6px auto 0", lineHeight: 1.08 }}>
            Jadilah agen properti yang tak bisa diabaikan AI.
          </h2>
          <p className="on-photo-soft" style={{ maxWidth: "56ch", margin: "20px auto 0", fontSize: "1.14rem", lineHeight: 1.6 }}>
            Kehadiran Anda hari ini menentukan apakah Anda ditemukan esok hari. Mulai bangun roda kehadiran yang bekerja tanpa henti untuk Anda — sementara Anda fokus menutup transaksi. Dibuat oleh agen, dipakai oleh agen, untuk agen: kini giliran Anda mengambil tempat.
          </p>
          <div style={{ marginTop: 30, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" className="btn btn-brand" style={{ fontSize: "1.06rem", padding: ".95rem 1.9rem" }}>Bergabung jadi agen cerdas</Link>
            <Link href="/contact" className="btn btn-on-photo" style={{ fontSize: "1.06rem", padding: ".95rem 1.9rem" }}>Hubungi kami</Link>
          </div>
        </div>
      </section>

      <style>{`
        .ab-split{ display:grid; grid-template-columns:1fr 1fr; gap:clamp(28px,5vw,68px); align-items:center; }
        .ab-img{ border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow); }
        .ab-img img{ width:100%; height:100%; object-fit:cover; }
        @media (max-width: 860px){
          .ab-split{ grid-template-columns:1fr; gap:28px; }
          .ab-reverse .ab-img{ order:-1; }
        }
      `}</style>
    </main>
  );
}
