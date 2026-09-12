import { cache } from "react";
import type { Metadata } from "next";
import AgentSiteServer from "./AgentSiteServer";

// Data layer for the pre-rendered per-agent GEO site. Fetches the agent's real persona +
// listings at BUILD time (static export), then hands them to AgentSiteServer which bakes the
// polished template — same design as /demo — into crawlable static HTML in one language.

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export type Lang = "id" | "en";

export async function rpc(fn: string, body: unknown): Promise<any> {
  if (!SUPA || !ANON) return null;
  try {
    const r = await fetch(`${SUPA}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export const getSite = cache(async (sub: string) => {
  const d = await rpc("public_agent_site", { p_key: sub });
  return d && d.found ? d : null;
});

export const getListings = cache(async (aid: string): Promise<any[]> => {
  if (!SUPA || !ANON || !aid) return [];
  try {
    const r = await fetch(`${SUPA}/rest/v1/listings?agent_id=eq.${encodeURIComponent(aid)}&status=in.(dijual,disewa)&order=created_at.asc&select=title,status,price_label,location,beds,baths,size_m2,images`, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
});

export async function agentStaticParams() {
  const subs = await rpc("public_agent_subdomains", {});
  return (Array.isArray(subs) ? subs : []).map((s: string) => ({ sub: String(s) }));
}

export async function agentMetadata(sub: string, lang: Lang): Promise<Metadata> {
  const d = await getSite(sub);
  const ad = d?.advertorial?.[lang] || d?.advertorial?.id || {};
  const name = d?.brand || d?.name || (lang === "en" ? "Property Agent" : "Agen Properti");
  const areas = (Array.isArray(d?.areas) ? d.areas.filter(Boolean) : []) as string[];
  const title = ad.meta_title || `${name} — ${areas.join(", ") || d?.city || ""}`.trim();
  const desc = ad.meta_description || ad.hero_sub || (lang === "en" ? `${name} — curated property in ${d?.city || "Indonesia"}.` : `${name} — properti pilihan di ${d?.city || "Indonesia"}.`);
  const idUrl = `https://${sub}.cakra.xyz/`;
  const enUrl = `https://${sub}.cakra.xyz/en`;
  const canonical = lang === "en" ? enUrl : idUrl;
  return {
    title,
    description: desc,
    keywords: ad.keywords,
    alternates: { canonical, languages: { "id-ID": idUrl, "en-US": enUrl } },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: { title, description: desc, url: canonical, type: "website", siteName: name, locale: lang === "en" ? "en_US" : "id_ID", images: d ? undefined : undefined },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function SiteView({ sub, lang }: { sub: string; lang: Lang }) {
  const d = await getSite(sub);
  if (!d) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", color: "#5E7178", padding: 24, textAlign: "center" }}>
        <p>{lang === "en" ? "Site is being prepared." : "Situs sedang disiapkan."}</p>
      </div>
    );
  }
  const listings = await getListings(d.aid);
  return <AgentSiteServer d={d} listings={listings} sub={sub} lang={lang} />;
}
