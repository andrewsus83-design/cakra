"use client";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { CakraMark } from "@/components/CakraMark";
import { Decor } from "@/components/Decor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocationInput } from "./LocationInput";
import { StaffAdmin } from "./StaffAdmin";
import { AuthGate } from "./AuthGate";
import { WelcomeTour } from "./WelcomeTour";
import { AssetLibrary } from "@/components/AssetLibrary";
import { EditorStudio } from "@/components/EditorStudio";
import { VoiceLibrary } from "@/components/VoiceLibrary";
import { db, isAdmin, uploadAsset, invokeFn, type SupaUser } from "@/lib/supabase";
import { renderSlides } from "@/lib/slides";

type Sec = "home" | "builder" | "prospek" | "listing" | "editor" | "content" | "assets" | "profile";

const NAV: { id: Sec; label: string; icon: string }[] = [
  { id: "home", label: "Dashboard", icon: "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" },
  { id: "builder", label: "Web Builder", icon: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm2 3v11h6V8H5Zm8 0v4h6V8h-6Zm6 6h-6v5h6v-5Z" },
  { id: "listing", label: "Listing", icon: "M4 5h16v3H4zM4 10.5h16v3H4zM4 16h16v3H4z" },
  { id: "editor", label: "Editor", icon: "M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm6 3v6l5-3z" },
  { id: "content", label: "Konten", icon: "M6 2h9l5 5v14.2A.8.8 0 0 1 19.2 22H6a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 6 2Zm2 9h8v1.8H8zm0 4h8v1.8H8z" },
  { id: "assets", label: "Aset", icon: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z" },
];
const LEADS = [
  { name: "Budi Santoso", src: "WhatsApp", listing: "Vila Uluwatu Cliff", msg: "Halo, apakah vila Uluwatu masih tersedia? Saya tertarik untuk viewing akhir pekan ini.", age: "18 menit lalu", status: "Baru", wa: "6281234567890" },
  { name: "Sarah Wijaya", src: "Form situs", listing: "Vila Canggu Estate", msg: "Mohon info harga terbaik dan skema pembayaran untuk Vila Canggu Estate.", age: "2 jam lalu", status: "Baru", wa: "6281322221111" },
  { name: "David Lim", src: "Instagram", listing: "Vila Seminyak Retreat", msg: "Interested in a long-term rental. Is it available from next month?", age: "Kemarin", status: "Dihubungi", wa: "6581234567" },
  { name: "Maria Tan", src: "WhatsApp", listing: "Townhouse Sanur", msg: "Sudah lihat videonya, bagus sekali. Bisa jadwalkan viewing minggu depan?", age: "Kemarin", status: "Viewing", wa: "6281199990000" },
  { name: "Rangga P.", src: "Form situs", listing: "Vila Uluwatu Cliff", msg: "Apakah harga masih bisa nego? Saya serius dan siap DP.", age: "2 hari lalu", status: "Nego", wa: "6281277778888" },
];
const LEAD_STATUSES = ["Semua", "Baru", "Dihubungi", "Viewing", "Nego"] as const;
const LEAD_TONE: Record<string, string> = { Baru: "--c-heart", Dihubungi: "--c-eye", Viewing: "--c-throat", Nego: "--c-solar", Closing: "--c-sacral" };
// Phase-2 features — shown in the nav as "Soon", not yet functional
const COMING: { label: string; icon: string }[] = [
  { label: "Prospek", icon: "M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm0 10v5h16v-5h-4a3 3 0 0 1-6 0H4Z" },
  { label: "Inbox", icon: "M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm.4 2 7.6 4.6L19.6 8H4.4Z" },
  { label: "Ads Management", icon: "M4 9v6h3l5 4V5L7 9H4Zm12-2a5 5 0 0 1 0 10v-2a3 3 0 0 0 0-6V7Z" },
  { label: "Calendar", icon: "M7 2v2H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2V2h-2v2H9V2H7Zm-1 6h12v11H6V8Z" },
];

const CENTERS = [["Website", 88, "--c-crown"], ["Listing", 74, "--c-eye"], ["Konten", 70, "--c-throat"], ["SEO", 72, "--c-heart"], ["GEO", 66, "--c-solar"], ["Social", 61, "--c-sacral"], ["Reputasi", 80, "--c-root"]] as const;
const PERF = [["Kunjungan / bln", "3.240", "+14%", "--c-eye"], ["Lead masuk", "48", "+9", "--c-heart"], ["Listing aktif", "12", "2 baru", "--c-throat"], ["Peringkat SEO", "#3", "“vila Canggu”", "--c-solar"]] as const;
// Neutral placeholder for the Web Builder preview ONLY — shown when the agent has no real listings
// yet. No dummy/demo content (no fabricated Bali villas); the preview uses the agent's real listings
// as soon as they add any.
const PREVIEW_FALLBACK = [
  { t: "Properti pilihan", st: "Dijual", price: "", loc: "", img: "" },
  { t: "Unit tersedia", st: "Disewa", price: "", loc: "", img: "" },
];
const VIDEO_HISTORY = [
  { t: "Vila Uluwatu Cliff", ar: "9:16", dur: "1:02", date: "2 Sep 2026", poster: "/hero.webp" },
  { t: "Canggu Estate", ar: "16:9", dur: "1:15", date: "27 Agu 2026", poster: "/about/hero.webp" },
  { t: "Seminyak Retreat", ar: "9:16", dur: "0:48", date: "19 Agu 2026", poster: "/about/transform.webp" },
];
// ---- Supabase <-> UI mapping for listings ----
const ST_TO_DB: Record<string, string> = { Dijual: "dijual", Disewa: "disewa", Terjual: "terjual", Tersewa: "tersewa", Habis: "habis" };
const ST_FROM_DB: Record<string, string> = { dijual: "Dijual", disewa: "Disewa", terjual: "Terjual", tersewa: "Tersewa", habis: "Habis", draft: "Dijual", diarsipkan: "Habis" };
const listingToRow = (l: any, agentId: string) => ({ agent_id: agentId, title: l.t, status: ST_TO_DB[l.st] || "dijual", price_label: l.price, location: l.loc, beds: Number(l.kt) || 0, baths: Number(l.km) || 0, size_m2: Number(l.luas) || 0, description: l.desc, rating: l.rating ?? null, views: l.views ?? 0, images: l.img ? [l.img] : [] });
const listingFromRow = (r: any) => ({ id: r.id, t: r.title, st: ST_FROM_DB[r.status] || "Dijual", price: r.price_label || "", loc: r.location || "", kt: r.beds ?? 0, km: r.baths ?? 0, luas: r.size_m2 ?? 0, desc: r.description || "", rating: r.rating ?? null, views: r.views ?? 0, img: (Array.isArray(r.images) && r.images[0]) || "/hero.webp" });

const LISTING_HISTORY = [
  { t: "Vila Tegallalang", date: "1 Sep 2026", st: "Terjual", img: "/about/transform.webp", price: "Rp 6,2 M", loc: "Ubud, Bali" },
  { t: "Apartemen Sunset Road", date: "24 Agu 2026", st: "Tersewa", img: "/blog-1.webp", price: "Rp 180 jt/thn", loc: "Kuta, Bali" },
  { t: "Vila Pantai Berawa", date: "10 Agu 2026", st: "Terjual", img: "/hero.webp", price: "Rp 9,8 M", loc: "Canggu, Bali" },
  { t: "Ruko Sunset Road", date: "2 Agu 2026", st: "Tersewa", img: "/about/invite.webp", price: "Rp 220 jt/thn", loc: "Denpasar, Bali" },
];
const ASSETS = ["/about/hero.webp", "/about/transform.webp", "/hero.webp", "/about/invite.webp", "/blog-0.webp", "/blog-1.webp", "/about/vision-hill.webp", "/hero-top.webp"];
const FORMATS = [
  { id: "1:1", label: "Post — Instagram & Facebook" },
  { id: "9:16", label: "Reels / TikTok / Shorts" },
  { id: "16:9", label: "Video / YouTube / Presentasi" },
];
const PLATFORMS = [
  { id: "Instagram Post", fmt: "1:1" }, { id: "Facebook", fmt: "1:1" }, { id: "Instagram Reels", fmt: "9:16" },
  { id: "TikTok", fmt: "9:16" }, { id: "YouTube", fmt: "16:9" }, { id: "Presentasi", fmt: "16:9" },
];
const READY_CONTENT = [
  { t: "Panduan harga vila Canggu 2026", c: "Artikel", plat: "Blog", img: "/blog-0.webp", meta: "6 mnt baca · SEO", body: "Harga vila di Canggu terus menguat sepanjang 2026, didorong permintaan sewa jangka panjang dan pembeli asing lewat skema hak pakai.\n\nUntuk vila 3–4 kamar dengan kolam pribadi, kisaran harga kini Rp 6–12 miliar tergantung jarak ke pantai Berawa dan Pererenan. Area yang sedang naik daun seperti Nyanyi dan Cemagi menawarkan harga 15–20% lebih rendah dengan potensi apresiasi tinggi.\n\nTips: bandingkan harga per meter persegi tanah, bukan hanya harga total — ini ukuran paling jujur untuk menilai apakah sebuah listing wajar." },
  { t: "Reels: Tur 60 detik Vila Uluwatu", c: "Reels", plat: "Instagram", img: "/about/hero.webp", meta: "9:16 · 60 dtk", body: "Naskah reels (0–60 dtk):\n\n0–5 dtk — Drone melintas tebing, teks: “Bangun di atas Samudra Hindia.”\n5–35 dtk — Sapuan interior: ruang tamu terbuka, dapur granit, kamar utama berbalkon.\n35–50 dtk — Kolam infinity saat golden hour, sorot detail kayu jati & batu alam.\n50–60 dtk — Ajakan: “DM untuk jadwal viewing privat minggu ini.”\n\nCaption: Vila 5 kamar di Uluwatu — Rp 14 M. Hak milik. #propertibali #villauluwatu" },
  { t: "Carousel: 5 tips beli vila di Bali", c: "Post", plat: "Facebook", img: "/blog-1.webp", meta: "1:1 · 5 slide", body: "5 tips sebelum membeli vila di Bali:\n\n1. Pastikan status tanah — Hak Milik, Hak Pakai, atau leasehold — dan sisa masa berlakunya.\n2. Cek zonasi (ITR/PKKPR); tidak semua area boleh untuk vila komersial.\n3. Hitung yield bersih setelah biaya manajemen, pajak, dan perawatan — bukan hanya yield kotor.\n4. Verifikasi IMB/PBG dan pastikan bangunan sesuai izin.\n5. Gunakan notaris & agen tepercaya; jangan transfer sebelum due diligence selesai.\n\nSimpan & bagikan ke teman yang sedang cari vila!" },
  { t: "Video: Investasi properti Bali", c: "YouTube", plat: "YouTube", img: "/about/transform.webp", meta: "16:9 · 3 mnt", body: "Deskripsi video:\n\nKita bahas mengapa Bali tetap jadi salah satu pasar properti paling menarik di Asia Tenggara pada 2026 — dari pertumbuhan pariwisata, permintaan sewa harian, hingga skema kepemilikan untuk WNA.\n\nAgenda:\n• Tren harga per area (Canggu, Uluwatu, Ubud)\n• Perbandingan sewa harian vs tahunan\n• Struktur legal yang aman untuk pembeli asing\n• Studi kasus: ROI sebuah vila 3 kamar\n\nHubungi Kirana untuk konsultasi gratis 15 menit." },
  { t: "TikTok: POV keliling vila Canggu", c: "TikTok", plat: "TikTok", img: "/hero.webp", meta: "9:16 · 22 dtk", body: "Naskah TikTok (POV, 22 dtk):\n\nHook (0–3 dtk): “POV: kamu baru dapat kunci vila di Canggu.”\n3–15 dtk: jalan cepat dari gerbang → taman → kolam → rooftop, potongan cepat mengikuti beat.\n15–22 dtk: duduk santai saat sunset, teks: “Rp 8,5 M. Mau yang seperti ini? Komen ‘INFO’.”\n\nCaption: Vila 4 kamar Canggu, dekat Berawa. #vilabali #canggu #propertibali" },
  { t: "Shorts: Sunset Uluwatu 30 detik", c: "Shorts", plat: "Shorts", img: "/hero-top.webp", meta: "9:16 · 30 dtk", body: "Naskah Shorts (30 dtk):\n\n0–5 dtk: drone naik dari tebing, teks besar “Sunset terbaik di Bali?”\n5–22 dtk: sapuan vila clifftop + kolam infinity menghadap samudra.\n22–30 dtk: logo + ajakan “Subscribe untuk tur vila premium tiap minggu.”\n\nJudul: Vila clifftop Uluwatu saat golden hour 🌅 #shorts #bali #luxuryvilla" },
];
const CONTENT_HISTORY = [
  { t: "5 alasan investasi Uluwatu", c: "Artikel", plat: "Blog", img: "/about/invite.webp", date: "2 Sep 2026", posted: true, shared: true, down: false },
  { t: "Panduan KPR pembeli pertama", c: "Artikel", plat: "Blog", img: "/blog-2.webp", date: "28 Agu 2026", posted: true, shared: false, down: true },
  { t: "Tur Vila Seminyak Retreat", c: "Reels", plat: "Instagram", img: "/hero.webp", date: "20 Agu 2026", posted: true, shared: true, down: true },
  { t: "POV tren harga properti Bali", c: "TikTok", plat: "TikTok", img: "/blog-0.webp", date: "16 Agu 2026", posted: true, shared: true, down: false },
  { t: "Q&A investasi vila (YouTube)", c: "YouTube", plat: "YouTube", img: "/about/transform.webp", date: "12 Agu 2026", posted: true, shared: false, down: true },
  { t: "Shorts sunset Uluwatu", c: "Shorts", plat: "Shorts", img: "/hero-top.webp", date: "8 Agu 2026", posted: true, shared: true, down: true },
  { t: "Promo halaman Facebook", c: "Post", plat: "Facebook", img: "/blog-1.webp", date: "5 Agu 2026", posted: true, shared: false, down: false },
  { t: "Harga tanah Pererenan", c: "Artikel", plat: "Blog", img: "/about/vision-hill.webp", date: "—", posted: false, shared: false, down: false },
];
const CONTENT_PLATS = ["Semua", "Blog", "TikTok", "Instagram", "YouTube", "Facebook", "Shorts"] as const;
const PLAT_AR: Record<string, string> = { Blog: "16 / 9", TikTok: "9 / 16", Instagram: "9 / 16", YouTube: "16 / 9", Facebook: "1 / 1", Shorts: "9 / 16" };
// "Konten siap" is filtered per ASPECT RATIO (not per social platform, to avoid redundancy). Which
// platform a piece was actually posted to lives in the social-media dashboard, not here.
const CONTENT_ARS = ["Semua", "16:9", "1:1", "9:16"] as const;
const PLAT_TO_AR: Record<string, string> = { Blog: "16:9", YouTube: "16:9", Presentasi: "16:9", Facebook: "1:1", Instagram: "9:16", TikTok: "9:16", Shorts: "9:16" };
// Daily hub topic keys (from generate-content) → human labels, for the "Draft by Cakra" recommendations.
const TOPIC_LABELS: Record<string, string> = { local_trend: "Tren Lokal", fact: "Fakta", education: "Edukasi", story: "Cerita", hot_topic: "Topik Hangat", feed: "Feed", vertical: "Vertikal", tur: "Tur Unit", nilai: "Nilai & Harga", investasi: "Investasi", lokasi: "Lokasi & Lifestyle", edukasi: "Edukasi" };
// Label a Draft-by-Cakra card: 30-day plan items show "Hari N · Pillar · Format"; hub recs show the topic.
const draftLabel = (d: any): string => {
  const c = d?.content || {};
  if (c.plan) return `Hari ${c.plan_day || "•"} · ${TOPIC_LABELS[c.pillar] || c.pillar || "Konten"}${c.format ? " · " + ({ video: "Video 9:16", carousel: "Carousel", blog: "Blog" } as any)[c.format] || "" : ""}`;
  return TOPIC_LABELS[d.mirror] || d.type || "Konten";
};
const PLAT_ICON: Record<string, { d: string; c: string }> = {
  Blog: { d: "M6 2h9l5 5v14.2A.8.8 0 0 1 19.2 22H6a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 6 2Zm2 9h8v1.8H8zm0 4h8v1.8H8z", c: "#357482" },
  TikTok: { d: "M14 3c.3 2.2 1.7 3.9 4 4.2v2.5c-1.5 0-2.9-.5-4-1.3v5.9a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 1 0 1.8 2.5V3H14Z", c: "#111" },
  Instagram: { d: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z", c: "#E1306C" },
  YouTube: { d: "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z", c: "#FF0000" },
  Facebook: { d: "M13 22v-8h2.7l.4-3H13V9c0-.9.3-1.5 1.6-1.5H16V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.9V11H7.5v3H10v8h3Z", c: "#1877F2" },
  Shorts: { d: "M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Zm2 5.5v5l4.5-2.5z", c: "#FF0000" },
};
// 6 pertanyaan singkat — cukup untuk menulis advertorial/skrip/isi situs yang optimal (SEO/GEO/social/local)
const AI_QUESTIONS = [
  { key: "audience", q: "Siapa target pembeli/penyewa utama Anda?", ph: "mis. pembeli asing (hak pakai/PT PMA), investor, keluarga lokal, penyewa jangka panjang" },
  { key: "focus", q: "Jenis properti & kisaran harga yang Anda fokuskan?", ph: "mis. vila premium Rp 3–15 M, apartemen, tanah, komersial" },
  { key: "usp", q: "Apa keunggulan utama Anda? (pengalaman, jaringan, spesialisasi)", ph: "mis. 10+ tahun, jaringan pemilik, ahli legalitas WNA, closing cepat" },
  { key: "areas", q: "Kawasan/lingkungan spesifik yang paling Anda kuasai?", ph: "mis. Canggu (Berawa, Pererenan), Uluwatu, Ubud" },
  { key: "cta", q: "Aksi utama yang Anda inginkan dari pengunjung situs?", ph: "mis. chat WhatsApp, jadwalkan viewing, minta penilaian harga" },
  { key: "proof", q: "Bukti/pencapaian atau layanan khas untuk ditonjolkan?", ph: "mis. 150+ closing, pendampingan notaris, layanan Bahasa Inggris" },
] as const;
const CONTENT_TIPS = [
  "Buat konten khusus per area yang Anda kuasai — pencarian lokal lebih mudah dimenangkan.",
  "Reels tur 30–60 detik menaikkan interaksi hingga 3× dibanding foto.",
  "Sisipkan simulasi cicilan agar calon pembeli lebih percaya diri.",
  "Posting konsisten 2–3× seminggu lebih kuat daripada sesekali menumpuk.",
];
const BGM = [
  { t: "Golden Hour", mood: "Hangat · Sinematik", dur: "1:20", c: "--c-solar" },
  { t: "Island Drift", mood: "Santai · Tropis", dur: "2:05", c: "--c-throat" },
  { t: "Uptown Deal", mood: "Enerjik · Modern", dur: "1:45", c: "--c-heart" },
  { t: "Quiet Luxury", mood: "Elegan · Lembut", dur: "2:30", c: "--c-crown" },
  { t: "Sunset Cruise", mood: "Ceria · Upbeat", dur: "1:58", c: "--c-sacral" },
  { t: "Deep Blue", mood: "Tenang · Ambient", dur: "3:10", c: "--c-eye" },
];

// ---------- Web Builder (deterministic "machine" — no AI credits to build) ----------
type BState = {
  radius: string; bg: string; decoration: string; fontId: string; paletteId: string; density: string; styleId: string; tone: string;
  brand: string; tagline: string; metaTitle: string; metaDesc: string; logo: string; domain: string; location: string;
  wa: string; instagram: string; tiktok: string; youtube: string; facebook: string;
  imgs: Record<string, string>;
};
const IMAGE_SLOTS = [
  { key: "hero", label: "Foto hero", hint: "Gambar utama di atas", def: "/hero-top.webp" },
  { key: "about", label: "Foto tentang / agen", hint: "Untuk section profil", def: "/about/origin.webp" },
] as const;
const BUILDER_DEFAULT: BState = {
  radius: "semi", bg: "dual", decoration: "none", fontId: "anggun", paletteId: "coastal", density: "normal", styleId: "lembut", tone: "normal",
  imgs: {},
  brand: "", tagline: "",
  metaTitle: "",
  metaDesc: "",
  logo: "", domain: "", location: "",
  wa: "", instagram: "", tiktok: "", youtube: "", facebook: "",
};
const B_RADII = [
  { id: "kotak", label: "Kotak", card: 3, btn: 4, badge: 5 },
  { id: "semi", label: "Semi bulat", card: 16, btn: 12, badge: 999 },
  { id: "pill", label: "Rounded", card: 22, btn: 999, badge: 999 },
] as const;
const B_BGS = [
  { id: "mono", label: "Mono" }, { id: "dual", label: "Dual" }, { id: "gradient", label: "Gradasi" },
] as const;
const B_DECOR = [
  { id: "none", label: "Tanpa" }, { id: "low", label: "Sedikit" }, { id: "high", label: "Banyak" },
] as const;
const B_FONTS = [
  { id: "anggun", label: "Anggun", display: "'Playfair Display', Georgia, serif", body: "'Manrope', system-ui, sans-serif" },
  { id: "modern", label: "Modern", display: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { id: "editorial", label: "Editorial", display: "'Cormorant Garamond', Georgia, serif", body: "'Jost', system-ui, sans-serif" },
  { id: "bersih", label: "Bersih", display: "'DM Serif Display', Georgia, serif", body: "'DM Sans', system-ui, sans-serif" },
] as const;
const B_PALETTES = [
  { id: "coastal", label: "Coastal Calm", brand: "#357482", accent: "#B0812F", bg: "#F2F6F6", surface: "#FFFFFF", ink: "#1B2B2E" },
  { id: "terracotta", label: "Sunset Terracotta", brand: "#B5533A", accent: "#C9902F", bg: "#FBF6F0", surface: "#FFFFFF", ink: "#2A1D17" },
  { id: "noir", label: "Noir Luxe", brand: "#20201E", accent: "#C2A46B", bg: "#F5F3EF", surface: "#FFFFFF", ink: "#161412" },
  { id: "emerald", label: "Tropical Emerald", brand: "#1F6E5A", accent: "#E0A100", bg: "#F1F7F4", surface: "#FFFFFF", ink: "#122A22" },
  { id: "ocean", label: "Ocean Blue", brand: "#24506E", accent: "#C98A3B", bg: "#EFF4F8", surface: "#FFFFFF", ink: "#132433" },
  { id: "rosewood", label: "Rosewood", brand: "#7A3B4E", accent: "#B98A2E", bg: "#FAF4F2", surface: "#FFFFFF", ink: "#2C1720" },
] as const;
// Only two layout choices for the agent — Normal (comfortable) or Spacious (airier). "Tight" removed
// per product decision; any legacy "tight" value falls back to Normal at render time.
const B_DENSITIES = [
  { id: "normal", label: "Normal", pad: 34, gap: 20, lh: 1.62 },
  { id: "spacious", label: "Spacious", pad: 48, gap: 28, lh: 1.76 },
] as const;
const B_STYLES = [
  { id: "lembut", label: "Lembut", border: "1px solid rgba(0,0,0,.06)", shadow: "0 14px 34px -20px rgba(15,32,38,.22)", caps: false, ruled: false },
  { id: "minimalis", label: "Minimalis", border: "1px solid rgba(0,0,0,.1)", shadow: "none", caps: false, ruled: false },
  { id: "tegas", label: "Tegas", border: "1.5px solid var(--pv-ink)", shadow: "5px 5px 0 var(--pv-ink)", caps: true, ruled: false },
  { id: "editorial", label: "Editorial", border: "1px solid color-mix(in oklab, var(--pv-ink) 14%, transparent)", shadow: "none", caps: true, ruled: true },
] as const;
const B_TONES = [
  { id: "normal", label: "Normal" }, { id: "professional", label: "Professional" }, { id: "lux", label: "Lux" }, { id: "relax", label: "Relax" },
] as const;
const B_TONE_COPY: Record<string, { eyebrow: string; h1: string; sub: string; cta: string }> = {
  normal: { eyebrow: "spesialis properti", h1: "Properti pilihan, dari tangan yang paham.", sub: "Jual, sewa, dan investasi properti — didampingi sampai serah terima yang aman.", cta: "Hubungi sekarang" },
  professional: { eyebrow: "konsultan properti", h1: "Solusi properti yang terukur & tepercaya.", sub: "Pendampingan menyeluruh — analisa pasar, negosiasi, hingga legalitas — dengan standar profesional.", cta: "Jadwalkan konsultasi" },
  lux: { eyebrow: "the finest estates", h1: "Kediaman istimewa untuk mereka yang paham nilai.", sub: "Koleksi hunian dan estat pilihan di lokasi paling didambakan, dilayani penuh ketelitian.", cta: "Atur pertemuan privat" },
  relax: { eyebrow: "cari properti? santai aja", h1: "Cari hunian impian jadi gampang & menyenangkan.", sub: "Ngobrol santai dulu — nanti aku bantu cariin properti yang pas, dari budget sampai lokasi.", cta: "Yuk, ngobrol" },
};

const SCORE = 76;

const CHANNELS = [
  { id: "insights", name: "Insights", sub: "3 sorotan baru", icon: "M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z", accent: "--c-crown" },
  { id: "web", name: "Web", sub: "Skor 76 · Baik", icon: "M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-6v2h3v2H7v-2h3v-2H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z", accent: "--c-eye" },
  { id: "instagram", name: "Instagram", sub: "4.820 pengikut", icon: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z", accent: "--c-heart" },
  { id: "tiktok", name: "TikTok", sub: "12,4k pengikut", icon: "M14 3c.3 2.2 1.7 3.9 4 4.2v2.5c-1.5 0-2.9-.5-4-1.3v5.9a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 1 0 1.8 2.5V3H14Z", accent: "--c-throat" },
  { id: "youtube", name: "YouTube", sub: "1.240 subscriber", icon: "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z", accent: "--c-root" },
] as const;
type DashTab = (typeof CHANNELS)[number]["id"];
const INSIGHTS: { tag: string; tone: string; t: string; b: string; when: string; act: [string, Sec] }[] = [
  { tag: "Peluang", tone: "--c-heart", t: "Situs Anda siap dioptimalkan untuk SEO & GEO", b: "Perkuat teks dan struktur agar lebih mudah ditemukan pembeli dan dikutip mesin pencari AI.", when: "Kemarin", act: ["Buka Web Builder →", "builder"] },
  { tag: "Sorotan", tone: "--c-solar", t: "Listing Vila Uluwatu naik 32% minggu ini", b: "Kunjungan halaman melonjak setelah reels tur dipublikasikan. Pertimbangkan promosi berbayar selagi momentum tinggi.", when: "2 jam lalu", act: ["Lihat listing →", "listing"] },
  { tag: "Insight", tone: "--c-eye", t: "Pencarian “vila Canggu dekat pantai” meningkat", b: "Volume pencarian area ini +18% bulan ini. Buat konten khusus untuk menangkap minat pembeli.", when: "Kemarin", act: ["Buat konten →", "content"] },
  { tag: "Sorotan", tone: "--c-throat", t: "Reels Anda menembus 12.400 penayangan", b: "Video pendek jadi kanal pertumbuhan tercepat Anda bulan ini — jadwalkan 2 lagi minggu depan.", when: "3 hari lalu", act: ["Buat reels →", "editor"] },
  { tag: "Insight", tone: "--c-crown", t: "Skor GEO Anda naik ke 66", b: "Mesin pencari AI mulai mengutip profil Anda. Tambahkan FAQ terstruktur untuk mendorong lebih tinggi.", when: "4 hari lalu", act: ["Lihat analisa Web →", "home"] },
];
const WEB_METRICS = [["Kunjungan / bln", "3.240", "+14%", "--c-eye"], ["Pengunjung unik", "2.180", "+9%", "--c-heart"], ["Rasio pentalan", "38%", "−4%", "--c-throat"], ["Kecepatan (LCP)", "1,8 dtk", "Baik", "--c-solar"], ["Peringkat SEO", "#3", "“vila Canggu”", "--c-root"], ["Skor GEO", "66", "+6", "--c-crown"]] as const;
const WEB_PAGES = [["/listing/vila-uluwatu-cliff", "1.240"], ["/", "980"], ["/tentang", "410"], ["/listing/canggu-estate", "360"]] as const;
const WEB_KEYWORDS = [["vila canggu dijual", "#3"], ["properti bali mewah", "#5"], ["vila uluwatu", "#2"], ["agen properti canggu", "#4"]] as const;
const SOCIAL: Record<string, { metrics: [string, string, string][]; top: [string, string][]; growth: number[] }> = {
  instagram: {
    metrics: [["Pengikut", "4.820", "+180"], ["Jangkauan / 30h", "38.400", "+12%"], ["Interaksi", "6,1%", "+0,8%"], ["Kunjungan profil", "2.140", "+15%"]],
    top: [["Reel: Tur Vila Uluwatu", "12.400 tayangan"], ["Carousel: 5 tips beli vila", "3.200 suka"], ["Foto: Sunset Seminyak", "1.850 suka"]],
    growth: [30, 42, 38, 55, 60, 72, 80],
  },
  tiktok: {
    metrics: [["Pengikut", "12.400", "+640"], ["Tayangan / 30h", "184.000", "+26%"], ["Interaksi", "9,4%", "+1,2%"], ["Dibagikan", "1.920", "+18%"]],
    top: [["Tur cepat Vila Canggu", "62.000 tayangan"], ["POV: keliling vila Bali", "41.000 tayangan"], ["Tips harga properti", "22.500 tayangan"]],
    growth: [20, 35, 30, 48, 66, 74, 92],
  },
  youtube: {
    metrics: [["Subscriber", "1.240", "+58"], ["Jam ditonton", "3.180", "+11%"], ["Tayangan / 30h", "48.900", "+9%"], ["Rata-rata tonton", "2:14", "+8 dtk"]],
    top: [["Rumah tur sinematik Uluwatu", "18.200 tayangan"], ["Panduan beli properti Bali", "9.400 tayangan"], ["Q&A investasi vila", "5.100 tayangan"]],
    growth: [40, 44, 50, 52, 58, 63, 70],
  },
};

function Ic({ d, s = 18 }: { d: string; s?: number }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" aria-hidden="true"><path d={d} /></svg>;
}
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="card" style={{ padding: 22, ...style }}>{children}</div>;
}
function H({ children }: { children: React.ReactNode }) {
  return <h2 className="display" style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 14px" }}>{children}</h2>;
}
function btn(kind: "brand" | "ghost" = "brand"): React.CSSProperties {
  return kind === "brand"
    ? { background: "var(--brand)", color: "#fff", border: "none", borderRadius: 10, padding: ".62rem 1.2rem", font: "inherit", fontWeight: 600, fontSize: ".9rem", cursor: "pointer" }
    : { background: "transparent", color: "var(--ink)", border: "1px solid var(--line-2)", borderRadius: 10, padding: ".62rem 1.2rem", font: "inherit", fontWeight: 600, fontSize: ".9rem", cursor: "pointer" };
}
const drop: React.CSSProperties = { border: "1.5px dashed var(--line-2)", borderRadius: 12, padding: "22px 16px", textAlign: "center", color: "var(--muted)", cursor: "pointer", background: "var(--surface-2)" };
const tag = (on: boolean): React.CSSProperties => ({ fontSize: ".66rem", fontWeight: 700, padding: ".2rem .5rem", borderRadius: 999, background: on ? "color-mix(in oklab, var(--good) 16%, var(--surface))" : "var(--surface)", color: on ? "var(--good)" : "var(--muted)", border: on ? "none" : "1px solid var(--line)" });
const arCss = (f: string) => f.replace(":", " / ");

// Render a produced asset's downloadable images (carousel = 1:1 deck, video = 9:16 storyboard).
function imagesFor(piece: any, brand: string, contact: string): string[] {
  const fmt = piece?.content?.format;
  if (fmt === "carousel") return renderSlides(piece.content?.slides || [], { brand, contact, kind: "carousel" });
  if (fmt === "video") {
    const scenes = piece.content?.scenes || [];
    const slides = [{ kind: "cover", headline: piece.content?.hook || piece.title }, ...scenes.map((s: any) => ({ kind: "point", headline: s.caption, sub: s.vo, vo: s.vo })), { kind: "cta", headline: "Hubungi kami", sub: piece.content?.cta || "" }];
    return renderSlides(slides, { brand, contact, kind: "video" });
  }
  return [];
}
const dlImg = (url: string, name: string) => { const a = document.createElement("a"); a.href = url; a.download = name; a.click(); };

// One right-panel card for a generation: spinner while working, error, or the finished asset.
function ProducedCard({ item, brand, contact, onView, onRemove }: { item: any; brand: string; contact: string; onView: (p: any) => void; onRemove: (id: string) => void }) {
  const FMT: Record<string, string> = { blog: "Blog", carousel: "Carousel", video: "Video 9:16" };
  const isImg = item.fmt === "carousel" || item.fmt === "video";
  const images = useMemo(() => (item.status === "done" && item.piece && isImg) ? imagesFor(item.piece, brand, contact) : [], [item.piece, item.status, brand, contact, isImg]);
  const chip = (bg: string, col: string, t: string) => <span style={{ fontSize: ".58rem", fontWeight: 700, color: col, background: bg, padding: ".16rem .5rem", borderRadius: 999, textTransform: "uppercase", letterSpacing: ".03em" }}>{t}</span>;

  if (item.status === "working") return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, borderRadius: 12, background: "color-mix(in oklab, var(--brand) 7%, var(--surface-2))", border: "1px dashed color-mix(in oklab, var(--brand) 40%, var(--line))" }}>
      <span style={{ width: 20, height: 20, flex: "none", borderRadius: "50%", border: "2.5px solid color-mix(in oklab, var(--brand) 28%, transparent)", borderTopColor: "var(--brand)", animation: "admSpin .8s linear infinite" }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{chip("color-mix(in oklab, var(--brand) 14%, var(--surface))", "var(--brand)", FMT[item.fmt] || item.fmt)}{chip("color-mix(in oklab, var(--warn) 14%, var(--surface))", "var(--warn)", "Sedang dibuat…")}</div>
        <div style={{ fontWeight: 600, fontSize: ".88rem", margin: "2px 0 1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
        <div className="muted" style={{ fontSize: ".74rem" }}>AI sedang menyusun — muncul otomatis saat selesai.</div>
      </div>
    </div>
  );

  if (item.status === "error") return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, borderRadius: 12, background: "color-mix(in oklab, var(--crit) 8%, var(--surface-2))", border: "1px solid color-mix(in oklab, var(--crit) 30%, var(--line))" }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{chip("color-mix(in oklab, var(--brand) 14%, var(--surface))", "var(--brand)", FMT[item.fmt] || item.fmt)}{chip("color-mix(in oklab, var(--crit) 14%, var(--surface))", "var(--crit)", "Gagal")}</div>
        <div style={{ fontWeight: 600, fontSize: ".86rem" }}>{item.title}</div>
        <div className="muted" style={{ fontSize: ".72rem" }}>{item.error || "Terjadi kesalahan."}</div>
      </div>
      <button onClick={() => onRemove(item.id)} aria-label="Tutup" style={{ flex: "none", width: 26, height: 26, borderRadius: 7, border: "1px solid var(--line-2)", background: "transparent", color: "var(--muted)", cursor: "pointer" }}>✕</button>
    </div>
  );

  return (
    <div style={{ padding: 12, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {chip("color-mix(in oklab, var(--brand) 14%, var(--surface))", "var(--brand)", FMT[item.fmt] || item.fmt)}
        {chip("color-mix(in oklab, var(--good) 14%, var(--surface))", "var(--good)", "✓ Siap")}
      </div>
      <div style={{ fontWeight: 700, fontSize: ".9rem", lineHeight: 1.3 }}>{item.title}</div>
      {isImg && images.length > 0 && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {images.map((src, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={i} src={src} alt="" style={{ height: item.fmt === "video" ? 128 : 84, borderRadius: 6, border: "1px solid var(--line)", flex: "none" }} />
          ))}
        </div>
      )}
      {item.fmt === "blog" && (
        <p className="muted" style={{ fontSize: ".82rem", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.piece?.content?.meta_description || item.piece?.body}</p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => onView(item.piece)} style={{ flex: 1, minWidth: 96, font: "inherit", fontSize: ".8rem", fontWeight: 600, padding: ".5rem .8rem", borderRadius: 9, border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer" }}>{item.fmt === "blog" ? "Baca" : "Lihat"}</button>
        {isImg
          ? <button onClick={() => images.forEach((src, i) => setTimeout(() => dlImg(src, `cakra-${item.fmt}-${i + 1}.png`), i * 200))} style={{ flex: 1, minWidth: 96, font: "inherit", fontSize: ".8rem", fontWeight: 600, padding: ".5rem .8rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>⬇ Unduh {images.length}</button>
          : <button onClick={() => { try { navigator.clipboard.writeText(item.piece?.body || ""); } catch {} }} style={{ flex: 1, minWidth: 96, font: "inherit", fontSize: ".8rem", fontWeight: 600, padding: ".5rem .8rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>⧉ Salin</button>}
        <button onClick={() => onRemove(item.id)} aria-label="Sembunyikan" style={{ flex: "none", width: 34, borderRadius: 9, border: "1px solid var(--line-2)", background: "transparent", color: "var(--muted)", cursor: "pointer" }}>✕</button>
      </div>
    </div>
  );
}

function MemberDashboard({ user, onSignOut }: { user: SupaUser; onSignOut: () => void }) {
  const [sec, setSec] = useState<Sec>("home");
  const [dashTab, setDashTab] = useState<DashTab>("insights");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [leadFilter, setLeadFilter] = useState<string>("Semua");
  const [orient, setOrient] = useState<"9:16" | "16:9">("9:16");
  const [assetFmt, setAssetFmt] = useState("1:1");
  const [assetTab, setAssetTab] = useState<"gambar" | "video" | "bgm" | "voice">("gambar");
  const [bgmOn, setBgmOn] = useState<string | null>(null);
  const [platform, setPlatform] = useState("Instagram Post");
  const [newStatus, setNewStatus] = useState<"jual" | "sewa">("jual");
  const [listingModal, setListingModal] = useState<number | null>(null);
  // Listings — loaded from Supabase for the signed-in agent; each mutation writes back to the DB.
  const [listings, setListings] = useState<any[]>([]);
  const [listingEdit, setListingEdit] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await db("listings", { query: `agent_id=eq.${user.id}&order=created_at.asc` });
        if (alive) setListings((Array.isArray(rows) ? rows : []).map(listingFromRow));
      } catch { /* leave empty if the DB is unreachable */ }
    })();
    return () => { alive = false; };
  }, [user.id]);
  const patchListing = async (idx: number, patch: any, dbPatch: any) => {
    const row = listings[idx]; if (!row) return;
    setListings((ls) => ls.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
    try { if (row.id) await db("listings", { method: "PATCH", query: `id=eq.${row.id}`, body: dbPatch }); } catch {}
  };
  const setListingStatus = (idx: number, st: string) => patchListing(idx, { st }, { status: ST_TO_DB[st] || "dijual" });
  const saveListingEdit = (idx: number, d: any) => patchListing(idx, { t: d.t, price: d.price, loc: d.loc, kt: Number(d.kt) || 0, km: Number(d.km) || 0, luas: Number(d.luas) || 0, desc: d.desc }, { title: d.t, price_label: d.price, location: d.loc, beds: Number(d.kt) || 0, baths: Number(d.km) || 0, size_m2: Number(d.luas) || 0, description: d.desc });
  const deleteListing = async (idx: number) => {
    const row = listings[idx]; if (!row) return;
    setListings((ls) => ls.filter((_, i) => i !== idx));
    try { if (row.id) await db("listings", { method: "DELETE", query: `id=eq.${row.id}` }); } catch {}
  };
  const ST_COLOR: Record<string, string> = { Dijual: "var(--brand)", Disewa: "var(--jade)", Terjual: "var(--brand-2)", Tersewa: "var(--jade)", Habis: "var(--muted)" };
  const ST_ALL = ["Dijual", "Disewa", "Terjual", "Tersewa", "Habis"];
  const F_LBL: CSSProperties = { display: "grid", gap: 4, fontSize: ".76rem", fontWeight: 700, color: "var(--ink-2)" };
  const F_INP: CSSProperties = { font: "inherit", fontSize: ".9rem", padding: ".5rem .6rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", width: "100%" };
  const [videoModal, setVideoModal] = useState<number | null>(null);
  const [contentModal, setContentModal] = useState<number | null>(null);
  const [contentFilter, setContentFilter] = useState<string>("Semua");
  // "Tulis konten" | "Draft by Cakra" (daily hub recommendations, personalized to this agent).
  const [writeTab, setWriteTab] = useState<"write" | "draft">("write");
  const [writeTitle, setWriteTitle] = useState("");
  const [writeBody, setWriteBody] = useState("");
  const [drafts, setDrafts] = useState<any[]>([]);
  const [draftOpen, setDraftOpen] = useState<any | null>(null);   // Draft by Cakra → detail popup
  const [viewPiece, setViewPiece] = useState<any | null>(null);   // produced asset → reader / slide gallery
  const [generating, setGenerating] = useState<any[]>([]);        // produced (done) + in-flight generations
  const [prof, setProf] = useState<any>(null);
  useEffect(() => {
    db("profiles", { query: `id=eq.${user.id}&select=brand,name,whatsapp,subdomain,custom_domain,tagline,city` }).then((r) => setProf(Array.isArray(r) ? r[0] : r)).catch(() => {});
    // All ready content in one fetch, split: Draft-by-Cakra recommendations (daily hub masters + the
    // 30-day content plan) vs already-produced assets (shown in the right panel).
    db("content_pieces", { query: `agent_id=eq.${user.id}&status=eq.ready&order=created_at.desc&limit=90` })
      .then((r) => {
        const rows = Array.isArray(r) ? r : [];
        const isProduced = (x: any) => x?.content?.produced === true;
        const isPlan = (x: any) => x?.content?.plan === true;
        const recs = rows.filter((x) => !isProduced(x));
        recs.sort((a: any, b: any) => (isPlan(a) ? a.content.plan_day || 0 : 9999) - (isPlan(b) ? b.content.plan_day || 0 : 9999));
        setDrafts(recs);
        setGenerating(rows.filter(isProduced).map((p: any) => ({ id: p.id, title: p.title, fmt: p.content.format, topic: p.mirror, status: "done", piece: p })));
      }).catch(() => {});
  }, [user.id]);
  const brand = prof?.brand || prof?.name || "cakra";
  const contact = prof?.whatsapp || "";
  const hostLabel = prof?.custom_domain || (prof?.subdomain ? `${prof.subdomain}.cakra.xyz` : "cakra.xyz");
  const FMT_LABEL: Record<string, string> = { blog: "Blog", carousel: "Carousel", video: "Video 9:16 · 30–60 dtk" };
  // Pick a recommendation + format → show a "sedang dibuat" placeholder, call generate-asset, then
  // replace it with the finished, downloadable asset (persisted to content_pieces).
  const useDraft = async (d: any, fmt: "blog" | "carousel" | "video") => {
    const localId = `${Date.now()}-${fmt}-${d.id}`;
    setGenerating((g) => [{ id: localId, title: d.title, fmt, topic: d.mirror, status: "working" }, ...g]);
    try {
      const res = await invokeFn("generate-asset", { piece_id: d.id, format: fmt });
      const piece = res?.piece; if (!piece) throw new Error("Hasil kosong");
      setGenerating((g) => g.map((x) => x.id === localId ? { id: piece.id, title: piece.title, fmt, topic: piece.mirror, status: "done", piece } : x));
    } catch (e: any) {
      setGenerating((g) => g.map((x) => x.id === localId ? { ...x, status: "error", error: String(e?.message || e) } : x));
    }
  };
  const kontenRef = useRef<HTMLInputElement | null>(null);
  const [kontenUp, setKontenUp] = useState<string | null>(null);
  // Upload finished content made outside cakra — lands in the shared media library, ready to reuse.
  const uploadKonten = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setKontenUp("Mengunggah…");
    let ok = 0, fail = 0;
    for (const f of Array.from(files)) { try { await uploadAsset(f); ok++; } catch { fail++; } }
    setKontenUp(fail ? `${ok} terunggah, ${fail} gagal` : `${ok} konten terunggah ke pustaka ✓`);
    setTimeout(() => setKontenUp(null), 3800);
    if (kontenRef.current) kontenRef.current.value = "";
  };
  const [aiModal, setAiModal] = useState(false);
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});
  const [aiSaved, setAiSaved] = useState(false);
  const submitAI = () => { try { localStorage.setItem("cakra-ai-brief", JSON.stringify(aiAnswers)); } catch {} setAiSaved(true); };
  const [contentSched, setContentSched] = useState(false);
  // background video render QUEUE — one renders at a time, the rest wait; persists across section switches
  type Job = { id: number; label: string; orient: "9:16" | "16:9"; status: "queued" | "rendering" | "done"; pct: number };
  const jobSeq = useRef(1);
  const [jobs, setJobs] = useState<Job[]>([]);
  const rendering = jobs.find((j) => j.status === "rendering") || null;
  const queued = jobs.filter((j) => j.status === "queued");
  const lastDone = [...jobs].reverse().find((j) => j.status === "done") || null;
  const doneCount = jobs.filter((j) => j.status === "done").length;
  const isRendering = !!rendering;
  const addJob = () => setJobs((js) => [...js, { id: jobSeq.current++, label: `Video ${orient} · #${js.length + 1}`, orient, status: "queued", pct: 0 }]);
  const clearFinished = () => setJobs((js) => js.filter((j) => j.status !== "done"));
  // voice creation (ElevenLabs) — 3 slots per client, permanent
  const [voiceStyle, setVoiceStyle] = useState("Hangat");

  // Web Builder — deterministic template config (persisted locally; later → Supabase profile)
  const [builder, setBuilder] = useState<BState>(BUILDER_DEFAULT);
  const [builderSaved, setBuilderSaved] = useState(false);
  const [published, setPublished] = useState<string | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const setB = (patch: Partial<BState>) => { setBuilder((b) => ({ ...b, ...patch })); setBuilderSaved(false); };
  useEffect(() => {
    try { const raw = localStorage.getItem("cakra-builder"); if (raw) setBuilder((b) => ({ ...b, ...JSON.parse(raw) })); } catch {}
    try { const at = localStorage.getItem("cakra-builder-published-at"); if (at) setPublished(at); } catch {}
  }, []);
  // Hydrate the builder identity from the agent's real profile (only when they haven't saved their own).
  useEffect(() => {
    if (!prof) return;
    let hasSaved = false; try { hasSaved = !!localStorage.getItem("cakra-builder"); } catch {}
    if (hasSaved) return;
    const dom = prof.custom_domain || (prof.subdomain ? `${prof.subdomain}.cakra.xyz` : "");
    setBuilder((b) => ({
      ...b,
      brand: b.brand || prof.brand || prof.name || "",
      tagline: b.tagline || prof.tagline || "",
      domain: b.domain || dom,
      location: b.location || prof.city || "",
      wa: b.wa || prof.whatsapp || "",
      metaTitle: b.metaTitle || [prof.brand, prof.tagline].filter(Boolean).join(" — "),
      metaDesc: b.metaDesc || prof.tagline || "",
    }));
  }, [prof]);
  useEffect(() => {
    const id = "cakra-builder-fonts";
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const l = document.createElement("link"); l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap";
    document.head.appendChild(l);
  }, []);
  // slot images (data URLs) can be large — keep them out of localStorage to avoid quota errors; they sync to Supabase once the backend is live
  const persistable = ({ imgs, ...rest }: BState) => rest;
  const saveBuilder = () => { try { localStorage.setItem("cakra-builder", JSON.stringify(persistable(builder))); } catch {} setBuilderSaved(true); setTimeout(() => setBuilderSaved(false), 2000); };
  // convert any upload to optimized WebP (capped dimensions), with graceful fallback
  const fileToWebp = (file: File, maxW: number, quality = 0.82): Promise<string> =>
    new Promise((resolve) => {
      const fallback = () => { const rd = new FileReader(); rd.onload = () => resolve(String(rd.result)); rd.readAsDataURL(file); };
      try {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          try {
            const scale = Math.min(1, maxW / (img.naturalWidth || maxW));
            const w = Math.max(1, Math.round((img.naturalWidth || maxW) * scale));
            const h = Math.max(1, Math.round((img.naturalHeight || maxW) * scale));
            const c = document.createElement("canvas"); c.width = w; c.height = h;
            const ctx = c.getContext("2d");
            if (!ctx) { URL.revokeObjectURL(url); return fallback(); }
            ctx.drawImage(img, 0, 0, w, h);
            let out = c.toDataURL("image/webp", quality);
            if (!out.startsWith("data:image/webp")) out = c.toDataURL("image/jpeg", quality); // browsers without webp encode
            URL.revokeObjectURL(url); resolve(out);
          } catch { URL.revokeObjectURL(url); fallback(); }
        };
        img.onerror = () => { URL.revokeObjectURL(url); fallback(); };
        img.src = url;
      } catch { fallback(); }
    });
  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setB({ logo: await fileToWebp(f, 320, 0.9) });
  };
  const [accOpen, setAccOpen] = useState<Record<string, boolean>>({ logo: true });
  const onImg = (key: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await fileToWebp(f, 1600, 0.82);
    setBuilder((b) => ({ ...b, imgs: { ...b.imgs, [key]: url } })); setBuilderSaved(false);
  };
  const clearImg = (key: string) => setBuilder((b) => { const n = { ...b.imgs }; delete n[key]; return { ...b, imgs: n }; });
  // Lokasi & gaya bahasa = fondasi mesin — hanya bisa dikunci-ubah sekali per 30 hari
  const [locks, setLocks] = useState<Record<string, number>>({});
  useEffect(() => { try { const raw = localStorage.getItem("cakra-builder-locks"); if (raw) setLocks(JSON.parse(raw)); } catch {} }, []);
  const LOCK_MS = 30 * 24 * 3600 * 1000;
  const foundationLocked = () => { const t = locks.foundation; return t ? Date.now() < t + LOCK_MS : false; };
  const foundationUnlockDate = () => new Date((locks.foundation || 0) + LOCK_MS).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const lockFoundation = () => { const next = { ...locks, foundation: Date.now() }; setLocks(next); try { localStorage.setItem("cakra-builder-locks", JSON.stringify(next)); } catch {} };
  const clearLocks = () => { setLocks({}); try { localStorage.removeItem("cakra-builder-locks"); } catch {} };

  // promote the next queued job whenever nothing is rendering
  useEffect(() => {
    setJobs((js) => {
      if (js.some((j) => j.status === "rendering")) return js;
      const idx = js.findIndex((j) => j.status === "queued");
      if (idx === -1) return js;
      return js.map((j, i) => (i === idx ? { ...j, status: "rendering", pct: 0 } : j));
    });
  }, [jobs]);
  // tick the active render forward
  useEffect(() => {
    if (!isRendering) return;
    const id = setInterval(() => setJobs((js) => js.map((j) => {
      if (j.status !== "rendering") return j;
      const pct = Math.min(100, j.pct + 6);
      return pct >= 100 ? { ...j, pct: 100, status: "done" } : { ...j, pct };
    })), 320);
    return () => clearInterval(id);
  }, [isRendering]);

  // Real per-agent summary — no fabricated analytics. Web/social analytics and lead
  // capture arrive with those integrations; until then they are shown honestly as "segera hadir".
  const liveCount = listings.filter((x) => x.st === "Dijual" || x.st === "Disewa").length;
  const producedCount = generating.filter((g) => g.status === "done").length;
  const SUMMARY: [string, string, string, Sec][] = [
    ["Listing tayang", String(liveCount), listings.length ? `${listings.length} listing total` : "Belum ada listing", "listing"],
    ["Konten jadi", String(producedCount), drafts.length ? `${drafts.length} draft menunggu` : "Buat dari Draft by Cakra", "content"],
    ["Website", published ? "Live" : "Draf", published ? hostLabel : "Terbitkan di Web Builder", "builder"],
    ["Draft by Cakra", String(drafts.length), drafts.length ? "Siap dibuat" : "Segera hadir", "content"],
  ];
  const Dashboard = (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(158px, 1fr))", gap: 12, marginBottom: 18 }} className="adm-kpi">
        {SUMMARY.map(([l, v, d, target]) => (
          <button key={l} onClick={() => setSec(target)} className="adm-thumb" style={{ textAlign: "left", padding: "14px 16px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", font: "inherit" }}>
            <div className="muted" style={{ fontSize: ".8rem" }}>{l}</div>
            <div className="display" style={{ fontSize: "1.7rem", fontWeight: 700, color: "var(--brand)", lineHeight: 1.1 }}>{v}</div>
            <div className="muted" style={{ fontSize: ".74rem" }}>{d}</div>
          </button>
        ))}
      </div>
      <Card>
        <H>Analitik &amp; media sosial</H>
        <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "30px 18px", gap: 12 }}>
          <span style={{ width: 54, height: 54, borderRadius: 15, display: "grid", placeItems: "center", background: "color-mix(in oklab, var(--brand) 12%, var(--surface))", color: "var(--brand)" }}><Ic d="M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" s={26} /></span>
          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>Analitik web, SEO/GEO &amp; media sosial — segera hadir</div>
          <p className="muted" style={{ fontSize: ".9rem", lineHeight: 1.6, maxWidth: 480, margin: 0 }}>Kunjungan situs, peringkat kata kunci, dan performa media sosial akan tampil di sini begitu integrasi analitik &amp; akun sosial Anda terhubung. Sementara itu, isi kehadiran Anda lewat Web Builder dan Draft by Cakra.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
            <button style={btn("brand")} onClick={() => setSec("builder")}>Buka Web Builder</button>
            <button style={btn("ghost")} onClick={() => setSec("content")}>Buat konten</button>
          </div>
        </div>
      </Card>
    </>
  );

  const Prospek = (
    <Card>
      <H>Kotak masuk prospek</H>
      <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "34px 18px", gap: 12 }}>
        <span style={{ width: 54, height: 54, borderRadius: 15, display: "grid", placeItems: "center", background: "color-mix(in oklab, var(--c-heart) 14%, var(--surface))", color: "var(--c-heart)" }}><Ic d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm0 10v5h16v-5h-4a3 3 0 0 1-6 0H4Z" s={26} /></span>
        <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>Kotak masuk prospek — segera hadir</div>
        <p className="muted" style={{ fontSize: ".9rem", lineHeight: 1.6, maxWidth: 460, margin: 0 }}>Lead dari website, WhatsApp, dan media sosial akan berkumpul di sini begitu penangkapan lead aktif. Untuk sekarang, tombol WhatsApp di situs Anda meneruskan calon pembeli langsung ke {contact ? `nomor ${contact}` : "nomor WhatsApp Anda"}.</p>
      </div>
    </Card>
  );

  const inp: React.CSSProperties = { width: "100%", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: ".72rem 1rem", font: "inherit", fontSize: ".92rem", color: "var(--ink)" };
  const lbl: React.CSSProperties = { fontSize: ".82rem", fontWeight: 600, display: "block", marginBottom: 6, color: "var(--ink-2)" };
  const Listing = (
    <div style={{ display: "grid", gridTemplateColumns: ".82fr 1.18fr", gap: 18, alignItems: "start" }} className="adm-2">
      {/* LEFT: create new listing */}
      <Card>
        <H>Buat listing baru</H>
        <div style={{ display: "grid", gap: 14 }}>
          <div><label style={lbl}>Judul properti</label><input placeholder="mis. Vila Canggu Modern" style={inp} /></div>
          <div><label style={lbl}>Lokasi / area</label><input placeholder="mis. Canggu, Bali" style={inp} /></div>
          <div>
            <label style={lbl}>Status</label>
            <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 4 }}>
              {(["jual", "sewa"] as const).map((s) => (
                <button key={s} onClick={() => setNewStatus(s)} style={{ border: "none", cursor: "pointer", font: "inherit", fontWeight: 600, fontSize: ".85rem", padding: ".45rem 1.1rem", borderRadius: 999, background: newStatus === s ? "var(--brand)" : "transparent", color: newStatus === s ? "#fff" : "var(--muted)" }}>{s === "jual" ? "Dijual" : "Disewa"}</button>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Harga{newStatus === "sewa" ? " / tahun" : ""}</label><input placeholder="mis. Rp 8.500.000.000" style={inp} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div><label style={lbl}>Kamar tidur</label><input type="number" placeholder="4" style={inp} /></div>
            <div><label style={lbl}>Kamar mandi</label><input type="number" placeholder="3" style={inp} /></div>
            <div><label style={lbl}>Luas (m²)</label><input type="number" placeholder="320" style={inp} /></div>
          </div>
          <div><label style={lbl}>Foto properti <span style={{ fontWeight: 500, color: "var(--muted)" }}>(maks. 8)</span></label><div style={drop}><Ic d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z" s={22} /><div style={{ fontSize: ".82rem", marginTop: 6 }}>Tarik &amp; letakkan foto, atau klik untuk unggah</div><div className="mono" style={{ fontSize: ".72rem", marginTop: 4, color: "var(--muted)" }}>Maks. 8 foto · 5 MB per foto · JPG/PNG</div></div></div>
          <div><label style={lbl}>Deskripsi</label><textarea rows={3} placeholder="Ceritakan keunggulan properti…" style={{ ...inp, resize: "vertical" }} /></div>
          <div style={{ display: "flex", gap: 10 }}><button style={btn("brand")}>Terbitkan listing</button><button style={btn("ghost")}>Simpan draf</button></div>
        </div>
      </Card>
      {/* RIGHT: live (top) + history (bottom) */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <H>Listing live</H>
          <span style={{ fontSize: ".78rem", color: "var(--good)", fontWeight: 600 }}>● {listings.filter((x) => x.st === "Dijual" || x.st === "Disewa").length} tayang</span>
        </div>
        <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 12 }}>Properti yang sedang tayang — klik untuk lihat detail.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
          {listings.map((l, i) => (
            <button key={l.t} onClick={() => { setListingModal(i); setListingEdit(false); }} style={{ display: "block", textAlign: "left", padding: 0, border: "1px solid var(--line)", borderRadius: 13, overflow: "hidden", background: "var(--surface)", cursor: "pointer", font: "inherit" }} className="adm-thumb">
              <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.img} alt={l.t} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <span style={{ position: "absolute", top: 8, left: 8, fontSize: ".64rem", fontWeight: 700, letterSpacing: ".05em", padding: ".22rem .55rem", borderRadius: 999, color: "#fff", background: ST_COLOR[l.st] || "var(--brand)" }}>{l.st.toUpperCase()}</span>
                <span style={{ position: "absolute", top: 8, right: 8, fontSize: ".64rem", fontWeight: 700, padding: ".22rem .5rem", borderRadius: 999, color: "var(--ink)", background: "rgba(255,255,255,.9)" }}>★ {l.rating}</span>
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontWeight: 600, fontSize: ".9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.t}</div>
                <div className="muted" style={{ fontSize: ".76rem", marginTop: 1 }}>{l.loc}</div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: ".88rem", color: "var(--brand)" }}>{l.price}</span>
                  <span className="muted" style={{ fontSize: ".72rem" }}>{l.views}× dilihat</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        <h3 className="display" style={{ fontSize: "1.05rem", fontWeight: 600, margin: "24px 0 4px" }}>Riwayat</h3>
        <p className="muted" style={{ fontSize: ".82rem", marginBottom: 12 }}>Properti yang sudah terjual atau tersewa.</p>
        {(() => {
          const sold = listings.filter((x) => ["Terjual", "Tersewa", "Habis"].includes(x.st));
          if (sold.length === 0) return <div style={{ padding: 22, textAlign: "center", borderRadius: 12, background: "var(--surface-2)", border: "1px dashed var(--line-2)", color: "var(--muted)", fontSize: ".86rem" }}>Belum ada properti yang terjual atau tersewa.</div>;
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
              {sold.map((h) => {
                const rented = h.st === "Tersewa";
                const col = rented ? "var(--jade)" : "var(--brand)";
                return (
                  <div key={h.id} style={{ border: "1px solid var(--line)", borderRadius: 13, overflow: "hidden", background: "var(--surface)" }}>
                    <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={h.img} alt={h.t} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(.28)" }} />
                      <span style={{ position: "absolute", inset: 0, background: "rgba(20,15,9,.34)" }} />
                      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                        <span style={{ transform: "rotate(-8deg)", border: `3px solid ${col}`, color: "#fff", background: `color-mix(in oklab, ${col} 78%, transparent)`, fontWeight: 800, fontSize: "1.15rem", letterSpacing: ".08em", textTransform: "uppercase", padding: ".3rem 1rem", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,.32)" }}>{h.st}</span>
                      </span>
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 600, fontSize: ".9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.t}</div>
                      <div className="muted" style={{ fontSize: ".76rem", marginTop: 1 }}>{h.loc}</div>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
                        <span className="mono" style={{ fontWeight: 700, fontSize: ".86rem", color: "var(--ink-2)" }}>{h.price}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </Card>
    </div>
  );

  const Editor = (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 18, alignItems: "stretch" }} className="adm-2">
      {/* LEFT column: create (top) + history (bottom) */}
      <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
        <Card>
          <H>Buat video listing</H>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["9:16", "16:9"] as const).map((o) => (
              <button key={o} onClick={() => setOrient(o)} style={{ ...btn(orient === o ? "brand" : "ghost"), padding: ".5rem 1rem" }}>{o === "9:16" ? "Vertikal 9:16" : "Horizontal 16:9"}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(116px, 1fr))", gap: 12, marginBottom: 14 }}>
            <div style={drop}><Ic d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z" s={22} /><div style={{ fontSize: ".82rem", marginTop: 6 }}>Unggah foto</div></div>
            <div style={drop}><Ic d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm6 3v6l5-3z" s={22} /><div style={{ fontSize: ".82rem", marginTop: 6 }}>Unggah video</div></div>
            <div style={drop}><Ic d="M6 2h9l5 5v14.2A.8.8 0 0 1 19.2 22H6a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 6 2Zm2 11h8v1.6H8zm0 3h6v1.6H8z" s={22} /><div style={{ fontSize: ".82rem", marginTop: 6 }}>Brosur / PDF<br />(opsional)</div></div>
            <div style={drop}><Ic d="M12 3v10.5a3.5 3.5 0 1 1-2-3.16V6h6V3h-4Z" s={22} /><div style={{ fontSize: ".82rem", marginTop: 6 }}>Audio / voice<br />(opsional)</div></div>
          </div>
          <label className="muted" style={{ fontSize: ".82rem", fontWeight: 600 }}>Deskripsi properti</label>
          <textarea rows={3} placeholder="Vila 4 kamar di Canggu, dekat pantai Berawa…" style={{ width: "100%", marginTop: 6, background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: 12, font: "inherit", fontSize: ".92rem", color: "var(--ink)", resize: "vertical" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
            <button style={btn("brand")} onClick={addJob}>✨ Generate video otomatis</button>
            <span className="muted" style={{ fontSize: ".84rem" }}>{isRendering ? `Sedang merender${queued.length ? ` · ${queued.length} menunggu di antrean` : ""} — Anda bisa langsung menambah video lain.` : "Durasi otomatis 45–90 detik, dirangkai oleh mesin."}</span>
          </div>
        </Card>
        <Card>
          <H>Riwayat video</H>
          <p className="muted" style={{ fontSize: ".84rem", marginTop: -8, marginBottom: 12 }}>Video yang sudah Anda buat akan muncul di sini.</p>
          <div style={{ padding: 22, textAlign: "center", borderRadius: 12, background: "var(--surface-2)", border: "1px dashed var(--line-2)", color: "var(--muted)", fontSize: ".86rem", lineHeight: 1.5 }}>Belum ada video — buat video pertama Anda dari panel di kiri.</div>
        </Card>
      </div>

      {/* RIGHT column: player + render queue */}
      <Card style={{ position: "sticky", top: 78, alignSelf: "start", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <H>Player</H>
          {jobs.length > 0 && <span className="muted" style={{ fontSize: ".76rem" }}>{doneCount} selesai · {queued.length} antre</span>}
        </div>
        {(() => {
          const focus = rendering || lastDone;
          const fo = focus ? focus.orient : orient;
          const fPoster = fo === "9:16" ? "/hero.webp" : "/about/hero.webp";
          return (
            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", background: "var(--ink)", position: "relative", aspectRatio: arCss(fo), maxHeight: 400, margin: "0 auto", width: fo === "9:16" ? "min(100%, 250px)" : "100%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fPoster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: !rendering && lastDone ? 1 : .38 }} />
              {rendering ? (
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: "clamp(8px,3vw,20px)" }}>
                  <div style={{ textAlign: "center", color: "#fff" }}>
                    <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="6" />
                      <circle cx="36" cy="36" r="30" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 30} strokeDashoffset={2 * Math.PI * 30 * (1 - rendering.pct / 100)} style={{ transition: "stroke-dashoffset .3s" }} />
                    </svg>
                    <div className="mono" style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: 8 }}>{rendering.pct}%</div>
                    <div style={{ fontSize: ".8rem", opacity: .85, marginTop: 2 }}>Merender…</div>
                  </div>
                </div>
              ) : lastDone ? (
                <button aria-label="Putar" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", border: "none", background: "rgba(20,15,9,.15)", cursor: "pointer" }}>
                  <span style={{ width: 62, height: 62, borderRadius: "50%", background: "rgba(255,255,255,.92)", color: "var(--ink)", display: "grid", placeItems: "center", boxShadow: "0 8px 24px rgba(0,0,0,.3)" }}><Ic d="M8 5v14l11-7z" s={26} /></span>
                </button>
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(255,255,255,.75)", textAlign: "center", padding: 24 }}>
                  <div><Ic d="M8 5v14l11-7z" s={30} /><div style={{ fontSize: ".84rem", marginTop: 6 }}>Video akan tampil di sini<br />setelah dibuat.</div></div>
                </div>
              )}
            </div>
          );
        })()}

        {!rendering && lastDone && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
              <Ic d="M8 5v14l11-7z" s={14} />
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--line)" }}><div style={{ width: "32%", height: "100%", borderRadius: 3, background: "var(--brand)" }} /></div>
              <span className="mono muted" style={{ fontSize: ".74rem" }}>0:20 / 1:02</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button style={{ ...btn("brand"), flex: 1, justifyContent: "center", display: "flex" }}>Unduh</button>
              <button style={{ ...btn("ghost"), flex: 1, justifyContent: "center", display: "flex" }}>Bagikan</button>
            </div>
            <div style={{ marginTop: 12, fontSize: ".82rem", color: "var(--good)", fontWeight: 600, textAlign: "center" }}>✓ Video {lastDone.orient} selesai dibuat</div>
          </>
        )}
        {rendering && (
          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "color-mix(in oklab, var(--brand) 8%, var(--surface-2))", border: "1px solid color-mix(in oklab, var(--brand) 22%, var(--line))" }}>
            <div style={{ fontWeight: 700, fontSize: ".86rem", color: "var(--brand)", marginBottom: 4 }}>Berjalan di latar belakang</div>
            <p className="muted" style={{ fontSize: ".82rem", margin: 0, lineHeight: 1.5 }}>Anda boleh berpindah menu atau menutup halaman — render tetap berjalan{queued.length ? `, dan ${queued.length} video lain menunggu di antrean` : ""}. Kami beri tahu saat selesai.</p>
          </div>
        )}
        {!rendering && !lastDone && (
          <p className="muted" style={{ fontSize: ".82rem", marginTop: 14, lineHeight: 1.5 }}>Unggah materi di kiri lalu tekan <strong style={{ color: "var(--ink)" }}>Generate</strong>. Anda bisa mengantre beberapa video sekaligus — dirender satu per satu di latar belakang.</p>
        )}

        {jobs.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="muted" style={{ fontSize: ".76rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Antrean render</span>
              {doneCount > 0 && <button onClick={clearFinished} style={{ ...btn("ghost"), padding: ".25rem .6rem", fontSize: ".74rem" }}>Bersihkan selesai</button>}
            </div>
            <div style={{ display: "grid", gap: 7 }}>
              {jobs.map((j) => (
                <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", borderRadius: 9, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, flex: "none", display: "grid", placeItems: "center", background: j.status === "done" ? "var(--good)" : j.status === "rendering" ? "var(--brand)" : "var(--line-2)", color: "#fff" }}>
                    {j.status === "done" ? <Ic d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.42z" s={13} /> : <Ic d="M8 5v14l11-7z" s={12} />}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: ".84rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.label}</span>
                  <span className="mono" style={{ flex: "none", fontSize: ".74rem", fontWeight: 700, color: j.status === "done" ? "var(--good)" : j.status === "rendering" ? "var(--brand)" : "var(--muted)" }}>
                    {j.status === "done" ? "Selesai" : j.status === "rendering" ? `${j.pct}%` : `Antre #${queued.findIndex((q) => q.id === j.id) + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  const platFmt = PLATFORMS.find((p) => p.id === platform)?.fmt ?? "1:1";
  const RAIL = ["M12 21 4 13a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3z", "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", "M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"];
  // Social-media style 9:16 content card (mimics the platform post UI)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentCard = (item: any, i: number, kind: "ready" | "history") => {
    const pi = PLAT_ICON[item.plat] || PLAT_ICON.Blog;
    const clickable = kind === "ready";
    const open = clickable ? () => { setContentModal(i); setContentSched(false); } : undefined;
    // BLOG = article preview (not a social post)
    if (item.plat === "Blog") {
      return (
        <div key={item.t} onClick={open} role={clickable ? "button" : undefined} tabIndex={clickable ? 0 : undefined} className={clickable ? "adm-thumb" : undefined}
          style={{ gridColumn: "1 / -1", display: "flex", gap: 12, padding: 10, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", cursor: clickable ? "pointer" : "default" }}>
          <div style={{ width: 132, aspectRatio: "16 / 9", borderRadius: 9, overflow: "hidden", flex: "none", background: "var(--surface)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: kind === "history" && !item.posted ? "grayscale(.5)" : "none" }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: ".64rem", fontWeight: 700, color: "var(--brand)" }}><span style={{ display: "grid", placeItems: "center", width: 16, height: 16, borderRadius: 4, background: pi.c, color: "#fff" }}><Ic d={pi.d} s={10} /></span>Blog / Artikel</span>
              {kind === "ready"
                ? <span style={{ fontSize: ".6rem", fontWeight: 700, color: "var(--warn)", background: "color-mix(in oklab, var(--warn) 14%, var(--surface))", padding: ".18rem .5rem", borderRadius: 999 }}>Menunggu</span>
                : <span className="muted mono" style={{ fontSize: ".72rem", whiteSpace: "nowrap" }}>{item.posted ? item.date : "Draf"}</span>}
            </div>
            <div style={{ fontWeight: 600, fontSize: ".92rem", lineHeight: 1.3, margin: "4px 0 3px" }}>{item.t}</div>
            <div className="muted" style={{ fontSize: ".76rem" }}>{item.meta || (item.posted ? "Dipost ke blog" : "Belum dipost")}</div>
            {clickable && <div style={{ marginTop: 6, fontSize: ".78rem", fontWeight: 600, color: "var(--brand)" }}>Kelola — publish, jadwalkan, tolak →</div>}
          </div>
        </div>
      );
    }
    // SOCIAL platforms — correct AR per platform (YouTube 16:9, Facebook 1:1, TikTok/IG/Shorts 9:16)
    const ar = PLAT_AR[item.plat] || "9 / 16";
    const vertical = ar === "9 / 16";
    const fullRow = ar === "16 / 9";
    return (
      <div key={item.t} onClick={open} role={clickable ? "button" : undefined} tabIndex={clickable ? 0 : undefined}
        style={{ position: "relative", aspectRatio: ar, gridColumn: fullRow ? "1 / -1" : "auto", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", cursor: clickable ? "pointer" : "default", background: "var(--ink)", color: "#fff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: kind === "history" && !item.posted ? "grayscale(.5) brightness(.8)" : "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "10px 10px 22px", background: "linear-gradient(180deg, rgba(0,0,0,.55), transparent)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: ".6rem", fontWeight: 700, background: "rgba(0,0,0,.32)", backdropFilter: "blur(4px)", padding: ".2rem .5rem .2rem .26rem", borderRadius: 999 }}><span style={{ display: "grid", placeItems: "center", width: 16, height: 16, borderRadius: "50%", background: pi.c, color: "#fff" }}><Ic d={pi.d} s={10} /></span>{item.plat}</span>
          {kind === "ready"
            ? <span style={{ fontSize: ".56rem", fontWeight: 700, background: "var(--warn)", color: "#fff", padding: ".2rem .45rem", borderRadius: 999 }}>Menunggu</span>
            : <span style={{ fontSize: ".56rem", fontWeight: 700, background: item.posted ? "var(--good)" : "rgba(255,255,255,.25)", color: "#fff", padding: ".2rem .45rem", borderRadius: 999 }}>{item.posted ? "Terbit" : "Draf"}</span>}
        </div>
        {vertical && <div style={{ position: "absolute", right: 7, bottom: 88, display: "grid", gap: 13, justifyItems: "center", filter: "drop-shadow(0 1px 3px rgba(0,0,0,.6))" }}>{RAIL.map((d, k) => <Ic key={k} d={d} s={19} />)}</div>}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: `${vertical ? 36 : 26}px 12px 12px`, background: "linear-gradient(0deg, rgba(0,0,0,.82), transparent)" }}>
          <div style={{ fontWeight: 700, fontSize: ".74rem" }}>@kirana.property</div>
          <div style={{ fontSize: ".82rem", fontWeight: 600, lineHeight: 1.28, margin: "3px 0 4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.t}</div>
          <div style={{ fontSize: ".66rem", opacity: .82 }}>{item.meta || (item.posted ? item.date : "Belum dipost")}</div>
        </div>
      </div>
    );
  };

  const Content = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }} className="adm-2">
      {/* LEFT: write */}
      <Card>
        <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 4, marginBottom: 14 }}>
          {([["write", "Tulis konten"], ["draft", `Draft by Cakra${drafts.length ? ` (${drafts.length})` : ""}`]] as const).map(([id, l]) => (
            <button key={id} onClick={() => setWriteTab(id)} style={{ border: "none", cursor: "pointer", font: "inherit", fontWeight: 600, fontSize: ".82rem", padding: ".42rem .9rem", borderRadius: 999, background: writeTab === id ? "var(--brand)" : "transparent", color: writeTab === id ? "#fff" : "var(--muted)" }}>{l}</button>
          ))}
        </div>
        {writeTab === "write" ? (
          <>
            <input value={writeTitle} onChange={(e) => setWriteTitle(e.target.value)} placeholder="Judul konten" style={{ width: "100%", marginBottom: 10, background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: ".7rem 1rem", font: "inherit", color: "var(--ink)" }} />
            <textarea value={writeBody} onChange={(e) => setWriteBody(e.target.value)} rows={5} placeholder="Mulai menulis, atau klik ‘Buat draf AI’…" style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: 12, font: "inherit", fontSize: ".92rem", color: "var(--ink)", resize: "vertical" }} />
            <label className="muted" style={{ fontSize: ".82rem", fontWeight: 600, display: "block", margin: "14px 0 8px" }}>Pilih platform <span style={{ fontWeight: 500 }}>— aset disortir sesuai ukuran</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORMS.map((p) => (
                <button key={p.id} onClick={() => setPlatform(p.id)} style={{ font: "inherit", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", padding: ".4rem .75rem", borderRadius: 999, border: `1px solid ${platform === p.id ? "var(--brand)" : "var(--line-2)"}`, background: platform === p.id ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: platform === p.id ? "var(--brand)" : "var(--ink-2)" }}>{p.id} <span className="mono" style={{ opacity: .55 }}>{p.fmt}</span></button>
              ))}
            </div>
            <label className="muted" style={{ fontSize: ".82rem", fontWeight: 600, display: "block", margin: "14px 0 8px" }}>Aset {platFmt} untuk {platform}</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(78px,1fr))", gap: 8 }}>
              <button type="button" onClick={() => setSec("assets")} style={{ ...drop, aspectRatio: arCss(platFmt), display: "grid", placeItems: "center", padding: 4, fontSize: ".68rem", cursor: "pointer", font: "inherit" }}>+ Pilih dari Aset</button>
            </div>
            <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "color-mix(in oklab, var(--brand) 8%, var(--surface-2))", border: "1px solid color-mix(in oklab, var(--brand) 20%, var(--line))" }}>
              <div style={{ fontWeight: 700, fontSize: ".82rem", color: "var(--brand)", marginBottom: 6 }}>💡 Ide dari sistem</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 5 }}>
                {CONTENT_TIPS.map((t) => <li key={t} className="muted" style={{ fontSize: ".84rem", lineHeight: 1.5 }}>{t}</li>)}
              </ul>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}><button style={btn("brand")}>✨ Buat draf AI</button><button style={btn("ghost")}>Terbitkan</button></div>
          </>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <p className="muted" style={{ fontSize: ".84rem", margin: 0, lineHeight: 1.5 }}>Rekomendasi konten harian dari <b style={{ color: "var(--ink)" }}>cakra Hub</b> — sudah disesuaikan dengan gaya bahasa &amp; persona Anda. Pilih satu, lalu buat sebagai blog, carousel, atau video 9:16.</p>
            {drafts.length === 0 ? (
              <div style={{ padding: 26, textAlign: "center", borderRadius: 12, background: "var(--surface-2)", border: "1px dashed var(--line-2)", color: "var(--muted)", fontSize: ".86rem", lineHeight: 1.5 }}>Rekomendasi harian sedang disiapkan — muncul otomatis setiap hari, disesuaikan dengan persona Anda.</div>
            ) : drafts.map((d) => (
              <button key={d.id} onClick={() => setDraftOpen(d)} className="adm-thumb" style={{ textAlign: "left", cursor: "pointer", font: "inherit", padding: 14, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", width: "100%" }}>
                <span style={{ fontSize: ".64rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--brand)" }}>{draftLabel(d)}</span>
                <div style={{ fontWeight: 700, fontSize: ".95rem", margin: "3px 0 5px", lineHeight: 1.3, color: "var(--ink)" }}>{d.title}</div>
                <p className="muted" style={{ fontSize: ".82rem", margin: "0 0 8px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.content?.caption || d.body}</p>
                <span style={{ fontSize: ".76rem", fontWeight: 600, color: "var(--brand)" }}>Buka detail &amp; pilih format →</span>
              </button>
            ))}
          </div>
        )}
      </Card>
      {/* RIGHT: konten siap + riwayat */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <H>Konten siap</H>
          <input ref={kontenRef} type="file" accept="image/*,video/*" multiple onChange={(e) => uploadKonten(e.target.files)} style={{ display: "none" }} />
          <button onClick={() => kontenRef.current?.click()} style={{ ...btn("ghost"), padding: ".5rem .9rem", fontSize: ".82rem", whiteSpace: "nowrap" }}>⬆ Upload konten</button>
        </div>
        <p className="muted" style={{ fontSize: ".86rem", marginTop: 2, marginBottom: 12 }}>Draf dari sistem, buatan Anda, atau konten dari luar yang Anda unggah — klik untuk kelola. {kontenUp && <b style={{ color: kontenUp.includes("✓") ? "var(--good)" : "var(--ink)" }}>{kontenUp}</b>}</p>
        <style>{`@keyframes admSpin{to{transform:rotate(360deg)}}`}</style>
        {generating.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {generating.map((g) => (
              <ProducedCard key={g.id} item={g} brand={brand} contact={contact} onView={(p) => setViewPiece(p)} onRemove={(id) => setGenerating((x) => x.filter((y) => y.id !== id))} />
            ))}
          </div>
        ) : (
          <div style={{ padding: 26, textAlign: "center", borderRadius: 12, background: "var(--surface-2)", border: "1px dashed var(--line-2)", color: "var(--muted)", fontSize: ".86rem", lineHeight: 1.5 }}>Belum ada konten jadi. Pilih rekomendasi di tab <b style={{ color: "var(--ink)" }}>Draft by Cakra</b>, lalu buat sebagai blog, carousel, atau video 9:16 — hasilnya muncul di sini, siap diunduh.</div>
        )}
      </Card>

      {/* Draft by Cakra — long detail popup + choose a format to generate */}
      {draftOpen && (
        <div onClick={() => setDraftOpen(null)} style={{ position: "fixed", inset: 0, zIndex: 130, background: "rgba(20,15,9,.6)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: "min(680px, 96vw)", maxHeight: "88vh", overflow: "auto", padding: 0 }}>
            <div style={{ position: "sticky", top: 0, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--line)", gap: 10, zIndex: 2 }}>
              <span style={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--brand)" }}>{draftLabel(draftOpen)} · rekomendasi cakra</span>
              <button onClick={() => setDraftOpen(null)} aria-label="Tutup" style={{ flex: "none", width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "18px 22px" }}>
              <h2 className="display" style={{ fontSize: "clamp(1.3rem,3.4vw,1.7rem)", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.2 }}>{draftOpen.title}</h2>
              {String(draftOpen.content?.body || draftOpen.body || "").split("\n").map((s: string) => s.trim()).filter(Boolean).map((para: string, i: number) => (
                <p key={i} style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--ink-2)", margin: "0 0 12px" }}>{para}</p>
              ))}
              {draftOpen.content?.caption && draftOpen.content.caption !== draftOpen.body && (
                <div style={{ marginTop: 8, padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                  <div className="muted" style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".04em", marginBottom: 4 }}>CAPTION</div>
                  <p style={{ margin: 0, fontSize: ".92rem", lineHeight: 1.6, color: "var(--ink-2)" }}>{draftOpen.content.caption}</p>
                </div>
              )}
              {Array.isArray(draftOpen.content?.hashtags) && draftOpen.content.hashtags.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {draftOpen.content.hashtags.map((h: string, i: number) => <span key={i} style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--brand)" }}>{String(h).startsWith("#") ? h : "#" + h}</span>)}
                </div>
              )}
            </div>
            <div style={{ position: "sticky", bottom: 0, background: "var(--surface)", borderTop: "1px solid var(--line)", padding: "14px 20px" }}>
              <div className="muted" style={{ fontSize: ".78rem", fontWeight: 600, marginBottom: 10 }}>Buat dari rekomendasi ini — otomatis oleh AI:</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => { useDraft(draftOpen, "blog"); setDraftOpen(null); }} style={{ ...btn("brand"), flex: "1 1 30%", justifyContent: "center", display: "flex", minWidth: 130 }}>📝 Blog</button>
                <button onClick={() => { useDraft(draftOpen, "carousel"); setDraftOpen(null); }} style={{ ...btn("ghost"), flex: "1 1 30%", justifyContent: "center", display: "flex", minWidth: 130 }}>🖼 Carousel</button>
                <button onClick={() => { useDraft(draftOpen, "video"); setDraftOpen(null); }} style={{ ...btn("ghost"), flex: "1 1 30%", justifyContent: "center", display: "flex", minWidth: 150 }}>🎬 Video 9:16 · 30–60 dtk</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Produced asset — full reader (blog) or downloadable slide gallery (carousel / video) */}
      {viewPiece && (() => {
        const fmt = viewPiece.content?.format;
        const imgs2 = (fmt === "carousel" || fmt === "video") ? imagesFor(viewPiece, brand, contact) : [];
        return (
          <div onClick={() => setViewPiece(null)} style={{ position: "fixed", inset: 0, zIndex: 140, background: "rgba(20,15,9,.6)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: "min(720px, 96vw)", maxHeight: "88vh", overflow: "auto", padding: 0 }}>
              <div style={{ position: "sticky", top: 0, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--line)", gap: 10, zIndex: 2 }}>
                <span style={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--brand)" }}>{FMT_LABEL[fmt] || fmt} · dibuat oleh cakra</span>
                <button onClick={() => setViewPiece(null)} aria-label="Tutup" style={{ flex: "none", width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ padding: "18px 22px" }}>
                <h2 className="display" style={{ fontSize: "clamp(1.3rem,3.4vw,1.7rem)", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.25 }}>{viewPiece.title}</h2>
                {fmt === "blog" ? (
                  <>
                    {(viewPiece.content?.sections || []).map((s: any, i: number) => (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px" }}>{s.h}</h3>
                        {String(s.body || "").split("\n").map((x: string) => x.trim()).filter(Boolean).map((para: string, j: number) => <p key={j} style={{ fontSize: ".98rem", lineHeight: 1.7, color: "var(--ink-2)", margin: "0 0 10px" }}>{para}</p>)}
                      </div>
                    ))}
                    {Array.isArray(viewPiece.content?.key_takeaways) && viewPiece.content.key_takeaways.length > 0 && (
                      <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", marginBottom: 14 }}>
                        <div className="muted" style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".04em", marginBottom: 6 }}>POIN PENTING</div>
                        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>{viewPiece.content.key_takeaways.map((t: string, i: number) => <li key={i} style={{ fontSize: ".9rem", lineHeight: 1.5, color: "var(--ink-2)" }}>{t}</li>)}</ul>
                      </div>
                    )}
                    {viewPiece.content?.cta && <p style={{ fontSize: ".98rem", lineHeight: 1.6, fontWeight: 600, color: "var(--ink)", margin: "0 0 12px" }}>{viewPiece.content.cta}</p>}
                  </>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: fmt === "video" ? "repeat(auto-fill, minmax(140px,1fr))" : "repeat(auto-fill, minmax(180px,1fr))", gap: 10, marginBottom: 14 }}>
                      {imgs2.map((src, i) => (
                        <div key={i} style={{ display: "grid", gap: 6 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--line)" }} />
                          <button onClick={() => dlImg(src, `cakra-${fmt}-${i + 1}.png`)} style={{ font: "inherit", fontSize: ".74rem", fontWeight: 600, padding: ".35rem", borderRadius: 8, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>⬇ Slide {i + 1}</button>
                        </div>
                      ))}
                    </div>
                    {viewPiece.content?.caption && (
                      <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", marginBottom: 12 }}>
                        <div className="muted" style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".04em", marginBottom: 4 }}>CAPTION</div>
                        <p style={{ margin: 0, fontSize: ".92rem", lineHeight: 1.6, color: "var(--ink-2)", whiteSpace: "pre-wrap" }}>{viewPiece.content.caption}</p>
                      </div>
                    )}
                  </>
                )}
                {Array.isArray(viewPiece.content?.hashtags) && viewPiece.content.hashtags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                    {viewPiece.content.hashtags.map((h: string, i: number) => <span key={i} style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--brand)" }}>{String(h).startsWith("#") ? h : "#" + h}</span>)}
                  </div>
                )}
              </div>
              <div style={{ position: "sticky", bottom: 0, background: "var(--surface)", borderTop: "1px solid var(--line)", padding: "12px 20px", display: "flex", gap: 10, flexWrap: "wrap" }}>
                {fmt === "blog"
                  ? <button onClick={() => { try { navigator.clipboard.writeText(`${viewPiece.title}\n\n${viewPiece.body}`); } catch {} }} style={{ ...btn("brand"), flex: 1, justifyContent: "center", display: "flex" }}>⧉ Salin artikel</button>
                  : <button onClick={() => imgs2.forEach((src, i) => setTimeout(() => dlImg(src, `cakra-${fmt}-${i + 1}.png`), i * 200))} style={{ ...btn("brand"), flex: 1, justifyContent: "center", display: "flex" }}>⬇ Unduh semua ({imgs2.length})</button>}
                <button onClick={() => setViewPiece(null)} style={{ ...btn("ghost"), justifyContent: "center", display: "flex" }}>Tutup</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );

  const tabPill = (on: boolean): React.CSSProperties => ({ font: "inherit", fontSize: ".9rem", fontWeight: 600, cursor: "pointer", padding: ".55rem 1.1rem", borderRadius: 999, border: `1px solid ${on ? "var(--brand)" : "var(--line-2)"}`, background: on ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: on ? "var(--brand)" : "var(--ink-2)" });
  const Assets = (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {([["gambar", "Gambar"], ["video", "Video"], ["bgm", "Musik / BGM"], ["voice", "Voice karakter"]] as const).map(([id, l]) => (
          <button key={id} onClick={() => setAssetTab(id)} style={tabPill(assetTab === id)}>{l}</button>
        ))}
      </div>

      {assetTab === "gambar" && (
        <Card>
          <H>Gambar siap pakai</H>
          <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 14 }}>Pustaka gambar properti cakra + unggahan Anda. Filter lalu salin URL untuk listing, konten, atau video.</p>
          <AssetLibrary kind="image" canUpload />
        </Card>
      )}

      {assetTab === "video" && (
        <Card>
          <H>Video b-roll</H>
          <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 14 }}>Klip b-roll cakra (loopable) + unggahan Anda — arahkan untuk pratinjau, klik untuk potong per rasio (16:9 / 1:1 / 9:16), salin URL untuk reels, story, atau presentasi.</p>
          <AssetLibrary kind="video" canUpload />
        </Card>
      )}

      {assetTab === "bgm" && (
        <Card>
          <H>Musik latar (BGM)</H>
          <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 16 }}>BGM cakra + audio unggahan Anda — dengar, filter, salin URL, atau unggah trek sendiri.</p>
          <AssetLibrary kind="audio" canUpload />
        </Card>
      )}

      {assetTab === "voice" && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
            <H>Voice karakter</H>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".74rem", fontWeight: 700, color: "var(--muted)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--good)" }} /> Ditenagai ElevenLabs
            </span>
          </div>
          <p className="muted" style={{ fontSize: ".86rem", marginTop: 2, marginBottom: 16, lineHeight: 1.5 }}>Dengarkan shortlist yang dikurasikan untuk persona Anda, lalu pilih 1 suara perempuan &amp; 1 suara laki-laki untuk brand Anda.</p>
          <VoiceLibrary mode="pick" user={user} />
        </Card>
      )}
    </div>
  );

  const Profile = (
    <div style={{ display: "grid", gap: 18, maxWidth: 720 }}>
      <Card>
        <H>Koneksi akun</H>
        {([["Email", user.email || "—", !!user.email], ["Domain", hostLabel, true], ["WhatsApp", contact ? `+${contact}` : "Belum diisi", !!contact], ["Instagram", builder.instagram ? `@${builder.instagram}` : "Belum dihubungkan", !!builder.instagram], ["TikTok", builder.tiktok ? `@${builder.tiktok}` : "Belum dihubungkan", !!builder.tiktok], ["YouTube", builder.youtube || "Belum dihubungkan", !!builder.youtube]] as [string, string, boolean][]).map(([k, v, on]) => (
          <div key={k as string} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
            <div><div style={{ fontWeight: 600, fontSize: ".92rem" }}>{k}</div><div className="muted" style={{ fontSize: ".84rem" }}>{v}</div></div>
            {on ? <span style={{ color: "var(--good)", fontSize: ".85rem", fontWeight: 600 }}>✓ Terhubung</span> : <button style={{ ...btn("ghost"), padding: ".4rem .9rem", fontSize: ".84rem" }}>Hubungkan</button>}
          </div>
        ))}
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="adm-2">
        <Card>
          <H>Tagihan</H>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Paket {prof?.plan ? prof.plan.charAt(0).toUpperCase() + prof.plan.slice(1) : "Trial"}</div>
          <div className="muted" style={{ fontSize: ".9rem" }}>Kelola langganan &amp; metode pembayaran Anda.</div>
          <button style={{ ...btn("ghost"), marginTop: 12 }}>Kelola tagihan</button>
        </Card>
        <Card>
          <H>Keamanan</H>
          {[["Kata sandi", "Ubah"], ["OTP via WhatsApp", "Aktif"], ["Autentikasi dua faktor", "Aktifkan"]].map(([k, a]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: ".92rem" }}>{k}</span><button style={{ ...btn("ghost"), padding: ".35rem .8rem", fontSize: ".82rem" }}>{a}</button>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <H>Legal</H>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <a href="/privacy" className="gold" style={{ textDecoration: "none", fontWeight: 600 }}>Kebijakan Privasi →</a>
          <a href="/terms" className="gold" style={{ textDecoration: "none", fontWeight: 600 }}>Syarat & Ketentuan →</a>
        </div>
      </Card>
    </div>
  );

  // ---------- Web Builder ----------
  const bRad = B_RADII.find((x) => x.id === builder.radius)!;
  const bFont = B_FONTS.find((x) => x.id === builder.fontId)!;
  const bPal = B_PALETTES.find((x) => x.id === builder.paletteId)!;
  const bDen = B_DENSITIES.find((x) => x.id === builder.density) || B_DENSITIES[0];
  const bSty = B_STYLES.find((x) => x.id === builder.styleId)!;
  const bCopy = B_TONE_COPY[builder.tone];
  const pageBg = builder.bg === "gradient"
    ? `linear-gradient(160deg, color-mix(in oklab, ${bPal.brand} 14%, ${bPal.bg}), color-mix(in oklab, ${bPal.accent} 22%, ${bPal.bg}))`
    : bPal.bg;
  // hero stays CONSISTENT across bg modes — background mode only affects the page + section bands, never the hero
  const heroBg = `linear-gradient(118deg, ${bPal.brand}, color-mix(in oklab, ${bPal.brand} 62%, #000))`;
  const bandBg = builder.bg === "mono" ? bPal.bg : builder.bg === "gradient" ? "transparent" : bPal.surface;
  const pvVars = { "--pv-brand": bPal.brand, "--pv-accent": bPal.accent, "--pv-ink": bPal.ink, "--pv-bg": bPal.bg, "--pv-surface": bPal.surface } as React.CSSProperties;
  const capCss = (): React.CSSProperties => ({ textTransform: bSty.caps ? "uppercase" : "none", letterSpacing: bSty.caps ? ".14em" : ".08em" });
  const socialChips = [
    ["Instagram", builder.instagram, "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z"],
    ["TikTok", builder.tiktok, "M14 3c.3 2.2 1.7 3.9 4 4.2v2.5c-1.5 0-2.9-.5-4-1.3v5.9a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 1 0 1.8 2.5V3H14Z"],
    ["YouTube", builder.youtube, "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z"],
    ["Facebook", builder.facebook, "M13 22v-8h2.7l.4-3H13V9c0-.9.3-1.5 1.6-1.5H16V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.9V11H7.5v3H10v8h3Z"],
  ].filter((x) => x[1]) as [string, string, string][];

  // publish → carry the applied look to the live public site via URL (works cross-origin, no backend yet)
  const LIVE_BASE = "https://cakra.xyz/demo";
  // Free preview stays "live" for 7 days from first publish (like Supabase's free-tier pause);
  // the paid "Optimasi AI" step makes it real + permanent. Tracked per-device for now.
  const siteExp = () => { try { const k = `cakra_site_start_${user.id}`; let s = localStorage.getItem(k); if (!s) { s = String(Date.now()); localStorage.setItem(k, s); } return parseInt(s, 10) + 7 * 24 * 60 * 60 * 1000; } catch { return Date.now() + 7 * 24 * 60 * 60 * 1000; } };
  const siteCfg = () => ({
    aid: user.id,
    exp: siteExp(),
    brand: builder.brand,
    ini: (builder.brand.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2) || "K").toUpperCase(),
    col: { em: bPal.brand, go: bPal.accent, bg: bPal.bg, ink: bPal.ink },
    r: { r: bRad.card, s: bRad.btn },
    font: { d: bFont.display, b: bFont.body },
    bg: builder.bg, dec: builder.decoration, set: builder.tone, den: builder.density, sty: builder.styleId,
    soc: { wa: builder.wa, ig: builder.instagram, tt: builder.tiktok, yt: builder.youtube, fb: builder.facebook },
  });
  const encodeSite = () => { try { return btoa(encodeURIComponent(JSON.stringify(siteCfg()))); } catch { return ""; } };
  const viewLive = () => { try { window.open(`${LIVE_BASE}#site=${encodeSite()}`, "_blank", "noopener"); } catch {} };
  const publishSite = () => {
    try {
      localStorage.setItem("cakra-builder", JSON.stringify(persistable(builder)));
      localStorage.setItem("cakra-builder-published", encodeSite());
      const at = new Date().toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      localStorage.setItem("cakra-builder-published-at", at);
      setPublished(at); setBuilderSaved(true);
    } catch {}
    viewLive();
  };

  const segBtn = (on: boolean): React.CSSProperties => ({ font: "inherit", fontSize: ".82rem", fontWeight: 600, cursor: "pointer", padding: ".48rem .85rem", borderRadius: 10, border: `1px solid ${on ? "var(--brand)" : "var(--line-2)"}`, background: on ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: on ? "var(--brand)" : "var(--ink-2)", transition: ".15s" });
  const bInp: React.CSSProperties = { width: "100%", padding: ".6rem .75rem", borderRadius: 10, border: "1px solid var(--line-2)", background: "var(--surface-2)", color: "var(--ink)", font: "inherit", fontSize: ".88rem" };
  const bField = (label: string, node: React.ReactNode, hint?: string) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--ink-2)" }}>{label}</span>
        {hint && <span className="muted" style={{ fontSize: ".72rem" }}>{hint}</span>}
      </div>
      {node}
    </div>
  );

  const acc = (id: string, title: string, children: React.ReactNode, hint?: string) => (
    <details className="bld-acc" open={!!accOpen[id]} onToggle={(e) => { const el = (e.currentTarget || e.target) as HTMLDetailsElement | null; if (el) setAccOpen((s) => (s[id] === el.open ? s : { ...s, [id]: el.open })); }}>
      <summary><span>{title}{hint && <span className="bld-acc-hint">{hint}</span>}</span><span className="bld-chev"><Ic d="m6 9 6 6 6-6" s={16} /></span></summary>
      <div className="bld-acc-body">{children}</div>
    </details>
  );
  const imgSlot = (key: string, label: string, hint: string, def?: string) => {
    const shown = builder.imgs[key] || def;
    return (
      <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 72, height: 50, borderRadius: 8, flex: "none", overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--muted)" }}>
          {shown ? <img src={shown} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Ic d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z" s={18} />}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: ".86rem", fontWeight: 600 }}>{label}</div>
          <div className="muted" style={{ fontSize: ".74rem" }}>{builder.imgs[key] ? "Foto Anda · terunggah" : "Gambar default in-house"}</div>
        </div>
        <label style={{ ...btn("ghost"), padding: ".4rem .8rem", fontSize: ".8rem", cursor: "pointer" }}>
          {builder.imgs[key] ? "Ganti" : "Unggah"}
          <input type="file" accept="image/*" onChange={onImg(key)} style={{ display: "none" }} />
        </label>
        {builder.imgs[key] && <button onClick={() => clearImg(key)} title="Kembali ke default" style={{ ...btn("ghost"), padding: ".4rem .55rem", fontSize: ".8rem", color: "var(--muted)" }}>✕</button>}
      </div>
    );
  };

  const Builder = (
    <>
      <style>{`
        .bld-grid{ display:grid; grid-template-columns: minmax(320px,380px) minmax(0,1fr); gap:18px; align-items:start; }
        .bld-preview{ position:sticky; top:80px; }
        .bld-acc{ border:1px solid var(--line); border-radius:14px; background:var(--surface); overflow:hidden; }
        .bld-acc > summary{ list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:10px; padding:15px 18px; font-weight:600; font-size:.98rem; color:var(--ink); }
        .bld-acc > summary::-webkit-details-marker{ display:none; }
        .bld-acc-hint{ font-weight:500; font-size:.74rem; color:var(--muted); margin-left:8px; }
        .bld-chev{ color:var(--muted); transition:transform .2s ease; flex:none; display:inline-flex; }
        .bld-acc[open] > summary .bld-chev{ transform:rotate(180deg); }
        .bld-acc[open] > summary{ border-bottom:1px solid var(--line); }
        .bld-acc-body{ padding:18px; }
        @media (max-width:960px){ .bld-grid{ grid-template-columns:1fr; } .bld-preview{ position:static; } }
      `}</style>
      <div className="bld-grid">
        {/* ---------------- Controls ---------------- */}
        <div style={{ display: "grid", gap: 12 }}>
          {acc("logo", "Logo & meta situs", <>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
              <span style={{ width: 60, height: 60, borderRadius: 14, flex: "none", display: "grid", placeItems: "center", overflow: "hidden", background: builder.logo ? "var(--surface-2)" : bPal.brand, color: "#fff", fontWeight: 700, fontSize: "1.5rem", border: "1px solid var(--line)" }}>
                {builder.logo ? <img src={builder.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (builder.brand[0] || "K")}
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input ref={logoInput} type="file" accept="image/*" onChange={onLogo} style={{ display: "none" }} />
                <button style={{ ...btn("ghost"), padding: ".5rem .9rem", fontSize: ".84rem" }} onClick={() => logoInput.current?.click()}>Unggah logo</button>
                {builder.logo && <button style={{ ...btn("ghost"), padding: ".5rem .9rem", fontSize: ".84rem", color: "var(--muted)" }} onClick={() => setB({ logo: "" })}>Hapus</button>}
              </div>
            </div>
            {bField("Nama brand", <input style={bInp} value={builder.brand} onChange={(e) => setB({ brand: e.target.value })} placeholder="Kirana" />)}
            {bField("Tagline", <input style={bInp} value={builder.tagline} onChange={(e) => setB({ tagline: e.target.value })} placeholder="Spesialis Properti Premium" />)}
            {bField("Judul meta (title tag)", <input style={bInp} value={builder.metaTitle} onChange={(e) => setB({ metaTitle: e.target.value })} maxLength={70} />, `${builder.metaTitle.length}/60 ideal`)}
            {bField("Deskripsi meta", <textarea style={{ ...bInp, resize: "vertical", minHeight: 74, lineHeight: 1.5 }} value={builder.metaDesc} onChange={(e) => setB({ metaDesc: e.target.value })} maxLength={180} />, `${builder.metaDesc.length}/155 ideal`)}
          </>)}

          {acc("gambar", "Gambar situs", <>
            <p className="muted" style={{ fontSize: ".84rem", marginTop: -4, marginBottom: 14 }}>Ganti gambar situs kapan saja dengan foto Anda sendiri. Default memakai pustaka aset in-house cakra.</p>
            <div style={{ display: "grid", gap: 14 }}>{IMAGE_SLOTS.map((s) => imgSlot(s.key, s.label, s.hint, s.def))}</div>
            <p className="muted" style={{ fontSize: ".8rem", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)", lineHeight: 1.5 }}>📷 Foto listing otomatis mengikuti dari menu <b style={{ color: "var(--ink)" }}>Listing</b> — tidak perlu diunggah terpisah di sini.</p>
          </>, "2 slot")}

          {acc("layout", "Bentuk & tata letak", <>
            {bField("Bentuk sudut", <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{B_RADII.map((o) => <button key={o.id} onClick={() => setB({ radius: o.id })} style={segBtn(builder.radius === o.id)}>{o.label}</button>)}</div>)}
            {bField("Kerapatan", <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{B_DENSITIES.map((o) => <button key={o.id} onClick={() => setB({ density: o.id })} style={segBtn(builder.density === o.id)}>{o.label}</button>)}</div>, "Paragraf · jarak · padding")}
            {bField("Gaya kartu", <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{B_STYLES.map((o) => <button key={o.id} onClick={() => setB({ styleId: o.id })} style={segBtn(builder.styleId === o.id)}>{o.label}</button>)}</div>)}
          </>)}

          {acc("latar", "Latar & dekorasi", <>
            {bField("Latar", <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{B_BGS.map((o) => <button key={o.id} onClick={() => setB({ bg: o.id })} style={segBtn(builder.bg === o.id)}>{o.label}</button>)}</div>)}
            {bField("Dekorasi latar", <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{B_DECOR.map((o) => <button key={o.id} onClick={() => setB({ decoration: o.id })} style={segBtn(builder.decoration === o.id)}>{o.label}</button>)}</div>, "Pesawat kertas, pena, titik…")}
          </>, "Mono/dual/gradasi · motif")}

          {acc("warna", "Warna & huruf", <>
            {bField("Palet warna", <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{B_PALETTES.map((p) => {
              const on = builder.paletteId === p.id;
              return <button key={p.id} onClick={() => setB({ paletteId: p.id })} style={{ display: "flex", alignItems: "center", gap: 9, padding: ".5rem .6rem", borderRadius: 10, cursor: "pointer", font: "inherit", fontSize: ".8rem", fontWeight: 600, textAlign: "left", border: `1px solid ${on ? "var(--brand)" : "var(--line-2)"}`, background: on ? "color-mix(in oklab, var(--brand) 10%, var(--surface))" : "transparent", color: "var(--ink)" }}>
                <span style={{ display: "flex", flex: "none", boxShadow: "0 1px 3px rgba(0,0,0,.15)", borderRadius: 999, overflow: "hidden" }}><span style={{ width: 15, height: 15, background: p.brand }} /><span style={{ width: 15, height: 15, background: p.accent }} /><span style={{ width: 15, height: 15, background: p.ink }} /></span>
                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.label}</span>
              </button>;
            })}</div>)}
            {bField("Palet huruf", <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{B_FONTS.map((f) => {
              const on = builder.fontId === f.id;
              return <button key={f.id} onClick={() => setB({ fontId: f.id })} style={{ display: "flex", alignItems: "center", gap: 10, padding: ".5rem .7rem", borderRadius: 10, cursor: "pointer", font: "inherit", fontWeight: 600, textAlign: "left", border: `1px solid ${on ? "var(--brand)" : "var(--line-2)"}`, background: on ? "color-mix(in oklab, var(--brand) 10%, var(--surface))" : "transparent", color: "var(--ink)" }}>
                <span style={{ fontFamily: f.display, fontSize: "1.3rem", lineHeight: 1, flex: "none" }}>Aa</span>
                <span style={{ fontSize: ".8rem", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.label}</span>
              </button>;
            })}</div>)}
          </>)}

          {acc("bahasa", "Lokasi & gaya bahasa", <>
            {foundationLocked() ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 13px", borderRadius: 10, background: "color-mix(in oklab, var(--warn) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--warn) 26%, var(--line))", marginBottom: 14, fontSize: ".82rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                <span style={{ fontSize: "1rem" }}>🔒</span>
                <span>Terkunci sampai <b style={{ color: "var(--ink)" }}>{foundationUnlockDate()}</b>. Lokasi & gaya bahasa adalah fondasi mesin — semakin stabil, semakin optimal hasilnya.</span>
              </div>
            ) : (
              <p className="muted" style={{ fontSize: ".84rem", marginTop: -4, marginBottom: 12, lineHeight: 1.5 }}>Fondasi mesin konten. Bisa diubah maksimal <b style={{ color: "var(--ink)" }}>sekali per 30 hari</b> — semakin stabil, semakin baik optimasi & mengurangi coba-coba.</p>
            )}
            {bField("Lokasi utama (konten location-based)", <LocationInput value={builder.location} onChange={(v) => setB({ location: v })} disabled={foundationLocked()} placeholder="Ketik kota/kawasan…" style={{ ...bInp, opacity: foundationLocked() ? .55 : 1, cursor: foundationLocked() ? "not-allowed" : "text" }} />, "🔎 Google Places bila aktif")}
            {bField("Gaya bahasa", <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{B_TONES.map((o) => <button key={o.id} disabled={foundationLocked()} onClick={() => { if (!foundationLocked()) setB({ tone: o.id }); }} style={{ ...segBtn(builder.tone === o.id), opacity: foundationLocked() && builder.tone !== o.id ? .5 : 1, cursor: foundationLocked() ? "not-allowed" : "pointer" }}>{o.label}</button>)}</div>, "Nada + set ikon/dekorasi")}
            {!foundationLocked() && <button onClick={lockFoundation} style={{ ...btn("brand"), width: "100%", justifyContent: "center", display: "flex", marginTop: 4, fontSize: ".85rem" }}>Terapkan & kunci 30 hari</button>}
          </>, foundationLocked() ? "🔒 Terkunci" : "Lokasi + nada")}

          {acc("sosial", "Sosial & WhatsApp", <>
            {bField("Nomor WhatsApp", <input style={bInp} value={builder.wa} onChange={(e) => setB({ wa: e.target.value.replace(/[^\d]/g, "") })} placeholder="6281234567890" />, "Format 62…")}
            {bField("Instagram", <input style={bInp} value={builder.instagram} onChange={(e) => setB({ instagram: e.target.value.replace(/^@/, "") })} placeholder="username" />)}
            {bField("TikTok", <input style={bInp} value={builder.tiktok} onChange={(e) => setB({ tiktok: e.target.value.replace(/^@/, "") })} placeholder="username" />)}
            {bField("YouTube", <input style={bInp} value={builder.youtube} onChange={(e) => setB({ youtube: e.target.value })} placeholder="Nama channel" />)}
            {bField("Facebook", <input style={bInp} value={builder.facebook} onChange={(e) => setB({ facebook: e.target.value })} placeholder="Halaman (opsional)" />)}
          </>)}

        </div>

        {/* ---------------- Live preview ---------------- */}
        <div className="bld-preview" style={{ display: "grid", gap: 14 }}>
          {/* Premium AI upsell — above the publish action */}
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, padding: "18px 20px", background: "linear-gradient(125deg, #16292E 0%, #0E1F23 58%, #1A3238 100%)", border: "1px solid rgba(231,200,146,.28)" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130px 130px at 90% -12%, rgba(231,200,146,.24), transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#E7C892" }}>✨ Premium AI</span>
                  <span style={{ fontSize: ".62rem", fontWeight: 700, padding: ".14rem .5rem", borderRadius: 999, background: "rgba(255,255,255,.13)", color: "#fff" }}>Pro</span>
                </div>
                <div className="display" style={{ fontSize: "1.22rem", fontWeight: 700, color: "#fff", lineHeight: 1.18 }}>Optimalkan situs dengan AI</div>
                <p style={{ fontSize: ".84rem", color: "rgba(255,255,255,.8)", margin: "5px 0 0", lineHeight: 1.5, maxWidth: "46ch" }}>Advertorial, naskah & isi situs ditulis ulang — dioptimalkan untuk SEO, GEO, social & local search sesuai persona Anda.</p>
              </div>
              <button onClick={() => { setAiSaved(false); setAiModal(true); }} style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 8, font: "inherit", fontWeight: 700, fontSize: ".92rem", cursor: "pointer", border: "none", borderRadius: 12, padding: ".8rem 1.4rem", color: "#231a08", background: "linear-gradient(120deg, #F0D699, #C9A24B 55%, #B0812F)", boxShadow: "0 12px 26px -10px rgba(176,129,47,.7)" }}>✨ Optimalkan</button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: ".76rem", fontWeight: 700, color: "var(--good)", background: "color-mix(in oklab, var(--good) 12%, var(--surface))", padding: ".3rem .65rem", borderRadius: 999 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--good)" }} /> Pratinjau langsung · realtime</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {builderSaved && !published && <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--good)" }}>✓ Tersimpan</span>}
              <button style={{ ...btn("ghost"), background: "var(--surface-2)", padding: ".55rem .9rem", fontSize: ".84rem" }} onClick={() => { setBuilder(BUILDER_DEFAULT); clearLocks(); }}>Reset</button>
              <button style={{ ...btn("ghost"), background: "var(--surface-2)", padding: ".55rem .9rem", fontSize: ".84rem" }} onClick={saveBuilder}>Simpan draf</button>
              <button style={{ ...btn("ghost"), background: "color-mix(in oklab, var(--brand) 10%, var(--surface))", color: "var(--brand)", borderColor: "color-mix(in oklab, var(--brand) 40%, var(--line-2))", padding: ".55rem .9rem", fontSize: ".84rem" }} onClick={viewLive}>Lihat situs ↗</button>
              <button style={{ ...btn("brand"), padding: ".55rem 1.25rem", fontSize: ".86rem", boxShadow: "0 10px 22px -10px color-mix(in oklab, var(--brand) 60%, transparent)" }} onClick={publishSite}>Terbitkan situs</button>
            </div>
          </div>

          {published && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "color-mix(in oklab, var(--good) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--good) 26%, var(--line))", flexWrap: "wrap" }}>
              <span style={{ width: 30, height: 30, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: "var(--good)", color: "#fff" }}><Ic d="M20 6 9 17l-5-5" s={16} /></span>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--ink)" }}>Situs terbit</div>
                <div className="muted" style={{ fontSize: ".8rem" }}>Perubahan tampil di situs langsung Anda · {published}</div>
              </div>
              <button style={{ ...btn("ghost"), padding: ".45rem .9rem", fontSize: ".82rem" }} onClick={viewLive}>Lihat situs langsung ↗</button>
            </div>
          )}

          {/* browser frame */}
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 24px 60px -34px rgba(15,32,38,.4)", background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 13px", background: "var(--surface-2)", borderBottom: "1px solid var(--line)" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--line-2)" }} /><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--line-2)" }} /><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--line-2)" }} />
              <span className="mono" style={{ marginLeft: 10, fontSize: ".78rem", color: "var(--muted)" }}>{builder.domain}</span>
            </div>
            <div data-decor={builder.decoration} style={{ ...pvVars, position: "relative", isolation: "isolate", fontFamily: bFont.body, color: bPal.ink, background: pageBg }}>
              <Decor set={builder.tone} />
              {/* nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `12px ${bDen.pad}px`, background: bPal.surface, borderBottom: bSty.ruled ? `1px solid color-mix(in oklab, ${bPal.ink} 12%, transparent)` : "1px solid rgba(0,0,0,.05)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 26, height: 26, borderRadius: builder.radius === "kotak" ? 4 : 999, overflow: "hidden", flex: "none", display: "grid", placeItems: "center", background: bPal.brand, color: "#fff", fontWeight: 700, fontSize: ".8rem" }}>{builder.logo ? <img src={builder.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (builder.brand[0] || "K")}</span>
                  <span style={{ fontFamily: bFont.display, fontWeight: 700, fontSize: "1rem" }}>{builder.brand || "Brand"}</span>
                </span>
                <span style={{ display: "flex", gap: 14, fontSize: ".72rem", opacity: .8 }}><span>Beranda</span><span>Listing</span><span>Tentang</span></span>
              </div>
              {/* hero */}
              <div style={{ position: "relative", overflow: "hidden", background: builder.imgs.hero ? `linear-gradient(115deg, rgba(15,32,38,.82), rgba(15,32,38,.42)), url(${builder.imgs.hero}) center/cover` : heroBg, color: "#fff", padding: `${bDen.pad + 8}px ${bDen.pad}px` }}>
                <div style={{ position: "relative" }}>
                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "rgba(255,255,255,.9)", ...capCss(), marginBottom: 10 }}>{bCopy.eyebrow}</div>
                <div style={{ fontFamily: bFont.display, fontSize: "1.7rem", fontWeight: 700, lineHeight: 1.15, maxWidth: "18ch" }}>{bCopy.h1}</div>
                <p style={{ fontSize: ".9rem", lineHeight: bDen.lh, color: "rgba(255,255,255,.86)", maxWidth: "40ch", marginTop: 12 }}>{bCopy.sub}</p>
                <button style={{ marginTop: 16, border: "none", cursor: "default", padding: ".65rem 1.3rem", borderRadius: bRad.btn, background: bPal.accent, color: "#fff", fontWeight: 700, fontSize: ".86rem", fontFamily: bFont.body }}>{bCopy.cta}</button>
                </div>
              </div>
              {/* listing */}
              <div style={{ padding: `${bDen.pad}px`, background: bandBg }}>
                <div style={{ fontSize: ".68rem", fontWeight: 700, color: bPal.accent, ...capCss(), marginBottom: 4 }}>Listing</div>
                <div style={{ fontFamily: bFont.display, fontSize: "1.15rem", fontWeight: 700, marginBottom: bDen.gap }}>Properti pilihan.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: bDen.gap }}>
                  {(listings.length ? listings : PREVIEW_FALLBACK).slice(0, 2).map((l) => (
                    <div key={l.t} style={{ borderRadius: bRad.card, overflow: "hidden", background: bPal.surface, border: bSty.border, boxShadow: bSty.shadow }}>
                      <div style={{ position: "relative", height: 72, background: l.img ? `url(${l.img}) center/cover` : `linear-gradient(135deg, ${bPal.brand}, ${bPal.accent})` }}>
                        <span style={{ position: "absolute", top: 7, left: 7, fontSize: ".6rem", fontWeight: 700, color: "#fff", background: l.st === "Disewa" ? bPal.accent : bPal.brand, padding: ".18rem .5rem", borderRadius: bRad.badge, textTransform: "uppercase" }}>{l.st}</span>
                      </div>
                      <div style={{ padding: `${Math.round(bDen.pad * 0.4)}px` }}>
                        <div style={{ fontFamily: bFont.display, fontWeight: 700, fontSize: ".84rem" }}>{l.t}</div>
                        <div style={{ fontSize: ".7rem", opacity: .65, margin: "2px 0 6px" }}>{l.loc}</div>
                        <div style={{ fontWeight: 700, fontSize: ".82rem", color: bPal.brand }}>{l.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* cta */}
              <div style={{ padding: `${bDen.pad}px`, textAlign: "center", background: builder.bg === "mono" ? bPal.bg : bandBg }}>
                <div style={{ fontFamily: bFont.display, fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>Siap menemukan properti Anda?</div>
                <button style={{ border: "none", cursor: "default", padding: ".6rem 1.2rem", borderRadius: bRad.btn, background: bPal.brand, color: "#fff", fontWeight: 700, fontSize: ".82rem", fontFamily: bFont.body }}>WhatsApp {builder.brand}</button>
              </div>
              {/* footer */}
              <div style={{ padding: `${Math.round(bDen.pad * 0.7)}px ${bDen.pad}px`, background: bPal.ink, color: "rgba(255,255,255,.8)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: bFont.display, fontWeight: 700, color: "#fff", fontSize: ".9rem" }}>{builder.brand}</span>
                <span style={{ display: "flex", gap: 8 }}>
                  {socialChips.map(([label, , d]) => (
                    <span key={label} title={label} style={{ width: 26, height: 26, borderRadius: builder.radius === "kotak" ? 5 : 999, display: "grid", placeItems: "center", background: "rgba(255,255,255,.14)", color: "#fff" }}><Ic d={d} s={14} /></span>
                  ))}
                  {builder.wa && <span title="WhatsApp" style={{ width: 26, height: 26, borderRadius: builder.radius === "kotak" ? 5 : 999, display: "grid", placeItems: "center", background: bPal.accent, color: "#fff" }}><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" s={13} /></span>}
                </span>
              </div>
            </div>
          </div>

          {/* SERP / meta-tag snippet */}
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Pratinjau hasil pencarian & metatag</div>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, flex: "none", overflow: "hidden", display: "grid", placeItems: "center", background: bPal.brand, color: "#fff", fontWeight: 700, fontSize: ".7rem" }}>{builder.logo ? <img src={builder.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (builder.brand[0] || "K")}</span>
                <span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: ".78rem", fontWeight: 600, lineHeight: 1.1 }}>{builder.brand}</span><span className="mono" style={{ fontSize: ".72rem", color: "var(--muted)" }}>{builder.domain}</span></span>
              </div>
              <div style={{ color: "#1a0dab", fontSize: ".98rem", fontWeight: 500, lineHeight: 1.25, marginBottom: 2 }}>{builder.metaTitle || "Judul situs Anda"}</div>
              <div className="muted" style={{ fontSize: ".82rem", lineHeight: 1.4 }}>{builder.metaDesc || "Deskripsi meta situs Anda akan tampil di sini."}</div>
            </div>
          </Card>

          <div style={{ padding: "12px 14px", borderRadius: 12, background: "color-mix(in oklab, var(--brand) 7%, var(--surface))", border: "1px solid color-mix(in oklab, var(--brand) 20%, var(--line))", fontSize: ".82rem", color: "var(--ink-2)", lineHeight: 1.55 }}>
            <strong>Ringan &amp; tanpa kredit.</strong> Semua perubahan hanya menata ulang template — bukan generate AI — jadi pratinjau berubah seketika. Kredit hanya dipakai saat menulis teks & advertorial (SEO/GEO/social).
          </div>
        </div>
      </div>

      {aiModal && (
        <div onClick={() => setAiModal(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,15,9,.5)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: "clamp(8px,3vw,20px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(560px,100%)", maxHeight: "88vh", overflowY: "auto", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)", boxShadow: "0 40px 90px -30px rgba(0,0,0,.5)", padding: "24px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <h2 className="display" style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>✨ Optimalkan dengan AI</h2>
                <p className="muted" style={{ fontSize: ".86rem", marginTop: 4, lineHeight: 1.5 }}>Jawab {AI_QUESTIONS.length} pertanyaan singkat — sistem menulis ulang seluruh advertorial, naskah & isi situs yang dioptimalkan untuk SEO, GEO, social & local search.</p>
              </div>
              <button onClick={() => setAiModal(false)} aria-label="Tutup" style={{ ...btn("ghost"), padding: ".35rem .6rem", flex: "none" }}>✕</button>
            </div>
            <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
              {AI_QUESTIONS.map((qq, i) => (
                <div key={qq.key}>
                  <label style={{ fontSize: ".84rem", fontWeight: 600, display: "block", marginBottom: 6 }}><span style={{ color: "var(--brand)" }}>{i + 1}.</span> {qq.q}</label>
                  <textarea rows={2} value={aiAnswers[qq.key] || ""} onChange={(e) => { setAiAnswers((a) => ({ ...a, [qq.key]: e.target.value })); setAiSaved(false); }} placeholder={qq.ph} style={{ ...bInp, resize: "vertical", minHeight: 52, lineHeight: 1.5 }} />
                </div>
              ))}
            </div>
            {aiSaved ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, padding: "12px 14px", borderRadius: 12, background: "color-mix(in oklab, var(--good) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--good) 26%, var(--line))" }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: "var(--good)", color: "#fff" }}><Ic d="M20 6 9 17l-5-5" s={15} /></span>
                <span style={{ fontSize: ".84rem", color: "var(--ink-2)", lineHeight: 1.45 }}>Brief tersimpan. Digabung dengan profil Anda, mesin konten akan menulis hasilnya di <b style={{ color: "var(--ink)" }}>“Konten siap”</b> saat aktif.</span>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, marginTop: 18, alignItems: "center" }}>
                <button onClick={submitAI} style={{ ...btn("brand"), flex: 1, justifyContent: "center", display: "flex" }}>Buat konten optimal</button>
                <button onClick={() => setAiModal(false)} style={btn("ghost")}>Nanti</button>
              </div>
            )}
            <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "color-mix(in oklab, var(--warn) 9%, var(--surface))", border: "1px solid color-mix(in oklab, var(--warn) 24%, var(--line))", fontSize: ".8rem", color: "var(--ink-2)", lineHeight: 1.5 }}>⏳ SEO, GEO &amp; mesin pencari butuh waktu untuk beradaptasi dengan situs/portal Anda — jangan terlalu sering gonta-ganti agar hasilnya optimal.</div>
            <p className="muted" style={{ fontSize: ".76rem", marginTop: 12, lineHeight: 1.5 }}>Fitur Pro · digabung otomatis dengan brand, lokasi & gaya bahasa Anda untuk hasil paling relevan.</p>
          </div>
        </div>
      )}
    </>
  );

  const titles: Record<Sec, [string, string]> = {
    home: ["Dashboard", "Ringkasan performa Anda — pilih kanal untuk insight & analisanya."],
    builder: ["Web Builder", "Atur tampilan situs Anda — perubahan langsung terlihat, tanpa kredit."],
    prospek: ["Prospek", "Balas dan kelola calon pembeli dari semua kanal."],
    listing: ["Listing", "Kelola properti Anda — buat, ubah, hapus, riwayat."],
    editor: ["Editor", "Buat video listing otomatis dan unggah materi."],
    content: ["Konten", "Tulis konten, atau pakai yang siap dari sistem."],
    assets: ["Aset", "Pustaka aset cakra untuk semua member."],
    profile: ["Profil & pengaturan", "Koneksi, tagihan, keamanan, dan legal."],
  };
  const body = { home: Dashboard, builder: Builder, prospek: Prospek, listing: Listing, editor: <EditorStudio user={user} />, content: Content, assets: Assets, profile: Profile }[sec];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <aside className="adm-side" style={{ width: collapsed ? 74 : 236, flex: "none", background: "var(--surface)", borderRight: "1px solid var(--line)", padding: collapsed ? "18px 10px" : "18px 14px", position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", transition: "width .2s ease, padding .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 7, padding: collapsed ? "6px 0 20px" : "6px 8px 20px" }}>
          <CakraMark size={30} />{!collapsed && <span className="hand" style={{ fontSize: "1.7rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>}
        </div>
        <nav style={{ display: "grid", gap: 3 }}>
          {NAV.map((n) => (
            <button key={n.id} data-tour={`nav-${n.id}`} onClick={() => setSec(n.id)} title={n.label} style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 11, padding: ".65rem .7rem", borderRadius: 10, border: "none", cursor: "pointer", font: "inherit", fontSize: ".95rem", fontWeight: sec === n.id ? 600 : 500, textAlign: "left", background: sec === n.id ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: sec === n.id ? "var(--brand)" : "var(--ink-2)", transition: ".15s" }}>
              <Ic d={n.icon} />{!collapsed && n.label}
            </button>
          ))}
          {COMING.map((n) => (
            <div key={n.label} title={`${n.label} — segera hadir`} style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: 11, padding: ".65rem .7rem", borderRadius: 10, color: "var(--muted)", fontSize: ".95rem", fontWeight: 500, cursor: "default", opacity: .6 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}><Ic d={n.icon} />{!collapsed && n.label}</span>
              {!collapsed && <span style={{ fontSize: ".58rem", fontWeight: 700, padding: ".12rem .42rem", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--muted)", flex: "none" }}>Soon</span>}
            </div>
          ))}
        </nav>
        {(() => {
          const displayName = prof?.name || prof?.brand || (user.email ? user.email.split("@")[0] : "Akun");
          const planLabel = prof?.plan ? prof.plan.charAt(0).toUpperCase() + prof.plan.slice(1) : "Trial";
          return (
            <button onClick={() => setSec("profile")} title={displayName} style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 10, padding: "10px 8px", borderRadius: 12, border: "1px solid var(--line)", background: sec === "profile" ? "var(--surface-2)" : "transparent", cursor: "pointer", font: "inherit", textAlign: "left" }}>
              <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, flex: "none" }}>{(displayName[0] || "A").toUpperCase()}</span>
              {!collapsed && <span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 600, fontSize: ".9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</span><span className="muted" style={{ fontSize: ".78rem" }}>Paket {planLabel}</span></span>}
            </button>
          );
        })()}
        {isAdmin(user.email) && <a href="?view=staff" title="Backend admin cakra" style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 8px", borderRadius: 10, border: "1px solid var(--line)", background: "transparent", color: "var(--ink-2)", cursor: "pointer", font: "inherit", fontSize: ".82rem", fontWeight: 600, textDecoration: "none" }}>{collapsed ? "⚙" : "⚙ Backend admin"}</a>}
        <button onClick={onSignOut} title="Keluar" style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 8px", borderRadius: 10, border: "1px solid var(--line)", background: "transparent", color: "var(--ink-2)", cursor: "pointer", font: "inherit", fontSize: ".82rem", fontWeight: 600 }}>{collapsed ? "⎋" : "⎋ Keluar"}</button>
      </aside>

      {mobileNav && (
        <div onClick={() => setMobileNav(false)} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(20,15,9,.5)", backdropFilter: "blur(2px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 264, maxWidth: "82vw", background: "var(--surface)", borderRight: "1px solid var(--line)", padding: "18px 14px", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(20,15,9,.35)", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 6px 20px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}><CakraMark size={30} /><span className="hand" style={{ fontSize: "1.7rem", fontWeight: 700, lineHeight: 1 }}>cakra</span></span>
              <button onClick={() => setMobileNav(false)} aria-label="Tutup" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>✕</button>
            </div>
            <nav style={{ display: "grid", gap: 3 }}>
              {NAV.map((n) => (
                <button key={n.id} data-tour={`nav-${n.id}`} onClick={() => { setSec(n.id); setMobileNav(false); }} style={{ display: "flex", alignItems: "center", gap: 11, padding: ".72rem .7rem", borderRadius: 10, border: "none", cursor: "pointer", font: "inherit", fontSize: "1rem", fontWeight: sec === n.id ? 600 : 500, textAlign: "left", background: sec === n.id ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: sec === n.id ? "var(--brand)" : "var(--ink-2)" }}>
                  <Ic d={n.icon} />{n.label}
                </button>
              ))}
              {COMING.map((n) => (
                <div key={n.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 11, padding: ".72rem .7rem", borderRadius: 10, color: "var(--muted)", fontSize: "1rem", fontWeight: 500, opacity: .6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 11 }}><Ic d={n.icon} />{n.label}</span>
                  <span style={{ fontSize: ".6rem", fontWeight: 700, padding: ".12rem .45rem", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--line)" }}>Soon</span>
                </div>
              ))}
              <button onClick={() => { setSec("profile"); setMobileNav(false); }} style={{ display: "flex", alignItems: "center", gap: 11, padding: ".72rem .7rem", borderRadius: 10, border: "none", cursor: "pointer", font: "inherit", fontSize: "1rem", fontWeight: sec === "profile" ? 600 : 500, textAlign: "left", background: sec === "profile" ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: sec === "profile" ? "var(--brand)" : "var(--ink-2)" }}>
                <Ic d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6Z" />Profil
              </button>
              <button onClick={() => { onSignOut(); setMobileNav(false); }} style={{ display: "flex", alignItems: "center", gap: 11, padding: ".72rem .7rem", borderRadius: 10, border: "none", cursor: "pointer", font: "inherit", fontSize: "1rem", fontWeight: 500, textAlign: "left", background: "transparent", color: "var(--ink-2)" }}>⎋ Keluar</button>
            </nav>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ height: 60, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0 clamp(8px,3vw,28px)", background: "color-mix(in oklab, var(--bg) 86%, transparent)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button onClick={() => setMobileNav(true)} aria-label="Menu" className="adm-mobile-btn" style={{ placeItems: "center", width: 38, height: 38, borderRadius: 10, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer", flex: "none" }}>
              <Ic d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" s={18} />
            </button>
            <button onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Buka menu" : "Sembunyikan menu"} title={collapsed ? "Buka menu" : "Sembunyikan menu"} className="adm-collapse-btn" style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 10, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer", flex: "none" }}>
              <Ic d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" s={18} />
            </button>
            <span style={{ fontSize: ".82rem", color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }} className="adm-openmode" title={user.email}>● {user.email}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            {rendering && (
              <button onClick={() => setSec("editor")} title="Lihat proses render" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: ".38rem .7rem", borderRadius: 999, border: "1px solid color-mix(in oklab, var(--brand) 30%, var(--line))", background: "color-mix(in oklab, var(--brand) 10%, var(--surface))", color: "var(--brand)", cursor: "pointer", font: "inherit", fontSize: ".78rem", fontWeight: 700, flex: "none" }}>
                <span className="adm-spin" style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid color-mix(in oklab, var(--brand) 30%, transparent)", borderTopColor: "var(--brand)", flex: "none" }} />
                Merender {rendering.pct}%{queued.length ? ` · +${queued.length}` : ""}
              </button>
            )}
            <a href={`https://${hostLabel}`} target="_blank" rel="noopener noreferrer" className="mono adm-hosturl" style={{ fontSize: ".82rem", color: "var(--muted)", textDecoration: "none", whiteSpace: "nowrap" }}>{hostLabel} ↗</a>
            <ThemeToggle size={36} />
          </div>
        </header>
        <main className="adm-main" style={{ padding: "clamp(20px,3vw,34px)", maxWidth: 1400 }}>
          <h1 className="display" style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>{titles[sec][0]}</h1>
          <p className="muted" style={{ margin: "4px 0 22px" }}>{titles[sec][1]}</p>
          {body}
        </main>
      </div>

      {listingModal !== null && (() => {
        const l = listings[listingModal];
        if (!l) return null;
        return (
          <div onClick={() => setListingModal(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(20,15,9,.55)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: "clamp(8px,3vw,20px)" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "min(560px, 94vw)", maxHeight: "90vh", overflow: "auto", background: "var(--surface)", borderRadius: 18, border: "1px solid var(--line)", boxShadow: "0 40px 100px rgba(20,15,9,.4)" }}>
              <div style={{ position: "relative", aspectRatio: "16 / 10" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.img} alt={l.t} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "18px 18px 0 0" }} />
                <span style={{ position: "absolute", top: 12, left: 12, fontSize: ".66rem", fontWeight: 700, letterSpacing: ".05em", padding: ".26rem .6rem", borderRadius: 999, color: "#fff", background: ST_COLOR[l.st] || "var(--brand)" }}>{l.st.toUpperCase()}</span>
                <button onClick={() => setListingModal(null)} aria-label="Tutup" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer", background: "rgba(255,255,255,.92)", color: "var(--ink)", fontSize: "1rem", display: "grid", placeItems: "center" }}>✕</button>
              </div>
              <div style={{ padding: 22 }}>
                {listingEdit && draft ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    <label style={F_LBL}>Judul
                      <input value={draft.t} onChange={(e) => setDraft({ ...draft, t: e.target.value })} style={F_INP} />
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <label style={F_LBL}>Harga
                        <input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} style={F_INP} />
                      </label>
                      <label style={F_LBL}>Lokasi
                        <input value={draft.loc} onChange={(e) => setDraft({ ...draft, loc: e.target.value })} style={F_INP} />
                      </label>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      <label style={F_LBL}>Kamar tidur
                        <input type="number" value={draft.kt} onChange={(e) => setDraft({ ...draft, kt: e.target.value })} style={F_INP} />
                      </label>
                      <label style={F_LBL}>Kamar mandi
                        <input type="number" value={draft.km} onChange={(e) => setDraft({ ...draft, km: e.target.value })} style={F_INP} />
                      </label>
                      <label style={F_LBL}>Luas (m²)
                        <input type="number" value={draft.luas} onChange={(e) => setDraft({ ...draft, luas: e.target.value })} style={F_INP} />
                      </label>
                    </div>
                    <label style={F_LBL}>Deskripsi
                      <textarea value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} rows={4} style={{ ...F_INP, resize: "vertical" }} />
                    </label>
                    <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                      <button style={btn("brand")} onClick={() => { saveListingEdit(listingModal, draft); setListingEdit(false); }}>Simpan perubahan</button>
                      <button style={btn("ghost")} onClick={() => setListingEdit(false)}>Batal</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                      <h3 className="display" style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>{l.t}</h3>
                      <span className="mono" style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--brand)", whiteSpace: "nowrap" }}>{l.price}</span>
                    </div>
                    <div className="muted" style={{ fontSize: ".9rem", marginTop: 3 }}>★ {l.rating} · {l.loc}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "16px 0" }}>
                      {[["Kamar tidur", `${l.kt} KT`], ["Kamar mandi", `${l.km} KM`], ["Luas", `${l.luas} m²`]].map(([k, val]) => (
                        <div key={k} style={{ padding: "12px 10px", borderRadius: 11, background: "var(--surface-2)", textAlign: "center" }}>
                          <div className="mono" style={{ fontWeight: 700, fontSize: "1rem" }}>{val}</div>
                          <div className="muted" style={{ fontSize: ".72rem", marginTop: 2 }}>{k}</div>
                        </div>
                      ))}
                    </div>
                    <p className="muted" style={{ fontSize: ".92rem", lineHeight: 1.6, margin: "0 0 8px" }}>{l.desc}</p>
                    <div className="muted" style={{ fontSize: ".8rem", marginBottom: 14 }}>{l.views}× dilihat · tayang di website Anda</div>
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--surface-2)", marginBottom: 16 }}>
                      <div style={{ fontSize: ".8rem", fontWeight: 700, marginBottom: 8 }}>Status listing</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {ST_ALL.map((s) => {
                          const on = l.st === s;
                          return <button key={s} onClick={() => setListingStatus(listingModal, s)} style={{ padding: ".36rem .75rem", borderRadius: 999, fontSize: ".76rem", fontWeight: 700, cursor: "pointer", border: `1px solid ${on ? "transparent" : "var(--line-2)"}`, background: on ? (ST_COLOR[s] || "var(--brand)") : "var(--surface)", color: on ? "#fff" : "var(--ink-2)" }}>{s}</button>;
                        })}
                      </div>
                      <div className="muted" style={{ fontSize: ".72rem", marginTop: 8 }}>Ubah ke Terjual / Tersewa / Habis untuk menandai properti sudah tidak tersedia.</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button style={btn("brand")} onClick={() => { setDraft({ ...l }); setListingEdit(true); }}>Edit listing</button>
                      <button style={btn("ghost")} onClick={() => { try { window.open("https://cakra.xyz/demo", "_blank", "noopener"); } catch {} }}>Lihat di website</button>
                      <button style={{ ...btn("ghost"), color: "var(--crit)", borderColor: "color-mix(in oklab, var(--crit) 40%, var(--line-2))", marginLeft: "auto" }} onClick={() => { if (typeof window !== "undefined" && window.confirm("Hapus listing ini?")) { deleteListing(listingModal); setListingModal(null); setListingEdit(false); } }}>Hapus</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <WelcomeTour userId={user.id} onGoto={(s) => setSec(s as Sec)} />

      <style>{`
        .adm-asset:hover .adm-use{ opacity:1 !important; }
        .adm-thumb{ transition:.15s; }
        .adm-thumb:hover{ border-color:var(--brand) !important; box-shadow:0 8px 22px rgba(20,15,9,.12); transform:translateY(-2px); }
        .adm-eq.on span{ animation: admEq .9s ease-in-out infinite; }
        .adm-eq.on span:nth-child(2){ animation-delay:.15s } .adm-eq.on span:nth-child(3){ animation-delay:.3s } .adm-eq.on span:nth-child(4){ animation-delay:.45s } .adm-eq.on span:nth-child(5){ animation-delay:.6s }
        @keyframes admEq{ 0%,100%{ transform:scaleY(.4) } 50%{ transform:scaleY(1) } }
        .adm-eq span{ transform-origin:bottom }
        @keyframes admSpin{ to{ transform:rotate(360deg) } }
        .adm-spin{ animation: admSpin .8s linear infinite; }
        @media (max-width: 860px){ .adm-2{ grid-template-columns:1fr !important; } }
        .adm-mobile-btn{ display:none !important; }
        @media (max-width: 640px){ .adm-openmode{ display:none !important; } .adm-hosturl{ display:none !important; } }
        @media (max-width: 720px){ .adm-side{ display:none !important; } .adm-collapse-btn{ display:none !important; } .adm-mobile-btn{ display:grid !important; } }
        @media (prefers-reduced-motion: reduce){ .adm-eq.on span, .adm-spin{ animation:none !important; } }
      `}</style>
    </div>
  );
}

