import type { Metadata } from "next";
import { Playfair_Display, Manrope, Dancing_Script } from "next/font/google";

const display = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--k-font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--k-font-body" });
const script = Dancing_Script({ subsets: ["latin"], weight: ["600", "700"], variable: "--k-font-script" });

export const metadata: Metadata = {
  title: "Kirana — Spesialis Properti Premium Bali (Jual & Sewa Rp 3 M+)",
  description:
    "Kirana Sutanto — 10+ tahun spesialis vila & properti premium di Bali, untuk jual maupun sewa mulai Rp 3 miliar. Dari kurasi hingga serah terima, ditemani setiap langkah.",
  keywords: ["agen properti Bali", "vila premium Bali", "jual vila Bali", "sewa vila Bali", "investasi properti Bali", "Kirana Sutanto", "properti mewah Bali"],
  openGraph: {
    title: "Kirana — Spesialis Properti Premium Bali",
    description: "Vila & properti premium Bali untuk jual maupun sewa, mulai Rp 3 miliar. 10+ tahun pengalaman bersama Kirana Sutanto.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Kirana Sutanto",
  description: "Spesialis vila & properti premium di Bali untuk jual dan sewa, mulai Rp 3 miliar, dengan pengalaman lebih dari 10 tahun.",
  areaServed: "Bali, Indonesia",
  knowsAbout: ["vila premium Bali", "investasi properti Bali", "sewa vila Bali", "legalitas properti"],
  priceRange: "Rp 3.000.000.000+",
  slogan: "Properti premium Bali, dari tangan yang benar-benar paham.",
};

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
  { t: "Vila Uluwatu Cliff", loc: "Uluwatu", tag: "Dijual", price: "Rp 14 M", beds: 5, baths: 5, size: 480, img: "/about/transform.jpg" },
  { t: "Vila Canggu Estate", loc: "Canggu", tag: "Dijual", price: "Rp 8,5 M", beds: 4, baths: 4, size: 320, img: "/about/hero.jpg" },
  { t: "Vila Seminyak Retreat", loc: "Seminyak", tag: "Disewa", price: "Rp 3,2 M", per: "/thn", beds: 3, baths: 3, size: 210, img: "/hero.jpg" },
  { t: "Vila Ubud Valley", loc: "Ubud", tag: "Dijual", price: "Rp 11 M", beds: 4, baths: 4, size: 360, img: "/about/vision-hill.jpg" },
  { t: "Vila Sanur Garden", loc: "Sanur", tag: "Disewa", price: "Rp 3,8 M", per: "/thn", beds: 4, baths: 3, size: 300, img: "/hero-top.jpg" },
  { t: "Vila Jimbaran Bay", loc: "Jimbaran", tag: "Dijual", price: "Rp 9,3 M", beds: 4, baths: 4, size: 340, img: "/about/invite.jpg" },
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
  { c: "Pasar", t: "Panduan harga vila Canggu 2026", e: "Ke mana arah harga tanah & vila di koridor Berawa–Pererenan.", img: "/blog-0.jpg" },
  { c: "Investasi", t: "ROI vila sewa: angka yang realistis", e: "Cara menghitung imbal hasil sewa tanpa asumsi berlebihan.", img: "/blog-1.jpg" },
  { c: "Legal", t: "Hak pakai vs PT PMA untuk pembeli asing", e: "Struktur kepemilikan yang aman sebelum membeli di Bali.", img: "/blog-2.jpg" },
];

