"use client";
import { useState } from "react";

type L = { t: string; loc: string; tag: string; price: string; per?: string; beds: number; baths: number; size: number; img: string };
function Ic({ d, s = 18 }: { d: string; s?: number }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

// Listing grid where a click opens a contact popup pre-filled with the property's
// title + details, so a buyer can WhatsApp/email about that exact property.
export function ListingGrid({ listings, wa, email }: { listings: L[]; wa: string; email: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const sel = open !== null ? listings[open] : null;
  const line = (p: L) => `${p.t} — ${p.price}${p.per || ""} · ${p.loc}, Bali · ${p.beds} KT, ${p.baths} KM, ${p.size} m²`;
  const waHref = (p: L) => `https://wa.me/${wa}?text=${encodeURIComponent(`Halo Kirana, saya tertarik dengan ${line(p)}. Boleh info lebih lanjut & jadwal viewing?`)}`;
  const mailHref = (p: L) => `mailto:${email}?subject=${encodeURIComponent(`Tanya properti: ${p.t}`)}&body=${encodeURIComponent(`Halo Kirana,\n\nSaya tertarik dengan properti berikut:\n${line(p)}\n\nMohon info lebih lanjut & jadwal viewing.\n\nTerima kasih.`)}`;

  return (
    <>
      <div className="k-grid k-grid-3">
        {listings.map((p, i) => (
          <button key={p.t} className="k-card k-card-btn" onClick={() => setOpen(i)}>
            <div className="k-card-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.t} />
              <span className={`k-badge ${p.tag === "Disewa" ? "k-badge-gold" : ""}`}>{p.tag}</span>
            </div>
            <div className="k-card-body">
              <div className="k-price">{p.price}{p.per && <span className="k-per">{p.per}</span>}</div>
              <h3 className="k-card-t">{p.t}</h3>
              <div className="k-muted k-sm">{p.loc}, Bali</div>
              <div className="k-meta">{p.beds} KT · {p.baths} KM · {p.size} m²</div>
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
              <div className="k-muted k-sm">{sel.loc}, Bali · {sel.beds} KT · {sel.baths} KM · {sel.size} m²</div>
              <p className="k-modal-desc">Chat langsung soal <b>{sel.t}</b> — pesan sudah terisi otomatis dengan detail properti ini, jadi Anda bisa langsung menanyakan yang tepat.</p>
              <div className="k-modal-actions">
                <a href={waHref(sel)} target="_blank" rel="noopener noreferrer" className="k-btn k-btn-gold k-lg"><Ic d="M20 4 3 11l6 2 2 6 3-5 4 3z" /> WhatsApp</a>
                <a href={mailHref(sel)} className="k-btn k-btn-ghost k-lg"><Ic d="M4 6h16v12H4zM4 7l8 6 8-6" /> Email</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
