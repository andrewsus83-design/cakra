"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { db, uploadAsset } from "@/lib/supabase";

// Filterable shared media library (images, b-roll video, BGM audio) read from the `assets` table.
// RLS returns the global library (agent_id NULL) plus the signed-in user's own assets.
// kind="both" shows an internal Gambar/Audio switch; a single kind ("image"|"video"|"audio") shows just one.
type Kind = "image" | "audio" | "video" | "both";

const CAT_COLOR: Record<string, string> = {
  Chill: "--c-throat", Cinematic: "--c-crown", Corporate: "--c-eye", Upbeat: "--c-solar",
  Inspiring: "--c-heart", Ambient: "--c-root", Piano: "--c-sacral", Electronic: "--c-eye",
  Acoustic: "--c-solar", HipHop: "--c-root", Tropical: "--c-throat", Dramatic: "--c-crown",
};
const IMG_FACETS = [
  { key: "location", label: "Lokasi" },
  { key: "property_type", label: "Tipe" },
  { key: "section", label: "Bagian" },
];
const AUD_FACETS = [
  { key: "genre", label: "Genre" },
  { key: "mood", label: "Mood" },
  { key: "tempo", label: "Tempo" },
  { key: "use_case", label: "Untuk", array: true },
];
const DUR_BANDS = [
  { id: "", label: "Semua durasi" },
  { id: "s", label: "< 20 dtk · hook" },
  { id: "m", label: "20–45 dtk · reel" },
  { id: "l", label: "45–90 dtk · bed" },
  { id: "xl", label: "90 dtk+ · panjang" },
];
// Aspect ratios offered in the image preview popup (id + numeric width/height ratio for sizing).
// A4 (210:297 portrait) is for print flyers / brochures.
const ARS = [
  { id: "1:1", r: 1 }, { id: "9:16", r: 9 / 16 }, { id: "16:9", r: 16 / 9 }, { id: "3:4", r: 3 / 4 }, { id: "2:1", r: 2 }, { id: "A4", r: 210 / 297 },
];

