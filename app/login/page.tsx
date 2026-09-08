import Link from "next/link";
import { CakraMark } from "@/components/CakraMark";

export default function Page() {
  return (
    <main className="wrap" style={{ minHeight: "72vh", display: "grid", placeContent: "center", padding: "60px 0" }}>
      <div className="card" style={{ padding: 34, width: "min(420px, 92vw)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <CakraMark />
          <span className="display" style={{ fontSize: "1.4rem", fontWeight: 600 }}>cakra</span>
        </div>
        <h1 className="display" style={{ fontSize: "1.9rem", margin: "8px 0 4px" }}>Selamat datang kembali</h1>
        <p className="muted" style={{ fontSize: ".92rem", margin: "0 0 20px" }}>Masuk untuk melanjutkan ke dashboard Anda.</p>
        <form style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="eyebrow">Email</span>
            <input className="cakra-input" type="email" placeholder="anda@email.com" />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="eyebrow">Kata sandi</span>
            <input className="cakra-input" type="password" placeholder="••••••••" />
          </label>
          <button className="btn btn-brand" style={{ justifyContent: "center", marginTop: 4 }} type="button">Masuk</button>
        </form>
        <p className="muted" style={{ fontSize: ".86rem", marginTop: 16, textAlign: "center" }}>
          Belum punya akun? <Link href="/signup" className="gold" style={{ textDecoration: "none" }}>Daftar gratis</Link>
        </p>
      </div>
      <style>{`.cakra-input{width:100%;background:var(--bg);border:1px solid var(--line-2);border-radius:10px;color:var(--ink);padding:.7rem .85rem;font:inherit;font-size:.95rem}
      .cakra-input::placeholder{color:var(--muted)} .cakra-input:focus-visible{outline:2px solid var(--brand);outline-offset:2px}`}</style>
    </main>
  );
}
