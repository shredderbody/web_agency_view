const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
    ],
  },
  /* L'espace de suivi a déménagé de `/espace/*` vers `/<slug>/admin` et
     `/admin`. Des liens et des codes ont déjà été transmis avec les anciennes
     adresses : elles redirigent définitivement (308), elles ne meurent pas.
     L'ordre compte — `/espace/:slug` attraperait `login` et `admin`. */
  async redirects() {
    return [
      { source: "/espace", destination: "/admin", permanent: true },
      { source: "/espace/login", destination: "/admin/login", permanent: true },
      { source: "/espace/admin", destination: "/admin", permanent: true },
      { source: "/espace/:slug", destination: "/:slug/admin", permanent: true },
    ];
  },

  // Les images locales (public/clients|characters|studio/*) sont servies en
  // statique via <Image unoptimized> ; on leur donne un cache long immuable pour
  // que les visites répétées soient instantanées (sinon public/ renvoie max-age=0).
  async headers() {
    return [
      {
        source: "/:dir(clients|characters|studio)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
