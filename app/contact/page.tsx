"use client";
import { useState } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--surface)", border: "1.5px solid color-mix(in oklab, var(--ink) 55%, var(--line-2))",
  borderRadius: 12, color: "var(--ink)", padding: ".85rem 1.05rem", font: "inherit", fontSize: "1.02rem",
};

type Step = {
  key: string; q: string; sub?: string; type: "text" | "email" | "tel" | "textarea" | "choice" | "multi";
  ph?: string; optional?: boolean; options?: string[];
};

const BIZ_STEPS: Step[] = [
  { key: "perusahaan", q: "Apa nama perusahaan Anda?", type: "text", ph: "PT / CV / brand Anda" },
  { key: "pic", q: "Dengan siapa kami berbicara?", sub: "Nama penanggung jawab", type: "text", ph: "Nama PIC" },
  { key: "jabatan", q: "Apa jabatan Anda?", type: "text", ph: "mis. Marketing Manager", optional: true },
  { key: "email", q: "Email kantor Anda?", type: "email", ph: "nama@perusahaan.com" },
  { key: "telepon", q: "Nomor yang bisa dihubungi?", type: "tel", ph: "08xx / (021)…" },
  { key: "jenis", q: "Jenis bisnis Anda?", type: "choice", options: ["Developer", "Agensi properti", "Tim / broker", "Investor", "Lainnya"] },
  { key: "skala", q: "Berapa banyak agen atau unit?", type: "choice", options: ["1–10", "11–50", "51–200", "200+"] },
  { key: "lokasi", q: "Di kota mana Anda beroperasi?", type: "text", ph: "mis. Jakarta, Bali", optional: true },
  { key: "kebutuhan", q: "Apa yang paling Anda butuhkan?", sub: "Pilih satu atau lebih", type: "multi", options: ["Website & branding", "Video & konten AI", "Manajemen listing", "Integrasi tim agen", "SEO / GEO", "Lainnya"] },
  { key: "pesan", q: "Ada yang ingin Anda ceritakan?", type: "textarea", ph: "Tujuan, timeline, hal penting lain…", optional: true },
];

