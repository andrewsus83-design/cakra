import type { Lang } from "./SiteView";

// Server-rendered per-agent site — the SAME polished template as /demo, but with the agent's real
// content baked into static HTML at build time (no client JS), so AI crawlers (GPTBot, PerplexityBot,
// ClaudeBot, CCBot) and Google see the full text + JSON-LD without executing JavaScript.
//
// This mirrors, on the server, what app/demo/SiteSkin.tsx does in the browser: it fills every
// section from public_agent_site(key) + public_listings(aid), hides the demo-only scaffolding
// sections, and emits RealEstateAgent + FAQPage + ItemList structured data. Rendered fully in ONE
// language (id or en) so each page is monolingual and crawlable; the two are hreflang-linked.

type Listing = { title?: string; status?: string; price_label?: string; location?: string; beds?: number | string; baths?: number | string; size_m2?: number | string; images?: string[] };

function Ic({ d, s = 18 }: { d: string; s?: number }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

// Icon pickers ported verbatim from SiteSkin so each service / summary card gets the same glyph.
function iconForService(title: string): string {
  const t = (title || "").toLowerCase();
  if (/asing|foreign|pt pma|hak pakai|expat|wna/.test(t)) return "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10Z";
  if (/jual|penjualan|primary|secondary/.test(t)) return "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.4 2.4 0 0 0 3.42 0l6.58-6.58a2.4 2.4 0 0 0 0-3.42ZM7.5 7.5h.01";
  if (/sewa|rent|kontrak/.test(t)) return "M2.6 17.4A2 2 0 0 0 2 18.8V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0 1-1h.2a2 2 0 0 0 1.4-.6l.8-.8a6.5 6.5 0 1 0-4-4ZM16.5 7.5h.01";
  if (/investasi|roi|yield|konsultasi|invest/.test(t)) return "M16 7h6v6M22 7l-8.5 8.5-5-5L2 17";
  if (/legal|kpa|sertifikat|hukum|pendamping|notaris|mortgage/.test(t)) return "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1ZM9 12l2 2 4-4";
  return "M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h.01M9 12h.01M9 15h.01";
}
function iconForRingkasan(text: string): string {
  const t = (text || "").toLowerCase();
  if (/harga|price|\brp\b|miliar|billion|indikat|mulai|start/.test(t)) return "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.4 2.4 0 0 0 3.42 0l6.58-6.58a2.4 2.4 0 0 0 0-3.42ZM7.5 7.5h.01";
  if (/mrt|lrt|menit|minute|jarak|akses|dekat|near|transport|kaki|walk|stasiun|station/.test(t)) return "M8 3h8a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM8 17l-2 4M16 17l2 4M6 9h12M9 21h6";
  if (/berlokasi|lokasi|jl\.|jalan|kawasan|located|jantung|cbd|superblok|ciputra world/.test(t)) return "M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z";
  if (/menara|tower|lantai|floor|unit|tipe|studio|1br|2br|kamar/.test(t)) return "M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h.01M9 12h.01";
  if (/agen|independ|marketing|afilias|resmi|group|melayani|serving|buyer|pembeli|legal/.test(t)) return "M12 2 4 5v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V5l-8-3ZM9 12l2 2 4-4";
  return "M20 6 9 17l-5-5";
}

const parseRp = (label?: string): number | null => {
  if (!label) return null;
  const s = String(label).toLowerCase();
  const m = s.match(/[\d][\d.,]*/);
  if (!m) return null;
  const n = parseFloat(m[0].replace(/\./g, "").replace(",", "."));
  if (!isFinite(n)) return null;
  if (/miliar|milyar|\bm\b/.test(s)) return Math.round(n * 1e9);
  if (/triliun|\bt\b/.test(s)) return Math.round(n * 1e12);
  if (/juta|\bjt\b/.test(s)) return Math.round(n * 1e6);
  return Math.round(n);
};

// Lang-aware structural labels. Content (hero, about, services, faq…) comes from the agent's data;
// these are the fixed section chrome + generic (property-type-neutral) scaffolding copy.
const T = {
  id: {
    nav: [["Beranda", "#top"], ["Tentang", "#tentang"], ["Listing", "#listing"], ["FAQ", "#faq"]] as [string, string][],
    contact: "Hubungi", viewProps: "Lihat properti", ringkas: "ringkas", layanan: "layanan",
    servicesH: (a: string) => `Satu ahli untuk jual, sewa, dan investasi properti${a ? ` di ${a}` : ""}.`,
    servicesSub: "Membeli, menyewa, menyewakan aset, atau berinvestasi — semuanya ditangani dengan standar dan ketelitian yang sama.",
    listingKick: "properti pilihan", listingH: (a: string) => `Unit pilihan${a ? ` di ${a}` : ""}.`,
    fullList: "Minta daftar lengkap", askThis: "Hubungi soal properti ini",
    sale: "Dijual", rent: "Disewa", br: "KT", studio: "Studio", bath: "KM",
    wilayah: "wilayah", wilayahH: (a: string) => `Menguasai kawasan properti terbaik${a ? ` di ${a}` : ""}.`,
    lokasi: "Lokasi", profil: "profil agen", about: "Tentang", scheduleConsult: "Jadwalkan konsultasi",
    foreignKick: "untuk pembeli internasional", foreignH: (c: string) => `Membeli properti${c ? ` di ${c}` : " di Indonesia"} sebagai orang asing — dengan struktur yang benar.`,
    legal: [
      ["M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6", "Hak Pakai", "Hak legal atas nama pribadi asing yang berdomisili/berizin untuk memakai properti dalam jangka waktu tertentu dan dapat diperpanjang."],
      ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 7v5l3 3", "Leasehold", "Sewa jangka panjang (umumnya 25–30 tahun, sering dapat diperpanjang). Jalur paling sederhana untuk penggunaan pribadi."],
      ["M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M15 21V9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h.01M8 12h.01", "PT PMA", "Badan usaha penanaman modal asing yang dapat memegang HGB — cocok bila properti ditujukan untuk disewakan atau dijalankan sebagai bisnis."],
    ] as [string, string, string][],
    legalLead: "Tidak ada satu struktur ‘terbaik’ untuk semua orang — pilihan bergantung pada tujuan, jangka waktu, dan rencana keluar Anda.",
    legalAssureH: "Yang kami pastikan sebelum satu rupiah pun berpindah",
    legalChecks: ["Verifikasi keaslian & status sertifikat", "Pengecekan zonasi dan izin bangunan (PBG/IMB)", "Telaah sengketa atau beban atas properti", "Penandatanganan di hadapan notaris/PPAT tepercaya"],
    legalNote: "Kami tidak menggantikan nasihat hukum atau pajak — kami memastikan Anda didampingi profesional yang tepat.",
    legalChip: "Prefer English? That's completely fine.",
    faq: "faq", faqH: "Pertanyaan yang sering diajukan.", kontakKick: "hubungi kami",
    connectKick: "terhubung", connectH: "Ikuti & hubungkan.", connectSub: "Update listing terbaru & wawasan pasar.",
    gbiz: "Google Bisnis", madeWith: "Dibuat dengan", buildOwn: "buat situs Anda sendiri →",
    langLink: "English", locale: "id_ID",
  },
  en: {
    nav: [["Home", "#top"], ["About", "#tentang"], ["Listings", "#listing"], ["FAQ", "#faq"]] as [string, string][],
    contact: "Contact", viewProps: "View properties", ringkas: "summary", layanan: "services",
    servicesH: (a: string) => `One expert for sales, rentals, and investment${a ? ` in ${a}` : ""}.`,
    servicesSub: "Buying, renting, leasing an asset, or investing — all handled with the same standard and rigor.",
    listingKick: "featured properties", listingH: (a: string) => `Featured units${a ? ` in ${a}` : ""}.`,
    fullList: "Request the full list", askThis: "Ask about this property",
    sale: "For sale", rent: "For rent", br: "BR", studio: "Studio", bath: "bath",
    wilayah: "area", wilayahH: (a: string) => `Mastering the best property areas${a ? ` in ${a}` : ""}.`,
    lokasi: "Location", profil: "about the agent", about: "About", scheduleConsult: "Schedule a consultation",
    foreignKick: "for international buyers", foreignH: (c: string) => `Buying property${c ? ` in ${c}` : " in Indonesia"} as a foreigner — with the right structure.`,
    legal: [
      ["M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6", "Right to Use (Hak Pakai)", "A legal right, held personally by a foreigner with residency/permits, to use the property for a set, renewable period."],
      ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 7v5l3 3", "Leasehold", "A long-term lease (typically 25–30 years, often renewable). The simplest route for personal use."],
      ["M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M15 21V9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h.01M8 12h.01", "PT PMA", "A foreign-investment company that can hold HGB title — suited to property meant to be rented out or run as a business."],
    ] as [string, string, string][],
    legalLead: "There is no single ‘best’ structure for everyone — the right choice depends on your goals, time horizon, and exit plan.",
    legalAssureH: "What we verify before a single rupiah changes hands",
    legalChecks: ["Verify certificate authenticity & status", "Check zoning and building permits (PBG/IMB)", "Review any disputes or encumbrances", "Signing before a trusted notary/PPAT"],
    legalNote: "We don't replace legal or tax advice — we make sure you're guided by the right professionals.",
    legalChip: "Prefer Indonesian? That's completely fine.",
    faq: "faq", faqH: "Frequently asked questions.", kontakKick: "get in touch",
    connectKick: "connect", connectH: "Follow & connect.", connectSub: "Latest listings & market insights.",
    gbiz: "Google Business", madeWith: "Built with", buildOwn: "build your own site →",
    langLink: "Bahasa Indonesia", locale: "en_US",
  },
} as const;

const SOC_ICON: Record<string, string> = {
  instagram: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z",
  tiktok: "M14 3c.3 2.2 1.7 3.9 4 4.2v2.5c-1.5 0-2.9-.5-4-1.3v5.9a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 1 0 1.8 2.5V3H14Z",
  youtube: "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z",
  facebook: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z",
};

export default function AgentSiteServer({ d, listings, sub, lang }: { d: any; listings: Listing[]; sub: string; lang: Lang }) {
  const t = T[lang];
  const en = lang === "en";
  const adv = d.advertorial || {};
  const A = adv[lang] || adv.id || {};
  const Aid = adv.id || {};
  const GEO = adv.geo || {};
  const LEAD = adv.lead || {};
  const loc = d.location || null;

  const brand = d.brand || d.name || "";
  const name = d.name || brand;
  const first = String(d.name || d.brand || "").trim().split(/\s+/)[0] || (en ? "us" : "kami");
  const city = d.city || "";
  const areasArr: string[] = Array.isArray(d.areas) ? d.areas.filter(Boolean) : [];
  const primaryArea = areasArr[0] || city || "";
  const specs = Array.isArray(d.specializations) && d.specializations.length ? d.specializations.join(" & ") : "";
  const canonical = en ? `https://${sub}.cakra.xyz/en` : `https://${sub}.cakra.xyz/`;

  // Socials → real URLs (only the ones the agent actually set).
  const s = d.socials || {};
  const wa = String(s.wa || "").replace(/[^0-9]/g, "");
  const socialLinks = [
    s.ig && { label: "Instagram", key: "instagram", href: `https://instagram.com/${String(s.ig).replace(/^@/, "")}` },
    s.tt && { label: "TikTok", key: "tiktok", href: `https://tiktok.com/@${String(s.tt).replace(/^@/, "")}` },
    s.yt && { label: "YouTube", key: "youtube", href: `https://youtube.com/@${String(s.yt).replace(/\s+/g, "")}` },
    s.fb && { label: "Facebook", key: "facebook", href: `https://facebook.com/${String(s.fb).replace(/\s+/g, "")}` },
  ].filter(Boolean) as { label: string; key: string; href: string }[];
  const socialUrls = socialLinks.map((x) => x.href);

  // Some base fields (whatsapp_hook, target, listing titles/prices) exist only in Indonesian in the
  // DB. On the EN page, prefer the English advertorial and normalize the small, fixed listing
  // vocabulary so the page reads as fully English rather than mixed.
  const enNorm = (str: string): string => {
    if (!en || !str) return str;
    return str
      .replace(/\bKamar\b/g, "Bedroom")
      .replace(/\bMulai\b/g, "From")
      .replace(/\bindikatif\b/gi, "indicative")
      .replace(/\bDisewa\b/g, "For rent")
      .replace(/\bDijual\b/g, "For sale")
      .replace(/\bSpesialis\b/g, "Specialist")
      .replace(/\bApartemen\b/g, "Apartment")
      .replace(/\bAgen pemasaran independen\b/gi, "Independent marketing agent")
      .replace(/\bmnt\b/gi, "min")
      .replace(/\bmenit\b/gi, "min")
      .replace(/\bthn\b/gi, "yr")
      .replace(/\btahun\b/gi, "yr");
  };
  const waMsg = en
    ? `Hi, I'm interested in ${brand || "your property"} — could you share current pricing and available units?`
    : (LEAD.whatsapp_hook || A.hero_sub || d.tagline || "");
  const ctaP = en ? (A.hero_sub || d.tagline || "") : (LEAD.whatsapp_hook || A.hero_sub || d.tagline || "");
  const waHref = wa ? `https://wa.me/${wa}${waMsg ? `?text=${encodeURIComponent(waMsg)}` : ""}` : "#kontak";

  // ── Hero ──
  const specsH = specs || (en ? "Curated property" : "Properti pilihan");
  const heroKicker = A.hero_kicker || (city ? (en ? `${city} property specialist` : `spesialis properti ${city}`) : (en ? "property specialist" : "spesialis properti"));
  const heroH1 = A.hero_headline || (city ? (en ? `${specsH} in ${city}, from hands that truly understand.` : `${specsH} di ${city}, dari tangan yang paham.`) : `${specsH}.`);
  const heroLead = A.hero_sub || d.tagline || d.bio || `${name}${areasArr.length ? (en ? " · serving " : " · melayani ") + areasArr.join(" · ") : city ? " · " + city : ""}.`;
  const heroNote = [en ? (d.price_band || "") : (d.target || d.price_band), areasArr.join(" · ")].filter(Boolean).join(" · ");

  // ── Stats (real) ──
  const stats: any[] = Array.isArray(d.stats) ? d.stats.slice(0, 4) : [];

  // ── Ringkasan (GEO bullets), services, differentiators, faq (all real, lang-specific) ──
  const ringkasan: string[] = Array.isArray(A.ringkasan) ? A.ringkasan : [];
  const services: any[] = Array.isArray(A.services) ? A.services : [];
  const diffs: string[] = (Array.isArray(A.differentiators) && A.differentiators.length ? A.differentiators : d.differentiators) || [];
  const faqs: any[] = Array.isArray(A.faq) ? A.faq : [];
  const foreignOn = !!d.foreign_buyer && /^\s*(ya|yes)\b/i.test(String(d.foreign_buyer));
  const foreignBody = A.foreign_buyer || "";

  // ── Area chips = real areas + nearby landmarks ──
  const landmarks: string[] = loc && Array.isArray(loc.landmarks) ? loc.landmarks.filter(Boolean) : [];
  const areaChips: string[] = Array.from(new Set([...areasArr, ...landmarks].map((a) => String(a).trim()).filter(Boolean)));
  const areaIntro = A.area_intro || "";

  // ── Listings → cards (real; each a pre-filled WhatsApp link) ──
  const statusLabel: Record<string, string> = { dijual: t.sale, disewa: t.rent };
  const cards = (Array.isArray(listings) ? listings : []).map((r) => {
    const beds = Number(r.beds) || 0;
    const size = Number(r.size_m2) || 0;
    const baths = Number(r.baths) || 0;
    const bedLabel = beds ? `${beds} ${t.br}` : t.studio;
    const title = enNorm(String(r.title || ""));
    const price = enNorm(String(r.price_label || ""));
    const line = `${title} — ${price} · ${r.location || ""} · ${bedLabel}, ${baths} ${t.bath}, ${size} m²`;
    const greet = en ? `Hi ${first}` : `Halo ${first}`;
    const msg = en ? `${greet}, I'm interested in ${line}. Could you share more details & a viewing time?` : `${greet}, saya tertarik dengan ${line}. Boleh info lebih lanjut & jadwal viewing?`;
    return {
      title, price, location: String(r.location || ""),
      tag: statusLabel[String(r.status || "")] || t.sale, isRent: String(r.status) === "disewa",
      bedLabel, baths, size, img: (Array.isArray(r.images) && r.images[0]) || "/hero.webp",
      href: wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : "#kontak",
    };
  });

  // ── Hero + profile imagery from real listing photos ──
  const allImgs: string[] = [];
  for (const l of listings || []) if (Array.isArray(l.images)) for (const im of l.images) if (im) allImgs.push(String(im));
  const heroImg = allImgs[0] || "/hero-top.webp";
  const profileImg = allImgs.find((x) => x !== heroImg) || heroImg;

  // ── JSON-LD (RealEstateAgent + FAQPage + ItemList) — baked into static HTML ──
  const agentNode: any = { "@type": "RealEstateAgent", "@id": canonical + "#agent", name: brand || undefined, description: A.about || (en ? GEO.entity_en : GEO.entity_id) || d.tagline || undefined, url: canonical };
  if (wa) agentNode.telephone = "+" + wa;
  const areaServed = [...areasArr, ...landmarks].filter(Boolean);
  if (areaServed.length) agentNode.areaServed = areaServed.map((a) => ({ "@type": "Place", name: String(a) }));
  if (loc && (loc.address || loc.city || loc.region || loc.postal)) agentNode.address = { "@type": "PostalAddress", streetAddress: loc.address || undefined, addressLocality: loc.city || undefined, addressRegion: loc.region || undefined, postalCode: loc.postal || undefined, addressCountry: loc.country || "ID" };
  if (loc && loc.lat != null && loc.lng != null) agentNode.geo = { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng };
  if (socialUrls.length) agentNode.sameAs = socialUrls;
  if (d.price_band) agentNode.priceRange = d.price_band;
  const graph: any[] = [agentNode];
  const faqForLd = faqs.length ? faqs : (Array.isArray(Aid.faq) ? Aid.faq : []);
  if (faqForLd.length) graph.push({ "@type": "FAQPage", "@id": canonical + "#faq", mainEntity: faqForLd.map((f: any) => ({ "@type": "Question", name: String(f.q || ""), acceptedAnswer: { "@type": "Answer", text: String(f.a || "") } })) });
  if (cards.length) graph.push({ "@type": "ItemList", "@id": canonical + "#listings", itemListElement: (listings || []).map((l, i) => { const price = parseRp(l.price_label); const item: any = { "@type": "Residence", name: enNorm(String(l.title || "")) || undefined, image: (Array.isArray(l.images) && l.images[0]) || undefined, description: l.location || undefined }; if (price) item.offers = { "@type": "Offer", price, priceCurrency: "IDR", availability: "https://schema.org/InStock" }; return { "@type": "ListItem", position: i + 1, item }; }) });
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

  const mapQuery = loc ? (loc.map_query || loc.address || [loc.area, loc.city, loc.region].filter(Boolean).join(", ")) : "";

  // Density is the ONLY layout choice the agent picks — just two: "normal" (comfortable default) or
  // "spacious" (airier). Legacy "tight" from older configs collapses to normal.
  const density = String(d.density || d.den || "").toLowerCase() === "spacious" ? "spacious" : "normal";

  return (
    <div className={`kir${density === "spacious" ? " kir-spacious" : ""}`} id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* NAV */}
      <header className="k-nav">
        <div className="k-wrap k-nav-in">
          <a href="#top" className="k-brand"><span className="k-word">{brand}</span></a>
          <div className="k-nav-right">
            <nav className="k-links">{t.nav.map(([l, h]) => <a key={l} href={h}>{l}</a>)}</nav>
            <a href="#kontak" className="k-btn k-btn-primary">{t.contact}</a>
            <a className="k-lang" href={en ? `https://${sub}.cakra.xyz/` : `https://${sub}.cakra.xyz/en`} style={{ padding: ".38rem .66rem", fontSize: ".78rem", fontWeight: 700, textDecoration: "none", color: "var(--k-ink-2)" }}>{t.langLink}</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="k-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImg} alt={brand || heroH1} className="k-hero-img" />
        <div className="k-hero-scrim" />
        <div className="k-wrap k-hero-in">
          <span className="k-kick k-kick-light">{heroKicker}</span>
          <h1 className="k-h1">{heroH1}</h1>
          <p className="k-lead">{heroLead}</p>
          <div className="k-row">
            <a href="#listing" className="k-btn k-btn-gold k-lg">{t.viewProps}</a>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="k-btn k-btn-glass k-lg">{t.contact} {first}</a>
          </div>
          {heroNote && <p className="k-hero-note">{heroNote}</p>}
        </div>
      </section>

      {/* STATS (real) */}
      {stats.length > 0 && (
        <section className="k-wrap k-stats">
          {stats.map((st, i) => (
            <div key={i} className="k-stat"><div className="k-stat-n">{enNorm(String(st.value || ""))}</div><div className="k-stat-l">{String((en && st.label_en) ? st.label_en : (st.label || ""))}</div></div>
          ))}
        </section>
      )}

      {/* RINGKASAN — AI-quotable at-a-glance grid */}
      {ringkasan.length > 0 && (
        <section className="k-wrap k-sec" style={{ paddingBottom: 0 }}>
          <div className="k-sum">
            <div className="k-sum-head">
              <span className="k-kick">{t.ringkas}</span>
              <h2 className="k-sum-h">{en ? `What you should know about ${brand}` : `Yang perlu Anda tahu tentang ${brand}`}</h2>
            </div>
            <div className="k-sum-grid">
              {ringkasan.map((text, i) => (
                <div key={i} className="k-sum-item">
                  <span className="k-sum-ic"><Ic d={iconForRingkasan(text)} s={20} /></span>
                  <div><div className="k-sum-text">{text}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LAYANAN (real services) */}
      {services.length > 0 && (
        <section className="k-wrap k-sec">
          <div className="k-center">
            <span className="k-kick">{t.layanan}</span>
            <h2 className="k-h2">{t.servicesH(primaryArea)}</h2>
            <p className="k-sub">{t.servicesSub}</p>
          </div>
          <div className="k-serv-grid">
            {services.map((sv, i) => (
              <div key={i} className="k-serv">
                <span className="k-serv-ic"><Ic d={iconForService(String(sv.title || ""))} s={22} /></span>
                <h3 className="k-serv-t">{String(sv.title || "")}</h3>
                <p className="k-muted">{String(sv.desc || "")}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LISTING (real units) */}
      {cards.length > 0 && (
        <section id="listing" className="k-band">
          <div className="k-wrap k-sec">
            <div className="k-head k-head-center">
              <div><span className="k-kick">{t.listingKick}</span><h2 className="k-h2">{t.listingH(primaryArea)}</h2></div>
            </div>
            <div className="k-grid k-grid-3">
              {cards.map((p, i) => (
                <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" className="k-card k-card-btn">
                  <div className="k-card-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt={p.title} />
                    <span className={`k-badge ${p.isRent ? "k-badge-gold" : ""}`}>{p.tag}</span>
                  </div>
                  <div className="k-card-body">
                    <div className="k-price">{p.price}</div>
                    <h3 className="k-card-t">{p.title}</h3>
                    <div className="k-muted k-sm">{p.location}</div>
                    <div className="k-meta">{p.bedLabel} · {p.baths} {t.bath} · {p.size} m²</div>
                    <span className="k-card-cta"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" s={14} /> {t.askThis}</span>
                  </div>
                </a>
              ))}
            </div>
            <div className="k-listing-cta"><a href="#kontak" className="k-btn k-btn-ghost">{t.fullList}</a></div>
          </div>
        </section>
      )}

      {/* WILAYAH (real areas + location) */}
      {(areaChips.length > 0 || areaIntro || mapQuery) && (
        <section id="wilayah" className="k-wrap k-sec">
          <div className="k-center">
            <span className="k-kick">{t.wilayah}</span>
            <h2 className="k-h2">{t.wilayahH(primaryArea)}</h2>
            {areaIntro && <p className="k-sub">{areaIntro}</p>}
          </div>
          {areaChips.length > 0 && (
            <div className="k-areas">
              {areaChips.map((a) => <span key={a} className="k-area">{a}</span>)}
            </div>
          )}
          {loc && (loc.address || mapQuery || loc.label) && (
            <div className="k-loc">
              <h3 className="k-loc-h">{t.lokasi}</h3>
              <p className="k-loc-addr">{loc.address || [loc.label, loc.area, loc.city].filter(Boolean).join(", ")}</p>
              {mapQuery && (
                <div className="k-loc-map">
                  <iframe loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen title={`Peta lokasi ${brand}`.trim()} src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} />
                </div>
              )}
              {landmarks.length > 0 && (
                <div className="k-loc-chips">{landmarks.map((lm) => <span key={lm} className="k-loc-chip">{lm}</span>)}</div>
              )}
            </div>
          )}
        </section>
      )}

      {/* TENTANG (real profile) */}
      {(A.about || d.bio) && (
        <section id="tentang" className="k-band">
          <div className="k-wrap k-split">
            <div className="k-card k-profile-card">
              <div className="k-card-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profileImg} alt={brand ? `${brand} — ${city || "properti"}` : "Foto properti"} />
              </div>
              <div className="k-card-body">
                <div className="k-profile-name">{enNorm(name)}</div>
                <div className="k-profile-role">{[enNorm(specs), city].filter(Boolean).join(" · ") || enNorm(String(d.positioning || ""))}</div>
              </div>
            </div>
            <div>
              <span className="k-kick">{t.profil}</span>
              <h2 className="k-h2">{t.about} {brand}</h2>
              <p className="k-muted k-p">{A.about || d.bio}</p>
              {diffs.length > 0 && (
                <ul className="k-list">
                  {diffs.slice(0, 8).map((x) => (
                    <li key={x}><span className="k-check"><Ic d="M20 6 9 17l-5-5" s={15} /></span>{x}</li>
                  ))}
                </ul>
              )}
              <a href="#kontak" className="k-btn k-btn-primary">{t.scheduleConsult}</a>
            </div>
          </div>
        </section>
      )}

      {/* PEMBELI ASING (only when the agent serves foreign buyers) */}
      {foreignOn && (
        <section id="pembeli-asing" className="k-wrap k-sec">
          <div className="k-center">
            <span className="k-kick">{t.foreignKick}</span>
            <h2 className="k-h2">{t.foreignH(city)}</h2>
            {foreignBody && <p className="k-sub">{foreignBody}</p>}
          </div>
          <div className="k-grid k-grid-3">
            {t.legal.map(([dd, tt, desc]) => (
              <div key={tt} className="k-legal-item">
                <span className="k-legal-ic"><Ic d={dd} s={24} /></span>
                <h3 className="k-serv-t">{tt}</h3>
                <p className="k-muted">{desc}</p>
              </div>
            ))}
          </div>
          <p className="k-legal-lead">{t.legalLead}</p>
          <div className="k-legal-assure">
            <h3 className="k-legal-assure-h">{t.legalAssureH}</h3>
            <div className="k-legal-checks">
              {t.legalChecks.map((c) => (
                <div key={c} className="k-legal-check"><span className="k-check"><Ic d="M20 6 9 17l-5-5" s={14} /></span><span>{c}</span></div>
              ))}
            </div>
            <div className="k-legal-foot">
              <p className="k-legal-note2">{t.legalNote}</p>
              <span className="k-legal-chip"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" s={14} /> {t.legalChip}</span>
            </div>
          </div>
        </section>
      )}

      {/* FAQ (real) */}
      {faqs.length > 0 && (
        <section id="faq" className="k-band">
          <div className="k-wrap k-sec">
            <div className="k-center"><span className="k-kick">{t.faq}</span><h2 className="k-h2">{t.faqH}</h2></div>
            <div className="k-faq-grid">
              {faqs.map((f, i) => (
                <details key={i} className="k-faq">
                  <summary>{String(f.q || "")}<span className="k-chev"><Ic d="m6 9 6 6 6-6" /></span></summary>
                  <p>{String(f.a || "")}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KONTAK */}
      <section id="kontak" className="k-wrap k-sec">
        <div className="k-cta">
          <span className="k-kick" style={{ color: "var(--k-gold)" }}>{t.kontakKick}</span>
          <h2 className="k-h2" style={{ color: "#fff" }}>{brand ? (en ? `Ready to move forward with ${brand}?` : `Siap melangkah bersama ${brand}?`) : (en ? "Ready to move forward?" : "Siap melangkah?")}</h2>
          {ctaP && <p className="k-cta-p">{ctaP}</p>}
          <div className="k-row k-center-row">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="k-btn k-btn-gold k-lg"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" /> WhatsApp {first}</a>
          </div>
          {loc && (loc.label || loc.address) && <p className="k-cta-note">{loc.label || loc.address}</p>}
        </div>
      </section>

      {/* TERHUBUNG (only when the agent has socials) */}
      {socialLinks.length > 0 && (
        <section className="k-wrap k-sec" style={{ paddingTop: 0 }}>
          <div className="k-connect">
            <div style={{ minWidth: 220 }}>
              <span className="k-kick">{t.connectKick}</span>
              <h2 className="k-h2">{t.connectH}</h2>
              <p className="k-sub" style={{ marginTop: 8 }}>{t.connectSub}</p>
            </div>
            <div className="k-social-row">
              {socialLinks.map((x) => (
                <a key={x.label} href={x.href} target="_blank" rel="noopener noreferrer" aria-label={x.label} className="k-social">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d={SOC_ICON[x.key]} /></svg>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="k-foot">
        <div className="k-wrap k-foot-in">
          <a href="#top" className="k-brand"><span className="k-word">{brand}</span></a>
          <div className="k-muted k-sm">© 2026 {enNorm(name)}{specs ? ` · ${enNorm(specs)}` : ""}{city ? ` · ${city}` : ""}</div>
          <div className="k-foot-links">{t.nav.map(([l, h]) => <a key={l} href={h}>{l}</a>)}</div>
        </div>
        <div className="k-wrap k-madewith">{t.madeWith} <a href="https://cakra.xyz/onboarding" style={{ color: "var(--k-gold)", fontWeight: 700, textDecoration: "none" }}>cakra</a> — <a href="https://cakra.xyz/onboarding" style={{ color: "rgba(255,255,255,.85)", textDecoration: "underline" }}>{t.buildOwn}</a></div>
      </footer>

      {/* Sticky WhatsApp lead capture */}
      <a href={waHref} target="_blank" rel="noopener noreferrer" className="k-fab" aria-label="WhatsApp">
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
        .k-sub{ color:var(--k-muted); font-size:1.08rem; line-height:1.62; margin-top:16px; }
        .k-p{ font-size:1.06rem; line-height:1.72; margin:18px 0 28px; max-width:54ch; }
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
        .k-word{ font-family:var(--k-font-display), serif; font-weight:600; font-size:1.6rem; letter-spacing:.01em; }
        .k-nav-right{ display:flex; align-items:center; gap:18px; }
        .k-lang{ display:inline-flex; border:1px solid var(--k-line-2); border-radius:999px; align-items:center; }
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
        .k-legal-item{ background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); padding:32px 30px; }
        .k-legal-item .k-muted{ line-height:1.62; }
        .k-legal-ic{ display:inline-grid; place-items:center; width:46px; height:46px; border-radius:12px; background:color-mix(in oklab, var(--k-gold) 12%, var(--k-surface)); color:var(--k-gold-2); border:1px solid color-mix(in oklab, var(--k-gold) 22%, transparent); margin-bottom:18px; }
        .k-legal-lead{ text-align:center; max-width:62ch; margin:38px auto 22px; font-size:1.12rem; color:var(--k-ink-2); line-height:1.6; }
        .k-legal-assure{ background:linear-gradient(125deg, var(--k-emerald-2), var(--k-emerald)); color:#fff; border-radius:var(--k-r); padding:clamp(28px,4vw,44px); box-shadow:0 30px 60px -38px var(--k-emerald); }
        .k-legal-assure-h{ color:#fff; font-size:clamp(1.6rem,3vw,2.2rem); text-align:center; margin-bottom:48px; line-height:1.25; }
        .k-legal-checks{ display:grid; grid-template-columns:repeat(2,1fr); gap:22px 36px; max-width:840px; margin:0 auto; }
        .k-legal-check{ display:flex; gap:12px; align-items:flex-start; }
        .k-legal-check .k-check{ background:rgba(255,255,255,.16); color:#fff; flex:none; margin-top:1px; }
        .k-legal-check > span:last-child{ color:rgba(255,255,255,.92); line-height:1.6; font-size:.98rem; }
        .k-legal-foot{ display:flex; align-items:center; justify-content:center; gap:16px; flex-wrap:wrap; margin-top:28px; padding-top:24px; border-top:1px solid rgba(255,255,255,.18); }
        .k-legal-note2{ color:rgba(255,255,255,.74); font-size:.9rem; max-width:52ch; margin:0; }
        .k-legal-chip{ display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.15); color:#fff; padding:.55rem 1.05rem; border-radius:999px; font-size:.86rem; font-weight:600; white-space:nowrap; }
        .k-sum{ max-width:1040px; margin:0 auto; }
        .k-sum-head{ text-align:center; max-width:60ch; margin:0 auto 34px; }
        .k-sum-h{ font-size:clamp(1.5rem,2.9vw,2.1rem); line-height:1.18; }
        .k-sum-grid{ display:flex; flex-wrap:wrap; justify-content:center; gap:20px; max-width:1120px; margin:0 auto; }
        .k-sum-item{ flex:1 1 300px; max-width:360px; display:flex; flex-direction:row; align-items:flex-start; gap:18px; text-align:left; padding:28px 26px; background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); box-shadow:0 12px 34px -24px rgba(15,32,38,.24); transition:transform .18s ease, box-shadow .18s ease; }
        .k-sum-item:hover{ transform:translateY(-3px); box-shadow:0 20px 46px -26px rgba(15,32,38,.32); }
        .k-sum-ic{ flex:none; width:48px; height:48px; border-radius:14px; display:grid; place-items:center; margin-top:2px; background:color-mix(in oklab, var(--k-emerald) 12%, var(--k-surface)); color:var(--k-emerald); border:1px solid color-mix(in oklab, var(--k-emerald) 20%, transparent); }
        .k-sum-text{ font-size:.97rem; color:var(--k-ink-2); line-height:1.62; }
        @media(max-width:860px){ .k-sum-grid{ grid-template-columns:1fr 1fr; } }
        @media(max-width:560px){ .k-sum-grid{ grid-template-columns:1fr; } .k-legal-checks{ grid-template-columns:1fr; } }
        .k-serv-grid{ display:flex; flex-wrap:wrap; justify-content:center; gap:20px; max-width:1120px; margin-left:auto; margin-right:auto; }
        .k-serv{ flex:1 1 300px; max-width:360px; padding:32px 30px; background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); box-shadow:0 12px 34px -24px rgba(15,32,38,.24); transition:transform .18s ease, box-shadow .18s ease; }
        .k-serv .k-muted{ line-height:1.62; }
        .k-serv:hover{ transform:translateY(-3px); box-shadow:0 20px 46px -26px rgba(15,32,38,.32); }
        .k-serv-ic{ display:inline-grid; place-items:center; width:50px; height:50px; border-radius:14px; background:color-mix(in oklab, var(--k-emerald) 12%, var(--k-surface)); color:var(--k-emerald); margin-bottom:20px; border:1px solid color-mix(in oklab, var(--k-emerald) 20%, transparent); }
        .k-serv-t{ font-size:1.24rem; line-height:1.32; margin-bottom:12px; letter-spacing:-.005em; }
        .k-card{ background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r); overflow:hidden; box-shadow:0 1px 2px rgba(15,32,38,.05); transition:transform .2s ease, box-shadow .2s ease; }
        .k-card:hover{ transform:translateY(-4px); box-shadow:0 14px 34px -12px rgba(15,32,38,.22); }
        .k-card-media{ position:relative; aspect-ratio:3/2; overflow:hidden; }
        .k-card-media img{ width:100%; height:100%; object-fit:cover; transition:transform .5s; }
        .k-card:hover .k-card-media img{ transform:scale(1.05); }
        .k-badge{ position:absolute; top:14px; left:14px; background:color-mix(in oklab, var(--k-emerald) 92%, transparent); backdrop-filter:blur(4px); color:#fff; font-size:.66rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:.34rem .7rem; border-radius:999px; box-shadow:0 4px 12px -4px rgba(15,32,38,.4); }
        .k-badge-gold{ background:var(--k-gold); }
        .k-card-body{ padding:22px 22px 26px; }
        .k-price{ font-family:var(--k-font-display), serif; font-weight:700; color:var(--k-emerald); font-size:1.3rem; }
        .k-card-t{ font-size:1.2rem; line-height:1.32; margin:9px 0 8px; }
        .k-card-body .k-sm{ line-height:1.5; }
        .k-meta{ color:var(--k-muted); font-size:.82rem; margin-top:14px; font-family:var(--font-mono, ui-monospace, monospace); letter-spacing:.01em; }
        .k-card-btn{ cursor:pointer; text-align:left; color:inherit; width:100%; display:block; }
        .k-card-cta{ display:inline-flex; align-items:center; gap:6px; margin-top:16px; color:var(--k-emerald); font-weight:700; font-size:.84rem; }
        .k-card:hover .k-card-cta{ color:var(--k-gold-2); }
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
        .k-profile-card{ align-self:start; }
        .k-profile-name{ font-family:var(--k-font-display), serif; font-weight:700; font-size:1.3rem; line-height:1.15; color:var(--k-ink); }
        .k-profile-role{ font-size:.86rem; color:var(--k-muted); margin-top:4px; }
        .k-list{ list-style:none; padding:0; margin:0 0 30px; display:grid; gap:16px; }
        .k-list li{ display:flex; gap:12px; align-items:flex-start; color:var(--k-ink-2); }
        .k-check{ flex:none; width:24px; height:24px; border-radius:50%; background:color-mix(in oklab, var(--k-emerald) 12%, var(--k-surface)); color:var(--k-emerald); display:grid; place-items:center; margin-top:2px; }
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
        .k-foot{ background:var(--k-emerald-2); color:#fff; padding:38px 0 26px; }
        .k-foot .k-word{ color:#fff; }
        .k-foot .k-muted{ color:rgba(255,255,255,.6); }
        .k-foot-in{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .k-foot-links{ display:flex; gap:18px; }
        .k-foot-links a{ color:rgba(255,255,255,.72); text-decoration:none; font-size:.9rem; }
        .k-foot-links a:hover{ color:#fff; }
        .k-madewith{ margin-top:22px; padding-top:20px; border-top:1px solid rgba(255,255,255,.14); color:rgba(255,255,255,.6); font-size:.84rem; }
        .k-madewith b{ color:var(--k-gold); }
        .k-fab{ position:fixed; bottom:22px; right:22px; z-index:60; width:60px; height:60px; border-radius:50%; background:#25D366; color:#fff; display:grid; place-items:center; box-shadow:0 12px 28px -8px rgba(0,0,0,.4); transition:transform .15s; }
        .k-fab:hover{ transform:scale(1.06); }
        /* ── Density: "spacious" — the airier of the two agent-selectable layouts (the other is "normal") ── */
        .kir-spacious{ line-height:1.72; }
        .kir-spacious .k-sec{ padding-top:clamp(80px,11.5vw,136px); padding-bottom:clamp(80px,11.5vw,136px); }
        .kir-spacious .k-split{ gap:clamp(42px,6vw,84px); padding-top:clamp(80px,11.5vw,136px); padding-bottom:clamp(80px,11.5vw,136px); }
        .kir-spacious .k-center{ margin-bottom:54px; }
        .kir-spacious .k-grid{ gap:28px; }
        .kir-spacious .k-serv-grid, .kir-spacious .k-sum-grid{ gap:26px; }
        .kir-spacious .k-serv{ padding:38px 34px; }
        .kir-spacious .k-serv-t{ margin-bottom:16px; }
        .kir-spacious .k-serv-ic, .kir-spacious .k-legal-ic{ margin-bottom:24px; }
        .kir-spacious .k-legal-item{ padding:38px 34px; }
        .kir-spacious .k-sum-item{ padding:34px 32px; gap:22px; }
        .kir-spacious .k-card-body{ padding:26px 26px 30px; }
        .kir-spacious .k-card-t{ margin:12px 0 10px; }
        .kir-spacious .k-meta{ margin-top:18px; }
        .kir-spacious .k-card-cta{ margin-top:20px; }
        .kir-spacious .k-list{ gap:20px; margin-bottom:34px; }
        .kir-spacious .k-p{ margin:22px 0 34px; }
        .kir-spacious .k-legal-checks{ gap:28px 42px; }
        .kir-spacious .k-faq summary{ padding:28px 2px; }
        .kir-spacious .k-faq p{ padding-bottom:30px; }

        @media (max-width: 900px){ .k-links, .k-foot-links{ display:none; } .k-stats{ grid-template-columns:1fr 1fr; } .k-stat:nth-child(2){ border-right:none; } .k-stat{ border-bottom:1px solid var(--k-line); } .k-split{ grid-template-columns:1fr; } .k-faq-grid{ grid-template-columns:1fr; } }
        @media (max-width: 640px){
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
          .k-stat{ padding:18px 12px; } .k-card-body{ padding:16px 16px 18px; }
          .k-legal-item{ padding:18px 16px; } .k-legal-assure{ padding:22px 16px; } .k-sum-item{ padding:18px 16px; }
          .k-h1{ font-size:1.95rem; line-height:1.14; } .k-h2{ font-size:1.5rem; line-height:1.2; }
          .k-lead{ font-size:1rem; margin:16px 0 24px; } .k-sub,.k-p{ font-size:1rem; } .k-center{ margin-bottom:28px; }
        }
      `}</style>
    </div>
  );
}
