const CENTRES: { k: string; v: number; c: string }[] = [
  { k: "Website", v: 82, c: "--c-crown" },
  { k: "Listing", v: 76, c: "--c-eye" },
  { k: "Konten", v: 68, c: "--c-throat" },
  { k: "SEO", v: 71, c: "--c-heart" },
  { k: "GEO", v: 64, c: "--c-solar" },
  { k: "Social", v: 59, c: "--c-sacral" },
  { k: "Reputasi", v: 73, c: "--c-root" },
];

export function PresenceCard({ score = 70 }: { score?: number }) {
  const R = 34;
  const C = 2 * Math.PI * R;
  const off = C * (1 - score / 100);
  return (
    <div className="card" style={{ padding: 26, width: "min(420px, 92vw)", background: "var(--surface)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, borderBottom: "1px solid var(--line)", paddingBottom: 18, marginBottom: 18 }}>
        <div style={{ position: "relative", width: 92, height: 92, flex: "none" }}>
          <svg viewBox="0 0 80 80" width="92" height="92">
            <circle cx="40" cy="40" r={R} fill="none" stroke="var(--line)" strokeWidth="7" />
            <circle cx="40" cy="40" r={R} fill="none" stroke="var(--brand)" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={off} transform="rotate(-90 40 40)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center" }}>
            <span className="mono" style={{ fontSize: "1.7rem", fontWeight: 600, lineHeight: 1 }}>{score}</span>
          </div>
        </div>
        <div>
          <div className="eyebrow">Presence Index</div>
          <div style={{ fontSize: "1.05rem", fontWeight: 600, marginTop: 4 }}>Kehadiran Anda kuat &amp; naik</div>
          <div className="mono" style={{ fontSize: ".82rem", color: "var(--good)", marginTop: 2 }}>▲ 6 poin minggu ini</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 11 }}>
        {CENTRES.map((c) => (
          <div key={c.k} style={{ display: "grid", gridTemplateColumns: "78px 1fr 34px", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: ".9rem", display: "flex", alignItems: "center", gap: 8 }}>
              <i style={{ width: 9, height: 9, borderRadius: 3, background: `var(${c.c})`, flex: "none" }} /> {c.k}
            </span>
            <span style={{ height: 8, borderRadius: 99, background: "var(--bg-2)", overflow: "hidden" }}>
              <i style={{ display: "block", height: "100%", width: `${c.v}%`, background: `var(${c.c})`, borderRadius: 99 }} />
            </span>
            <span className="mono" style={{ fontSize: ".82rem", textAlign: "right", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{c.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
