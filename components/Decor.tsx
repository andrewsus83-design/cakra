import React from "react";

// Background decoration layer — a deterministic jittered grid of motifs pulled from
// per-tone icon sprites (generated art in /public/decor/<tone>.webp, a 4×4 grid of 16 icons).
// Coverage comes from an ancestor's `data-decor` (none | low | high) via globals.css:
//   high → every motif shown (~45% of the screen filled) · low → every other one (~25%).
// The sprite (and thus the whole icon style) is chosen by `set` — normal/professional/lux/relax.
// Sizes are in vmin so the motifs scale with the screen (the user targets a % of screen area).
export const DECOR_TONES = ["normal", "professional", "lux", "relax"];
type Item = { x: number; y: number; r: number; s: number; c: number };

// Deterministic jittered grid: a fixed seed makes SSR and client render the SAME array
// (no Math.random → no hydration mismatch). Grid guarantees an even spread; jitter kills the
// grid look. Sized generously (13–23vmin) and many cells so a screenful actually reads as filled.
const COLS = 7;
const ROWS = 10; // the page is several viewports tall — enough rows to keep every screen populated
function buildItems(): Item[] {
  let seed = 20260910;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const cw = 100 / COLS, ch = 100 / ROWS;
  const items: Item[] = [];
  for (let gy = 0; gy < ROWS; gy++) {
    for (let gx = 0; gx < COLS; gx++) {
      items.push({
        x: Math.round((cw * (gx + 0.5) + (rnd() - 0.5) * cw * 0.8) * 10) / 10,
        y: Math.round((ch * (gy + 0.5) + (rnd() - 0.5) * ch * 0.8) * 10) / 10,
        r: Math.round(-16 + rnd() * 32),
        s: Math.round((8 + rnd() * 7) * 10) / 10, // 8–15 vmin
        c: Math.floor(rnd() * 16),
      });
    }
  }
  return items;
}
const ITEMS: Item[] = buildItems();

export function Decor({ set = "normal" }: { set?: string }) {
  const src = DECOR_TONES.includes(set) ? set : "normal";
  return (
    <div className="k-decor" aria-hidden="true" data-decor-set={src}>
      {ITEMS.map((it, i) => (
        <span key={i} className="k-decor-item" style={{
          left: `${it.x}%`, top: `${it.y}%`, width: `${it.s}vmin`, height: `${it.s}vmin`,
          transform: `translate(-50%,-50%) rotate(${it.r}deg)`,
          backgroundImage: `url(/decor/${src}.webp)`, backgroundSize: "400% 400%", backgroundRepeat: "no-repeat",
          backgroundPosition: `${(it.c % 4) * 33.3333}% ${Math.floor(it.c / 4) * 33.3333}%`,
        }} />
      ))}
    </div>
  );
}
