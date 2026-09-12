"use client";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { CakraMark } from "@/components/CakraMark";

// Interactive point-to-point onboarding: walks a new agent menu-by-menu, switching the live
// dashboard section as it goes and spotlighting the matching menu item, with a short, concrete
// note for each. Auto-runs the first 3 visits (per user, localStorage) unless skipped; always
// reopenable via the floating "?" button, which also holds a quick glossary.
type Step = { t: string; b: string; icon: string; goto?: string; sel?: string };

const STEPS: Step[] = [
  { t: "Selamat datang di cakra 👋", icon: "M12 3 3 9v12h6v-7h6v7h6V9z",
    b: "Ini pusat kendali Anda — situs, listing, dan konten dibuat otomatis. Tur singkat ini memandu Anda menu demi menu. Boleh dilewati kapan saja." },
  { t: "Dashboard", icon: "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z", goto: "home", sel: '[data-tour="nav-home"]',
    b: "Ringkasan kehadiran Anda plus Skor Cakra. Dari sini Anda selalu tahu langkah berikutnya untuk bertumbuh." },
  { t: "Web Builder", icon: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm2 3v11h6V8H5Zm8 0v4h6V8h-6Zm6 6h-6v5h6v-5Z", goto: "builder", sel: '[data-tour="nav-builder"]',
    b: "Atur tampilan situs — warna, font, tata letak, dekorasi. Perubahan langsung terlihat tanpa kredit AI. Klik Terbitkan agar tayang di situs publik Anda." },
  { t: "Listing", icon: "M4 5h16v3H4zM4 10.5h16v3H4zM4 16h16v3H4z", goto: "listing", sel: '[data-tour="nav-listing"]',
    b: "Kelola properti Anda. Klik satu listing untuk mengubah detail atau status (Dijual → Terjual / Tersewa / Habis). Semua tersimpan otomatis ke akun Anda." },
  { t: "Editor", icon: "M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm6 3v6l5-3z", goto: "editor", sel: '[data-tour="nav-editor"]',
    b: "Buat video listing otomatis dari foto & detail properti — siap dibagikan ke calon pembeli." },
  { t: "Konten", icon: "M6 2h9l5 5v14.2A.8.8 0 0 1 19.2 22H6a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 6 2Zm2 9h8v1.8H8zm0 4h8v1.8H8z", goto: "content", sel: '[data-tour="nav-content"]',
    b: "Konten SEO/GEO/social buatan AI untuk 6 platform — Blog, Instagram, Facebook, TikTok, YouTube, Shorts. Tinjau, salin, lalu posting." },
  { t: "Aset", icon: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 17h14l-4.5-6-3.5 4.5-2-2.5L5 17Z", goto: "assets", sel: '[data-tour="nav-assets"]',
    b: "Pustaka gambar & audio Anda — dipakai ulang di situs dan konten kapan saja." },
  { t: "Skor Cakra", icon: "M12 3a9 9 0 1 0 9 9M12 3v9l6-3", goto: "home", sel: '[data-tour="nav-home"]',
    b: "Satu angka kehadiran digital Anda — Website, Listing, Konten, SEO, GEO, Social, Reputasi — naik seiring Anda menerbitkan situs & konten. Selesai! Klik ikon ? kapan saja untuk membuka tur atau glosarium." },
];

const GLOSSARY: [string, string][] = [
  ["SEO", "Search Engine Optimization — agar situs Anda muncul di Google saat orang mencari properti."],
  ["GEO", "Generative Engine Optimization — agar konten Anda dikutip AI (ChatGPT, Gemini) saat menjawab pertanyaan properti."],
  ["Social Search", "Optimasi agar konten ditemukan lewat pencarian di TikTok, Instagram, YouTube."],
  ["Local Search", "Optimasi berbasis lokasi — muncul saat orang mencari properti di area Anda."],
  ["Skor Cakra", "Ringkasan kehadiran digital Anda dalam satu angka, dipecah per pilar."],
  ["Web Builder", "Editor tampilan situs — menata ulang template secara instan, tanpa kredit AI."],
  ["Listing", "Properti yang tayang di situs Anda. Status: Dijual, Disewa, Terjual, Tersewa, Habis."],
  ["Advertorial", "Artikel bergaya editorial yang menjual — memadukan informasi dan promosi halus."],
  ["Terbitkan", "Menerapkan tampilan & konten yang Anda atur ke situs publik Anda."],
];

