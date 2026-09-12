// Client-side slide renderer for Draft-by-Cakra carousel & video-storyboard output. Draws each slide
// onto a canvas over a branded gradient (NO external images → the PNG always exports, never tainted)
// and returns data URLs. Carousel = 1:1 (1080²), video storyboard = 9:16 (1080×1920).
export type Slide = { kind?: string; headline?: string; sub?: string; caption?: string; vo?: string };

const ACCENT = "#C79A3E";
const INK = "#F6EEDD";

function wrapLines(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = String(text || "").split(/\s+/).filter(Boolean); const lines: string[] = []; let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
function drawWrapped(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number, align: CanvasTextAlign = "left"): number {
  ctx.textAlign = align;
  for (const ln of wrapLines(ctx, text, max)) { ctx.fillText(ln, x, y); y += lh; }
  return y;
}

// Renders one slide and returns its PNG data URL.
function renderOne(W: number, H: number, s: Slide, idx: number, total: number, o: { brand: string; contact: string; kind: "carousel" | "video" }): string {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d"); if (!ctx) return "";
  const pad = Math.round(W * 0.09);
  const kind = s.kind || (idx === 0 ? "cover" : idx === total - 1 ? "cta" : "point");

  // Branded gradient ground + soft accent glow.
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#1b1409"); g.addColorStop(1, "#2c2113");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(W * 0.5, H * 0.22, 0, W * 0.5, H * 0.22, W * 0.75);
  rg.addColorStop(0, "rgba(199,154,62,.20)"); rg.addColorStop(1, "rgba(199,154,62,0)"); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

  // Header: brand eyebrow (left) + slide counter (right).
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = ACCENT; ctx.font = `700 ${Math.round(W * 0.03)}px Hanken Grotesk, system-ui, sans-serif`; ctx.textAlign = "left";
  ctx.fillText(o.brand.toUpperCase(), pad, pad + Math.round(W * 0.02));
  ctx.fillStyle = "rgba(246,238,221,.5)"; ctx.font = `700 ${Math.round(W * 0.026)}px Hanken Grotesk, system-ui, sans-serif`; ctx.textAlign = "right";
  ctx.fillText(`${idx + 1} / ${total}`, W - pad, pad + Math.round(W * 0.02));

  const headline = s.headline || s.caption || "";
  const sub = s.sub || s.vo || "";

  if (kind === "cover") {
    // Big centered hook.
    ctx.fillStyle = INK; const hf = Math.round(W * 0.085); ctx.font = `700 ${hf}px Newsreader, Georgia, serif`;
    const lines = wrapLines(ctx, headline, W - pad * 2);
    let y = H / 2 - (lines.length * hf * 1.08) / 2;
    ctx.textAlign = "left"; for (const ln of lines) { ctx.fillText(ln, pad, y); y += hf * 1.08; }
    if (sub) { ctx.fillStyle = "rgba(246,238,221,.72)"; ctx.font = `500 ${Math.round(W * 0.036)}px Hanken Grotesk, system-ui, sans-serif`; drawWrapped(ctx, sub, pad, y + Math.round(W * 0.03), W - pad * 2, Math.round(W * 0.05)); }
    // swipe hint
    ctx.fillStyle = ACCENT; ctx.font = `700 ${Math.round(W * 0.03)}px Hanken Grotesk, system-ui, sans-serif`; ctx.textAlign = "right";
    ctx.fillText(o.kind === "video" ? "▶ tonton" : "geser →", W - pad, H - pad);
  } else if (kind === "cta") {
    ctx.fillStyle = INK; const hf = Math.round(W * 0.066); ctx.font = `700 ${hf}px Newsreader, Georgia, serif`;
    let y = H / 2 - hf; ctx.textAlign = "left"; y = drawWrapped(ctx, headline || "Tertarik? Hubungi kami.", pad, y, W - pad * 2, hf * 1.1);
    if (sub) { ctx.fillStyle = "rgba(246,238,221,.75)"; ctx.font = `500 ${Math.round(W * 0.038)}px Hanken Grotesk, system-ui, sans-serif`; y = drawWrapped(ctx, sub, pad, y + Math.round(W * 0.02), W - pad * 2, Math.round(W * 0.055)); }
    if (o.contact) {
      const bh = Math.round(W * 0.12), by = H - pad - bh, bw = W - pad * 2, r = bh / 2;
      ctx.fillStyle = ACCENT; ctx.beginPath();
      ctx.moveTo(pad + r, by); ctx.arcTo(pad + bw, by, pad + bw, by + bh, r); ctx.arcTo(pad + bw, by + bh, pad, by + bh, r); ctx.arcTo(pad, by + bh, pad, by, r); ctx.arcTo(pad, by, pad + bw, by, r); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#1b1409"; ctx.font = `700 ${Math.round(W * 0.04)}px Hanken Grotesk, system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(`WhatsApp  ${o.contact}`, W / 2, by + bh / 2); ctx.textBaseline = "alphabetic";
    }
  } else {
    // Point slide: big index numeral + headline + supporting sentence.
    ctx.fillStyle = "rgba(199,154,62,.9)"; ctx.font = `700 ${Math.round(W * 0.16)}px Newsreader, Georgia, serif`; ctx.textAlign = "left";
    ctx.fillText(String(idx), pad, pad + Math.round(W * 0.2));
    let y = H * 0.42;
    ctx.fillStyle = INK; const hf = Math.round(W * 0.058); ctx.font = `700 ${hf}px Newsreader, Georgia, serif`;
    y = drawWrapped(ctx, headline, pad, y, W - pad * 2, hf * 1.1);
    if (sub) { ctx.fillStyle = "rgba(246,238,221,.72)"; ctx.font = `500 ${Math.round(W * 0.037)}px Hanken Grotesk, system-ui, sans-serif`; drawWrapped(ctx, sub, pad, y + Math.round(W * 0.03), W - pad * 2, Math.round(W * 0.052)); }
    if (o.kind === "video" && s.vo) { ctx.fillStyle = "rgba(246,238,221,.45)"; ctx.font = `600 ${Math.round(W * 0.026)}px Hanken Grotesk, system-ui, sans-serif`; ctx.textAlign = "left"; ctx.fillText("🎙 " + (s.vo.length > 60 ? "voiceover" : "voiceover"), pad, H - pad); }
  }

  // Footer mark.
  ctx.fillStyle = "rgba(246,238,221,.4)"; ctx.font = `700 ${Math.round(W * 0.026)}px Caveat, cursive`; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  if (kind !== "cover" && !(kind === "cta" && o.contact)) ctx.fillText("dibuat dengan cakra", pad, H - pad);
  return c.toDataURL("image/png");
}

export function renderSlides(slides: Slide[], o: { brand: string; contact: string; kind: "carousel" | "video" }): string[] {
  const [W, H] = o.kind === "video" ? [1080, 1920] : [1080, 1080];
  const list = (slides || []).slice(0, 12);
  return list.map((s, i) => renderOne(W, H, s, i, list.length, o)).filter(Boolean);
}
