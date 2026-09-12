"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { db, publicConfig, uploadAsset, rpc, invokeFn, type SupaUser } from "@/lib/supabase";

// Editor Studio — two modes:
//  • FULL AUTO (default) — the agent supplies ONLY their property photos (their listing, or a direct
//    upload). Cakra auto-composes the everyday set (1:1 feed, 9:16 story, A4 flyer) with their brand
//    & contact, zero manual layout. Library b-roll / BGM / voice are added behind the scenes for the
//    video version (coming) — the agent never has to touch them.
//  • SEMI AUTO — the manual cart→composer: hand-pick images (library + own), a target, and copy.
// Copy is composed deterministically (free); AI-written copy + motion video is the paid layer.
type Target = { id: string; label: string; sub: string; w: number; h: number; kind: "hero" | "flyer" };
// Output targets are organised PER ASPECT RATIO (not per social platform) so there's no redundancy —
// one 16:9 covers presentation + YouTube, one 1:1 covers IG feed + Facebook + blog + hub, etc. Which
// platform a piece is actually posted to lives in the social-media dashboard, not here.
const TARGETS: Target[] = [
  { id: "landscape", label: "16:9 · Lanskap", sub: "Presentasi · YouTube · highlights", w: 1920, h: 1080, kind: "hero" },
  { id: "square", label: "1:1 · Kotak", sub: "Feed IG · Facebook · blog · hub", w: 1080, h: 1080, kind: "hero" },
  { id: "vertical", label: "9:16 · Vertikal", sub: "Story · Reels · TikTok", w: 1080, h: 1920, kind: "hero" },
  { id: "flyer", label: "A4 · Flyer", sub: "Cetak · brosur", w: 1240, h: 1754, kind: "flyer" },
];
// The everyday set Full Auto produces in one click.
const AUTO_SET = ["square", "vertical", "flyer"];

