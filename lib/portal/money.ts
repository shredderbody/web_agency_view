/* ════════════════════════════════════════════════════════════════════════════
   LA MONNAIE — trois fonctions pures, et rien d'autre.

   Ce fichier existe pour une raison précise : l'éditeur de devis tourne DANS LE
   NAVIGATEUR et doit afficher des montants formatés à chaque frappe. Or
   `issuer.ts`, où ces fonctions vivaient d'abord, importe en tête de fichier le
   contenu des sept vitrines réelles (`FACTS`, `VIT_BASE`) pour composer
   l'identité de l'émetteur. Importer `formatMoney` depuis là aurait fait
   voyager toute la carte du restaurant thaï jusqu'au navigateur d'un barbier
   lyonnais, pour afficher « 28,00 € ».

   `issuer.ts` ré-exporte ces trois-là : rien à changer côté serveur.
   ════════════════════════════════════════════════════════════════════════════ */

/** Trois devises seulement, parce que douze vitrines n'en utilisent que trois. */
export type CurrencyCode = "EUR" | "USD" | "IDR";

type CurrencySpec = { code: CurrencyCode; locale: string; fractionDigits: number };

/* Le `fractionDigits` compte : afficher « Rp 95 000,00 » est un contresens
   local, la roupie ne se découpe pas. */
const CURRENCIES: Record<CurrencyCode, CurrencySpec> = {
  EUR: { code: "EUR", locale: "fr-FR", fractionDigits: 2 },
  USD: { code: "USD", locale: "en-US", fractionDigits: 2 },
  IDR: { code: "IDR", locale: "id-ID", fractionDigits: 0 },
};

/** Montant → chaîne affichable, dans la devise du commerce. */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  const spec = CURRENCIES[currency];
  return new Intl.NumberFormat(spec.locale, {
    style: "currency",
    currency: spec.code,
    minimumFractionDigits: spec.fractionDigits,
    maximumFractionDigits: spec.fractionDigits,
  }).format(amount);
}

/** Arrondi comptable : on ne traîne jamais de centièmes de centime. */
export function roundMoney(amount: number, currency: CurrencyCode): number {
  const p = CURRENCIES[currency].fractionDigits === 0 ? 1 : 100;
  return Math.round(amount * p) / p;
}

/** Le pas d'un champ de saisie de prix — 1 pour la roupie, 0,01 ailleurs. */
export function moneyStep(currency: CurrencyCode): number {
  return CURRENCIES[currency].fractionDigits === 0 ? 1 : 0.01;
}
