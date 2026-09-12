"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { publicConfig } from "@/lib/supabase";

// PWA-style bottom action bar, mobile only. Two persistent CTAs:
//  • Chat → cakra WhatsApp (number read from public_config `CAKRA_WHATSAPP`, admin-editable;
//    falls back to the /contact funnel until a number is set).
//  • Daftar Gratis → the free onboarding form.
// Hidden on app surfaces (demo/admin/auth/onboarding) where a marketing CTA doesn't belong.
const HIDE = ["/demo", "/s", "/admin", "/login", "/signup", "/onboarding"];
const WA_TEXT = "Halo cakra! Saya agen properti dan ingin tahu lebih lanjut tentang cakra.";
const WA_DEFAULT = "6285782060033"; // cakra WhatsApp; overridable via public_config CAKRA_WHATSAPP

function Ic({ d }: { d: string }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}

export function MobileCTA() {
  const pathname = usePathname();
  const [wa, setWa] = useState<string>(WA_DEFAULT);
  useEffect(() => {
    publicConfig("CAKRA_WHATSAPP").then((v) => { if (v) setWa(v.replace(/[^0-9]/g, "")); }).catch(() => {});
  }, []);

  const hidden = HIDE.some((h) => pathname === h || pathname.startsWith(h + "/"));
  if (hidden) return null;

  const chatHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(WA_TEXT)}` : "/contact";
  const chatExternal = Boolean(wa);

  return (
    <>
      <nav className="cakra-mcta" aria-label="Aksi cepat">
        <a
          href={chatHref}
          {...(chatExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="cakra-mcta-btn cakra-mcta-ghost"
        >
          <Ic d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.7 8.7 0 0 1-3.9-.9L3 20l1.1-5.2A8.3 8.3 0 0 1 3.3 11a8.4 8.4 0 0 1 8.5-8.4A8.4 8.4 0 0 1 21 11.5Z" />
          Chat
        </a>
        <Link href="/onboarding" className="cakra-mcta-btn cakra-mcta-brand">
          <Ic d="M12 5v14M5 12h14" />
          Daftar Gratis
        </Link>
      </nav>
      <style>{`
        .cakra-mcta{ display:none; }
        @media (max-width: 900px){
          .cakra-mcta{
            position:fixed; left:0; right:0; bottom:0; z-index:60;
            display:flex; gap:10px;
            padding:10px 16px calc(10px + env(safe-area-inset-bottom));
            background:color-mix(in oklab, var(--bg) 88%, transparent);
            backdrop-filter:blur(12px);
            border-top:1px solid var(--line);
          }
          .cakra-mcta-btn{
            flex:1; display:inline-flex; align-items:center; justify-content:center; gap:8px;
            height:52px; border-radius:14px; font:inherit; font-size:1.02rem; font-weight:600;
            text-decoration:none; cursor:pointer; transition:transform .12s ease;
          }
          .cakra-mcta-btn:active{ transform:scale(.97); }
          .cakra-mcta-ghost{ background:var(--surface); color:var(--ink); border:1.5px solid var(--line-2); }
          .cakra-mcta-brand{ background:var(--brand); color:#fff; border:1.5px solid transparent; box-shadow:0 6px 18px color-mix(in oklab, var(--brand) 32%, transparent); }
        }
      `}</style>
    </>
  );
}