// Load with CORS first (keeps canvas export working for same-origin/Supabase assets); on failure
// retry WITHOUT crossOrigin so a CDN image (e.g. OpenART) still draws into the canvas — it just
// taints it, which the compose step detects and reports instead of silently failing.
const loadImg = (src: string): Promise<HTMLImageElement | null> => new Promise((res) => {
  const attempt = (cors: boolean) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => (cors ? attempt(false) : res(null));
    img.src = src;
  };
  attempt(true);
});
// Truncate text with an ellipsis so it never overflows its available width on the canvas.
function fit(ctx: CanvasRenderingContext2D, t: string, maxW: number): string {
  if (ctx.measureText(t).width <= maxW) return t;
  let s = t;
  while (s.length > 1 && ctx.measureText(s + "…").width > maxW) s = s.slice(0, -1);
  return s + "…";
}
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ir = img.width / img.height, r = w / h; let sw = img.width, sh = img.height, sx = 0, sy = 0;
  if (ir > r) { sw = img.height * r; sx = (img.width - sw) / 2; } else { sh = img.width / r; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(/\s+/), lines: string[] = []; let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// Pure renderer — draws one composition to `canvas` and returns a PNG dataURL, or "tainted" if a
// cross-origin library image blocks export. Shared by both Full Auto and Semi Auto.
function renderComposition(canvas: HTMLCanvasElement, tgt: Target, pics: HTMLImageElement[], o: { head: string; hl: string[]; brand: string; contact: string }): string {
  const { w, h, kind } = tgt;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d"); if (!ctx) return "";
  const acc = "#A9762B"; const ink = "#211A11";
  const hl = o.hl.slice(0, 4);
  const head = o.head.trim();
  const brand = o.brand, contact = o.contact;

  if (kind === "hero") {
    drawCover(ctx, pics[0], 0, 0, w, h);
    const g = ctx.createLinearGradient(0, h * 0.35, 0, h); g.addColorStop(0, "rgba(20,15,9,0)"); g.addColorStop(1, "rgba(20,15,9,.88)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const pad = Math.round(w * 0.06); let y = h - pad;
    ctx.textBaseline = "alphabetic"; ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.font = `600 ${Math.round(w * 0.022)}px Hanken Grotesk, system-ui, sans-serif`;
    if (contact) { ctx.fillText(`WA ${contact}`, pad, y); } y -= Math.round(w * 0.05);
    ctx.font = `600 ${Math.round(w * 0.026)}px Hanken Grotesk, system-ui, sans-serif`;
    for (let i = hl.length - 1; i >= 0; i--) {
      const t = fit(ctx, hl[i], w - pad * 2 - Math.round(w * 0.05)); const tw = ctx.measureText(t).width; const chH = Math.round(w * 0.052);
      ctx.fillStyle = i === 0 ? acc : "rgba(255,255,255,.16)"; rr(ctx, pad, y - chH, tw + Math.round(w * 0.05), chH, chH / 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText(t, pad + Math.round(w * 0.025), y - chH / 2 + Math.round(w * 0.009));
      y -= chH + Math.round(w * 0.018);
    }
    y -= Math.round(w * 0.01);
    ctx.fillStyle = "#fff"; const hf = Math.round(w * (tgt.id === "vertical" ? 0.062 : 0.05)); ctx.font = `700 ${hf}px Newsreader, Georgia, serif`;
    const lines = wrap(ctx, head, w - pad * 2).slice(0, tgt.id === "vertical" ? 5 : 3); for (let i = lines.length - 1; i >= 0; i--) { ctx.fillText(lines[i], pad, y); y -= hf * 1.12; }
    ctx.fillStyle = acc; ctx.font = `700 ${Math.round(w * 0.024)}px Hanken Grotesk, system-ui, sans-serif`; ctx.fillText(brand.toUpperCase(), pad, y - Math.round(w * 0.005));
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = `700 ${Math.round(w * 0.03)}px Caveat, cursive`; ctx.textAlign = "right"; ctx.fillText("dibuat dengan cakra", w - pad, pad + Math.round(w * 0.02)); ctx.textAlign = "left";
  } else {
    ctx.fillStyle = "#F7F2E9"; ctx.fillRect(0, 0, w, h);
    const heroH = Math.round(h * 0.5); drawCover(ctx, pics[0], 0, 0, w, heroH);
    const g = ctx.createLinearGradient(0, heroH * 0.5, 0, heroH); g.addColorStop(0, "rgba(20,15,9,0)"); g.addColorStop(1, "rgba(20,15,9,.5)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, heroH);
    const pad = Math.round(w * 0.07);
    ctx.fillStyle = "#fff"; ctx.font = `700 ${Math.round(w * 0.028)}px Hanken Grotesk, system-ui, sans-serif`; ctx.fillText(brand.toUpperCase(), pad, Math.round(w * 0.075));
    ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.font = `700 ${Math.round(w * 0.028)}px Caveat, cursive`; ctx.textAlign = "right"; ctx.fillText("dibuat dengan cakra", w - pad, Math.round(w * 0.075)); ctx.textAlign = "left";
    let y = heroH + Math.round(w * 0.09);
    ctx.fillStyle = ink; const hf = Math.round(w * 0.052); ctx.font = `700 ${hf}px Newsreader, Georgia, serif`;
    for (const ln of wrap(ctx, head, w - pad * 2).slice(0, 3)) { ctx.fillText(ln, pad, y); y += hf * 1.1; }
    y += Math.round(w * 0.02);
    ctx.font = `500 ${Math.round(w * 0.032)}px Hanken Grotesk, system-ui, sans-serif`;
    for (const t of hl) { ctx.fillStyle = acc; ctx.fillText("•", pad, y); ctx.fillStyle = "#3B3020"; ctx.fillText(fit(ctx, t, w - pad * 2 - Math.round(w * 0.05)), pad + Math.round(w * 0.04), y); y += Math.round(w * 0.058); }
    if (pics.length > 1) { const n = Math.min(3, pics.length - 1), gap = Math.round(w * 0.02), tw = (w - pad * 2 - gap * (n - 1)) / n, th = tw * 0.7; y += Math.round(w * 0.01); for (let i = 0; i < n; i++) { rr(ctx, pad + i * (tw + gap), y, tw, th, 14); ctx.save(); ctx.clip(); drawCover(ctx, pics[i + 1], pad + i * (tw + gap), y, tw, th); ctx.restore(); } y += th + Math.round(w * 0.05); }
    const barH = Math.round(w * 0.1); ctx.fillStyle = acc; ctx.fillRect(0, h - barH, w, barH);
    ctx.fillStyle = "#fff"; ctx.font = `700 ${Math.round(w * 0.03)}px Hanken Grotesk, system-ui, sans-serif`; ctx.textBaseline = "middle";
    ctx.fillText(contact ? `WhatsApp  ${contact}` : brand, pad, h - barH / 2); ctx.textBaseline = "alphabetic";
  }
  try { return canvas.toDataURL("image/png"); } catch { return "tainted"; }
}

const dl = (url: string, name: string) => { const a = document.createElement("a"); a.href = url; a.download = name; a.click(); };
const specsOf = (l: any) => l ? [l.beds && `${l.beds} KT`, l.baths && `${l.baths} KM`, l.size_m2 && `${l.size_m2} m²`].filter(Boolean).join(" · ") : "";

export function EditorStudio({ user }: { user: SupaUser }) {
  const [mode, setMode] = useState<"auto" | "semi" | "ai">("ai");
  const [imgs, setImgs] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [wa, setWa] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [a, l, p] = await Promise.all([
          db("assets", { query: "type=eq.image&order=created_at.desc&limit=400" }),
          db("listings", { query: `agent_id=eq.${user.id}&order=created_at.desc&limit=50` }),
          db("profiles", { query: `id=eq.${user.id}&select=name,brand,city,whatsapp,palette,areas,specializations` }),
        ]);
        setImgs(Array.isArray(a) ? a : []);
        setListings(Array.isArray(l) ? l : []);
        setProfile(Array.isArray(p) ? p[0] : p);
      } catch { /* best effort */ }
      publicConfig("CAKRA_WHATSAPP").then((v) => { if (v) setWa(v); }).catch(() => {});
    })();
  }, [user.id]);

  const brand = profile?.brand || profile?.name || "cakra";
  const contact = profile?.whatsapp || wa || "";

  // ============================ FULL AUTO ============================
  const [autoListingId, setAutoListingId] = useState("");
  const [autoSrcs, setAutoSrcs] = useState<string[]>([]);
  const [autoOut, setAutoOut] = useState<{ id: string; label: string; url: string }[]>([]);
  const [autoBusy, setAutoBusy] = useState(false);
  const [autoMsg, setAutoMsg] = useState<string | null>(null);
  const autoFileRef = useRef<HTMLInputElement | null>(null);

  // Selecting one of the agent's properties pulls in its photos (the agent's own uploads).
  useEffect(() => {
    const L = listings.find((l) => l.id === autoListingId);
    if (L && Array.isArray(L.images) && L.images.length) { setAutoSrcs(L.images.slice(0, 6)); setAutoOut([]); setAutoMsg(null); }
  }, [autoListingId]); // eslint-disable-line

  const onAutoUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setAutoMsg("Mengunggah foto…"); setAutoListingId("");
    try {
      const up = await Promise.all(Array.from(files).slice(0, 6).map((f) => uploadAsset(f, { kind: "image" })));
      const urls = up.map((r) => (Array.isArray(r) ? r[0] : r)?.storage_path).filter(Boolean) as string[];
      setAutoSrcs((s) => [...s, ...urls].slice(0, 6)); setAutoOut([]); setAutoMsg(urls.length ? null : "Tidak ada foto yang terunggah.");
    } catch { setAutoMsg("Gagal mengunggah foto. Coba lagi."); }
    if (autoFileRef.current) autoFileRef.current.value = "";
  };

  const generateAuto = async () => {
    if (!autoSrcs.length) { setAutoMsg("Pilih properti Anda atau unggah foto dulu."); return; }
    const canvas = canvasRef.current; if (!canvas) return;
    setAutoBusy(true); setAutoMsg(null); setAutoOut([]);
    const pics = (await Promise.all(autoSrcs.slice(0, 4).map(loadImg))).filter(Boolean) as HTMLImageElement[];
    if (!pics.length) { setAutoBusy(false); setAutoMsg("Foto gagal dimuat."); return; }
    const L = listings.find((l) => l.id === autoListingId);
    const head = (L?.title || `Properti pilihan ${profile?.city || ""}`).trim() || "Properti pilihan";
    const hl = (L ? [L.price_label, L.location, specsOf(L)] : []).map((s: any) => (s || "").trim()).filter(Boolean);
    const results: { id: string; label: string; url: string }[] = [];
    let tainted = false;
    for (const tid of AUTO_SET) {
      const t = TARGETS.find((x) => x.id === tid)!;
      const url = renderComposition(canvas, t, pics, { head, hl, brand, contact });
      if (url === "tainted" || !url) tainted = true; else results.push({ id: tid, label: t.label, url });
    }
    setAutoOut(results); setAutoBusy(false);
    if (tainted) setAutoMsg(results.length ? "Beberapa ukuran perlu foto unggahan Anda untuk ekspor penuh." : "Foto pustaka (CDN) tak bisa diekspor — unggah foto properti Anda sendiri.");
  };

  const FullAuto = (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card" style={{ padding: 18, display: "grid", gap: 14 }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Foto properti yang Anda tawarkan</div>
          <p className="muted" style={{ fontSize: ".82rem", margin: 0, lineHeight: 1.5 }}>Pilih salah satu properti Anda, atau unggah foto langsung. Cakra otomatis menyusun konten siap posting (1:1, 9:16, A4) dengan brand &amp; kontak Anda — tanpa atur tata letak.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {listings.length > 0 && (
            <select value={autoListingId} onChange={(e) => setAutoListingId(e.target.value)} style={{ font: "inherit", fontSize: ".88rem", padding: ".6rem .8rem", borderRadius: 10, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", flex: "1 1 240px" }}>
              <option value="">Pilih properti Anda…</option>
              {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          )}
          <input ref={autoFileRef} type="file" accept="image/*" multiple onChange={(e) => onAutoUpload(e.target.files)} style={{ display: "none" }} />
          <button onClick={() => autoFileRef.current?.click()} className="btn btn-ghost" style={{ padding: ".6rem 1rem", fontSize: ".86rem", whiteSpace: "nowrap" }}>⬆ Unggah foto</button>
        </div>

        {autoSrcs.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 10, borderRadius: 10, background: "var(--surface-2)" }}>
            {autoSrcs.map((u, i) => (
              <button key={u + i} onClick={() => { setAutoSrcs((s) => s.filter((x, j) => !(x === u && j === i))); setAutoOut([]); }} title="Hapus foto" style={{ position: "relative", width: 64, height: 50, borderRadius: 8, overflow: "hidden", border: `2px solid ${i === 0 ? "var(--brand)" : "var(--line-2)"}`, padding: 0, cursor: "pointer" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", top: 1, right: 1, background: "rgba(20,15,9,.6)", color: "#fff", fontSize: ".6rem", borderRadius: 5, padding: "0 3px" }}>✕</span>
              </button>
            ))}
            <span className="muted" style={{ fontSize: ".72rem", alignSelf: "center" }}>{autoSrcs.length} foto · foto pertama jadi hero</span>
          </div>
        )}

        <button onClick={generateAuto} disabled={autoBusy || !autoSrcs.length} className="btn btn-brand" style={{ justifyContent: "center", padding: ".85rem", fontSize: "1rem", opacity: autoBusy || !autoSrcs.length ? .55 : 1 }}>
          {autoBusy ? "Menyusun konten…" : "✨ Generate otomatis"}
        </button>
        {autoMsg && <p style={{ fontSize: ".8rem", margin: 0, color: autoMsg.includes("Gagal") || autoMsg.includes("gagal") ? "var(--crit)" : "var(--warn)", lineHeight: 1.45 }}>{autoMsg}</p>}
        <p className="muted" style={{ fontSize: ".76rem", margin: 0, lineHeight: 1.5 }}>🎬 Untuk versi video 9:16, Cakra menambahkan b-roll, musik &amp; voice secara otomatis di balik layar — <b>segera hadir</b>. Butuh kendali penuh? Buka tab <b>Semi Auto</b>.</p>
      </div>

      {autoOut.length > 0 && (
        <div className="card" style={{ padding: 18, display: "grid", gap: 14 }}>
          <div style={{ fontWeight: 700 }}>Konten siap · {autoOut.length} ukuran</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {autoOut.map((r) => (
              <div key={r.id} style={{ display: "grid", gap: 8 }}>
                <div style={{ borderRadius: 10, overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", padding: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.url} alt={r.label} style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 6 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: ".8rem", fontWeight: 600 }}>{r.label}</span>
                  <button onClick={() => dl(r.url, `cakra-${r.id}-${Date.now()}.png`)} className="btn btn-ghost" style={{ padding: ".38rem .7rem", fontSize: ".78rem" }}>⬇ Unduh</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => autoOut.forEach((r, i) => setTimeout(() => dl(r.url, `cakra-${r.id}-${Date.now()}.png`), i * 250))} className="btn btn-brand" style={{ justifyContent: "center", padding: ".7rem", fontSize: ".9rem" }}>⬇ Unduh semua</button>
        </div>
      )}
    </div>
  );

  // ============================ SEMI AUTO ============================
  const [cart, setCart] = useState<string[]>([]);
  const [target, setTarget] = useState("landscape");
  const [listingId, setListingId] = useState<string>("");
  const [headline, setHeadline] = useState("");
  const [highlights, setHighlights] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const listing = useMemo(() => listings.find((l) => l.id === listingId), [listings, listingId]);

  useEffect(() => {
    if (!listing) return;
    setHeadline((h) => h || listing.title || "");
    setHighlights((x) => x || [listing.price_label, listing.location, specsOf(listing)].filter(Boolean).join("\n"));
    if (Array.isArray(listing.images) && listing.images[0]) setCart((c) => (c.length ? c : [listing.images[0]]));
  }, [listingId]); // eslint-disable-line

  useEffect(() => { setOut(null); setMsg(null); }, [cart, headline, highlights, target, listingId]);

  const tgt = TARGETS.find((t) => t.id === target)!;
  const toggle = (url: string) => setCart((c) => (c.includes(url) ? c.filter((x) => x !== url) : [...c, url]));

  const compose = async () => {
    const canvas = canvasRef.current; if (!canvas) return;
    if (!cart.length) { setMsg("Tambahkan minimal satu gambar ke keranjang."); return; }
    setBusy(true); setMsg(null); setOut(null);
    const pics = (await Promise.all(cart.slice(0, 4).map(loadImg))).filter(Boolean) as HTMLImageElement[];
    if (!pics.length) { setBusy(false); setMsg("Gambar gagal dimuat."); return; }
    const hl = highlights.split("\n").map((s) => s.trim()).filter(Boolean);
    const head = (headline || `Properti pilihan ${profile?.city || ""}`);
    const url = renderComposition(canvas, tgt, pics, { head, hl, brand, contact });
    if (url === "tainted") { setMsg("Pratinjau siap. Sebagian gambar pustaka (CDN) tak bisa diunduh langsung — unggah foto Anda sendiri untuk ekspor penuh."); setOut("tainted"); }
    else if (url) setOut(url);
    setBusy(false);
  };

  const download = () => { if (!out || out === "tainted") return; dl(out, `cakra-${target}-${Date.now()}.png`); };
  const cell: React.CSSProperties = { position: "relative", aspectRatio: "4/3", borderRadius: 9, overflow: "hidden", cursor: "pointer", border: "2px solid transparent" };

  const SemiAuto = (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {TARGETS.map((t) => {
          const on = target === t.id;
          return (
            <button key={t.id} onClick={() => setTarget(t.id)} style={{ textAlign: "left", cursor: "pointer", font: "inherit", padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${on ? "var(--brand)" : "var(--line-2)"}`, background: on ? "color-mix(in oklab, var(--brand) 10%, var(--surface))" : "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 26, height: t.kind === "flyer" ? 34 : t.w > t.h ? 18 : 34, background: on ? "var(--brand)" : "var(--line-2)", borderRadius: 3, flex: "none", ...(t.id === "vertical" ? { width: 20, height: 34 } : t.id === "square" ? { width: 26, height: 26 } : t.id === "landscape" ? { width: 34, height: 20 } : {}) }} />
                <div><div style={{ fontWeight: 700, fontSize: ".9rem" }}>{t.label}</div><div className="muted" style={{ fontSize: ".74rem" }}>{t.sub} · {t.w}×{t.h}</div></div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }} className="adm-2">
        <div className="card" style={{ padding: 18, display: "grid", gap: 14 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>1 · Isi keranjang</div>
            <p className="muted" style={{ fontSize: ".8rem", margin: 0 }}>Klik gambar (pustaka + unggahan Anda) untuk menambah ke komposisi. Gambar pertama jadi hero.</p>
          </div>
          {cart.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 10, borderRadius: 10, background: "var(--surface-2)" }}>
              {cart.map((u, i) => (
                <button key={u} onClick={() => toggle(u)} title="Hapus dari keranjang" style={{ position: "relative", width: 60, height: 46, borderRadius: 7, overflow: "hidden", border: `2px solid ${i === 0 ? "var(--brand)" : "var(--line-2)"}`, padding: 0, cursor: "pointer" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ position: "absolute", top: 1, right: 1, background: "rgba(20,15,9,.6)", color: "#fff", fontSize: ".6rem", borderRadius: 5, padding: "0 3px" }}>✕</span>
                </button>
              ))}
              <span className="muted" style={{ fontSize: ".72rem", alignSelf: "center" }}>{cart.length} dipilih (maks 4 dipakai)</span>
            </div>
          )}
          <div style={{ maxHeight: 210, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 8, padding: 2 }}>
            {imgs.map((it) => {
              const on = cart.includes(it.storage_path);
              return (
                <div key={it.id} onClick={() => toggle(it.storage_path)} style={{ ...cell, borderColor: on ? "var(--brand)" : "transparent" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.storage_path} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {on && <span style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "var(--brand)", color: "#fff", display: "grid", placeItems: "center", fontSize: ".7rem" }}>✓</span>}
                </div>
              );
            })}
            {imgs.length === 0 && <p className="muted" style={{ fontSize: ".8rem", gridColumn: "1/-1" }}>Belum ada gambar. Unggah di menu Aset.</p>}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700 }}>2 · Isi konten</div>
            {listings.length > 0 && (
              <select value={listingId} onChange={(e) => setListingId(e.target.value)} style={{ font: "inherit", fontSize: ".86rem", padding: ".5rem .7rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)" }}>
                <option value="">Isi otomatis dari listing… (opsional)</option>
                {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            )}
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Judul / headline" style={{ font: "inherit", fontSize: ".9rem", padding: ".6rem .8rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)" }} />
            <textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} rows={3} placeholder={"Sorotan (satu per baris)\nRp 8,5 M\nCanggu, Bali\n4 KT · 4 KM · 320 m²"} style={{ font: "inherit", fontSize: ".88rem", padding: ".6rem .8rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", resize: "vertical", lineHeight: 1.5 }} />
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: "grid", gap: 12, position: "sticky", top: 78 }}>
          <div style={{ fontWeight: 700 }}>3 · Compose &amp; unduh</div>
          <div style={{ borderRadius: 12, overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", minHeight: 200, padding: 10 }}>
            {out && out !== "tainted" ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={out} alt="Hasil komposisi" style={{ maxWidth: "100%", maxHeight: "56vh", borderRadius: 8, boxShadow: "var(--shadow-soft)" }} />
            ) : (
              <div style={{ textAlign: "center", color: "var(--muted)", padding: 26 }}>
                <div style={{ width: tgt.w > tgt.h ? 90 : 54, height: tgt.w > tgt.h ? 54 : 90, margin: "0 auto 10px", borderRadius: 10, border: "2px dashed var(--line-2)" }} />
                <div style={{ fontSize: ".84rem" }}>{busy ? "Menyusun…" : `Pratinjau ${tgt.label} akan tampil di sini.`}</div>
              </div>
            )}
          </div>
          {msg && <p style={{ fontSize: ".8rem", color: out === "tainted" ? "var(--warn)" : "var(--crit)", margin: 0, lineHeight: 1.45 }}>{msg}</p>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={compose} disabled={busy} className="btn btn-brand" style={{ flex: 1, justifyContent: "center", padding: ".8rem", fontSize: "1rem", opacity: busy ? .6 : 1 }}>{busy ? "Menyusun…" : "✨ Compose"}</button>
            <button onClick={download} disabled={!out || out === "tainted"} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", padding: ".8rem", fontSize: "1rem", opacity: !out || out === "tainted" ? .5 : 1 }}>⬇ Unduh PNG</button>
          </div>
          <p className="muted" style={{ fontSize: ".76rem", margin: 0, lineHeight: 1.5 }}>Komposisi memakai brand &amp; kontak Anda. Untuk video bergerak &amp; salinan yang ditulis AI, gunakan <b>Optimasi AI</b> (Pro) — segera hadir di Studio.</p>
        </div>
      </div>
    </div>
  );

  // ============================ AI STUDIO (resep) ============================
  // Step 6-8 of the Learning engine, agent-facing: facts in -> recipe-guided editorial out -> 👍/👎.
  const [aiListingId, setAiListingId] = useState("");
  const [aiDesc, setAiDesc] = useState("");
  const [aiLang, setAiLang] = useState<"id" | "en">("id");
  const [aiPremium, setAiPremium] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState<string | null>(null);
  const [aiGen, setAiGen] = useState<any | null>(null);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const loadAiHistory = async () => {
    try {
      const rows = await db("content_generations", { query: `agent_id=eq.${user.id}&order=created_at.desc&limit=20&select=id,status,created_at,output,feedback,model,tokens_in,tokens_out,est_cost_idr,inputs,error,meta` });
      setAiHistory(Array.isArray(rows) ? rows : []);
    } catch { /* best effort */ }
  };
  useEffect(() => { loadAiHistory(); }, [user.id]); // eslint-disable-line
  const aiListing = useMemo(() => listings.find((l) => l.id === aiListingId), [listings, aiListingId]);
  const generateAi = async () => {
    if (!aiListingId && !aiDesc.trim()) { setAiMsg("Pilih properti Anda atau tulis deskripsi dulu."); return; }
    setAiBusy(true); setAiMsg(null); setAiGen(null);
    try {
      const inputs: any = { lang: aiLang };
      if (aiDesc.trim()) inputs.description = aiDesc.trim();
      if (aiListingId) inputs.listing_id = aiListingId;
      if (Array.isArray(aiListing?.images) && aiListing.images.length) inputs.images = aiListing.images.slice(0, 6);
      const gid = await rpc("agent_start_generation", { p_inputs: inputs, p_premium: aiPremium });
      const res = await invokeFn("generate-editorial", { generation_id: gid });
      if (res?.ok && res.generation) setAiGen(res.generation);
      else setAiMsg(res?.error || "Generasi gagal. Coba lagi.");
    } catch (e: any) { setAiMsg(e?.message || "Generasi gagal. Coba lagi."); }
    finally { setAiBusy(false); loadAiHistory(); }
  };
  const aiFeedback = async (id: string, fb: "up" | "down") => {
    try {
      await rpc("content_feedback_set", { p_id: id, p_feedback: fb });
      setAiGen((g: any) => (g && g.id === id ? { ...g, feedback: fb } : g));
      setAiHistory((h) => h.map((x) => (x.id === id ? { ...x, feedback: fb } : x)));
      setAiMsg(fb === "up" ? "Terima kasih — resep makin tajam 👍" : "Dicatat — akan dipelajari ulang 👎");
      setTimeout(() => setAiMsg(null), 1800);
    } catch (e: any) { setAiMsg(e?.message || "Gagal menyimpan feedback."); }
  };
  const aiCopy = (t: string) => { try { navigator.clipboard.writeText(t); setAiMsg("Disalin ✓"); setTimeout(() => setAiMsg(null), 1400); } catch { /* noop */ } };
  // Step 7 — explicit render action (Veo per-scene clips), then poll the row until the job finishes.
  const [renderBusy, setRenderBusy] = useState(false);
  const pollRender = async (id: string) => {
    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 6000));
      try {
        const rows = await db("content_generations", { query: `id=eq.${id}&select=id,output,meta` });
        const row = Array.isArray(rows) ? rows[0] : null;
        const st = row?.output?.renders?.status;
        if (row && st && st !== "rendering") { setAiGen((g: any) => (g && g.id === id ? { ...g, output: row.output, meta: row.meta } : g)); return; }
      } catch { /* keep polling */ }
    }
  };
  const renderVideo = async (premium = false) => {
    if (!aiGen?.id) return;
    setRenderBusy(true); setAiMsg("Merender klip video dengan Veo… (±1–3 menit)");
    try {
      const res = await invokeFn("learn-render", { generation_id: aiGen.id, premium });
      if (res?.accepted || res?.pending) {
        setAiGen((g: any) => (g ? { ...g, output: { ...(g.output || {}), renders: { ...((g.output || {}).renders || {}), status: "rendering" } } } : g));
        await pollRender(aiGen.id); setAiMsg(null);
      } else setAiMsg(res?.error || "Render gagal.");
    } catch (e: any) { setAiMsg(e?.message || "Render gagal."); }
    finally { setRenderBusy(false); loadAiHistory(); }
  };
  const O = aiGen?.output || null;
  const inp: React.CSSProperties = { font: "inherit", fontSize: ".88rem", padding: ".6rem .8rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)" };
  const tag = (t: string) => (t.startsWith("#") ? t : "#" + t);
  const AiStudio = (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card" style={{ padding: 18, display: "grid", gap: 14 }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Generate konten dengan resep cakra</div>
          <p className="muted" style={{ fontSize: ".82rem", margin: 0, lineHeight: 1.5 }}>Pilih properti Anda (fakta diambil dari listing) atau tulis deskripsi. Cakra menyusun hook, naskah scene, caption, hashtag, CTA &amp; rencana edit — mengikuti resep yang dipelajari dari agen terbaik. Beri 👍/👎 agar resepnya makin tajam.</p>
        </div>
        {listings.length > 0 && (
          <select value={aiListingId} onChange={(e) => setAiListingId(e.target.value)} style={inp}>
            <option value="">Pilih properti Anda… (opsional)</option>
            {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        )}
        <textarea value={aiDesc} onChange={(e) => setAiDesc(e.target.value)} rows={3} placeholder="Deskripsi / fakta tambahan (opsional): sudut jual, target pembeli, kondisi unit, promo…" style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "inline-flex", border: "1px solid var(--line-2)", borderRadius: 999, overflow: "hidden" }}>
            {(["id", "en"] as const).map((l) => (
              <button key={l} onClick={() => setAiLang(l)} style={{ padding: ".4rem .8rem", border: "none", cursor: "pointer", font: "inherit", fontSize: ".78rem", fontWeight: 700, background: aiLang === l ? "var(--brand)" : "transparent", color: aiLang === l ? "#fff" : "var(--ink-2)" }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".82rem", cursor: "pointer" }}>
            <input type="checkbox" checked={aiPremium} onChange={(e) => setAiPremium(e.target.checked)} /> Premium (Opus)
          </label>
          <button onClick={generateAi} disabled={aiBusy} className="btn btn-brand" style={{ marginLeft: "auto", padding: ".75rem 1.3rem", fontSize: ".95rem", opacity: aiBusy ? .6 : 1 }}>{aiBusy ? "Menyusun konten…" : "✨ Generate dengan resep"}</button>
        </div>
        {aiMsg && <p style={{ fontSize: ".8rem", margin: 0, color: /gagal|error|tidak/i.test(aiMsg) ? "var(--crit)" : "var(--muted)" }}>{aiMsg}</p>}
      </div>

      {O && aiGen && (
        <div className="card" style={{ padding: 18, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <div className="muted" style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".06em" }}>Hook · {O.hook_pattern || "—"}</div>
              <div className="display" style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1.25, marginTop: 4 }}>{O.hook}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flex: "none" }}>
              <button onClick={() => aiFeedback(aiGen.id, "up")} title="Bagus" className="btn btn-ghost" style={{ padding: ".45rem .8rem", fontSize: "1rem", background: aiGen.feedback === "up" ? "color-mix(in oklab, var(--brand) 16%, var(--surface))" : undefined }}>👍</button>
              <button onClick={() => aiFeedback(aiGen.id, "down")} title="Kurang" className="btn btn-ghost" style={{ padding: ".45rem .8rem", fontSize: "1rem", background: aiGen.feedback === "down" ? "color-mix(in oklab, var(--crit) 16%, var(--surface))" : undefined }}>👎</button>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 8 }}>Naskah scene</div>
            <div style={{ display: "grid", gap: 8 }}>
              {(Array.isArray(O.script) ? O.script : []).map((s: any, i: number) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "58px 1fr", gap: 10, padding: "10px 12px", borderRadius: 10, background: "var(--surface-2)" }}>
                  <div className="muted" style={{ fontSize: ".74rem", fontVariantNumeric: "tabular-nums" }}>{s.t0}–{s.t1}s</div>
                  <div style={{ minWidth: 0 }}>
                    {s.on_screen_text && <div style={{ fontWeight: 700, fontSize: ".86rem" }}>{s.on_screen_text}</div>}
                    {s.voiceover && <div style={{ fontSize: ".86rem", marginTop: 2 }}>🎙 {s.voiceover}</div>}
                    {s.shot_instruction && <div className="muted" style={{ fontSize: ".76rem", marginTop: 2 }}>🎬 {s.shot_instruction}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: ".9rem" }}>Caption</div>
              <button onClick={() => aiCopy((O.caption?.[aiLang] || O.caption?.id || "") + "\n\n" + (Array.isArray(O.hashtags) ? O.hashtags.map(tag).join(" ") : ""))} className="btn btn-ghost" style={{ padding: ".3rem .6rem", fontSize: ".76rem" }}>⧉ Salin caption + hashtag</button>
            </div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: ".88rem", lineHeight: 1.55, padding: "10px 12px", borderRadius: 10, background: "var(--surface-2)" }}>{O.caption?.[aiLang] || O.caption?.id}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {(Array.isArray(O.hashtags) ? O.hashtags : []).map((h: string, i: number) => <span key={i} style={{ fontSize: ".74rem", padding: ".18rem .5rem", borderRadius: 999, background: "color-mix(in oklab, var(--brand) 10%, var(--surface))", color: "var(--brand)" }}>{tag(h)}</span>)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
            {O.cta && <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)" }}><div className="muted" style={{ fontSize: ".72rem" }}>CTA · {O.cta.type}</div><div style={{ fontWeight: 600, fontSize: ".86rem", marginTop: 2 }}>{O.cta.text}</div></div>}
            {O.thumbnail_text && <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)" }}><div className="muted" style={{ fontSize: ".72rem" }}>Teks thumbnail</div><div style={{ fontWeight: 600, fontSize: ".86rem", marginTop: 2 }}>{O.thumbnail_text}</div></div>}
            {O.edit_plan && <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)" }}><div className="muted" style={{ fontSize: ".72rem" }}>Rencana edit</div><div style={{ fontSize: ".82rem", marginTop: 2 }}>{O.edit_plan.duration_s}s · {O.edit_plan.aspect}{O.edit_plan.music?.genre ? ` · ${O.edit_plan.music.genre}` : ""}{O.edit_plan.music?.bpm ? ` ${O.edit_plan.music.bpm} bpm` : ""}{O.edit_plan.pacing ? ` · ${O.edit_plan.pacing}` : ""}</div></div>}
          </div>
          {O.tts_text && <details><summary style={{ cursor: "pointer", fontSize: ".84rem", fontWeight: 600 }}>Narasi TTS</summary><p style={{ fontSize: ".86rem", lineHeight: 1.55, whiteSpace: "pre-wrap", margin: "8px 0 0" }}>{O.tts_text}</p></details>}
          {/* Step 7 — video render (explicit, per-scene clips) */}
          <div style={{ display: "grid", gap: 10, paddingTop: 6, borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => renderVideo(false)} disabled={renderBusy || O.renders?.status === "rendering"} className="btn btn-ghost" style={{ padding: ".5rem .9rem", fontSize: ".84rem", opacity: renderBusy || O.renders?.status === "rendering" ? .6 : 1 }}>{renderBusy || O.renders?.status === "rendering" ? "🎬 Merender…" : "🎬 Render klip video (Veo)"}</button>
              <span className="muted" style={{ fontSize: ".72rem" }}>Klip 9:16 per scene · biaya per detik video · manual</span>
            </div>
            {O.renders?.status === "ready" && Array.isArray(O.renders.clips) && O.renders.clips.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
                {O.renders.clips.map((c: any) => (
                  <div key={c.path} style={{ display: "grid", gap: 4 }}>
                    <video src={c.url} controls playsInline muted style={{ width: "100%", aspectRatio: "9/16", borderRadius: 10, background: "#000" }} />
                    <div className="muted" style={{ fontSize: ".72rem" }}>Scene {c.scene_no} · {c.duration_s}s{c.on_screen_text ? ` · ${c.on_screen_text}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
            {O.renders?.status === "failed" && <div style={{ fontSize: ".78rem", color: "var(--crit)" }}>Render gagal: {(O.renders.errors || []).map((e: any) => e.error).join("; ")}</div>}
            {O.renders?.status === "ready" && (O.renders.errors || []).length > 0 && <div className="muted" style={{ fontSize: ".72rem" }}>{O.renders.errors.length} scene gagal dirender.</div>}
          </div>
          <div className="muted" style={{ fontSize: ".72rem" }}>{aiGen.model} · {aiGen.tokens_in || 0}→{aiGen.tokens_out || 0} token{aiGen.est_cost_idr != null ? ` · ~Rp ${Number(aiGen.est_cost_idr).toLocaleString("id-ID")}` : ""} · resep v{aiGen.meta?.recipe_version || "?"}</div>
        </div>
      )}

      {aiHistory.length > 0 && (
        <div className="card" style={{ padding: 18, display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Riwayat generasi</div>
          {aiHistory.map((h) => (
            <button key={h.id} onClick={() => { if (h.output && h.output.hook) setAiGen(h); }} style={{ textAlign: "left", cursor: h.output?.hook ? "pointer" : "default", font: "inherit", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: aiGen?.id === h.id ? "color-mix(in oklab, var(--brand) 8%, var(--surface))" : "var(--surface)", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", color: "var(--ink)" }}>
              <span style={{ fontSize: ".84rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{h.output?.hook || (h.status === "failed" ? `Gagal: ${h.error || ""}` : h.status)}</span>
              <span className="muted" style={{ fontSize: ".72rem", flex: "none" }}>{h.feedback === "up" ? "👍 " : h.feedback === "down" ? "👎 " : ""}{new Date(h.created_at).toLocaleDateString("id-ID")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const tab = (id: "auto" | "semi" | "ai", label: string, sub: string) => {
    const on = mode === id;
    return (
      <button onClick={() => setMode(id)} style={{ textAlign: "left", cursor: "pointer", font: "inherit", flex: "1 1 200px", padding: "12px 16px", borderRadius: 14, border: `1.5px solid ${on ? "var(--brand)" : "var(--line-2)"}`, background: on ? "color-mix(in oklab, var(--brand) 10%, var(--surface))" : "var(--surface)" }}>
        <div style={{ fontWeight: 700, fontSize: ".95rem", color: on ? "var(--brand)" : "var(--ink)" }}>{label}</div>
        <div className="muted" style={{ fontSize: ".76rem", marginTop: 2 }}>{sub}</div>
      </button>
    );
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {tab("ai", "✨ AI Studio", "Hook, naskah, caption & CTA dari resep cakra")}
        {tab("auto", "⚡ Full Auto", "Unggah foto properti — konten jadi otomatis")}
        {tab("semi", "🎛 Semi Auto", "Susun manual: pilih gambar, ukuran & teks")}
      </div>
      {mode === "ai" ? AiStudio : mode === "auto" ? FullAuto : SemiAuto}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
