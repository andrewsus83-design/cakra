import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak — Bicara dengan Tim cakra",
  description:
    "Hubungi cakra untuk agen properti atau kemitraan tim/agensi. Setiap pesan dijawab manusia, balasan dalam 2 hari kerja.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Kontak — Bicara dengan Tim cakra",
    description: "Hubungi cakra untuk agen properti atau kemitraan tim/agensi.",
    url: "https://cakra.xyz/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
