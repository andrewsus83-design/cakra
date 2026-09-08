import type { Metadata } from "next";
import { Newsreader, Hanken_Grotesk, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const sans = Hanken_Grotesk({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "600"] });
const hand = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "cakra — jadilah agen yang tak bisa diabaikan AI",
  description:
    "Platform untuk agen properti modern: website sendiri, konten & video AI, listing, dan skor kehadiran di SEO, GEO, dan social search — dalam satu roda yang terus berputar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable} ${mono.variable} ${hand.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var h=location.hostname,p=location.pathname;if(h==='sample.cakra.xyz'&&(p==='/'||p===''))location.replace('/demo');else if(h==='member.cakra.xyz'&&(p==='/'||p===''))location.replace('/admin');}catch(e){}})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('cakra-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();` }} />
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
