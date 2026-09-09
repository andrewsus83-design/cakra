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
  const orig = useRef<Record<number, string>>({});
  const apply = (l: string) => {
    const root = document.getElementById("top");
    if (!root) return;
    T.forEach((t, i) => {
      const el = root.querySelector(t.sel);
      if (!el) return;
      if (orig.current[i] === undefined) orig.current[i] = el.textContent || "";
      el.textContent = l === "en" ? t.en : orig.current[i];
    });
    root.setAttribute("lang", l);
  };
  useEffect(() => {
    let l = "id";
    try { l = localStorage.getItem("cakra-demo-lang") || "id"; } catch {}
    setLang(l);
    if (l !== "id") apply(l);
    else T.forEach((t, i) => { const el = document.getElementById("top")?.querySelector(t.sel); if (el && orig.current[i] === undefined) orig.current[i] = el.textContent || ""; });
  }, []);
  const set = (l: string) => { setLang(l); apply(l); try { localStorage.setItem("cakra-demo-lang", l); } catch {} };

  return (
    <div className="k-lang" role="group" aria-label="Bahasa / Language">
      <button className={lang === "id" ? "on" : ""} onClick={() => set("id")} aria-pressed={lang === "id"}>ID</button>
      <button className={lang === "en" ? "on" : ""} onClick={() => set("en")} aria-pressed={lang === "en"}>EN</button>
    </div>
  );
}
