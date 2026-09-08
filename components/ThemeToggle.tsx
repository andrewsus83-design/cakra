"use client";
import { useEffect, useState } from "react";

export function ThemeToggle({ size = 38 }: { size?: number }) {
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
  const toggle = () => {
    const n = theme === "dark" ? "light" : "dark";
    setTheme(n);
    document.documentElement.setAttribute("data-theme", n);
    try { localStorage.setItem("cakra-theme", n); } catch {}
  };
  return (
    <button type="button" onClick={toggle} aria-label="Ganti tema terang / gelap" title="Terang / gelap" style={{ display: "grid", placeItems: "center", width: size, height: size, borderRadius: 10, border: "1px solid var(--line-2)", background: "transparent", color: "var(--ink)", cursor: "pointer", flex: "none" }}>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4 11a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2h2Zm18 0a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2ZM5.6 4.2 7 5.6A1 1 0 0 1 5.6 7L4.2 5.6a1 1 0 0 1 1.4-1.4Zm12.8 12.8 1.4 1.4a1 1 0 0 1-1.4 1.4L17 18.4a1 1 0 0 1 1.4-1.4ZM7 18.4 5.6 19.8a1 1 0 0 1-1.4-1.4L5.6 17A1 1 0 0 1 7 18.4ZM19.8 4.2a1 1 0 0 1 0 1.4L18.4 7A1 1 0 0 1 17 5.6l1.4-1.4a1 1 0 0 1 1.4 0Z" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      )}
    </button>
  );
}