const FAQS = [
  ["Area mana saja yang Anda layani?", "Fokus di Bali Selatan — Canggu, Pererenan, Seminyak, Uluwatu, Jimbaran, Nusa Dua, Sanur — serta Ubud untuk vila & properti investasi."],
  ["Berapa kisaran harga properti Anda?", "Saya berfokus pada properti premium mulai Rp 3 miliar ke atas, baik untuk dijual maupun disewakan."],
  ["Apakah melayani jual dan sewa?", "Ya, keduanya — penjualan vila premium dan penyewaan jangka panjang maupun musiman, lengkap dengan strategi pemasaran."],
  ["Apakah membantu pembeli asing?", "Ya. Saya memandu struktur kepemilikan yang legal (hak pakai atau PT PMA) bersama notaris dan konsultan pajak tepercaya."],
  ["Sudah berapa lama Anda berkecimpung?", "Lebih dari 10 tahun, khusus di pasar properti premium Bali — dengan jaringan pemilik, pengembang, dan pembeli yang luas."],
  ["Berapa biaya jasa Anda?", "Transparan sejak awal. Komisi standar dibahas di muka, dengan rencana pemasaran (foto, video, iklan, jaringan) yang jelas."],
];

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* NAV */}
      <header className="k-nav">
        <div className="k-wrap k-nav-in">
          <Brand />
          <div className="k-nav-right">
            <nav className="k-links">{NAV.map(([l, h]) => <a key={l} href={h}>{l}</a>)}</nav>
            <a href="#kontak" className="k-btn k-btn-primary">Hubungi</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="k-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-top.jpg" alt="Vila premium Bali saat golden hour" className="k-hero-img" />
        <div className="k-hero-scrim" />
        <div className="k-wrap k-hero-in">
          <span className="k-kick k-kick-light">spesialis properti bali</span>
          <h1 className="k-h1">Properti premium Bali, dari tangan yang benar-benar paham.</h1>
          <p className="k-lead">Kirana Sutanto — 10+ tahun spesialis vila & properti premium di Bali, untuk jual maupun sewa mulai Rp 3 miliar. Dari kurasi hingga serah terima, Anda ditemani setiap langkah.</p>
          <div className="k-row">
            <a href="#listing" className="k-btn k-btn-gold k-lg">Lihat properti</a>
            <a href="#kontak" className="k-btn k-btn-glass k-lg">Hubungi Kirana</a>
          </div>
          <p className="k-hero-note">Fokus Rp 3 M+ · Jual &amp; sewa · Bali Selatan &amp; Ubud</p>
        </div>
      </section>

      {/* STATS */}
      <section className="k-wrap k-stats">
        {STATS.map(([n, l]) => (
          <div key={l} className="k-stat"><div className="k-stat-n">{n}</div><div className="k-stat-l">{l}</div></div>
        ))}
      </section>

      {/* LAYANAN */}
      <section className="k-wrap k-sec">
        <div className="k-center">
          <span className="k-kick">layanan</span>
          <h2 className="k-h2">Satu ahli untuk setiap kebutuhan properti Anda.</h2>
          <p className="k-sub">Membeli, menyewa, menyewakan, atau berinvestasi — semuanya ditangani dengan standar yang sama.</p>
        </div>
        <div className="k-grid k-grid-4">
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
          <div className="k-head">
            <div><span className="k-kick">properti pilihan</span><h2 className="k-h2">Vila premium untuk dijual &amp; disewa.</h2></div>
            <a href="#kontak" className="k-btn k-btn-ghost">Minta daftar lengkap</a>
          </div>
          <div className="k-grid k-grid-3">
            {LISTINGS.map((p) => (
              <article key={p.t} className="k-card">
                <div className="k-card-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.t} />
                  <span className={`k-badge ${p.tag === "Disewa" ? "k-badge-gold" : ""}`}>{p.tag}</span>
                </div>
                <div className="k-card-body">
                  <div className="k-price">{p.price}{p.per && <span className="k-per">{p.per}</span>}</div>
                  <h3 className="k-card-t">{p.t}</h3>
                  <div className="k-muted k-sm">{p.loc}, Bali</div>
                  <div className="k-meta">{p.beds} KT · {p.baths} KM · {p.size} m²</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WILAYAH */}
      <section className="k-wrap k-sec">
        <div className="k-center">
          <span className="k-kick">wilayah</span>
          <h2 className="k-h2">Menguasai kawasan terbaik Bali.</h2>
          <p className="k-sub">Pengetahuan mendalam tentang harga, karakter, dan potensi tiap area.</p>
        </div>
        <div className="k-areas">
          {AREAS.map((a) => <span key={a} className="k-area">{a}</span>)}
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="k-band">
        <div className="k-wrap k-split">
          <div className="k-about-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/about/origin.jpg" alt="Ruang kerja Kirana Sutanto" />
          </div>
          <div>
            <span className="k-kick">tentang kirana</span>
            <h2 className="k-h2">Sepuluh tahun, satu prinsip: kepercayaan lebih dulu.</h2>
            <p className="k-muted k-p">Lebih dari satu dekade di pasar properti premium Bali mengajarkan saya bahwa transaksi terbaik lahir dari kejujuran dan kesabaran. Saya bantu Anda memahami nilai, legalitas, dan potensi setiap properti — sebelum Anda menandatangani apa pun.</p>
            <ul className="k-list">
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
            {TESTI.map((t) => (
              <blockquote key={t.n} className="k-card k-testi">
                <div className="k-stars">★★★★★</div>
                <p className="k-quote">“{t.q}”</p>
                <div className="k-testi-by"><b>{t.n}</b><br /><span className="k-muted k-sm">{t.r}</span></div>
              </blockquote>
            ))}
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

      {/* FAQ */}
      <section id="faq" className="k-band">
        <div className="k-wrap k-sec">
          <div className="k-center"><span className="k-kick">faq</span><h2 className="k-h2">Pertanyaan yang sering diajukan.</h2></div>
          <div className="k-faq-grid">
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
          <span className="k-kick" style={{ color: "var(--k-gold)" }}>hubungi kirana</span>
          <h2 className="k-h2" style={{ color: "#fff" }}>Siap menemukan properti premium Anda?</h2>
          <p className="k-cta-p">Ceritakan kebutuhan Anda — memiliki vila impian, menyewa untuk musim ini, menyewakan aset, atau berinvestasi. Saya balas cepat, biasanya di hari yang sama.</p>
          <div className="k-row k-center-row">
            <a href="#" className="k-btn k-btn-gold k-lg"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" /> WhatsApp Kirana</a>
            <a href="#" className="k-btn k-btn-glass k-lg">halo@kirana.property</a>
          </div>
          <p className="k-cta-note">Kantor: Jl. Pantai Berawa, Canggu · Sen–Sab, 09.00–19.00 WITA</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="k-foot">
        <div className="k-wrap k-foot-in">
          <Brand />
          <div className="k-muted k-sm">© {new Date().getFullYear()} Kirana · Kirana Sutanto · Spesialis Properti Premium Bali</div>
          <div className="k-foot-links">{NAV.map(([l, h]) => <a key={l} href={h}>{l}</a>)}</div>
        </div>
        <div className="k-wrap k-madewith">Dibuat dengan <b>cakra</b></div>
      </footer>

      <style>{`
        .kir{
          --k-bg:#F2F6F6; --k-surface:#FFFFFF; --k-ink:#1E2A2E; --k-ink-2:#33454B; --k-muted:#5E7178;
          --k-line:#DDE7E7; --k-line-2:#C6D6D6; --k-emerald:#357482; --k-emerald-2:#265863; --k-gold:#B0812F; --k-gold-2:#957026;
          --k-r:4px;
          background:var(--k-bg); color:var(--k-ink); min-height:100vh;
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
          padding:.72rem 1.4rem; border-radius:var(--k-r); border:1.5px solid transparent; cursor:pointer; text-decoration:none; transition:.16s; white-space:nowrap; }
        .k-lg{ padding:.95rem 1.8rem; font-size:.98rem; }
        .k-btn-primary{ background:var(--k-emerald); color:#fff; }
        .k-btn-primary:hover{ background:var(--k-emerald-2); }
        .k-btn-gold{ background:var(--k-gold); color:#fff; }
        .k-btn-gold:hover{ background:var(--k-gold-2); }
        .k-btn-ghost{ background:transparent; color:var(--k-ink); border-color:var(--k-line-2); }
        .k-btn-ghost:hover{ border-color:var(--k-emerald); color:var(--k-emerald); }
        .k-btn-glass{ background:rgba(255,255,255,.12); color:#fff; border-color:rgba(255,255,255,.45); backdrop-filter:blur(6px); }
        .k-btn-glass:hover{ background:rgba(255,255,255,.22); }

        .k-nav{ position:sticky; top:0; z-index:40; background:color-mix(in oklab, var(--k-bg) 90%, transparent); backdrop-filter:blur(10px); border-bottom:1px solid var(--k-line); }
        .k-nav-in{ display:flex; align-items:center; justify-content:space-between; height:76px; }
        .k-brand{ display:flex; align-items:center; gap:12px; text-decoration:none; color:var(--k-ink); }
        .k-mark{ width:54px; height:54px; border-radius:50%; background:var(--k-emerald); color:var(--k-gold);
          display:grid; place-items:center; font-family:var(--k-font-script), cursive; font-size:2rem; font-weight:700; line-height:1; padding-bottom:5px; box-shadow:0 8px 20px -10px var(--k-emerald); }
        .k-word{ font-family:var(--k-font-display), serif; font-weight:600; font-size:1.6rem; letter-spacing:.01em; }
        .k-nav-right{ display:flex; align-items:center; gap:30px; }
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

        .k-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:0; margin-top:-44px; position:relative; z-index:2; background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); box-shadow:0 30px 60px -40px rgba(15,32,38,.5); overflow:hidden; }
        .k-stat{ padding:26px 24px; text-align:center; border-right:1px solid var(--k-line); }
        .k-stat:last-child{ border-right:none; }
        .k-stat-n{ font-family:var(--k-font-display), serif; font-weight:700; font-size:clamp(1.7rem,2.8vw,2.3rem); color:var(--k-emerald); font-variant-numeric:tabular-nums; }
        .k-stat-l{ color:var(--k-muted); font-size:.9rem; margin-top:2px; }

        .k-sec{ padding:clamp(60px,9vw,104px) clamp(18px,4vw,30px); }
        .k-band{ background:var(--k-surface); border-top:1px solid var(--k-line); border-bottom:1px solid var(--k-line); }
        .k-head{ display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:32px; flex-wrap:wrap; }

        .k-grid{ display:grid; gap:24px; }
        .k-grid-3{ grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); }
        .k-grid-4{ grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); }

        .k-serv{ padding:6px 0; }
        .k-serv-ic{ display:inline-grid; place-items:center; width:52px; height:52px; border-radius:50%; background:color-mix(in oklab, var(--k-emerald) 10%, var(--k-surface)); color:var(--k-emerald); margin-bottom:16px; border:1px solid color-mix(in oklab, var(--k-emerald) 18%, transparent); }
        .k-serv-t{ font-size:1.3rem; margin-bottom:6px; }

        .k-card{ background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); overflow:hidden; transition:transform .18s, box-shadow .18s; }
        .k-card:hover{ transform:translateY(-3px); box-shadow:0 26px 50px -34px rgba(15,32,38,.5); }
        .k-card-media{ position:relative; aspect-ratio:3/2; overflow:hidden; }
        .k-media-sm{ aspect-ratio:16/10; }
        .k-card-media img{ width:100%; height:100%; object-fit:cover; transition:transform .5s; }
        .k-card:hover .k-card-media img{ transform:scale(1.05); }
        .k-badge{ position:absolute; top:12px; left:12px; background:var(--k-emerald); color:#fff; font-size:.68rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:.32rem .66rem; border-radius:2px; }
        .k-badge-gold{ background:var(--k-gold); }
        .k-card-body{ padding:18px 20px 22px; }
        .k-price{ font-family:var(--k-font-display), serif; font-weight:700; color:var(--k-emerald); font-size:1.3rem; }
        .k-per{ font-family:var(--k-font-body); font-size:.8rem; font-weight:600; color:var(--k-muted); }
        .k-card-t{ font-size:1.22rem; margin:4px 0 3px; }
        .k-meta{ color:var(--k-muted); font-size:.82rem; margin-top:8px; font-family:var(--font-mono, ui-monospace, monospace); letter-spacing:.01em; }
        .k-tagtext{ font-size:.72rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--k-gold); }

        .k-areas{ display:flex; flex-wrap:wrap; gap:12px; justify-content:center; max-width:820px; margin:0 auto; }
        .k-area{ font-family:var(--k-font-display), serif; font-size:1.15rem; padding:.6rem 1.4rem; border:1px solid var(--k-line-2); border-radius:999px; color:var(--k-ink); background:var(--k-surface); transition:.15s; }
        .k-area:hover{ border-color:var(--k-emerald); color:var(--k-emerald); }

        .k-split{ display:grid; grid-template-columns:.9fr 1.1fr; gap:clamp(30px,5vw,64px); align-items:center; padding:clamp(60px,9vw,104px) clamp(18px,4vw,30px); }
        .k-about-img{ border-radius:var(--k-r); overflow:hidden; aspect-ratio:4/3; box-shadow:0 34px 64px -44px rgba(15,32,38,.6); }
        .k-about-img img{ width:100%; height:100%; object-fit:cover; }
        .k-list{ list-style:none; padding:0; margin:0 0 26px; display:grid; gap:13px; }
        .k-list li{ display:flex; gap:12px; align-items:flex-start; color:var(--k-ink-2); }
        .k-check{ flex:none; width:24px; height:24px; border-radius:50%; background:color-mix(in oklab, var(--k-emerald) 12%, var(--k-surface)); color:var(--k-emerald); display:grid; place-items:center; margin-top:2px; }

        .k-step-n{ font-family:var(--k-font-display), serif; font-size:2.4rem; font-weight:700; color:var(--k-gold); line-height:1; margin-bottom:12px; }
        .k-step{ border-top:2px solid var(--k-line); padding-top:20px; }

        .k-testi{ padding:28px 28px 24px; }
        .k-stars{ color:var(--k-gold); letter-spacing:3px; margin-bottom:12px; }
        .k-quote{ font-family:var(--k-font-display), serif; font-size:1.16rem; line-height:1.5; font-style:italic; margin:0 0 16px; }
        .k-testi-by{ font-size:.95rem; line-height:1.4; }

        .k-faq-grid{ display:grid; grid-template-columns:1fr 1fr; gap:2px 52px; }
        .k-faq{ border-bottom:1px solid var(--k-line); }
        .k-faq summary{ list-style:none; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:16px; padding:22px 2px; font-weight:600; font-size:1.1rem; color:var(--k-ink); }
        .k-faq summary::-webkit-details-marker{ display:none; }
        .k-faq summary:hover{ color:var(--k-emerald); }
        .k-chev{ color:var(--k-gold); transition:transform .25s; flex:none; }
        .k-faq[open] .k-chev{ transform:rotate(180deg); }
        .k-faq p{ margin:0; padding:0 2px 24px; color:var(--k-muted); font-size:1.02rem; line-height:1.68; max-width:62ch; }

        .k-cta{ position:relative; overflow:hidden; background:linear-gradient(120deg, var(--k-emerald-2), var(--k-emerald)); border-radius:var(--k-r); padding:clamp(44px,7vw,80px) clamp(24px,5vw,56px); text-align:center; box-shadow:0 40px 80px -44px var(--k-emerald); }
        .k-cta-p{ color:rgba(255,255,255,.88); max-width:52ch; margin:12px auto 0; font-size:1.06rem; }
        .k-cta-note{ color:rgba(255,255,255,.68); font-size:.85rem; margin-top:18px; }

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

        @media (max-width: 900px){ .k-links, .k-foot-links{ display:none; } .k-stats{ grid-template-columns:1fr 1fr; } .k-stat:nth-child(2){ border-right:none; } .k-stat{ border-bottom:1px solid var(--k-line); } .k-split{ grid-template-columns:1fr; } .k-about-img{ order:-1; } .k-faq-grid{ grid-template-columns:1fr; } }
        @media (max-width: 640px){ .k-wrap{ padding-left:8px; padding-right:8px; } .k-sec{ padding-left:8px; padding-right:8px; } .k-hero-in{ padding-left:8px; padding-right:8px; } }
      `}</style>
    </div>
  );
}
