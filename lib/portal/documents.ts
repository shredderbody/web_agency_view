// ⚠️ MODULE SERVEUR UNIQUEMENT (passe par `lib/portal/supabase.ts`, service_role).
//    Les types et le calcul des totaux, eux, sont purs : ils sont ré-importés
//    côté client depuis `documents.shared.ts`.

import { select, insert, update, rest, q } from "./supabase";
import { roundMoney } from "./money";
import type { DemoTenant } from "./registry";
import {
  computeTotals, type DocClient, type DocKind, type DocLine, type DocStatus,
  type PortalDocument,
} from "./documents.shared";

/* ════════════════════════════════════════════════════════════════════════════
   Devis et factures : lecture, écriture, numérotation, conversion.

   Trois principes, tenus partout dans ce fichier :

   1. LES TOTAUX SONT CALCULÉS ICI, jamais reçus du navigateur. Le client envoie
      des lignes ; le serveur en tire le HT, la taxe et le TTC, et c'est ce
      qu'il stocke. Un total posté depuis une console ne devient pas une vérité
      comptable.

   2. LE NUMÉRO EST ATTRIBUÉ ICI. Séquence par tenant et par année, lue au
      moment de l'écriture. L'index unique `(assistant_id, number)` est le
      garde-fou : si deux créations se croisent, la seconde reprend un numéro.

   3. TOUTE ÉCRITURE LAISSE UNE TRACE dans `demo_actions`, le journal immuable
      déjà en place. Un devis émis est un fait de la vie du commerce, au même
      titre qu'un rendez-vous pris : il se lit dans le même fil.
   ════════════════════════════════════════════════════════════════════════════ */

const DOC_COLS =
  "id,assistant_id,demo_slug,kind,number,status,lang,currency,tax_label,issued_on,due_on," +
  "client,customer_id,lines,total_ht,total_tax,total_ttc,notes,source_id,sent_at,paid_at," +
  "created_at,updated_at";

/* ── Lectures ─────────────────────────────────────────────────────────────── */

/** Tous les documents d'une vitrine, du plus récent au plus ancien. */
export function listDocuments(assistantId: string, limit = 200): Promise<PortalDocument[]> {
  return select<PortalDocument>(
    "demo_documents",
    `select=${DOC_COLS}&assistant_id=eq.${q(assistantId)}&order=created_at.desc&limit=${limit}`,
  );
}

/** Vue administrateur : les documents de toutes les vitrines. */
export function listAllDocuments(limit = 400): Promise<PortalDocument[]> {
  return select<PortalDocument>(
    "demo_documents",
    `select=${DOC_COLS}&order=created_at.desc&limit=${limit}`,
  );
}

export async function getDocument(id: string): Promise<PortalDocument | null> {
  const rows = await select<PortalDocument>(
    "demo_documents",
    `select=${DOC_COLS}&id=eq.${q(id)}&limit=1`,
  );
  return rows[0] ?? null;
}

/* ── Numérotation ────────────────────────────────────────────────────────────
   `DEV-2026-0001`. Le préfixe dit la nature, l'année dit l'exercice, le rang
   repart à 1 chaque 1er janvier — c'est la convention qu'attend un comptable,
   et celle de `~/devis_app`.                                                   */

const PREFIX: Record<DocKind, string> = { quote: "DEV", invoice: "FAC" };

async function nextNumber(assistantId: string, kind: DocKind, year: number): Promise<string> {
  const stem = `${PREFIX[kind]}-${year}-`;
  // On demande le plus grand numéro de l'année, pas toute la table : le tri
  // lexicographique suffit puisque le rang est zéro-padded sur 4 chiffres.
  const rows = await select<{ number: string }>(
    "demo_documents",
    `select=number&assistant_id=eq.${q(assistantId)}&number=like.${q(`${stem}%`)}` +
      `&order=number.desc&limit=1`,
  );
  const last = rows[0]?.number;
  const rank = last ? Number(last.slice(stem.length)) : 0;
  const next = Number.isFinite(rank) ? rank + 1 : 1;
  return `${stem}${String(next).padStart(4, "0")}`;
}

/* ── Écriture ────────────────────────────────────────────────────────────── */

export type DocumentDraft = {
  kind: DocKind;
  lang: "fr" | "en";
  currency: PortalDocument["currency"];
  taxLabel: string;
  client: DocClient;
  customerId?: string | null;
  lines: DocLine[];
  notes?: string | null;
  issuedOn?: string;
  dueOn?: string | null;
  sourceId?: string | null;
  status?: DocStatus;
};

/** Ligne de journal — un fait de plus, jamais une modification. */
async function logAction(
  tenant: DemoTenant,
  doc: PortalDocument,
  action: string,
  note: string,
): Promise<void> {
  try {
    await insert("demo_actions", [
      {
        assistant_id: tenant.assistantId,
        demo_slug: tenant.slug,
        document_id: doc.id,
        customer_id: doc.customer_id,
        action,
        actor: "portal",
        actor_label: "Espace client",
        customer_name: doc.client?.name ?? null,
        customer_phone: doc.client?.phone ?? null,
        to_status: doc.status,
        note,
      },
    ]);
  } catch {
    // Le journal est un CONFORT DE SUIVI, pas une condition de validité du
    // document. Si la ligne d'action échoue (contrainte pas encore migrée sur
    // ce projet, par exemple), le devis existe quand même : on n'annule pas
    // une facture parce que son commentaire n'est pas passé.
  }
}

