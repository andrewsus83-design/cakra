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
  { t: "Vila Uluwatu Cliff", st: "Dijual", price: "Rp 14 M", views: 320, img: "/about/hero.jpg", loc: "Uluwatu, Bali", kt: 5, km: 5, luas: 450, rating: 4.9, desc: "Vila tebing menghadap Samudra Hindia, kolam infinity, dan sunset privat." },
  { t: "Vila Canggu Estate", st: "Dijual", price: "Rp 8,5 M", views: 210, img: "/hero.jpg", loc: "Canggu, Bali", kt: 4, km: 4, luas: 320, rating: 4.8, desc: "Vila modern-tropis dekat pantai Berawa, taman luas, dan area hiburan." },
  { t: "Vila Seminyak Retreat", st: "Disewa", price: "Rp 3,2 M/thn", views: 180, img: "/about/transform.jpg", loc: "Seminyak, Bali", kt: 3, km: 3, luas: 260, rating: 4.7, desc: "Retreat tenang di jantung Seminyak, cocok untuk sewa jangka panjang." },
  { t: "Townhouse Sanur", st: "Dijual", price: "Rp 4,8 M", views: 96, img: "/about/invite.jpg", loc: "Sanur, Bali", kt: 3, km: 2, luas: 180, rating: 4.6, desc: "Townhouse elegan dekat pantai Sanur, desain fungsional untuk keluarga." },
];
const VIDEO_HISTORY = [
  { t: "Vila Uluwatu Cliff", ar: "9:16", dur: "1:02", date: "2 Sep 2026", poster: "/hero.jpg" },
  { t: "Canggu Estate", ar: "16:9", dur: "1:15", date: "27 Agu 2026", poster: "/about/hero.jpg" },
  { t: "Seminyak Retreat", ar: "9:16", dur: "0:48", date: "19 Agu 2026", poster: "/about/transform.jpg" },
];
const LISTING_HISTORY = [
  { t: "Vila Tegallalang", date: "1 Sep 2026", st: "Terjual" },
  { t: "Apartemen Sunset Road", date: "24 Agu 2026", st: "Tersewa" },
  { t: "Vila Uluwatu Cliff", date: "10 Agu 2026", st: "Harga diperbarui" },
  { t: "Ruko Sunset", date: "2 Agu 2026", st: "Diarsipkan" },
];
const ASSETS = ["/about/hero.jpg", "/about/transform.jpg", "/hero.jpg", "/about/invite.jpg", "/blog-0.jpg", "/blog-1.jpg", "/about/vision-hill.jpg", "/hero-top.jpg"];
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
  { t: "Panduan harga vila Canggu 2026", c: "Artikel", img: "/blog-0.jpg", meta: "6 mnt baca · SEO" },
  { t: "Reels: Tur 60 detik Vila Uluwatu", c: "Reels", img: "/about/hero.jpg", meta: "9:16 · 60 dtk" },
  { t: "Carousel: 5 tips beli vila di Bali", c: "Post", img: "/blog-1.jpg", meta: "1:1 · 5 slide" },
  { t: "Video: Investasi properti Bali", c: "YouTube", img: "/about/transform.jpg", meta: "16:9 · 3 mnt" },
];
const CONTENT_HISTORY = [
  { t: "5 alasan investasi Uluwatu", c: "Artikel", img: "/about/invite.jpg", date: "2 Sep 2026", posted: true, shared: true, down: false },
  { t: "Panduan KPR pembeli pertama", c: "Artikel", img: "/blog-2.jpg", date: "28 Agu 2026", posted: true, shared: false, down: true },
  { t: "Tur Vila Seminyak Retreat", c: "Reels", img: "/hero.jpg", date: "20 Agu 2026", posted: true, shared: true, down: true },
  { t: "Harga tanah Pererenan", c: "Artikel", img: "/about/vision-hill.jpg", date: "—", posted: false, shared: false, down: false },
];
const CONTENT_TIPS = [
  "Pembeli sering mencari “vila dekat pantai Canggu” — buat konten khusus area itu.",
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
type Voice = { name: string; desc: string; wave: number[] } | null;
const VOICES: Voice[] = [
  { name: "Ayu — Hangat", desc: "Perempuan · ramah, keibuan", wave: [5, 9, 14, 8, 12, 6, 15, 10, 7, 13, 8, 11] },
  { name: "Bima — Berwibawa", desc: "Laki-laki · dalam, meyakinkan", wave: [8, 13, 7, 15, 9, 12, 6, 14, 10, 8, 13, 7] },
  null,
];
const VOICE_STYLES = ["Hangat", "Berwibawa", "Energetik", "Lembut", "Profesional", "Ceria"];

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
const tag = (on: boolean): React.CSSProperties => ({ fontSize: ".66rem", fontWeight: 700, padding: ".2rem .5rem", borderRadius: 999, background: on ? "color-mix(in oklab, var(--good) 16%, var(--surface))" : "var(--surface)", color: on ? "var(--good)" : "var(--muted)", border: on ? "none" : "1px solid var(--line)" });
const arCss = (f: string) => f.replace(":", " / ");

function MemberDashboard() {
  const [sec, setSec] = useState<Sec>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [orient, setOrient] = useState<"9:16" | "16:9">("9:16");
  const [assetFmt, setAssetFmt] = useState("1:1");
  const [assetTab, setAssetTab] = useState<"gambar" | "bgm" | "voice">("gambar");
  const [bgmOn, setBgmOn] = useState<string | null>(null);
  const [platform, setPlatform] = useState("Instagram Post");
  const [newStatus, setNewStatus] = useState<"jual" | "sewa">("jual");
  const [listingModal, setListingModal] = useState<number | null>(null);
  const [videoModal, setVideoModal] = useState<number | null>(null);
  // background video generation — persists across section switches (component stays mounted)
  const [genState, setGenState] = useState<"idle" | "working" | "done">("idle");
  const [genPct, setGenPct] = useState(0);
  // voice creation (ElevenLabs) — 3 slots per client, permanent
  const [voiceGen, setVoiceGen] = useState<"idle" | "working" | "done">("idle");
  const [voiceStyle, setVoiceStyle] = useState("Hangat");

  useEffect(() => {
    if (genState !== "working") return;
    const id = setInterval(() => setGenPct((p) => Math.min(100, p + 6)), 320);
    return () => clearInterval(id);
  }, [genState]);
  useEffect(() => { if (genState === "working" && genPct >= 100) setGenState("done"); }, [genPct, genState]);
  useEffect(() => {
    if (voiceGen !== "working") return;
    const id = setTimeout(() => setVoiceGen("done"), 2400);
    return () => clearTimeout(id);
  }, [voiceGen]);

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

  const inp: React.CSSProperties = { width: "100%", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: ".72rem 1rem", font: "inherit", fontSize: ".92rem", color: "var(--ink)" };
  const lbl: React.CSSProperties = { fontSize: ".82rem", fontWeight: 600, display: "block", marginBottom: 6, color: "var(--ink-2)" };
  const Listing = (
    <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 18 }} className="adm-2">
      {/* LEFT: live (top) + history (bottom) */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <H>Listing live</H>
          <span style={{ fontSize: ".78rem", color: "var(--good)", fontWeight: 600 }}>● {LISTINGS.length} tayang</span>
        </div>
        <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 12 }}>Properti yang sedang tayang — klik untuk lihat detail.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {LISTINGS.map((l, i) => (
            <button key={l.t} onClick={() => setListingModal(i)} style={{ display: "block", textAlign: "left", padding: 0, border: "1px solid var(--line)", borderRadius: 13, overflow: "hidden", background: "var(--surface)", cursor: "pointer", font: "inherit" }} className="adm-thumb">
              <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.img} alt={l.t} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <span style={{ position: "absolute", top: 8, left: 8, fontSize: ".64rem", fontWeight: 700, letterSpacing: ".05em", padding: ".22rem .55rem", borderRadius: 999, color: "#fff", background: l.st === "Dijual" ? "var(--brand)" : "var(--jade)" }}>{l.st.toUpperCase()}</span>
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
        <h3 className="display" style={{ fontSize: "1.05rem", fontWeight: 600, margin: "22px 0 4px" }}>Riwayat</h3>
        <p className="muted" style={{ fontSize: ".82rem", marginBottom: 12 }}>Listing yang sudah selesai atau diarsipkan.</p>
        <div style={{ display: "grid", gap: 8 }}>
          {LISTING_HISTORY.map((h) => {
            const done = h.st === "Terjual" || h.st === "Tersewa";
            return (
              <div key={h.t + h.date} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 14px", borderRadius: 10, background: "var(--surface-2)" }}>
                <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{h.t}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
                  <span style={{ fontSize: ".7rem", fontWeight: 700, padding: ".22rem .55rem", borderRadius: 999, color: done ? "var(--good)" : "var(--muted)", background: done ? "color-mix(in oklab, var(--good) 15%, var(--surface))" : "var(--surface)", border: done ? "none" : "1px solid var(--line)" }}>{h.st}</span>
                  <span className="muted mono" style={{ fontSize: ".76rem", whiteSpace: "nowrap" }}>{h.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      {/* RIGHT: create new listing */}
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
          <div><label style={lbl}>Foto properti</label><div style={drop}><Ic d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z" s={22} /><div style={{ fontSize: ".82rem", marginTop: 6 }}>Tarik &amp; letakkan foto, atau klik untuk unggah</div></div></div>
          <div><label style={lbl}>Deskripsi</label><textarea rows={3} placeholder="Ceritakan keunggulan properti…" style={{ ...inp, resize: "vertical" }} /></div>
          <div style={{ display: "flex", gap: 10 }}><button style={btn("brand")}>Terbitkan listing</button><button style={btn("ghost")}>Simpan draf</button></div>
        </div>
      </Card>
    </div>
  );

  const posterImg = orient === "9:16" ? "/hero.jpg" : "/about/hero.jpg";
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
            <button style={{ ...btn("brand"), opacity: genState === "working" ? .6 : 1 }} disabled={genState === "working"} onClick={() => { setGenPct(0); setGenState("working"); }}>✨ Generate video otomatis</button>
            <span className="muted" style={{ fontSize: ".84rem" }}>Durasi otomatis 45–90 detik, dirangkai oleh mesin.</span>
          </div>
        </Card>
        <Card>
          <H>Riwayat video</H>
          <p className="muted" style={{ fontSize: ".84rem", marginTop: -8, marginBottom: 12 }}>Klik salah satu untuk memutarnya.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {VIDEO_HISTORY.map((v, i) => (
              <button key={v.t} onClick={() => setVideoModal(i)} style={{ display: "block", textAlign: "left", padding: 0, border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", background: "var(--surface)", cursor: "pointer", font: "inherit" }} className="adm-thumb">
                <div style={{ position: "relative", aspectRatio: "16 / 10", background: "var(--ink)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.poster} alt={v.t} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: .82 }} />
                  <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <span style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.9)", color: "var(--ink)", display: "grid", placeItems: "center", boxShadow: "0 4px 14px rgba(0,0,0,.3)" }}><Ic d="M8 5v14l11-7z" s={18} /></span>
                  </span>
                  <span style={{ position: "absolute", top: 7, left: 7, fontSize: ".6rem", fontWeight: 700, padding: ".18rem .45rem", borderRadius: 6, color: "#fff", background: "rgba(20,15,9,.6)" }} className="mono">{v.ar}</span>
                  <span style={{ position: "absolute", bottom: 7, right: 7, fontSize: ".64rem", fontWeight: 700, padding: ".18rem .45rem", borderRadius: 6, color: "#fff", background: "rgba(20,15,9,.7)" }} className="mono">{v.dur}</span>
                </div>
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontWeight: 600, fontSize: ".84rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.t}</div>
                  <div className="muted mono" style={{ fontSize: ".72rem", marginTop: 1 }}>{v.date}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* RIGHT column: player */}
      <Card style={{ position: "sticky", top: 78, alignSelf: "start", display: "flex", flexDirection: "column" }}>
        <H>Player</H>
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", background: "var(--ink)", position: "relative", aspectRatio: arCss(orient), maxHeight: 420, margin: "0 auto", width: orient === "9:16" ? "min(100%, 260px)" : "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: genState === "done" ? 1 : .38 }} />
          {genState === "done" ? (
            <button aria-label="Putar" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", border: "none", background: "rgba(20,15,9,.15)", cursor: "pointer" }}>
              <span style={{ width: 62, height: 62, borderRadius: "50%", background: "rgba(255,255,255,.92)", color: "var(--ink)", display: "grid", placeItems: "center", boxShadow: "0 8px 24px rgba(0,0,0,.3)" }}><Ic d="M8 5v14l11-7z" s={26} /></span>
            </button>
          ) : genState === "working" ? (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 20 }}>
              <div style={{ textAlign: "center", color: "#fff" }}>
                <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="6" />
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 30} strokeDashoffset={2 * Math.PI * 30 * (1 - genPct / 100)} style={{ transition: "stroke-dashoffset .3s" }} />
                </svg>
                <div className="mono" style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: 8 }}>{genPct}%</div>
                <div style={{ fontSize: ".8rem", opacity: .85, marginTop: 2 }}>Merender…</div>
              </div>
            </div>
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(255,255,255,.75)", textAlign: "center", padding: 24 }}>
              <div><Ic d="M8 5v14l11-7z" s={30} /><div style={{ fontSize: ".84rem", marginTop: 6 }}>Video akan tampil di sini<br />setelah dibuat.</div></div>
            </div>
          )}
        </div>

        {genState === "done" && (
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
            <div style={{ marginTop: 12, fontSize: ".82rem", color: "var(--good)", fontWeight: 600, textAlign: "center" }}>✓ Video 1:02 selesai dibuat</div>
            <button onClick={() => { setGenState("idle"); setGenPct(0); }} style={{ ...btn("ghost"), marginTop: 10, width: "100%", justifyContent: "center", display: "flex", fontSize: ".84rem" }}>Buat video lain</button>
          </>
        )}
        {genState === "working" && (
          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "color-mix(in oklab, var(--brand) 8%, var(--surface-2))", border: "1px solid color-mix(in oklab, var(--brand) 22%, var(--line))" }}>
            <div style={{ fontWeight: 700, fontSize: ".86rem", color: "var(--brand)", marginBottom: 4 }}>Berjalan di latar belakang</div>
            <p className="muted" style={{ fontSize: ".82rem", margin: 0, lineHeight: 1.5 }}>Anda boleh berpindah menu atau menutup halaman — video tetap dirender. Kami beri tahu saat selesai.</p>
            <button onClick={() => { setGenState("idle"); setGenPct(0); }} style={{ ...btn("ghost"), marginTop: 10, padding: ".4rem .8rem", fontSize: ".8rem" }}>Batalkan</button>
          </div>
        )}
        {genState === "idle" && (
          <p className="muted" style={{ fontSize: ".82rem", marginTop: 14, lineHeight: 1.5 }}>Unggah materi di kiri lalu tekan <strong style={{ color: "var(--ink)" }}>Generate</strong>. Proses berjalan di latar belakang, jadi Anda bebas melanjutkan pekerjaan lain.</p>
        )}
      </Card>
    </div>
  );

  const platFmt = PLATFORMS.find((p) => p.id === platform)?.fmt ?? "1:1";
  const Content = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="adm-2">
      {/* LEFT: ready + history */}
      <Card>
        <H>Konten siap dari sistem</H>
        <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 12 }}>Siap pakai berdasarkan properti & pasar Anda.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {READY_CONTENT.map((it) => (
            <div key={it.t} style={{ display: "flex", gap: 12, padding: 10, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
              <div style={{ width: 92, height: 92, borderRadius: 9, overflow: "hidden", flex: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: ".66rem", fontWeight: 700, color: "var(--brand)", textTransform: "uppercase", letterSpacing: ".05em" }}>{it.c}</div>
                <div style={{ fontWeight: 600, fontSize: ".94rem", lineHeight: 1.28, margin: "3px 0 4px" }}>{it.t}</div>
                <div className="muted mono" style={{ fontSize: ".74rem" }}>{it.meta}</div>
                <div style={{ marginTop: "auto", display: "flex", gap: 8, paddingTop: 8 }}>
                  <button style={{ ...btn("brand"), padding: ".38rem .8rem", fontSize: ".8rem" }}>Pakai konten</button>
                  <button style={{ ...btn("ghost"), padding: ".38rem .8rem", fontSize: ".8rem" }}>Pratinjau</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <h3 className="display" style={{ fontSize: "1.05rem", fontWeight: 600, margin: "24px 0 4px" }}>Riwayat</h3>
        <p className="muted" style={{ fontSize: ".82rem", marginBottom: 12 }}>Kapan dipost ke blog & status bagikan/unduh.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {CONTENT_HISTORY.map((h) => (
            <div key={h.t} style={{ display: "flex", gap: 12, padding: 10, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
              <div style={{ width: 92, height: 92, borderRadius: 9, overflow: "hidden", flex: "none", position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: h.posted ? "none" : "grayscale(.5)" }} />
                {!h.posted && <span style={{ position: "absolute", inset: 0, background: "rgba(20,15,9,.35)", color: "#fff", display: "grid", placeItems: "center", fontSize: ".68rem", fontWeight: 700 }}>DRAF</span>}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontSize: ".66rem", fontWeight: 700, color: "var(--brand)", textTransform: "uppercase", letterSpacing: ".05em" }}>{h.c}</span>
                  <span className="muted mono" style={{ fontSize: ".74rem", whiteSpace: "nowrap" }}>{h.posted ? h.date : "Belum dipost"}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: ".94rem", lineHeight: 1.28, margin: "2px 0 8px" }}>{h.t}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={tag(h.posted)}>{h.posted ? "Dipost ke blog" : "Belum dipost"}</span>
                  <span style={tag(h.shared)}>{h.shared ? "Dibagikan" : "Belum dibagikan"}</span>
                  <span style={tag(h.down)}>{h.down ? "Diunduh" : "Belum diunduh"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {/* RIGHT: write */}
      <Card>
        <H>Tulis konten</H>
        <input placeholder="Judul konten" style={{ width: "100%", marginBottom: 10, background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: ".7rem 1rem", font: "inherit", color: "var(--ink)" }} />
        <textarea rows={5} placeholder="Mulai menulis, atau klik ‘Buat draf AI’…" style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: 10, padding: 12, font: "inherit", fontSize: ".92rem", color: "var(--ink)", resize: "vertical" }} />
        <label className="muted" style={{ fontSize: ".82rem", fontWeight: 600, display: "block", margin: "14px 0 8px" }}>Pilih platform <span style={{ fontWeight: 500 }}>— aset disortir sesuai ukuran</span></label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PLATFORMS.map((p) => (
            <button key={p.id} onClick={() => setPlatform(p.id)} style={{ font: "inherit", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", padding: ".4rem .75rem", borderRadius: 999, border: `1px solid ${platform === p.id ? "var(--brand)" : "var(--line-2)"}`, background: platform === p.id ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: platform === p.id ? "var(--brand)" : "var(--ink-2)" }}>{p.id} <span className="mono" style={{ opacity: .55 }}>{p.fmt}</span></button>
          ))}
        </div>
        <label className="muted" style={{ fontSize: ".82rem", fontWeight: 600, display: "block", margin: "14px 0 8px" }}>Aset {platFmt} untuk {platform}</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(78px,1fr))", gap: 8 }}>
          <div style={{ ...drop, aspectRatio: arCss(platFmt), display: "grid", placeItems: "center", padding: 4, fontSize: ".68rem" }}>+ Unggah</div>
          {ASSETS.slice(0, 5).map((a, i) => (
            <div key={i} style={{ borderRadius: 8, overflow: "hidden", aspectRatio: arCss(platFmt), border: "1px solid var(--line)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "color-mix(in oklab, var(--brand) 8%, var(--surface-2))", border: "1px solid color-mix(in oklab, var(--brand) 20%, var(--line))" }}>
          <div style={{ fontWeight: 700, fontSize: ".82rem", color: "var(--brand)", marginBottom: 6 }}>💡 Ide dari sistem</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 5 }}>
            {CONTENT_TIPS.map((t) => <li key={t} className="muted" style={{ fontSize: ".84rem", lineHeight: 1.5 }}>{t}</li>)}
          </ul>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}><button style={btn("brand")}>✨ Buat draf AI</button><button style={btn("ghost")}>Terbitkan</button></div>
      </Card>
    </div>
  );

  const usedVoices = VOICES.filter(Boolean).length;
  const tabPill = (on: boolean): React.CSSProperties => ({ font: "inherit", fontSize: ".9rem", fontWeight: 600, cursor: "pointer", padding: ".55rem 1.1rem", borderRadius: 999, border: `1px solid ${on ? "var(--brand)" : "var(--line-2)"}`, background: on ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: on ? "var(--brand)" : "var(--ink-2)" });
  const Assets = (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {([["gambar", "Gambar"], ["bgm", "Musik / BGM"], ["voice", "Voice karakter"]] as const).map(([id, l]) => (
          <button key={id} onClick={() => setAssetTab(id)} style={tabPill(assetTab === id)}>{l}</button>
        ))}
      </div>

      {assetTab === "gambar" && (
        <Card>
          <H>Gambar siap pakai</H>
          <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 14 }}>Aset per format media sosial & video — bebas royalti.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {FORMATS.map((f) => (
              <button key={f.id} onClick={() => setAssetFmt(f.id)} style={{ font: "inherit", fontSize: ".84rem", fontWeight: 600, cursor: "pointer", padding: ".45rem .9rem", borderRadius: 999, border: `1px solid ${assetFmt === f.id ? "var(--brand)" : "var(--line-2)"}`, background: assetFmt === f.id ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: assetFmt === f.id ? "var(--brand)" : "var(--ink-2)" }}>
                <span className="mono">{f.id}</span>
              </button>
            ))}
          </div>
          <p className="muted" style={{ fontSize: ".82rem", marginBottom: 14 }}>{FORMATS.find((f) => f.id === assetFmt)?.label}</p>
          <div style={{ display: "grid", gridTemplateColumns: assetFmt === "9:16" ? "repeat(auto-fill,minmax(120px,1fr))" : "repeat(auto-fill,minmax(190px,1fr))", gap: 12 }}>
            {ASSETS.map((a, i) => (
              <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: arCss(assetFmt), border: "1px solid var(--line)" }} className="adm-asset">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button style={{ position: "absolute", inset: 0, background: "rgba(20,15,9,.42)", color: "#fff", border: "none", cursor: "pointer", font: "inherit", fontWeight: 600, fontSize: ".85rem", opacity: 0, transition: ".15s" }} className="adm-use">Gunakan</button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {assetTab === "bgm" && (
        <Card>
          <H>Musik latar (BGM)</H>
          <p className="muted" style={{ fontSize: ".86rem", marginTop: -8, marginBottom: 16 }}>Bebas royalti — untuk reels, video listing, dan konten sosial.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {BGM.map((b) => {
              const on = bgmOn === b.t;
              return (
                <div key={b.t} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 14px", borderRadius: 12, background: "var(--surface-2)", border: `1px solid ${on ? "color-mix(in oklab, var(--brand) 40%, var(--line))" : "var(--line)"}` }}>
                  <button aria-label="Putar" onClick={() => setBgmOn(on ? null : b.t)} style={{ width: 44, height: 44, borderRadius: "50%", flex: "none", border: "none", cursor: "pointer", display: "grid", placeItems: "center", background: `var(${b.c})`, color: "#fff" }}>
                    {on ? <Ic d="M7 5h4v14H7zM13 5h4v14h-4z" s={18} /> : <Ic d="M8 5v14l11-7z" s={18} />}
                  </button>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: ".92rem" }}>{b.t}</div>
                    <div className="muted" style={{ fontSize: ".78rem" }}>{b.mood}</div>
                  </div>
                  <div className={"adm-eq" + (on ? " on" : "")} aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20, flex: "none" }}>
                    {[10, 16, 7, 19, 12].map((h, i) => <span key={i} style={{ width: 3, height: h, borderRadius: 2, background: on ? `var(${b.c})` : "var(--line-2)" }} />)}
                  </div>
                  <span className="mono muted" style={{ fontSize: ".76rem", flex: "none", width: 34, textAlign: "right" }}>{b.dur}</span>
                  <button style={{ ...btn("ghost"), padding: ".35rem .7rem", fontSize: ".78rem", flex: "none" }}>Pakai</button>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 18, padding: "16px 18px", borderRadius: 12, background: "color-mix(in oklab, var(--brand) 7%, var(--surface-2))", border: "1px solid color-mix(in oklab, var(--brand) 20%, var(--line))", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ minWidth: 220, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: ".92rem", color: "var(--brand)" }}>✨ Buat BGM khusus Anda</div>
              <p className="muted" style={{ fontSize: ".84rem", margin: "4px 0 0", lineHeight: 1.5 }}>Hasilkan musik latar unik agar tidak sama dengan agen lain.</p>
            </div>
            <button style={btn("brand")}>Buat BGM baru</button>
          </div>
        </Card>
      )}

      {assetTab === "voice" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }} className="adm-2">
          {/* LEFT: your 3 voice slots */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <H>Voice karakter Anda</H>
              <span style={{ fontSize: ".74rem", fontWeight: 700, padding: ".25rem .6rem", borderRadius: 999, background: "color-mix(in oklab, var(--brand) 14%, var(--surface))", color: "var(--brand)" }}>{usedVoices} / 3 terpakai</span>
            </div>
            <p className="muted" style={{ fontSize: ".84rem", marginTop: -8, marginBottom: 14, lineHeight: 1.5 }}>Setiap agen memiliki 3 voice eksklusif, dipilih sekali dan bersifat <strong style={{ color: "var(--ink)" }}>permanen</strong> — agar suara brand Anda tidak sama dengan siapa pun.</p>
            <div style={{ display: "grid", gap: 12 }}>
              {VOICES.map((v, i) => v ? (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 15px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                  <button aria-label="Dengar" style={{ width: 42, height: 42, borderRadius: "50%", flex: "none", border: "none", cursor: "pointer", display: "grid", placeItems: "center", background: "var(--ink)", color: "var(--bg)" }}><Ic d="M8 5v14l11-7z" s={16} /></button>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: ".94rem" }}>{v.name}</div>
                    <div className="muted" style={{ fontSize: ".8rem" }}>{v.desc}</div>
                  </div>
                  <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 2, height: 22, flex: "none" }}>
                    {v.wave.map((h, j) => <span key={j} style={{ width: 2.5, height: h, borderRadius: 2, background: "var(--line-2)" }} />)}
                  </div>
                  <span style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--good)", flex: "none", display: "inline-flex", alignItems: "center", gap: 4 }}><Ic d="M12 1a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 9H9V6a3 3 0 0 1 6 0v4Z" s={13} /></span>
                </div>
              ) : (
                <div key={i} style={{ ...drop, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "18px 15px" }}>
                  <Ic d="M12 5v14M5 12h14" s={18} /><span style={{ fontSize: ".86rem", fontWeight: 600 }}>Slot kosong — buat voice baru →</span>
                </div>
              ))}
            </div>
          </Card>

          {/* RIGHT: create new voice via ElevenLabs */}
          <Card>
            <H>Buat voice baru</H>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".74rem", fontWeight: 700, color: "var(--muted)", marginTop: -8, marginBottom: 14 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--good)" }} /> Ditenagai ElevenLabs
            </div>
            {usedVoices >= 3 ? (
              <div style={{ padding: "18px", borderRadius: 12, background: "var(--surface-2)", textAlign: "center" }}>
                <div style={{ fontWeight: 700 }}>Kuota 3 voice sudah penuh</div>
                <p className="muted" style={{ fontSize: ".84rem", margin: "6px 0 0" }}>Pilihan voice bersifat permanen dan tidak dapat diganti.</p>
              </div>
            ) : voiceGen === "done" ? (
              <div style={{ padding: "22px 18px", borderRadius: 12, background: "color-mix(in oklab, var(--good) 10%, var(--surface-2))", border: "1px solid color-mix(in oklab, var(--good) 30%, var(--line))", textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem" }}>✓</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>Voice tersimpan permanen</div>
                <p className="muted" style={{ fontSize: ".84rem", margin: "6px 0 14px" }}>Voice baru siap dipakai di Editor & konten. Sisa kuota: {3 - usedVoices - 1}.</p>
                <button onClick={() => setVoiceGen("idle")} style={btn("ghost")}>Selesai</button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                <div><label style={lbl}>Nama voice</label><input placeholder="mis. Kirana — Elegan" style={inp} /></div>
                <div>
                  <label style={lbl}>Jenis suara</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Perempuan", "Laki-laki"].map((g) => (
                      <button key={g} style={{ ...btn("ghost"), padding: ".5rem 1rem", flex: 1 }}>{g}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl}>Gaya / karakter</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {VOICE_STYLES.map((s) => (
                      <button key={s} onClick={() => setVoiceStyle(s)} style={{ font: "inherit", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", padding: ".38rem .8rem", borderRadius: 999, border: `1px solid ${voiceStyle === s ? "var(--brand)" : "var(--line-2)"}`, background: voiceStyle === s ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: voiceStyle === s ? "var(--brand)" : "var(--ink-2)" }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div><label style={lbl}>Contoh teks (untuk pratinjau)</label><textarea rows={3} placeholder="Selamat datang di Kirana — properti impian Anda di Bali…" style={{ ...inp, resize: "vertical" }} /></div>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "color-mix(in oklab, var(--warn) 10%, var(--surface-2))", border: "1px solid color-mix(in oklab, var(--warn) 26%, var(--line))", fontSize: ".8rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                  ⚠️ Setelah disimpan, voice ini <strong>tidak bisa diganti</strong>. Anda punya {3 - usedVoices} slot tersisa.
                </div>
                <button onClick={() => setVoiceGen("working")} disabled={voiceGen === "working"} style={{ ...btn("brand"), opacity: voiceGen === "working" ? .6 : 1, justifyContent: "center", display: "flex" }}>
                  {voiceGen === "working" ? "Membuat voice…" : "✨ Generate & simpan permanen"}
                </button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
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
      <aside className="adm-side" style={{ width: collapsed ? 74 : 236, flex: "none", background: "var(--surface)", borderRight: "1px solid var(--line)", padding: collapsed ? "18px 10px" : "18px 14px", position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", transition: "width .2s ease, padding .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 7, padding: collapsed ? "6px 0 20px" : "6px 8px 20px" }}>
          <CakraMark size={30} />{!collapsed && <span className="hand" style={{ fontSize: "1.7rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>}
        </div>
        <nav style={{ display: "grid", gap: 3 }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setSec(n.id)} title={n.label} style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 11, padding: ".65rem .7rem", borderRadius: 10, border: "none", cursor: "pointer", font: "inherit", fontSize: ".95rem", fontWeight: sec === n.id ? 600 : 500, textAlign: "left", background: sec === n.id ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "transparent", color: sec === n.id ? "var(--brand)" : "var(--ink-2)", transition: ".15s" }}>
              <Ic d={n.icon} />{!collapsed && n.label}
            </button>
          ))}
        </nav>
        <button onClick={() => setSec("profile")} title="Kirana Sutanto" style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 10, padding: "10px 8px", borderRadius: 12, border: "1px solid var(--line)", background: sec === "profile" ? "var(--surface-2)" : "transparent", cursor: "pointer", font: "inherit", textAlign: "left" }}>
          <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 700, flex: "none" }}>K</span>
          {!collapsed && <span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 600, fontSize: ".9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Kirana Sutanto</span><span className="muted" style={{ fontSize: ".78rem" }}>Paket Pro</span></span>}
        </button>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ height: 60, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0 clamp(14px,3vw,28px)", background: "color-mix(in oklab, var(--bg) 86%, transparent)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Buka menu" : "Sembunyikan menu"} title={collapsed ? "Buka menu" : "Sembunyikan menu"} style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 10, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer", flex: "none" }}>
              <Ic d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" s={18} />
            </button>
            <span style={{ fontSize: ".82rem", color: "var(--warn)", fontWeight: 600, whiteSpace: "nowrap" }} className="adm-openmode">● Mode terbuka · tanpa autentikasi</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            {genState === "working" && (
              <button onClick={() => setSec("editor")} title="Lihat proses" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: ".38rem .7rem", borderRadius: 999, border: "1px solid color-mix(in oklab, var(--brand) 30%, var(--line))", background: "color-mix(in oklab, var(--brand) 10%, var(--surface))", color: "var(--brand)", cursor: "pointer", font: "inherit", fontSize: ".78rem", fontWeight: 700, flex: "none" }}>
                <span className="adm-spin" style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid color-mix(in oklab, var(--brand) 30%, transparent)", borderTopColor: "var(--brand)", flex: "none" }} />
                Merender video {genPct}%
              </button>
            )}
            <a href="https://kirana.cakra.site" className="mono adm-hosturl" style={{ fontSize: ".82rem", color: "var(--muted)", textDecoration: "none", whiteSpace: "nowrap" }}>kirana.cakra.site ↗</a>
          </div>
        </header>
        <main className="adm-main" style={{ padding: "clamp(20px,3vw,34px)", maxWidth: 1400 }}>
          <h1 className="display" style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>{titles[sec][0]}</h1>
          <p className="muted" style={{ margin: "4px 0 22px" }}>{titles[sec][1]}</p>
          {body}
        </main>
      </div>

      {listingModal !== null && (() => {
        const l = LISTINGS[listingModal];
        return (
          <div onClick={() => setListingModal(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(20,15,9,.55)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "min(560px, 94vw)", maxHeight: "90vh", overflow: "auto", background: "var(--surface)", borderRadius: 18, border: "1px solid var(--line)", boxShadow: "0 40px 100px rgba(20,15,9,.4)" }}>
              <div style={{ position: "relative", aspectRatio: "16 / 10" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.img} alt={l.t} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "18px 18px 0 0" }} />
                <span style={{ position: "absolute", top: 12, left: 12, fontSize: ".66rem", fontWeight: 700, letterSpacing: ".05em", padding: ".26rem .6rem", borderRadius: 999, color: "#fff", background: l.st === "Dijual" ? "var(--brand)" : "var(--jade)" }}>{l.st.toUpperCase()}</span>
                <button onClick={() => setListingModal(null)} aria-label="Tutup" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer", background: "rgba(255,255,255,.92)", color: "var(--ink)", fontSize: "1rem", display: "grid", placeItems: "center" }}>✕</button>
              </div>
              <div style={{ padding: 22 }}>
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
                <div className="muted" style={{ fontSize: ".8rem", marginBottom: 16 }}>{l.views}× dilihat · tayang di website Anda</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button style={btn("brand")}>Edit listing</button>
                  <button style={btn("ghost")}>Lihat di website</button>
                  <button style={{ ...btn("ghost"), color: "var(--crit)", borderColor: "color-mix(in oklab, var(--crit) 40%, var(--line-2))", marginLeft: "auto" }}>Hapus</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {videoModal !== null && (() => {
        const v = VIDEO_HISTORY[videoModal];
        return (
          <div onClick={() => setVideoModal(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(20,15,9,.62)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: v.ar === "9:16" ? "min(360px, 92vw)" : "min(760px, 94vw)", background: "var(--surface)", borderRadius: 18, border: "1px solid var(--line)", overflow: "hidden", boxShadow: "0 40px 100px rgba(20,15,9,.45)" }}>
              <div style={{ position: "relative", aspectRatio: arCss(v.ar), background: "var(--ink)", maxHeight: "72vh", margin: "0 auto" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.poster} alt={v.t} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: .9 }} />
                <button aria-label="Putar" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", border: "none", background: "rgba(20,15,9,.12)", cursor: "pointer" }}>
                  <span style={{ width: 66, height: 66, borderRadius: "50%", background: "rgba(255,255,255,.94)", color: "var(--ink)", display: "grid", placeItems: "center", boxShadow: "0 10px 28px rgba(0,0,0,.35)" }}><Ic d="M8 5v14l11-7z" s={28} /></span>
                </button>
                <button onClick={() => setVideoModal(null)} aria-label="Tutup" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer", background: "rgba(255,255,255,.92)", color: "var(--ink)", fontSize: "1rem", display: "grid", placeItems: "center" }}>✕</button>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Ic d="M8 5v14l11-7z" s={13} />
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--line)" }}><div style={{ width: "28%", height: "100%", borderRadius: 3, background: "var(--brand)" }} /></div>
                  <span className="mono muted" style={{ fontSize: ".74rem" }}>0:18 / {v.dur}</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: ".98rem" }}>{v.t}</div>
                    <div className="muted mono" style={{ fontSize: ".76rem" }}>{v.ar} · {v.dur} · {v.date}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...btn("brand"), padding: ".5rem 1rem", fontSize: ".84rem" }}>Unduh</button>
                    <button style={{ ...btn("ghost"), padding: ".5rem 1rem", fontSize: ".84rem" }}>Bagikan</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
        @media (max-width: 640px){ .adm-openmode{ display:none !important; } .adm-hosturl{ display:none !important; } }
        @media (max-width: 720px){ .adm-side{ display:none !important; } }
        @media (prefers-reduced-motion: reduce){ .adm-eq.on span, .adm-spin{ animation:none !important; } }
      `}</style>
    </div>
  );
}

export default function Admin() {
  const [host, setHost] = useState<string | null>(null);
  useEffect(() => { setHost(window.location.hostname); }, []);
  // Backend only on the root domain; every agent subdomain (sample/member/…) gets the member dashboard.
  const isBackend = !host || host === "cakra.xyz" || host === "www.cakra.xyz" || host === "localhost" || host === "127.0.0.1";
  return isBackend ? <StaffAdmin /> : <MemberDashboard />;
}
