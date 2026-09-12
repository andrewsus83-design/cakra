"use client";
import { useEffect, useState } from "react";
import { publicAgentSite, publicListings, toWaE164 } from "@/lib/supabase";

type L = { t: string; loc: string; tag: string; price: string; per?: string; beds: number; baths: number; size: number; img: string };
function Ic({ d, s = 18 }: { d: string; s?: number }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

// Listing grid where a click opens a contact popup pre-filled with the property's
// title + details, so a buyer can WhatsApp/email about that exact property.
export function ListingGrid({ listings, wa, email }: { listings: L[]; wa: string; email: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [rows, setRows] = useState<L[] | null>(null);
  const [waNum, setWaNum] = useState(wa);   // real agent's WhatsApp overrides the demo number
  const [agentName, setAgentName] = useState("");
  // Resolve the live agent from the #site config OR the subdomain host (sub.cakra.xyz), then render
  // THAT agent's real listings (dummy-seeded on signup, replaced as they edit in the dashboard)
  // instead of the demo placeholders — plus the agent's real WhatsApp number & name for the lead copy.
  useEffect(() => {
    try {
      let aidFromHash: string | null = null;
      const m = window.location.hash.match(/site=([^&]+)/);
      if (m) { try { aidFromHash = JSON.parse(decodeURIComponent(atob(m[1]))).aid || null; } catch {} }
      const subFromHost = (() => {
        try {
          const mm = window.location.hostname.toLowerCase().match(/^([a-z0-9-]+)\.cakra\.xyz$/);
          const reserved = ["www", "member", "sample", "app", "api", "admin", "cakra"];
          if (mm && !reserved.includes(mm[1])) return mm[1];
        } catch {}
        return null;
      })();
      const key = aidFromHash || subFromHost;
      if (!key) return;   // plain /demo — keep the placeholder listings
      // public_agent_site resolves by subdomain OR agent id, giving us the real agent uuid to query.
      publicAgentSite(key).then((site) => {
        if (!site) return;
        if (site.name || site.brand) setAgentName(String(site.name || site.brand).trim().split(/\s+/)[0]);
        const w = toWaE164(site.socials && site.socials.wa);
        if (w) setWaNum(w);
        publicListings(site.aid).then((ls) => {
          if (!ls || !ls.length) return;
          const st: Record<string, string> = { dijual: "Dijual", disewa: "Disewa" };
          // Location kept as-is (already carries its own region, e.g. "…, Jakarta Selatan") — no Bali-specific cleanup.
          setRows(ls.map((r: any) => ({ t: r.title, loc: String(r.location || ""), tag: st[r.status] || "Dijual", price: r.price_label || "", per: "", beds: Number(r.beds) || 0, baths: Number(r.baths) || 0, size: Number(r.size_m2) || 0, img: (Array.isArray(r.images) && r.images[0]) || "/hero.webp" })));
        });
      });
    } catch {}
  }, []);
  const shown = rows || listings;
  const usingReal = rows != null;
  const sel = open !== null ? shown[open] : null;
  // Demo rows carry a short area ("Uluwatu") and append ", Bali"; real rows already include their region.
  const locOf = (p: L) => `${p.loc}${usingReal ? "" : ", Bali"}`;
  const bedOf = (p: L) => (p.beds ? `${p.beds} KT` : "Studio");
  const greet = agentName ? `Halo ${agentName}` : "Halo";
  const line = (p: L) => `${p.t} — ${p.price}${p.per || ""} · ${locOf(p)} · ${bedOf(p)}, ${p.baths} KM, ${p.size} m²`;
  const waHref = (p: L) => `https://wa.me/${waNum}?text=${encodeURIComponent(`${greet}, saya tertarik dengan ${line(p)}. Boleh info lebih lanjut & jadwal viewing?`)}`;
  const mailHref = (p: L) => `mailto:${email}?subject=${encodeURIComponent(`Tanya properti: ${p.t}`)}&body=${encodeURIComponent(`${greet},\n\nSaya tertarik dengan properti berikut:\n${line(p)}\n\nMohon info lebih lanjut & jadwal viewing.\n\nTerima kasih.`)}`;

  return (
    <>
      <div className="k-grid k-grid-3">
        {shown.map((p, i) => (
          <button key={p.t} className="k-card k-card-btn" onClick={() => setOpen(i)}>
            <div className="k-card-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.t} />
              <span className={`k-badge ${p.tag === "Disewa" ? "k-badge-gold" : ""}`}>{p.tag}</span>
            </div>
            <div className="k-card-body">
              <div className="k-price">{p.price}{p.per && <span className="k-per">{p.per}</span>}</div>
              <h3 className="k-card-t">{p.t}</h3>
              <div className="k-muted k-sm">{locOf(p)}</div>
              <div className="k-meta">{bedOf(p)} · {p.baths} KM · {p.size} m²</div>
              <span className="k-card-cta"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" s={14} /> Hubungi soal properti ini</span>
            </div>
          </button>
        ))}
      </div>

      {sel && (
        <div className="k-modal" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <div className="k-modal-in" onClick={(e) => e.stopPropagation()}>
            <button className="k-modal-x" onClick={() => setOpen(null)} aria-label="Tutup">✕</button>
            <div className="k-modal-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sel.img} alt={sel.t} />
              <span className={`k-badge ${sel.tag === "Disewa" ? "k-badge-gold" : ""}`}>{sel.tag}</span>
            </div>
            <div className="k-modal-body">
              <div className="k-price">{sel.price}{sel.per && <span className="k-per">{sel.per}</span>}</div>
              <h3 className="k-modal-t">{sel.t}</h3>
              <div className="k-muted k-sm">{locOf(sel)} · {bedOf(sel)} · {sel.baths} KM · {sel.size} m²</div>
              <p className="k-modal-desc">Chat langsung soal <b>{sel.t}</b> — pesan sudah terisi otomatis dengan detail properti ini, jadi Anda bisa langsung menanyakan yang tepat.</p>
              <div className="k-modal-actions">
                <a href={waHref(sel)} target="_blank" rel="noopener noreferrer" className="k-btn k-btn-gold k-lg"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" /> WhatsApp</a>
                {!usingReal && <a href={mailHref(sel)} className="k-btn k-btn-ghost k-lg"><Ic d="M4 6h16v12H4zM4 7l8 6 8-6" /> Email</a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
