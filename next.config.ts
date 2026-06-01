import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: produces .next/standalone with a self-contained server.js
  // for a minimal Docker runtime image.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