const selStyle: React.CSSProperties = { font: "inherit", fontSize: ".82rem", padding: ".42rem .6rem", borderRadius: 9, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", cursor: "pointer" };
const fmtDur = (s?: number) => { if (!s) return ""; const m = Math.floor(s / 60), ss = Math.round(s % 60); return `${m}:${String(ss).padStart(2, "0")}`; };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function AssetLibrary({ kind = "both", canUpload = false }: { kind?: Kind; canUpload?: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [upBusy, setUpBusy] = useState(false);
  const [upMsg, setUpMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"image" | "video" | "audio">(kind === "audio" ? "audio" : "image");
  const [primary, setPrimary] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [durBand, setDurBand] = useState("");
  const [charFilter, setCharFilter] = useState<"" | "with" | "without">("");   // image/video: with / without people
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);   // image clicked → AR popup
  const [previewAR, setPreviewAR] = useState("1:1");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1600); };

  const load = async () => {
    setErr(null); setLoading(true);
    try { const r = await db("assets", { query: "order=created_at.desc&limit=1000" }); setRows(Array.isArray(r) ? r : []); }
    catch (e: any) { setErr(e?.message || "Gagal memuat aset."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  // Stop any playing track when the library unmounts (e.g. leaving the Aset section).
  useEffect(() => () => { const a = audioRef.current; if (a) { try { a.pause(); a.src = ""; } catch {} } }, []);

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUpBusy(true); setUpMsg(null);
    let ok = 0, fail = 0;
    for (const f of Array.from(files)) {
      try { await uploadAsset(f); ok++; } catch { fail++; }
      setUpMsg(`Mengunggah… ${ok + fail}/${files.length}`);
    }
    await load();
    setUpBusy(false);
    setUpMsg(fail ? `${ok} terunggah, ${fail} gagal` : `${ok} aset terunggah ✓`);
    setTimeout(() => setUpMsg(null), 3400);
    if (fileRef.current) fileRef.current.value = "";
  };

  const activeKind = kind === "both" ? tab : kind;
  const facets = activeKind === "audio" ? AUD_FACETS : IMG_FACETS;
  useEffect(() => { setPrimary(""); setFilters({}); setDurBand(""); setQ(""); setCharFilter(""); }, [activeKind]);

  const items = useMemo(() => rows.filter((r) => r.type === activeKind), [rows, activeKind]);
  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) { const c = it.meta?.category; if (c) s.add(String(c)); }
    return Array.from(s).sort();
  }, [items]);
  const options = useMemo(() => {
    const o: Record<string, string[]> = {};
    for (const f of facets) {
      const s = new Set<string>();
      for (const it of items) {
        const v = it.meta?.[f.key];
        if (Array.isArray(v)) v.forEach((x: string) => x && s.add(x));
        else if (v) s.add(String(v));
      }
      o[f.key] = Array.from(s).sort();
    }
    return o;
  }, [items, facets]);
  const filtered = useMemo(() => items.filter((it) => {
    if (primary && String(it.meta?.category || "") !== primary) return false;
    for (const f of facets) {
      const sel = filters[f.key];
      if (!sel) continue;
      const v = it.meta?.[f.key];
      if (Array.isArray(v)) { if (!v.includes(sel)) return false; }
      else if (String(v || "") !== sel) return false;
    }
    if ((activeKind === "audio" || activeKind === "video") && durBand) {
      const d = it.duration_s || 0;
      if (durBand === "s" && !(d < 20)) return false;
      if (durBand === "m" && !(d >= 20 && d < 45)) return false;
      if (durBand === "l" && !(d >= 45 && d < 90)) return false;
      if (durBand === "xl" && !(d >= 90)) return false;
    }
    if ((activeKind === "image" || activeKind === "video") && charFilter) {
      const hasChar = it.meta?.character === "yes";
      if (charFilter === "with" && !hasChar) return false;
      if (charFilter === "without" && hasChar) return false;
    }
    if (q) { const hay = `${it.title || ""} ${JSON.stringify(it.meta || {})}`.toLowerCase(); if (!hay.includes(q.toLowerCase())) return false; }
    return true;
  }), [items, primary, filters, facets, activeKind, durBand, charFilter, q]);

  const copy = (url: string) => { try { navigator.clipboard.writeText(url); flash("URL disalin ✓"); } catch { flash("URL: " + url.slice(0, 40) + "…"); } };
  const seg = (on: boolean): React.CSSProperties => ({ border: "none", cursor: "pointer", font: "inherit", fontWeight: 600, fontSize: ".82rem", padding: ".4rem .85rem", borderRadius: 999, background: on ? "var(--brand)" : "transparent", color: on ? "#fff" : "var(--muted)" });

  const openPreview = (it: any) => { setPreview(it); setPreviewAR(it.type === "video" ? "16:9" : "1:1"); };
  const toggleAudio = (it: any) => {
    const a = audioRef.current; if (!a) return;
    if (playingId === it.id) { a.pause(); setPlayingId(null); return; }
    // Set the active id optimistically (last click wins) so a slow play() promise can't strand a
    // stale "now playing" state when the user quickly switches tracks.
    a.src = it.storage_path; setPlayingId(it.id);
    a.play().catch(() => setPlayingId((cur) => (cur === it.id ? null : cur)));
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} style={{ display: "none" }} />

      {kind === "both" && (
        <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 4, alignSelf: "flex-start" }}>
          {([["image", `Gambar (${rows.filter((r) => r.type === "image").length})`], ["video", `Video (${rows.filter((r) => r.type === "video").length})`], ["audio", `Musik & BGM (${rows.filter((r) => r.type === "audio").length})`]] as const).map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={seg(tab === id)}>{l}</button>
          ))}
        </div>
      )}

      {canUpload && (
        <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
          style={{ border: "1.5px dashed var(--line-2)", borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: "var(--surface-2)" }}>
          <div style={{ minWidth: 180, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: ".9rem" }}>Unggah aset Anda</div>
            <div className="muted" style={{ fontSize: ".78rem", lineHeight: 1.45 }}>Seret &amp; lepas atau pilih file — {activeKind === "audio" ? "audio (mp3/wav/aac/ogg)" : activeKind === "video" ? "video (mp4/webm/mov, maks 100 MB)" : "gambar (jpg/png/webp)"}. {activeKind === "image" ? "Gambar dioptimalkan otomatis; " : ""}hanya Anda yang melihatnya di pustaka.</div>
          </div>
          <input ref={fileRef} type="file" accept={activeKind === "audio" ? "audio/*" : activeKind === "video" ? "video/*" : activeKind === "image" ? "image/*" : "image/*,audio/*,video/*"} multiple onChange={(e) => onFiles(e.target.files)} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} disabled={upBusy} className="btn btn-brand" style={{ padding: ".6rem 1.1rem", fontSize: ".9rem", opacity: upBusy ? .6 : 1 }}>{upBusy ? "Mengunggah…" : "＋ Pilih file"}</button>
          {upMsg && <span style={{ fontSize: ".8rem", fontWeight: 600, color: upMsg.includes("✓") ? "var(--good)" : upBusy ? "var(--muted)" : "var(--crit)" }}>{upMsg}</span>}
        </div>
      )}

      {/* filter bar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {categories.length > 1 && (
          <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 3, flexWrap: "wrap" }}>
            <button onClick={() => setPrimary("")} style={seg(!primary)}>Semua</button>
            {categories.map((c) => <button key={c} onClick={() => setPrimary(c)} style={seg(primary === c)}>{c}</button>)}
          </div>
        )}
        {facets.map((f) => options[f.key]?.length ? (
          <select key={f.key} value={filters[f.key] || ""} onChange={(e) => setFilters((s) => ({ ...s, [f.key]: e.target.value }))} style={selStyle} aria-label={f.label}>
            <option value="">{f.label} · semua</option>
            {options[f.key].map((v) => <option key={v} value={v}>{cap(v)}</option>)}
          </select>
        ) : null)}
        {(activeKind === "image" || activeKind === "video") && (
          <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 3 }}>
            {([["", "Semua"], ["with", "Dengan orang"], ["without", "Tanpa orang"]] as const).map(([id, l]) => (
              <button key={id} onClick={() => setCharFilter(id)} style={seg(charFilter === id)}>{l}</button>
            ))}
          </div>
        )}
        {(activeKind === "audio" || activeKind === "video") && (
          <select value={durBand} onChange={(e) => setDurBand(e.target.value)} style={selStyle} aria-label="Durasi">
            {DUR_BANDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        )}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari…" style={{ ...selStyle, minWidth: 120, flex: "1 1 120px", maxWidth: 220 }} />
      </div>

      <div className="muted" style={{ fontSize: ".82rem" }}>
        {loading ? "Memuat aset…" : `${filtered.length} ${activeKind === "audio" ? "trek" : activeKind === "video" ? "klip" : "gambar"}`}
        {toast && <span style={{ color: "var(--good)", marginLeft: 12 }}>✓ {toast.replace("✓", "")}</span>}
      </div>
      {err && <p style={{ color: "var(--crit)", fontSize: ".85rem", margin: 0 }}>{err}</p>}

      {!loading && filtered.length === 0 && (
        <div className="card" style={{ padding: 34, textAlign: "center", color: "var(--muted)" }}>
          {rows.filter((r) => r.type === activeKind).length === 0 ? (activeKind === "audio" ? "Pustaka musik sedang dibuat — muncul otomatis saat selesai." : activeKind === "video" ? "Pustaka video b-roll sedang dibuat — muncul otomatis saat selesai." : "Belum ada gambar di pustaka.") : "Tidak ada yang cocok dengan filter."}
        </div>
      )}

      {/* IMAGES — click to open the aspect-ratio preview popup */}
      {activeKind === "image" && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 }}>
          {filtered.map((it) => (
            <figure key={it.id} onClick={() => openPreview(it)} title="Klik untuk pratinjau rasio" style={{ margin: 0, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface-2)", cursor: "zoom-in" }}>
              <div style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.meta?.thumb || it.storage_path} alt={it.title || ""} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {it.meta?.category && <span style={{ position: "absolute", top: 8, left: 8, fontSize: ".64rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", color: "#fff", background: "rgba(20,15,9,.55)", padding: ".2rem .5rem", borderRadius: 999, backdropFilter: "blur(4px)" }}>{it.meta.category}</span>}
                <button onClick={(e) => { e.stopPropagation(); copy(it.storage_path); }} style={{ position: "absolute", bottom: 8, right: 8, fontSize: ".7rem", fontWeight: 600, color: "#fff", background: "rgba(20,15,9,.5)", border: "none", borderRadius: 8, padding: ".3rem .55rem", cursor: "pointer", backdropFilter: "blur(4px)" }}>⧉ URL</button>
              </div>
              <figcaption style={{ padding: "8px 10px" }}>
                <div style={{ fontWeight: 600, fontSize: ".8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title || "—"}</div>
                <div className="muted" style={{ fontSize: ".7rem", marginTop: 2 }}>{[it.meta?.location, it.meta?.property_type, it.meta?.section].filter(Boolean).join(" · ") || "global"}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* AUDIO — 1:1 cards, custom compact player, many per row */}
      {activeKind === "audio" && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {filtered.map((it) => {
            const col = `var(${CAT_COLOR[it.meta?.category as string] || "--brand"})`;
            const on = playingId === it.id;
            return (
              <div key={it.id} onClick={() => toggleAudio(it)} title={on ? "Jeda" : "Putar"} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 14, overflow: "hidden", border: `1px solid ${on ? col : "var(--line)"}`, cursor: "pointer", background: `linear-gradient(160deg, color-mix(in oklab, ${col} 20%, var(--surface)), var(--surface))` }}>
                {it.meta?.cover && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.meta.cover} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(165deg, color-mix(in oklab, ${col} 34%, rgba(20,15,9,.30)), rgba(20,15,9,.66))` }} />
                  </>
                )}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontSize: ".58rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: col }}>{it.meta?.category || "BGM"}</span>
                    <span className="mono" style={{ fontSize: ".64rem", color: "var(--muted)" }}>{fmtDur(it.duration_s)}</span>
                  </div>
                  <div style={{ margin: "auto", display: "grid", placeItems: "center" }}>
                    {on ? (
                      <div className="al-eq" aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 30 }}>
                        {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ width: 4, borderRadius: 2, background: col, animation: `alEq .9s ease-in-out ${i * 0.12}s infinite alternate` }} />)}
                      </div>
                    ) : (
                      <span style={{ width: 42, height: 42, borderRadius: "50%", background: col, color: "#fff", display: "grid", placeItems: "center", boxShadow: "0 6px 16px -6px rgba(20,15,9,.5)" }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: ".78rem", lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: it.meta?.cover ? "#fff" : "var(--ink)" }}>{it.title}</div>
                    <div style={{ fontSize: ".64rem", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: it.meta?.cover ? "rgba(255,255,255,.82)" : "var(--muted)" }}>{[it.meta?.genre, it.meta?.mood].filter(Boolean).map(cap).join(" · ")}</div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); copy(it.storage_path); }} title="Salin URL" style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, display: "grid", placeItems: "center", borderRadius: 7, border: "1px solid var(--line-2)", background: "color-mix(in oklab, var(--surface) 80%, transparent)", color: "var(--ink-2)", fontSize: ".72rem", cursor: "pointer" }}>⧉</button>
              </div>
            );
          })}
        </div>
      )}

      {/* VIDEO — b-roll cards, hover to play, click to preview & crop */}
      {activeKind === "video" && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
          {filtered.map((it) => (
            <figure key={it.id} onClick={() => openPreview(it)} title="Klik untuk pratinjau & potong rasio" style={{ margin: 0, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface-2)", cursor: "zoom-in" }}>
              <div style={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden", background: "#000" }}>
                <video src={it.storage_path} muted loop playsInline preload="metadata"
                  onMouseEnter={(e) => { e.currentTarget.play().catch(() => {}); }}
                  onMouseLeave={(e) => { const v = e.currentTarget; v.pause(); try { v.currentTime = 0; } catch {} }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <span style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}>
                  {it.meta?.category && <span style={{ fontSize: ".62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", color: "#fff", background: "rgba(20,15,9,.55)", padding: ".2rem .5rem", borderRadius: 999, backdropFilter: "blur(4px)" }}>{it.meta.category}</span>}
                  {it.meta?.loop && <span style={{ fontSize: ".6rem", fontWeight: 700, color: "#fff", background: "rgba(41,110,74,.72)", padding: ".2rem .45rem", borderRadius: 999, backdropFilter: "blur(4px)" }}>LOOP</span>}
                </span>
                <span style={{ position: "absolute", bottom: 8, left: 8, fontSize: ".64rem", fontWeight: 700, color: "#fff", background: "rgba(20,15,9,.55)", padding: ".16rem .45rem", borderRadius: 6, backdropFilter: "blur(4px)" }}>{it.duration_s ? `${Math.round(it.duration_s)}s` : "▶"}</span>
                <button onClick={(e) => { e.stopPropagation(); copy(it.storage_path); }} style={{ position: "absolute", bottom: 8, right: 8, fontSize: ".7rem", fontWeight: 600, color: "#fff", background: "rgba(20,15,9,.5)", border: "none", borderRadius: 8, padding: ".3rem .55rem", cursor: "pointer", backdropFilter: "blur(4px)" }}>⧉ URL</button>
              </div>
              <figcaption style={{ padding: "8px 10px" }}>
                <div style={{ fontWeight: 600, fontSize: ".8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title || "—"}</div>
                <div className="muted" style={{ fontSize: ".7rem", marginTop: 2 }}>{[it.meta?.location, it.meta?.property_type, it.meta?.section].filter(Boolean).join(" · ") || "global"}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* IMAGE / VIDEO aspect-ratio preview popup */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(20,15,9,.62)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: "clamp(12px,4vw,28px)" }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: "min(720px, 96vw)", maxHeight: "92vh", overflow: "auto", padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--line)", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{preview.title || "Gambar"}</div>
                <div className="muted" style={{ fontSize: ".76rem" }}>{[preview.meta?.location, preview.meta?.property_type, preview.meta?.category, preview.meta?.section].filter(Boolean).join(" · ") || "global"}</div>
              </div>
              <button onClick={() => setPreview(null)} aria-label="Tutup" style={{ flex: "none", width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "18px 18px 8px", display: "grid", placeItems: "center" }}>
              <div style={{ width: `min(100%, ${58 * (ARS.find((a) => a.id === previewAR)?.r || 1)}vh)`, aspectRatio: String(ARS.find((a) => a.id === previewAR)?.r || 1), borderRadius: 12, overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                {preview.type === "video" ? (
                  <video src={preview.storage_path} controls autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={preview.storage_path} alt={preview.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                )}
              </div>
              <p className="muted" style={{ fontSize: ".72rem", marginTop: 8 }}>Pratinjau potong <b>{previewAR}</b> — sesuai untuk {previewAR === "9:16" ? "Story / Reels / TikTok" : previewAR === "1:1" ? "Post Instagram / Facebook" : previewAR === "16:9" ? "YouTube / presentasi" : previewAR === "3:4" ? "feed portrait" : previewAR === "A4" ? "flyer / brosur cetak (A4)" : "banner / hero"}.</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", padding: "6px 18px 14px" }}>
              {ARS.map((a) => (
                <button key={a.id} onClick={() => setPreviewAR(a.id)} style={{ ...seg(previewAR === a.id), border: `1px solid ${previewAR === a.id ? "var(--brand)" : "var(--line-2)"}`, background: previewAR === a.id ? "var(--brand)" : "var(--surface)", color: previewAR === a.id ? "#fff" : "var(--ink-2)" }}>{a.id}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", padding: "0 18px 20px", flexWrap: "wrap" }}>
              <button onClick={() => copy(preview.storage_path)} className="btn btn-ghost" style={{ padding: ".6rem 1.1rem", fontSize: ".9rem" }}>⧉ Salin URL</button>
              <a href={preview.storage_path} target="_blank" rel="noopener noreferrer" className="btn btn-brand" style={{ padding: ".6rem 1.2rem", fontSize: ".9rem" }}>{preview.type === "video" ? "Buka video ↗" : "Buka gambar ↗"}</a>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes alEq{ from{ height:6px } to{ height:26px } }`}</style>
    </div>
  );
}
