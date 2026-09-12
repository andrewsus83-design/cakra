"use client";
import { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode, useEffect, useState } from "react";
import { CakraMark } from "@/components/CakraMark";

// cakra design-system components — one source of truth for forms & auth surfaces across the site.
// Built on the tokens/classes in globals.css (.card, .btn*, .field-*, .display, .hand, .muted, .gold).

/** The signature handwritten brand accent that sits above a heading. */
export function Accent({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p className="hand" style={{ color: "var(--brand)", fontSize: "1.7rem", transform: "rotate(-2deg)", margin: 0, ...style }}>{children}</p>;
}

/** Serif display heading. */
export function Title({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <h1 className="display" style={{ fontSize: "clamp(1.75rem,4vw,2.3rem)", fontWeight: 700, lineHeight: 1.1, margin: "4px 0 6px", ...style }}>{children}</h1>;
}

/** Muted supporting copy under a heading. */
export function Sub({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p className="muted" style={{ fontSize: ".95rem", margin: "0 0 22px", ...style }}>{children}</p>;
}

/** Surface card. */
export function Card({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return <div className={`card${className ? " " + className : ""}`} style={style}>{children}</div>;
}

const BTN_CLASS: Record<string, string> = { brand: "btn-brand", ghost: "btn-ghost", primary: "btn-primary", onPhoto: "btn-on-photo" };
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "brand" | "ghost" | "primary" | "onPhoto"; block?: boolean; loading?: boolean };
/** Button with the design-system variants + a loading/disabled state. */
export function Button({ variant = "brand", block, loading, disabled, children, style, className, ...rest }: ButtonProps) {
  const off = disabled || loading;
  return (
    <button {...rest} disabled={off} className={`btn ${BTN_CLASS[variant] || "btn-brand"}${className ? " " + className : ""}`}
      style={{ justifyContent: "center", padding: ".9rem 1.4rem", ...(block ? { width: "100%" } : {}), opacity: off ? .6 : 1, cursor: off ? "not-allowed" : "pointer", ...style }}>
      {children}
    </button>
  );
}

/** Labeled field wrapper: label (+ optional trailing hint slot) → control → error text. */
export function Field({ label, hint, error, children }: { label?: string; hint?: ReactNode; error?: string | null; children: ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      {(label || hint) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          {label ? <span className="field-label">{label}</span> : <span />}
          {hint}
        </div>
      )}
      {children}
      {error && <span style={{ fontSize: ".78rem", color: "var(--crit)" }}>{error}</span>}
    </label>
  );
}

/** Text input styled by the design system. */
export function Input({ className, invalid, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input {...props} aria-invalid={invalid || undefined} className={`field-input${className ? " " + className : ""}`} />;
}

/** Textarea styled by the design system. */
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`field-input${className ? " " + className : ""}`} />;
}

/** One-time-code input (numeric, spaced) for OTP / 2FA. */
export function CodeInput({ value, onChange, length = 6, autoFocus }: { value: string; onChange: (v: string) => void; length?: number; autoFocus?: boolean }) {
  return (
    <input className="field-input field-code" inputMode="numeric" autoComplete="one-time-code" maxLength={length} required autoFocus={autoFocus}
      value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))} placeholder={"•".repeat(length)} />
  );
}

/** Inline status banner. */
export function Banner({ tone, children }: { tone: "error" | "success" | "info"; children: ReactNode }) {
  const c = tone === "error" ? "crit" : tone === "success" ? "good" : "brand";
  return (
    <div role={tone === "error" ? "alert" : undefined} style={{ fontSize: ".82rem", color: `var(--${c})`, background: `color-mix(in oklab, var(--${c}) 10%, var(--surface))`, border: `1px solid color-mix(in oklab, var(--${c}) 30%, var(--line))`, borderRadius: 10, padding: "8px 12px" }}>
      {children}
    </div>
  );
}

/** A "or" divider with centered label. */
export function Divider({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
      {label && <span className="muted" style={{ fontSize: ".8rem" }}>{label}</span>}
      <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
    </div>
  );
}

function SunIcon() { return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4 11a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2h2Zm18 0a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2ZM5.6 4.2 7 5.6A1 1 0 0 1 5.6 7L4.2 5.6a1 1 0 0 1 1.4-1.4Zm12.8 12.8 1.4 1.4a1 1 0 0 1-1.4 1.4L17 18.4a1 1 0 0 1 1.4-1.4ZM7 18.4 5.6 19.8a1 1 0 0 1-1.4-1.4L5.6 17A1 1 0 0 1 7 18.4ZM19.8 4.2a1 1 0 0 1 0 1.4L18.4 7A1 1 0 0 1 17 5.6l1.4-1.4a1 1 0 0 1 1.4 0Z" /></svg>; }
function MoonIcon() { return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>; }

/**
 * Full-screen auth surface: hero-photo background + scrim, cakra wordmark, light/dark toggle,
 * and a centered card holding `children`. Reused by every sign-in / sign-up / verification screen.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    let t: "light" | "dark" = "light";
    try { const s = localStorage.getItem("cakra-theme"); t = s === "dark" || s === "light" ? s : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; } catch {}
    setTheme(t); document.documentElement.setAttribute("data-theme", t);
  }, []);
  const toggle = () => { const n = theme === "dark" ? "light" : "dark"; setTheme(n); document.documentElement.setAttribute("data-theme", n); try { localStorage.setItem("cakra-theme", n); } catch {} };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, overflow: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-top.webp" alt="Vila properti mewah saat golden hour" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div className="photo-scrim" />
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", flex: "none" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <CakraMark size={38} /><span className="hand on-photo" style={{ fontSize: "2.2rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>
        </span>
        <button type="button" onClick={toggle} aria-label="Ganti tema terang / gelap" className="btn btn-on-photo" style={{ width: 40, height: 40, padding: 0, display: "grid", placeItems: "center", borderRadius: 10 }}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
      <div style={{ position: "relative", flex: 1, display: "grid", placeItems: "center", padding: "10px 24px 60px" }}>
        <Card style={{ padding: "clamp(26px,4vw,40px)", width: "min(440px, 94vw)", boxShadow: "0 30px 80px rgba(20,15,9,.28)" }}>{children}</Card>
      </div>
    </div>
  );
}