function visibleTarget(sel?: string): HTMLElement | null {
  if (!sel) return null;
  const els = Array.from(document.querySelectorAll<HTMLElement>(sel));
  return els.find((e) => e.offsetParent !== null && e.getClientRects().length > 0) || null;
}

export function WelcomeTour({ userId, onGoto }: { userId: string; onGoto?: (sec: string) => void }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"tour" | "glossary">("tour");
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const countKey = `cakra_tour_count_${userId}`;
  const skipKey = `cakra_tour_skip_${userId}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(skipKey)) return;
      const c = parseInt(localStorage.getItem(countKey) || "0", 10) || 0;
      if (c < 3) { localStorage.setItem(countKey, String(c + 1)); setView("tour"); setStep(0); setOpen(true); }
    } catch {}
  }, [userId]); // eslint-disable-line

  // Measure the target's rect for the spotlight. `scroll` only true on a step change — the scroll
  // listener passes false so reading the rect can never re-trigger itself into a layout loop.
  const measure = useCallback((scroll = false) => {
    const el = visibleTarget(STEPS[step]?.sel);
    if (el) { if (scroll) el.scrollIntoView({ block: "nearest" }); setRect(el.getBoundingClientRect()); }
    else setRect(null);
  }, [step]);

  useLayoutEffect(() => {
    if (!open || view !== "tour") { setRect(null); return; }
    const s = STEPS[step];
    if (s?.goto && onGoto) onGoto(s.goto);
    const t1 = setTimeout(() => measure(true), 60);
    const t2 = setTimeout(() => measure(true), 220); // re-measure after the section transition settles
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [open, view, step, measure, onGoto]);

  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => measure(false)); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("resize", on);
    window.addEventListener("scroll", on, true);
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", on); window.removeEventListener("scroll", on, true); window.removeEventListener("keydown", onKey); };
  }, [open, measure]);

  const skipForever = () => { try { localStorage.setItem(skipKey, "1"); } catch {} setOpen(false); };
  const close = () => setOpen(false);
  const openManual = () => { setView("tour"); setStep(0); setOpen(true); };

  const helpBtn = (
    <button onClick={openManual} aria-label="Panduan & glosarium" title="Panduan & glosarium" style={{ position: "fixed", bottom: 18, right: 18, zIndex: 90, width: 46, height: 46, borderRadius: "50%", border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer", fontWeight: 800, fontSize: "1.25rem", boxShadow: "0 10px 26px -8px rgba(20,15,9,.5)" }}>?</button>
  );

  if (!open) return helpBtn;

  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  const isTour = view === "tour";

  // Coach card placement: beside the spotlighted menu on wide screens, else pinned bottom-center.
  const wide = typeof window !== "undefined" && window.innerWidth > 760;
  const cardW = Math.min(380, (typeof window !== "undefined" ? window.innerWidth : 400) - 32);
  let cardStyle: React.CSSProperties;
  if (isTour && rect && wide) {
    const top = Math.max(16, Math.min(rect.top - 6, (window.innerHeight || 800) - 340));
    cardStyle = { position: "fixed", left: Math.min(rect.right + 16, window.innerWidth - cardW - 16), top, width: cardW, zIndex: 97 };
  } else if (isTour && rect) {
    cardStyle = { position: "fixed", left: "50%", bottom: 20, transform: "translateX(-50%)", width: cardW, zIndex: 97 };
  } else {
    cardStyle = { position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: Math.min(520, cardW + 140), maxHeight: "88vh", overflow: "auto", zIndex: 97 };
  }

  return (
    <>
      {helpBtn}
      {/* dim overlay — spotlight cutout via big box-shadow when a target is measured */}
      <div onClick={isTour ? undefined : close} style={{ position: "fixed", inset: 0, zIndex: 95, background: rect && isTour ? "transparent" : "rgba(20,15,9,.55)", backdropFilter: rect && isTour ? "none" : "blur(3px)" }} />
      {isTour && rect && (
        <div style={{ position: "fixed", top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, borderRadius: 12, boxShadow: "0 0 0 9999px rgba(20,15,9,.55)", border: "2px solid var(--brand)", pointerEvents: "none", zIndex: 96, transition: "top .2s, left .2s, width .2s, height .2s" }} />
      )}

      <div className="card" style={{ ...cardStyle, padding: 0 }} role="dialog" aria-modal="true">
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CakraMark size={24} />
            <span style={{ display: "inline-flex", gap: 4, background: "var(--surface-2)", borderRadius: 999, padding: 3 }}>
              {(["tour", "glossary"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} style={{ border: "none", cursor: "pointer", font: "inherit", fontSize: ".78rem", fontWeight: 700, padding: ".28rem .7rem", borderRadius: 999, background: view === v ? "var(--surface)" : "transparent", color: view === v ? "var(--brand)" : "var(--muted)", boxShadow: view === v ? "var(--shadow-soft)" : "none" }}>{v === "tour" ? "Panduan" : "Glosarium"}</button>
              ))}
            </span>
          </span>
          <button onClick={close} aria-label="Tutup" style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>✕</button>
        </div>

        {isTour ? (
          <div style={{ padding: "20px 20px 18px" }}>
            <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
              <span style={{ flex: "none", width: 44, height: 44, borderRadius: 12, background: "color-mix(in oklab, var(--brand) 14%, var(--surface))", color: "var(--brand)", display: "grid", placeItems: "center" }}>
                <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="mono" style={{ fontSize: ".72rem", color: "var(--muted)", letterSpacing: ".05em" }}>Langkah {step + 1} / {STEPS.length}</div>
                <h2 className="display" style={{ fontSize: "1.28rem", fontWeight: 700, margin: "2px 0 0", lineHeight: 1.15 }}>{s.t}</h2>
                <p className="muted" style={{ fontSize: ".93rem", lineHeight: 1.55, margin: "8px 0 0" }}>{s.b}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "18px 0 16px" }}>
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => setStep(i)} aria-label={`Langkah ${i + 1}`} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 999, border: "none", cursor: "pointer", background: i === step ? "var(--brand)" : "var(--line-2)", transition: "width .2s" }} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <button onClick={skipForever} style={{ background: "none", border: "none", font: "inherit", fontSize: ".82rem", color: "var(--muted)", cursor: "pointer" }}>Lewati</button>
              <div style={{ display: "flex", gap: 8 }}>
                {step > 0 && <button onClick={() => setStep(step - 1)} className="btn btn-ghost" style={{ padding: ".55rem .95rem" }}>Kembali</button>}
                <button onClick={() => (last ? close() : setStep(step + 1))} className="btn btn-brand" style={{ padding: ".55rem 1.25rem" }}>{last ? "Selesai" : "Lanjut →"}</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "18px 20px 20px", maxHeight: "70vh", overflow: "auto" }}>
            <p className="hand" style={{ color: "var(--brand)", fontSize: "1.3rem", transform: "rotate(-2deg)", margin: "0 0 10px" }}>istilah singkat</p>
            <div style={{ display: "grid", gap: 12 }}>
              {GLOSSARY.map(([k, v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "minmax(92px,116px) 1fr", gap: 12, alignItems: "baseline", paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--brand)" }}>{k}</span>
                  <span className="muted" style={{ fontSize: ".86rem", lineHeight: 1.5 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
