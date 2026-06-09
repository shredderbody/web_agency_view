// Configuration de la bulle Vapi (chat + call hybride) par métier.
// Le widget <vapi-widget> n'accepte que des couleurs HEX : les valeurs ci-dessous
// sont la conversion sRGB des variables oklch du thème de chaque vitrine
// (cf. app/globals.css [data-vit="…"]) — garanties cohérentes avec la page.
//
// Les IDs d'assistant proviennent du .env (NEXT_PUBLIC_VAPI_ASSISTANT_*) avec un
// repli en dur pour rester fonctionnel même si l'env n'est pas injecté au build.
// Régénérer les assistants : `node scripts/vapi-setup-assistants.mjs`.

export type VapiTheme = "light" | "dark";

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
};

const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "8e445673-5be9-4914-a75b-26c8005aa6f2";

export function vapiPublicKey() {
  return PUBLIC_KEY;
}

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
  },
  onglerie: {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ONGLERIE || "79cf70d2-266f-4315-b684-c67f5dac7004",
    accent: "#d56e7d",
    base: "#fffcfb",
    buttonIcon: "#ffffff",
    theme: "light",
    label: "L'Atelier Rosé",
  },
  traiteur: {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_TRAITEUR || "bbde8425-ff5f-42b4-9459-53ea6f5b2dfb",
    accent: "#a13029",
    base: "#fef9f3",
    buttonIcon: "#ffffff",
    theme: "light",
    label: "Maison Ferrand",
  },
  restaurant: {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_RESTAURANT || "07cb9db8-9944-4708-b7f8-e78f7a1ad8ec",
    accent: "#ddb049",
    base: "#243226",
    buttonIcon: "#141d16",
    theme: "dark",
    label: "Le Comptoir 12",
  },
  plombier: {
    assistantId:
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_PLOMBIER || "61b42505-e008-4912-9912-2d70a2c2d27e",
    accent: "#036eae",
    base: "#f9fcfe",
    buttonIcon: "#ffffff",
    theme: "light",
    label: "Plomberie Mercier",
  },
};

export function getVapiMetier(slug: string): VapiMetier | null {
  return CONFIG[slug] ?? null;
}