export default function Admin() {
  const [host, setHost] = useState<string | null>(null);
  const [override, setOverride] = useState<"staff" | "member" | null>(null);
  useEffect(() => {
    setHost(window.location.hostname);
    try {
      const q = new URL(window.location.href).searchParams.get("view");
      if (q === "member" || q === "staff") localStorage.setItem("cakra-admin-view", q);
      const st = localStorage.getItem("cakra-admin-view");
      setOverride(st === "member" || st === "staff" ? (st as "staff" | "member") : null);
    } catch {}
  }, []);
  // Wait for the hostname so a member never flashes the staff backend on first paint.
  if (host === null) return <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "var(--bg)", color: "var(--muted)", fontSize: ".9rem" }}>Memuat…</div>;
  const backendHost = host === "cakra.xyz" || host === "www.cakra.xyz" || host === "localhost" || host === "127.0.0.1";
  // The member dashboard is the default product view. The staff backend shows only when explicitly
  // requested (?view=staff) or on the backend host — and only to an admin; an admin can always jump
  // to their own member dashboard with ?view=member (a toggle in each dashboard sets this).
  const staffView = override !== "member" && (override === "staff" || backendHost);
  if (staffView) return (
    <AuthGate>{(user, signOut) => isAdmin(user.email)
      ? <StaffAdmin email={user.email} onSignOut={signOut} />
      : <MemberDashboard user={user} onSignOut={signOut} />}</AuthGate>
  );
  return <AuthGate>{(user, signOut) => <MemberDashboard user={user} onSignOut={signOut} />}</AuthGate>;
}
