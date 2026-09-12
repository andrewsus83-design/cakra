"use client";
import { useEffect, useMemo, useRef, useState } from "react";

// Searchable city/area picker tuned to Indonesian property markets. Zero-cost, offline, and
// works in the static export. Free text is always allowed, so agents in smaller areas aren't
// blocked. (If a Google Maps Places key is later set in public_config, this is the single place
// to swap in Places Autocomplete.)
const CITIES = [
  // Bali
  "Denpasar, Bali", "Canggu, Bali", "Seminyak, Bali", "Kuta, Bali", "Ubud, Bali", "Sanur, Bali",
  "Jimbaran, Bali", "Uluwatu, Bali", "Nusa Dua, Bali", "Pererenan, Bali", "Berawa, Bali", "Tabanan, Bali", "Gianyar, Bali",
  // Jakarta
  "Jakarta Selatan", "Jakarta Pusat", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara",
  "SCBD, Jakarta", "Kemang, Jakarta", "Menteng, Jakarta", "Pondok Indah, Jakarta", "Kelapa Gading, Jakarta",
  // Greater Jakarta (Jabodetabek)
  "Bekasi", "Tangerang", "Tangerang Selatan", "BSD City, Tangerang", "Gading Serpong, Tangerang",
  "Alam Sutera, Tangerang", "Bintaro, Tangerang", "Bogor", "Sentul, Bogor", "Depok", "Cibubur",
  // Bandung
  "Bandung", "Dago, Bandung", "Setiabudi, Bandung", "Ciumbuleuit, Bandung",
  // Surabaya
  "Surabaya", "Citraland, Surabaya", "Pakuwon, Surabaya",
  // Other major cities
  "Yogyakarta", "Semarang", "Medan", "Makassar", "Malang", "Batam", "Balikpapan", "Manado", "Pekanbaru", "Palembang",
];

function Pin() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", opacity: .7 }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}

export function CityInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return CITIES.slice(0, 8);
    const starts = CITIES.filter((c) => c.toLowerCase().startsWith(q));
    const has = CITIES.filter((c) => !c.toLowerCase().startsWith(q) && c.toLowerCase().includes(q));
    return [...starts, ...has].slice(0, 8);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (c: string) => { onChange(c); setOpen(false); };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        className="ob-input" value={value || ""} placeholder={placeholder} autoComplete="off"
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || !matches.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, matches.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); pick(matches[active]); }
          else if (e.key === "Escape") { setOpen(false); }
        }}
      />
      {open && matches.length > 0 && (
        <ul role="listbox" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 30, listStyle: "none", margin: 0, padding: 4, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 12, boxShadow: "var(--shadow)", maxHeight: 300, overflow: "auto" }}>
          {matches.map((c, i) => (
            <li key={c} role="option" aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); pick(c); }} onMouseEnter={() => setActive(i)}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: ".62rem .8rem", borderRadius: 9, cursor: "pointer", fontSize: "1rem", color: "var(--ink)", background: i === active ? "var(--surface-2)" : "transparent" }}>
              <Pin />{c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
