import type { Metadata, Viewport } from "next";
import { Newsreader, Hanken_Grotesk, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileCTA } from "@/components/MobileCTA";

// viewport-fit=cover lets hero images bleed under the status bar in standalone (PWA) mode.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F2E9" },
    { media: "(prefers-color-scheme: dark)", color: "#17130D" },
  ],
};

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const sans = Hanken_Grotesk({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "600"] });
const hand = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["500", "600", "700"] });

const DESCRIPTION =
  "Platform kehadiran digital all-in-one untuk agen properti Indonesia: website AI, studio konten & video, manajemen listing, dan Skor Cakra (SEO, GEO, dan social search) — dalam satu roda yang terus berputar.";

export const metadata: Metadata = {
  metadataBase: new URL("https://cakra.xyz"),
  title: {
    default: "cakra — jadilah agen yang tak bisa diabaikan AI",
    template: "%s · cakra",
  },
  description: DESCRIPTION,
  applicationName: "cakra",
  category: "business",
  // Standalone PWA: translucent status bar so the hero image bleeds under the signal bar when idle.
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "cakra" },
  keywords: [
    "agen properti", "website agen properti", "kehadiran digital agen", "SEO properti",
    "GEO properti", "video listing AI", "konten properti otomatis", "properti Indonesia",
    "cakra", "platform agen properti",
  ],
  authors: [{ name: "cakra" }],
  creator: "cakra",
  publisher: "cakra",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://cakra.xyz",
    siteName: "cakra",
    title: "cakra — agen properti yang ditemukan Google & AI",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "cakra — agen properti yang ditemukan Google & AI",
    description: DESCRIPTION,
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://cakra.xyz/#organization",
      name: "cakra",
      url: "https://cakra.xyz",
      logo: "https://cakra.xyz/opengraph-image",
      slogan: "Jadilah agen yang tak bisa diabaikan AI.",
      description: DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": "https://cakra.xyz/#website",
      url: "https://cakra.xyz",
      name: "cakra",
      inLanguage: "id-ID",
      publisher: { "@id": "https://cakra.xyz/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://cakra.xyz/hub?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://cakra.xyz/#software",
      name: "cakra",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://cakra.xyz",
      description: DESCRIPTION,
      inLanguage: "id-ID",
      offers: {
        "@type": "Offer",
        price: "300000",
        priceCurrency: "IDR",
        description: "Paket Pro — langganan bulanan",
      },
      publisher: { "@id": "https://cakra.xyz/#organization" },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable} ${mono.variable} ${hand.variable}`}>
      <body>
        {/* Password-reset links may land anywhere (GoTrue falls back to site_url); bounce recovery/expiry to /reset. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var h=location.hash||'';if((h.indexOf('type=recovery')>-1||h.indexOf('error_code=otp_expired')>-1)&&location.pathname!=='/reset'){location.replace('/reset'+h);}}catch(e){}})();` }} />
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MGKTMBGG');` }} />
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MGKTMBGG" height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript>
        {/* End Google Tag Manager */}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');` }} />
          </>
        ) : null}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('cakra-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <SiteNav />
        {children}
        <SiteFooter />
        <MobileCTA />
      </body>
    </html>
  );
}
