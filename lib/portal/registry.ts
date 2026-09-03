/* ════════════════════════════════════════════════════════════════════════════
   Registre des démos vu par l'ESPACE DE SUIVI (/<slug>/admin).

   Une seule source de vérité pour : le slug d'URL, l'enseigne affichée, le
   métier, et surtout la CLÉ DE TENANT — l'`assistant_id` Vapi, la même que
   celle de `public.demo_bookings` (cf. supabase/migrations/003) et de la data
   table n8n `practitioner_initialization`.

   Les IDs sont lus depuis le `.env` (`NEXT_PUBLIC_VAPI_ASSISTANT_*`) avec le
   même repli en dur que `lib/vapi.ts` : l'espace reste fonctionnel même si
   l'env n'est pas injecté. Ajouter une démo = ajouter une entrée ici.
   ════════════════════════════════════════════════════════════════════════════ */

/** Nature de la demande que l'assistant enregistre pour ce métier. */
export type DemoKind = "rendezvous" | "reservation" | "commande" | "intervention";

export type DemoTenant = {
  /** Clé d'URL : /demo/<slug> côté public, /<slug>/admin côté suivi. */
  slug: string;
  /** Enseigne affichée dans l'espace. */
  business: string;
  /** Métier, en clair. */
  trade: string;
  city: string;
  /** CLÉ DE TENANT : id de l'assistant Vapi dédié. */
  assistantId: string;
  /** Ce que l'assistant pose : pilote le vocabulaire de l'interface. */
  kind: DemoKind;
  /** Accent de la vitrine (HEX), repris en pastille dans l'espace admin. */
  accent: string;
  /** Démo bâtie sur les données réelles d'un vrai commerce ? */
  real: boolean;
  /**
   * Fuseau du COMMERCE, pas du navigateur. Un créneau dicté « 19h » à Bali est
   * 19h à Bali : le calendrier de l'espace doit l'afficher tel quel, même
   * consulté depuis Paris. Sert aussi à interpréter les dates dictées.
   */
  timezone: string;
  /** Indicatif pays pour normaliser les téléphones en E.164 (lib/portal/phone.ts). */
  dialCode: string;
};

const env = (k: string, fallback: string) => process.env[k] || fallback;

