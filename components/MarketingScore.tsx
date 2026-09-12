"use client";
import { useState } from "react";

// Marketing scoring engine (admin). Two graders:
//  • Website — real scores via the Google PageSpeed Insights API (client-side, CORS-ok): Performance/
//    speed + Core Web Vitals, SEO, Accessibility, Best-practices, and a derived GEO/crawlability score
//    from Lighthouse audits (structured-data, crawlable, meta, title). Deep OG/JSON-LD/social-search &
//    competitor crawl activate once the proxy backend is connected.
//  • Social media — from entered metrics: engagement rate, content quality per post/follower, posting
//    consistency/efficiency, ads portion, discoverability (AI/search potential), account quality.
// No backend required for either; both run in the browser.

const PSI = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const band = (n: number) => (n >= 90 ? "var(--good)" : n >= 50 ? "var(--warn)" : "var(--crit)");
const bandLabel = (n: number) => (n >= 90 ? "Baik" : n >= 50 ? "Perlu perbaikan" : "Buruk");

function Ring({ value, size = 118, label }: { value: number; size?: number; label?: string }) {
  const r = size / 2 - 9, c = 2 * Math.PI * r, col = band(value);
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={9} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={9} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div><div style={{ fontSize: size > 100 ? "1.9rem" : "1.3rem", fontWeight: 800, color: col, lineHeight: 1 }}>{value}</div>{label && <div className="muted" style={{ fontSize: ".64rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", marginTop: 3 }}>{label}</div>}</div>
      </div>
    </div>
  );
}
function Bar({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div style={{ display: "grid", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: ".82rem", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: ".82rem", fontWeight: 800, color: band(value) }}>{value}{hint ? <span className="muted" style={{ fontWeight: 500, fontSize: ".72rem" }}> {hint}</span> : ""}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: band(value), borderRadius: 999, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}
const card: React.CSSProperties = { padding: 18, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)" };
const inp: React.CSSProperties = { font: "inherit", fontSize: ".9rem", padding: ".62rem .8rem", borderRadius: 10, border: "1px solid var(--line-2)", background: "var(--surface-2)", color: "var(--ink)", width: "100%" };
const seg = (on: boolean): React.CSSProperties => ({ border: "none", cursor: "pointer", font: "inherit", fontWeight: 600, fontSize: ".84rem", padding: ".45rem .95rem", borderRadius: 999, background: on ? "var(--brand)" : "transparent", color: on ? "#fff" : "var(--muted)" });

// Module-level so controlled inputs keep focus (defining them inside a component remounts on each keystroke).
function SField({ label, value, onChange, ph, wide }: { label: string; value: string; onChange: (v: string) => void; ph?: string; wide?: boolean }) {
  return (
    <label style={{ display: "grid", gap: 5, gridColumn: wide ? "1 / -1" : "auto" }}>
      <span className="muted" style={{ fontSize: ".78rem", fontWeight: 600 }}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} inputMode="numeric" style={inp} />
    </label>
  );
}
function SCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".84rem", cursor: "pointer", padding: "8px 0" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 17, height: 17, accentColor: "var(--brand)" }} />{label}
    </label>
  );
}

