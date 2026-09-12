"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

function rp(n: number) { return "Rp " + Math.round(n).toLocaleString("id-ID"); }
function rpShort(n: number) {
  if (n >= 1e9) return "Rp " + (n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " M";
  if (n >= 1e6) return "Rp " + (n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 0 }) + " jt";
  return rp(n);
}

const UNIT_FAC: Record<string, number> = { M: 1e9, jt: 1e6 };
// Slider whose readout is tappable: tap the number to type an exact value on the keypad
// (units: "M" = miliar, "jt" = juta, "%", "thn"). Value stays clamped to the slider's range.
function Slider({ label, display, value, min, max, step, onChange, unit }: { label: string; display: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; unit?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const fac = unit && UNIT_FAC[unit] ? UNIT_FAC[unit] : 1;
  const toDraft = (v: number) => {
    const x = v / fac;
    if (unit === "M") return String(Number(x.toFixed(2)));
    if (unit === "jt") return String(Math.round(x));
    return String(x);
  };
  const commit = () => {
    const n = parseFloat(draft.replace(/[^0-9.]/g, ""));
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n * fac)));
    setEditing(false);
  };
  const suffix = unit === "M" ? "M" : unit === "jt" ? "jt" : unit === "%" ? "%" : unit === "thn" ? "thn" : "";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7, gap: 10 }}>
        <label className="muted" style={{ fontSize: ".92rem", fontWeight: 600 }}>{label}</label>
        {editing ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <input autoFocus inputMode="decimal" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
              style={{ width: fac > 1 ? 92 : 64, textAlign: "right", background: "var(--surface-2)", border: "1.5px solid var(--brand)", borderRadius: 8, padding: ".2rem .45rem", font: "inherit", fontSize: ".95rem", fontWeight: 700, color: "var(--ink)" }} />
            {suffix && <span className="muted" style={{ fontSize: ".85rem" }}>{suffix}</span>}
          </span>
        ) : (
          <button type="button" onClick={() => { setDraft(toDraft(value)); setEditing(true); }} className="mono" title="Ketuk untuk ketik angka"
            style={{ fontWeight: 700, color: "var(--ink)", background: "transparent", border: "none", borderBottom: "1.5px dashed var(--line-2)", cursor: "pointer", font: "inherit", padding: "0 0 1px" }}>{display}</button>
        )}
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)", cursor: "pointer" }} aria-label={label} />
    </div>
  );
}

