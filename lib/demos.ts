import type { Lang } from "./i18n";

export type DemoBase = {
  slug: string;
  business: string;
  city: string;
  vit: "barber" | "onglerie" | "traiteur" | "resto" | "plombier";
  cover: string;
  portrait: string;
  swatches: string[];
};

export const DEMO_BASE: DemoBase[] = [
  {
    slug: "barbershop",
    business: "Maison Brutus",
    city: "Lyon 1er",
    vit: "barber",
    cover: "/characters/barber-scene.webp",
    portrait: "/characters/barbershop-portrait.webp",
    swatches: ["oklch(0.19 0.012 60)", "oklch(0.72 0.13 64)", "oklch(0.6 0.17 35)"],
  },
  {
    slug: "onglerie",
    business: "L'Atelier Rosé",
    city: "Bordeaux",
    vit: "onglerie",
    cover: "/characters/onglerie-scene.webp",
    portrait: "/characters/onglerie-portrait.webp",
    swatches: ["oklch(0.975 0.012 20)", "oklch(0.66 0.13 12)", "oklch(0.78 0.09 60)"],
  },
  {
    slug: "traiteur",
    business: "Maison Ferrand",
    city: "Annecy",
    vit: "traiteur",
    cover: "/characters/traiteur-scene.webp",
    portrait: "/characters/traiteur-portrait.webp",
    swatches: ["oklch(0.95 0.018 70)", "oklch(0.48 0.15 28)", "oklch(0.62 0.12 60)"],
  },
  {
    slug: "restaurant",
    business: "Le Comptoir 12",
    city: "Paris 11e",
    vit: "resto",
    cover: "/characters/restaurant-scene.webp",
    portrait: "/characters/restaurant-portrait.webp",
    swatches: ["oklch(0.22 0.02 150)", "oklch(0.78 0.13 85)", "oklch(0.7 0.1 150)"],
  },
  {
    slug: "plombier",
    business: "Plomberie Mercier",
    city: "Nantes",
    vit: "plombier",
    cover: "/characters/plombier-scene.webp",
    portrait: "/characters/plombier-portrait.webp",
    swatches: ["oklch(0.97 0.008 230)", "oklch(0.52 0.13 245)", "oklch(0.66 0.11 50)"],
  },
];

type DemoText = { trade: string; tagline: string };

const DEMO_TEXT: Record<Lang, Record<string, DemoText>> = {
  fr: {
    barbershop: { trade: "Barbier", tagline: "Coupe, taille de barbe et rasage à l'ancienne. La prise de rendez-vous se règle en deux gestes." },
    onglerie: { trade: "Onglerie", tagline: "Pose gel, nail art et beauté des mains dans un écrin tout en douceur. Réservation en ligne 24h/24." },
    traiteur: { trade: "Charcutier-Traiteur", tagline: "Terrines maison, plateaux et commandes de fêtes. La carte se commande directement depuis le site." },
    restaurant: { trade: "Restaurant · Bistrot", tagline: "Cuisine de saison dans un bistrot de quartier. Menu, ambiance et réservation réunis au même endroit." },
    plombier: { trade: "Plombier · Chauffagiste", tagline: "Dépannage, rénovation de salle de bain et installation sanitaire. La demande de devis se fait directement depuis le site." },
  },
  en: {
    barbershop: { trade: "Barbershop", tagline: "Cuts, beard trims and old-school shaves. Booking is sorted in two taps." },
    onglerie: { trade: "Nail salon", tagline: "Gel, nail art and hand care in a soft, calming setting. Online booking, around the clock." },
    traiteur: { trade: "Deli · Caterer", tagline: "House terrines, platters and party orders. The menu is orderable straight from the site." },
    restaurant: { trade: "Restaurant · Bistro", tagline: "Seasonal cooking in a neighbourhood bistro. Menu, mood and booking in one place." },
    plombier: { trade: "Plumber · Heating engineer", tagline: "Repairs, bathroom renovation and sanitary installation. Quote requests go straight through the site." },
  },
};

export type Demo = DemoBase & DemoText;

export function getDemos(lang: Lang): Demo[] {
  return DEMO_BASE.map((d) => ({ ...d, ...DEMO_TEXT[lang][d.slug] }));
}
