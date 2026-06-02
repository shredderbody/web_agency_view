import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: produces .next/standalone with a self-contained server.js
  // for a minimal Docker runtime image.
  output: "standalone",
  images: {
    // AVIF first (≈20-30% smaller than WebP), WebP fallback for older browsers.
    formats: ["image/avif", "image/webp"],
    // Optimised images are content-stable (keyed by source path) → cache them for
    // a year client-side. Default is 60s, which forces a re-fetch on every visit
    // and was the main source of load latency after a container redeploy.
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
