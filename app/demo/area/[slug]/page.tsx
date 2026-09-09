import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Playfair_Display, Manrope, Dancing_Script } from "next/font/google";
import { KIR_CSS } from "@/components/kirTheme";

const display = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--k-font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--k-font-body" });
const script = Dancing_Script({ subsets: ["latin"], weight: ["600", "700"], variable: "--k-font-script" });

const WA = "6281234567890";
const waLink = (area: string) =>
  `https://wa.me/${WA}?text=${encodeURIComponent(`Halo Kirana, saya tertarik dengan vila premium di ${area}. Boleh minta info?`)}`;

type Listing = { t: string; tag: string; price: string; per?: string; beds: number; baths: number; size: number; img: string };
type Area = {
  name: string; kicker: string; lead: string; blurb: string; forWho: string;
  priceNote: string; highlights: string[]; hero: string; listings: Listing[]; faq: [string, string][];
};

const AREAS: Record<string, Area> = {
  canggu: {
    name: "Canggu", kicker: "vila premium canggu",
    lead: "Denyut nadi Bali modern — kafe, coworking, pantai surf, dan komunitas ekspatriat yang aktif.",
    blurb: "Canggu adalah kawasan paling dinamis di Bali Selatan: perpaduan gaya hidup pantai, kuliner, dan sewa jangka pendek yang kuat. Cocok untuk pembeli yang mengincar potensi sewa tinggi dan likuiditas jual kembali yang baik. Pertimbangkan kepadatan dan lalu lintas di jam sibuk saat memilih lokasi.",
    forWho: "Investor sewa, pembeli gaya hidup aktif, dan pemilik yang mengutamakan likuiditas resale.",
    priceNote: "Vila premium di Canggu umumnya mulai Rp 6 miliar ke atas, sangat dipengaruhi jarak ke pantai Berawa/Batu Bolong dan status tanah.",
    highlights: ["Permintaan sewa harian & jangka panjang tinggi", "Dekat pantai surf, kafe, dan sekolah internasional", "Likuiditas jual kembali relatif baik"],
    hero: "/hero.webp",
    listings: [{ t: "Vila Canggu Estate", tag: "Dijual", price: "Rp 8,5 M", beds: 4, baths: 4, size: 320, img: "/about/hero.webp" }],
    faq: [
      ["Apakah vila di Canggu bagus untuk investasi sewa?", "Ya, Canggu punya permintaan sewa yang kuat sepanjang tahun. Kunci imbal hasil ada pada lokasi mikro, kualitas manajemen, dan legalitas sewa — hal yang kami periksa sejak awal."],
      ["Berapa kisaran harga vila premium di Canggu?", "Umumnya mulai Rp 6 miliar ke atas, tergantung jarak ke pantai dan status tanah. Angka ini indikatif; penilaian resmi diberikan setelah kurasi."],
    ],
  },
  pererenan: {
    name: "Pererenan", kicker: "vila premium pererenan",
    lead: "Sisi Canggu yang lebih tenang dan lapang — favorit pencari sawah, privasi, dan ruang lebih luas.",
    blurb: "Pererenan menawarkan ketenangan dan lahan yang lebih lapang tanpa jauh dari keramaian Canggu. Kawasan ini berkembang cepat, sehingga nilai tanah sangat dipengaruhi zonasi dan jarak ke pantai. Pilihan tepat bagi yang ingin ruang dan privasi dengan potensi apresiasi.",
    forWho: "Pembeli yang mencari privasi, ruang lebih luas, dan potensi apresiasi nilai tanah.",
    priceNote: "Nilai tanah Pererenan bergerak cepat; harga sangat bergantung pada zonasi dan kedekatan ke pantai. Semua angka bersifat indikatif.",
    highlights: ["Suasana sawah & lebih privat", "Berkembang cepat, potensi apresiasi", "Tetap dekat ke fasilitas Canggu"],
    hero: "/about/vision-hill.webp",
    listings: [],
    faq: [
      ["Apa beda Pererenan dengan Canggu?", "Pererenan lebih tenang, lapang, dan privat, sementara Canggu lebih ramai dan komersial. Banyak pembeli memilih Pererenan untuk hunian dengan ruang lebih."],
      ["Apakah Pererenan cocok untuk investasi?", "Ya, terutama untuk apresiasi tanah jangka menengah. Zonasi dan legalitas wajib diverifikasi sebelum membeli."],
    ],
  },
  seminyak: {
    name: "Seminyak", kicker: "vila premium seminyak",
    lead: "Matang, kosmopolitan, dekat pantai, butik, dan fine dining.",
    blurb: "Seminyak adalah kawasan premium yang matang: dekat pantai, butik desainer, dan restoran kelas atas. Cocok untuk vila premium siap huni. Lahan terbatas, sehingga kelangkaan menjadi bagian dari nilainya — properti berkualitas di sini cenderung mempertahankan nilai.",
    forWho: "Pembeli vila siap-huni premium dan penyewa jangka panjang yang mengutamakan lokasi matang.",
    priceNote: "Karena lahan terbatas, properti premium Seminyak dihargai pada level kelangkaan. Kisaran indikatif, diverifikasi per properti.",
    highlights: ["Lokasi matang & kosmopolitan", "Dekat pantai, butik, fine dining", "Kelangkaan lahan menjaga nilai"],
    hero: "/hero.webp",
    listings: [{ t: "Vila Seminyak Retreat", tag: "Disewa", price: "Rp 3,2 M", per: "/thn", beds: 3, baths: 3, size: 210, img: "/hero.webp" }],
    faq: [
      ["Mengapa properti Seminyak cenderung mahal?", "Lahan terbatas di lokasi matang membuat kelangkaan menjadi bagian dari nilai. Ini juga yang membantu properti berkualitas mempertahankan harga."],
      ["Apakah tersedia untuk sewa jangka panjang?", "Ya, Seminyak populer untuk sewa tahunan. Kami bantu mencocokkan properti dengan kebutuhan dan anggaran Anda."],
    ],
  },
  uluwatu: {
    name: "Uluwatu", kicker: "vila clifftop uluwatu",
    lead: "Tebing dramatis, pemandangan samudra, dan properti clifftop ikonik.",
    blurb: "Uluwatu adalah rumah bagi vila clifftop paling ikonik di Bali — untuk pembeli yang memprioritaskan privasi, pemandangan samudra, dan arsitektur yang menjadi pernyataan. Perlu perhatian ekstra pada akses jalan, ketersediaan air, dan garis sempadan jurang saat menilai sebuah properti.",
    forWho: "Pembeli yang mengutamakan privasi, view samudra, dan properti statement.",
    priceNote: "Vila clifftop Uluwatu premium umumnya berada di level tertinggi pasar Bali. Angka indikatif; view dan garis sempadan sangat memengaruhi nilai.",
    highlights: ["Pemandangan samudra & sunset privat", "Privasi tinggi, arsitektur statement", "Cek akses, air, dan sempadan jurang"],
    hero: "/about/transform.webp",
    listings: [{ t: "Vila Uluwatu Cliff", tag: "Dijual", price: "Rp 14 M", beds: 5, baths: 5, size: 480, img: "/about/transform.webp" }],
    faq: [
      ["Apa yang perlu diperiksa saat membeli vila clifftop?", "Akses jalan, sumber & ketersediaan air, kestabilan tebing, dan garis sempadan jurang. Kami periksa hal ini sebelum Anda menawar."],
      ["Apakah view samudra memengaruhi harga?", "Sangat. View, orientasi sunset, dan privasi adalah penentu utama nilai vila clifftop di Uluwatu."],
    ],
  },
  jimbaran: {
    name: "Jimbaran", kicker: "vila premium jimbaran",
    lead: "Teluk tenang, dekat bandara, komunitas keluarga.",
    blurb: "Jimbaran menawarkan teluk yang tenang, kedekatan dengan bandara, dan suasana komunitas keluarga. Cocok untuk hunian tinggal maupun investasi yang terukur, dengan keseimbangan antara ketenangan dan akses.",
    forWho: "Keluarga, pembeli hunian tinggal, dan investor yang mencari nilai terukur.",
    priceNote: "Jimbaran menawarkan nilai yang lebih seimbang dibanding kawasan clifftop. Kisaran harga indikatif, diverifikasi per properti.",
    highlights: ["Teluk tenang, dekat bandara", "Suasana keluarga & matang", "Keseimbangan harga dan lokasi"],
    hero: "/about/invite.webp",
    listings: [{ t: "Vila Jimbaran Bay", tag: "Dijual", price: "Rp 9,3 M", beds: 4, baths: 4, size: 340, img: "/about/invite.webp" }],
    faq: [
      ["Apakah Jimbaran cocok untuk keluarga?", "Ya, Jimbaran punya suasana tenang, komunitas mapan, dan akses mudah ke bandara serta fasilitas."],
      ["Bagaimana potensi investasinya?", "Terukur dan stabil. Cocok bagi yang mengutamakan hunian nyaman dengan nilai yang wajar."],
    ],
  },
  "nusa-dua": {
    name: "Nusa Dua", kicker: "properti premium nusa dua",
    lead: "Kawasan resor terencana dengan tata kelola rapi.",
    blurb: "Nusa Dua adalah kawasan resor yang terencana dengan tata kelola rapi dan keamanan yang baik. Pilihan bagi pembeli yang mengutamakan kepastian legal, ketertiban lingkungan, dan lingkungan resor yang terjaga.",
    forWho: "Pembeli yang mengutamakan keamanan, ketertiban, dan kepastian legal.",
    priceNote: "Properti di kawasan terencana Nusa Dua dihargai atas dasar tata kelola dan kepastiannya. Angka indikatif.",
    highlights: ["Kawasan resor terencana", "Keamanan & tata kelola rapi", "Kepastian legal yang lebih tinggi"],
    hero: "/hero-top.webp",
    listings: [],
    faq: [
      ["Kenapa memilih Nusa Dua?", "Bagi yang mengutamakan keamanan, ketertiban, dan kepastian legal, kawasan terencana Nusa Dua adalah pilihan yang menenangkan."],
      ["Apakah cocok untuk sewa?", "Bisa, terutama untuk segmen resor & keluarga. Kami bantu menilai potensi dan legalitas sewanya."],
    ],
  },
  sanur: {
    name: "Sanur", kicker: "vila premium sanur",
    lead: "Ritme pelan tepi pantai timur yang klasik, ramah keluarga, komunitas mapan.",
    blurb: "Sanur menawarkan ritme yang lebih pelan di pantai timur Bali — klasik, ramah keluarga, dengan komunitas yang mapan. Cocok untuk hunian jangka panjang bagi mereka yang menghargai ketenangan dan kedekatan dengan pantai yang tenang.",
    forWho: "Keluarga dan pembeli hunian jangka panjang yang menghargai ketenangan.",
    priceNote: "Sanur menawarkan nilai yang stabil dengan komunitas mapan. Kisaran harga indikatif, diverifikasi per properti.",
    highlights: ["Pantai timur yang tenang", "Ramah keluarga, komunitas mapan", "Cocok untuk hunian jangka panjang"],
    hero: "/hero-top.webp",
    listings: [{ t: "Vila Sanur Garden", tag: "Disewa", price: "Rp 3,8 M", per: "/thn", beds: 4, baths: 3, size: 300, img: "/hero-top.webp" }],
    faq: [
      ["Apakah Sanur cocok untuk tinggal jangka panjang?", "Sangat. Ritme pelan, komunitas mapan, dan pantai tenang membuat Sanur favorit untuk hunian jangka panjang."],
      ["Bagaimana suasana Sanur dibanding Canggu?", "Sanur jauh lebih tenang dan klasik, cocok bagi yang mencari ketenangan ketimbang hiruk-pikuk."],
    ],
  },
  ubud: {
    name: "Ubud", kicker: "vila premium ubud",
    lead: "Hijau, wellness, dan seni — vila di tengah hutan dan sawah.",
    blurb: "Ubud adalah jantung budaya dan wellness Bali: vila di tengah hutan, sungai, dan sawah. Menarik bagi pembeli yang mengutamakan gaya hidup dan ketenangan, bukan sekadar imbal hasil sewa. Nilai di sini banyak ditentukan oleh view, privasi, dan karakter lahan.",
    forWho: "Pembeli gaya hidup, wellness, dan investor jangka panjang yang menghargai karakter lahan.",
    priceNote: "Nilai vila Ubud sangat dipengaruhi view (sungai/hutan/sawah) dan privasi. Kisaran indikatif, diverifikasi per properti.",
    highlights: ["View hutan, sungai, dan sawah", "Pusat budaya & wellness", "Karakter lahan menentukan nilai"],
    hero: "/about/vision-hill.webp",
    listings: [{ t: "Vila Ubud Valley", tag: "Dijual", price: "Rp 11 M", beds: 4, baths: 4, size: 360, img: "/about/vision-hill.webp" }],
    faq: [
      ["Apakah Ubud cocok untuk investasi sewa?", "Ubud lebih cocok bagi pembeli gaya hidup jangka panjang. Sewa tetap ada, tetapi karakter dan view sering jadi daya tarik utamanya."],
      ["Apa yang menentukan nilai vila di Ubud?", "View (sungai, hutan, sawah), privasi, akses, dan karakter lahan adalah penentu utama."],
    ],
  },
};