/* ── Typeform-style business flow ── */
function BizFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Record<string, string | string[]>>({});
  const [done, setDone] = useState(false);
  const s = BIZ_STEPS[step];
  const val = ans[s.key] ?? (s.type === "multi" ? [] : "");
  const filled = s.type === "multi" ? (val as string[]).length > 0 : String(val).trim().length > 0;
  const canNext = s.optional || filled;

  const set = (v: string | string[]) => setAns((p) => ({ ...p, [s.key]: v }));
  const next = () => { if (!canNext) return; if (step === BIZ_STEPS.length - 1) setDone(true); else setStep(step + 1); };
  const back = () => setStep((x) => Math.max(0, x - 1));
  const toggleMulti = (o: string) => { const cur = (val as string[]) || []; set(cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]); };

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 200, display: "flex", flexDirection: "column" }}>
      {/* progress + close */}
      <div style={{ height: 5, background: "var(--line)" }}>
        <div style={{ height: "100%", width: `${(done ? BIZ_STEPS.length : step) / BIZ_STEPS.length * 100}%`, background: "var(--brand)", transition: "width .3s" }} />
      </div>
      <button onClick={onClose} aria-label="Tutup" style={{ position: "absolute", top: 18, right: 20, width: 40, height: 40, borderRadius: 11, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "1.1rem", cursor: "pointer", zIndex: 2 }}>✕</button>
      <div style={{ position: "absolute", top: 22, left: 24, display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontWeight: 600 }}>
        <span className="hand gold" style={{ fontSize: "1.5rem" }}>cakra</span>
        <span style={{ fontSize: ".82rem" }}>· Form bisnis</span>
      </div>

      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "80px 24px 24px" }}>
        {done ? (
          <div style={{ textAlign: "center", maxWidth: "40ch" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 18px", borderRadius: "50%", display: "grid", placeItems: "center", background: "color-mix(in oklab, var(--good) 18%, var(--surface))", color: "var(--good)", fontSize: "1.8rem" }}>✓</div>
            <h2 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, margin: 0 }}>Terima kasih!</h2>
            <p className="muted" style={{ margin: "12px auto 24px", fontSize: "1.05rem" }}>Permintaan kemitraan Anda sudah kami terima. Tim cakra akan menghubungi Anda dalam 2 hari kerja.</p>
            <button onClick={onClose} className="btn btn-brand" style={{ padding: ".85rem 1.7rem", fontSize: "1rem" }}>Selesai</button>
          </div>
        ) : (
          <div key={s.key} style={{ width: "min(640px, 100%)", animation: "bizin .35s ease" }}>
            <div className="mono gold" style={{ fontSize: ".82rem", marginBottom: 12 }}>{step + 1} → {BIZ_STEPS.length}</div>
            <h2 className="display" style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, margin: 0 }}>{s.q}</h2>
            {s.sub && <p className="muted" style={{ marginTop: 8, fontSize: "1.05rem" }}>{s.sub}</p>}

            <div style={{ marginTop: 26 }}>
              {(s.type === "text" || s.type === "email" || s.type === "tel") && (
                <input autoFocus type={s.type} value={val as string} placeholder={s.ph} onChange={(e) => set(e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()}
                  style={{ ...inputStyle, fontSize: "1.3rem", padding: "1rem 1.1rem" }} />
              )}
              {s.type === "textarea" && (
                <textarea autoFocus rows={3} value={val as string} placeholder={s.ph} onChange={(e) => set(e.target.value)} style={{ ...inputStyle, fontSize: "1.2rem", resize: "vertical" }} />
              )}
              {s.type === "choice" && (
                <div style={{ display: "grid", gap: 10 }}>
                  {s.options!.map((o) => (
                    <button key={o} onClick={() => { set(o); setTimeout(next, 160); }} className="biz-opt" style={{ borderColor: val === o ? "var(--brand)" : "var(--line-2)", background: val === o ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "var(--surface)" }}>{o}</button>
                  ))}
                </div>
              )}
              {s.type === "multi" && (
                <div style={{ display: "grid", gap: 10 }}>
                  {s.options!.map((o) => {
                    const on = (val as string[]).includes(o);
                    return <button key={o} onClick={() => toggleMulti(o)} className="biz-opt" style={{ borderColor: on ? "var(--brand)" : "var(--line-2)", background: on ? "color-mix(in oklab, var(--brand) 12%, var(--surface))" : "var(--surface)" }}>{on ? "✓ " : ""}{o}</button>;
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 26 }}>
              <button onClick={next} disabled={!canNext} className="btn btn-brand" style={{ padding: ".8rem 1.6rem", fontSize: "1rem", opacity: canNext ? 1 : 0.5, cursor: canNext ? "pointer" : "not-allowed" }}>
                {step === BIZ_STEPS.length - 1 ? "Kirim" : "OK"} ✓
              </button>
              {(s.type === "text" || s.type === "email" || s.type === "tel") && <span className="muted" style={{ fontSize: ".85rem" }}>tekan <b>Enter ↵</b></span>}
              {s.optional && !filled && <button onClick={next} className="muted" style={{ background: "none", border: "none", cursor: "pointer", fontSize: ".9rem", textDecoration: "underline" }}>lewati</button>}
            </div>
          </div>
        )}
      </div>

      {/* nav */}
      {!done && (
        <div style={{ position: "fixed", bottom: 22, right: 22, display: "flex", gap: 8 }}>
          <button onClick={back} disabled={step === 0} aria-label="Sebelumnya" className="rail-btn" style={{ opacity: step === 0 ? 0.4 : 1 }}>↑</button>
          <button onClick={next} disabled={!canNext} aria-label="Berikutnya" className="rail-btn" style={{ opacity: canNext ? 1 : 0.4 }}>↓</button>
        </div>
      )}

      <style>{`
        @keyframes bizin{ from{ opacity:0; transform:translateY(14px); } to{ opacity:1; transform:none; } }
        .biz-opt{ text-align:left; font:inherit; font-size:1.08rem; font-weight:500; cursor:pointer; padding:.9rem 1.1rem; border-radius:12px; border:1.5px solid var(--line-2); color:var(--ink); transition:.15s; }
        .biz-opt:hover{ border-color:var(--brand); }
        .rail-btn{ width:42px; height:42px; border-radius:11px; border:1px solid var(--line-2); background:var(--surface); color:var(--ink); font-size:1.1rem; cursor:pointer; transition:.2s; }
        .rail-btn:hover{ border-color:var(--brand); color:var(--brand); }
      `}</style>
    </div>
  );
}

const WHO = [
  ["Balasan dalam 2 hari kerja.", "Setiap pesan dijawab manusia — bukan bot, bukan antrean outsourcing."],
  ["Tanpa spam, selamanya.", "Kami membalas sekali; Anda tidak akan dimasukkan ke daftar apa pun."],
  ["Data Anda aman.", "Email hanya kami pakai untuk membalas Anda, tidak dijual ke siapa pun."],
  ["Solusi untuk tim & skala.", "Developer, agensi, dan tim broker mendapat pendampingan menyeluruh."],
];

