export type Demo = {
  slug: string;
  trade: string;          // métier
  business: string;       // nom de la vitrine fictive
  city: string;
  tagline: string;
  vit: "barber" | "onglerie" | "traiteur" | "resto";
  cover: string;          // image de couverture (scène)
  portrait: string;
  swatches: string[];     // 3 teintes représentatives (CSS colors)
  accentLabel: string;
};

export const DEMOS: Demo[] = [
  {
    slug: "barbershop",
    trade: "Barbier",
    business: "Maison Brutus",
    city: "Lyon 1er",
    tagline: "Coupe, taille de barbe et rasage à l'ancienne. La prise de rendez-vous se règle en deux gestes.",
    vit: "barber",
    cover: "/characters/barber-scene.webp",
    portrait: "/characters/barbershop-portrait.webp",
    swatches: ["oklch(0.19 0.012 60)", "oklch(0.72 0.13 64)", "oklch(0.6 0.17 35)"],
    accentLabel: "Sombre · laiton · braise",
  },
  {
    slug: "onglerie",
    trade: "Onglerie",
    business: "L'Atelier Rosé",
    city: "Bordeaux",
    tagline: "Pose gel, nail art et beauté des mains dans un écrin tout en douceur. Réservation en ligne 24h/24.",
    vit: "onglerie",
    cover: "/characters/onglerie-scene.webp",
    portrait: "/characters/onglerie-portrait.webp",
    swatches: ["oklch(0.975 0.012 20)", "oklch(0.66 0.13 12)", "oklch(0.78 0.09 60)"],
    accentLabel: "Blush · crème · rose-gold",
  },
  {
    slug: "traiteur",
    trade: "Charcutier-Traiteur",
    business: "Maison Ferrand",
    city: "Annecy",
    tagline: "Terrines maison, plateaux et commandes de fêtes. La carte se commande directement depuis le site.",
    vit: "traiteur",
    cover: "/characters/traiteur-scene.webp",
    portrait: "/characters/traiteur-portrait.webp",
    swatches: ["oklch(0.95 0.018 70)", "oklch(0.48 0.15 28)", "oklch(0.62 0.12 60)"],
    accentLabel: "Crème · lie-de-vin · terre cuite",
  },
  {
    slug: "restaurant",
    trade: "Restaurant · Bistrot",
    business: "Le Comptoir 12",
    city: "Paris 11e",
    tagline: "Cuisine de saison dans un bistrot de quartier. Menu, ambiance et réservation réunis au même endroit.",
    vit: "resto",
    cover: "/characters/restaurant-scene.webp",
    portrait: "/characters/restaurant-portrait.webp",
    swatches: ["oklch(0.22 0.02 150)", "oklch(0.78 0.13 85)", "oklch(0.7 0.1 150)"],
    accentLabel: "Vert nuit · bougie · sauge",
  },
];

export const getDemo = (slug: string) => DEMOS.find((d) => d.slug === slug);