const ORDER = ["canggu", "pererenan", "seminyak", "uluwatu", "jimbaran", "nusa-dua", "sanur", "ubud"];

export function generateStaticParams() {
  return ORDER.map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = AREAS[slug];
  if (!a) return {};
  const title = `Vila & Properti Premium ${a.name}, Bali — Jual & Sewa | Kirana`;
  const description = `${a.lead} Panduan kawasan ${a.name} dari Kirana Sutanto — spesialis vila premium Bali (mulai Rp 3 M), didampingi hingga serah terima yang aman & legal.`;
  const url = `https://cakra.xyz/demo/area/${slug}`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", images: [{ url: `https://cakra.xyz${a.hero}` }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

function Ic({ d, s = 18 }: { d: string; s?: number }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = AREAS[slug];
  if (!a) notFound();
  const wa = waLink(a.name);
  const url = `https://cakra.xyz/demo/area/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage", "@id": `${url}#webpage`, url, name: `Vila & Properti Premium ${a.name}, Bali`,
        description: a.lead, about: { "@id": "https://cakra.xyz/demo#agent" }, isPartOf: { "@id": "https://cakra.xyz/demo#website" },
      },
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: "https://cakra.xyz/demo" },
          { "@type": "ListItem", position: 2, name: "Kawasan", item: "https://cakra.xyz/demo#wilayah" },
          { "@type": "ListItem", position: 3, name: a.name, item: url },
        ],
      },
      {
        "@type": "RealEstateAgent", "@id": "https://cakra.xyz/demo#agent", name: "Kirana Sutanto",
        url: "https://cakra.xyz/demo", areaServed: { "@type": "Place", name: `${a.name}, Bali` },
        knowsAbout: [`vila premium ${a.name}`, "investasi properti Bali", "legalitas properti (hak pakai, PT PMA)"],
      },
      {
        "@type": "FAQPage", "@id": `${url}#faq`,
        mainEntity: a.faq.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } })),
      },
    ],
  };

  return (
    <div className={`${display.variable} ${body.variable} ${script.variable} kir`} id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <a href="/onboarding" className="k-ribbon">✨ Contoh situs agen — dibuat dengan <b>cakra</b> · Buat milik Anda →</a>

      <header className="k-nav">
        <div className="k-wrap k-nav-in">
          <a href="/demo" className="k-brand"><span className="k-mark">KS</span><span className="k-word">Kirana</span></a>
          <div className="k-nav-right">
            <nav className="k-links">
              <a href="/demo#listing">Listing</a><a href="/demo#wilayah">Kawasan</a><a href="/demo#tentang">Tentang</a><a href="/demo#faq">FAQ</a>
            </nav>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="k-btn k-btn-primary">Hubungi</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="k-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.hero} alt={`Vila premium di ${a.name}, Bali`} className="k-hero-img" />
        <div className="k-hero-scrim" />
        <div className="k-wrap k-hero-in">
          <div className="k-crumb">
            <a href="/demo">Beranda</a> <span>›</span> <a href="/demo#wilayah">Kawasan</a> <span>›</span> <span style={{ color: "#fff" }}>{a.name}</span>
          </div>
          <span className="k-kick k-kick-light">{a.kicker}</span>
          <h1 className="k-h1">Vila &amp; properti premium {a.name}, Bali.</h1>
          <p className="k-lead">{a.lead}</p>
          <div className="k-row">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="k-btn k-btn-gold k-lg"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" /> Tanya properti {a.name}</a>
            <a href="/demo#listing" className="k-btn k-btn-glass k-lg">Lihat semua listing</a>
          </div>
        </div>
      </section>

      {/* INTRO + HIGHLIGHTS */}
      <section className="k-wrap k-sec">
        <div className="k-split" style={{ padding: 0 }}>
          <div>
            <span className="k-kick">mengenal {a.name.toLowerCase()}</span>
            <h2 className="k-h2">Mengapa {a.name}?</h2>
            <p className="k-p">{a.blurb}</p>
            <ul className="k-list">
              {a.highlights.map((h) => (
                <li key={h}><span className="k-check"><Ic d="M20 6 9 17l-5-5" s={14} /></span>{h}</li>
              ))}
            </ul>
          </div>
          <div className="k-tldr">
            <h2 className="k-tldr-h">Ringkas — {a.name}</h2>
            <ul className="k-tldr-list">
              <li><b>Untuk siapa</b> — {a.forWho}</li>
              <li><b>Kisaran harga</b> — {a.priceNote}</li>
              <li><b>Pendampingan</b> — kurasi → negosiasi → legal → serah terima.</li>
            </ul>
            <p className="k-tldr-note">Semua kisaran harga bersifat indikatif; penilaian resmi diberikan setelah kurasi & pemeriksaan langsung.</p>
          </div>
        </div>
      </section>

      {/* LISTING (sample) */}
      {a.listings.length > 0 && (
        <section className="k-band">
          <div className="k-wrap k-sec">
            <div className="k-center"><span className="k-kick">contoh listing</span><h2 className="k-h2">Properti pilihan di {a.name}.</h2></div>
            <div className="k-grid k-grid-3">
              {a.listings.map((l) => (
                <a key={l.t} href="/demo#listing" className="k-card" style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="k-card-media k-media-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.img} alt={l.t} />
                    <span className={`k-badge${l.tag === "Disewa" ? " k-badge-gold" : ""}`}>{l.tag}</span>
                  </div>
                  <div className="k-card-body">
                    <div className="k-price">{l.price}{l.per && <span className="k-per">{l.per}</span>}</div>
                    <h3 className="k-card-t">{l.t}</h3>
                    <div className="k-meta">{l.beds} KT · {l.baths} KM · {l.size} m² · {a.name}, Bali</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AREA FAQ */}
      <section id="faq" className="k-wrap k-sec">
        <div className="k-center"><span className="k-kick">faq</span><h2 className="k-h2">Pertanyaan seputar properti {a.name}.</h2></div>
        <div className="k-faq-grid">
          {a.faq.map(([q, ans]) => (
            <details key={q} className="k-faq">
              <summary>{q}<span className="k-chev"><Ic d="m6 9 6 6 6-6" /></span></summary>
              <p>{ans}</p>
            </details>
          ))}
        </div>
      </section>

      {/* OTHER AREAS — internal linking */}
      <section className="k-band">
        <div className="k-wrap k-sec">
          <div className="k-center"><span className="k-kick">kawasan lain</span><h2 className="k-h2">Jelajahi kawasan properti premium Bali.</h2></div>
          <div className="k-arealist">
            {ORDER.map((s) => (
              <a key={s} href={`/demo/area/${s}`} className="k-arealink" aria-current={s === slug ? "page" : undefined}>
                {AREAS[s].name} <Ic d="m9 6 6 6-6 6" s={16} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="k-wrap k-sec">
        <div className="k-cta">
          <span className="k-kick" style={{ color: "var(--k-gold)" }}>hubungi kirana</span>
          <h2 className="k-h2" style={{ color: "#fff" }}>Tertarik dengan vila premium di {a.name}?</h2>
          <p className="k-cta-p">Ceritakan kebutuhan Anda — beli, sewa, atau investasi. Saya bantu kurasi pilihan terbaik di {a.name} dan sekitarnya, dengan pendampingan legal hingga tuntas.</p>
          <div className="k-row k-center-row">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="k-btn k-btn-gold k-lg"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" /> WhatsApp Kirana</a>
            <a href="/demo#kontak" className="k-btn k-btn-glass k-lg">Cara lain menghubungi</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="k-foot">
        <div className="k-wrap">
          <div className="k-foot-in">
            <a href="/demo" className="k-brand"><span className="k-mark">KS</span><span className="k-word">Kirana</span></a>
            <nav className="k-foot-links">
              <a href="/demo#listing">Listing</a><a href="/demo#wilayah">Kawasan</a><a href="/demo#tentang">Tentang</a><a href="/demo#faq">FAQ</a>
            </nav>
          </div>
          <div className="k-madewith">Dibuat dengan <a href="/onboarding" style={{ color: "var(--k-gold)", fontWeight: 700, textDecoration: "none" }}>cakra</a> — <a href="/onboarding" style={{ color: "rgba(255,255,255,.85)" }}>buat situs Anda sendiri →</a></div>
        </div>
      </footer>

      <a href={wa} target="_blank" rel="noopener noreferrer" className="k-fab" aria-label={`Chat WhatsApp soal properti ${a.name}`}>
        <Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" s={26} />
      </a>

      <style>{KIR_CSS}</style>
    </div>
  );
}
