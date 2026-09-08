"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CakraMark } from "./CakraMark";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang" },
  { href: "/listing", label: "Listing" },
  { href: "/hub", label: "Hub" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Kontak" },
];

const HERO_PAGES = ["/", "/about", "/hub"];

export function SiteNav() {
  const pathname = usePathname();
  const isHero = HERO_PAGES.includes(pathname);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 28);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    let t: "light" | "dark" = "light";
    try {
      const s = localStorage.getItem("cakra-theme");
      t = s === "dark" || s === "light" ? s : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {}
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("cakra-theme", next); } catch {}
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const overHero = isHero && !scrolled && !mobileOpen;
  const heroWhite = overHero && theme === "dark"; // white text only over the dark-mode hero
  const txt = heroWhite ? "#fff" : "var(--ink)";
  const muted = heroWhite ? "rgba(255,255,255,.85)" : overHero ? "var(--ink-2)" : "var(--muted)";
  const heroBorder = heroWhite ? "rgba(255,255,255,.5)" : "var(--line-2)";

  if (pathname === "/demo" || pathname.startsWith("/demo/") || pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  const themeBtn = (
    <button type="button" onClick={toggleTheme} aria-label="Ganti tema terang / gelap" style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 11, background: "transparent", color: txt, border: `1px solid ${heroBorder}`, cursor: "pointer", transition: "all .3s" }}>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4 11a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2h2Zm18 0a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2ZM5.6 4.2 7 5.6A1 1 0 0 1 5.6 7L4.2 5.6a1 1 0 0 1 1.4-1.4Zm12.8 12.8 1.4 1.4a1 1 0 0 1-1.4 1.4L17 18.4a1 1 0 0 1 1.4-1.4ZM7 18.4 5.6 19.8a1 1 0 0 1-1.4-1.4L5.6 17A1 1 0 0 1 7 18.4ZM19.8 4.2a1 1 0 0 1 0 1.4L18.4 7A1 1 0 0 1 17 5.6l1.4-1.4a1 1 0 0 1 1.4 0Z" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      )}
    </button>
  );

  return (
    <>
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, transition: "background .3s ease, border-color .3s ease",
          background: overHero ? "transparent" : "color-mix(in oklab, var(--bg) 92%, transparent)",
          backdropFilter: overHero ? "none" : "blur(10px)",
          borderBottom: `1px solid ${overHero ? "transparent" : "var(--line)"}`,
        }}
      >
        <div className="wrap cakra-navbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 86 }}>
          <Link href="/" className="cakra-logo" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: txt }}>
            <CakraMark size={46} />
            <span className="hand cakra-word" style={{ fontSize: "2.95rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
            <nav style={{ display: "flex", gap: 30, alignItems: "center" }} className="cakra-navlinks">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} style={{ color: muted, textDecoration: "none", fontSize: "1.12rem", fontWeight: 500, transition: "color .3s" }}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {themeBtn}
              <div className="cakra-auth" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Link href="/login" className="btn" style={{ padding: ".62rem 1.2rem", fontSize: "1rem", background: "transparent", color: txt, border: `1px solid ${heroBorder}`, transition: "all .3s" }}>
                  Masuk
                </Link>
                <Link href="/onboarding" className="btn btn-brand" style={{ padding: ".62rem 1.3rem", fontSize: "1rem" }}>Mulai gratis</Link>
              </div>
              <button type="button" className="cakra-burger" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu" aria-expanded={mobileOpen} style={{ display: "none", placeItems: "center", width: 44, height: 44, borderRadius: 11, background: "transparent", color: txt, border: `1px solid ${heroBorder}`, cursor: "pointer" }}>
                {mobileOpen
                  ? <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                  : <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="cakra-mobile" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", boxShadow: "var(--shadow)" }}>
            <div className="wrap" style={{ display: "grid", padding: "6px 0 18px" }}>
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{ padding: "13px 4px", color: "var(--ink)", textDecoration: "none", fontSize: "1.15rem", fontWeight: 500, borderBottom: "1px solid var(--line)" }}>
                  {l.label}
                </Link>
              ))}
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: "1rem", padding: ".85rem" }}>Masuk</Link>
                <Link href="/onboarding" onClick={() => setMobileOpen(false)} className="btn btn-brand" style={{ flex: 1, justifyContent: "center", fontSize: "1rem", padding: ".85rem" }}>Mulai gratis</Link>
              </div>
            </div>
          </div>
        )}
        <style>{`
          @media (max-width: 900px){
            .cakra-navlinks{ display:none !important; }
            .cakra-auth{ display:none !important; }
            .cakra-burger{ display:grid !important; }
            .cakra-navbar{ height:68px !important; }
            .cakra-logo svg{ width:38px !important; height:38px !important; }
            .cakra-word{ font-size:2.1rem !important; }
          }
        `}</style>
      </header>
      {!isHero && <div className="cakra-spacer" style={{ height: 86 }} />}
      <style>{`@media (max-width: 900px){ .cakra-spacer{ height:68px !important; } }`}</style>
    </>
  );
}
