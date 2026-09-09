import React from "react";

// Background decoration layer — a fixed, deterministic scatter of motifs pulled from
// per-tone icon sprites (generated art in /public/decor/<tone>.webp, a 4×4 grid of 16 icons).
// Density comes from an ancestor's `data-decor` attribute (none | low | high) via globals.css;
// the sprite (and thus the whole icon style) is chosen by `set` — normal/professional/lux/relax.
export const DECOR_TONES = ["normal", "professional", "lux", "relax"];
type Item = { x: number; y: number; r: number; s: number; c: number };
const ITEMS: Item[] = [
  { x: 8, y: 20, r: -14, s: 40, c: 0 }, { x: 78, y: 14, r: 10, s: 30, c: 3 }, { x: 40, y: 72, r: 6, s: 26, c: 6 },
  { x: 90, y: 60, r: -8, s: 34, c: 9 }, { x: 18, y: 64, r: 14, s: 28, c: 12 }, { x: 60, y: 26, r: -5, s: 26, c: 5 },
  { x: 30, y: 34, r: 10, s: 24, c: 14 }, { x: 70, y: 80, r: -12, s: 32, c: 7 }, { x: 52, y: 50, r: 5, s: 24, c: 10 },
  { x: 12, y: 46, r: -6, s: 26, c: 1 }, { x: 84, y: 40, r: 12, s: 28, c: 11 }, { x: 46, y: 12, r: -10, s: 30, c: 2 },
  { x: 64, y: 60, r: 8, s: 22, c: 13 }, { x: 24, y: 84, r: -12, s: 26, c: 4 }, { x: 94, y: 84, r: 6, s: 24, c: 15 },
  { x: 36, y: 92, r: 10, s: 24, c: 8 }, { x: 6, y: 82, r: -5, s: 28, c: 6 }, { x: 80, y: 28, r: 14, s: 22, c: 3 },
];
export function Decor({ set = "normal" }: { set?: string }) {
  const src = DECOR_TONES.includes(set) ? set : "normal";
  return (
    <div className="k-decor" aria-hidden="true" data-decor-set={src}>
      {ITEMS.map((it, i) => (
        <span key={i} className="k-decor-item" style={{
          left: `${it.x}%`, top: `${it.y}%`, width: it.s, height: it.s,
          transform: `translate(-50%,-50%) rotate(${it.r}deg)`,
          backgroundImage: `url(/decor/${src}.webp)`, backgroundSize: "400% 400%", backgroundRepeat: "no-repeat",
          backgroundPosition: `${(it.c % 4) * 33.3333}% ${Math.floor(it.c / 4) * 33.3333}%`,
        }} />
      ))}
    </div>
  );
}
