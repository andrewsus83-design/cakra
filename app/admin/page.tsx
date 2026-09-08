"use client";
import { useEffect, useState } from "react";
import { CakraMark } from "@/components/CakraMark";
import { StaffAdmin } from "./StaffAdmin";

type Sec = "home" | "listing" | "editor" | "content" | "assets" | "profile";

const NAV: { id: Sec; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "M12 3 2.5 11H5v10h5v-6h4v6h5V11h2.5z" },
  { id: "listing", label: "Listing", icon: "M4 5h16v3H4zM4 10.5h16v3H4zM4 16h16v3H4z" },
  { id: "editor", label: "Editor", icon: "M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm6 3v6l5-3z" },
  { id: "content", label: "Content", icon: "M6 2h9l5 5v14.2A.8.8 0 0 1 19.2 22H6a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 6 2Zm2 9h8v1.8H8zm0 4h8v1.8H8z" },
  { id: "assets", label: "Assets", icon: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z" },
];

const CENTERS = [["Website", 88, "--c-crown"], ["Listing", 74, "--c-eye"], ["Konten", 70, "--c-throat"], ["SEO", 72, "--c-heart"], ["GEO", 66, "--c-solar"], ["Social", 61, "--c-sacral"], ["Reputasi", 80, "--c-root"]] as const;
const PERF = [["Kunjungan / bln", "3.240", "+14%", "--c-eye"], ["Lead masuk", "48", "+9", "--c-heart"], ["Listing aktif", "12", "2 baru", "--c-throat"], ["Peringkat SEO", "#3", "“vila Canggu”", "--c-solar"]] as const;
const LISTINGS = [
  { t: "Vila Uluwatu Cliff", st: "Dijual", price: "Rp 14 M", views: 320 },
  { t: "Vila Canggu Estate", st: "Dijual", price: "Rp 8,5 M", views: 210 },
  { t: "Vila Seminyak Retreat", st: "Disewa", price: "Rp 3,2 M/thn", views: 180 },
  { t: "Townhouse Sanur", st: "Dijual", price: "Rp 4,8 M", views: 96 },
];
const IDEAS = [
  ["Panduan harga vila Canggu 2026", "Pasar"],
  ["5 alasan investasi properti Uluwatu", "Investasi"],
  ["Hak pakai vs PT PMA untuk pembeli asing", "Legal"],
  ["Tur 60 detik: Vila Seminyak Retreat", "Konten"],
];
const ASSETS = ["/about/hero.jpg", "/about/transform.jpg", "/hero.jpg", "/about/invite.jpg", "/blog-0.jpg", "/blog-1.jpg", "/about/vision-hill.jpg", "/hero-top.jpg"];

const SCORE = 76;

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

