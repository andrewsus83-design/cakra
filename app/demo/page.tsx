import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";

const display = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--l-font-display" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--l-font-body" });

export const metadata: Metadata = {
  title: "LUMA Property — Spesialis Properti & Investasi Bali",
  description: "Kirana Sutanto — spesialis vila mewah & investasi properti di Bali. Dari pencarian hingga serah terima, ditemani setiap langkah.",
};

const NAV = [
  ["Beranda", "#top"], ["Tentang", "#tentang"], ["Listing", "#listing"], ["Hub", "#hub"], ["FAQ", "#faq"],
];

const STATS = [
  ["8+", "tahun pengalaman"],
  ["120+", "properti terjual"],
  ["Rp 800 M+", "nilai transaksi"],
  ["4.9★", "rating klien"],
];

const LISTINGS = [
  { t: "Vila Uluwatu Cliff", loc: "Uluwatu, Bali", price: "Rp 14 M", beds: 5, baths: 5, size: 480, img: "/about/transform.jpg", tag: "Dijual" },
  { t: "Vila Canggu Modern", loc: "Canggu, Bali", price: "Rp 8,5 M", beds: 4, baths: 4, size: 320, img: "/about/hero.jpg", tag: "Dijual" },
  { t: "Townhouse Seminyak", loc: "Seminyak, Bali", price: "Rp 6,2 M", beds: 3, baths: 3, size: 210, img: "/hero.jpg", tag: "Dijual" },
  { t: "Vila Ubud Valley", loc: "Ubud, Bali", price: "Rp 11 M", beds: 4, baths: 4, size: 360, img: "/about/vision-hill.jpg", tag: "Investasi" },
];

const TESTI = [
  { q: "Kirana paham betul pasar Bali. Proses beli vila kami cepat, transparan, dan tanpa drama.", n: "Andreas W.", r: "Pembeli vila, Canggu" },
  { q: "Responsif dan jujur soal angka. Nilai sewa vila kami naik setelah ikut sarannya.", n: "Putri M.", r: "Investor, Uluwatu" },
];

const ARTICLES = [
  { c: "Pasar", t: "Panduan harga vila Canggu 2026", e: "Ke mana arah harga tanah & vila di koridor Berawa–Pererenan.", img: "/blog-0.jpg" },
  { c: "Investasi", t: "ROI vila sewa: angka yang realistis", e: "Cara menghitung imbal hasil sewa tanpa asumsi berlebihan.", img: "/blog-1.jpg" },
  { c: "Legal", t: "Hak pakai vs hak milik untuk pembeli", e: "Yang wajib Anda tahu sebelum membeli properti di Bali.", img: "/blog-2.jpg" },
];

const FAQS = [
  ["Area mana saja yang Anda tangani?", "Fokus di Bali Selatan — Canggu, Seminyak, Uluwatu, Sanur — dan Ubud untuk properti investasi."],
  ["Apakah membantu pembeli asing?", "Ya. Saya memandu struktur kepemilikan yang legal dan aman, lengkap dengan notaris & konsultan pajak tepercaya."],
  ["Berapa biaya jasa untuk penjual?", "Komisi standar dibahas transparan di awal, dengan strategi pemasaran (video, listing, iklan) yang jelas."],
  ["Bisakah bantu menyewakan vila saya?", "Bisa. Dari penetapan harga sewa, foto/video, hingga manajemen calon penyewa."],
];

