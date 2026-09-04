/* ════════════════════════════════════════════════════════════════════════════
   Le modèle d'un devis / d'une facture, et son ARITHMÉTIQUE — pure, sans I/O.

   Ce fichier est importé des DEUX côtés de la frontière :
     • le serveur (`documents.ts`) calcule les totaux qu'il stocke ;
     • l'éditeur, dans le navigateur, recalcule les mêmes à chaque frappe pour
       afficher le pied de document en direct.

   Le même code des deux côtés, sinon l'écran et la base finissent par ne plus
   dire la même chose — et c'est toujours l'utilisateur qui s'en aperçoit en
   premier, au pire moment.
   ════════════════════════════════════════════════════════════════════════════ */

import type { CurrencyCode } from "./money";

export type DocKind = "quote" | "invoice";

/** Vocabulaire commun ; un devis n'utilise pas `paid`, une facture pas `accepted`. */
export type DocStatus = "draft" | "sent" | "accepted" | "refused" | "paid" | "cancelled";

export type DocLineKind = "item" | "discount";

export type DocLine = {
  /** Identifiant local, stable le temps de l'édition (clé de rendu React). */
  id: string;
  kind: DocLineKind;
  label: string;
  desc?: string;
  /** Prestation : quantité et prix unitaire HT. Remise : ignorés. */
  qty: number;
  unit_price: number;
  /** Taux de taxe de la ligne, en points (20 = 20 %). */
  tax_rate: number;
  /** Remise : pourcentage appliqué au sous-total HT. */
  percent?: number;
};

export type DocClient = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
};

export type PortalDocument = {
  id: string;
  assistant_id: string;
  demo_slug: string | null;
  kind: DocKind;
  number: string;
  status: DocStatus;
  lang: "fr" | "en";
  currency: CurrencyCode;
  tax_label: string;
  issued_on: string;
  due_on: string | null;
  client: DocClient;
  customer_id: string | null;
  lines: DocLine[];
  total_ht: number;
  total_tax: number;
  total_ttc: number;
  notes: string | null;
  source_id: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

/* ── Totaux ──────────────────────────────────────────────────────────────────
   Une remise en pourcentage s'applique au sous-total HT, ET SE RÉPARTIT AU
   PRORATA sur chaque assiette de taxe. C'est le point qui demande de
   l'attention : sur un devis mêlant 10 % (repas) et 20 % (boissons), une remise
   de 10 % imputée en bloc sur une seule assiette fausserait la TVA due. Elle
   allège donc les deux dans la proportion exacte où elles pèsent.             */

export type TaxBucket = { rate: number; base: number; amount: number };

export type DocTotals = {
  /** HT avant remise — ce que valent les prestations seules. */
  subtotalHT: number;
  /** Montant total des remises, en positif. */
  discount: number;
  /** HT après remise : l'assiette réelle. */
  totalHT: number;
  taxes: TaxBucket[];
  totalTax: number;
  totalTTC: number;
};

/** Une ligne de prestation, en HT. Une remise ne compte pas ici. */
export function lineHT(line: DocLine): number {
  if (line.kind === "discount") return 0;
  const qty = Number.isFinite(line.qty) ? line.qty : 0;
  const price = Number.isFinite(line.unit_price) ? line.unit_price : 0;
  return qty * price;
}

/**
 * Le pied du document. `round` vient de la devise : l'euro compte les centimes,
 * la roupie indonésienne non.
 */
export function computeTotals(
  lines: DocLine[],
  round: (n: number) => number = (n) => Math.round(n * 100) / 100,
): DocTotals {
  // 1. Une assiette par taux, sur les seules prestations.
  const buckets = new Map<number, number>();
  let subtotalHT = 0;
  for (const line of lines) {
    if (line.kind === "discount") continue;
    const ht = lineHT(line);
    subtotalHT += ht;
    const rate = Number.isFinite(line.tax_rate) ? line.tax_rate : 0;
    buckets.set(rate, (buckets.get(rate) ?? 0) + ht);
  }

  // 2. Les remises, cumulées en pourcentage du sous-total.
  let discount = 0;
  for (const line of lines) {
    if (line.kind !== "discount") continue;
    const pct = Number.isFinite(line.percent ?? NaN) ? (line.percent as number) : 0;
    discount += (subtotalHT * pct) / 100;
  }
  if (discount > subtotalHT) discount = subtotalHT; // une remise ne crée pas de dette
  const ratio = subtotalHT > 0 ? (subtotalHT - discount) / subtotalHT : 1;

  // 3. Chaque assiette allégée dans la même proportion, puis taxée.
  const taxes: TaxBucket[] = [];
  let totalHT = 0;
  let totalTax = 0;
  for (const [rate, raw] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
    const base = round(raw * ratio);
    const amount = round((base * rate) / 100);
    if (base === 0 && amount === 0) continue;
    taxes.push({ rate, base, amount });
    totalHT += base;
    totalTax += amount;
  }

  return {
    subtotalHT: round(subtotalHT),
    discount: round(discount),
    totalHT: round(totalHT),
    taxes,
    totalTax: round(totalTax),
    totalTTC: round(totalHT + totalTax),
  };
}

/* ── Statuts ─────────────────────────────────────────────────────────────── */

/** Les statuts qu'un document de cette nature peut réellement prendre. */
export function statusesFor(kind: DocKind): DocStatus[] {
  return kind === "quote"
    ? ["draft", "sent", "accepted", "refused"]
    : ["draft", "sent", "paid", "cancelled"];
}

export const STATUS_LABEL: Record<"fr" | "en", Record<DocStatus, string>> = {
  fr: {
    draft: "Brouillon", sent: "Envoyé", accepted: "Accepté",
    refused: "Refusé", paid: "Payée", cancelled: "Annulé",
  },
  en: {
    draft: "Draft", sent: "Sent", accepted: "Accepted",
    refused: "Declined", paid: "Paid", cancelled: "Cancelled",
  },
};

/** Couleur de statut — reprend le vocabulaire réservé de `espace.css`. */
export const STATUS_TONE: Record<DocStatus, "ok" | "wait" | "bad" | "off"> = {
  draft: "off", sent: "wait", accepted: "ok", refused: "bad", paid: "ok", cancelled: "off",
};

/** Identifiant de ligne — `crypto.randomUUID` n'existe pas partout, ceci si. */
export function newLineId(): string {
  return `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
