"use client";
import { useEffect, useState } from "react";
import { DECOR_TONES } from "@/components/Decor";
import { publicAgentSite, publicListings, toWaE164 } from "@/lib/supabase";

// Applies a published Web-Builder look (carried in the URL hash `#site=`) to this live site.
// Deterministic: only overrides design tokens + links — never regenerates content. Cross-origin safe
// (the dashboard lives on a different subdomain), and a no-op when no config is present.
// When the Supabase backend is live this is replaced by a server-rendered profile lookup.

// Builds a stroked SVG icon node (namespaced) for DOM-injected list items — no innerHTML.
function svgIcon(pathD: string): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "20"); svg.setAttribute("height", "20");
  svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8"); svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
  const p = document.createElementNS(ns, "path"); p.setAttribute("d", pathD); svg.appendChild(p);
  return svg;
}

// Rough Rupiah parser for indicative price labels ("Mulai Rp 1,1 M", "Rp 850 jt") → integer IDR.
// Best-effort only — returns null when nothing parseable, so an Offer is simply omitted.
function parseRp(label?: string): number | null {
  if (!label) return null;
  const s = String(label).toLowerCase();
  const m = s.match(/[\d][\d.,]*/);
  if (!m) return null;
  const n = parseFloat(m[0].replace(/\./g, "").replace(",", "."));
  if (!isFinite(n)) return null;
  if (/miliar|milyar|\bm\b/.test(s)) return Math.round(n * 1e9);
  if (/triliun|\bt\b/.test(s)) return Math.round(n * 1e12);
  if (/juta|\bjt\b/.test(s)) return Math.round(n * 1e6);
  return Math.round(n);
}

