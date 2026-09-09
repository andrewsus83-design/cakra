import React from "react";

// Background decoration layer — a fixed, deterministic scatter of subtle motifs.
// Density is controlled by an ancestor's `data-decor` attribute (none | low | high) via CSS
// in globals.css; the MOTIF SET is chosen by the `set` prop (the site's language tone), so
// each style — normal / professional / lux / relax — gets its own distinct iconography.
// Motifs are single stroke paths so the live-site skin can swap them without re-rendering.
export const DECOR_SETS: Record<string, string[]> = {
  // friendly, approachable
  normal: [
    "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z",            // paper plane
    "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z",             // ring
    "M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", // pin
    "M3 11 12 4l9 7M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9",  // house
    "M14 8a4 4 0 1 1-3.4 6.1L4 20.7 3.3 20l6.6-6.6A4 4 0 0 1 14 8Z",  // key
    "M12 4l1.8 4.6L18 10l-4.2 1.4L12 16l-1.8-4.6L6 10l4.2-1.4z",  // star
    "M5 19c8 0 14-5 14-14C9 5 5 11 5 19zM5 19 15 9",    // leaf
    "M12 21 4 13a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3z",  // heart
  ],
  // sharp, corporate, geometric
  professional: [
    "M4 4h16v16H4z",                                     // square
    "M5 20V10M12 20V4M19 20v-8",                         // bar chart
    "M4 4v16h16M4 15l4-5 4 3 6-8",                       // line graph
    "M4 8h16v11H4zM9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",  // briefcase
    "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",  // grid
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",  // target
    "M5 21V4h9v17M14 21V9h5v12M3 21h18",                 // building
    "M12 20V5M6 11l6-6 6 6",                             // arrow up
  ],
  // ornate, elegant, premium
  lux: [
    "M6 3h12l3 5-9 13L3 8z",                             // diamond
    "M4 8l3 8h10l3-8-5 4-3-6-3 6z",                      // crown
    "M12 3v18M8 6c-3 2-3 6 0 8M16 6c3 2 3 6 0 8",        // laurel
    "M14 8a4 4 0 1 1-3.4 6.1L4 20.7 3.3 20l6.6-6.6A4 4 0 0 1 14 8Z",  // ornate key
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 4h6l2 4H7z",   // gem ring
    "M4 12c4-6 8 6 16 0",                                // flourish
    "M12 3l2.4 6.4L21 11l-6.6 2L12 20l-2.4-7L3 11l6.6-1.6z",  // star
    "M5 6h14M5 18h14M8 6v12M12 6v12M16 6v12",            // columns
  ],
  // organic, tropical, playful
  relax: [
    "M2 12c3-4 5 4 8 0s5-4 8 0",                         // wave
    "M12 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M4 12H2M22 12h-2M6 6 4.5 4.5M19.5 19.5 18 18M6 18l-1.5 1.5M19.5 4.5 18 6",  // sun
    "M12 21V9M12 9c-3-3-7-2-8 0 3-1 5 0 8 0M12 9c3-3 7-2 8 0-3-1-5 0-8 0",  // palm
    "M12 21C7 21 3 16 3 11a9 9 0 0 1 18 0c0 5-4 10-9 10ZM8 20l1-13M16 20l-1-13",  // shell
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM12 3a3 3 0 0 1 0 6M12 15a3 3 0 0 1 0 6M3 12a3 3 0 0 1 6 0M15 12a3 3 0 0 1 6 0",  // flower
    "M6 16a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1A3.5 3.5 0 0 1 18 16z",  // cloud
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8 14a4 4 0 0 0 8 0M9 9h.01M15 9h.01",  // smile
    "M12 3v14M12 3 5 17h7M12 6l6 11h-6",                 // sail
  ],
};
type Item = { x: number; y: number; r: number; s: number };
const ITEMS: Item[] = [
  { x: 8, y: 20, r: -18, s: 34 }, { x: 78, y: 14, r: 12, s: 26 }, { x: 40, y: 72, r: 8, s: 22 },
  { x: 90, y: 60, r: -10, s: 30 }, { x: 18, y: 64, r: 20, s: 24 }, { x: 60, y: 26, r: -6, s: 22 },
  { x: 30, y: 34, r: 14, s: 20 }, { x: 70, y: 80, r: -14, s: 28 }, { x: 52, y: 50, r: 6, s: 20 },
  { x: 12, y: 46, r: -8, s: 22 }, { x: 84, y: 40, r: 16, s: 24 }, { x: 46, y: 12, r: -12, s: 26 },
  { x: 64, y: 60, r: 10, s: 18 }, { x: 24, y: 84, r: -16, s: 22 }, { x: 94, y: 84, r: 8, s: 20 },
  { x: 36, y: 92, r: 12, s: 20 }, { x: 6, y: 82, r: -6, s: 24 }, { x: 80, y: 28, r: 18, s: 18 },
];
export function Decor({ color = "#fff", set = "normal" }: { color?: string; set?: string }) {
  const paths = DECOR_SETS[set] || DECOR_SETS.normal;
  return (
    <div className="k-decor" aria-hidden="true" data-decor-set={set} style={{ color }}>
      {ITEMS.map((it, i) => (
        <span key={i} className="k-decor-item" style={{ left: `${it.x}%`, top: `${it.y}%`, width: it.s, height: it.s, transform: `translate(-50%,-50%) rotate(${it.r}deg)` }}>
          <svg viewBox="0 0 24 24" width={it.s} height={it.s} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={paths[i % paths.length]} /></svg>
        </span>
      ))}
    </div>
  );
}