export const DEMO_TENANTS: DemoTenant[] = [
  // ── Vitrines génériques (commerces fictifs, une par métier) ────────────────
  {
    slug: "barbershop", business: "Maison Brutus", trade: "Barbier", city: "Lyon 1er",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_BARBERSHOP", "58575546-41ba-46d3-a3f1-a277cbe6538f"),
    kind: "rendezvous", accent: "#dd9143", real: false, timezone: "Europe/Paris", dialCode: "+33",
  },
  {
    slug: "onglerie", business: "L'Atelier Rosé", trade: "Onglerie", city: "Bordeaux",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_ONGLERIE", "79cf70d2-266f-4315-b684-c67f5dac7004"),
    kind: "rendezvous", accent: "#d56e7d", real: false, timezone: "Europe/Paris", dialCode: "+33",
  },
  {
    slug: "traiteur", business: "Maison Ferrand", trade: "Charcutier-Traiteur", city: "Annecy",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_TRAITEUR", "bbde8425-ff5f-42b4-9459-53ea6f5b2dfb"),
    kind: "commande", accent: "#a13029", real: false, timezone: "Europe/Paris", dialCode: "+33",
  },
  {
    slug: "restaurant", business: "Le Comptoir 12", trade: "Restaurant · Bistrot", city: "Paris 11e",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_RESTAURANT", "07cb9db8-9944-4708-b7f8-e78f7a1ad8ec"),
    kind: "reservation", accent: "#ddb049", real: false, timezone: "Europe/Paris", dialCode: "+33",
  },
  {
    slug: "plombier", business: "Plomberie Mercier", trade: "Plombier · Chauffagiste", city: "Nantes",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_PLOMBIER", "61b42505-e008-4912-9912-2d70a2c2d27e"),
    kind: "intervention", accent: "#036eae", real: false, timezone: "Europe/Paris", dialCode: "+33",
  },

  // ── Démos bâties sur les données réelles d'un commerce existant ────────────
  {
    slug: "barbershop-courbevoie", business: "Barbershop Courbevoie", trade: "Barbier", city: "Courbevoie",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_BARBERSHOP_COURBEVOIE", "4cee76d9-5147-41b1-bd3b-c2c83966fdd8"),
    kind: "rendezvous", accent: "#d9a441", real: true, timezone: "Europe/Paris", dialCode: "+33",
  },
  {
    slug: "lak-nail-salon", business: "L.A.K Nail Salon", trade: "Onglerie", city: "New York · NoLita",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_LAK_NAIL_SALON", "e3f0641a-8860-49ae-b649-34fa8825cc72"),
    kind: "rendezvous", accent: "#c43e7a", real: true, timezone: "America/New_York", dialCode: "+1",
  },
  {
    slug: "thai-viens-express", business: "Thaï Vien Express", trade: "Restaurant thaï", city: "Courbevoie",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_THAI_VIENS_EXPRESS", "5fc79895-d15a-4a71-869a-186f0aa91511"),
    kind: "reservation", accent: "#e0a52e", real: true, timezone: "Europe/Paris", dialCode: "+33",
  },
  {
    slug: "texas-plumbing-pros", business: "Texas Plumbing Pros", trade: "Plombier", city: "Gun Barrel City · TX",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_TEXAS_PLUMBING_PROS", "fc5b038f-ac4e-4ac8-a75f-fdca2364c2ca"),
    kind: "intervention", accent: "#2a5fb0", real: true, timezone: "America/Chicago", dialCode: "+1",
  },
  {
    slug: "openhouse-canggu", business: "Open House Café", trade: "Café · Restaurant", city: "Pererenan · Canggu",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_OPENHOUSE_CANGGU", "da471536-e59a-4435-bfbe-ba35975f3913"),
    kind: "reservation", accent: "#3c8159", real: true, timezone: "Asia/Makassar", dialCode: "+62",
  },
  {
    slug: "ines-garden", business: "Ines Garden", trade: "Ornements de jardin en fonte", city: "Chalezeule · Doubs",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_INES_GARDEN", "ec3f1db3-457a-4461-908b-0b8f065d7ec8"),
    kind: "commande", accent: "#3f5f53", real: true, timezone: "Europe/Paris", dialCode: "+33",
  },
  {
    slug: "maison-ephemere", business: "Maison Éphémère", trade: "Wedding & event planner", city: "Paris · Le Marais",
    assistantId: env("NEXT_PUBLIC_VAPI_ASSISTANT_MAISON_EPHEMERE", "84f52726-b480-4fc4-800e-2b8f759aa0ec"),
    kind: "rendezvous", accent: "#5b7d65", real: false, timezone: "Europe/Paris", dialCode: "+33",
  },
];

export const ADMIN_SLUG = "admin";

export function getTenant(slug: string): DemoTenant | null {
  return DEMO_TENANTS.find((d) => d.slug === slug) ?? null;
}

export function getTenantByAssistant(assistantId: string): DemoTenant | null {
  return DEMO_TENANTS.find((d) => d.assistantId === assistantId) ?? null;
}

/** Vocabulaire d'interface par nature de demande (l'espace parle le métier). */
export const KIND_LABEL: Record<DemoKind, { one: string; many: string; verb: string }> = {
  rendezvous:   { one: "Rendez-vous", many: "Rendez-vous",   verb: "pris" },
  reservation:  { one: "Réservation", many: "Réservations",  verb: "prise" },
  commande:     { one: "Commande",    many: "Commandes",     verb: "passée" },
  intervention: { one: "Intervention", many: "Interventions", verb: "planifiée" },
};