// ───────────────────────── Website grader (PageSpeed Insights) ─────────────────────────
function WebsiteGrader() {
  const [url, setUrl] = useState("");
  const [strat, setStrat] = useState<"mobile" | "desktop">("mobile");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<any>(null);

  const run = async () => {
    let u = url.trim(); if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    setBusy(true); setErr(null); setRes(null);
    try {
      const q = `${PSI}?url=${encodeURIComponent(u)}&strategy=${strat}&category=performance&category=seo&category=accessibility&category=best-practices`;
      const r = await fetch(q);
      const d = await r.json();
      if (!r.ok || !d.lighthouseResult) throw new Error(d?.error?.message || "Gagal menganalisa URL (coba lagi — kuota PSI terbatas tanpa API key).");
      const lr = d.lighthouseResult, cat = lr.categories || {}, au = lr.audits || {};
      const sc = (k: string) => cat[k]?.score != null ? clamp(cat[k].score * 100) : 0;
      const aud = (k: string) => au[k]?.score != null ? clamp(au[k].score * 100) : null;
      const geoParts = ["structured-data", "is-crawlable", "robots-txt", "meta-description", "document-title", "hreflang", "canonical"].map(aud).filter((x) => x != null) as number[];
      const geo = geoParts.length ? clamp(geoParts.reduce((a, b) => a + b, 0) / geoParts.length) : sc("seo");
      const dims = { seo: sc("seo"), speed: sc("performance"), geo, akses: sc("accessibility"), best: sc("best-practices") };
      const overall = clamp(dims.seo * 0.3 + dims.speed * 0.25 + dims.geo * 0.2 + dims.akses * 0.13 + dims.best * 0.12);
      const cwv = {
        LCP: au["largest-contentful-paint"]?.displayValue || "—",
        CLS: au["cumulative-layout-shift"]?.displayValue || "—",
        TBT: au["total-blocking-time"]?.displayValue || "—",
        FCP: au["first-contentful-paint"]?.displayValue || "—",
        SI: au["speed-index"]?.displayValue || "—",
      };
      const CHECKS = [
        ["Judul halaman (title)", "document-title"], ["Meta description", "meta-description"], ["Dapat di-crawl mesin", "is-crawlable"],
        ["robots.txt valid", "robots-txt"], ["Structured data (JSON-LD/GEO)", "structured-data"], ["Viewport mobile", "viewport"],
        ["Alt text gambar", "image-alt"], ["Teks link deskriptif", "link-text"], ["Kontras warna (a11y)", "color-contrast"],
        ["Target ketuk cukup besar", "tap-targets"], ["HTTPS", "is-on-https"], ["hreflang", "hreflang"],
      ] as [string, string][];
      const checks = CHECKS.map(([label, k]) => ({ label, k, score: au[k] ? (au[k].score == null ? "na" : au[k].score >= 0.9 ? "pass" : "fail") : "na" }));
      const recs = Object.values(au).filter((a: any) => a && a.score != null && a.score < 0.9 && a.title && (a.description || "").length > 20 && ["seo", "accessibility", "best-practices", "performance"].some(() => true)).map((a: any) => ({ title: a.title, desc: String(a.description).replace(/\[.*?\]\(.*?\)/g, "").slice(0, 160) })).slice(0, 8);
      setRes({ finalUrl: lr.finalUrl || u, overall, dims, cwv, checks, recs });
    } catch (e: any) { setErr(e?.message || "Gagal menganalisa."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ ...card, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder="thenewton.cakra.xyz" style={{ ...inp, flex: "1 1 260px", width: "auto" }} />
          <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 3 }}>
            {(["mobile", "desktop"] as const).map((s) => <button key={s} onClick={() => setStrat(s)} style={seg(strat === s)}>{s === "mobile" ? "Mobile" : "Desktop"}</button>)}
          </div>
          <button onClick={run} disabled={busy || !url.trim()} className="btn btn-brand" style={{ padding: ".62rem 1.2rem", opacity: busy || !url.trim() ? .5 : 1 }}>{busy ? "Menganalisa…" : "Analisa"}</button>
        </div>
        <p className="muted" style={{ fontSize: ".78rem", margin: 0 }}>Skor nyata dari Google PageSpeed Insights (Lighthouse). Deep GEO / Open-Graph / social-search & analisa pesaing aktif saat proxy backend terhubung.</p>
        {err && <p style={{ color: "var(--crit)", fontSize: ".84rem", margin: 0 }}>{err}</p>}
      </div>

      {res && (
        <>
          <div style={{ ...card, display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
            <Ring value={res.overall} label="Skor Marketing" />
            <div style={{ flex: 1, minWidth: 240, display: "grid", gap: 12 }}>
              <div style={{ fontWeight: 700, fontSize: ".92rem", wordBreak: "break-all" }}>{res.finalUrl} <span style={{ fontSize: ".72rem", fontWeight: 700, color: band(res.overall), background: `color-mix(in oklab, ${band(res.overall)} 14%, var(--surface))`, padding: ".16rem .5rem", borderRadius: 999, marginLeft: 6 }}>{bandLabel(res.overall)}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Bar label="SEO" value={res.dims.seo} /><Bar label="Kecepatan / CWV" value={res.dims.speed} />
                <Bar label="GEO / Crawlability" value={res.dims.geo} /><Bar label="Aksesibilitas" value={res.dims.akses} />
                <Bar label="Best practices" value={res.dims.best} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="adm-2">
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Core Web Vitals</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {Object.entries(res.cwv).map(([k, v]) => (
                  <div key={k} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                    <div className="muted" style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".04em" }}>{k}</div>
                    <div style={{ fontWeight: 800, fontSize: "1.05rem", marginTop: 2 }}>{v as string}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Checklist wajib</div>
              <div style={{ display: "grid", gap: 7 }}>
                {res.checks.map((c: any) => (
                  <div key={c.k} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: ".84rem" }}>
                    <span style={{ flex: "none", width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: ".7rem", fontWeight: 800, color: "#fff", background: c.score === "pass" ? "var(--good)" : c.score === "fail" ? "var(--crit)" : "var(--muted)" }}>{c.score === "pass" ? "✓" : c.score === "fail" ? "✕" : "–"}</span>
                    <span style={{ color: c.score === "na" ? "var(--muted)" : "var(--ink)" }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {res.recs.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Rekomendasi prioritas</div>
              <div style={{ display: "grid", gap: 10 }}>
                {res.recs.map((r: any, i: number) => (
                  <div key={i} style={{ padding: "11px 13px", borderRadius: 10, background: "color-mix(in oklab, var(--warn) 8%, var(--surface-2))", border: "1px solid color-mix(in oklab, var(--warn) 26%, var(--line))" }}>
                    <div style={{ fontWeight: 700, fontSize: ".86rem" }}>{r.title}</div>
                    {r.desc && <div className="muted" style={{ fontSize: ".8rem", marginTop: 2, lineHeight: 1.5 }}>{r.desc}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ───────────────────────── Social-media grader (metrics) ─────────────────────────
type Sform = { platform: string; followers: string; posts: string; likes: string; comments: string; views: string; perWeek: string; adsPct: string; kw: boolean; hashtags: boolean; link: boolean };
function SocialGrader() {
  const [f, setF] = useState<Sform>({ platform: "Instagram", followers: "", posts: "", likes: "", comments: "", views: "", perWeek: "", adsPct: "", kw: false, hashtags: false, link: false });
  const [out, setOut] = useState<any>(null);
  const set = (k: keyof Sform, v: any) => setF((s) => ({ ...s, [k]: v }));
  const num = (v: string) => { const n = parseFloat(String(v).replace(/[^\d.]/g, "")); return isFinite(n) ? n : 0; };

  const compute = () => {
    const fol = num(f.followers), posts = num(f.posts), likes = num(f.likes), com = num(f.comments), views = num(f.views), pw = num(f.perWeek), ads = num(f.adsPct);
    // Engagement rate — likes+comments per post ÷ followers.
    const erRaw = fol > 0 ? ((likes + com) / fol) * 100 : 0;
    const engagement = clamp(erRaw >= 6 ? 100 : (erRaw / 6) * 100);       // ≥6% = elite
    // Content quality — engagement + view-through (if views given).
    const vtr = fol > 0 && views > 0 ? Math.min(1.5, views / fol) : 0;    // views vs followers
    const quality = clamp(engagement * 0.7 + Math.min(100, vtr * 66) * 0.3);
    // Consistency / efficiency — 4–7 posts/week ideal.
    const consistency = clamp(pw <= 0 ? 0 : pw >= 4 && pw <= 7 ? 100 : pw < 4 ? (pw / 4) * 100 : Math.max(50, 100 - (pw - 7) * 8));
    // Ads portion — sweet spot 20–40% (too high = spammy, too low = under-promoted).
    const adsScore = clamp(ads <= 0 ? 40 : ads >= 20 && ads <= 40 ? 100 : ads < 20 ? 60 + ads * 2 : Math.max(30, 100 - (ads - 40) * 2));
    // Discoverability / potensi ditemukan mesin (bio keywords + hashtags + link).
    const discovery = clamp((f.kw ? 40 : 0) + (f.hashtags ? 35 : 0) + (f.link ? 25 : 0));
    // Account quality — engagement + consistency + reach ratio; penalise very high follower w/ low ER.
    const accQuality = clamp(engagement * 0.5 + consistency * 0.3 + discovery * 0.2);
    const overall = clamp(engagement * 0.28 + quality * 0.17 + consistency * 0.15 + adsScore * 0.12 + discovery * 0.18 + accQuality * 0.1);
    const recs: string[] = [];
    if (erRaw < 2) recs.push(`Engagement rate ${erRaw.toFixed(2)}% rendah — perkuat hook 1–2 detik, CTA komentar, dan reply-to-comment.`);
    if (consistency < 70) recs.push("Naikkan konsistensi ke 4–7 post/minggu (jadwalkan dari content plan 30 hari).");
    if (!f.kw) recs.push("Tambahkan kata kunci (lokasi + produk) di bio & caption agar muncul di social search.");
    if (!f.hashtags) recs.push("Gunakan hashtag relevan + on-screen text berisi kata kunci (social SEO).");
    if (!f.link) recs.push("Pasang link-in-bio ke situs + WhatsApp untuk menangkap lead.");
    if (ads > 45) recs.push("Porsi iklan/promo terlalu tinggi — seimbangkan dengan konten edukasi/tur agar tidak jenuh.");
    if (ads > 0 && ads < 15) recs.push("Tingkatkan sedikit porsi promo/ads untuk memperluas jangkauan berbayar di atas konten terbaik.");
    setOut({ overall, engagement, quality, consistency, adsScore, discovery, accQuality, erRaw, recs });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: out ? "minmax(300px, 1fr) minmax(300px, 1fr)" : "1fr", gap: 16, alignItems: "start" }} className="adm-2">
      <div style={{ ...card, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Instagram", "TikTok", "YouTube", "Facebook"].map((p) => <button key={p} onClick={() => set("platform", p)} style={seg(f.platform === p)}>{p}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <SField label="Followers" value={f.followers} onChange={(v) => set("followers", v)} ph="12500" />
          <SField label="Total post" value={f.posts} onChange={(v) => set("posts", v)} ph="180" />
          <SField label="Rata-rata like / post" value={f.likes} onChange={(v) => set("likes", v)} ph="320" />
          <SField label="Rata-rata komentar / post" value={f.comments} onChange={(v) => set("comments", v)} ph="24" />
          <SField label="Rata-rata views / post (ops.)" value={f.views} onChange={(v) => set("views", v)} ph="8000" />
          <SField label="Post per minggu" value={f.perWeek} onChange={(v) => set("perWeek", v)} ph="5" />
          <SField label="% konten iklan/promo" value={f.adsPct} onChange={(v) => set("adsPct", v)} ph="30" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, borderTop: "1px solid var(--line)", paddingTop: 6 }}>
          <SCheck label="Kata kunci di bio/caption" checked={f.kw} onChange={(v) => set("kw", v)} />
          <SCheck label="Pakai hashtag relevan" checked={f.hashtags} onChange={(v) => set("hashtags", v)} />
          <SCheck label="Link-in-bio ke situs/WA" checked={f.link} onChange={(v) => set("link", v)} />
        </div>
        <button onClick={compute} className="btn btn-brand" style={{ justifyContent: "center", padding: ".7rem" }}>Nilai akun</button>
      </div>

      {out && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ ...card, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <Ring value={out.overall} label="Skor Social" />
            <div style={{ flex: 1, minWidth: 220, display: "grid", gap: 10 }}>
              <Bar label="Engagement" value={out.engagement} hint={`${out.erRaw.toFixed(2)}% ER`} />
              <Bar label="Kualitas konten" value={out.quality} />
              <Bar label="Konsistensi / efisiensi" value={out.consistency} />
              <Bar label="Porsi iklan" value={out.adsScore} />
              <Bar label="Potensi ditemukan (AI/search)" value={out.discovery} />
              <Bar label="Kualitas akun" value={out.accQuality} />
            </div>
          </div>
          {out.recs.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Rekomendasi</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 7 }}>
                {out.recs.map((r: string, i: number) => <li key={i} style={{ fontSize: ".84rem", lineHeight: 1.5, color: "var(--ink-2)" }}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MarketingScore() {
  const [tab, setTab] = useState<"web" | "social">("web");
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 4, width: "fit-content" }}>
        {([["web", "Skor Website"], ["social", "Skor Social Media"]] as const).map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={seg(tab === id)}>{l}</button>
        ))}
      </div>
      {tab === "web" ? <WebsiteGrader /> : <SocialGrader />}
    </div>
  );
}
