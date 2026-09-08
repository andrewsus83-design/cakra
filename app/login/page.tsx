"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CakraMark } from "@/components/CakraMark";

export default function Login() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    let t: "light" | "dark" = "light";
    try { const s = localStorage.getItem("cakra-theme"); t = s === "dark" || s === "light" ? s : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; } catch {}
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);
  const toggleTheme = () => { const n = theme === "dark" ? "light" : "dark"; setTheme(n); document.documentElement.setAttribute("data-theme", n); try { localStorage.setItem("cakra-theme", n); } catch {} };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, overflow: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-top.jpg" alt="Vila properti mewah saat golden hour" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div className="photo-scrim" />
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", flex: "none" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
          <CakraMark size={38} />
          <span className="hand on-photo" style={{ fontSize: "2.2rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={toggleTheme} aria-label="Ganti tema terang / gelap" className="btn btn-on-photo" style={{ width: 40, height: 40, padding: 0, display: "grid", placeItems: "center", borderRadius: 10 }}>
            {theme === "dark"
              ? <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4 11a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2h2Zm18 0a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2ZM5.6 4.2 7 5.6A1 1 0 0 1 5.6 7L4.2 5.6a1 1 0 0 1 1.4-1.4Zm12.8 12.8 1.4 1.4a1 1 0 0 1-1.4 1.4L17 18.4a1 1 0 0 1 1.4-1.4ZM7 18.4 5.6 19.8a1 1 0 0 1-1.4-1.4L5.6 17A1 1 0 0 1 7 18.4ZM19.8 4.2a1 1 0 0 1 0 1.4L18.4 7A1 1 0 0 1 17 5.6l1.4-1.4a1 1 0 0 1 1.4 0Z" /></svg>
              : <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>}
          </button>
          <Link href="/" aria-label="Keluar" className="btn btn-on-photo" style={{ width: 40, height: 40, padding: 0, display: "grid", placeItems: "center", borderRadius: 10 }}>✕</Link>
        </div>
      </div>

      <div style={{ position: "relative", flex: 1, display: "grid", placeItems: "center", padding: "10px 24px 60px" }}>
        <div className="card" style={{ padding: "clamp(26px,4vw,40px)", width: "min(440px, 94vw)", boxShadow: "0 30px 80px rgba(20,15,9,.28)" }}>
          <p className="hand" style={{ color: "var(--brand)", fontSize: "1.7rem", transform: "rotate(-2deg)", margin: 0 }}>selamat datang kembali</p>
          <h1 className="display" style={{ fontSize: "clamp(1.8rem,4vw,2.3rem)", fontWeight: 700, lineHeight: 1.1, margin: "4px 0 6px" }}>Masuk ke dashboard</h1>
          <p className="muted" style={{ fontSize: ".95rem", margin: "0 0 22px" }}>Lanjutkan mengelola website, listing, dan konten Anda.</p>
          <form style={{ display: "grid", gap: 16 }}>
            <label style={{ display: "grid", gap: 7 }}>
              <span className="lg-lab">Email</span>
              <input className="lg-input" type="email" placeholder="anda@email.com" />
            </label>
            <label style={{ display: "grid", gap: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="lg-lab">Kata sandi</span>
                <a href="#" className="gold" style={{ fontSize: ".8rem", textDecoration: "none" }}>Lupa sandi?</a>
              </div>
              <input className="lg-input" type="password" placeholder="••••••••" />
            </label>
            <button className="btn btn-brand" style={{ justifyContent: "center", padding: ".95rem", fontSize: "1.02rem", marginTop: 4 }} type="button">Masuk →</button>
          </form>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} /><span className="muted" style={{ fontSize: ".8rem" }}>atau</span><span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>
          <Link href="/onboarding" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", padding: ".85rem" }}>Mulai gratis dengan onboarding</Link>
          <p className="muted" style={{ fontSize: ".86rem", marginTop: 18, textAlign: "center" }}>
            Belum punya akun? <Link href="/signup" className="gold" style={{ textDecoration: "none" }}>Daftar gratis</Link>
          </p>
        </div>
      </div>

      <style>{`
        .lg-lab{ font-size:.82rem; font-weight:600; color:var(--ink-2); letter-spacing:.01em; }
        .lg-input{ width:100%; background:var(--surface-2); border:1.5px solid var(--line-2); border-radius:11px; color:var(--ink); padding:.8rem 1rem; font:inherit; font-size:1rem; outline:none; transition:border-color .2s; }
        .lg-input::placeholder{ color:color-mix(in oklab, var(--muted) 60%, transparent); }
        .lg-input:focus{ border-color:var(--brand); }
      `}</style>
    </div>
  );
}
