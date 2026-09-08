"use client";
import Link from "next/link";
import { useRef, useState } from "react";

type Article = {
  id: number; cat: string; title: string; excerpt: string; img: string; read: string; author: string;
  likes: number; body: string[]; featured?: boolean;
};

const ARTICLES: Article[] = [
  { id: 1, cat: "Pasar", title: "Panduan harga properti Canggu 2026", excerpt: "Tren harga tanah dan vila di kawasan pertumbuhan baru Bali — dan apa artinya bagi pembeli Anda.", img: "/about/hero.jpg", read: "8 menit", author: "Andi Pratama", likes: 128, featured: true, body: ["Canggu terus menjadi magnet investasi properti di Bali. Dalam dua tahun terakhir, harga tanah di koridor Berawa–Pererenan naik dua digit, didorong permintaan vila sewa dan hunian ekspatriat.", "Bagi agen, ini berarti dua hal: pembeli semakin teredukasi, dan kecepatan informasi menentukan siapa yang dipercaya. Konten pasar yang rapi membuat Anda tampak sebagai rujukan, bukan sekadar perantara.", "Kuncinya bukan menurunkan harga, melainkan menjelaskan nilai — lokasi, legalitas, dan potensi imbal hasil — dengan bahasa yang menenangkan pembeli."] },
  { id: 2, cat: "Tips", title: "5 cara video listing menaikkan closing", excerpt: "Mengapa satu video 60 detik mengalahkan 20 foto — dan cara membuatnya dalam hitungan menit dengan AI.", img: "/blog-1.jpg", read: "5 menit", author: "Sarah Wijaya", likes: 96, featured: true, body: ["Video memberi konteks yang tidak bisa ditangkap foto: alur ruangan, cahaya, dan skala. Pembeli yang menonton video listing tinggal lebih lama dan datang ke viewing dengan niat lebih kuat.", "Dengan AI, video 45–90 detik bisa dibuat dari foto dan deskripsi dalam menit — lengkap dengan gerak sinematik dan musik. Fokuskan 3 detik pertama pada momen terbaik properti."] },
  { id: 3, cat: "Ditemukan", title: "SEO lokal & pencarian AI untuk agen", excerpt: "Agar nama Anda muncul saat calon pembeli mencari “agen properti di area Anda” — di Google dan AI.", img: "/about/vision.jpg", read: "6 menit", author: "Budi Santoso", likes: 74, featured: true, body: ["Pencarian berubah. Banyak pembeli kini bertanya ke asisten AI sebelum membuka marketplace. Yang disebut adalah agen dengan kehadiran paling jelas dan konsisten.", "GEO — optimasi untuk mesin pencari generatif — dimulai dari konten yang menjawab pertanyaan nyata pembeli, ditulis rapi dan kredibel di website Anda sendiri."] },
  { id: 4, cat: "Konten", title: "Kalender konten 30 hari untuk agen sibuk", excerpt: "Rencana posting yang realistis: apa yang ditulis, kapan, dan bagaimana AI meringankan bebannya.", img: "/about/origin.jpg", read: "7 menit", author: "Sarah Wijaya", likes: 58, body: ["Konsistensi mengalahkan intensitas. Satu posting bernas per pekan lebih kuat daripada sepuluh dalam sehari lalu senyap sebulan.", "Bagi konten menjadi tiga jenis: edukasi pasar, cerita properti, dan bukti sosial. AI membantu menyusun draf; sentuhan Anda membuatnya terpercaya."] },
  { id: 5, cat: "AI", title: "Apa itu GEO, dan kenapa agen harus peduli", excerpt: "Mesin pencari AI mulai menjawab langsung. Inilah cara memastikan jawabannya menyebut Anda.", img: "/punch.jpg", read: "5 menit", author: "Budi Santoso", likes: 141, body: ["GEO (Generative Engine Optimization) adalah seni membuat konten Anda mudah dikutip oleh asisten AI. Kalimat yang jelas dan definitif lebih mungkin dijadikan jawaban.", "Mulailah dari halaman area dan FAQ yang menjawab pertanyaan pembeli secara langsung — itulah bahan baku yang dibaca mesin AI."] },
  { id: 6, cat: "Studi Kasus", title: "Dari tak terlihat jadi rujukan dalam 90 hari", excerpt: "Bagaimana seorang agen kawasan membangun presence dan menutup lebih banyak lewat website sendiri.", img: "/about/transform.jpg", read: "9 menit", author: "Andi Pratama", likes: 87, body: ["Awalnya semua lead datang dari marketplace. Dalam tiga bulan membangun website, konten area, dan reputasi, arus lead langsung mulai tumbuh.", "Yang berubah bukan hanya jumlah lead, tetapi kualitasnya — pembeli datang sudah mengenal dan mempercayai."] },
  { id: 7, cat: "Tips", title: "Foto properti: 8 kesalahan yang menurunkan minat", excerpt: "Cahaya, sudut, dan urutan. Perbaikan kecil yang membuat listing terlihat jauh lebih mahal.", img: "/hero.jpg", read: "6 menit", author: "Sarah Wijaya", likes: 63, body: ["Foto pertama menentukan klik. Pilih bidikan dengan cahaya alami terbaik dan komposisi paling lapang.", "Hindari lensa terlalu lebar yang mendistorsi ruangan — kepercayaan pembeli lebih berharga daripada kesan luas yang menyesatkan."] },
  { id: 8, cat: "Pasar", title: "Program 3 Juta Rumah: peluang bagi agen", excerpt: "Permintaan hunian melonjak. Bagaimana memposisikan diri di segmen yang sedang tumbuh.", img: "/blog-0.jpg", read: "7 menit", author: "Budi Santoso", likes: 52, body: ["Dorongan penyediaan rumah membuka segmen pembeli pertama yang besar. Agen yang paham skema pembiayaan menjadi pemandu yang dicari.", "Konten yang menjelaskan proses dengan sabar akan menarik pembeli yang belum percaya diri."] },
  { id: 9, cat: "Konten", title: "Menulis deskripsi listing yang menjual", excerpt: "Formula sederhana: rasa, fakta, ajakan. Plus contoh sebelum–sesudah.", img: "/blog-2.jpg", read: "4 menit", author: "Andi Pratama", likes: 71, body: ["Buka dengan rasa (bayangkan pagi di teras ini), lanjut dengan fakta (3 kamar, hadap timur), tutup dengan ajakan yang jelas.", "Hindari klise. Detail spesifik yang jujur jauh lebih meyakinkan daripada kata sifat berlebihan."] },
  { id: 10, cat: "AI", title: "Reputasi digital: menabung kepercayaan", excerpt: "Ulasan, konsistensi, dan rekam jejak yang bekerja untuk Anda bahkan saat sedang tidur.", img: "/about/invite.jpg", read: "5 menit", author: "Sarah Wijaya", likes: 66, body: ["Reputasi adalah bunga majemuk. Setiap ulasan baik dan konten bermanfaat menambah saldo kepercayaan yang berbunga seiring waktu.", "Minta ulasan pada momen bahagia — tepat setelah serah terima kunci."] },
  { id: 11, cat: "Pasar", title: "Suku bunga & daya beli properti 2026", excerpt: "Bagaimana pergerakan suku bunga memengaruhi keputusan pembeli — dan cara menjelaskannya dengan tenang.", img: "/blog-2.jpg", read: "6 menit", author: "Budi Santoso", likes: 44, body: ["Perubahan suku bunga menggeser daya beli, terutama pada segmen KPR. Pembeli yang cemas mencari agen yang menenangkan dengan angka, bukan janji.", "Siapkan simulasi cicilan pada beberapa skenario bunga. Kejelasan membangun kepercayaan."] },
  { id: 12, cat: "Tips", title: "Skrip follow-up WhatsApp yang tak memaksa", excerpt: "Tiga pesan lanjutan yang menjaga percakapan tetap hangat tanpa terasa mengejar.", img: "/blog-0.jpg", read: "4 menit", author: "Sarah Wijaya", likes: 89, body: ["Follow-up yang baik memberi nilai, bukan tekanan. Kirim informasi baru — bukan sekadar “sudah dipikirkan, Kak?”.", "Beri jeda yang sopan dan selalu tutup dengan satu langkah kecil yang mudah dijawab."] },
  { id: 13, cat: "Ditemukan", title: "Google Business Profile untuk agen properti", excerpt: "Cara muncul di peta dan pencarian lokal saat pembeli menelusuri area Anda.", img: "/hero-top.jpg", read: "5 menit", author: "Budi Santoso", likes: 51, body: ["Profil bisnis yang lengkap dan aktif membuat Anda muncul saat orang mencari “agen properti dekat sini”.", "Perbarui foto, jawab ulasan, dan tautkan ke website Anda agar sinyal lokal makin kuat."] },
  { id: 14, cat: "Studi Kasus", title: "Satu artikel area, dua belas lead", excerpt: "Bagaimana panduan lingkungan yang jujur menarik pembeli serius sepanjang kuartal.", img: "/about/vision.jpg", read: "7 menit", author: "Andi Pratama", likes: 103, body: ["Sebuah panduan area yang menjawab pertanyaan nyata — sekolah, akses, harga — menjadi magnet pencarian.", "Karena ditulis rapi dan kredibel, artikel itu terus bekerja dan dikutip bahkan oleh asisten AI."] },
  { id: 15, cat: "Konten", title: "Tur properti 60 detik dari 10 foto", excerpt: "Alur sederhana mengubah foto listing menjadi video yang membuat pembeli datang lebih siap.", img: "/about/transform.jpg", read: "5 menit", author: "Sarah Wijaya", likes: 77, body: ["Urutkan foto sesuai alur kunjungan: fasad, ruang utama, kamar, lalu momen terbaik sebagai penutup.", "Tambahkan teks singkat dan musik lembut. AI merangkainya menjadi tur 60 detik dalam menit."] },
  { id: 16, cat: "AI", title: "Etika memakai AI dalam pemasaran properti", excerpt: "Batas yang menjaga kepercayaan: transparansi, akurasi, dan sentuhan manusia.", img: "/punch.jpg", read: "6 menit", author: "Andi Pratama", likes: 62, body: ["AI mempercepat pekerjaan, tetapi klaim tetap harus akurat dan foto tidak menyesatkan. Kepercayaan lebih mahal dari kecepatan.", "Gunakan AI untuk draf dan ide; biarkan penilaian akhir tetap di tangan Anda."] },
];