export default function Page() {
  const [sent, setSent] = useState(false);
  const [biz, setBiz] = useState(false);

  return (
    <main>
      {/* header */}
      <section className="wrap" style={{ padding: "clamp(40px, 6vw, 72px) 0 8px", textAlign: "center" }}>
        <h1 className="display" style={{ fontSize: "clamp(2.4rem, 5.4vw, 4rem)", fontWeight: 700, maxWidth: "20ch", margin: "0 auto", lineHeight: 1.06 }}>
          Hubungi kami — <span className="hand" style={{ color: "var(--brand)", fontWeight: 700, fontSize: "1.24em", lineHeight: 1 }}>balas dalam dua hari.</span>
        </h1>
        <p className="lead" style={{ margin: "18px auto 0", textAlign: "center" }}>
          Agen properti perorangan atau bisnis properti — tanpa nomor tiket, tanpa bot. Ceritakan yang ada di benak Anda.
        </p>
      </section>

      {/* two cards */}
      <section className="wrap" style={{ padding: "28px 0 88px" }}>
        <div className="ct-grid">
          {/* left — agent simple message */}
          <div className="ct-card">
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 10px" }}>
                <div style={{ width: 60, height: 60, margin: "0 auto 18px", borderRadius: "50%", display: "grid", placeItems: "center", background: "color-mix(in oklab, var(--good) 18%, var(--surface))", color: "var(--good)", fontSize: "1.7rem" }}>✓</div>
                <h2 className="display" style={{ fontSize: "1.7rem", fontWeight: 700, margin: 0 }}>Pesan terkirim!</h2>
                <p className="muted" style={{ margin: "10px auto 0", maxWidth: "36ch" }}>Kami balas dalam 2 hari kerja. Sementara itu, Anda bisa langsung mulai gratis.</p>
                <button onClick={() => setSent(false)} className="btn btn-ghost" style={{ marginTop: 20, padding: ".7rem 1.4rem" }}>Kirim lagi</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "grid", gap: 18 }}>
                <div>
                  <h2 className="display" style={{ fontSize: "1.7rem", fontWeight: 700, margin: 0 }}>Kirim pesan</h2>
                  <p className="muted" style={{ fontSize: ".98rem", marginTop: 6 }}>Isi ini dan langsung sampai ke tim cakra. Cocok untuk agen perorangan.</p>
                </div>
                <div><label className="ct-label">Nama Anda</label><input required style={inputStyle} placeholder="Nama, atau nama tim Anda" /></div>
                <div><label className="ct-label">Email Anda</label><input required type="email" style={inputStyle} placeholder="anda@email.com" /></div>
                <div><label className="ct-label">Pesan Anda</label><textarea required rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="Pertanyaan, ide, atau apa saja tentang cakra…" /></div>
                <button type="submit" className="btn btn-brand" style={{ padding: ".9rem 1.6rem", fontSize: "1.02rem", alignSelf: "start" }}>→ Kirim</button>
                <p className="mono" style={{ fontSize: ".76rem", color: "var(--muted)", margin: 0 }}>kami balas dalam 2 hari kerja · tanpa spam, selamanya</p>
              </form>
            )}
          </div>

          {/* right — who reads / business */}
          <div className="ct-card" style={{ background: "var(--surface-2)" }}>
            <h2 className="display" style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>Siapa yang membaca ini?</h2>
            <p className="muted" style={{ fontSize: ".98rem", marginTop: 6 }}>Orang sungguhan dari tim cakra — sesama orang properti.</p>
            <div style={{ margin: "18px 0" }}>
              {WHO.map(([h, d]) => (
                <div key={h} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ color: "var(--good)", fontWeight: 700, flex: "none" }}>✓</span>
                  <span style={{ fontSize: ".98rem", lineHeight: 1.5 }}><b>{h}</b> <span className="muted">{d}</span></span>
                </div>
              ))}
            </div>
            <h3 className="display" style={{ fontSize: "1.2rem", fontWeight: 700, margin: "18px 0 6px" }}>Bisnis properti & kemitraan</h3>
            <p className="muted" style={{ fontSize: ".98rem", margin: "0 0 16px", lineHeight: 1.6 }}>
              Developer, agensi, atau tim broker? Ceritakan kebutuhan Anda lewat form singkat — dijawab satu per satu, cepat, dan langsung ke tim kami.
            </p>
            <button onClick={() => setBiz(true)} className="btn" style={{ padding: ".85rem 1.5rem", fontSize: "1rem", background: "var(--ink)", color: "var(--bg)" }}>→ Mulai form bisnis</button>
          </div>
        </div>
      </section>

      {biz && <BizFlow onClose={() => setBiz(false)} />}

      <style>{`
        .ct-grid{ display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; }
        .ct-card{ padding:clamp(26px, 3.4vw, 42px); border-radius:22px; background:var(--surface);
          border:1.6px solid color-mix(in oklab, var(--ink) 60%, var(--line-2));
          box-shadow:5px 6px 0 rgba(33,26,17,.10), var(--shadow-soft); }
        .ct-label{ display:block; font-family:var(--font-mono), monospace; font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
        .hl{ background:color-mix(in oklab, var(--brand) 34%, transparent); border-radius:5px; padding:.02em .2em; box-decoration-break:clone; -webkit-box-decoration-break:clone; }
        @media (max-width: 820px){ .ct-grid{ grid-template-columns:1fr; } }
      `}</style>
    </main>
  );
}
