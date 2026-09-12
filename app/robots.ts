import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// A GEO product must be readable by AI answer engines — welcome them explicitly.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          "*",
          "Googlebot",
          "Bingbot",
          "GPTBot", // OpenAI / ChatGPT
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Claude-Web",
          "Google-Extended", // Gemini / AI Overviews
          "CCBot", // Common Crawl (feeds many LLMs)
          "Applebot-Extended",
        ],
        allow: "/",
        // /pitch = PRIVATE prospect preview (token-gated + noindex) — must never be indexed by any engine or AI bot.
        disallow: ["/admin", "/onboarding", "/login", "/signup", "/pitch", "/preview"],
      },
    ],
    sitemap: "https://cakra.xyz/sitemap.xml",
    host: "https://cakra.xyz",
  };
}
