import Stripe from "stripe";

// Client Stripe partagé (côté serveur uniquement).
// La clé secrète vient de l'environnement — ne jamais l'exposer au client.
const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripeEnabled =
  process.env.STRIPE_ENABLED === "true" && Boolean(secretKey);

export const stripe = secretKey
  ? new Stripe(secretKey, { typescript: true })
  : (null as unknown as Stripe);

// ─── Catalogue des offres ────────────────────────────────────────────────────
// Chaque offre = un « fee » unique (mise en place) + un abonnement mensuel
// prélevé pendant SUBSCRIPTION_MONTHS mois, puis arrêté automatiquement.
export const SUBSCRIPTION_MONTHS = 24;
export const MONTHLY_AMOUNT_EUR = 49; // 49 €/mois

export type PlanId = "essentielle" | "atelier";

export const PLANS: Record<
  PlanId,
  { label: string; feeEur: number; monthlyEur: number }
> = {
  essentielle: { label: "Essentielle", feeEur: 490, monthlyEur: MONTHLY_AMOUNT_EUR },
  atelier: { label: "Atelier", feeEur: 990, monthlyEur: MONTHLY_AMOUNT_EUR },
};

export function isPlanId(value: unknown): value is PlanId {
  return value === "essentielle" || value === "atelier";
}
