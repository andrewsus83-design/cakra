import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hub cakra — Panduan Pasar, Video Listing & GEO untuk Agen Properti",
  description:
    "Wawasan pasar properti, ide pemasaran, panduan GEO, dan strategi konten untuk agen properti Indonesia — dari tim cakra.",
  alternates: { canonical: "/hub" },
  openGraph: {
    title: "Hub cakra — Panduan Pasar & Pemasaran untuk Agen Properti",
    description: "Wawasan pasar, ide pemasaran, dan panduan GEO untuk agen properti Indonesia.",
    url: "https://cakra.xyz/hub",
  },
};

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return children;
}
