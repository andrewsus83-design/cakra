"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { publicAllListings } from "@/lib/supabase";

type Listing = {
  id: number; title: string; area: string; city: string; status: "jual" | "sewa";
  price: number; priceLabel?: string; beds: number; baths: number; size: number; img: string; agent: string; subdomain?: string; featured?: boolean;
};

// The public marketplace shows only real agent listings an admin has approved for the public
// feed (via publicAllListings). No editorial/dummy seed — an empty feed shows a clean empty state.
const SEED: Listing[] = [];

const PRICE_BANDS = [
  { label: "Semua harga", min: 0, max: Infinity },
  { label: "< Rp 2 M", min: 0, max: 2_000_000_000 },
  { label: "Rp 2–5 M", min: 2_000_000_000, max: 5_000_000_000 },
  { label: "Rp 5–10 M", min: 5_000_000_000, max: 10_000_000_000 },
  { label: "> Rp 10 M", min: 10_000_000_000, max: Infinity },
];

function rp(n: number) {
  if (n >= 1e9) return `Rp ${(n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 0 })} jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function Chip({ children, color = "var(--brand)" }: { children: React.ReactNode; color?: string }) {
  return <span style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "#fff", background: color, padding: ".28rem .6rem", borderRadius: 999 }}>{children}</span>;
}

function statusColor(s: Listing["status"]) {
  return s === "jual" ? "var(--brand)" : "var(--jade)";
}

export default function Page() {
  const [status, setStatus] = useState<"semua" | "jual" | "sewa">("semua");
  const [city, setCity] = useState("Semua");
  const [band, setBand] = useState(0);
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [data, setData] = useState<Listing[]>(SEED);
  const railRef = useRef<HTMLDivElement>(null);

  // Load the general marketplace — agent listings an admin has approved for the public feed.
  // Falls back to the editorial SEED set when nothing is approved yet, so the page never looks empty.
  useEffect(() => {
    publicAllListings(120).then((rows) => {
      if (!rows.length) return;
      const mapped: Listing[] = rows.map((r: any, i: number) => ({
        id: i + 1,
        title: r.title || "Properti",
        area: r.area || r.location || "",
        city: r.agent_city || r.location || "—",
        status: String(r.status) === "disewa" ? "sewa" : "jual",
        price: Number(r.price) || 0,
        priceLabel: r.price_label || undefined,
        beds: r.beds || 0, baths: r.baths || 0, size: Number(r.size_m2) || 0,
        img: (Array.isArray(r.images) && r.images[0]) || "/hero.webp",
        agent: r.agent_brand || r.agent_name || "Agen cakra",
        subdomain: r.agent_subdomain || undefined,
        featured: i < 5,
      }));
      setData(mapped);
      setCity("Semua");
    });
  }, []);

  const CITIES = useMemo(() => ["Semua", ...Array.from(new Set(data.map((l) => l.city).filter(Boolean)))], [data]);
  const priceText = (l: Listing) => l.priceLabel || rp(l.price);
  const featured = data.filter((l) => l.featured);
  const filtered = useMemo(
    () =>
      data.filter((l) => {
        if (status !== "semua" && l.status !== status) return false;
        if (city !== "Semua" && l.city !== city) return false;
        const b = PRICE_BANDS[band];
        if (l.price < b.min || l.price >= b.max) return false;
        return true;
      }),
    [data, status, city, band]
  );

  const scrollRail = (dir: number) => railRef.current?.scrollBy({ left: dir * 420, behavior: "smooth" });

  return (
    <main>
      {/* header */}
      <section className="wrap" style={{ padding: "clamp(32px, 5vw, 60px) 0 8px" }}>
        <p className="hand gold" style={{ fontSize: "1.7rem", transform: "rotate(-2deg)", margin: 0, lineHeight: 1, display: "inline-block" }}>listing pilihan</p>
        <h1 className="display" style={{ fontSize: "clamp(2.2rem, 4.6vw, 3.4rem)", fontWeight: 700, margin: "12px 0 0", maxWidth: "20ch" }}>
          Properti dari para agen cakra.
        </h1>
        <p className="lead" style={{ marginTop: 14 }}>Setiap unit punya halaman, video, dan skor GEO-nya sendiri — siap ditemukan calon pembeli.</p>
      </section>

      {/* featured carousel */}
      {featured.length > 0 && <section className="wrap" style={{ padding: "18px 0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="eyebrow">Featured</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => scrollRail(-1)} aria-label="Sebelumnya" className="rail-btn">‹</button>
            <button onClick={() => scrollRail(1)} aria-label="Berikutnya" className="rail-btn">›</button>
          </div>
        </div>
        <div ref={railRef} className="rail">
          {featured.map((l) => (
            <article key={l.id} className="feat-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.img} alt={l.title} />
              <div className="feat-scrim" />
              <div className="feat-body">
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <Chip color={statusColor(l.status)}>{l.status === "jual" ? "Dijual" : "Disewa"}</Chip>
                  <Chip color="rgba(0,0,0,.4)">Featured</Chip>
                </div>
                <h3 className="display" style={{ color: "#fff", fontSize: "1.7rem", fontWeight: 700, margin: 0 }}>{l.title}</h3>
                <div style={{ color: "rgba(255,255,255,.9)", fontSize: ".95rem", marginTop: 4 }}>{l.area}, {l.city}</div>
                <div className="mono" style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, marginTop: 10 }}>{priceText(l)}{l.status === "sewa" && !l.priceLabel && <span style={{ fontSize: ".8rem", fontWeight: 500 }}> /thn</span>}</div>
              </div>
            </article>
          ))}
        </div>
      </section>}

      {/* filters */}
      <section className="wrap" style={{ padding: "26px 0 8px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 4 }}>
            {(["semua", "jual", "sewa"] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)} style={{ border: "none", cursor: "pointer", font: "inherit", fontWeight: 600, fontSize: ".95rem", padding: ".5rem 1.1rem", borderRadius: 999, textTransform: "capitalize", background: status === s ? "var(--brand)" : "transparent", color: status === s ? "#fff" : "var(--muted)", transition: ".2s" }}>
                {s === "semua" ? "Semua" : s === "jual" ? "Dijual" : "Disewa"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="lst-select" aria-label="Filter lokasi">
              {CITIES.map((c) => <option key={c} value={c}>{c === "Semua" ? "Semua lokasi" : c}</option>)}
            </select>
            <select value={band} onChange={(e) => setBand(Number(e.target.value))} className="lst-select" aria-label="Filter harga">
              {PRICE_BANDS.map((b, i) => <option key={b.label} value={i}>{b.label}</option>)}
            </select>
          </div>
        </div>
        <div className="muted" style={{ fontSize: ".9rem", marginTop: 14 }}>{filtered.length} properti ditemukan</div>
      </section>

      {/* grid — Airbnb-style */}
      <section className="wrap" style={{ padding: "10px 0 84px" }}>
        <div className="lst-grid">
          {filtered.map((l) => {
            const rating = (4.6 + ((l.id * 7) % 5) / 10).toFixed(1);
            return (
              <article key={l.id} className="lst-card">
                <div className="lst-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.img} alt={l.title} />
                  <span className="lst-badge" style={{ background: statusColor(l.status) }}>{l.status === "jual" ? "Dijual" : "Disewa"}</span>
                  <button className="lst-heart" aria-label="Simpan properti" onClick={() => setSaved((p) => ({ ...p, [l.id]: !p[l.id] }))} style={{ color: saved[l.id] ? "var(--crit)" : "#fff" }}>
                    {saved[l.id] ? "♥" : "♡"}
                  </button>
                </div>
                <div className="lst-info">
                  <div className="lst-row">
                    <h3 className="lst-title">{l.title}</h3>
                    <span className="lst-rating"><span style={{ color: "var(--brand)" }}>★</span> {rating}</span>
                  </div>
                  <div className="muted" style={{ fontSize: ".92rem", marginTop: 2 }}>{l.area}, {l.city}</div>
                  <div className="muted" style={{ fontSize: ".88rem", marginTop: 1 }}>{l.beds} KT · {l.baths} KM · {l.size} m²</div>
                  <div style={{ marginTop: 7, fontSize: "1.02rem", color: "var(--ink)" }}>
                    <b className="mono">{priceText(l)}</b>
                    {l.status === "sewa" ? <span className="muted" style={{ fontWeight: 500 }}>{l.priceLabel ? "" : " /thn"}</span> : <span className="muted" style={{ fontSize: ".88rem", fontWeight: 500 }}> · {l.agent}</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {filtered.length === 0 && <p className="muted" style={{ textAlign: "center", padding: "56px 0" }}>{data.length === 0 ? "Belum ada listing publik — properti dari para agen cakra akan tampil di sini." : "Tidak ada properti yang cocok dengan filter Anda."}</p>}
      </section>

      <style>{`
        .rail{ display:flex; gap:20px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:8px; scrollbar-width:none; }
        .rail::-webkit-scrollbar{ display:none; }
        .feat-card{ position:relative; flex:0 0 auto; width:min(420px, 82vw); aspect-ratio:16/10; border-radius:var(--radius-lg); overflow:hidden; scroll-snap-align:start; box-shadow:var(--shadow); }
        .feat-card img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .feat-scrim{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(20,15,9,.05) 40%, rgba(20,15,9,.82) 100%); }
        .feat-body{ position:absolute; left:0; right:0; bottom:0; padding:22px; }
        .rail-btn{ width:38px; height:38px; border-radius:50%; border:1px solid var(--line-2); background:var(--surface); color:var(--ink); font-size:1.3rem; line-height:1; cursor:pointer; transition:.2s; }
        .rail-btn:hover{ border-color:var(--brand); color:var(--brand); }
        .lst-select{ font:inherit; font-size:.95rem; padding:.5rem .9rem; border-radius:11px; border:1px solid var(--line-2); background:var(--surface); color:var(--ink); cursor:pointer; }
        .lst-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(248px, 1fr)); gap:32px 22px; }
        .lst-card{ cursor:pointer; }
        .lst-media{ position:relative; aspect-ratio:20/19; border-radius:16px; overflow:hidden; background:var(--surface-2); }
        .lst-media img{ width:100%; height:100%; object-fit:cover; transition:transform .45s ease; }
        .lst-card:hover .lst-media img{ transform:scale(1.05); }
        .lst-badge{ position:absolute; top:12px; left:12px; color:#fff; font-size:.7rem; font-weight:700; letter-spacing:.03em; text-transform:uppercase; padding:.32rem .62rem; border-radius:999px; }
        .lst-heart{ position:absolute; top:10px; right:10px; width:34px; height:34px; border:none; border-radius:50%; background:rgba(20,15,9,.3); font-size:1.05rem; line-height:1; cursor:pointer; display:grid; place-items:center; backdrop-filter:blur(4px); transition:transform .15s, background .2s; }
        .lst-heart:hover{ transform:scale(1.1); background:rgba(20,15,9,.5); }
        .lst-info{ padding:12px 2px 0; }
        .lst-row{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
        .lst-title{ font-family:var(--font-sans), sans-serif; font-weight:600; font-size:1.06rem; color:var(--ink); margin:0; line-height:1.25; }
        .lst-rating{ font-size:.9rem; color:var(--ink); white-space:nowrap; }
      `}</style>
    </main>
  );
}
