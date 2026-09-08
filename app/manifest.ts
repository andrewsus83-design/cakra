import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "cakra — kehadiran digital untuk agen properti",
    short_name: "cakra",
    description:
      "Platform kehadiran digital all-in-one untuk agen properti Indonesia: website AI, studio konten & video, manajemen listing, dan Skor Cakra (SEO, GEO, sosial).",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F2E9",
    theme_color: "#A9762B",
    lang: "id-ID",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
