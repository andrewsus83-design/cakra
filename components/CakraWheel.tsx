"use client";
import { useEffect, useRef } from "react";

const CENTRES = [
  { k: "Website", v: 82, c: "--c-crown" },
  { k: "Listing", v: 76, c: "--c-eye" },
  { k: "Konten", v: 68, c: "--c-throat" },
  { k: "SEO", v: 71, c: "--c-heart" },
  { k: "GEO", v: 64, c: "--c-solar" },
  { k: "Social", v: 59, c: "--c-sacral" },
  { k: "Reputasi", v: 73, c: "--c-root" },
];

export function CakraWheel({ score = 70 }: { score?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const SIZE = 420;
    cv.width = SIZE * dpr;
    cv.height = SIZE * dpr;
    ctx.scale(dpr, dpr);
    const R = SIZE / 2;
    const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const N = CENTRES.length;
    const gap = 0.05;
    const seg = (Math.PI * 2) / N;
    const rIn = R * 0.32;
    const rOut = R * 0.9;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = 0;
    let raf = 0;

    function ring(a0: number, a1: number, r0: number, r1: number, color: string) {
      ctx.beginPath();
      ctx.arc(R, R, r1, a0, a1);
      ctx.arc(R, R, r0, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const line = css("--line");
      for (let i = 0; i < N; i++) {
        const a0 = -Math.PI / 2 + i * seg + gap;
        const a1 = -Math.PI / 2 + (i + 1) * seg - gap;
        ring(a0, a1, rIn, rOut, line);
        const col = css(CENTRES[i].c);
        const breathe = reduce ? 0 : Math.sin(t / 40 + i) * R * 0.006;
        ring(a0, a1, rIn, rIn + (rOut - rIn) * (CENTRES[i].v / 100) + breathe, col);
      }
      ctx.beginPath();
      ctx.arc(R, R, rIn * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = css("--surface");
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = css("--brand");
      ctx.stroke();
      if (!reduce) {
        t++;
        raf = requestAnimationFrame(draw);
      }
    }
    draw();
    const obs = new MutationObserver(() => reduce && draw());
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "min(420px, 84vw)", aspectRatio: "1" }}>
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", textAlign: "center", pointerEvents: "none" }}>
        <div className="mono" style={{ fontSize: "2.9rem", fontWeight: 600, lineHeight: 1 }}>{score}</div>
        <div className="eyebrow" style={{ marginTop: 6 }}>Presence Index</div>
      </div>
    </div>
  );
}
