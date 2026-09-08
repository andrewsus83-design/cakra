import type { Metadata } from "next";
import Link from "next/link";
import { KprCalc, RentalYield } from "@/components/KprCalc";

export const metadata: Metadata = {
  title: "Kalkulator Properti — Cicilan KPR & Imbal Hasil Sewa",
  description:
    "Hitung estimasi cicilan KPR dan imbal hasil sewa properti dengan cepat. Alat gratis dari cakra untuk agen dan calon pembeli di Indonesia.",
  keywords: ["kalkulator KPR", "simulasi cicilan KPR", "kalkulator properti", "imbal hasil sewa", "yield sewa properti"],
};

export default function Page() {
  return (
    <main>
      <section className="wrap" style={{ padding: "clamp(36px, 6vw, 72px) 0 20px", textAlign: "center" }}>
        <p className="hand gold" style={{ fontSize: "1.8rem", transform: "rotate(-2deg)", margin: 0, lineHeight: 1, display: "inline-block" }}>hitung dulu</p>
        <h1 className="display" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", fontWeight: 700, maxWidth: "20ch", margin: "12px auto 0" }}>
          Kalkulator properti.
        </h1>
        <p className="lead" style={{ margin: "16px auto 0", textAlign: "center" }}>
          Estimasi cicilan KPR dan imbal hasil sewa dalam hitungan detik — bantu calon pembeli mengambil keputusan dengan tenang.
        </p>
      </section>

      <section className="wrap" style={{ padding: "20px 0 12px" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Cicilan KPR</div>
        <KprCalc />
      </section>

      <section className="wrap" style={{ padding: "28px 0 12px" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Imbal hasil sewa</div>
        <RentalYield />
      </section>

      <section className="wrap" style={{ padding: "34px 0 84px" }}>
        <div className="card" style={{ padding: "clamp(28px, 5vw, 48px)", textAlign: "center", background: "var(--surface-2)", borderColor: "color-mix(in oklab, var(--brand) 22%, var(--line))" }}>
          <h2 className="display" style={{ fontSize: "clamp(1.6rem, 3vw, 2.3rem)", fontWeight: 700, margin: 0 }}>Butuh properti yang sesuai hitungan Anda?</h2>
          <p className="muted" style={{ margin: "10px auto 22px", maxWidth: "46ch", fontSize: "1.05rem" }}>Jelajahi listing atau bicara dengan agen cerdas yang paham angka.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/listing" className="btn btn-brand" style={{ fontSize: "1rem", padding: ".85rem 1.6rem" }}>Lihat listing</Link>
            <Link href="/contact" className="btn btn-ghost" style={{ fontSize: "1rem", padding: ".85rem 1.6rem" }}>Hubungi kami</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
