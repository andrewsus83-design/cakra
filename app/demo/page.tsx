import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope, Dancing_Script } from "next/font/google";
import { SiteSkin } from "./SiteSkin";
import { ListingGrid } from "./ListingGrid";
import { LangToggle } from "./LangToggle";
import { Decor } from "@/components/Decor";

const display = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--k-font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--k-font-body" });
const script = Dancing_Script({ subsets: ["latin"], weight: ["600", "700"], variable: "--k-font-script" });

// Agent sites are always LIGHT — force a single light theme-color for this route so the mobile
// status bar matches the nav (server-rendered, survives dark mode, no reliance on client JS).
export const viewport: Viewport = {
  themeColor: "#F2F6F6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Situs Agen Properti — dibuat dengan cakra",
  description:
    "Contoh situs agen properti yang dibuat dengan cakra — website, listing, dan konten yang dioptimasi untuk pencarian.",
  keywords: ["agen properti", "situs agen properti", "website properti", "cakra"],
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Situs Agen Properti — dibuat dengan cakra",
    description: "Contoh situs agen properti yang dibuat dengan cakra.",
    type: "website",
    url: "https://cakra.xyz/demo",
    images: [{ url: "/about/transform.webp", width: 1200, height: 800, alt: "Vila premium Bali" }],
  },
};

// Pre-filled WhatsApp / email so every generated agent site captures leads out of the box.
const WA = "6281100000000";
const WA_MSG = encodeURIComponent("Halo, saya tertarik dengan properti Anda. Boleh saya minta info lebih lanjut?");
const WA_LINK = `https://wa.me/${WA}?text=${WA_MSG}`;
const EMAIL_LINK = "mailto:halo@cakra.xyz?subject=" + encodeURIComponent("Pertanyaan properti Bali");

