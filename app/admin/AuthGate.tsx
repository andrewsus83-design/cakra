"use client";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { auth, mfa, supabaseReady, currentAAL, isAdmin, type SupaUser } from "@/lib/supabase";
import { AuthShell, Accent, Title, Sub, Field, Input, CodeInput, Button, Banner } from "@/components/ui";

// Gates the app behind Supabase Auth using the shared design-system components (AuthShell/Field/Button…).
// Flow: password login → (TOTP if the user has/needs a factor) → app. Admins are forced to enroll an
// authenticator on first login; agents with a verified factor are challenged; others pass on password.
type Phase = "checking" | "login" | "forgot" | "enroll" | "challenge" | "authed";

function QR({ svg }: { svg: string }) {
  if (!svg) return null;
  const src = svg.startsWith("data:") ? svg : `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return <img src={src} alt="QR 2FA" width={186} height={186} style={{ background: "#fff", borderRadius: 10, padding: 8 }} />;
}

export function AuthGate({ children }: { children: (user: SupaUser, signOut: () => void) => ReactNode }) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [user, setUser] = useState<SupaUser | null>(null);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);
  const [enrollData, setEnrollData] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  const resolve = async (u: SupaUser) => {
    setUser(u); setErr(null);
    if (currentAAL() === "aal2") { setPhase("authed"); return; }
    let factors: any[] = [];
    try { factors = await mfa.listFactors(); } catch {}
    const verified = factors.find((f) => f.status === "verified" && f.factor_type === "totp");
    if (verified) { setFactorId(verified.id); setCode(""); setPhase("challenge"); return; }
    if (isAdmin(u.email)) {
      setPhase("enroll"); setEnrollData(null); setCode(""); setErr(null);
      try {
        for (const f of factors) { if (f.factor_type === "totp" && f.status !== "verified") await mfa.unenroll(f.id); }
        const e = await mfa.enroll(); setEnrollData(e); setFactorId(e.factorId);
      } catch (er: any) { setErr(er?.message || "Gagal menyiapkan 2FA."); }
      return;
    }
    setPhase("authed");
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const s = auth.getSession();
      if (s) { const r = await auth.refresh(); if (alive) { if (r) await resolve(r.user); else setPhase("login"); } }
      else if (alive) setPhase("login");
    })();
    return () => { alive = false; };
  }, []);

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault(); setErr(null); setNotice(null); setBusy(true);
    try {
      if (mode === "in") { const s = await auth.signIn(email.trim(), pw); await resolve(s.user); }
      else { const s = await auth.signUp(email.trim(), pw); if (s) await resolve(s.user); else { setNotice("Akun dibuat. Silakan masuk."); setMode("in"); } }
    } catch (e: any) { setErr(e?.message || "Terjadi kesalahan. Coba lagi."); }
    finally { setBusy(false); }
  };

  const submitCode = async (e: FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try { if (!factorId) throw new Error("Faktor tidak ditemukan. Muat ulang halaman."); const s = await mfa.verifyCode(factorId, code.trim()); setUser(s.user); setCode(""); setPhase("authed"); }
    catch (e: any) { setErr(e?.message || "Kode salah. Coba lagi."); }
    finally { setBusy(false); }
  };

  const submitForgot = async (e: FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try { await auth.recover(email.trim()); setForgotSent(true); }
    catch (e: any) { setErr(e?.message || "Gagal mengirim. Coba lagi."); }
    finally { setBusy(false); }
  };

  const signOut = () => { auth.signOut(); setUser(null); setEnrollData(null); setFactorId(null); setCode(""); setPw(""); setErr(null); setNotice(null); setForgotSent(false); setMode("in"); setPhase("login"); };

  if (phase === "checking") return <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "var(--bg)", color: "var(--muted)", fontSize: ".9rem" }}>Memuat…</div>;
  if (phase === "authed" && user) return <>{children(user, signOut)}</>;

  const keluar = <p className="muted" style={{ fontSize: ".86rem", marginTop: 18, textAlign: "center" }}><button onClick={signOut} className="gold" style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}>← Keluar</button></p>;

  let body: ReactNode;
  if (!supabaseReady) body = <p style={{ fontWeight: 700, textAlign: "center" }}>Konfigurasi Supabase belum tersedia.</p>;
  else if (phase === "challenge") body = (
    <>
      <Accent>satu langkah lagi</Accent>
      <Title>Verifikasi 2 langkah</Title>
      <Sub>Masukkan 6-digit kode dari aplikasi authenticator Anda.</Sub>
      <form onSubmit={submitCode} style={{ display: "grid", gap: 16 }}>
        <CodeInput value={code} onChange={setCode} autoFocus />
        {err && <Banner tone="error">{err}</Banner>}
        <Button type="submit" block loading={busy} disabled={code.length < 6} style={{ marginTop: 4, fontSize: "1.02rem" }}>{busy ? "Memverifikasi…" : "Verifikasi & masuk →"}</Button>
      </form>
      {keluar}
    </>
  );
  else if (phase === "enroll") body = (
    <>
      <Accent>keamanan admin</Accent>
      <Title>Aktifkan 2FA</Title>
      <Sub style={{ margin: "0 0 18px" }}>Pindai QR dengan Google Authenticator / Authy, lalu masukkan kodenya.</Sub>
      {enrollData ? (
        <>
          <div style={{ display: "grid", placeItems: "center", gap: 10, marginBottom: 16 }}>
            <QR svg={enrollData.qr} />
            <div className="muted" style={{ fontSize: ".72rem", textAlign: "center" }}>Tak bisa pindai? Masukkan kunci ini manual:</div>
            <code style={{ fontSize: ".76rem", wordBreak: "break-all", textAlign: "center", background: "var(--surface-2)", padding: "6px 10px", borderRadius: 8 }}>{enrollData.secret}</code>
          </div>
          <form onSubmit={submitCode} style={{ display: "grid", gap: 16 }}>
            <CodeInput value={code} onChange={setCode} />
            {err && <Banner tone="error">{err}</Banner>}
            <Button type="submit" block loading={busy} disabled={code.length < 6} style={{ marginTop: 4, fontSize: "1.02rem" }}>{busy ? "Mengaktifkan…" : "Aktifkan & masuk →"}</Button>
          </form>
        </>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {err ? <Banner tone="error">{err}</Banner> : <div className="muted" style={{ fontSize: ".9rem", textAlign: "center" }}>Menyiapkan…</div>}
          {err && user && <Button block onClick={() => resolve(user)}>Coba lagi</Button>}
        </div>
      )}
      {keluar}
    </>
  );
  else if (phase === "forgot") body = (
    <>
      <Accent>tenang</Accent>
      <Title>Reset kata sandi</Title>
      <Sub>Masukkan email terdaftar Anda — kami kirim link untuk membuat kata sandi baru.</Sub>
      {forgotSent ? (
        <div style={{ display: "grid", gap: 14 }}>
          <Banner tone="success">Jika email terdaftar, link reset sudah dikirim. Cek inbox &amp; folder spam.</Banner>
          <Button block onClick={() => { setPhase("login"); setForgotSent(false); setErr(null); }} style={{ fontSize: "1.02rem" }}>← Kembali ke masuk</Button>
        </div>
      ) : (
        <form onSubmit={submitForgot} style={{ display: "grid", gap: 16 }}>
          <Field label="Email"><Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="anda@email.com" /></Field>
          {err && <Banner tone="error">{err}</Banner>}
          <Button type="submit" block loading={busy} style={{ marginTop: 4, fontSize: "1.02rem" }}>{busy ? "Mengirim…" : "Kirim link reset →"}</Button>
        </form>
      )}
      <p className="muted" style={{ fontSize: ".86rem", marginTop: 18, textAlign: "center" }}><button onClick={() => { setPhase("login"); setErr(null); setForgotSent(false); }} className="gold" style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}>← Kembali ke masuk</button></p>
    </>
  );
  else body = (
    <>
      <Accent>{mode === "in" ? "selamat datang kembali" : "halo, calon juara"}</Accent>
      <Title>{mode === "in" ? "Masuk ke dashboard" : "Buat akun agen"}</Title>
      <Sub>{mode === "in" ? "Lanjutkan mengelola website, listing, dan konten Anda." : "Mulai bangun kehadiran digital Anda di cakra."}</Sub>
      <form onSubmit={submitLogin} style={{ display: "grid", gap: 16 }}>
        <Field label="Email"><Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="anda@email.com" /></Field>
        <Field label="Kata sandi"><Input type="password" required minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" /></Field>
        {err && <Banner tone="error">{err}</Banner>}
        {notice && <Banner tone="success">{notice}</Banner>}
        <Button type="submit" block loading={busy} style={{ marginTop: 4, fontSize: "1.02rem" }}>{busy ? "Memproses…" : mode === "in" ? "Masuk →" : "Buat akun →"}</Button>
      </form>
      <p className="muted" style={{ fontSize: ".8rem", textAlign: "center", marginTop: 12 }}>Data Anda milik Anda · aman &amp; tidak dijual</p>
      {mode === "in" && <p className="muted" style={{ fontSize: ".86rem", marginTop: 10, textAlign: "center" }}><button onClick={() => { setPhase("forgot"); setErr(null); setNotice(null); setForgotSent(false); }} className="gold" style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}>Lupa kata sandi?</button></p>}
      <p className="muted" style={{ fontSize: ".86rem", marginTop: 18, textAlign: "center" }}>
        {mode === "in" ? "Belum punya akun? " : "Sudah punya akun? "}
        <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(null); setNotice(null); }} className="gold" style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}>{mode === "in" ? "Daftar" : "Masuk"}</button>
      </p>
    </>
  );

  return <AuthShell>{body}</AuthShell>;
}
