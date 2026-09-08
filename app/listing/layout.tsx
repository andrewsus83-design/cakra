import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listing Properti Premium — Jual & Sewa",
  description:
    "Jelajahi listing properti premium dari agen cakra — rumah, vila, apartemen, dan komersial. Setiap unit punya halaman & skor pencarian lokal (GEO) sendiri.",
  alternates: { canonical: "/listing" },
  openGraph: {
    title: "Listing Properti Premium — Jual & Sewa | cakra",
    description: "Jelajahi listing properti premium dari agen cakra, dengan filter lokasi, harga, dan status.",
    url: "https://cakra.xyz/listing",
  },
};

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
