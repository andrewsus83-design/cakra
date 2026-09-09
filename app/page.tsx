import Link from "next/link";
import { PresenceCard } from "@/components/PresenceCard";
import { SectionTitle } from "@/components/SectionTitle";
import { CenterPills } from "@/components/CenterPills";
import { KprCalc } from "@/components/KprCalc";

const VALUES = [
  ["Website profesional", "Domain & situs Anda sendiri"],
  ["Selalu terbarui", "Listing & konten baru tiap minggu"],
  ["Tepercaya", "Ulasan & rekam jejak yang berbicara sebelum Anda menelepon"],
  ["Mudah dihubungi", "WhatsApp & tombol kontak di tiap halaman situs Anda"],
  ["Cepat & profesional", "Foto jadi film properti 45–90 detik — dalam menit, bukan minggu"],
  ["Selalu ditemukan", "Muncul saat pembeli mencari — di Google, AI & sosial"],
];

const STEPS = [
  ["Jawab 8 langkah singkat", "Onboarding bergaya Typeform (± 3 menit) memahami area, tipe properti, dan target pembeli Anda — fondasi semua konten yang dipersonalisasi."],
  ["cakra membangun untuk Anda", "Website, listing, video, dan artikel dibuat otomatis — dipersonalisasi, dioptimasi untuk pencarian, dan siap tayang."],
  ["Terbit & ditemukan", "Konten Anda terindeks di Google, dikutip mesin pencari AI, dan dibagikan di media sosial. Skor kehadiran Anda naik."],
];

const FEATURES = [
  ["Website builder", "Situs properti profesional yang mudah diedit. Setiap advertorial dioptimasi untuk SEO, GEO, dan social search."],
  ["Manajemen listing", "Tambah, ubah status, dan kelola listing. Setiap unit punya halaman dan skor pencarian lokal (GEO)-nya sendiri."],
  ["Video listing AI", "Ubah foto dan deskripsi menjadi film properti 45–90 detik. ~20% animasi sinematik Kling 3, 80% editorial natural — ken burns, pan, dan zoom."],
  ["Konten & blog otomatis", "Artikel pasar dan panduan area yang relevan dengan properti Anda — dari riset AI, siap terbit untuk menarik pembeli."],
  ["Pustaka aset bebas royalti", "Ribuan gambar dan audio siap pakai untuk video dan konten — tanpa biaya lisensi tambahan."],
  ["Skor kehadiran", "Pantau SEO, GEO, dan social search dalam satu roda cakra. Tahu persis langkah berikutnya untuk bertumbuh."],
];