// Social + Google Business — optional per agent, editable in the dashboard. Empty ones are hidden.
const SOCIALS: { label: string; href: string; d: string }[] = [
  { label: "Instagram", href: "#", d: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z" },
  { label: "TikTok", href: "#", d: "M14 3c.3 2.2 1.7 3.9 4 4.2v2.5c-1.5 0-2.9-.5-4-1.3v5.9a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 1 0 1.8 2.5V3H14Z" },
  { label: "YouTube", href: "#", d: "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z" },
  { label: "Facebook", href: "#", d: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" },
];
const GOOGLE_PROFILE = "#";

const NAV = [["Beranda", "#top"], ["Tentang", "#tentang"], ["Listing", "#listing"], ["Hub", "#hub"], ["FAQ", "#faq"]];

const STATS = [
  ["10+", "tahun pengalaman"],
  ["150+", "properti terjual & tersewa"],
  ["Rp 1,2 T+", "nilai transaksi"],
  ["4.9★", "rating klien"],
];

const LAYANAN = [
  { t: "Jual properti", d: "Memasarkan vila & properti premium Anda dengan strategi tepat sasaran — foto, video, dan jaringan pembeli serius.", i: "M3 12l9-9 9 9M5 10v10h14V10" },
  { t: "Sewa properti", d: "Menyewakan vila jangka panjang maupun musiman kepada penyewa berkualitas, dengan harga yang tepat.", i: "M4 7h16M4 7l2-3h12l2 3M6 7v13h12V7M9 20v-6h6v6" },
  { t: "Investasi & konsultasi", d: "Panduan investasi properti Bali — lokasi, legalitas, dan potensi imbal hasil yang realistis.", i: "M4 19V5m0 14h16M8 15l3-4 3 2 4-6" },
  { t: "Legal & serah terima", d: "Pendampingan notaris, pajak, dan seluruh proses hingga kunci berpindah tangan dengan aman.", i: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L15 10" },
];

const LISTINGS = [
  { t: "Vila Uluwatu Cliff", loc: "Uluwatu", tag: "Dijual", price: "Rp 14 M", beds: 5, baths: 5, size: 480, img: "/about/transform.webp" },
  { t: "Vila Canggu Estate", loc: "Canggu", tag: "Dijual", price: "Rp 8,5 M", beds: 4, baths: 4, size: 320, img: "/about/hero.webp" },
  { t: "Vila Seminyak Retreat", loc: "Seminyak", tag: "Disewa", price: "Rp 3,2 M", per: "/thn", beds: 3, baths: 3, size: 210, img: "/hero.webp" },
  { t: "Vila Ubud Valley", loc: "Ubud", tag: "Dijual", price: "Rp 11 M", beds: 4, baths: 4, size: 360, img: "/about/vision-hill.webp" },
  { t: "Vila Sanur Garden", loc: "Sanur", tag: "Disewa", price: "Rp 3,8 M", per: "/thn", beds: 4, baths: 3, size: 300, img: "/hero-top.webp" },
  { t: "Vila Jimbaran Bay", loc: "Jimbaran", tag: "Dijual", price: "Rp 9,3 M", beds: 4, baths: 4, size: 340, img: "/about/invite.webp" },
];

const AREAS = ["Canggu", "Seminyak", "Uluwatu", "Ubud", "Sanur", "Jimbaran", "Pererenan", "Nusa Dua"];

const PROSES = [
  { n: "01", t: "Konsultasi", d: "Kita bahas kebutuhan, anggaran, dan tujuan Anda — jual, sewa, atau investasi." },
  { n: "02", t: "Kurasi properti", d: "Saya sajikan pilihan terbaik yang benar-benar sesuai, bukan sekadar yang tersedia." },
  { n: "03", t: "Negosiasi & legal", d: "Saya negosiasikan harga terbaik dan memastikan legalitas Anda aman." },
  { n: "04", t: "Serah terima", d: "Dari tanda tangan hingga kunci di tangan, Anda ditemani sampai tuntas." },
];

const TESTI = [
  { q: "Kirana paham betul pasar vila Bali. Pembelian kami di Uluwatu berjalan mulus, dengan harga yang masuk akal.", n: "Andreas W.", r: "Pembeli vila · Uluwatu" },
  { q: "Vila kami tersewa cepat dengan penyewa berkualitas. Komunikasinya cepat, jujur, dan tanpa drama.", n: "Putri M.", r: "Pemilik vila · Canggu" },
  { q: "Sebagai pembeli asing, saya butuh kepastian legal. Kirana memandu setiap detail dengan sabar dan teliti.", n: "David L.", r: "Investor · Seminyak" },
];

const ARTICLES = [
  { c: "Pasar", t: "Panduan harga vila Canggu 2026", e: "Ke mana arah harga tanah & vila di koridor Berawa–Pererenan.", img: "/blog-0.webp" },
  { c: "Investasi", t: "ROI vila sewa: angka yang realistis", e: "Cara menghitung imbal hasil sewa tanpa asumsi berlebihan.", img: "/blog-1.webp" },
  { c: "Legal", t: "Hak pakai vs PT PMA untuk pembeli asing", e: "Struktur kepemilikan yang aman sebelum membeli di Bali.", img: "/blog-2.webp" },
];

const FAQS = [
  ["Apakah warga negara asing bisa memiliki properti di Bali?", "Ya, dengan struktur yang tepat. WNA umumnya tidak bisa memegang Hak Milik, tetapi bisa memakai Hak Pakai atas namanya, membeli secara leasehold (umumnya 25–30 tahun, dapat diperpanjang), atau berinvestasi lewat PT PMA untuk properti komersial/disewakan. Saya mendampingi pemilihan struktur bersama notaris/PPAT. (Informasi umum, bukan nasihat hukum.)"],
  ["Area mana saja yang Anda layani?", "Fokus di Bali Selatan — Canggu, Pererenan, Seminyak, Uluwatu, Jimbaran, Nusa Dua, Sanur — serta Ubud untuk vila & properti investasi."],
  ["Apa yang termasuk 'properti premium' di Bali?", "Di praktik saya, properti premium adalah vila dan hunian mulai Rp 3 miliar ke atas dengan lokasi utama, kualitas bangunan tinggi, dan status legal yang jelas."],
  ["Apa itu due diligence tanah dan mengapa penting?", "Proses memverifikasi keaslian sertifikat, status kepemilikan, zonasi, izin bangunan (PBG/IMB), serta memastikan tidak ada sengketa atau beban. Ini pengaman terpenting sebelum uang berpindah tangan."],
  ["Berapa sisa masa leasehold yang ideal saat membeli vila?", "Semakin panjang, semakin baik untuk nilai jual kembali. Saya menelaah sisa masa dan syarat perpanjangan sebelum Anda menawar — masa sewa pendek bisa menekan harga, tetapi juga menekan nilai di masa depan."],
  ["Berapa ROI realistis untuk vila sewa di Bali?", "Sangat bergantung pada lokasi, kualitas manajemen, okupansi nyata, dan struktur biaya. Angka yang beredar sering terlalu optimistis; saya lebih memilih menyusun proyeksi konservatif per properti berdasarkan data okupansi dan biaya nyata."],
  ["Berapa lama proses pembelian vila di Bali?", "Umumnya beberapa minggu hingga beberapa bulan, tergantung uji tuntas legal, negosiasi, dan struktur kepemilikan. Saya mendampingi dari kurasi hingga serah terima."],
  ["Apakah dana pembeli aman selama proses?", "Saya menganjurkan pembayaran bertahap dan penggunaan notaris/PPAT tepercaya, sehingga dana terlindungi sampai syarat terpenuhi."],
  ["Apakah semua vila boleh disewakan komersial?", "Tidak otomatis. Legalitas menyewakan bergantung pada zonasi dan izin — hal yang saya periksa sejak awal, khususnya untuk pembeli berorientasi investasi."],
  ["Berapa biaya jasa Anda?", "Transparan sejak awal. Komisi standar dibahas di muka, dengan rencana pemasaran (foto, video, iklan, jaringan) yang jelas."],
];

const parsePrice = (s: string) => Math.round(Number(s.replace(/[^0-9,]/g, "").replace(",", ".")) * 1e9);
const AGENT_ID = "https://cakra.xyz/demo#agent";
const PERSON_ID = "https://cakra.xyz/demo#person";
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": AGENT_ID,
      name: "Kirana Sutanto",
      url: "https://cakra.xyz/demo",
      image: "https://cakra.xyz/about/transform.webp",
      description: "Spesialis vila & properti premium di Bali untuk jual dan sewa, mulai Rp 3 miliar, dengan pengalaman lebih dari 10 tahun.",
      telephone: "+62-811-0000-000",
      priceRange: "Rp 3.000.000.000+",
      slogan: "Properti premium Bali, dari tangan yang benar-benar paham.",
      knowsAbout: ["vila premium Bali", "investasi properti Bali", "sewa vila Bali", "legalitas properti"],
      sameAs: [...SOCIALS.map((s) => s.href), GOOGLE_PROFILE],
      founder: { "@id": PERSON_ID },
      employee: { "@id": PERSON_ID },
      address: { "@type": "PostalAddress", streetAddress: "Jl. Pantai Berawa", addressLocality: "Canggu", addressRegion: "Bali", postalCode: "80361", addressCountry: "ID" },
      geo: { "@type": "GeoCoordinates", latitude: -8.66, longitude: 115.14 },
      areaServed: AREAS.map((a) => ({ "@type": "Place", name: `${a}, Bali` })),
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "150", bestRating: "5" },
      makesOffer: LISTINGS.map((p) => ({
        "@type": "Offer",
        name: p.t,
        priceCurrency: "IDR",
        price: parsePrice(p.price),
        availability: "https://schema.org/InStock",
        areaServed: `${p.loc}, Bali`,
        itemOffered: { "@type": "SingleFamilyResidence", name: p.t, numberOfRooms: p.beds, floorSize: { "@type": "QuantitativeValue", value: p.size, unitCode: "MTK" } },
      })),
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Kirana Sutanto",
      jobTitle: "Agen Properti · Spesialis Vila & Properti Premium Bali",
      image: "https://cakra.xyz/about/origin.webp",
      description: "Lebih dari 10 tahun di pasar properti premium Bali — mendampingi pembeli, pemilik, dan investor dari kurasi hingga serah terima, dengan prinsip kepercayaan lebih dulu.",
      url: "https://cakra.xyz/demo#tentang",
      worksFor: { "@id": AGENT_ID },
      knowsAbout: ["vila premium Bali", "investasi properti Bali", "sewa vila Bali", "legalitas properti (hak pakai, PT PMA)"],
      areaServed: "Bali, Indonesia",
    },
    {
      "@type": "ProfilePage",
      "@id": "https://cakra.xyz/demo#profile",
      mainEntity: { "@id": PERSON_ID },
      about: { "@id": AGENT_ID },
    },
    {
      "@type": "FAQPage",
      "@id": "https://cakra.xyz/demo#faq",
      mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ],
};

function Ic({ d, s = 18 }: { d: string; s?: number }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}
function Brand() {
  return (
    <a href="#top" className="k-brand">
      <span className="k-mark">KS</span>
      <span className="k-word">Kirana</span>
    </a>
  );
}

