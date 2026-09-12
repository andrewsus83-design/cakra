import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope, Dancing_Script } from "next/font/google";
import SiteView, { agentStaticParams, agentMetadata } from "./SiteView";

const display = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--k-font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--k-font-body" });
const script = Dancing_Script({ subsets: ["latin"], weight: ["600", "700"], variable: "--k-font-script" });

// Indonesian (default) pre-rendered per-agent GEO page. Crawlable static HTML.
export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = agentStaticParams;

// Agent sites are always LIGHT — force a single light theme-color so the mobile status bar matches.
export const viewport: Viewport = { themeColor: "#F2F6F6", width: "device-width", initialScale: 1, viewportFit: "cover" };

export async function generateMetadata({ params }: { params: Promise<{ sub: string }> }): Promise<Metadata> {
  const { sub } = await params;
  return agentMetadata(sub, "id");
}

export default async function Page({ params }: { params: Promise<{ sub: string }> }) {
  const { sub } = await params;
  return (
    <div className={`${display.variable} ${body.variable} ${script.variable}`}>
      <SiteView sub={sub} lang="id" />
    </div>
  );
}
