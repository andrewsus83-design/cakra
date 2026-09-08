import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ cakra — Pertanyaan Umum Agen Properti",
  description:
    "Jawaban seputar cakra: website agen properti, video & konten AI, listing, SEO, GEO, harga, dan keamanan data.",
  keywords: ["FAQ cakra", "agen properti", "website agen properti", "GEO properti", "video listing AI"],
};

const FAQ_SECTIONS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Tentang cakra",
    items: [
      { q: "Apa itu cakra?", a: "cakra adalah platform “roda kehadiran” untuk agen properti — membantu Anda punya website sendiri, konten & video AI, manajemen listing, dan skor kehadiran di SEO, GEO, dan media sosial. Tujuannya satu: Anda lebih mudah ditemukan dan dipercaya di era pencarian AI." },
      { q: "Untuk siapa cakra dibuat?", a: "Untuk agen properti yang ingin membangun brand dan kehadiran sendiri — terutama agen papan atas yang menutup transaksi Rp 1 miliar+ per bulan. Cocok untuk agen independen maupun yang tergabung di sebuah agensi." },
      { q: "Apakah saya perlu keahlian teknis?", a: "Tidak. Semuanya dirancang untuk agen, bukan developer. Website, listing, dan konten dibuat lewat antarmuka sederhana; AI menangani bagian teknisnya." },
      { q: "Apa bedanya cakra dengan marketplace properti?", a: "Marketplace menampilkan listing Anda bersama ribuan agen lain. cakra membangun kehadiran milik Anda sendiri — website, brand, dan reputasi yang Anda kendalikan penuh — dan bekerja melengkapi kanal lain yang sudah Anda gunakan." },
      { q: "Saya sudah punya website — kenapa harus pindah?", a: "cakra bukan sekadar website. Ia menjaga situs Anda selalu terisi konten baru, mengoptimasinya untuk Google & pencarian AI (GEO), dan mengukur kehadiran Anda dalam satu skor. Anda tetap bisa memakai domain lama Anda." },
      { q: "Apa bedanya dengan menyewa agensi pemasaran atau VA?", a: "Agensi dan VA menagih mahal tiap bulan dan tetap butuh arahan Anda. cakra memberi hasil setara — website, video, artikel, dan optimasi pencarian — secara otomatis dan konsisten, dengan biaya jauh lebih kecil dan kendali penuh di tangan Anda." },
    ],
  },
  {
    title: "Website & Listing",
    items: [
      { q: "Apakah saya mendapat website sendiri?", a: "Ya. Setiap agen mendapat website properti profesional yang siap tampil di Google dan pencarian AI, mudah diedit kapan saja, dan mencerminkan brand Anda." },
      { q: "Bagaimana cara menambah dan mengelola listing?", a: "Lewat dashboard: unggah foto, isi detail, dan tetapkan status jual atau sewa. Tiap unit otomatis mendapat halaman dan skor pencarian lokal (GEO)-nya sendiri." },
      { q: "Bisakah saya memakai domain sendiri?", a: "Bisa. Hubungkan domain yang sudah Anda miliki, atau daftarkan domain baru langsung dari cakra." },
      { q: "Apakah website-nya mobile-friendly?", a: "Ya. Setiap website responsif dan cepat di ponsel — tempat mayoritas calon pembeli mencari properti hari ini." },
    ],
  },
  {
    title: "Konten & Video AI",
    items: [
      { q: "Bagaimana video listing AI bekerja?", a: "Dari foto dan deskripsi properti, cakra menyusun film 45–90 detik yang memadukan animasi sinematik dan gerak editorial natural (pan, zoom, ken burns), lengkap dengan musik." },
      { q: "Apakah saya bisa mengedit hasil AI?", a: "Ya. Setiap video, artikel, dan halaman bisa Anda sunting sebelum terbit — AI memberi draf awal, keputusan akhir tetap di tangan Anda." },
      { q: "Apa itu artikel & blog otomatis?", a: "cakra menyusun artikel pasar dan panduan area yang relevan dengan properti Anda dari riset AI — siap terbit untuk menarik pembeli dan memperkuat SEO Anda." },
      { q: "Apakah ada pustaka aset?", a: "Ya. Ribuan gambar dan audio bebas royalti tersedia untuk video dan konten Anda, tanpa biaya lisensi tambahan." },
      { q: "Apakah konten AI akan terdengar generik dan merusak nama saya?", a: "Tidak. Setiap draf dipersonalisasi dari onboarding Anda — area, tipe properti, dan gaya bahasa — dan bisa Anda sunting sebelum terbit. AI memberi draf; keputusan akhir dan suara tetap milik Anda." },
    ],
  },
  {
    title: "SEO, GEO & Social",
    items: [
      { q: "Apa itu GEO?", a: "GEO (Generative Engine Optimization) adalah optimasi agar Anda muncul di mesin pencari AI seperti ChatGPT dan Google AI. Saat calon pembeli bertanya “agen properti tepercaya di area ini”, nama Anda yang disebut." },
      { q: "Apa itu skor kehadiran?", a: "Satu skor yang merangkum tujuh pusat kehadiran Anda — Website, Listing, Konten, SEO, GEO, Social, dan Reputasi — sehingga Anda tahu persis langkah berikutnya untuk bertumbuh." },
      { q: "Apakah cakra menjamin peringkat satu di Google?", a: "Tidak ada yang bisa menjamin peringkat pasti. Yang cakra lakukan adalah membangun fondasi terbaik — konten, struktur, dan sinyal — yang membuat Anda konsisten lebih mudah ditemukan dari waktu ke waktu." },
      { q: "Apakah Google menghukum konten buatan AI?", a: "Tidak, selama kontennya bermanfaat dan akurat. Google menilai kualitas dan relevansi, bukan cara pembuatannya. cakra fokus pada konten yang benar-benar berguna bagi pembeli — dan Anda selalu bisa menyuntingnya sebelum terbit." },
    ],
  },
  {
    title: "Harga & Langganan",
    items: [
      { q: "Berapa biayanya?", a: "cakra bisa dimulai gratis. Paket Pro Rp 300.000/bulan membuka semua alat: publish + domain sendiri, listing tak terbatas, studio video & konten AI, dan GEO penuh. Rincian lengkap ada di halaman Harga." },
      { q: "Apakah harganya sepadan?", a: "Rp 300.000/bulan setara kurang dari 0,1% komisi dari satu vila Rp 3 M. Satu listing tambahan yang closing sudah menutup biaya cakra untuk setahun penuh." },
      { q: "Apakah ada masa coba gratis?", a: "Ya. Mulai gratis tanpa kartu kredit — bangun situs & Skor Cakra Anda, rasakan hasilnya, lalu upgrade ke Pro saat Anda siap." },
      { q: "Bisakah saya berhenti kapan saja?", a: "Bisa. Langganan bulanan tanpa kontrak jangka panjang — berhenti kapan saja, tanpa penalti. Website, domain, konten, dan lead tetap milik Anda." },
    ],
  },
  {
    title: "Data & Keamanan",
    items: [
      { q: "Siapa pemilik data dan konten saya?", a: "Anda. Website, listing, konten, dan lead sepenuhnya milik Anda. cakra adalah alat; presence dan brand tetap di tangan Anda." },
      { q: "Apakah data saya aman?", a: "Ya. Data disimpan dengan standar keamanan modern, dan Anda dapat mengekspor atau menghapusnya kapan saja." },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_SECTIONS.flatMap((s) =>
    s.items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    }))
  ),
};