// Personalizes HEAD (SEO/OG/Twitter/hreflang), JSON-LD, and body sections for a resolved real
// agent. Everything is additive + XSS-safe (textContent / controlled DOM, never innerHTML with
// server strings) and each step is independently guarded so a missing field never breaks the page.
function personalizeAgent(d: any, root: HTMLElement, sub: string | null): void {
  const adv = d.advertorial || {};
  const Aid = adv.id || {};
  const EN = adv.en;
  const SEO = adv.seo || {};
  const GEO = adv.geo || {};
  const LEAD = adv.lead || {};
  const loc = d.location;
  const specs = Array.isArray(d.specializations) && d.specializations.length ? d.specializations.join(" & ") : "";
  const city = d.city || "";
  const brand = d.brand || d.name || "";
  const areas = Array.isArray(d.areas) ? d.areas.filter(Boolean).join(" · ") : "";
  const first = String(d.name || d.brand || "").trim().split(/\s+/)[0] || "kami";
  const subdomain = d.subdomain || sub || "";
  const canonical = subdomain ? `https://${subdomain}.cakra.xyz/` : "";

  // Social profile URLs — built once, reused as JSON-LD sameAs.
  const s = d.socials || {};
  const wa = toWaE164(s.wa);
  const socialUrls: string[] = [];
  if (s.ig) socialUrls.push(`https://instagram.com/${String(s.ig).replace(/^@/, "")}`);
  if (s.tt) socialUrls.push(`https://tiktok.com/@${String(s.tt).replace(/^@/, "")}`);
  if (s.fb) socialUrls.push(`https://facebook.com/${String(s.fb).replace(/\s+/g, "")}`);
  if (s.yt) socialUrls.push(`https://youtube.com/@${String(s.yt).replace(/\s+/g, "")}`);

  // ── HEAD / body write helpers (create-or-update in place so there are no duplicate tags) ──
  const setName = (name: string, content?: string) => {
    if (!content) return;
    let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
  };
  const setProp = (property: string, content?: string) => {
    if (!content) return;
    let el = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
    el.setAttribute("content", content);
  };
  const setAlt = (id: string, hreflang: string, href: string) => {
    let el = document.getElementById(id) as HTMLLinkElement | null;
    if (!el) { const n = document.createElement("link"); n.id = id; document.head.appendChild(n); el = n; }
    const link: HTMLLinkElement = el;
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", hreflang);
    link.setAttribute("href", href);
  };
  const setSite = (k: string, v?: string) => {
    if (!v) return;
    root.querySelectorAll(`[data-site="${k}"]`).forEach((el) => (el.textContent = v));
  };

  // ── Language-dependent VISIBLE-TEXT fills ── one function re-runs EVERY text fill for the chosen
  // language (adv[lang], falling back to id): hero markers, section markers, the rebuilt lists, the
  // foreign-buyer body, and the language-specific <title>/description/OG+Twitter title+desc. Called
  // with "id" on load and again by the EN/ID toggle (window.__cakraApplyLang). Best-effort throughout.
  const applyLang = (lang: "id" | "en") => {
    try {
      const A = (adv as any)[lang] || adv.id || {};
      const en = lang === "en";

      // HERO markers (moved out of the publicAgentSite `fill` block so a language switch updates them).
      const specsH = specs || (en ? "Curated property" : "Properti pilihan");
      const heroFill: Record<string, string> = {
        kicker: A.hero_kicker || (city ? (en ? `${city} property specialist` : `spesialis properti ${city}`) : (en ? "property specialist" : "spesialis properti")),
        "hero-h1": A.hero_headline || (city ? (en ? `${specsH} in ${city}, from hands that truly understand.` : `${specsH} di ${city}, dari tangan yang paham.`) : (en ? `${specsH}, from hands that truly understand.` : `${specsH}, dari tangan yang paham.`)),
        "hero-lead": A.hero_sub || d.tagline || d.bio || `${d.name || d.brand || ""}${d.experience ? " — " + d.experience : ""}${areas ? (en ? " · serving " : " · melayani ") + areas : city ? " · " + city : ""}.`,
        "hero-note": [d.target || d.price_band, areas].filter(Boolean).join(" · "),
        "contact-btn": `${en ? "Contact" : "Hubungi"} ${first}`,
      };
      Object.entries(heroFill).forEach(([k, v]) => { if (v) root.querySelectorAll(`[data-site="${k}"]`).forEach((el) => (el.textContent = v)); });

      // Single-text section markers.
      setSite("about-h", A.about ? `${en ? "About" : "Tentang"} ${brand}` : "");
      setSite("about-body", A.about || d.bio);
      setSite("profile-name", d.name || brand);
      setSite("profile-role", [specs, city].filter(Boolean).join(" · ") || d.positioning);
      setSite("area-intro", A.area_intro);
      setSite("ringkasan-h", Array.isArray(A.ringkasan) && A.ringkasan.length ? (en ? `What you should know about ${brand}` : `Yang perlu Anda tahu tentang ${brand}`) : "");
      setSite("cta-h", brand ? (en ? `Ready to move forward with ${brand}?` : `Siap melangkah bersama ${brand}?`) : "");
      setSite("cta-p", LEAD.whatsapp_hook || A.hero_sub || d.tagline);
      setSite("contact-note", loc ? (loc.label || loc.address) : "");
      { const pa = (Array.isArray(d.areas) && d.areas[0]) || city; setSite("listing-h", en ? `Featured units in ${pa}` : `Unit pilihan di ${pa}`); }

      // Stats band — real agent facts (value + bilingual label), replacing the demo numbers.
      const stats: any[] = Array.isArray(d.stats) ? d.stats : [];
      if (stats.length) {
        root.querySelectorAll(".k-stats").forEach((band) => {
          band.textContent = "";
          stats.slice(0, 4).forEach((st) => {
            const cell = document.createElement("div"); cell.className = "k-stat";
            const nEl = document.createElement("div"); nEl.className = "k-stat-n"; nEl.textContent = String(st.value || "");
            const lEl = document.createElement("div"); lEl.className = "k-stat-l"; lEl.textContent = String((en && st.label_en) ? st.label_en : (st.label || ""));
            cell.appendChild(nEl); cell.appendChild(lEl); band.appendChild(cell);
          });
        });
      }

      // Differentiators — rebuild the checklist from advertorial (or top-level differentiators[]).
      const diffs: any[] = (Array.isArray(A.differentiators) && A.differentiators.length ? A.differentiators : d.differentiators) || [];
      if (diffs.length) {
        root.querySelectorAll('[data-site="about-diff"]').forEach((ul) => {
          ul.textContent = "";
          diffs.slice(0, 8).forEach((t) => {
            const li = document.createElement("li");
            const chk = document.createElement("span"); chk.className = "k-check"; chk.textContent = "✓";
            li.appendChild(chk); li.appendChild(document.createTextNode(String(t)));
            ul.appendChild(li);
          });
        });
      }

      // Services — rebuild one card per {title,desc}, each with an icon that fits the service.
      const iconFor = (title: string): string => {
        const t = (title || "").toLowerCase();
        if (/asing|foreign|pt pma|hak pakai|expat|wna/.test(t)) return "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10Z";                                             // globe (check first — 'pembeli' must not fall to 'beli')
        if (/jual|penjualan|primary|secondary/.test(t)) return "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.4 2.4 0 0 0 3.42 0l6.58-6.58a2.4 2.4 0 0 0 0-3.42ZM7.5 7.5h.01";       // tag
        if (/sewa|rent|kontrak/.test(t)) return "M2.6 17.4A2 2 0 0 0 2 18.8V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0 1-1h.2a2 2 0 0 0 1.4-.6l.8-.8a6.5 6.5 0 1 0-4-4ZM16.5 7.5h.01";                         // key
        if (/investasi|roi|yield|konsultasi/.test(t)) return "M16 7h6v6M22 7l-8.5 8.5-5-5L2 17";                                                                                                                                              // trending-up
        if (/legal|kpa|sertifikat|hukum|pendamping|notaris/.test(t)) return "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1ZM9 12l2 2 4-4"; // shield-check
        if (/asing|foreign|pt pma|hak pakai|expat|wna/.test(t)) return "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10Z";                                             // globe
        return "M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h.01M9 12h.01M9 15h.01";                                                                                                                                                              // building (default)
      };
      const servs: any[] = Array.isArray(A.services) ? A.services : [];
      if (servs.length) {
        root.querySelectorAll('[data-site="services"]').forEach((grid) => {
          grid.textContent = "";
          servs.forEach((sv) => {
            const card = document.createElement("div"); card.className = "k-serv";
            const ic = document.createElement("span"); ic.className = "k-serv-ic"; ic.appendChild(svgIcon(iconFor(String(sv.title || ""))));
            const h = document.createElement("h3"); h.className = "k-serv-t"; h.textContent = String(sv.title || "");
            const p = document.createElement("p"); p.className = "k-muted"; p.textContent = String(sv.desc || "");
            card.appendChild(ic); card.appendChild(h); card.appendChild(p);
            grid.appendChild(card);
          });
        });
      }

      // Area chips — this agent's real areas + nearby landmarks as plain chips, replacing the demo's
      // Bali area names (language-neutral data, but rebuilt here so a toggle never half-updates the
      // page). Rebuilt via controlled DOM.
      const lmForAreas: any[] = loc && Array.isArray(loc.landmarks) ? loc.landmarks.filter(Boolean) : [];
      const ars: string[] = Array.from(new Set(
        ([] as any[])
          .concat(Array.isArray(d.areas) ? d.areas.filter(Boolean) : [], lmForAreas)
          .map((a) => String(a).trim())
          .filter(Boolean)
      ));
      if (ars.length) {
        root.querySelectorAll('[data-site="areas"]').forEach((wrap) => {
          wrap.textContent = "";
          ars.forEach((a) => { const sp = document.createElement("span"); sp.className = "k-area"; sp.textContent = a; wrap.appendChild(sp); });
        });
      }

      // Ringkasan (GEO) — AI-quotable highlights as a short bullet grid.
      const ring: any[] = Array.isArray(A.ringkasan) ? A.ringkasan : [];
      if (ring.length) {
        root.querySelectorAll('[data-site="ringkasan"]').forEach((grid) => {
          grid.textContent = "";
          const iconForRingkasan = (text: string): string => {
            const t = (text || "").toLowerCase();
            // Order matters — most specific first so a stray word (e.g. "Studio", "Kuningan") can't hijack the icon.
            if (/harga|price|\brp\b|miliar|billion|indikat|mulai|start/.test(t)) return "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.4 2.4 0 0 0 3.42 0l6.58-6.58a2.4 2.4 0 0 0 0-3.42ZM7.5 7.5h.01"; // tag
            if (/mrt|lrt|menit|minute|jarak|akses|dekat|near|transport|kaki|walk|stasiun|station/.test(t)) return "M8 3h8a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM8 17l-2 4M16 17l2 4M6 9h12M9 21h6"; // transit
            if (/berlokasi|lokasi|jl\.|jalan|kawasan|located|jantung|cbd|superblok|ciputra world/.test(t)) return "M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"; // map-pin
            if (/menara|tower|lantai|floor|unit|tipe|studio|1br|2br|kamar/.test(t)) return "M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h.01M9 12h.01"; // building
            if (/agen|independ|marketing|afilias|resmi|group|melayani|serving|buyer|pembeli|legal/.test(t)) return "M12 2 4 5v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V5l-8-3ZM9 12l2 2 4-4"; // shield-check
            return "M20 6 9 17l-5-5"; // check (default)
          };
          ring.forEach((t) => {
            const item = document.createElement("div"); item.className = "k-sum-item";
            const ic = document.createElement("span"); ic.className = "k-sum-ic"; ic.appendChild(svgIcon(iconForRingkasan(String(t))));
            const boxEl = document.createElement("div");
            const tx = document.createElement("div"); tx.className = "k-sum-text"; tx.textContent = String(t);
            boxEl.appendChild(tx); item.appendChild(ic); item.appendChild(boxEl);
            grid.appendChild(item);
          });
        });
      }

      // FAQ — rebuild <details> from advertorial[lang].faq.
      const faqs: any[] = Array.isArray(A.faq) ? A.faq : [];
      if (faqs.length) {
        root.querySelectorAll('[data-site="faq"]').forEach((wrap) => {
          wrap.textContent = "";
          faqs.forEach((f) => {
            const det = document.createElement("details"); det.className = "k-faq";
            const sum = document.createElement("summary"); sum.textContent = String(f.q || "");
            const chev = document.createElement("span"); chev.className = "k-chev"; chev.appendChild(svgIcon("m6 9 6 6 6-6"));
            sum.appendChild(chev);
            const p = document.createElement("p"); p.textContent = String(f.a || "");
            det.appendChild(sum); det.appendChild(p);
            wrap.appendChild(det);
          });
        });
      }

      // Foreign buyer — fill body when applicable, otherwise hide the whole section.
      const fbEl = document.getElementById("pembeli-asing") as HTMLElement | null;
      if (!d.foreign_buyer || !/^\s*ya\b/i.test(String(d.foreign_buyer))) {
        if (fbEl) fbEl.hidden = true;
      } else {
        setSite("foreign-body", A.foreign_buyer);
      }

      // Language-specific <title> / description / OG + Twitter title+desc.
      const title = A.meta_title || [brand, [specs, city].filter(Boolean).join(" ")].filter(Boolean).join(" — ");
      const desc = A.meta_description || d.tagline || d.bio || "";
      if (title) { document.title = title; setProp("og:title", title); setName("twitter:title", title); }
      if (desc) { setName("description", desc); setProp("og:description", desc); setName("twitter:description", desc); }
    } catch { /* best-effort — never break the live page */ }
  };

  // Fill Indonesian on load (same point personalizeAgent used to fill), then expose the EN/ID
  // switcher for LangToggle. __cakraApplyLang clamps to a real EN advertorial, else falls back to id.
  applyLang("id");
  try {
    (window as any).__cakraApplyLang = (l: string) => applyLang(l === "en" && adv.en ? "en" : "id");
    (window as any).__cakraHasEN = !!adv.en;
  } catch { /* noop */ }

  // Wire EVERY WhatsApp link (hero/contact CTAs + floating button) to the agent's REAL number +
  // a prefilled message. The earlier hash-config path only covered #site= previews, not live
  // subdomains, so the demo number was leaking through on real agent sites.
  try {
    if (wa) {
      const waHref = `https://wa.me/${wa}${LEAD.whatsapp_hook ? `?text=${encodeURIComponent(String(LEAD.whatsapp_hook))}` : ""}`;
      root.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"], a.k-fab').forEach((a) => a.setAttribute("href", waHref));
    }
  } catch { /* noop */ }

  // Logo: the brand text alone is enough — hide the initials mark for real agents.
  root.querySelectorAll<HTMLElement>(".k-mark").forEach((el) => (el.style.display = "none"));
  // #hub is hidden for real agents → drop its now-dead nav/footer links.
  root.querySelectorAll<HTMLElement>('.k-links a[href="#hub"], .k-foot-links a[href="#hub"]').forEach((a) => (a.hidden = true));

  // ── WhatsApp "start chat" tracking ── every click on a wa.me link / the floating button fires a
  // GA4 + GTM event tagged with its on-page source, so each lead intent is measurable (the chat then
  // happens on the agent's own WhatsApp, off-platform). Delegated so async-rendered listing links count too.
  try {
    root.addEventListener("click", (ev) => {
      const a = (ev.target as HTMLElement)?.closest?.('a[href*="wa.me"], a.k-fab') as HTMLElement | null;
      if (!a) return;
      const src = a.classList.contains("k-fab") ? "fab" : (a.closest("section")?.id || a.closest("[data-site]")?.getAttribute("data-site") || "body");
      const payload = { event: "whatsapp_click", wa_source: src, agent: subdomain };
      try { (window as any).dataLayer = (window as any).dataLayer || []; (window as any).dataLayer.push(payload); } catch { /* noop */ }
      try { (window as any).gtag?.("event", "whatsapp_click", { wa_source: src, agent: subdomain }); } catch { /* noop */ }
    }, { capture: true });
  } catch { /* noop */ }

  // ── Language-NEUTRAL HEAD / SEO (keywords, robots, canonical, static OG/Twitter, hreflang) ──
  const kw = Array.from(new Set(([] as string[]).concat(SEO.primary_keywords || [], SEO.secondary_keywords || [], Aid.keywords || []).filter(Boolean))).slice(0, 12);
  if (kw.length) setName("keywords", kw.join(", "));
  setName("robots", "index,follow");
  if (canonical) {
    let c = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!c) { c = document.createElement("link"); c.setAttribute("rel", "canonical"); document.head.appendChild(c); }
    c.setAttribute("href", canonical);
  }
  setProp("og:type", "website");
  if (canonical) setProp("og:url", canonical);
  setProp("og:site_name", brand);
  setProp("og:locale", "id_ID");
  if (EN) setProp("og:locale:alternate", "en_US");
  setName("twitter:card", "summary_large_image");
  if (EN && canonical) {
    setAlt("cakra-alt-id", "id", canonical);
    setAlt("cakra-alt-en", "en", canonical);
    setAlt("cakra-alt-x", "x-default", canonical);
  }

  // No per-agent email in the data contract — hide the demo email button (WhatsApp stays primary).
  root.querySelectorAll('[data-site="email-btn"]').forEach((el) => ((el as HTMLElement).hidden = true));

  // ── 4. Location + map ──
  if (loc && (loc.address || loc.map_query || loc.label)) {
    root.querySelectorAll('[data-site="location-block"]').forEach((wrapNode) => {
      const wrap = wrapNode as HTMLElement;
      wrap.textContent = "";
      const h = document.createElement("h3"); h.className = "k-loc-h"; h.textContent = "Lokasi";
      wrap.appendChild(h);
      const addr = document.createElement("p"); addr.className = "k-loc-addr";
      addr.textContent = loc.address || [loc.label, loc.area, loc.city].filter(Boolean).join(", ");
      wrap.appendChild(addr);
      const q = loc.map_query || loc.address || [loc.area, loc.city, loc.region].filter(Boolean).join(", ");
      if (q) {
        const mapBox = document.createElement("div"); mapBox.className = "k-loc-map";
        const iframe = document.createElement("iframe");
        iframe.setAttribute("loading", "lazy");
        iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("title", `Peta lokasi ${brand}`.trim());
        iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
        mapBox.appendChild(iframe);
        wrap.appendChild(mapBox);
      }
      const lms: any[] = Array.isArray(loc.landmarks) ? loc.landmarks.filter(Boolean) : [];
      if (lms.length) {
        const chips = document.createElement("div"); chips.className = "k-loc-chips";
        lms.forEach((lm) => { const c = document.createElement("span"); c.className = "k-loc-chip"; c.textContent = String(lm); chips.appendChild(c); });
        wrap.appendChild(chips);
      }
      wrap.hidden = false;
    });
  }

  // ── Hide demo-only sections that carry Bali-specific placeholder copy with no per-agent data ──
  // (fabricated stats, generic process steps, demo testimonials, and the sample blog hub). Using
  // an inline display:none too so it beats class rules like .k-stats{display:grid}.
  const hardHide = (el: Element | null | undefined) => {
    if (!el) return;
    const h = el as HTMLElement;
    h.hidden = true;
    h.style.display = "none";
  };
  if (!(Array.isArray(d.stats) && d.stats.length)) root.querySelectorAll(".k-stats").forEach((el) => hardHide(el)); // STATS band (kept + filled by applyLang when the agent has real stats)
  const stepEl = root.querySelector(".k-step"); if (stepEl) hardHide(stepEl.closest("section"));     // PROSES / steps
  const testiEl = root.querySelector(".k-testi"); if (testiEl) hardHide(testiEl.closest("section")); // TESTIMONI
  hardHide(document.getElementById("hub"));                                                          // HUB blog cards
  root.querySelectorAll(".k-ribbon").forEach((el) => hardHide(el));                                  // "Contoh situs agen" demo banner

  // ── 2. JSON-LD (needs the agent's real listings for the ItemList + OG image) ──
  publicListings(d.aid).then((listings: any[]) => {
    try {
      const ls = Array.isArray(listings) ? listings : [];
      // Flatten every listing image so hero + about can use DIFFERENT, on-topic photos.
      const allImgs: string[] = [];
      for (const l of ls) { if (Array.isArray(l.images)) for (const im of l.images) if (im) allImgs.push(String(im)); }
      const firstImg = allImgs[0] || "";
      const aboutImg = allImgs.find((x) => x !== firstImg) || firstImg;   // a different apartment shot for the About section
      if (firstImg) setProp("og:image", firstImg);
      // Hero background — swap the Bali-villa placeholder for THIS agent's first listing image
      // (an apartment for The Newton). Same value as OG; falls back to the existing image if none.
      if (firstImg) {
        root.querySelectorAll<HTMLImageElement>(".k-hero-img").forEach((img) => {
          img.src = firstImg;
          img.alt = brand || (ls[0] && ls[0].title) || img.alt;
        });
      }
      // About/Tentang image — the demo uses a Bali agent photo; use a real apartment image instead.
      if (aboutImg) {
        root.querySelectorAll<HTMLImageElement>(".k-about-img img").forEach((img) => {
          img.src = aboutImg;
          img.alt = brand ? `${brand} — ${(d.city || "properti")}` : img.alt;
        });
      }

      const agentNode: any = {
        "@type": "RealEstateAgent",
        "@id": (canonical || "") + "#agent",
        name: brand || undefined,
        description: Aid.about || GEO.entity_id || d.tagline || undefined,
        url: canonical || undefined,
      };
      if (wa) agentNode.telephone = "+" + wa;
      const areaServed = ([] as any[]).concat(Array.isArray(d.areas) ? d.areas : [], (loc && loc.landmarks) || []).filter(Boolean);
      if (areaServed.length) agentNode.areaServed = areaServed.map((a) => ({ "@type": "Place", name: String(a) }));
      if (loc && (loc.address || loc.city || loc.region || loc.postal)) {
        agentNode.address = { "@type": "PostalAddress", streetAddress: loc.address || undefined, addressLocality: loc.city || undefined, addressRegion: loc.region || undefined, postalCode: loc.postal || undefined, addressCountry: loc.country || "ID" };
      }
      if (loc && loc.lat != null && loc.lng != null) agentNode.geo = { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng };
      if (socialUrls.length) agentNode.sameAs = socialUrls;
      if (d.price_band) agentNode.priceRange = d.price_band;

      const graph: any[] = [agentNode];
      if (Array.isArray(Aid.faq) && Aid.faq.length) {
        graph.push({ "@type": "FAQPage", "@id": (canonical || "") + "#faq", mainEntity: Aid.faq.map((f: any) => ({ "@type": "Question", name: String(f.q || ""), acceptedAnswer: { "@type": "Answer", text: String(f.a || "") } })) });
      }
      if (ls.length) {
        graph.push({
          "@type": "ItemList",
          "@id": (canonical || "") + "#listings",
          itemListElement: ls.map((l, i) => {
            const price = parseRp(l.price_label);
            const item: any = { "@type": "Residence", name: l.title || undefined, image: (Array.isArray(l.images) && l.images[0]) || undefined, description: l.location || undefined };
            if (price) item.offers = { "@type": "Offer", price, priceCurrency: "IDR", availability: "https://schema.org/InStock" };
            return { "@type": "ListItem", position: i + 1, item };
          }),
        });
      }

      // Neutralize the template's stale (Kirana) structured data, then inject ours by stable id.
      document.querySelectorAll('script[type="application/ld+json"]').forEach((sc) => { if (sc.id !== "cakra-jsonld") sc.textContent = "{}"; });
      let scriptEl = document.getElementById("cakra-jsonld") as HTMLScriptElement | null;
      if (!scriptEl) { scriptEl = document.createElement("script"); scriptEl.type = "application/ld+json"; scriptEl.id = "cakra-jsonld"; document.head.appendChild(scriptEl); }
      scriptEl.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    } catch { /* best-effort — never break the live page */ }
  }).catch(() => {});
}

