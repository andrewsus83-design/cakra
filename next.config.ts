import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All routes are static — export plain HTML so any host serves them directly.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