export default function Page() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* header */}
      <section className="wrap" style={{ padding: "clamp(40px, 6vw, 76px) 0 20px", textAlign: "center" }}>
        <p className="hand gold" style={{ fontSize: "1.8rem", transform: "rotate(-2deg)", margin: 0 }}>ada pertanyaan?</p>
        <h1 className="display" style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 700, maxWidth: "20ch", margin: "6px auto 0" }}>
          Semua yang perlu Anda tahu tentang cakra.
        </h1>
        <p className="lead" style={{ margin: "20px auto 0", textAlign: "center" }}>
          Dari cara kerja website dan video AI, sampai GEO, harga, dan keamanan data — dijawab singkat dan jelas.
        </p>
      </section>

      {/* sections */}
      <section className="wrap" style={{ padding: "24px 0 40px" }}>
        <div className="faq-grid">
          {FAQ_SECTIONS.map((sec) => (
            <div key={sec.title} className="faq-col">
              <div className="eyebrow" style={{ marginBottom: 6, fontSize: ".82rem" }}>{sec.title}</div>
              <div>
                {sec.items.map((it) => (
                  <details key={it.q} className="faq">
                    <summary>
                      <span>{it.q}</span>
                      <svg className="faq-chev" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                    </summary>
                    <div className="faq-a">{it.a}</div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="wrap" style={{ padding: "8px 0 88px" }}>
        <div className="card" style={{ padding: "clamp(28px, 5vw, 48px)", textAlign: "center", background: "var(--surface-2)", borderColor: "color-mix(in oklab, var(--brand) 22%, var(--line))" }}>
          <h2 className="display" style={{ fontSize: "clamp(1.6rem, 3vw, 2.3rem)", fontWeight: 700, margin: 0 }}>Masih ada pertanyaan?</h2>
          <p className="muted" style={{ margin: "10px auto 22px", maxWidth: "44ch", fontSize: "1.05rem" }}>Tim kami — sesama orang properti — siap membantu Anda memulai.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/harga" className="btn btn-ghost" style={{ fontSize: "1rem", padding: ".85rem 1.6rem" }}>Lihat harga</Link>
            <Link href="/onboarding" className="btn btn-brand" style={{ fontSize: "1rem", padding: ".85rem 1.6rem" }}>Mulai gratis</Link>
          </div>
        </div>
      </section>

      <style>{`
        .faq-grid{ display:grid; grid-template-columns:1fr 1fr; gap:6px 56px; align-items:start; }
        .faq-col{ margin-bottom:26px; }
        .faq{ border-bottom:1px solid var(--line); }
        .faq summary{ list-style:none; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:18px;
          padding:22px 4px; font-weight:600; font-size:1.24rem; color:var(--ink); }
        .faq summary::-webkit-details-marker{ display:none; }
        .faq summary:hover{ color:var(--brand); }
        .faq .faq-chev{ flex:none; transition:transform .25s ease; color:var(--brand); }
        .faq[open] .faq-chev{ transform:rotate(180deg); }
        .faq .faq-a{ padding:0 4px 24px; color:var(--muted); font-size:1.14rem; line-height:1.68; max-width:66ch; }
        @media (max-width: 820px){ .faq-grid{ grid-template-columns:1fr; gap:0; } }
      `}</style>
    </main>
  );
}
