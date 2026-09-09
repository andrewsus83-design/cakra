import React from "react";

// Background decoration layer — a fixed, deterministic scatter of subtle motifs.
// Density is controlled by an ancestor's `data-decor` attribute (none | low | high) via CSS
// in globals.css, so the same markup serves the builder preview and the live site.
const MOTIFS: Record<string, React.ReactNode> = {
  plane: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  pen: <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3zM14 7l3 3" />,
  pin: <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />,
  house: <path d="M3 11 12 4l9 7M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />,
  key: <path d="M14 8a4 4 0 1 1-3.4 6.1L4 20.7 3.3 20l6.6-6.6A4 4 0 0 1 14 8Z" />,
  star: <path d="M12 4l1.8 4.6L18 10l-4.2 1.4L12 16l-1.8-4.6L6 10l4.2-1.4z" />,
  dots: <g><circle cx="6" cy="6" r="1.4" /><circle cx="12" cy="6" r="1.4" /><circle cx="18" cy="6" r="1.4" /><circle cx="6" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /></g>,
  ring: <circle cx="12" cy="12" r="8" />,
  leaf: <path d="M5 19c8 0 14-5 14-14C9 5 5 11 5 19zM5 19 15 9" />,
};
type Item = { x: number; y: number; r: number; s: number; m: string };
const ITEMS: Item[] = [
  { x: 8, y: 20, r: -18, s: 34, m: "plane" }, { x: 78, y: 14, r: 12, s: 26, m: "dots" }, { x: 40, y: 72, r: 8, s: 22, m: "ring" },
  { x: 90, y: 60, r: -10, s: 30, m: "pen" }, { x: 18, y: 64, r: 20, s: 24, m: "star" }, { x: 60, y: 26, r: -6, s: 22, m: "pin" },
  { x: 30, y: 34, r: 14, s: 20, m: "leaf" }, { x: 70, y: 80, r: -14, s: 28, m: "house" }, { x: 52, y: 50, r: 6, s: 20, m: "dots" },
  { x: 12, y: 46, r: -8, s: 22, m: "ring" }, { x: 84, y: 40, r: 16, s: 24, m: "key" }, { x: 46, y: 12, r: -12, s: 26, m: "plane" },
  { x: 64, y: 60, r: 10, s: 18, m: "star" }, { x: 24, y: 84, r: -16, s: 22, m: "pen" }, { x: 94, y: 84, r: 8, s: 20, m: "dots" },
  { x: 36, y: 92, r: 12, s: 20, m: "pin" }, { x: 6, y: 82, r: -6, s: 24, m: "leaf" }, { x: 80, y: 28, r: 18, s: 18, m: "ring" },
];
export function Decor({ color = "#fff" }: { color?: string }) {
  return (
    <div className="k-decor" aria-hidden="true" style={{ color }}>
      {ITEMS.map((it, i) => (
        <span key={i} className="k-decor-item" style={{ left: `${it.x}%`, top: `${it.y}%`, width: it.s, height: it.s, transform: `translate(-50%,-50%) rotate(${it.r}deg)` }}>
          <svg viewBox="0 0 24 24" width={it.s} height={it.s} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{MOTIFS[it.m]}</svg>
        </span>
      ))}
    </div>
  );
}
