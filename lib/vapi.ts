// Configuration de la bulle Vapi (chat + call hybride) par métier.
// Le widget <vapi-widget> n'accepte que des couleurs HEX : les valeurs ci-dessous
// sont la conversion sRGB des variables oklch du thème de chaque vitrine
// (cf. app/globals.css [data-vit="…"]) — garanties cohérentes avec la page.
//
// Les IDs d'assistant proviennent du .env (NEXT_PUBLIC_VAPI_ASSISTANT_*) avec un
// repli en dur pour rester fonctionnel même si l'env n'est pas injecté au build.
// Régénérer les assistants : `node scripts/vapi-setup-assistants.mjs`.

export type VapiTheme = "light" | "dark";

export type VapiAvatar = {
  /** Identifiant court (utile si un métier propose plusieurs avatars). */
  id: string;
  /** Chemin de l'image (dans /public), idéalement un portrait carré/3:4. */
  src: string;
  /** Texte alternatif. */
  alt: string;
};

export type VapiMetier = {
  /** ID de l'assistant inbound Vapi dédié au métier. */
  assistantId: string;
  /** Couleur d'accent = couleur de la page métier (bulle + bouton d'envoi). */
  accent: string;
  /** Fond du panneau de chat. */
  base: string;
  /** Couleur de l'icône dans la bulle flottante (contraste avec l'accent). */
  buttonIcon: string;
  theme: VapiTheme;
  /** Titre affiché en haut de la fenêtre de chat. */
  label: string;
  /**
   * Avatar(s) affiché(s) au-dessus de la bulle Vapi pour incarner l'assistant.
   * Le premier élément est l'avatar actif. Le tableau permet à un client de
   * proposer plusieurs avatars (ex: équipe, choix client) sans changer le type.
   */
  avatars?: VapiAvatar[];
};

const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "8e445673-5be9-4914-a75b-26c8005aa6f2";

export function vapiPublicKey() {
  return PUBLIC_KEY;
}

// Le drapeau d'affichage de la bulle est désormais lu AU RUNTIME depuis
// /config.json (cf. lib/runtime-config.ts), et non plus via
// NEXT_PUBLIC_VAPI_WIDGET_ENABLED (qui restait figé au build).

// slug (= clé d'URL /demo/[slug]) → config
const CONFIG: Record<string, VapiMetier> = {
  barbershop: {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_BARBERSHOP || "58575546-41ba-46d3-a3f1-a277cbe6538f",
    accent: "#dd9143",
    base: "#2e241e",
    buttonIcon: "#18130e",
    theme: "dark",
    label: "Maison Brutus",
    avatars: [
      { id: "barbier", src: "/characters/barbershop-portrait.webp", alt: "Barbier de Maison Brutus" },
    ],
  },
  // Client réel — Barbershop, Av. Marceau, Courbevoie (barbier Montassar).
  // Assistant Vapi DÉDIÉ (données réelles), couleurs charbon/or de la page
  // immersive (cf. components/BarberCourbevoie.tsx).
  "barbershop-courbevoie": {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_BARBERSHOP_COURBEVOIE || "4cee76d9-5147-41b1-bd3b-c2c83966fdd8",
    accent: "#d9a441",
    base: "#241f18",
    buttonIcon: "#17120c",
    theme: "dark",
    label: "Barbershop · Courbevoie",
  },
  // Client réel — L.A.K Nail Salon, 176 Lafayette St, New York (NoLita).
  // Assistant Vapi DÉDIÉ (données réelles Google Places), couleurs blush/plum
  // de la page immersive (cf. components/LakNailSalon.tsx).
  "lak-nail-salon": {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_LAK_NAIL_SALON || "e3f0641a-8860-49ae-b649-34fa8825cc72",
    accent: "#c43e7a",
    base: "#fefbfc",
    buttonIcon: "#ffffff",
    theme: "light",
    label: "L.A.K Nail Salon",
  },
  onglerie: {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ONGLERIE || "79cf70d2-266f-4315-b684-c67f5dac7004",
    accent: "#d56e7d",
    base: "#fffcfb",
    buttonIcon: "#ffffff",
    theme: "light",
    label: "L'Atelier Rosé",
    avatars: [
      { id: "prothesiste", src: "/characters/onglerie-portrait.webp", alt: "Prothésiste ongulaire de L'Atelier Rosé" },
    ],
  },
  traiteur: {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_TRAITEUR || "bbde8425-ff5f-42b4-9459-53ea6f5b2dfb",
    accent: "#a13029",
    base: "#fef9f3",
    buttonIcon: "#ffffff",
    theme: "light",
    label: "Maison Ferrand",
    avatars: [
      { id: "traiteur", src: "/characters/traiteur-portrait.webp", alt: "Traiteur de Maison Ferrand" },
    ],
  },
  restaurant: {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_RESTAURANT || "07cb9db8-9944-4708-b7f8-e78f7a1ad8ec",
    accent: "#ddb049",
    base: "#243226",
    buttonIcon: "#141d16",
    theme: "dark",
    label: "Le Comptoir 12",
    avatars: [
      { id: "cheffe", src: "/characters/restaurant-portrait.webp", alt: "Cheffe du Comptoir 12" },
    ],
  },
  // Client réel — Thaï Vien Express (Courbevoie). Assistant Vapi DÉDIÉ (données
  // réelles : nom, horaires, carte 10,50 €, voix MiniMax FR) — il se présente
  // bien au nom du restaurant thaï, plus du « Comptoir 12 ». Couleurs or/teck
  // de sa page immersive (cf. components/ThaiVienExpress.tsx).
  "thai-viens-express": {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_THAI_VIENS_EXPRESS || "5fc79895-d15a-4a71-869a-186f0aa91511",
    accent: "#e0a52e",
    base: "#2a221c",
    buttonIcon: "#15110d",
    theme: "dark",
    label: "Thaï Vien Express",
  },
  plombier: {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_PLOMBIER || "61b42505-e008-4912-9912-2d70a2c2d27e",
    accent: "#036eae",
    base: "#f9fcfe",
    buttonIcon: "#ffffff",
    theme: "light",
    label: "Plomberie Mercier",
    avatars: [
      { id: "plombier", src: "/characters/plombier-portrait.webp", alt: "Plombier de Plomberie Mercier" },
    ],
  },
};

export function getVapiMetier(slug: string): VapiMetier | null {
  return CONFIG[slug] ?? null;
}

/** Avatar actif pour un métier (premier élément de `avatars`), ou null si non défini. */
export function getVapiAvatar(slug: string): VapiAvatar | null {
  return CONFIG[slug]?.avatars?.[0] ?? null;
}