const FEAT_ICONS = [
  { p: "M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6.2l.5 2H17v1.5H7V20h1.7l.5-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm.8 4.2V15h16.4V8.2H3.8Z", c: "--c-eye" },
  { p: "M12 3 2.5 11H5v10h5v-6h4v6h5V11h2.5z", c: "--c-throat" },
  { p: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-2.5 5.5 8 4.5-8 4.5v-9Z", c: "--c-root" },
  { p: "M6 2h9l5 5v14.2A.8.8 0 0 1 19.2 22H6a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 6 2Zm2 9h8v1.8H8zm0 4h8v1.8H8z", c: "--c-solar" },
  { p: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z", c: "--c-heart" },
  { p: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z", c: "--c-sacral" },
];

const CENTRES = [
  ["Website", "--c-crown"], ["Listing", "--c-eye"], ["Konten", "--c-throat"],
  ["SEO", "--c-heart"], ["GEO", "--c-solar"], ["Social", "--c-sacral"], ["Reputasi", "--c-root"],
];

const POSTS = [
  { cat: "Pasar", title: "Panduan harga properti Kedungu 2026", ex: "Tren harga tanah dan vila di kawasan pertumbuhan baru Bali — dan apa artinya bagi pembeli Anda.", read: "8 menit", img: "/blog-0.webp" },
  { cat: "Tips", title: "5 cara video listing menaikkan closing", ex: "Mengapa satu video 60 detik mengalahkan 20 foto — dan cara membuatnya dalam hitungan menit dengan AI.", read: "5 menit", img: "/blog-1.webp" },
  { cat: "Ditemukan", title: "SEO lokal & pencarian AI untuk agen", ex: "Agar nama Anda muncul saat calon pembeli mencari “agen properti di area Anda” — di Google dan AI.", read: "6 menit", img: "/blog-2.webp" },
];

const TESTI = [
  { q: "Website saya jadi dalam satu sore, dan sekarang muncul di Google saat orang mencari agen di area saya. Klien bilang situs saya yang paling profesional.", n: "Andi Pratama", r: "Agen properti · Jakarta Selatan", c: "--c-eye" },
  { q: "Video listing yang dulu makan waktu seminggu, kini jadi dalam hitungan menit. Closing pertama dari reels cakra datang di minggu kedua.", n: "Sarah Wijaya", r: "Agen vila · Bali", c: "--c-heart" },
  { q: "Skor Cakra membuat saya tahu persis apa yang harus dikerjakan tiap minggu. Kehadiran online saya naik, dan lead pun ikut naik.", n: "Budi Santoso", r: "Agen properti · Surabaya", c: "--c-throat" },
];

export default function Home() {
  return (
    <main>
      {/* HERO — full-screen to the very top */}
      <section style={{ position: "relative", minHeight: "100svh", display: "grid", placeItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: "linear-gradient(180deg, #000 70%, transparent 100%)", maskImage: "linear-gradient(180deg, #000 70%, transparent 100%)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-top.webp" alt="Vila properti mewah saat golden hour" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="photo-scrim" />
        </div>
        <div className="wrap" style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "110px 0 96px" }}>
          <span className="hand" style={{ fontSize: "2rem", color: "var(--brand)", display: "inline-block", transform: "rotate(-2deg)" }}>
            satu platform, semua kehadiran
          </span>
          <h1 className="display on-photo" style={{ fontWeight: 700, fontSize: "clamp(3rem, 6.6vw, 5.6rem)", margin: "6px auto 0", maxWidth: "18ch", lineHeight: 1.02 }}>
            Website, listing, konten & skor kehadiran — satu platform.
          </h1>
          <p className="on-photo-soft" style={{ margin: "26px auto 0", maxWidth: "56ch", fontSize: "1.3rem", lineHeight: 1.55 }}>
            cakra membangun website profesional Anda, memproduksi video dan artikel listing dengan AI, lalu membuat Anda
            mudah ditemukan di Google, pencarian AI, dan media sosial — agar Anda jadi agen yang tak bisa diabaikan.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 36, justifyContent: "center" }}>
            <Link href="/onboarding" className="btn btn-brand" style={{ fontSize: "1.05rem", padding: ".95rem 1.8rem" }}>Mulai sekarang</Link>
            <Link href="/demo" className="btn btn-on-photo" style={{ fontSize: "1.05rem", padding: ".95rem 1.8rem" }}>Lihat contoh website →</Link>
          </div>
          <p className="on-photo-soft" style={{ marginTop: 26, fontSize: ".98rem" }}>
            <span style={{ color: "var(--brand)" }}>★</span> Dibuat untuk agen papan atas — yang menutup transaksi <b className="on-photo" style={{ textShadow: "none" }}>Rp 1 miliar+ tiap bulan</b>.
          </p>
        </div>
      </section>

      {/* VALUE JOURNEY */}
      <section className="wrap" style={{ padding: "96px 0 48px" }}>
        <SectionTitle hand="langkah demi langkah" max="22ch">Perjalanan menuju kehadiran yang kuat.</SectionTitle>
        <div style={{ position: "relative" }}>
          <div className="jline" />
          <div className="journey">
            {VALUES.map(([t, d], i) => (
              <div key={t} className="jnode">
                <div className="jicon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/icons/val-${i}.webp`} alt="" width={58} height={58} />
                </div>
                <div style={{ fontWeight: 600, fontSize: "1.12rem", marginTop: 16 }}>{t}</div>
                <div className="muted" style={{ fontSize: ".95rem", marginTop: 5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PUNCH — market opportunity + agent upside (no broker discredit) */}
        <div className="card" data-punch style={{ marginTop: 48, overflow: "hidden", display: "grid", gridTemplateColumns: "1.05fr .95fr", background: "var(--surface-2)", borderColor: "color-mix(in oklab, var(--brand) 24%, var(--line))" }}>
          <div style={{ padding: "clamp(28px, 4vw, 52px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>di era pencarian AI</div>
            <h3 className="display" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.9rem)", fontWeight: 700, lineHeight: 1.12 }}>
              Saat calon pembeli bertanya ke AI, nama Anda yang harus muncul.
            </h3>
            <p className="muted" style={{ fontSize: "1.1rem", lineHeight: 1.6, marginTop: 16, maxWidth: "46ch" }}>
              Bangun website, konten, dan reputasi milik Anda sendiri — kehadiran yang dikenali manusia maupun mesin pencari AI (GEO: agar jawaban ChatGPT &amp; Google AI menyebut nama Anda), dan tak bisa diabaikan.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "26px 40px", marginTop: 28 }}>
              {[
                { n: "9,9 juta", l: "kekurangan rumah nasional (backlog) — pasar yang terus tumbuh", c: "--c-solar" },
                { n: "Online-first", l: "mayoritas pembeli mulai mencari properti secara online", c: "--c-eye" },
                { n: "Rp 1 miliar+", l: "nilai penjualan bulanan agen papan atas", c: "--c-heart" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="display" style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.3rem)", fontWeight: 700, color: `var(${s.c})`, lineHeight: 1 }}>{s.n}</div>
                  <div className="muted" style={{ fontSize: ".86rem", marginTop: 4, maxWidth: "17ch" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 30 }}>
              <Link href="/signup" className="btn btn-brand" style={{ fontSize: "1.02rem", padding: ".85rem 1.6rem" }}>Bangun kehadiran Anda sekarang</Link>
            </div>
          </div>
          <div style={{ position: "relative", minHeight: 360 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/punch.webp" alt="Vila properti premium di Indonesia saat golden hour — kehadiran yang membangun kepercayaan" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="cara-kerja" style={{ padding: "72px 0" }}>
        <div className="wrap">
          <SectionTitle hand="tiga langkah, itu saja" max="22ch">Dari formulir singkat ke kehadiran yang mudah ditemukan.</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {STEPS.map(([t, d], i) => (
              <div key={t} className="card" style={{ padding: 32 }}>
                <div className="mono gold" style={{ fontSize: ".9rem", letterSpacing: ".1em" }}>{String(i + 1).padStart(2, "0")}</div>
                <h3 className="display" style={{ fontSize: "1.7rem", fontWeight: 600, margin: "12px 0 10px" }}>{t}</h3>
                <p className="muted" style={{ fontSize: "1rem", margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE — the live sample agent site (proof) */}
      <section className="wrap" style={{ padding: "24px 0 80px" }}>
        <SectionTitle hand="bukti hidup" max="24ch">Situs agen sungguhan, dibuat cakra.</SectionTitle>
        <Link href="/demo" className="card" style={{ display: "block", overflow: "hidden", padding: 0, textDecoration: "none", color: "inherit" }}>
          <div style={{ display: "flex", gap: 6, padding: "13px 18px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
            <i style={{ width: 10, height: 10, borderRadius: 999, background: "var(--line-2)" }} />
            <i style={{ width: 10, height: 10, borderRadius: 999, background: "var(--line-2)" }} />
            <i style={{ width: 10, height: 10, borderRadius: 999, background: "var(--line-2)" }} />
            <span className="mono muted" style={{ marginLeft: 8, fontSize: ".78rem" }}>kirana.cakra.xyz</span>
            <span className="pill" style={{ marginLeft: "auto", fontSize: ".72rem", fontWeight: 700, color: "var(--good)", background: "color-mix(in oklab, var(--good) 14%, var(--surface))" }}>● live</span>
          </div>
          <div style={{ position: "relative", aspectRatio: "16 / 7.6", background: "var(--surface-2)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero.webp" alt="Contoh website agen properti Kirana Sutanto yang dibuat dengan cakra" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, color-mix(in oklab, #1a130a 62%, transparent), transparent 60%)" }} />
            <div style={{ position: "absolute", left: "6%", bottom: "13%", maxWidth: "46ch", color: "#fff" }}>
              <span className="eyebrow" style={{ color: "#f0e6cf" }}>Kirana Sutanto · Spesialis Vila Bali</span>
              <h3 className="display" style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.7rem)", fontWeight: 600, margin: "10px 0 6px", color: "#fff" }}>
                Vila tepi tebing yang menjual dirinya sendiri.
              </h3>
              <span className="hand" style={{ fontSize: "1.6rem", color: "#e9cf9a" }}>ini situs nyata buatan cakra — buka &amp; jelajahi →</span>
            </div>
          </div>
        </Link>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 0" }}>
        <div className="wrap">
          <SectionTitle hand="semua yang Anda butuhkan" max="24ch">Semua alat pemasaran properti Anda, dalam satu tempat.</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {FEATURES.map(([t, d], i) => (
              <div key={t} className="card" style={{ padding: 34 }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }} aria-hidden="true">
                  <span style={{ color: `var(${FEAT_ICONS[i].c})`, lineHeight: 0 }}>
                    <svg viewBox="0 0 24 24" width={44} height={44} fill="currentColor"><path d={FEAT_ICONS[i].p} /></svg>
                  </span>
                </div>
                <h3 className="display" style={{ fontSize: "1.62rem", fontWeight: 600, margin: "0 0 10px" }}>{t}</h3>
                <p className="muted" style={{ fontSize: "1rem", margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESENCE */}
      <section className="wrap" style={{ padding: "40px 0 88px" }}>
        <div className="card" style={{ padding: "clamp(30px, 5vw, 56px)", background: "var(--surface-2)", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 48, alignItems: "center" }} data-presence>
          <div>
            <span className="hand gold" style={{ fontSize: "1.8rem", display: "inline-block", transform: "rotate(-2deg)" }}>Skor Cakra</span>
            <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(2rem, 3.6vw, 2.9rem)", margin: "8px 0 16px", maxWidth: "22ch", lineHeight: 1.04 }}>
              Satu skor yang menunjukkan langkah Anda berikutnya.
            </h2>
            <p className="muted" style={{ maxWidth: "54ch", margin: "0 0 22px", fontSize: "1.1rem" }}>
              Skor Cakra mengukur kehadiran online Anda pada tujuh pusat — website, listing, konten, SEO, GEO, sosial, dan
              reputasi — dalam satu roda. Lihat skor total dan rinciannya sekilas, lalu biarkan konten yang platform buat
              menaikkannya minggu demi minggu.
            </p>
            <CenterPills />
          </div>
          <div style={{ justifySelf: "center" }}>
            <PresenceCard score={70} />
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="wrap" style={{ padding: "40px 0" }}>
        <SectionTitle hand="hitung dulu" max="26ch">Cicilan KPR, langsung di ujung jari.</SectionTitle>
        <KprCalc compact />
      </section>

      {/* PRICING teaser */}
      <section className="wrap" style={{ padding: "56px 0 24px" }}>
        <SectionTitle hand="harga jujur" max="24ch">Satu harga, semua alat kehadiran Anda.</SectionTitle>
        <p className="lead" style={{ textAlign: "center", margin: "-30px auto 40px", maxWidth: "60ch" }}>
          Rp 300rb/bulan untuk website, listing, studio video & konten AI, dan Skor Cakra. Business — otomasi, analitik, WhatsApp & ads — segera hadir.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, alignItems: "stretch" }}>
          {[
            { name: "Pro", price: "Rp 300rb", per: "/bulan", note: "paling populer", feats: ["Website + domain sendiri", "Listing tak terbatas", "Studio video & konten AI", "GEO penuh + jadwal otomatis"], cta: "Mulai sekarang", href: "/onboarding", hi: true, soon: false },
            { name: "Business", price: "Segera hadir", per: "", note: "coming soon", feats: ["Otomasi media sosial", "Analitik mendalam", "Integrasi WhatsApp", "Manajemen & analitik ads"], cta: "Beri tahu saya", href: "/contact", hi: false, soon: true },
            { name: "Studio / Agensi", price: "Hubungi kami", per: "", note: "untuk tim & brand", feats: ["Multi-seat & peran tim", "Pustaka brand & aset bersama", "Analitik tim"], cta: "Bicara dengan kami", href: "/contact", hi: false, soon: false },
          ].map((t) => (
            <div key={t.name} className="card" style={{ padding: "28px 26px", display: "flex", flexDirection: "column", position: "relative", borderColor: t.hi ? "var(--brand)" : "var(--line)", borderWidth: t.hi ? 2 : 1, background: t.hi ? "color-mix(in oklab, var(--brand) 6%, var(--surface))" : "var(--surface)", opacity: t.soon ? 0.92 : 1 }}>
              {t.hi && <span className="pill" style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--brand)", color: "#fff", fontSize: ".72rem", fontWeight: 700 }}>Paling populer</span>}
              {t.soon && <span className="pill" style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "var(--bg)", fontSize: ".72rem", fontWeight: 700 }}>Coming soon</span>}
              <div className="eyebrow" style={{ color: t.hi ? "var(--brand)" : "var(--muted)" }}>{t.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "8px 0 2px" }}>
                <span className="display" style={{ fontSize: t.soon ? "1.5rem" : "2rem", fontWeight: 700 }}>{t.price}</span>
                {t.per && <span className="muted mono" style={{ fontSize: ".9rem" }}>{t.per}</span>}
              </div>
              <div className="muted" style={{ fontSize: ".85rem", marginBottom: 16 }}>{t.note}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "grid", gap: 9 }}>
                {t.feats.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 9, fontSize: ".95rem", alignItems: "flex-start" }}>
                    <span style={{ color: t.soon ? "var(--muted)" : "var(--good)", flex: "none", marginTop: 2 }} aria-hidden="true">
                      <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.42z" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={t.href} className={t.hi ? "btn btn-brand" : "btn btn-ghost"} style={{ marginTop: "auto", justifyContent: "center", padding: ".8rem" }}>{t.cta}</Link>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/harga" className="btn btn-ghost" style={{ fontSize: "1rem", padding: ".82rem 1.5rem" }}>Lihat harga & fitur lengkap →</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="wrap" style={{ padding: "0 0 40px" }}>
        <div style={{ position: "relative", overflow: "hidden", background: "var(--ink)", borderRadius: "var(--radius-lg)", padding: "clamp(48px, 8vw, 92px) clamp(28px, 6vw, 64px)", textAlign: "center" }}>
          <div aria-hidden style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", background: "var(--c-solar)", filter: "blur(90px)", opacity: 0.4, top: -120, left: -80 }} />
          <div aria-hidden style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "var(--c-throat)", filter: "blur(96px)", opacity: 0.34, bottom: -130, right: -60 }} />
          <div aria-hidden style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "var(--c-root)", filter: "blur(90px)", opacity: 0.3, bottom: -80, left: "40%" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span className="hand" style={{ fontSize: "2rem", color: "var(--brand)", display: "inline-block", transform: "rotate(-2deg)" }}>ayo mulai hari ini</span>
            <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(2.4rem, 4.8vw, 3.6rem)", margin: "8px auto 0", maxWidth: "18ch", color: "var(--bg)", lineHeight: 1.03 }}>
              Siap menjadi agen yang tak terlewatkan?
            </h2>
            <p style={{ color: "color-mix(in oklab, var(--bg) 78%, transparent)", maxWidth: "52ch", margin: "18px auto 30px", fontSize: "1.18rem" }}>
              Mulai dari onboarding singkat — cakra yang membangun kehadiran digital Anda. Tanpa kartu kredit.
            </p>
            <Link href="/onboarding" className="btn btn-brand" style={{ fontSize: "1.08rem", padding: ".95rem 1.9rem" }}>Mulai sekarang</Link>
            <p style={{ color: "color-mix(in oklab, var(--bg) 62%, transparent)", margin: "20px auto 0", fontSize: ".92rem" }}>
              Website, domain, konten, dan lead selalu milik Anda — bawa pergi kapan saja.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="wrap" style={{ padding: "72px 0 40px" }}>
        <SectionTitle hand="agen perintis" max="24ch">Dibangun bersama angkatan pertama agen cakra.</SectionTitle>
        <p className="lead" style={{ textAlign: "center", margin: "-30px auto 40px", maxWidth: "58ch" }}>
          Kami sedang memilih agen papan atas sebagai angkatan perintis. Berikut gambaran hasil yang kami targetkan bersama mereka.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {TESTI.map((t) => (
            <div key={t.n} className="card" style={{ padding: 30, display: "flex", flexDirection: "column" }}>
              <div style={{ color: "var(--brand)", letterSpacing: 3, marginBottom: 14, fontSize: "1rem" }} aria-label="5 dari 5 bintang">★★★★★</div>
              <p className="display" style={{ fontSize: "1.18rem", lineHeight: 1.5, fontStyle: "italic", margin: "0 0 22px", fontWeight: 500 }}>“{t.q}”</p>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: `var(${t.c})`, color: "#fff", fontWeight: 700, fontSize: "1.05rem" }}>{t.n.charAt(0)}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".98rem" }}>{t.n}</div>
                  <div className="muted" style={{ fontSize: ".84rem" }}>{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="muted" style={{ textAlign: "center", marginTop: 20, fontSize: ".8rem" }}>
          Ilustrasi hasil yang ditargetkan; testimoni terverifikasi dari agen perintis akan tampil di sini.
        </p>
      </section>

      {/* BLOG FROM HUB */}
      <section className="wrap" style={{ padding: "72px 0 40px" }}>
        <SectionTitle hand="wawasan terbaru" max="22ch">Wawasan pasar untuk agen yang cerdas.</SectionTitle>
        <p className="lead" style={{ textAlign: "center", margin: "-30px auto 40px" }}>
          Artikel dari cakra Hub — dibaca, dibagikan, dan diam-diam menaikkan SEO serta GEO Anda.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {POSTS.map((p) => (
            <Link key={p.title} href="/hub" className="card" style={{ overflow: "hidden", padding: 0, textDecoration: "none", color: "inherit", display: "block" }}>
              <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--surface-2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span className="pill" style={{ position: "absolute", top: 12, left: 12, background: "color-mix(in oklab, var(--bg) 88%, transparent)", fontSize: ".72rem" }}>{p.cat}</span>
              </div>
              <div style={{ padding: 22 }}>
                <h3 className="display" style={{ fontSize: "1.42rem", fontWeight: 600, margin: "0 0 8px" }}>{p.title}</h3>
                <p className="muted" style={{ fontSize: ".95rem", margin: "0 0 14px" }}>{p.ex}</p>
                <span className="mono muted" style={{ fontSize: ".78rem" }}>{p.read} baca · Hub</span>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link href="/hub" className="btn btn-ghost" style={{ fontSize: "1rem", padding: ".82rem 1.5rem" }}>Baca semua di Hub →</Link>
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section className="wrap" style={{ padding: "20px 0 40px" }}>
        <div className="card" data-sub style={{ overflow: "hidden", display: "grid", gridTemplateColumns: ".82fr 1.18fr", background: "var(--surface-2)", borderColor: "color-mix(in oklab, var(--brand) 22%, var(--line))" }}>
          <div style={{ position: "relative", minHeight: 300 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/subscribe.webp" alt="Amplop krem dengan segel lilin kuningan dan kopi — buletin cakra untuk agen properti" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ padding: "clamp(32px, 4.5vw, 60px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span className="hand gold" style={{ fontSize: "1.8rem", display: "inline-block", transform: "rotate(-2deg)" }}>tetap relevan</span>
            <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(2rem, 3.6vw, 3rem)", margin: "6px 0 12px", maxWidth: "18ch", lineHeight: 1.06 }}>
              Update pasar & tips properti, tiap minggu.
            </h2>
            <p className="muted" style={{ maxWidth: "46ch", margin: "0 0 26px", fontSize: "1.08rem", lineHeight: 1.6 }}>
              Satu email seminggu — satu tren pasar, satu ide pemasaran, satu langkah agar Anda makin mudah ditemukan.
            </p>
            <form style={{ display: "flex", gap: 10, maxWidth: 500, flexWrap: "wrap" }}>
              <input placeholder="anda@email.com" type="email" style={{ flex: "1 1 240px", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 12, color: "var(--ink)", padding: ".95rem 1.1rem", font: "inherit", fontSize: "1rem", boxShadow: "var(--shadow-soft)" }} />
              <button type="button" className="btn btn-brand" style={{ padding: ".95rem 1.8rem", fontSize: "1rem" }}>Dapatkan buletin gratis</button>
            </form>
            <p className="muted" style={{ marginTop: 14, fontSize: ".82rem" }}>Tanpa spam. Berhenti kapan saja.</p>
          </div>
        </div>
      </section>

      <style>{`
        .journey{ display:grid; grid-template-columns:repeat(6,1fr); gap:18px; text-align:center; }
        .jnode{ display:flex; flex-direction:column; align-items:center; }
        .jicon{ width:104px; height:104px; border-radius:50%; background:#fff; border:1px solid var(--line-2);
          display:grid; place-items:center; box-shadow:var(--shadow-soft); position:relative; z-index:1; }
        .jline{ position:absolute; left:9%; right:9%; top:52px; height:0; border-top:2px dashed color-mix(in oklab,var(--brand) 55%, var(--line-2)); z-index:0; }
        @media (max-width: 900px){
          [data-presence]{ grid-template-columns:1fr !important; }
          [data-punch]{ grid-template-columns:1fr !important; }
          [data-sub]{ grid-template-columns:1fr !important; }
          .journey{ grid-template-columns:repeat(2,1fr); gap:30px; }
          .jline{ display:none; }
        }
      `}</style>
    </main>
  );
}