/** Crée un document, numéro attribué et totaux calculés côté serveur. */
export async function createDocument(
  tenant: DemoTenant,
  draft: DocumentDraft,
): Promise<PortalDocument> {
  const issuedOn = draft.issuedOn || new Date().toISOString().slice(0, 10);
  const year = Number(issuedOn.slice(0, 4));
  const totals = computeTotals(draft.lines, (n) => roundMoney(n, draft.currency));

  const row = {
    assistant_id: tenant.assistantId,
    demo_slug: tenant.slug,
    kind: draft.kind,
    status: draft.status ?? "draft",
    lang: draft.lang,
    currency: draft.currency,
    tax_label: draft.taxLabel,
    issued_on: issuedOn,
    due_on: draft.dueOn ?? null,
    client: draft.client,
    customer_id: draft.customerId ?? null,
    lines: draft.lines,
    total_ht: totals.totalHT,
    total_tax: totals.totalTax,
    total_ttc: totals.totalTTC,
    notes: draft.notes ?? null,
    source_id: draft.sourceId ?? null,
  };

  // Deux tentatives : l'index unique attrape une collision de numéro (deux
  // créations simultanées), on relit la séquence et on repart. Au-delà, c'est
  // autre chose qu'une course, et l'erreur doit remonter.
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const number = await nextNumber(tenant.assistantId, draft.kind, year);
      const [created] = await insert<PortalDocument>("demo_documents", [{ ...row, number }]);
      await logAction(
        tenant, created,
        draft.kind === "quote" ? "quote_issued" : "invoice_issued",
        `${draft.kind === "quote" ? "Devis" : "Facture"} ${created.number} créé`,
      );
      return created;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export type DocumentPatch = {
  client?: DocClient;
  customerId?: string | null;
  lines?: DocLine[];
  notes?: string | null;
  status?: DocStatus;
  dueOn?: string | null;
  issuedOn?: string;
};

/**
 * Met à jour un document. Les totaux sont recalculés dès que les lignes
 * bougent ; le numéro, la nature et le tenant, eux, ne changent jamais.
 */
export async function updateDocument(
  tenant: DemoTenant,
  doc: PortalDocument,
  patch: DocumentPatch,
): Promise<PortalDocument> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (patch.client) row.client = patch.client;
  if (patch.customerId !== undefined) row.customer_id = patch.customerId;
  if (patch.notes !== undefined) row.notes = patch.notes;
  if (patch.dueOn !== undefined) row.due_on = patch.dueOn;
  if (patch.issuedOn) row.issued_on = patch.issuedOn;

  if (patch.lines) {
    const totals = computeTotals(patch.lines, (n) => roundMoney(n, doc.currency));
    row.lines = patch.lines;
    row.total_ht = totals.totalHT;
    row.total_tax = totals.totalTax;
    row.total_ttc = totals.totalTTC;
  }

  if (patch.status && patch.status !== doc.status) {
    row.status = patch.status;
    if (patch.status === "sent") row.sent_at = new Date().toISOString();
    if (patch.status === "paid") row.paid_at = new Date().toISOString();
  }

  const [updated] = await update<PortalDocument>(
    "demo_documents",
    `id=eq.${q(doc.id)}&assistant_id=eq.${q(tenant.assistantId)}&select=${DOC_COLS}`,
    row,
  );

  // Un changement de statut est un FAIT : il entre au journal. Une correction
  // de ligne n'en est pas un — on ne consigne pas chaque frappe au clavier.
  if (patch.status && patch.status !== doc.status) {
    const verb: Record<string, string> = {
      sent: "quote_sent", accepted: "quote_accepted", refused: "quote_refused", paid: "invoice_paid",
    };
    const action = verb[patch.status];
    if (action) {
      await logAction(tenant, updated, action, `${updated.number} → ${patch.status}`);
    }
  }
  return updated;
}

export async function deleteDocument(tenant: DemoTenant, id: string): Promise<void> {
  await rest("demo_documents", {
    method: "DELETE",
    query: `id=eq.${q(id)}&assistant_id=eq.${q(tenant.assistantId)}`,
  });
}

/**
 * Convertit un devis en facture : une COPIE, avec son propre numéro, sa propre
 * échéance, et un lien vers le devis d'origine. Le devis reste tel quel — il
 * fait foi de ce qui a été proposé, la facture de ce qui est dû.
 */
export async function convertToInvoice(
  tenant: DemoTenant,
  quote: PortalDocument,
  paymentDays: number,
): Promise<PortalDocument> {
  const issuedOn = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + paymentDays * 86_400_000).toISOString().slice(0, 10);

  return createDocument(tenant, {
    kind: "invoice",
    lang: quote.lang,
    currency: quote.currency,
    taxLabel: quote.tax_label,
    client: quote.client,
    customerId: quote.customer_id,
    lines: quote.lines,
    notes: quote.notes,
    issuedOn,
    dueOn: due,
    sourceId: quote.id,
    status: "draft",
  });
}