function Ic({ d }: { d: string }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

export default function Demo() {
  return (
    <div className={`${display.variable} ${body.variable} luma`} id="top">
      {/* NAV */}
      <header className="l-nav">
        <div className="l-wrap l-nav-in">
          <a href="#top" className="l-brand">
            <span className="l-mark"><span className="l-dot" /></span>
            <span className="l-word">LUMA</span>
          </a>
          <nav className="l-links">
            {NAV.map(([l, h]) => <a key={l} href={h}>{l}</a>)}
          </nav>
          <a href="#kontak" className="l-btn l-btn-primary l-nav-cta">Hubungi</a>
        </div>
      </header>

      {/* HERO */}
      <section className="l-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-top.jpg" alt="Vila mewah Bali" className="l-hero-img" />
        <div className="l-hero-scrim" />
        <div className="l-wrap l-hero-in">
          <span className="l-eyebrow">Spesialis properti & investasi · Bali</span>
          <h1 className="l-h1">Properti Bali kelas atas, ditangani dengan serius.</h1>
          <p className="l-lead">Kirana Sutanto — spesialis vila mewah & investasi properti di Bali. Dari pencarian hingga serah terima, Anda ditemani setiap langkah, dengan angka yang jujur.</p>
          <div className="l-row">
            <a href="#listing" className="l-btn l-btn-primary l-lg">Lihat properti</a>
            <a href="#kontak" className="l-btn l-btn-glass l-lg">Hubungi Kirana</a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="l-wrap l-stats">
        {STATS.map(([n, l]) => (
          <div key={l} className="l-stat">
            <div className="l-stat-n">{n}</div>
            <div className="l-stat-l">{l}</div>
          </div>
        ))}
      </section>

      {/* LISTING */}
      <section id="listing" className="l-wrap l-sec">
        <div className="l-head">
          <div>
            <span className="l-kick">Properti pilihan</span>
            <h2 className="l-h2">Vila & investasi terbaik minggu ini.</h2>
          </div>
          <a href="#kontak" className="l-btn l-btn-ghost">Minta daftar lengkap</a>
        </div>
        <div className="l-grid">
          {LISTINGS.map((p) => (
            <article key={p.t} className="l-card">
              <div className="l-card-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.t} />
                <span className="l-badge">{p.tag}</span>
              </div>
              <div className="l-card-body">
                <div className="l-price">{p.price}</div>
                <h3 className="l-card-t">{p.t}</h3>
                <div className="l-muted l-sm">{p.loc}</div>
                <div className="l-meta">{p.beds} KT · {p.baths} KM · {p.size} m²</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="l-band">
        <div className="l-wrap l-split">
          <div className="l-about-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/about/origin.jpg" alt="Ruang kerja Kirana Sutanto" />
          </div>
          <div>
            <span className="l-kick">Tentang Kirana</span>
            <h2 className="l-h2">Agen yang bekerja untuk Anda, bukan sekadar menutup transaksi.</h2>
            <p className="l-muted l-p">Delapan tahun di pasar properti Bali mengajarkan satu hal: kepercayaan dibangun dari angka yang jujur dan komunikasi yang cepat. Saya bantu Anda memahami nilai, legalitas, dan potensi — sebelum Anda menandatangani apa pun.</p>
            <ul className="l-list">
              {["Pendampingan penuh, dari survei hingga notaris", "Data pasar & simulasi imbal hasil yang realistis", "Jaringan notaris, pajak, dan kontraktor tepercaya"].map((x) => (
                <li key={x}><span className="l-check"><Ic d="M20 6 9 17l-5-5" /></span>{x}</li>
              ))}
            </ul>
            <a href="#kontak" className="l-btn l-btn-primary">Jadwalkan konsultasi</a>
          </div>
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="l-wrap l-sec">
        <span className="l-kick">Kata klien</span>
        <h2 className="l-h2 l-center">Dipercaya pembeli & investor.</h2>
        <div className="l-testi-grid">
          {TESTI.map((t) => (
            <blockquote key={t.n} className="l-card l-testi">
              <div className="l-stars">★★★★★</div>
              <p className="l-quote">“{t.q}”</p>
              <div className="l-testi-by"><b>{t.n}</b><span className="l-muted"> · {t.r}</span></div>
            </blockquote>
          ))}
        </div>
      </section>

      {/* HUB */}
      <section id="hub" className="l-band">
        <div className="l-wrap l-sec">
          <div className="l-head">
            <div><span className="l-kick">Wawasan</span><h2 className="l-h2">Pahami pasar sebelum melangkah.</h2></div>
            <a href="#kontak" className="l-btn l-btn-ghost">Tanya langsung</a>
          </div>
          <div className="l-grid l-grid-3">
            {ARTICLES.map((a) => (
              <article key={a.t} className="l-card">
                <div className="l-card-media l-media-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.img} alt={a.t} />
                </div>
                <div className="l-card-body">
                  <span className="l-tagtext">{a.c}</span>
                  <h3 className="l-card-t">{a.t}</h3>
                  <p className="l-muted l-sm">{a.e}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="l-wrap l-sec">
        <span className="l-kick">FAQ</span>
        <h2 className="l-h2">Pertanyaan yang sering diajukan.</h2>
        <div className="l-faq-grid">
          {FAQS.map(([q, a]) => (
            <details key={q} className="l-faq">
              <summary>{q}<span className="l-chev"><Ic d="m6 9 6 6 6-6" /></span></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* KONTAK */}
      <section id="kontak" className="l-wrap l-sec">
        <div className="l-cta">
          <span className="l-kick" style={{ color: "rgba(255,255,255,.75)" }}>Hubungi Kirana</span>
          <h2 className="l-h2" style={{ color: "#fff" }}>Siap menemukan properti Anda?</h2>
          <p style={{ color: "rgba(255,255,255,.85)", maxWidth: "48ch", margin: "10px auto 0" }}>Ceritakan kebutuhan Anda — vila untuk ditinggali, investasi sewa, atau menjual aset. Saya balas cepat, biasanya di hari yang sama.</p>
          <div className="l-row l-center-row">
            <a href="#" className="l-btn l-btn-white l-lg"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" /> WhatsApp Kirana</a>
            <a href="#" className="l-btn l-btn-glass l-lg">halo@lumaproperty.id</a>
          </div>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".85rem", marginTop: 16 }}>Kantor: Jl. Pantai Berawa, Canggu · Sen–Sab, 09.00–19.00 WITA</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-foot">
        <div className="l-wrap l-foot-in">
          <div className="l-brand"><span className="l-mark"><span className="l-dot" /></span><span className="l-word">LUMA</span></div>
          <div className="l-muted l-sm">© {new Date().getFullYear()} LUMA Property · Kirana Sutanto · Spesialis Properti Bali</div>
          <div className="l-foot-links">{NAV.map(([l, h]) => <a key={l} href={h}>{l}</a>)}</div>
        </div>
        <div className="l-wrap l-madewith">Dibuat dengan <b>cakra</b></div>
      </footer>

      <style>{`
        .luma{
          --l-bg:#F5F8FD; --l-surface:#FFFFFF; --l-ink:#0E1626; --l-ink-2:#26324A; --l-muted:#5C6779;
          --l-line:#E4EAF4; --l-line-2:#CBD6E8; --l-accent:#2F6BFF; --l-accent-2:#1E4FD1; --l-pop:#FF6A3D;
          --l-r:12px; --l-r-lg:20px;
          background:var(--l-bg); color:var(--l-ink); min-height:100vh;
          font-family:var(--l-font-body), system-ui, sans-serif; line-height:1.55; -webkit-font-smoothing:antialiased;
        }
        .luma h1,.luma h2,.luma h3{ font-family:var(--l-font-display), system-ui, sans-serif; margin:0; letter-spacing:-.02em; }
        .luma img{ display:block; max-width:100%; }
        .l-wrap{ max-width:1180px; margin:0 auto; padding:0 clamp(18px,4vw,30px); }
        .l-muted{ color:var(--l-muted); }
        .l-sm{ font-size:.92rem; }
        .l-kick{ display:inline-block; font-size:.74rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--l-accent); margin-bottom:10px; }
        .l-h1{ font-size:clamp(2.3rem,5.2vw,4rem); font-weight:800; line-height:1.05; }
        .l-h2{ font-size:clamp(1.7rem,3.4vw,2.5rem); font-weight:700; line-height:1.14; }
        .l-center{ text-align:center; }
        .l-p{ font-size:1.05rem; margin:16px 0 22px; max-width:52ch; }
        .l-row{ display:flex; gap:12px; flex-wrap:wrap; }
        .l-center-row{ justify-content:center; }

        .l-btn{ display:inline-flex; align-items:center; gap:8px; font:inherit; font-weight:700; font-size:.95rem;
          padding:.7rem 1.3rem; border-radius:999px; border:1.6px solid transparent; cursor:pointer; text-decoration:none; transition:.16s; white-space:nowrap; }
        .l-lg{ padding:.95rem 1.7rem; font-size:1.02rem; }
        .l-btn-primary{ background:var(--l-accent); color:#fff; }
        .l-btn-primary:hover{ background:var(--l-accent-2); transform:translateY(-1px); }
        .l-btn-ghost{ background:transparent; color:var(--l-ink); border-color:var(--l-line-2); }
        .l-btn-ghost:hover{ border-color:var(--l-accent); color:var(--l-accent); }
        .l-btn-glass{ background:rgba(255,255,255,.14); color:#fff; border-color:rgba(255,255,255,.5); backdrop-filter:blur(6px); }
        .l-btn-glass:hover{ background:rgba(255,255,255,.24); }
        .l-btn-white{ background:#fff; color:var(--l-accent-2); }
        .l-btn-white:hover{ transform:translateY(-1px); }

        .l-nav{ position:sticky; top:0; z-index:40; background:color-mix(in oklab, var(--l-bg) 88%, transparent); backdrop-filter:blur(10px); border-bottom:1px solid var(--l-line); }
        .l-nav-in{ display:flex; align-items:center; justify-content:space-between; height:70px; }
        .l-brand{ display:flex; align-items:center; gap:9px; text-decoration:none; color:var(--l-ink); }
        .l-mark{ width:30px; height:30px; border-radius:9px; background:linear-gradient(135deg, var(--l-accent), var(--l-pop)); display:grid; place-items:center; box-shadow:0 6px 16px -6px var(--l-accent); }
        .l-dot{ width:10px; height:10px; border-radius:50%; background:#fff; }
        .l-word{ font-family:var(--l-font-display); font-weight:800; font-size:1.35rem; letter-spacing:.02em; }
        .l-links{ display:flex; gap:26px; }
        .l-links a{ color:var(--l-ink-2); text-decoration:none; font-weight:500; font-size:.98rem; transition:color .15s; }
        .l-links a:hover{ color:var(--l-accent); }

        .l-hero{ position:relative; overflow:hidden; }
        .l-hero-img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .l-hero-scrim{ position:absolute; inset:0; background:linear-gradient(105deg, rgba(9,14,26,.86) 0%, rgba(9,14,26,.6) 46%, rgba(9,14,26,.24) 100%); }
        .l-hero-in{ position:relative; padding:clamp(64px,11vw,120px) clamp(18px,4vw,30px) clamp(70px,12vw,128px); max-width:760px; }
        .l-hero .l-eyebrow{ display:inline-block; font-size:.8rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#9db8ff; margin-bottom:14px; }
        .l-hero .l-h1{ color:#fff; }
        .l-lead{ color:rgba(255,255,255,.9); font-size:1.2rem; line-height:1.6; margin:20px 0 30px; max-width:56ch; }

        .l-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:-42px; position:relative; z-index:2; }
        .l-stat{ background:var(--l-surface); border:1px solid var(--l-line); border-radius:var(--l-r); padding:22px 20px; box-shadow:0 20px 40px -30px rgba(14,22,38,.5); }
        .l-stat-n{ font-family:var(--l-font-display); font-weight:800; font-size:clamp(1.6rem,2.6vw,2.1rem); color:var(--l-accent); font-variant-numeric:tabular-nums; }
        .l-stat-l{ color:var(--l-muted); font-size:.92rem; margin-top:2px; }

        .l-sec{ padding:clamp(56px,8vw,96px) clamp(18px,4vw,30px); }
        .l-band{ background:var(--l-surface); border-top:1px solid var(--l-line); border-bottom:1px solid var(--l-line); }
        .l-head{ display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:28px; flex-wrap:wrap; }

        .l-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:22px; }
        .l-grid-3{ grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); }
        .l-card{ background:var(--l-surface); border:1px solid var(--l-line); border-radius:var(--l-r-lg); overflow:hidden; transition:transform .18s, box-shadow .18s; }
        .l-card:hover{ transform:translateY(-3px); box-shadow:0 24px 46px -30px rgba(14,22,38,.5); }
        .l-card-media{ position:relative; aspect-ratio:4/3; overflow:hidden; }
        .l-media-sm{ aspect-ratio:16/10; }
        .l-card-media img{ width:100%; height:100%; object-fit:cover; transition:transform .4s; }
        .l-card:hover .l-card-media img{ transform:scale(1.05); }
        .l-badge{ position:absolute; top:12px; left:12px; background:var(--l-accent); color:#fff; font-size:.7rem; font-weight:700; letter-spacing:.03em; text-transform:uppercase; padding:.3rem .6rem; border-radius:8px; }
        .l-card-body{ padding:16px 18px 20px; }
        .l-price{ font-weight:800; color:var(--l-accent); font-size:1.15rem; font-variant-numeric:tabular-nums; }
        .l-card-t{ font-size:1.16rem; font-weight:700; margin:4px 0 3px; }
        .l-meta{ color:var(--l-muted); font-size:.86rem; margin-top:8px; }
        .l-tagtext{ font-size:.72rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--l-accent); }

        .l-split{ display:grid; grid-template-columns:.9fr 1.1fr; gap:clamp(28px,5vw,60px); align-items:center; padding-top:clamp(56px,8vw,96px); padding-bottom:clamp(56px,8vw,96px); }
        .l-about-img{ border-radius:var(--l-r-lg); overflow:hidden; aspect-ratio:4/3; box-shadow:0 30px 60px -40px rgba(14,22,38,.6); }
        .l-about-img img{ width:100%; height:100%; object-fit:cover; }
        .l-list{ list-style:none; padding:0; margin:0 0 24px; display:grid; gap:12px; }
        .l-list li{ display:flex; gap:12px; align-items:flex-start; color:var(--l-ink-2); }
        .l-check{ flex:none; width:26px; height:26px; border-radius:8px; background:color-mix(in oklab, var(--l-accent) 14%, var(--l-surface)); color:var(--l-accent); display:grid; place-items:center; }

        .l-testi-grid{ display:grid; grid-template-columns:1fr 1fr; gap:22px; margin-top:26px; }
        .l-testi{ padding:26px 26px 24px; }
        .l-stars{ color:var(--l-pop); letter-spacing:2px; margin-bottom:10px; }
        .l-quote{ font-size:1.12rem; line-height:1.55; margin:0 0 14px; }
        .l-testi-by{ font-size:.95rem; }

        .l-faq-grid{ display:grid; grid-template-columns:1fr 1fr; gap:2px 48px; margin-top:22px; }
        .l-faq{ border-bottom:1px solid var(--l-line); }
        .l-faq summary{ list-style:none; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:16px; padding:20px 2px; font-weight:600; font-size:1.08rem; }
        .l-faq summary::-webkit-details-marker{ display:none; }
        .l-faq summary:hover{ color:var(--l-accent); }
        .l-chev{ color:var(--l-accent); transition:transform .25s; flex:none; }
        .l-faq[open] .l-chev{ transform:rotate(180deg); }
        .l-faq p{ margin:0; padding:0 2px 22px; color:var(--l-muted); font-size:1rem; line-height:1.65; max-width:60ch; }

        .l-cta{ background:linear-gradient(120deg, var(--l-accent-2), var(--l-accent)); border-radius:var(--l-r-lg); padding:clamp(40px,7vw,72px) clamp(24px,5vw,56px); text-align:center; box-shadow:0 40px 80px -40px var(--l-accent); }

        .l-foot{ background:var(--l-ink); color:#fff; padding:36px 0 24px; }
        .l-foot .l-word{ color:#fff; }
        .l-foot .l-muted{ color:rgba(255,255,255,.6); }
        .l-foot-in{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .l-foot-links{ display:flex; gap:18px; }
        .l-foot-links a{ color:rgba(255,255,255,.72); text-decoration:none; font-size:.9rem; }
        .l-foot-links a:hover{ color:#fff; }
        .l-madewith{ margin-top:20px; padding-top:18px; border-top:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.6); font-size:.84rem; }
        .l-madewith b{ color:#fff; }

        @media (max-width: 900px){ .l-links, .l-foot-links{ display:none; } .l-stats{ grid-template-columns:1fr 1fr; } .l-split{ grid-template-columns:1fr; } .l-about-img{ order:-1; } .l-testi-grid, .l-faq-grid{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
