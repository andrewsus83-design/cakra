import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Serve the sample agent site (Kirana) at sample.cakra.xyz
        {
          source: "/",
          has: [{ type: "host", value: "sample.cakra.xyz" }],
          destination: "/demo",
        },
      ],
    };
  },
};

export default nextConfig;