const CATS = ["Semua", ...Array.from(new Set(ARTICLES.map((a) => a.cat)))];

function Toast({ msg }: { msg: string }) {
  return <div style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "var(--bg)", padding: ".7rem 1.2rem", borderRadius: 12, boxShadow: "var(--shadow)", zIndex: 120, fontSize: ".9rem" }}>{msg}</div>;
}

export default function Page() {
  const railRef = useRef<HTMLDivElement>(null);
  const [cat, setCat] = useState("Semua");
  const [open, setOpen] = useState<Article | null>(null);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, { name: string; text: string }[]>>({
    1: [{ name: "Rina", text: "Sangat membantu untuk klien saya di Berawa!" }],
    5: [{ name: "Dimas", text: "Baru sadar soal GEO. Langsung praktik." }],
  });
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [subEmail, setSubEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const featured = ARTICLES.filter((a) => a.featured);
  const shown = cat === "Semua" ? ARTICLES : ARTICLES.filter((a) => a.cat === cat);
  const scrollRail = (dir: number) => railRef.current?.scrollBy({ left: dir * 420, behavior: "smooth" });

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1800); };
  const toggleLike = (id: number) => setLiked((p) => ({ ...p, [id]: !p[id] }));
  const share = (a: Article) => {
    const url = `https://cakra.xyz/hub/${a.id}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => showToast("Tautan disalin ✓")).catch(() => showToast("Tautan: " + url));
    else showToast("Tautan: " + url);
  };
  const addComment = (id: number) => {
    const t = draft.trim();
    if (!t) return;
    setComments((p) => ({ ...p, [id]: [...(p[id] || []), { name: "Anda", text: t }] }));
    setDraft("");
  };

  return (
    <main>
      {/* HERO */}
      <section style={{ position: "relative", minHeight: "62vh", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: "linear-gradient(180deg, #000 78%, transparent 100%)", maskImage: "linear-gradient(180deg, #000 78%, transparent 100%)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/about/origin.jpg" alt="Meja kerja hangat — wawasan dan konten untuk agen properti" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="photo-scrim" />
        </div>
        <div className="wrap" style={{ position: "relative", paddingTop: 120, paddingBottom: "clamp(80px, 11vh, 130px)" }}>
          <p className="hand" style={{ color: "var(--brand)", fontSize: "1.7rem", transform: "rotate(-2deg)", margin: 0 }}>wawasan & konten</p>
          <h1 className="display on-photo" style={{ fontSize: "clamp(2.4rem, 5.2vw, 4rem)", fontWeight: 700, maxWidth: "16ch", lineHeight: 1.05, marginTop: 6 }}>
            <span className="hand" style={{ fontWeight: 700, fontSize: "1.14em", lineHeight: 1 }}>cakra</span>Hub — belajar, terapkan, bertumbuh.
          </h1>
          <p className="on-photo-soft" style={{ fontSize: "1.2rem", maxWidth: "50ch", marginTop: 16, lineHeight: 1.6 }}>
            Tren pasar, ide pemasaran, dan perkembangan AI untuk agen properti — ringkas, praktis, dan siap dipakai hari ini.
          </p>
        </div>
      </section>

      {/* FEATURED rail */}
      <section className="wrap" style={{ padding: "10px 0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="eyebrow">Pilihan editor</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => scrollRail(-1)} aria-label="Sebelumnya" className="rail-btn">‹</button>
            <button onClick={() => scrollRail(1)} aria-label="Berikutnya" className="rail-btn">›</button>
          </div>
        </div>
        <div ref={railRef} className="rail">
          {featured.map((a) => (
            <button key={a.id} className="feat-card" onClick={() => setOpen(a)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.img} alt={a.title} />
              <div className="feat-scrim" />
              <div className="feat-body">
                <span style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "#efd39a" }}>{a.cat}</span>
                <h3 className="display" style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, margin: "6px 0 0", textAlign: "left" }}>{a.title}</h3>
                <div style={{ color: "rgba(255,255,255,.85)", fontSize: ".85rem", marginTop: 8 }}>{a.author} · {a.read}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* category filter */}
      <section className="wrap" style={{ padding: "26px 0 4px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATS.map((c) => (
            <button key={c} onClick={() => { setCat(c); setVisibleCount(6); }} style={{ font: "inherit", fontSize: ".92rem", fontWeight: 600, cursor: "pointer", padding: ".45rem 1rem", borderRadius: 999, border: `1px solid ${cat === c ? "var(--brand)" : "var(--line-2)"}`, background: cat === c ? "var(--brand)" : "transparent", color: cat === c ? "#fff" : "var(--muted)", transition: ".2s" }}>{c}</button>
          ))}
        </div>
      </section>

      {/* masonry */}
      <section className="wrap" style={{ padding: "22px 0 84px" }}>
        <div style={{ position: "relative" }}>
        <div className="masonry">
          {shown.slice(0, visibleCount).map((a) => (
            <button key={a.id} className="pin card" onClick={() => setOpen(a)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.img} alt={a.title} />
              <div style={{ padding: 16, textAlign: "left" }}>
                <span style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--brand)" }}>{a.cat}</span>
                <h3 className="display" style={{ fontSize: "1.2rem", fontWeight: 600, margin: "6px 0 6px", lineHeight: 1.2 }}>{a.title}</h3>
                <p className="muted" style={{ fontSize: ".92rem", margin: 0, lineHeight: 1.5 }}>{a.excerpt}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: "var(--muted)", fontSize: ".82rem" }}>
                  <span>{a.author}</span><span>·</span><span>{a.read}</span>
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4 }} aria-hidden="true">♥ {a.likes + (liked[a.id] ? 1 : 0)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        {visibleCount < shown.length && (
          <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 130, background: "linear-gradient(180deg, transparent, var(--bg))", pointerEvents: "none" }} />
        )}
        </div>

        {/* subscribe — pinned above load more */}
        <div className="card" data-hubsub style={{ marginTop: 34, padding: "clamp(24px, 4vw, 40px)", background: "var(--surface-2)", borderColor: "color-mix(in oklab, var(--brand) 24%, var(--line))", display: "grid", gridTemplateColumns: "1.4fr .6fr", gap: 24, alignItems: "center" }}>
          <div>
            <p className="hand gold" style={{ fontSize: "1.6rem", transform: "rotate(-2deg)", margin: 0 }}>tetap relevan</p>
            <h3 className="display" style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 700, margin: "4px 0 8px", maxWidth: "20ch", lineHeight: 1.1 }}>Wawasan pasar & AI, tiap minggu ke email Anda.</h3>
            {subscribed ? (
              <p style={{ color: "var(--good)", fontWeight: 600, margin: "10px 0 0" }}>✓ Terima kasih! Cek email Anda untuk konfirmasi.</p>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (subEmail.trim()) setSubscribed(true); }} style={{ display: "flex", gap: 10, maxWidth: 460, flexWrap: "wrap", marginTop: 6 }}>
                <input value={subEmail} onChange={(e) => setSubEmail(e.target.value)} type="email" required placeholder="anda@email.com" style={{ flex: "1 1 220px", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 12, padding: ".85rem 1.05rem", font: "inherit", fontSize: "1rem", color: "var(--ink)" }} />
                <button type="submit" className="btn btn-brand" style={{ padding: ".85rem 1.6rem", fontSize: "1rem" }}>Langganan</button>
              </form>
            )}
            <p className="muted" style={{ fontSize: ".82rem", marginTop: 12 }}>Tanpa spam. Berhenti kapan saja.</p>
          </div>
          <div className="hubsub-icon" style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "1 / 1", boxShadow: "var(--shadow-soft)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/subscribe.jpg" alt="Buletin cakra — amplop dengan segel kuningan" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>

        {visibleCount < shown.length && (
          <div style={{ textAlign: "center", marginTop: 26 }}>
            <button onClick={() => setVisibleCount((v) => v + 6)} className="btn btn-ghost" style={{ fontSize: "1rem", padding: ".9rem 1.8rem" }}>Muat lebih banyak ↓</button>
            <p className="muted" style={{ fontSize: ".82rem", marginTop: 10 }}>Menampilkan {Math.min(visibleCount, shown.length)} dari {shown.length} artikel</p>
          </div>
        )}
      </section>

      {/* MODAL */}
      {open && (
        <div onClick={() => setOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(20,15,9,.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "grid", placeItems: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: "min(720px, 100%)", maxHeight: "88vh", overflow: "auto", padding: 0 }}>
            <div style={{ position: "relative", aspectRatio: "16/9" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={open.img} alt={open.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => setOpen(null)} aria-label="Tutup" style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(20,15,9,.55)", color: "#fff", fontSize: "1.1rem", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "clamp(22px, 4vw, 36px)" }}>
              <span style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--brand)" }}>{open.cat}</span>
              <h2 className="display" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, margin: "6px 0 6px", lineHeight: 1.15 }}>{open.title}</h2>
              <div className="muted" style={{ fontSize: ".9rem", marginBottom: 16 }}>{open.author} · {open.read}</div>
              {open.body.map((p, i) => (
                <p key={i} style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--ink-2)", margin: "0 0 14px" }}>{p}</p>
              ))}

              {/* actions */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "14px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", margin: "8px 0 18px" }}>
                <button onClick={() => toggleLike(open.id)} className="act-btn" style={{ color: liked[open.id] ? "var(--crit)" : "var(--muted)", borderColor: liked[open.id] ? "var(--crit)" : "var(--line-2)" }}>
                  {liked[open.id] ? "♥" : "♡"} {open.likes + (liked[open.id] ? 1 : 0)}
                </button>
                <button onClick={() => share(open)} className="act-btn">↗ Bagikan</button>
                <span className="act-btn" style={{ cursor: "default", marginLeft: "auto" }}>💬 {(comments[open.id]?.length || 0)} komentar</span>
              </div>

              {/* comments */}
              <div>
                {(comments[open.id] || []).map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <span style={{ flex: "none", width: 30, height: 30, borderRadius: "50%", background: "color-mix(in oklab, var(--brand) 18%, var(--surface))", color: "var(--brand)", display: "grid", placeItems: "center", fontSize: ".8rem", fontWeight: 700 }}>{c.name[0]}</span>
                    <div><div style={{ fontWeight: 600, fontSize: ".92rem" }}>{c.name}</div><div className="muted" style={{ fontSize: ".95rem" }}>{c.text}</div></div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment(open.id)} placeholder="Tulis komentar…" style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 11, padding: ".7rem 1rem", font: "inherit", fontSize: ".95rem", color: "var(--ink)" }} />
                  <button onClick={() => addComment(open.id)} className="btn btn-brand" style={{ padding: ".7rem 1.2rem" }}>Kirim</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} />}

      <style>{`
        .rail{ display:flex; gap:20px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:8px; scrollbar-width:none; }
        .rail::-webkit-scrollbar{ display:none; }
        .feat-card{ position:relative; flex:0 0 auto; width:min(400px, 82vw); aspect-ratio:16/10; border-radius:var(--radius-lg); overflow:hidden; scroll-snap-align:start; box-shadow:var(--shadow); border:none; padding:0; cursor:pointer; }
        .feat-card img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .4s; }
        .feat-card:hover img{ transform:scale(1.04); }
        .feat-scrim{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(20,15,9,.05) 35%, rgba(20,15,9,.84) 100%); }
        .feat-body{ position:absolute; left:0; right:0; bottom:0; padding:20px; }
        .rail-btn{ width:38px; height:38px; border-radius:50%; border:1px solid var(--line-2); background:var(--surface); color:var(--ink); font-size:1.3rem; line-height:1; cursor:pointer; transition:.2s; }
        .rail-btn:hover{ border-color:var(--brand); color:var(--brand); }
        .masonry{ column-count:3; column-gap:24px; }
        .pin{ display:block; width:100%; text-align:left; border:1px solid var(--line); padding:0; overflow:hidden; cursor:pointer; break-inside:avoid; margin-bottom:24px; transition:transform .18s, box-shadow .18s; }
        .pin:hover{ transform:translateY(-3px); box-shadow:var(--shadow); }
        .pin img{ width:100%; display:block; }
        .act-btn{ font:inherit; font-size:.92rem; font-weight:600; cursor:pointer; padding:.5rem .9rem; border-radius:999px; border:1px solid var(--line-2); background:transparent; color:var(--muted); transition:.2s; }
        .act-btn:hover{ border-color:var(--brand); color:var(--brand); }
        @media (max-width: 900px){ .masonry{ column-count:2; } }
        @media (max-width: 640px){ [data-hubsub]{ grid-template-columns:1fr; } .hubsub-icon{ display:none; } }
        @media (max-width: 560px){ .masonry{ column-count:1; } }
      `}</style>
    </main>
  );
}
