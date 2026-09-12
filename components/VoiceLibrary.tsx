"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { publicConfig, db, type SupaUser } from "@/lib/supabase";

// Voice-character UI backed by public_config.VOICE_CATALOG (seeded from ElevenLabs by the `voice` fn).
//  mode="catalog" — admin: browse ALL voices (preview only).
//  mode="pick"    — member: each agent is GIVEN a curated shortlist of 8 female + 8 male (stable per
//                   agent, persona-weighted, distinct across agents) and picks exactly 1 female + 1 male.
//                   The choice can be changed at most ONCE PER 30 DAYS per slot — so every agent builds a
//                   consistent, recognisable brand voice that fits their persona.
type Voice = { id: string; name: string; gender: string; accent: string; age: string; tone: string; use_case: string; preview: string; category: string };
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "");
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const OFFER = 8; // voices offered per gender

// FNV-1a — deterministic per (voice, agent) so the shortlist is stable on reload yet varies between agents.
const fnv = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

function curate(catalog: Voice[], agentId: string, personaKw: string[], gender: string, keepId?: string): Voice[] {
  const ranked = catalog.filter((v) => v.gender === gender).map((v) => {
    const hay = `${v.accent} ${v.tone} ${v.use_case} ${v.age}`.toLowerCase();
    const score = personaKw.reduce((a, w) => a + (hay.includes(w) ? 1 : 0), 0);
    const jitter = (fnv(`${v.id}|${agentId}`) % 10000) / 10000;
    return { v, rank: score * 3 + jitter };
  }).sort((a, b) => b.rank - a.rank);
  const out = ranked.slice(0, OFFER).map((x) => x.v);
  // Always include the agent's already-chosen voice, even if it wouldn't otherwise rank in the top 8.
  if (keepId && !out.some((v) => v.id === keepId)) { const k = catalog.find((v) => v.id === keepId); if (k) out.unshift(k); }
  return out;
}

