"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CakraMark } from "./CakraMark";

const COLS = [
  { title: "Platform", links: [["Website builder", "/#builder"], ["Listing", "/#listing"], ["Editor AI", "/#editor"], ["Konten & Blog", "/#content"]] },
  { title: "Perusahaan", links: [["Tentang", "/about"], ["Hub", "/hub"], ["FAQ", "/faq"], ["Kontak", "/contact"]] },
  { title: "Legal", links: [["Syarat & Ketentuan", "/terms"], ["Privasi", "/privacy"], ["Masuk", "/login"], ["Daftar", "/signup"]] },
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
            <p className="hand gold" style={{ fontSize: "1.35rem", marginTop: 14 }}>
              be the agent AI can&apos;t ignore
            </p>
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
          <span>© {new Date().getFullYear()} cakra — Punya · Terbarui · Ditemukan · Relevan</span>
          <span className="mono">SEO · GEO · Social</span>
        </div>
      </div>
      <style>{`@media (max-width: 820px){ .cakra-foot-grid{ grid-template-columns: 1fr 1fr !important; } }`}</style>
    </footer>
  );
}