export function SiteSkin() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    let cfg: any = {};
    try {
      const m = window.location.hash.match(/site=([^&]+)/);
      if (m) cfg = JSON.parse(decodeURIComponent(atob(m[1])));
    } catch { cfg = {}; }
    const root = document.getElementById("top");
    if (!root) return;
    // The agent/demo site is always LIGHT — force the mobile browser status bar (theme-color) to the
    // nav background so it matches, instead of the app's dark-mode theme-color painting a black bar.
    try {
      const bg = (getComputedStyle(root).getPropertyValue("--k-bg") || "").trim() || "#F2F6F6";
      document.head.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.parentElement && m.parentElement.removeChild(m));
      const tc = document.createElement("meta"); tc.setAttribute("name", "theme-color"); tc.setAttribute("content", bg); document.head.appendChild(tc);
    } catch { /* noop */ }
    // Resolve a live agent from a subdomain host (sub.cakra.xyz) even with no #site= hash, so a real
    // published site personalizes too — not only the preview link.
    const subFromHost = (() => {
      try {
        const mm = window.location.hostname.toLowerCase().match(/^([a-z0-9-]+)\.cakra\.xyz$/);
        const reserved = ["www", "member", "sample", "app", "api", "admin", "cakra"];
        if (mm && !reserved.includes(mm[1])) return mm[1];
      } catch {}
      return null;
    })();
    // Canonical reference: plain /demo (no subdomain) renders the REAL client site — The Newton —
    // instead of a fictional demo persona. Real agent subdomains still resolve to their own site.
    const siteKey = cfg.aid || subFromHost || "thenewton";
    // Free preview expires after 7 days (like Supabase's free-tier pause) — show a paused screen.
    if (cfg.exp && Date.now() > cfg.exp) { setPaused(true); return; }
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

      // background mode — PAGE BACKGROUND + section bands only. NEVER the hero image.
      let bgCss = "";
      if (cfg.bg === "gradient" && c.bg) {
        // two contrasting palette hues (brand + accent), pale enough for dark text but clearly a
        // two-tone wash — visibly different from mono (flat) and dual (alternating bands).
        root.style.background = `linear-gradient(152deg, color-mix(in oklab, ${c.em || c.bg} 34%, ${c.bg}) 0%, color-mix(in oklab, ${c.bg} 82%, ${c.em || c.bg}) 46%, color-mix(in oklab, ${c.go || c.bg} 44%, ${c.bg}) 100%)`;
        bgCss = `.kir .k-band{ background:transparent !important; border-top:none !important; border-bottom:none !important; }`;   // gradient flows continuously — no section dividers
      } else if (cfg.bg === "mono" && c.bg) {
        root.style.background = c.bg;
        bgCss = `.kir .k-band{ background:${c.bg} !important; }`;       // flat: bands blend into the page
      }
      // dual: template default (alternating page bg / white bands) — hero untouched in every mode

      // background decoration density → data-decor on the page root (behind all content)
      if (cfg.dec && cfg.dec !== "none") {
        root.setAttribute("data-decor", String(cfg.dec));
      }
      // swap decoration icon sprite to match the tone/style set
      if (cfg.set && DECOR_TONES.includes(cfg.set)) {
        root.querySelectorAll(".k-decor-item").forEach((el) => { (el as HTMLElement).style.backgroundImage = `url(/decor/${cfg.set}.webp)`; });
      }

      // density + card style → injected stylesheet (things CSS vars alone can't carry)
      const DEN_PAD: Record<string, number> = { tight: 54, normal: 84, spacious: 116 };
      const DEN_LH: Record<string, number> = { tight: 1.5, normal: 1.62, spacious: 1.78 };
      const STY: Record<string, { b: string; s: string }> = {
        lembut: { b: "1px solid var(--k-line)", s: "0 1px 2px rgba(15,32,38,.05)" },
        minimalis: { b: "1px solid var(--k-line)", s: "none" },
        tegas: { b: "1.5px solid var(--k-ink)", s: "5px 5px 0 var(--k-ink)" },
        editorial: { b: "1px solid color-mix(in oklab, var(--k-ink) 14%, transparent)", s: "none" },
      };
      let css = bgCss;
      if (cfg.den && DEN_PAD[cfg.den]) css += `.kir .k-sec{padding-top:${DEN_PAD[cfg.den]}px;padding-bottom:${DEN_PAD[cfg.den]}px}.kir .k-split{padding-top:${DEN_PAD[cfg.den]}px;padding-bottom:${DEN_PAD[cfg.den]}px}.kir{line-height:${DEN_LH[cfg.den]}}`;
      if (cfg.sty && STY[cfg.sty]) css += `.kir .k-card,.kir .k-legal-item,.kir .k-sum-item,.kir .k-connect{border:${STY[cfg.sty].b};box-shadow:${STY[cfg.sty].s}}`;
      if (css) { let st = document.getElementById("cakra-skin-css") as HTMLStyleElement | null; if (!st) { st = document.createElement("style"); st.id = "cakra-skin-css"; document.head.appendChild(st); } st.textContent = css; }

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
      const waNum = toWaE164(s.wa);
      if (waNum) {
        const wa = `https://wa.me/${waNum}`;
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
        // Real agent link when provided; otherwise HIDE it so the template's placeholder
        // handles never leak (an agent shows only the socials they actually have).
        if (href) a.href = href; else (a as HTMLElement).hidden = true;
      });

      // ── persona content ── make the site read as THIS agent (not the demo persona).
      if (siteKey) {
        publicAgentSite(siteKey).then((d) => {
          if (!d) return;
          const first = String(d.name || d.brand || "").trim().split(/\s+/)[0] || "kami";
          // Full persona pass — HEAD/SEO, JSON-LD, and body sections. This also fills the HERO markers
          // (via applyLang("id")) and exposes window.__cakraApplyLang for the EN/ID toggle. Best-effort.
          try { personalizeAgent(d, root, subFromHost); } catch { /* never break the live page */ }
          // Replace remaining demo-person mentions AND residual Bali place-names in VISIBLE prose
          // only — never touch SCRIPT/STYLE (e.g. JSON-LD). Function replacers so a value containing
          // "$" can't corrupt output; case-sensitive tokens so words like "kembali" are never hit.
          const nm = d.name || d.brand, bd = d.brand || first;
          const primaryArea = (Array.isArray(d.areas) && d.areas.filter(Boolean)[0]) || d.city || "";
          const BALI_TOKENS = ["Bali", "Canggu", "Seminyak", "Uluwatu", "Jimbaran", "Ubud"];
          const BALI_RE = /\bBali Selatan\b|\b(?:Bali|Canggu|Seminyak|Uluwatu|Jimbaran|Ubud)\b/g;
          if (nm || primaryArea) {
            const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
              acceptNode: (node: Node) => {
                const p = (node as Text).parentElement;
                if (p && (p.tagName === "SCRIPT" || p.tagName === "STYLE")) return NodeFilter.FILTER_REJECT;
                const v = node.nodeValue || "";
                const hasKirana = !!nm && v.indexOf("Kirana") !== -1;
                const hasBali = !!primaryArea && BALI_TOKENS.some((tk) => v.indexOf(tk) !== -1);
                return hasKirana || hasBali ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
              },
            } as any);
            const hits: Text[] = []; let n: Node | null;
            while ((n = walk.nextNode())) hits.push(n as Text);
            hits.forEach((t) => {
              let v = t.nodeValue!;
              if (nm) v = v.replace(/Kirana Sutanto/g, () => nm).replace(/Kirana/g, () => bd);
              if (primaryArea) v = v.replace(BALI_RE, () => primaryArea);
              t.nodeValue = v;
            });
          }
        });
      }
    } catch {
      /* skinning is best-effort — never break the live page */
    }
  }, []);
  if (!paused) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "linear-gradient(165deg,#0F2026,#173840)", color: "#fff", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontSize: "2.6rem", marginBottom: 6 }}>⏸️</div>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.7rem,5vw,2.2rem)", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.15 }}>Preview 7 hari telah berakhir</h1>
        <p style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: "1rem", lineHeight: 1.6, opacity: .82, margin: "0 0 24px" }}>Situs contoh Anda dijeda sementara — seperti masa uji coba. Aktifkan selamanya dengan konten asli &amp; Optimasi AI (SEO / GEO / social search) agar benar-benar ditemukan calon pembeli.</p>
        <a href="https://member.cakra.xyz/admin" style={{ display: "inline-block", background: "#B0812F", color: "#fff", textDecoration: "none", fontFamily: "'Manrope',system-ui,sans-serif", fontWeight: 700, padding: ".9rem 1.7rem", borderRadius: 12, boxShadow: "0 14px 30px -10px rgba(176,129,47,.6)" }}>Aktifkan situs dengan Optimasi AI →</a>
      </div>
    </div>
  );
}
