"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/supabase";
import { AuthShell, Accent, Title, Sub, Field, Input, Button, Banner } from "@/components/ui";

// Landing page for the password-reset email link. GoTrue redirects here with a recovery
// access-token in the URL hash (#access_token=…&type=recovery), or an error hash if the link
// expired. Reads the token and lets the user set a new password.
export default function ResetPage() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);   // access_token from the URL hash (legacy)
  const [qHash, setQHash] = useState<string | null>(null);   // token_hash from ?t= (Resend flow)
  const [linkErr, setLinkErr] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const t = new URL(window.location.href).searchParams.get("t");
      if (t) setQHash(t);
      const h = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
      const errCode = h.get("error_code") || h.get("error");
      const type = h.get("type");
      const at = h.get("access_token");
      if (type === "recovery" && at) setToken(at);
      else if (!t && errCode) setLinkErr(decodeURIComponent((h.get("error_description") || "Link reset tidak valid atau sudah kedaluwarsa.").replace(/\+/g, " ")));
    } catch {}
    setReady(true);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr(null);
    if (pw.length < 6) return setErr("Kata sandi minimal 6 karakter.");
    if (pw !== pw2) return setErr("Konfirmasi kata sandi tidak cocok.");
    if (!token && !qHash) return setErr("Token reset tidak ditemukan. Buka kembali link dari email Anda.");
    setBusy(true);
    try {
      const at = qHash ? await auth.verifyRecovery(qHash) : token!;
      await auth.updatePassword(at, pw);
      setDone(true);
      try { history.replaceState(null, "", window.location.pathname); } catch {}
    } catch (e: any) { setErr(e?.message || "Gagal memperbarui kata sandi."); }
    finally { setBusy(false); }
  };

  const backLink = (
    <p className="muted" style={{ fontSize: ".86rem", marginTop: 18, textAlign: "center" }}>
      <Link href="/login" className="gold" style={{ textDecoration: "none" }}>← Kembali ke halaman masuk</Link>
    </p>
  );

  let body;
  if (!ready) body = <div className="muted" style={{ textAlign: "center", fontSize: ".9rem" }}>Memuat…</div>;
  else if (done) body = (
    <>
      <Accent>berhasil</Accent>
      <Title>Kata sandi diperbarui</Title>
      <Sub>Kata sandi baru Anda sudah aktif. Silakan masuk untuk melanjutkan.</Sub>
      <Button block style={{ marginTop: 6, fontSize: "1.02rem" }} onClick={() => { window.location.href = "/login"; }}>Masuk →</Button>
    </>
  );
  else if (token || qHash) body = (
    <>
      <Accent>atur ulang</Accent>
      <Title>Buat kata sandi baru</Title>
      <Sub>Masukkan kata sandi baru untuk akun Anda.</Sub>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <Field label="Kata sandi baru"><Input type="password" required minLength={6} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" /></Field>
        <Field label="Ulangi kata sandi"><Input type="password" required minLength={6} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" /></Field>
        {err && <Banner tone="error">{err}</Banner>}
        <Button type="submit" block loading={busy} style={{ marginTop: 4, fontSize: "1.02rem" }}>{busy ? "Menyimpan…" : "Simpan & masuk →"}</Button>
      </form>
      {backLink}
    </>
  );
  else if (linkErr) body = (
    <>
      <Accent>maaf</Accent>
      <Title>Link tidak berlaku</Title>
      <Sub>{linkErr}</Sub>
      <Banner tone="error">Minta link baru lewat “Lupa kata sandi?” di halaman masuk.</Banner>
      {backLink}
    </>
  );
  else body = (
    <>
      <Accent>reset kata sandi</Accent>
      <Title>Buka lewat email</Title>
      <Sub>Halaman ini terbuka dari link reset di email Anda. Belum meminta? Minta di halaman masuk.</Sub>
      {backLink}
    </>
  );

  return <AuthShell>{body}</AuthShell>;
}
