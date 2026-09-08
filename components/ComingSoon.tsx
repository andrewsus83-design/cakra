import Link from "next/link";

export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <main className="wrap" style={{ minHeight: "56vh", display: "grid", alignContent: "center", padding: "80px 0" }}>
      <span className="eyebrow">cakra</span>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", margin: "10px 0 14px", maxWidth: "16ch" }}>
        {title}
      </h1>
      <p className="lead" style={{ marginBottom: 26 }}>{blurb}</p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/" className="btn btn-ghost">← Beranda</Link>
        <Link href="/signup" className="btn btn-brand">Mulai gratis</Link>
      </div>
    </main>
  );
}