function MemberDashboard() {
  const [sec, setSec] = useState<Sec>("home");
  const [orient, setOrient] = useState<"9:16" | "16:9">("9:16");
  const [gen, setGen] = useState<string | null>(null);

  const r = 52, circ = 2 * Math.PI * r;

  const Home = (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, .8fr) 1.2fr", gap: 18, marginBottom: 18 }} className="adm-2">
        <Card>
          <H>Analisa profil</H>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <svg width="128" height="128" viewBox="0 0 128 128" style={{ flex: "none" }}>
              <circle cx="64" cy="64" r={r} fill="none" stroke="var(--line)" strokeWidth="11" />
              <circle cx="64" cy="64" r={r} fill="none" stroke="var(--brand)" strokeWidth="11" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - SCORE / 100)} transform="rotate(-90 64 64)" />
              <text x="64" y="60" textAnchor="middle" className="display" style={{ fontSize: 30, fontWeight: 700, fill: "var(--ink)" }}>{SCORE}</text>
              <text x="64" y="80" textAnchor="middle" style={{ fontSize: 10, fill: "var(--muted)", letterSpacing: 1 }}>PRESENCE</text>
            </svg>
            <div style={{ flex: 1, display: "grid", gap: 7 }}>
              {CENTERS.map(([n, v, c]) => (
                <div key={n}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem" }}><span>{n}</span><span className="muted mono">{v}</span></div>
                  <div style={{ height: 5, borderRadius: 3, background: "var(--line)", marginTop: 2 }}><div style={{ height: "100%", width: `${v}%`, borderRadius: 3, background: `var(${c})` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <H>Performa digital</H>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {PERF.map(([l, v, d, c]) => (
              <div key={l} style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)" }}>
                <div className="muted" style={{ fontSize: ".82rem" }}>{l}</div>
                <div className="display" style={{ fontSize: "1.7rem", fontWeight: 700, color: `var(${c})`, lineHeight: 1.1 }}>{v}</div>
                <div className="muted" style={{ fontSize: ".76rem" }}>{d}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <H>Preview website</H>
          <button style={btn("brand")} onClick={() => setSec("home")}>Edit website</button>
        </div>
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--line)" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--line-2)" }} /><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--line-2)" }} /><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--line-2)" }} />
            <span className="mono" style={{ marginLeft: 10, fontSize: ".8rem", color: "var(--muted)" }}>kirana.cakra.site</span>
            <span style={{ marginLeft: "auto", fontSize: ".74rem", fontWeight: 700, color: "var(--good)", background: "color-mix(in oklab, var(--good) 14%, var(--surface))", padding: ".2rem .5rem", borderRadius: 999 }}>Skor {SCORE} · Baik</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero.jpg" alt="Preview website member" style={{ width: "100%", display: "block", maxHeight: 260, objectFit: "cover" }} />
        </div>
        <p className="muted" style={{ fontSize: ".88rem", marginTop: 12 }}>Analisa: SEO & GEO kuat, tingkatkan konten sosial dan reputasi untuk menembus skor 85+.</p>
      </Card>
    </>
  );

  const Listing = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}><span className="pill">Semua</span><span className="pill" style={{ opacity: .6 }}>Riwayat</span></div>
        <button style={btn("brand")}>+ Tambah listing</button>
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".92rem", minWidth: 640 }}>
            <thead><tr style={{ textAlign: "left", color: "var(--muted)", fontSize: ".76rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{["Properti", "Status", "Harga", "Dilihat", ""].map((h) => <th key={h} style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>{h}</th>)}</tr></thead>
            <tbody>
              {LISTINGS.map((l) => (
                <tr key={l.t}>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", fontWeight: 600 }}>{l.t}</td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}><span style={{ color: l.st === "Dijual" ? "var(--brand)" : "var(--jade)", fontWeight: 600, fontSize: ".85rem" }}>{l.st}</span></td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }} className="mono">{l.price}</td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }} className="muted">{l.views}×</td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button style={{ ...btn("ghost"), padding: ".35rem .7rem", fontSize: ".82rem" }}>Edit</button>{" "}
                    <button style={{ ...btn("ghost"), padding: ".35rem .7rem", fontSize: ".82rem", color: "var(--crit)", borderColor: "color-mix(in oklab, var(--crit) 40%, var(--line-2))" }}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );

  const Editor = (
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr .7fr", gap: 18 }} className="adm-2">
      <Card>
        <H>Buat video listing</H>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["9:16", "16:9"] as const).map((o) => (
            <button key={o} onClick={() => setOrient(o)} style={{ ...btn(orient === o ? "brand" : "ghost"), padding: ".5rem 1rem" }}>{o === "9:16" ? "Vertikal 9:16" : "Horizontal 16:9"}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={drop}><Ic d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z" s={22} /><div style={{ fontSize: ".82rem", marginTop: 6 }}>Unggah foto</div></div>
          <div style={drop}><Ic d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm6 3v6l5-3z" s={22} /><div style={{ fontSize: ".82rem", marginTop: 6 }}>Unggah video</div></div>
          <div style={drop}><Ic d="M12 3v10.5a3.5 3.5 0 1 1-2-3.16V6h6V3h-4Z" s={22} /><div style={{ fontSize: ".82rem", marginTop: 6 }}>Audio / voice<br />(opsional)</div></div>
        </div>
        <label className="muted" style={{ fontSize: ".82rem", fontWeight: 600 }}>Deskripsi properti</label>
        <textarea rows={3} placeholder="Vila 4 kamar di Canggu, dekat pantai Berawa…" style={{ width: "100%", marginTop: 6, background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: 12, font: "inherit", fontSize: ".92rem", color: "var(--ink)", resize: "vertical" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
          <button style={btn("brand")} onClick={() => { setGen("Sedang membuat video oleh mesin…"); setTimeout(() => setGen("✓ Video 62 detik selesai dibuat."), 2200); }}>✨ Generate video otomatis</button>
          <span className="muted" style={{ fontSize: ".84rem" }}>Durasi otomatis 45–90 detik, dirangkai oleh mesin.</span>
        </div>
        {gen && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "var(--surface-2)", fontSize: ".9rem", color: gen.startsWith("✓") ? "var(--good)" : "var(--ink)" }}>{gen}</div>}
      </Card>
      <Card>
        <H>Video Anda</H>
        <div style={{ display: "grid", gap: 10 }}>
          {["Vila Uluwatu · 9:16 · 60d", "Canggu Estate · 16:9 · 75d", "Seminyak · 9:16 · 48d"].map((v) => (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "var(--surface-2)" }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--ink)", color: "var(--bg)", display: "grid", placeItems: "center" }}><Ic d="M8 5v14l11-7z" s={14} /></span>
              <span style={{ fontSize: ".86rem" }}>{v}</span><span style={{ marginLeft: "auto", fontSize: ".72rem", color: "var(--good)" }}>Selesai</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const Content = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="adm-2">
      <Card>
        <H>Ide konten</H>
        <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 12 }}>Disediakan sistem berdasarkan properti & pasar Anda.</p>
        <div style={{ display: "grid", gap: 10 }}>
          {IDEAS.map(([t, c]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)" }}>
              <div><div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--brand)", textTransform: "uppercase", letterSpacing: ".04em" }}>{c}</div><div style={{ fontWeight: 600, fontSize: ".92rem" }}>{t}</div></div>
              <button style={{ ...btn("ghost"), marginLeft: "auto", padding: ".4rem .8rem", fontSize: ".82rem" }}>Tulis</button>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <H>Tulis</H>
        <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 12 }}>AI membantu menyusun draf, Anda menyempurnakan.</p>
        <input placeholder="Judul artikel" style={{ width: "100%", marginBottom: 10, background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: ".7rem 1rem", font: "inherit", color: "var(--ink)" }} />
        <textarea rows={7} placeholder="Mulai menulis, atau klik ‘Buat draf AI’…" style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: 12, font: "inherit", fontSize: ".92rem", color: "var(--ink)", resize: "vertical" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}><button style={btn("brand")}>✨ Buat draf AI</button><button style={btn("ghost")}>Terbitkan ke Hub</button></div>
      </Card>
    </div>
  );

  const Assets = (
    <Card>
      <H>Pustaka aset cakra</H>
      <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 14 }}>Ribuan gambar & audio bebas royalti untuk video dan konten Anda.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
        {ASSETS.map((a, i) => (
          <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1/1", border: "1px solid var(--line)" }} className="adm-asset">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button style={{ position: "absolute", inset: 0, background: "rgba(20,15,9,.42)", color: "#fff", border: "none", cursor: "pointer", font: "inherit", fontWeight: 600, fontSize: ".85rem", opacity: 0, transition: ".15s" }} className="adm-use">Gunakan</button>
          </div>
        ))}
      </div>
    </Card>
  );

  const Profile = (
    <div style={{ display: "grid", gap: 18, maxWidth: 720 }}>
      <Card>
        <H>Koneksi akun</H>
        {[["Email", "kirana@email.com", true], ["Domain", "kirana.cakra.site", true], ["WhatsApp", "+62 812-0000-0000", true], ["Instagram", "Belum terhubung", false], ["TikTok", "Belum terhubung", false]].map(([k, v, on]) => (
          <div key={k as string} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
            <div><div style={{ fontWeight: 600, fontSize: ".92rem" }}>{k}</div><div className="muted" style={{ fontSize: ".84rem" }}>{v}</div></div>
            {on ? <span style={{ color: "var(--good)", fontSize: ".85rem", fontWeight: 600 }}>✓ Terhubung</span> : <button style={{ ...btn("ghost"), padding: ".4rem .9rem", fontSize: ".84rem" }}>Hubungkan</button>}
          </div>
        ))}
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="adm-2">
        <Card>
          <H>Tagihan</H>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Paket Pro</div>
          <div className="muted" style={{ fontSize: ".9rem" }}>Rp 299.000 / bulan · perpanjang 1 Okt 2026</div>
          <div className="mono" style={{ fontSize: ".86rem", marginTop: 8 }}>Kartu •••• 4242</div>
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

  const titles: Record<Sec, [string, string]> = {
    home: ["Home", "Analisa, performa, dan preview website Anda."],
    listing: ["Listing", "Kelola properti Anda — buat, ubah, hapus, riwayat."],
    editor: ["Editor", "Buat video listing otomatis dan unggah materi."],
    content: ["Content", "Ide dari sistem, lalu tulis dan terbitkan."],
    assets: ["Assets", "Pustaka aset cakra untuk semua member."],
    profile: ["Profil & pengaturan", "Koneksi, tagihan, keamanan, dan legal."],
  };
  const body = { home: Home, listing: Listing, editor: Editor, content: Content, assets: Assets, profile: Profile }[sec];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <aside className="adm-side" style={{ width: 236, flex: "none", background: "var(--surface)", borderRight: "1px solid var(--line)", padding: "18px 14px", position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px 20px" }}>
          <CakraMark size={30} /><span className="hand" style={{ fontSize: "1.7rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>
        </div>
        <nav style={{ display: "grid", gap: 3 }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setSec(n.id)} style={{ display: "flex", alignItems: "center", gap: 11, padding: ".65rem .7rem", borderRadius: 10, border: "none", cursor: "pointer", font: "inherit", fontSize: ".95rem", fontWeight: sec === n.id ? 600 : 500, textAlign: "left", background: sec === n.id ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: sec === n.id ? "var(--brand)" : "var(--ink-2)", transition: ".15s" }}>
              <Ic d={n.icon} />{n.label}
            </button>
          ))}
        </nav>
        <button onClick={() => setSec("profile")} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderRadius: 12, border: "1px solid var(--line)", background: sec === "profile" ? "var(--surface-2)" : "transparent", cursor: "pointer", font: "inherit", textAlign: "left" }}>
          <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, flex: "none" }}>K</span>
          <span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 600, fontSize: ".9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Kirana Sutanto</span><span className="muted" style={{ fontSize: ".78rem" }}>Paket Pro</span></span>
        </button>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ height: 60, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(18px,3vw,32px)", background: "color-mix(in oklab, var(--bg) 86%, transparent)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 5 }}>
          <span style={{ fontSize: ".82rem", color: "var(--warn)", fontWeight: 600 }}>● Mode terbuka · tanpa autentikasi</span>
          <a href="https://kirana.cakra.site" className="mono" style={{ fontSize: ".82rem", color: "var(--muted)", textDecoration: "none" }}>kirana.cakra.site ↗</a>
        </header>
        <main style={{ padding: "clamp(20px,3vw,34px)", maxWidth: 1120 }}>
          <h1 className="display" style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>{titles[sec][0]}</h1>
          <p className="muted" style={{ margin: "4px 0 22px" }}>{titles[sec][1]}</p>
          {body}
        </main>
      </div>

      <style>{`
        .adm-asset:hover .adm-use{ opacity:1 !important; }
        @media (max-width: 860px){ .adm-2{ grid-template-columns:1fr !important; } }
        @media (max-width: 720px){ .adm-side{ display:none !important; } }
      `}</style>
    </div>
  );
}

export default function Admin() {
  const [host, setHost] = useState<string | null>(null);
  useEffect(() => { setHost(window.location.hostname); }, []);
  const isMember = host === "member.cakra.xyz" || (host ? host.startsWith("member.") : false);
  return isMember ? <MemberDashboard /> : <StaffAdmin />;
}
