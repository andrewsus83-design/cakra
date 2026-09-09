"use client";
import { useEffect, useRef } from "react";

// Location field that upgrades to Google Places Autocomplete when a Maps key is present,
// and falls back to a plain text input otherwise. Structured localities feed local-SEO
// (areaServed / geo schema) and the content machine's per-area research.
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
let loader: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (typeof window === "undefined" || !KEY) return Promise.reject(new Error("no-key"));
  if ((window as unknown as { google?: { maps?: { places?: unknown } } }).google?.maps?.places) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&loading=async`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("load-failed"));
    document.head.appendChild(s);
  });
  return loader;
}

export function LocationInput({ value, onChange, disabled, style, placeholder }: { value: string; onChange: (v: string) => void; disabled?: boolean; style?: React.CSSProperties; placeholder?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!KEY || disabled || !ref.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ac: any;
    loadMaps().then(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as any).google;
      if (!g?.maps?.places || !ref.current) return;
      ac = new g.maps.places.Autocomplete(ref.current, {
        componentRestrictions: { country: "id" },
        fields: ["formatted_address", "name", "place_id", "geometry"],
        types: ["(regions)"],
      });
      ac.addListener("place_changed", () => {
        const p = ac.getPlace();
        const v = p?.formatted_address || p?.name || ref.current?.value || "";
        if (v) onChange(v);
      });
    }).catch(() => { /* no key or load failed → plain input */ });
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as any).google;
      if (ac && g?.maps?.event) g.maps.event.clearInstanceListeners(ac);
    };
  }, [disabled]); // eslint-disable-line react-hooks/exhaustive-deps
  return <input ref={ref} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={style} />;
}