export default function Demo() {
  return (
    <div className={`${display.variable} ${body.variable} ${script.variable} kir`} id="top">
      <SiteSkin />
      <Decor />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* DEMO RIBBON — this is a sample site built with cakra */}
      <a href="/onboarding" className="k-ribbon">✨ Contoh situs agen — dibuat dengan <b>cakra</b> · Buat milik Anda →</a>

      {/* NAV */}
      <header className="k-nav">
        <div className="k-wrap k-nav-in">
          <Brand />
          <div className="k-nav-right">
            <nav className="k-links">{NAV.map(([l, h]) => <a key={l} href={h}>{l}</a>)}</nav>
            <a href="#kontak" className="k-btn k-btn-primary">Hubungi</a>
            <LangToggle />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="k-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-top.webp" alt="Vila premium Bali saat golden hour" className="k-hero-img" />
        <div className="k-hero-scrim" />
        <div className="k-wrap k-hero-in">
          <span className="k-kick k-kick-light" data-site="kicker">spesialis properti bali</span>
          <h1 className="k-h1" data-site="hero-h1">Vila & properti premium Bali, dari tangan yang benar-benar paham.</h1>
          <p className="k-lead" data-site="hero-lead">Kirana Sutanto — 10+ tahun spesialis vila & properti premium di Bali: Canggu, Seminyak, Uluwatu, Jimbaran, hingga Ubud. Untuk dijual maupun disewa mulai Rp 3 miliar, didampingi dari kurasi dan negosiasi hingga serah terima yang aman & legal.</p>
          <div className="k-row">
            <a href="#listing" className="k-btn k-btn-gold k-lg">Lihat properti</a>
            <a href="#kontak" className="k-btn k-btn-glass k-lg" data-site="contact-btn">Hubungi Kirana</a>
          </div>
          <p className="k-hero-note" data-site="hero-note">Fokus Rp 3 M+ · Jual &amp; sewa · Bali Selatan &amp; Ubud</p>
        </div>
      </section>

      {/* STATS */}
      <section className="k-wrap k-stats">
        {STATS.map(([n, l]) => (
          <div key={l} className="k-stat"><div className="k-stat-n">{n}</div><div className="k-stat-l">{l}</div></div>
        ))}
      </section>

      {/* RINGKASAN — at-a-glance grid, mudah dikutip mesin pencari & AI */}
      <section className="k-wrap k-sec" style={{ paddingBottom: 0 }}>
        <div className="k-sum">
          <div className="k-sum-head">
            <span className="k-kick">ringkas</span>
            <h2 className="k-sum-h" data-site="ringkasan-h">Yang perlu Anda tahu tentang properti premium Bali bersama Kirana</h2>
          </div>
          <div className="k-sum-grid" data-site="ringkasan">
            {([
              ["M12 2v3M12 19v3M2 12h3M19 12h3M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z", "Fokus", "Vila & properti premium Bali mulai Rp 3 miliar ke atas — untuk dijual maupun disewa."],
              ["M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "Kawasan", "Canggu, Pererenan, Seminyak, Uluwatu, Jimbaran, Nusa Dua, Sanur, dan Ubud."],
              ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0", "Untuk siapa", "Pembeli lokal, investor, pembeli asing (hak pakai, leasehold, PT PMA), serta penyewa jangka panjang & musiman."],
              ["M4 6h.01M4 12h.01M4 18h.01M9 6h11M9 12h11M9 18h11", "Pendampingan penuh", "Kurasi properti → negosiasi → pemeriksaan legal → serah terima."],
              ["M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM8.5 13.5 7 22l5-3 5 3-1.5-8.5", "Pengalaman", "Kirana Sutanto — lebih dari 10 tahun di pasar properti premium Bali."],
              ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", "Konsultasi gratis", "Langsung via WhatsApp — jawaban jujur, tanpa tekanan."],
            ] as [string, string, string][]).map(([d, label, text]) => (
              <div key={label} className="k-sum-item">
                <span className="k-sum-ic"><Ic d={d} s={20} /></span>
                <div><div className="k-sum-label">{label}</div><div className="k-sum-text">{text}</div></div>
              </div>
            ))}
          </div>
          <p className="k-sum-note">Setiap kisaran harga di situs ini bersifat indikatif — penilaian resmi diberikan setelah kurasi dan pemeriksaan langsung.</p>
        </div>
      </section>

      {/* LAYANAN */}
      <section className="k-wrap k-sec">
        <div className="k-center">
          <span className="k-kick">layanan</span>
          <h2 className="k-h2">Satu ahli untuk jual, sewa, dan investasi properti Bali.</h2>
          <p className="k-sub">Membeli vila, menyewa untuk musim ini, menyewakan aset, atau berinvestasi jangka panjang — semuanya ditangani dengan standar dan ketelitian yang sama.</p>
        </div>
        <div className="k-serv-grid" data-site="services">
          {LAYANAN.map((s) => (
            <div key={s.t} className="k-serv">
              <span className="k-serv-ic"><Ic d={s.i} s={22} /></span>
              <h3 className="k-serv-t">{s.t}</h3>
              <p className="k-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LISTING */}
      <section id="listing" className="k-band">
        <div className="k-wrap k-sec">
          <div className="k-head k-head-center">
            <div><span className="k-kick">properti pilihan</span><h2 className="k-h2" data-site="listing-h">Vila & properti premium Bali untuk dijual &amp; disewa.</h2></div>
          </div>
          <ListingGrid listings={LISTINGS} wa={WA} email="halo@cakra.xyz" />
          <div className="k-listing-cta"><a href="#kontak" className="k-btn k-btn-ghost">Minta daftar lengkap</a></div>
        </div>
      </section>

      {/* WILAYAH */}
      <section id="wilayah" className="k-wrap k-sec">
        <div className="k-center">
          <span className="k-kick">wilayah</span>
          <h2 className="k-h2">Menguasai kawasan properti terbaik di Bali.</h2>
          <p className="k-sub" data-site="area-intro">Pengetahuan mendalam tentang harga, karakter, dan potensi tiap area — dari Canggu &amp; Pererenan hingga Uluwatu, Ubud, dan Sanur. Klik kawasan untuk panduannya.</p>
        </div>
        <div className="k-areas" data-site="areas">
          {AREAS.map((a) => <a key={a} href={`/demo/area/${a.toLowerCase().replace(/\s+/g, "-")}`} className="k-area">{a}</a>)}
        </div>
        {/* Location + map — populated by SiteSkin from location{} for a real agent; hidden otherwise */}
        <div className="k-loc" data-site="location-block" hidden />
      </section>

      {/* TENTANG — profil agen (SEO: Person + ProfilePage schema) */}
      <section id="tentang" className="k-band">
        <div className="k-wrap k-split">
          <div className="k-card k-profile-card">
            <div className="k-card-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/about/origin.webp" alt="Foto profil agen properti" />
            </div>
            <div className="k-card-body">
              <div className="k-profile-name" data-site="profile-name">Kirana Sutanto</div>
              <div className="k-profile-role" data-site="profile-role">Agen Properti · Spesialis Vila Bali · 10+ tahun</div>
            </div>
          </div>
          <div>
            <span className="k-kick">profil agen</span>
            <h2 className="k-h2" data-site="about-h">Kirana Sutanto — kepercayaan lebih dulu.</h2>
            <p className="k-muted k-p" data-site="about-body">Lebih dari satu dekade di pasar properti premium Bali mengajarkan saya bahwa transaksi terbaik lahir dari kejujuran dan kesabaran. Saya bantu Anda memahami nilai, legalitas, dan potensi setiap properti — sebelum Anda menandatangani apa pun.</p>
            <ul className="k-list" data-site="about-diff">
              {["Fokus properti premium Rp 3 miliar ke atas", "Pendampingan penuh: survei, negosiasi, hingga notaris", "Jaringan pemilik, pengembang, dan penyewa tepercaya", "Data pasar & simulasi imbal hasil yang realistis"].map((x) => (
                <li key={x}><span className="k-check"><Ic d="M20 6 9 17l-5-5" s={15} /></span>{x}</li>
              ))}
            </ul>
            <a href="#kontak" className="k-btn k-btn-primary">Jadwalkan konsultasi</a>
          </div>
        </div>
      </section>

      {/* PROSES */}
      <section className="k-wrap k-sec">
        <div className="k-center">
          <span className="k-kick">cara kerja</span>
          <h2 className="k-h2">Empat langkah, tanpa kerumitan.</h2>
        </div>
        <div className="k-grid k-grid-4">
          {PROSES.map((s) => (
            <div key={s.n} className="k-step">
              <div className="k-step-n">{s.n}</div>
              <h3 className="k-serv-t">{s.t}</h3>
              <p className="k-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="k-band">
        <div className="k-wrap k-sec">
          <div className="k-center"><span className="k-kick">kata klien</span><h2 className="k-h2">Dipercaya pembeli, pemilik &amp; investor.</h2></div>
          <div className="k-grid k-grid-3">
            {TESTI.map((t) => {
              const ini = t.n.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <blockquote key={t.n} className="k-card k-testi">
                  <div className="k-stars">★★★★★</div>
                  <p className="k-quote">“{t.q}”</p>
                  <div className="k-testi-by">
                    <span className="k-avatar">{ini}</span>
                    <span><b>{t.n}</b><br /><span className="k-muted k-sm">{t.r}</span></span>
                  </div>
                </blockquote>
              );
            })}
          </div>
        </div>
      </section>

      {/* HUB */}
      <section id="hub" className="k-wrap k-sec">
        <div className="k-head">
          <div><span className="k-kick">wawasan</span><h2 className="k-h2">Pahami pasar sebelum melangkah.</h2></div>
          <a href="#kontak" className="k-btn k-btn-ghost">Tanya langsung</a>
        </div>
        <div className="k-grid k-grid-3">
          {ARTICLES.map((a) => (
            <article key={a.t} className="k-card">
              <div className="k-card-media k-media-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.img} alt={a.t} />
              </div>
              <div className="k-card-body">
                <span className="k-tagtext">{a.c}</span>
                <h3 className="k-card-t">{a.t}</h3>
                <p className="k-muted k-sm">{a.e}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PEMBELI INTERNASIONAL — kepercayaan (E-E-A-T) + intent pembeli asing */}
      <section id="pembeli-asing" className="k-wrap k-sec">
        <div className="k-center">
          <span className="k-kick">untuk pembeli internasional</span>
          <h2 className="k-h2">Membeli vila di Bali sebagai orang asing — dengan struktur yang benar.</h2>
          <p className="k-sub" data-site="foreign-body">Warga negara asing tidak dapat memegang Hak Milik (freehold), tetapi ada beberapa jalur kepemilikan yang sah dan lazim digunakan — masing-masing dengan konsekuensi, biaya, dan tingkat kendali yang berbeda.</p>
        </div>
        <div className="k-grid k-grid-3">
          {([
            ["M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6", "Hak Pakai", "Hak legal atas nama pribadi asing yang berdomisili/berizin untuk memakai tanah dalam jangka waktu tertentu dan dapat diperpanjang. Sering dipilih untuk vila yang ditinggali sendiri."],
            ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 7v5l3 3", "Leasehold", "Sewa jangka panjang (umumnya 25–30 tahun, sering dapat diperpanjang). Jalur paling sederhana untuk penggunaan pribadi; yang krusial adalah sisa masa sewa & syarat perpanjangan."],
            ["M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M15 21V9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h.01M8 12h.01", "PT PMA", "Badan usaha penanaman modal asing yang dapat memegang HGB — cocok bila properti ditujukan untuk disewakan atau dijalankan sebagai bisnis; menuntut kepatuhan pajak & pelaporan."],
          ] as [string, string, string][]).map(([d, t, desc]) => (
            <div key={t} className="k-legal-item">
              <span className="k-legal-ic"><Ic d={d} s={24} /></span>
              <h3 className="k-serv-t">{t}</h3>
              <p className="k-muted">{desc}</p>
            </div>
          ))}
        </div>
        <p className="k-legal-lead">Tidak ada satu struktur ‘terbaik’ untuk semua orang — pilihan bergantung pada tujuan, jangka waktu, dan rencana keluar Anda.</p>
        <div className="k-legal-assure">
          <h3 className="k-legal-assure-h">Yang saya pastikan sebelum satu rupiah pun berpindah</h3>
          <div className="k-legal-checks">
            {["Verifikasi keaslian & status sertifikat", "Pengecekan zonasi dan izin bangunan (PBG/IMB)", "Telaah sengketa atau beban atas properti", "Penandatanganan di hadapan notaris/PPAT tepercaya"].map((c) => (
              <div key={c} className="k-legal-check">
                <span className="k-check"><Ic d="M20 6 9 17l-5-5" s={14} /></span><span>{c}</span>
              </div>
            ))}
          </div>
          <div className="k-legal-foot">
            <p className="k-legal-note2">Saya tidak menggantikan nasihat hukum atau pajak — saya memastikan Anda didampingi profesional yang tepat.</p>
            <span className="k-legal-chip"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" s={14} /> Prefer English? That's completely fine.</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="k-band">
        <div className="k-wrap k-sec">
          <div className="k-center"><span className="k-kick">faq</span><h2 className="k-h2">Pertanyaan yang sering diajukan.</h2></div>
          <div className="k-faq-grid" data-site="faq">
            {FAQS.map(([q, a]) => (
              <details key={q} className="k-faq">
                <summary>{q}<span className="k-chev"><Ic d="m6 9 6 6 6-6" /></span></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* KONTAK */}
      <section id="kontak" className="k-wrap k-sec">
        <div className="k-cta">
          <span className="k-kick" style={{ color: "var(--k-gold)" }}>hubungi kami</span>
          <h2 className="k-h2" style={{ color: "#fff" }} data-site="cta-h">Siap menemukan vila premium Anda di Bali?</h2>
          <p className="k-cta-p" data-site="cta-p">Ceritakan kebutuhan Anda — memiliki vila impian, menyewa untuk musim ini, menyewakan aset, atau berinvestasi. Saya balas cepat, biasanya di hari yang sama.</p>
          <div className="k-row k-center-row">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="k-btn k-btn-gold k-lg"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" /> WhatsApp Kirana</a>
            <a href={EMAIL_LINK} className="k-btn k-btn-glass k-lg" data-site="email-btn">halo@cakra.xyz</a>
          </div>
          <p className="k-cta-note" data-site="contact-note">Kantor: Jl. Pantai Berawa, Canggu · Sen–Sab, 09.00–19.00 WITA</p>
        </div>
      </section>

      {/* TERHUBUNG — social + Google Business (opsional, dapat diedit di dashboard) */}
      <section className="k-wrap k-sec" style={{ paddingTop: 0 }}>
        <div className="k-connect">
          <div style={{ minWidth: 220 }}>
            <span className="k-kick">terhubung</span>
            <h2 className="k-h2">Ikuti &amp; hubungkan.</h2>
            <p className="k-sub" style={{ marginTop: 8 }}>Update listing terbaru & wawasan pasar Bali.</p>
          </div>
          <div className="k-social-row">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="k-social">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d={s.d} /></svg>
              </a>
            ))}
            <a href={GOOGLE_PROFILE} target="_blank" rel="noopener noreferrer" className="k-gbp">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" /></svg>
              Google Bisnis
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="k-foot">
        <div className="k-wrap k-foot-in">
          <Brand />
          <div className="k-muted k-sm">© {new Date().getFullYear()} Kirana · Kirana Sutanto · Spesialis Properti Premium Bali</div>
          <div className="k-foot-links">{NAV.map(([l, h]) => <a key={l} href={h}>{l}</a>)}</div>
        </div>
        <div className="k-wrap k-madewith">Dibuat dengan <a href="/onboarding" style={{ color: "var(--k-gold)", fontWeight: 700, textDecoration: "none" }}>cakra</a> — <a href="/onboarding" style={{ color: "rgba(255,255,255,.85)", textDecoration: "underline" }}>buat situs Anda sendiri →</a></div>
      </footer>

      {/* Sticky WhatsApp lead capture — standard on every cakra agent site */}
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="k-fab" aria-label="Chat via WhatsApp">
        <svg viewBox="0 0 24 24" width={30} height={30} fill="currentColor" aria-hidden="true"><path d="M12.04 2.01c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01a9.82 9.82 0 0 0-7.01-2.91Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24Zm-3.6 4.02c-.17 0-.45.06-.68.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.72 4.31 3.81.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.17-.48-.29-.25-.13-1.48-.73-1.71-.82-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.98-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.48-1.38-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.55-1.36-.76-1.86-.2-.48-.4-.42-.55-.43-.14 0-.31-.01-.47-.01Z" /></svg>
      </a>

      <style>{`
        .kir{
          --k-bg:#F2F6F6; --k-surface:#FFFFFF; --k-ink:#1E2A2E; --k-ink-2:#33454B; --k-muted:#5E7178;
          --k-line:#E5ECEC; --k-line-2:#CBD9D9; --k-emerald:#357482; --k-emerald-2:#265863; --k-gold:#B0812F; --k-gold-2:#957026;
          --k-r:16px; --k-r-sm:12px;
          background:var(--k-bg); color:var(--k-ink); min-height:100vh; position:relative; isolation:isolate;
          font-family:var(--k-font-body), system-ui, sans-serif; line-height:1.6; -webkit-font-smoothing:antialiased;
        }
        .kir h1,.kir h2,.kir h3{ font-family:var(--k-font-display), Georgia, serif; margin:0; letter-spacing:-.01em; font-weight:600; }
        .kir img{ display:block; max-width:100%; }
        .k-wrap{ max-width:1180px; margin:0 auto; padding:0 clamp(18px,4vw,30px); }
        .k-muted{ color:var(--k-muted); }
        .k-sm{ font-size:.92rem; }
        .k-center{ text-align:center; max-width:60ch; margin:0 auto 42px; }
        .k-kick{ display:inline-block; font-family:var(--k-font-script), cursive; font-size:1.5rem; font-weight:700; color:var(--k-gold); margin-bottom:6px; }
        .k-kick-light{ color:#E7C892; }
        .k-h1{ font-size:clamp(2.4rem,5.4vw,4.2rem); line-height:1.06; font-weight:700; }
        .k-h2{ font-size:clamp(1.8rem,3.6vw,2.7rem); line-height:1.14; }
        .k-sub{ color:var(--k-muted); font-size:1.08rem; margin-top:12px; }
        .k-p{ font-size:1.06rem; margin:16px 0 22px; max-width:52ch; }
        .k-row{ display:flex; gap:12px; flex-wrap:wrap; }
        .k-center-row{ justify-content:center; }

        .k-btn{ display:inline-flex; align-items:center; gap:8px; font:inherit; font-weight:700; font-size:.9rem; letter-spacing:.02em;
          padding:.8rem 1.5rem; border-radius:var(--k-r-sm); border:1.5px solid transparent; cursor:pointer; text-decoration:none; transition:.18s ease; white-space:nowrap; }
        .k-btn-primary:hover, .k-btn-gold:hover{ transform:translateY(-1px); box-shadow:0 10px 22px -12px rgba(15,32,38,.5); }
        .k-lg{ padding:.95rem 1.8rem; font-size:.98rem; }
        .k-btn-primary{ background:var(--k-emerald); color:#fff; }
        .k-btn-primary:hover{ background:var(--k-emerald-2); }
        .k-btn-gold{ background:var(--k-gold); color:#fff; }
        .k-btn-gold:hover{ background:var(--k-gold-2); }
        .k-btn-ghost{ background:transparent; color:var(--k-ink); border-color:var(--k-ink); }
        .k-btn-ghost:hover{ border-color:var(--k-emerald); color:var(--k-emerald); }
        .k-btn-glass{ background:rgba(255,255,255,.12); color:#fff; border-color:rgba(255,255,255,.45); backdrop-filter:blur(6px); }
        .k-btn-glass:hover{ background:rgba(255,255,255,.22); }

        .k-nav{ position:sticky; top:0; z-index:40; background:color-mix(in oklab, var(--k-bg) 90%, transparent); backdrop-filter:blur(10px); border-bottom:1px solid var(--k-line); }
        .k-nav-in{ display:flex; align-items:center; justify-content:space-between; height:76px; }
        .k-brand{ display:flex; align-items:center; gap:12px; text-decoration:none; color:var(--k-ink); }
        .k-mark{ width:54px; height:54px; border-radius:50%; background:var(--k-emerald); color:var(--k-gold);
          display:grid; place-items:center; font-family:var(--k-font-script), cursive; font-size:2rem; font-weight:700; line-height:1; padding-bottom:5px; box-shadow:0 8px 20px -10px var(--k-emerald); }
        .k-word{ font-family:var(--k-font-display), serif; font-weight:600; font-size:1.6rem; letter-spacing:.01em; }
        .k-nav-right{ display:flex; align-items:center; gap:18px; }
        .k-lang{ display:inline-flex; border:1px solid var(--k-line-2); border-radius:999px; overflow:hidden; flex:none; }
        .k-lang button{ font:inherit; font-size:.78rem; font-weight:700; padding:.38rem .66rem; border:none; background:transparent; color:var(--k-ink-2); cursor:pointer; transition:.15s; }
        .k-lang button.on{ background:var(--k-emerald); color:#fff; }
        .k-links{ display:flex; gap:28px; }
        .k-links a{ color:var(--k-ink-2); text-decoration:none; font-weight:500; font-size:.98rem; transition:color .15s; }
        .k-links a:hover{ color:var(--k-emerald); }

        .k-hero{ position:relative; overflow:hidden; }
        .k-hero-img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .k-hero-scrim{ position:absolute; inset:0; background:linear-gradient(100deg, rgba(15,32,38,.9) 0%, rgba(15,32,38,.62) 46%, rgba(15,32,38,.22) 100%); }
        .k-hero-in{ position:relative; padding:clamp(66px,12vw,128px) clamp(18px,4vw,30px) clamp(72px,13vw,140px); max-width:800px; }
        .k-hero .k-h1{ color:#fff; }
        .k-lead{ color:rgba(255,255,255,.9); font-size:1.2rem; line-height:1.6; margin:20px 0 30px; max-width:56ch; }
        .k-hero-note{ color:rgba(255,255,255,.72); font-size:.9rem; margin-top:22px; letter-spacing:.02em; }

        .k-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:0; margin-top:-48px; position:relative; z-index:2; background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); box-shadow:0 18px 44px -24px rgba(15,32,38,.26); overflow:hidden; }
        .k-stat{ padding:26px 24px; text-align:center; border-right:1px solid var(--k-line); }
        .k-stat:last-child{ border-right:none; }
        .k-stat-n{ font-family:var(--k-font-display), serif; font-weight:700; font-size:clamp(1.7rem,2.8vw,2.3rem); color:var(--k-emerald); font-variant-numeric:tabular-nums; }
        .k-stat-l{ color:var(--k-muted); font-size:.9rem; margin-top:2px; }

        .k-sec{ padding:clamp(60px,9vw,104px) clamp(18px,4vw,30px); }
        .k-band{ background:var(--k-surface); border-top:1px solid var(--k-line); border-bottom:1px solid var(--k-line); }
        .k-head{ display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:32px; flex-wrap:wrap; }
        .k-head-center{ flex-direction:column; align-items:center; text-align:center; }
        .k-listing-cta{ text-align:center; margin-top:36px; }

        .k-grid{ display:grid; gap:24px; }
        .k-grid-3{ grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); }
        .k-grid-4{ grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); }
        .k-tldr{ background:var(--k-surface); border:1px solid var(--k-line); border-left:4px solid var(--k-gold); border-radius:var(--k-r); padding:clamp(22px,4vw,34px); max-width:900px; margin:0 auto; box-shadow:0 1px 2px rgba(15,32,38,.05); }
        .k-tldr-h{ font-size:1.24rem; margin-bottom:14px; }
        .k-tldr-list{ list-style:none; padding:0; margin:0; display:grid; gap:10px; }
        .k-tldr-list li{ position:relative; padding-left:22px; color:var(--k-ink-2); line-height:1.55; }
        .k-tldr-list li::before{ content:""; position:absolute; left:2px; top:9px; width:7px; height:7px; border-radius:50%; background:var(--k-emerald); }
        .k-tldr-list b{ color:var(--k-ink); font-weight:700; }
        .k-tldr-note{ margin-top:16px; font-size:.86rem; color:var(--k-muted); border-top:1px solid var(--k-line); padding-top:12px; }
        .k-legal-item{ background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); padding:26px 24px; }
        .k-legal-ic{ display:inline-grid; place-items:center; width:46px; height:46px; border-radius:12px; background:color-mix(in oklab, var(--k-gold) 12%, var(--k-surface)); color:var(--k-gold-2); border:1px solid color-mix(in oklab, var(--k-gold) 22%, transparent); margin-bottom:14px; }
        .k-legal-lead{ text-align:center; max-width:62ch; margin:38px auto 22px; font-size:1.12rem; color:var(--k-ink-2); line-height:1.6; }
        .k-legal-assure{ background:linear-gradient(125deg, var(--k-emerald-2), var(--k-emerald)); color:#fff; border-radius:var(--k-r); padding:clamp(28px,4vw,44px); box-shadow:0 30px 60px -38px var(--k-emerald); }
        .k-legal-assure-h{ color:#fff; font-size:clamp(1.6rem,3vw,2.2rem); text-align:center; margin-bottom:48px; line-height:1.25; }
        .k-legal-checks{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px 28px; max-width:840px; margin:0 auto; }
        .k-legal-check{ display:flex; gap:12px; align-items:flex-start; }
        .k-legal-check .k-check{ background:rgba(255,255,255,.16); color:#fff; flex:none; margin-top:1px; }
        .k-legal-check > span:last-child{ color:rgba(255,255,255,.92); line-height:1.5; font-size:.98rem; }
        .k-legal-foot{ display:flex; align-items:center; justify-content:center; gap:16px; flex-wrap:wrap; margin-top:28px; padding-top:24px; border-top:1px solid rgba(255,255,255,.18); }
        .k-legal-note2{ color:rgba(255,255,255,.74); font-size:.9rem; max-width:52ch; margin:0; }
        .k-legal-chip{ display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.15); color:#fff; padding:.55rem 1.05rem; border-radius:999px; font-size:.86rem; font-weight:600; white-space:nowrap; }
        .k-sum{ max-width:1040px; margin:0 auto; }
        .k-sum-head{ text-align:center; max-width:60ch; margin:0 auto 34px; }
        .k-sum-h{ font-size:clamp(1.5rem,2.9vw,2.1rem); line-height:1.18; }
        .k-sum-grid{ display:flex; flex-wrap:wrap; justify-content:center; gap:20px; max-width:1120px; margin:0 auto; }
        .k-sum-item{ flex:1 1 300px; max-width:360px; display:flex; flex-direction:column; align-items:center; text-align:center; padding:26px 24px; background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); box-shadow:0 12px 34px -24px rgba(15,32,38,.24); transition:transform .18s ease, box-shadow .18s ease; }
        .k-sum-item:hover{ transform:translateY(-3px); box-shadow:0 20px 46px -26px rgba(15,32,38,.32); }
        .k-sum-ic{ flex:none; width:50px; height:50px; border-radius:14px; display:grid; place-items:center; margin-bottom:14px; background:color-mix(in oklab, var(--k-emerald) 12%, var(--k-surface)); color:var(--k-emerald); border:1px solid color-mix(in oklab, var(--k-emerald) 20%, transparent); }
        .k-sum-label{ font-family:var(--k-font-display), serif; font-weight:700; font-size:1.02rem; margin-bottom:3px; color:var(--k-ink); }
        .k-sum-text{ font-size:.9rem; color:var(--k-muted); line-height:1.5; }
        .k-sum-note{ text-align:center; margin:28px auto 0; max-width:66ch; font-size:.86rem; color:var(--k-ink-2); background:color-mix(in oklab, var(--k-gold) 9%, var(--k-surface)); border:1px solid color-mix(in oklab, var(--k-gold) 24%, var(--k-line)); border-radius:14px; padding:12px 22px; }
        @media(max-width:860px){ .k-sum-grid{ grid-template-columns:1fr 1fr; } }
        @media(max-width:560px){ .k-sum-grid{ grid-template-columns:1fr; } .k-legal-checks{ grid-template-columns:1fr; } }

        .k-serv-grid{ display:flex; flex-wrap:wrap; justify-content:center; gap:20px; max-width:1120px; margin-left:auto; margin-right:auto; }
        .k-serv{ flex:1 1 300px; max-width:360px; padding:26px 24px; background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); box-shadow:0 12px 34px -24px rgba(15,32,38,.24); transition:transform .18s ease, box-shadow .18s ease; }
        .k-serv:hover{ transform:translateY(-3px); box-shadow:0 20px 46px -26px rgba(15,32,38,.32); }
        .k-serv-ic{ display:inline-grid; place-items:center; width:50px; height:50px; border-radius:14px; background:color-mix(in oklab, var(--k-emerald) 12%, var(--k-surface)); color:var(--k-emerald); margin-bottom:16px; border:1px solid color-mix(in oklab, var(--k-emerald) 20%, transparent); }
        .k-serv-t{ font-size:1.3rem; margin-bottom:6px; }

        .k-card{ background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); overflow:hidden; box-shadow:0 1px 2px rgba(15,32,38,.05); transition:transform .2s ease, box-shadow .2s ease; }
        .k-card:hover{ transform:translateY(-4px); box-shadow:0 14px 34px -12px rgba(15,32,38,.22); }
        .k-card-media{ position:relative; aspect-ratio:3/2; overflow:hidden; }
        .k-media-sm{ aspect-ratio:16/10; }
        .k-card-media img{ width:100%; height:100%; object-fit:cover; transition:transform .5s; }
        .k-card:hover .k-card-media img{ transform:scale(1.05); }
        .k-badge{ position:absolute; top:14px; left:14px; background:color-mix(in oklab, var(--k-emerald) 92%, transparent); backdrop-filter:blur(4px); color:#fff; font-size:.66rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:.34rem .7rem; border-radius:999px; box-shadow:0 4px 12px -4px rgba(15,32,38,.4); }
        .k-badge-gold{ background:var(--k-gold); }
        .k-card-body{ padding:18px 20px 22px; }
        .k-price{ font-family:var(--k-font-display), serif; font-weight:700; color:var(--k-emerald); font-size:1.3rem; }
        .k-per{ font-family:var(--k-font-body); font-size:.8rem; font-weight:600; color:var(--k-muted); }
        .k-card-t{ font-size:1.22rem; margin:4px 0 3px; }
        .k-meta{ color:var(--k-muted); font-size:.82rem; margin-top:8px; font-family:var(--font-mono, ui-monospace, monospace); letter-spacing:.01em; }
        .k-tagtext{ font-size:.72rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--k-gold); }
        .k-card-btn{ cursor:pointer; font:inherit; text-align:left; color:inherit; width:100%; padding:0; display:block; }
        .k-card-cta{ display:inline-flex; align-items:center; gap:6px; margin-top:12px; color:var(--k-emerald); font-weight:700; font-size:.84rem; }
        .k-card:hover .k-card-cta{ color:var(--k-gold-2); }
        .k-modal{ position:fixed; inset:0; z-index:100; background:rgba(15,32,38,.55); backdrop-filter:blur(3px); display:grid; place-items:center; padding:20px; }
        .k-modal-in{ position:relative; width:min(440px,100%); background:var(--k-surface); border-radius:var(--k-r); overflow:hidden; box-shadow:0 40px 90px -30px rgba(0,0,0,.5); animation:kpop .2s ease; }
        @keyframes kpop{ from{ transform:translateY(12px) scale(.98); opacity:0; } to{ transform:none; opacity:1; } }
        .k-modal-x{ position:absolute; top:12px; right:12px; z-index:2; width:34px; height:34px; border-radius:50%; border:none; background:rgba(255,255,255,.92); color:var(--k-ink); cursor:pointer; font-size:1rem; box-shadow:0 2px 8px rgba(0,0,0,.2); }
        .k-modal-media{ position:relative; aspect-ratio:16/10; }
        .k-modal-media img{ width:100%; height:100%; object-fit:cover; }
        .k-modal-body{ padding:22px 24px 26px; }
        .k-modal-t{ font-size:1.4rem; margin:4px 0 4px; }
        .k-modal-desc{ color:var(--k-muted); font-size:.92rem; line-height:1.55; margin:12px 0 18px; }
        .k-modal-desc b{ color:var(--k-ink); }
        .k-modal-actions{ display:flex; gap:10px; }
        .k-modal-actions .k-btn{ flex:1; justify-content:center; }

        .k-areas{ display:flex; flex-wrap:wrap; gap:12px; justify-content:center; max-width:820px; margin:0 auto; }
        .k-area{ font-family:var(--k-font-display), serif; font-size:1.15rem; padding:.6rem 1.4rem; border:1px solid var(--k-line-2); border-radius:999px; color:var(--k-ink); background:var(--k-surface); transition:.15s; }
        .k-area:hover{ border-color:var(--k-emerald); color:var(--k-emerald); }

        .k-loc{ max-width:1040px; margin:38px auto 0; }
        .k-loc-h{ font-size:1.3rem; margin-bottom:8px; text-align:center; }
        .k-loc-addr{ text-align:center; color:var(--k-muted); font-size:.98rem; max-width:64ch; margin:0 auto; line-height:1.55; }
        .k-loc-map{ position:relative; aspect-ratio:16/9; border-radius:var(--k-r); overflow:hidden; border:1px solid var(--k-line); margin-top:18px; box-shadow:0 1px 2px rgba(15,32,38,.05); }
        .k-loc-map iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
        .k-loc-chips{ display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:16px; }
        .k-loc-chip{ font-size:.85rem; padding:.42rem .95rem; border:1px solid var(--k-line-2); border-radius:999px; color:var(--k-ink-2); background:var(--k-surface); }

        .k-split{ display:grid; grid-template-columns:.9fr 1.1fr; gap:clamp(30px,5vw,64px); align-items:center; padding:clamp(60px,9vw,104px) clamp(18px,4vw,30px); }
        .k-about-img{ border-radius:var(--k-r); overflow:hidden; aspect-ratio:4/3; background:var(--k-surface); border:1px solid var(--k-line); box-shadow:0 1px 2px rgba(15,32,38,.05); transition:transform .2s ease, box-shadow .2s ease; }
        .k-about-img:hover{ transform:translateY(-4px); box-shadow:0 14px 34px -12px rgba(15,32,38,.22); }
        .k-about-img img{ width:100%; height:100%; object-fit:cover; transition:transform .5s; }
        .k-about-img:hover img{ transform:scale(1.04); }
        .k-profile-img{ position:relative; }
        .k-profile-cap{ position:absolute; left:0; right:0; bottom:0; padding:18px 20px; background:linear-gradient(0deg, rgba(15,32,38,.85), rgba(15,32,38,.15) 70%, transparent); color:#fff; }
        .k-profile-card{ align-self:start; }
        .k-profile-name{ font-family:var(--k-font-display), serif; font-weight:700; font-size:1.3rem; line-height:1.15; color:var(--k-ink); }
        .k-profile-role{ font-size:.86rem; color:var(--k-muted); margin-top:4px; }
        .k-list{ list-style:none; padding:0; margin:0 0 26px; display:grid; gap:13px; }
        .k-list li{ display:flex; gap:12px; align-items:flex-start; color:var(--k-ink-2); }
        .k-check{ flex:none; width:24px; height:24px; border-radius:50%; background:color-mix(in oklab, var(--k-emerald) 12%, var(--k-surface)); color:var(--k-emerald); display:grid; place-items:center; margin-top:2px; }

        .k-step-n{ font-family:var(--k-font-display), serif; font-size:2.4rem; font-weight:700; color:var(--k-gold); line-height:1; margin-bottom:12px; }
        .k-step{ border-top:2px solid var(--k-ink); padding-top:20px; }

        .k-testi{ padding:28px 28px 24px; }
        .k-stars{ color:var(--k-gold); letter-spacing:3px; margin-bottom:12px; }
        .k-quote{ font-family:var(--k-font-display), serif; font-size:1.16rem; line-height:1.5; font-style:italic; margin:0 0 16px; }
        .k-testi-by{ display:flex; align-items:center; gap:12px; font-size:.95rem; line-height:1.35; }
        .k-avatar{ flex:none; width:46px; height:46px; border-radius:50%; display:grid; place-items:center; background:linear-gradient(135deg, var(--k-emerald), var(--k-emerald-2)); color:#fff; font-family:var(--k-font-display), serif; font-weight:700; font-size:1.05rem; box-shadow:0 6px 16px -8px var(--k-emerald); }

        .k-faq-grid{ display:grid; grid-template-columns:1fr 1fr; gap:2px 52px; }
        .k-faq{ border-bottom:1px solid var(--k-ink); }
        .k-faq summary{ list-style:none; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:16px; padding:22px 2px; font-weight:600; font-size:1.1rem; color:var(--k-ink); }
        .k-faq summary::-webkit-details-marker{ display:none; }
        .k-faq summary:hover{ color:var(--k-emerald); }
        .k-chev{ color:var(--k-gold); transition:transform .25s; flex:none; }
        .k-faq[open] .k-chev{ transform:rotate(180deg); }
        .k-faq p{ margin:0; padding:0 2px 24px; color:var(--k-muted); font-size:1.02rem; line-height:1.68; max-width:62ch; }

        .k-cta{ position:relative; overflow:hidden; background:linear-gradient(120deg, var(--k-emerald-2), var(--k-emerald)); border-radius:var(--k-r); padding:clamp(44px,7vw,80px) clamp(24px,5vw,56px); text-align:center; box-shadow:0 40px 80px -44px var(--k-emerald); }
        .k-cta-p{ color:rgba(255,255,255,.88); max-width:52ch; margin:12px auto 0; font-size:1.06rem; line-height:1.65; }
        .k-cta .k-center-row{ margin-top:32px; }
        .k-cta-note{ color:rgba(255,255,255,.68); font-size:.85rem; margin-top:22px; }

        .k-connect{ display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; padding:clamp(24px,3vw,34px); background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); }
        .k-social-row{ display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
        .k-social{ width:46px; height:46px; border-radius:50%; border:1px solid var(--k-line-2); display:grid; place-items:center; color:var(--k-ink-2); background:var(--k-surface); text-decoration:none; transition:.15s; }
        .k-social:hover{ border-color:var(--k-emerald); color:var(--k-emerald); transform:translateY(-2px); }
        .k-gbp{ display:inline-flex; align-items:center; gap:8px; padding:.7rem 1.2rem; border-radius:999px; border:1px solid var(--k-line-2); color:var(--k-ink); font-weight:600; font-size:.9rem; text-decoration:none; background:var(--k-surface); transition:.15s; }
        .k-gbp:hover{ border-color:var(--k-gold); color:var(--k-gold-2); }

        .k-foot{ background:var(--k-emerald-2); color:#fff; padding:38px 0 26px; }
        .k-foot .k-word{ color:#fff; }
        .k-foot .k-mark{ background:var(--k-gold); color:var(--k-emerald-2); box-shadow:none; }
        .k-foot .k-muted{ color:rgba(255,255,255,.6); }
        .k-foot-in{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .k-foot-links{ display:flex; gap:18px; }
        .k-foot-links a{ color:rgba(255,255,255,.72); text-decoration:none; font-size:.9rem; }
        .k-foot-links a:hover{ color:#fff; }
        .k-madewith{ margin-top:22px; padding-top:20px; border-top:1px solid rgba(255,255,255,.14); color:rgba(255,255,255,.6); font-size:.84rem; }
        .k-madewith b{ color:var(--k-gold); }

        .k-ribbon{ display:block; text-align:center; background:var(--k-emerald-2); color:#fff; text-decoration:none; font-size:.86rem; font-weight:600; padding:9px 16px; letter-spacing:.01em; }
        .k-ribbon b{ color:var(--k-gold); }
        .k-ribbon:hover{ background:var(--k-emerald); }
        .k-fab{ position:fixed; bottom:22px; right:22px; z-index:60; width:60px; height:60px; border-radius:50%; background:#25D366; color:#fff; display:grid; place-items:center; box-shadow:0 12px 28px -8px rgba(0,0,0,.4); transition:transform .15s; }
        .k-fab:hover{ transform:scale(1.06); }

        @media (max-width: 900px){ .k-links, .k-foot-links{ display:none; } .k-stats{ grid-template-columns:1fr 1fr; } .k-stat:nth-child(2){ border-right:none; } .k-stat{ border-bottom:1px solid var(--k-line); } .k-split{ grid-template-columns:1fr; } .k-about-img{ order:-1; } .k-faq-grid{ grid-template-columns:1fr; } }
        @media (max-width: 640px){
          /* cakra.xyz mobile spacing schema: 16px page gutters · 64px between-section · 16px card gaps */
          .k-wrap{ padding-left:16px; padding-right:16px; }
          .k-sec{ padding-top:64px; padding-bottom:64px; }
          .k-grid{ gap:16px; }
          .k-serv-grid, .k-sum-grid{ gap:16px; }
          .k-stats{ margin-left:16px; margin-right:16px; padding-left:0; padding-right:0; }
          .k-word{ font-size:1.2rem; line-height:1.12; } .k-nav-in{ height:64px; }
          .k-hero-in{ padding:52px 16px 58px; }
          .k-split{ padding:64px 16px; gap:24px; }
          .k-cta{ padding:34px 16px; } .k-cta-p{ font-size:1rem; }
          .k-connect{ padding:18px 16px; }
          .k-tldr{ padding:20px 16px; } .k-testi{ padding:22px 18px 20px; }
          .k-stat{ padding:18px 12px; } .k-card-body{ padding:16px 16px 18px; }
          .k-legal-item{ padding:18px 16px; } .k-legal-assure{ padding:22px 16px; } .k-sum-item{ padding:18px 16px; } .k-modal-body{ padding:18px 18px 20px; }
          .k-h1{ font-size:1.95rem; line-height:1.14; } .k-h2{ font-size:1.5rem; line-height:1.2; }
          .k-lead{ font-size:1rem; margin:16px 0 24px; } .k-sub,.k-p{ font-size:1rem; } .k-center{ margin-bottom:28px; }
        }
      `}</style>
    </div>
  );
}
