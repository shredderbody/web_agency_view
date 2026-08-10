import type { Lang } from "../i18n";
import { CATEGORIES, PRODUCTS } from "./catalog.data";

/* ════════════════════════════════════════════════════════════════════════════
   Boutique Ines Garden — modèle de données.
   Alimenté par catalog.data.ts (76 fiches réelles scrapées sur ines-garden.com).
   ════════════════════════════════════════════════════════════════════════════ */

export type CategorySlug =
  | "vases-medicis"
  | "vasques-medicis"
  | "fontaines"
  | "statues"
  | "bacs-a-oranger"
  | "jardinieres"
  | "tetes-de-cheval"
  | "salons-de-jardin";

export type CategoryMeta = {
  slug: CategorySlug;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  hero: string;
  /** Images plein cadre (sans fond blanc) pour le carrousel des cartes collection. */
  gallery: string[];
  count: number;
  priceFrom: number;
  priceTo: number;
};

export type Product = {
  slug: string;
  id: string;
  category: CategorySlug;
  name: string;
  baseName: string;
  color: string;
  swatch: string;
  ref: string;
  price: number;
  height?: string;
  width?: string;
  footBase?: string;
  weight?: string;
  stock: number | null;
  description?: string;
  img?: string;
};

export { CATEGORIES, PRODUCTS };

/* ── Helpers ─────────────────────────────────────────────────────────────── */

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n) + " €";
}

export function categoryName(c: CategoryMeta, lang: Lang): string {
  return lang === "en" ? c.nameEn : c.name;
}
export function categoryTagline(c: CategoryMeta, lang: Lang): string {
  return lang === "en" ? c.taglineEn : c.tagline;
}
export function categoryDescription(c: CategoryMeta, lang: Lang): string {
  return lang === "en" ? c.descriptionEn : c.description;
}

export function getCategory(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function productsOf(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.category === slug).sort((a, b) => a.price - b.price);
}

export function getProduct(category: string, slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.category === category && p.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Produits liés : même catégorie, prix voisin, en excluant le produit courant. */
export function relatedProducts(p: Product, limit = 4): Product[] {
  return productsOf(p.category)
    .filter((x) => x.slug !== p.slug)
    .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
    .slice(0, limit);
}

/* Best-sellers pour la home : une belle pièce par famille, ordre éditorial.
   Sélection éditoriale de photos plein cadre (prises en jardin, sans fond
   blanc studio ni bandes blanches) pour préserver l'harmonie de la grille —
   les cartes produit affichent l'image en `object-fit: contain`, donc un
   cliché letterboxé laisserait des marges blanches. */
const FEATURED_SLUGS = [
  "46-vase-medicis-en-fonte-bronze-vert",
  "105-fontaine-en-fonte-bronze-vert",
  "78-vasque-medicis-en-fonte-bronze-marron",
  "111-statue-en-fonte-4-saisons-pierre",
  "81-bac-a-oranger-en-fonte-bronze-vert",
  "102-tete-de-cheval-en-fonte-bronze-vert",
  "99-jardiniere-en-fonte-bronze-vert",
  "80-salon-de-jardin-noir",
];

export function featuredProducts(): Product[] {
  return FEATURED_SLUGS.map((slug) => getProductBySlug(slug)).filter(Boolean) as Product[];
}

export const PRICE_MIN = Math.min(...PRODUCTS.map((p) => p.price));
export const PRICE_MAX = Math.max(...PRODUCTS.map((p) => p.price));

/** Toutes les finitions distinctes, pour les filtres. */
export function allColors(): { color: string; swatch: string }[] {
  const map = new Map<string, string>();
  for (const p of PRODUCTS) if (!map.has(p.color)) map.set(p.color, p.swatch);
  return [...map.entries()].map(([color, swatch]) => ({ color, swatch }));
}
