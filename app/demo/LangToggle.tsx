"use client";
import { useEffect, useRef, useState } from "react";

// EN/ID switch for the sample site. Swaps the most visible strings (nav + hero) client-side;
// full bilingual copy comes from the content generator per agent. Choice persists locally.
const T: { sel: string; en: string }[] = [
  { sel: ".k-links a:nth-child(1)", en: "Home" },
  { sel: ".k-links a:nth-child(2)", en: "About" },
  { sel: ".k-links a:nth-child(3)", en: "Listings" },
  { sel: ".k-links a:nth-child(4)", en: "Hub" },
  { sel: ".k-links a:nth-child(5)", en: "FAQ" },
  { sel: ".k-nav-in .k-btn-primary", en: "Contact" },
  { sel: ".k-hero .k-kick-light", en: "bali property specialist" },
  { sel: ".k-hero .k-h1", en: "Premium Bali villas & property, from hands that truly understand." },
  { sel: ".k-hero .k-lead", en: "Kirana Sutanto — 10+ years specializing in premium Bali villas & property across Canggu, Seminyak, Uluwatu, Jimbaran, and Ubud. For sale or rent from Rp 3 billion, guided from curation and negotiation to a safe, legal handover." },
  { sel: ".k-hero .k-btn-gold", en: "View properties" },
  { sel: ".k-hero .k-btn-glass", en: "Contact Kirana" },
];

export function LangToggle() {
  const [lang, setLang] = useState("id");
  const [hide, setHide] = useState(false);
  const orig = useRef<Record<number, string>>({});
  // true once a real agent's EN switcher (window.__cakraApplyLang) is live — routes apply() through
  // it and limits the hardcoded T to the generic nav labels (SiteSkin's applyLang owns hero + copy).
  const agentMode = useRef(false);

  // Translate the first `count` hardcoded T entries in place (nav labels are 0-5; hero copy is 6-10).
  const applyNav = (l: string, count: number) => {
    const root = document.getElementById("top");
    if (!root) return;
    for (let i = 0; i < count && i < T.length; i++) {
      const el = root.querySelector(T[i].sel);
      if (!el) continue;
      if (orig.current[i] === undefined) orig.current[i] = el.textContent || "";
      el.textContent = l === "en" ? T[i].en : orig.current[i];
    }
    root.setAttribute("lang", l);
  };
  const apply = (l: string) => {
    if (agentMode.current) {
      // Real agent: drive ALL agent content + hero + meta via SiteSkin's applyLang, and translate
      // ONLY the generic nav labels (0-5) — skip the hardcoded Kirana/Bali hero entries (6-10).
      try { (window as any).__cakraApplyLang?.(l); } catch {}
      applyNav(l, 6);
    } else {
      // Plain /demo: full hardcoded T (nav + hero) exactly as before.
      applyNav(l, T.length);
    }
  };

  useEffect(() => {
    // Real agent (subdomain host or #site=aid)? Its real EN copy lives in advertorial.en and is
    // driven by SiteSkin's window.__cakraApplyLang. Plain /demo keeps the EN/ID switch as before.
    const realAgent = (() => {
      try {
        const m = window.location.hash.match(/site=([^&]+)/);
        if (m) { try { if (JSON.parse(decodeURIComponent(atob(m[1]))).aid) return true; } catch {} }
        const mm = window.location.hostname.toLowerCase().match(/^([a-z0-9-]+)\.cakra\.xyz$/);
        const reserved = ["www", "member", "sample", "app", "api", "admin", "cakra"];
        if (mm && !reserved.includes(mm[1])) return true;
      } catch {}
      return false;
    })();

    if (!realAgent) {
      // Plain /demo — unchanged: restore the saved language against the full hardcoded T.
      let l = "id";
      try { l = localStorage.getItem("cakra-demo-lang") || "id"; } catch {}
      setLang(l);
      if (l !== "id") apply(l);
      else T.forEach((t, i) => { const el = document.getElementById("top")?.querySelector(t.sel); if (el && orig.current[i] === undefined) orig.current[i] = el.textContent || ""; });
      return;
    }

    // Real agent — window.__cakraApplyLang is defined asynchronously (after publicAgentSite resolves).
    // Hide the toggle until we know it exists AND the agent actually has EN copy; poll briefly and
    // bail after ~2.5s so a real agent WITHOUT EN (or a data-less page) simply stays hidden as before.
    setHide(true);
    let cancelled = false;
    const started = Date.now();
    const tick = () => {
      if (cancelled) return;
      if (typeof (window as any).__cakraApplyLang === "function") {
        if ((window as any).__cakraHasEN) {
          agentMode.current = true;
          let l = "id";
          try { l = localStorage.getItem("cakra-demo-lang") || "id"; } catch {}
          setLang(l);
          if (l === "en") apply("en"); // restore the saved language now that the switcher is live
          setHide(false);
        }
        return; // resolved (with or without EN) — stop polling
      }
      if (Date.now() - started > 2500) return; // give up — leave the toggle hidden
      setTimeout(tick, 80);
    };
    tick();
    return () => { cancelled = true; };
  }, []);
  const set = (l: string) => { setLang(l); apply(l); try { localStorage.setItem("cakra-demo-lang", l); } catch {} };

  if (hide) return null;
  return (
    <div className="k-lang" role="group" aria-label="Bahasa / Language">
      <button className={lang === "id" ? "on" : ""} onClick={() => set("id")} aria-pressed={lang === "id"}>ID</button>
      <button className={lang === "en" ? "on" : ""} onClick={() => set("en")} aria-pressed={lang === "en"}>EN</button>
    </div>
  );
}
