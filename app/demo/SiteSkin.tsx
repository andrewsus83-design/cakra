"use client";
import { useEffect } from "react";

// Applies a published Web-Builder look (carried in the URL hash `#site=`) to this live site.
// Deterministic: only overrides design tokens + links — never regenerates content. Cross-origin safe
// (the dashboard lives on a different subdomain), and a no-op when no config is present.
// When the Supabase backend is live this is replaced by a server-rendered profile lookup.
export function SiteSkin() {
  useEffect(() => {
    let cfg: any;
    try {
      const m = window.location.hash.match(/site=([^&]+)/);
      if (!m) return;
      cfg = JSON.parse(decodeURIComponent(atob(m[1])));
    } catch {
      return;
    }
    const root = document.getElementById("top");
    if (!root || !cfg) return;
    const set = (k: string, v?: string) => v && root.style.setProperty(k, v);
    try {
      const c = cfg.col || {};
      set("--k-emerald", c.em);
      if (c.em) set("--k-emerald-2", `color-mix(in oklab, ${c.em} 78%, #000)`);
      set("--k-gold", c.go);
      if (c.go) set("--k-gold-2", `color-mix(in oklab, ${c.go} 80%, #000)`);
      set("--k-bg", c.bg);
      set("--k-ink", c.ink);
      if (c.ink) set("--k-ink-2", `color-mix(in oklab, ${c.ink} 82%, #fff)`);

      if (cfg.r) {
        set("--k-r", `${cfg.r.r}px`);
        set("--k-r-sm", cfg.r.s >= 999 ? "999px" : `${cfg.r.s}px`);
      }

      // background mode (dual = template default, left untouched)
      if (cfg.bg === "gradient" && c.bg) {
        root.style.background = `linear-gradient(165deg, ${c.bg}, color-mix(in oklab, ${c.go || c.bg} 14%, ${c.bg}))`;
      } else if (cfg.bg === "mono" && c.bg) {
        root.style.background = c.bg;
        set("--k-surface", c.bg);
      }

      // background decoration density → data-decor on the hero
      if (cfg.dec && cfg.dec !== "none") {
        root.querySelector(".k-hero")?.setAttribute("data-decor", String(cfg.dec));
      }

      if (cfg.font) {
        if (!document.getElementById("cakra-skin-fonts")) {
          const l = document.createElement("link");
          l.id = "cakra-skin-fonts"; l.rel = "stylesheet";
          l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap";
          document.head.appendChild(l);
        }
        set("--k-font-display", cfg.font.d);
        set("--k-font-body", cfg.font.b);
      }

      // brand identity
      if (cfg.brand) {
        root.querySelectorAll(".k-word").forEach((el) => (el.textContent = cfg.brand));
      }
      if (cfg.ini) {
        root.querySelectorAll(".k-mark").forEach((el) => (el.textContent = cfg.ini));
      }

      // links: WhatsApp + socials
      const s = cfg.soc || {};
      if (s.wa) {
        const wa = `https://wa.me/${String(s.wa).replace(/[^\d]/g, "")}`;
        root.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"], a.k-fab').forEach((a) => (a.href = wa));
      }
      const socMap: Record<string, string> = {
        instagram: s.ig && `https://instagram.com/${String(s.ig).replace(/^@/, "")}`,
        tiktok: s.tt && `https://tiktok.com/@${String(s.tt).replace(/^@/, "")}`,
        youtube: s.yt && `https://youtube.com/@${String(s.yt).replace(/\s+/g, "")}`,
        facebook: s.fb && `https://facebook.com/${String(s.fb).replace(/\s+/g, "")}`,
      };
      root.querySelectorAll<HTMLAnchorElement>("a.k-social").forEach((a) => {
        const label = (a.getAttribute("aria-label") || "").toLowerCase();
        const href = socMap[label];
        if (href) a.href = href;
      });
    } catch {
      /* skinning is best-effort — never break the live page */
    }
  }, []);
  return null;
}
