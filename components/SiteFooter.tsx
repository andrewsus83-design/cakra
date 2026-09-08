"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CakraMark } from "./CakraMark";

const COLS = [
  { title: "Platform", links: [["Website builder", "/#cara-kerja"], ["Listing", "/listing"], ["Kalkulator", "/kalkulator"], ["Harga", "/harga"]] },
  { title: "Perusahaan", links: [["Tentang", "/about"], ["Contoh situs", "/demo"], ["Hub", "/hub"], ["FAQ", "/faq"], ["Kontak", "/contact"]] },
  { title: "Legal", links: [["Syarat & Ketentuan", "/terms"], ["Privasi", "/privacy"], ["Masuk", "/login"], ["Daftar", "/onboarding"]] },
];

// Links intentionally left empty ("#") until the real social profiles exist.
const SOCIALS: [string, string, string][] = [
  ["Website", "#", "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-2.5a15.6 15.6 0 0 0-1.2-3.5A8 8 0 0 1 18.9 8ZM12 4c.8 1 1.5 2.4 1.9 4h-3.8C10.5 6.4 11.2 5 12 4ZM4.3 14a8 8 0 0 1 0-4h2.9a17 17 0 0 0 0 4H4.3Zm.8 2h2.5c.3 1.3.7 2.5 1.2 3.5A8 8 0 0 1 5.1 16Zm2.5-8H5.1a8 8 0 0 1 3.7-3.5C8.3 5.5 7.9 6.7 7.6 8ZM12 20c-.8-1-1.5-2.4-1.9-4h3.8c-.4 1.6-1.1 3-1.9 4Zm2.4-6H9.6a15 15 0 0 1 0-4h4.8a15 15 0 0 1 0 4Zm.5 5.5c.5-1 .9-2.2 1.2-3.5h2.5a8 8 0 0 1-3.7 3.5ZM16.8 14a17 17 0 0 0 0-4h2.9a8 8 0 0 1 0 4h-2.9Z"],
  ["Instagram", "#", "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z"],
  ["TikTok", "#", "M14 3c.3 2.2 1.7 3.9 4 4.2v2.5c-1.5 0-2.9-.5-4-1.3v5.9a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 1 0 1.8 2.5V3H14Z"],
  ["YouTube", "#", "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z"],
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/demo" || pathname.startsWith("/demo/") || pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") return null;
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--surface-2)" }}>
      <div className="wrap" style={{ padding: "48px 0 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)", gap: 32 }} className="cakra-foot-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CakraMark size={42} />
              <span className="hand" style={{ fontSize: "2.1rem", fontWeight: 700, lineHeight: 1 }}>cakra</span>
            </div>
            <p className="muted" style={{ maxWidth: "34ch", marginTop: 12, fontSize: ".92rem" }}>
              Roda kehadiran untuk agen properti cerdas. Punya website, selalu update, kredibel, dan mudah ditemukan.
            </p>
            <p className="hand gold" style={{ fontSize: "1.35rem", marginTop: 14, marginBottom: 2 }}>
              be the agent AI can&apos;t ignore
            </p>
            <p className="muted" style={{ fontSize: ".9rem", margin: 0 }}>Jadi agen yang tak bisa diabaikan AI.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              {SOCIALS.map(([label, href, d]) => (
                <a key={label} href={href} aria-label={label} style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid var(--line-2)", display: "grid", placeItems: "center", color: "var(--ink-2)", background: "var(--surface)" }}>
                  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true"><path d={d} /></svg>
                </a>
              ))}
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>{c.title}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 9 }}>
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="muted" style={{ textDecoration: "none", fontSize: ".9rem" }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 40, paddingTop: 22, borderTop: "1px solid var(--line)", color: "var(--muted)", fontSize: ".82rem" }}>
          <span>© {new Date().getFullYear()} cakra · Indonesia — Situs milik Anda. Selalu terbarui. Mudah ditemukan. Tetap relevan.</span>
          <span className="mono">SEO · GEO · Social</span>
        </div>
      </div>
      <style>{`@media (max-width: 820px){ .cakra-foot-grid{ grid-template-columns: 1fr 1fr !important; } }`}</style>
    </footer>
  );
}