export function VoiceLibrary({ mode = "catalog", user }: { mode?: "catalog" | "pick"; user?: SupaUser }) {
  const [catalog, setCatalog] = useState<Voice[]>([]);
  const [mine, setMine] = useState<any[]>([]);
  const [personaKw, setPersonaKw] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<"female" | "male">("female");
  const [q, setQ] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [changing, setChanging] = useState<"" | "female" | "male">("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    (async () => {
      try { const v = await publicConfig("VOICE_CATALOG"); setCatalog(v ? JSON.parse(v) : []); } catch {}
      if (mode === "pick" && user) {
        try { const r = await db("voices", { query: `agent_id=eq.${user.id}` }); setMine(Array.isArray(r) ? r : []); } catch {}
        try {
          const p = await db("profiles", { query: `id=eq.${user.id}&select=brand,onboarding` });
          const row = Array.isArray(p) ? p[0] : p;
          const bag = [row?.brand, ...Object.values(row?.onboarding || {})].filter((x) => typeof x === "string").join(" ").toLowerCase();
          setPersonaKw(Array.from(new Set(bag.split(/[^a-z]+/).filter((w) => w.length > 3))));
        } catch {}
      }
      setLoading(false);
    })();
    return () => { const a = audioRef.current; if (a) { try { a.pause(); a.src = ""; } catch {} } };
  }, []); // eslint-disable-line

  const play = (v: Voice) => {
    const a = audioRef.current; if (!a || !v.preview) return;
    if (playing === v.id) { a.pause(); setPlaying(null); return; }
    a.src = v.preview; setPlaying(v.id);
    a.play().catch(() => setPlaying((c) => (c === v.id ? null : c)));
  };

  const slotOf = (g: string) => mine.find((m) => m.gender === g);
  const cooldownDays = (row: any) => { if (!row?.changed_at) return 0; const left = COOLDOWN_MS - (Date.now() - new Date(row.changed_at).getTime()); return left > 0 ? Math.ceil(left / 86_400_000) : 0; };

  const offered = useMemo(() => {
    if (mode !== "pick" || !user) return [];
    return curate(catalog, user.id, personaKw, gender, slotOf(gender)?.provider_voice_id);
  }, [catalog, user, personaKw, gender, mine, mode]);

  // Commit a pick (INSERT) or a change (PATCH) for the given gender.
  const choose = async (v: Voice) => {
    if (mode !== "pick" || !user) return;
    const current = slotOf(v.gender);
    const desc = `${v.gender} · ${cap(v.accent)} · ${cap(v.tone || v.use_case)}`.replace(/ · $/, "");
    setBusy(v.id); setMsg(null);
    try {
      if (!current) {
        const row = await db("voices", { method: "POST", body: { agent_id: user.id, gender: v.gender, name: v.name, description: desc, provider: "elevenlabs", provider_voice_id: v.id, locked: true } });
        setMine((m) => [...m, Array.isArray(row) ? row[0] : row]);
        setMsg({ t: `Voice ${v.gender === "female" ? "perempuan" : "laki-laki"} tersimpan ✓`, ok: true });
      } else {
        if (cooldownDays(current) > 0) { setMsg({ t: `Voice ini baru bisa diganti dalam ${cooldownDays(current)} hari.`, ok: false }); return; }
        const row = await db("voices", { method: "PATCH", query: `id=eq.${current.id}`, body: { name: v.name, description: desc, provider_voice_id: v.id, changed_at: new Date().toISOString() } });
        const upd = Array.isArray(row) ? row[0] : row;
        setMine((m) => m.map((x) => (x.id === current.id ? upd : x)));
        setChanging("");
        setMsg({ t: "Voice diganti ✓ — berikutnya bisa diubah lagi dalam 30 hari.", ok: true });
      }
    } catch { setMsg({ t: "Gagal menyimpan. Coba lagi.", ok: false }); }
    finally { setBusy(null); }
  };

  const seg = (on: boolean): React.CSSProperties => ({ border: "none", cursor: "pointer", font: "inherit", fontWeight: 600, fontSize: ".82rem", padding: ".4rem .9rem", borderRadius: 999, background: on ? "var(--brand)" : "transparent", color: on ? "#fff" : "var(--muted)" });

  const PlayBtn = ({ v }: { v: Voice }) => {
    const on = playing === v.id;
    return (
      <button onClick={(e) => { e.stopPropagation(); play(v); }} aria-label={on ? "Jeda" : "Dengar"} disabled={!v.preview}
        style={{ width: 38, height: 38, flex: "none", borderRadius: "50%", border: "none", cursor: v.preview ? "pointer" : "not-allowed", display: "grid", placeItems: "center", background: on ? "var(--brand)" : "var(--ink)", color: "#fff", opacity: v.preview ? 1 : .4 }}>
        {on ? <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
            : <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>}
      </button>
    );
  };
  const metaLine = (v: Voice) => [v.gender === "female" ? "Perempuan" : v.gender === "male" ? "Laki-laki" : "", cap(v.accent), cap(v.tone || v.use_case)].filter(Boolean).join(" · ");

  const VoiceRow = ({ v, action }: { v: Voice; action?: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <PlayBtn v={v} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: ".9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</div>
        <div className="muted" style={{ fontSize: ".76rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{metaLine(v)}</div>
      </div>
      {action}
    </div>
  );

  if (loading) return <div className="muted" style={{ fontSize: ".9rem" }}>Memuat pustaka voice…</div>;
  if (!catalog.length) return <div className="card" style={{ padding: 26, textAlign: "center", color: "var(--muted)" }}>Pustaka voice sedang disiapkan — muncul otomatis saat selesai.</div>;

  // ---------------- ADMIN: full catalog, preview only ----------------
  if (mode === "catalog") {
    const filtered = catalog.filter((v) => (!q || `${v.name} ${v.accent} ${v.tone} ${v.use_case}`.toLowerCase().includes(q.toLowerCase())));
    const f = filtered.filter((v) => v.gender === "female"), m = filtered.filter((v) => v.gender === "male");
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <audio ref={audioRef} onEnded={() => setPlaying(null)} style={{ display: "none" }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / aksen / gaya…" style={{ font: "inherit", fontSize: ".84rem", padding: ".5rem .8rem", borderRadius: 10, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", flex: "1 1 220px", maxWidth: 320 }} />
          <span className="muted" style={{ fontSize: ".8rem" }}>{f.length} perempuan · {m.length} laki-laki</span>
        </div>
        {([["Perempuan", f], ["Laki-laki", m]] as const).map(([lbl, list]) => (
          <div key={lbl} style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted)" }}>{lbl} · {list.length}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
              {list.map((v) => <VoiceRow key={v.id} v={v} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---------------- MEMBER: curated shortlist, pick 1F + 1M ----------------
  const SlotCard = ({ g }: { g: "female" | "male" }) => {
    const row = slotOf(g);
    const v = row ? catalog.find((c) => c.id === row.provider_voice_id) : null;
    const days = cooldownDays(row);
    const label = g === "female" ? "Suara Perempuan" : "Suara Laki-laki";
    return (
      <div style={{ padding: 14, borderRadius: 14, background: row ? "color-mix(in oklab, var(--brand) 6%, var(--surface))" : "var(--surface-2)", border: `1px solid ${row ? "color-mix(in oklab, var(--brand) 30%, var(--line))" : "var(--line-2)"}` }}>
        <div style={{ fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted)", marginBottom: 8 }}>{label}</div>
        {row && v ? (
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <PlayBtn v={v} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: ".92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</div>
              <div className="muted" style={{ fontSize: ".74rem" }}>{days > 0 ? `🔒 Bisa diganti dalam ${days} hari` : "✓ Bisa diganti sekarang"}</div>
            </div>
            <button onClick={() => { setGender(g); setChanging(changing === g ? "" : g); setMsg(null); }} disabled={days > 0}
              style={{ flex: "none", font: "inherit", fontSize: ".78rem", fontWeight: 600, padding: ".42rem .8rem", borderRadius: 999, border: "1px solid var(--line-2)", background: "transparent", cursor: days > 0 ? "not-allowed" : "pointer", color: days > 0 ? "var(--muted)" : "var(--brand)", opacity: days > 0 ? .6 : 1 }}>
              {changing === g ? "Batal" : "Ganti"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span className="muted" style={{ fontSize: ".86rem" }}>Belum dipilih</span>
            <button onClick={() => setGender(g)} style={{ font: "inherit", fontSize: ".78rem", fontWeight: 600, padding: ".42rem .8rem", borderRadius: 999, border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer" }}>Pilih di bawah ↓</button>
          </div>
        )}
      </div>
    );
  };

  const curGender = changing || gender;
  const slot = slotOf(curGender);
  const slotDays = cooldownDays(slot);
  const chosenId = slot?.provider_voice_id;
  const filteredOffer = offered.filter((v) => (!q || `${v.name} ${v.accent} ${v.tone} ${v.use_case}`.toLowerCase().includes(q.toLowerCase())));
  const inChangeMode = !!(slot && changing === curGender);
  const listLocked = !!slot && !inChangeMode; // slot filled but not actively changing → shortlist is read-only

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} style={{ display: "none" }} />

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontWeight: 700 }}>Voice karakter Anda</div>
          <span style={{ fontSize: ".74rem", fontWeight: 700, padding: ".25rem .6rem", borderRadius: 999, background: "color-mix(in oklab, var(--brand) 14%, var(--surface))", color: "var(--brand)" }}>{mine.length} / 2 dipilih</span>
        </div>
        <p className="muted" style={{ fontSize: ".84rem", margin: "6px 0 0", lineHeight: 1.5 }}>Anda dikurasikan <b style={{ color: "var(--ink)" }}>{OFFER} suara perempuan + {OFFER} suara laki-laki</b> yang cocok dengan persona &amp; target pasar Anda. Pilih <b style={{ color: "var(--ink)" }}>1 perempuan + 1 laki-laki</b> — bisa diganti <b style={{ color: "var(--ink)" }}>1× setiap 30 hari</b> agar suara brand Anda konsisten dan khas.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="adm-2">
        <SlotCard g="female" /><SlotCard g="male" />
      </div>

      {msg && <p style={{ fontSize: ".82rem", margin: 0, color: msg.ok ? "var(--good)" : "var(--crit)" }}>{msg.t}</p>}

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: 3 }}>
            {([["female", "Perempuan"], ["male", "Laki-laki"]] as const).map(([id, l]) => (
              <button key={id} onClick={() => { setGender(id); if (changing && changing !== id) setChanging(""); }} style={seg(curGender === id)}>
                {l}{slotOf(id) ? " ✓" : ""}
              </button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari…" style={{ font: "inherit", fontSize: ".84rem", padding: ".5rem .8rem", borderRadius: 10, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", flex: "1 1 140px", maxWidth: 220 }} />
          <span className="muted" style={{ fontSize: ".8rem" }}>{filteredOffer.length} pilihan</span>
        </div>

        {inChangeMode && <p style={{ fontSize: ".8rem", margin: 0, color: "var(--brand)", fontWeight: 600 }}>Mode ganti — pilih pengganti dari shortlist Anda (berlaku 1× / 30 hari).</p>}
        {listLocked && slotDays === 0 && <p className="muted" style={{ fontSize: ".8rem", margin: 0 }}>Sudah memilih untuk {curGender === "female" ? "perempuan" : "laki-laki"}. Tekan “Ganti” di atas untuk memilih ulang.</p>}
        {listLocked && slotDays > 0 && <p className="muted" style={{ fontSize: ".8rem", margin: 0 }}>Terkunci — bisa diganti dalam {slotDays} hari.</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
          {filteredOffer.map((v) => {
            const isChosen = v.id === chosenId;
            const canAct = !listLocked && !isChosen && (!slot || inChangeMode) && slotDays === 0;
            return (
              <VoiceRow key={v.id} v={v}
                action={isChosen ? (
                  <span style={{ flex: "none", fontSize: ".68rem", fontWeight: 700, color: "var(--good)", display: "inline-flex", alignItems: "center", gap: 4 }}>✓ Terpilih</span>
                ) : (
                  <button onClick={() => choose(v)} disabled={!canAct || busy === v.id} className="btn btn-brand"
                    style={{ padding: ".45rem .85rem", fontSize: ".8rem", flex: "none", opacity: canAct && busy !== v.id ? 1 : .4, cursor: canAct ? "pointer" : "not-allowed" }}>
                    {busy === v.id ? "…" : inChangeMode ? "Ganti ke ini" : "Pilih"}
                  </button>
                )} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
