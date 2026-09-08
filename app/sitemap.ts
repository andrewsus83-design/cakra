import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = "https://cakra.xyz";

// Public, indexable routes. /admin, /login, /signup, /onboarding, /demo are intentionally excluded.
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/tentang", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/harga", priority: 0.9, changeFrequency: "monthly" },
  { path: "/listing", priority: 0.7, changeFrequency: "weekly" },
  { path: "/kalkulator", priority: 0.7, changeFrequency: "monthly" },
  { path: "/hub", priority: 0.8, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-09");
  return ROUTES.map((r) => ({
    url: `${BASE}${r.path === "/" ? "" : r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