export function KprCalc({ compact = false }: { compact?: boolean }) {
  const [harga, setHarga] = useState(2_000_000_000);
  const [dp, setDp] = useState(20);
  const [tenor, setTenor] = useState(15);
  const [bunga, setBunga] = useState(7.5);

  const { pinjaman, cicilan, totalBunga, totalBayar } = useMemo(() => {
    const pinjaman = harga * (1 - dp / 100);
    const r = bunga / 100 / 12;
    const n = tenor * 12;
    const cicilan = r === 0 ? pinjaman / n : (pinjaman * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalBayar = cicilan * n;
    return { pinjaman, cicilan, totalBunga: totalBayar - pinjaman, totalBayar };
  }, [harga, dp, tenor, bunga]);

  return (
    <div className="card kpr-grid" style={{ padding: "clamp(22px, 3vw, 34px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px, 4vw, 44px)", alignItems: "center" }}>
      <div style={{ display: "grid", gap: 20 }}>
        <Slider label="Harga properti" display={rpShort(harga)} value={harga} min={500_000_000} max={30_000_000_000} step={100_000_000} onChange={setHarga} unit="M" />
        <Slider label="Uang muka (DP)" display={`${dp}% · ${rpShort(harga * dp / 100)}`} value={dp} min={0} max={50} step={1} onChange={setDp} unit="%" />
        <Slider label="Tenor" display={`${tenor} tahun`} value={tenor} min={1} max={30} step={1} onChange={setTenor} unit="thn" />
        <Slider label="Suku bunga / tahun" display={`${bunga.toFixed(1)}%`} value={bunga} min={1} max={15} step={0.1} onChange={setBunga} unit="%" />
      </div>
      <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius)", padding: "clamp(22px, 3vw, 30px)", textAlign: "center" }}>
        <div className="muted" style={{ fontSize: ".92rem" }}>Estimasi cicilan / bulan</div>
        <div className="display mono" style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 700, color: "var(--brand)", lineHeight: 1.1, margin: "4px 0 18px" }}>{rp(cicilan)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "left" }}>
          {[["Pinjaman", pinjaman], ["Total bunga", totalBunga], ["Total bayar", totalBayar]].map(([l, v]) => (
            <div key={l as string}>
              <div className="muted" style={{ fontSize: ".74rem" }}>{l}</div>
              <div className="mono" style={{ fontWeight: 600, fontSize: ".92rem" }}>{rpShort(v as number)}</div>
            </div>
          ))}
        </div>
        {compact && (
          <Link href="/kalkulator" className="btn btn-brand" style={{ marginTop: 20, width: "100%", justifyContent: "center", padding: ".85rem" }}>Buka kalkulator lengkap →</Link>
        )}
        <p className="muted" style={{ fontSize: ".76rem", marginTop: 14 }}>Estimasi flat untuk ilustrasi. Suku bunga & skema bank dapat berbeda.</p>
      </div>
      <style>{`@media (max-width: 720px){ .kpr-grid{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

export function RentalYield() {
  const [harga, setHarga] = useState(3_000_000_000);
  const [sewa, setSewa] = useState(240_000_000);
  const [fee, setFee] = useState(10);
  const netSewa = sewa * (1 - fee / 100);
  const grossYield = harga > 0 ? (sewa / harga) * 100 : 0;
  const netYield = harga > 0 ? (netSewa / harga) * 100 : 0;
  const payback = netSewa > 0 ? harga / netSewa : 0;
  return (
    <div className="card kpr-grid" style={{ padding: "clamp(22px, 3vw, 34px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px, 4vw, 44px)", alignItems: "center" }}>
      <div style={{ display: "grid", gap: 20 }}>
        <Slider label="Harga properti" display={rpShort(harga)} value={harga} min={500_000_000} max={30_000_000_000} step={100_000_000} onChange={setHarga} unit="M" />
        <Slider label="Pendapatan sewa / tahun" display={rpShort(sewa)} value={sewa} min={10_000_000} max={2_000_000_000} step={10_000_000} onChange={setSewa} unit="jt" />
        <Slider label="Biaya manajemen" display={`${fee}% · ${rpShort(sewa * fee / 100)}/thn`} value={fee} min={0} max={30} step={1} onChange={setFee} unit="%" />
      </div>
      <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius)", padding: "clamp(22px, 3vw, 30px)", textAlign: "center" }}>
        <div className="muted" style={{ fontSize: ".92rem" }}>Imbal hasil bersih (net yield)</div>
        <div className="display mono" style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 700, color: "var(--jade)", lineHeight: 1.1, margin: "4px 0 18px" }}>{netYield.toFixed(1)}%<span style={{ fontSize: ".9rem", color: "var(--muted)" }}> / thn</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left" }}>
          <div><div className="muted" style={{ fontSize: ".74rem" }}>Gross yield</div><div className="mono" style={{ fontWeight: 600 }}>{grossYield.toFixed(1)}%</div></div>
          <div><div className="muted" style={{ fontSize: ".74rem" }}>Balik modal</div><div className="mono" style={{ fontWeight: 600 }}>{payback.toFixed(1)} tahun</div></div>
          <div><div className="muted" style={{ fontSize: ".74rem" }}>Sewa bersih / bulan</div><div className="mono" style={{ fontWeight: 600 }}>{rpShort(netSewa / 12)}</div></div>
          <div><div className="muted" style={{ fontSize: ".74rem" }}>Biaya manajemen</div><div className="mono" style={{ fontWeight: 600 }}>{rpShort(sewa * fee / 100)}/thn</div></div>
        </div>
        <p className="muted" style={{ fontSize: ".76rem", marginTop: 14 }}>Net setelah biaya manajemen; sebelum pajak & perawatan besar.</p>
      </div>
    </div>
  );
}
