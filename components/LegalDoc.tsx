import Link from "next/link";

export type LegalSection = { h: string; body: string[] };

export function LegalDoc({ title, updated, intro, sections }: { title: string; updated: string; intro: string; sections: LegalSection[] }) {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(40px,6vw,76px) clamp(18px,4vw,28px) 88px" }}>
      <p className="hand gold" style={{ fontSize: "1.6rem", transform: "rotate(-2deg)", margin: 0 }}>legal</p>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem,5vw,3.2rem)", fontWeight: 700, margin: "4px 0 8px", lineHeight: 1.05 }}>{title}</h1>
      <p className="mono muted" style={{ fontSize: ".82rem", marginBottom: 26 }}>Terakhir diperbarui: {updated}</p>
      <p className="lead" style={{ margin: "0 0 34px", textAlign: "left" }}>{intro}</p>
      {sections.map((s, i) => (
        <section key={s.h} style={{ marginBottom: 30 }}>
          <h2 className="display" style={{ fontSize: "1.35rem", fontWeight: 600, margin: "0 0 10px" }}>{i + 1}. {s.h}</h2>
          {s.body.map((p, j) => (
            <p key={j} className="muted" style={{ fontSize: "1.02rem", lineHeight: 1.72, margin: "0 0 12px" }}>{p}</p>
          ))}
        </section>
      ))}
      <div style={{ marginTop: 36, paddingTop: 22, borderTop: "1px solid var(--line)", display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
        <p className="muted" style={{ fontSize: ".95rem", margin: 0 }}>
          Ada pertanyaan? Hubungi <a href="mailto:halo@cakra.xyz" className="gold" style={{ textDecoration: "none" }}>halo@cakra.xyz</a>.
        </p>
        <Link href="/terms" className="muted" style={{ fontSize: ".9rem" }}>Syarat &amp; Ketentuan</Link>
        <Link href="/privacy" className="muted" style={{ fontSize: ".9rem" }}>Kebijakan Privasi</Link>
      </div>
    </main>
  );
}
