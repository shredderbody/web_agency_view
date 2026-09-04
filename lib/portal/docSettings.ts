// ⚠️ MODULE SERVEUR UNIQUEMENT.

import { select, upsert, q } from "./supabase";
import { issuerFor, type Issuer } from "./issuer";
import type { DemoTenant } from "./registry";
import type { Lang } from "../i18n";

/* ════════════════════════════════════════════════════════════════════════════
   LES RÉGLAGES DE L'ÉMETTEUR — des SURCHARGES, pas un remplacement.

   L'identité imprimée en tête de document reste dérivée de la vitrine
   (`issuer.ts`) : c'était la demande d'origine, « les informations natives de la
   société de la page », et c'est ce qui fait qu'un devis est utilisable sans
   avoir rien saisi.

   Ce module ajoute ce qu'une page vitrine n'a aucune raison de dire mais qu'un
   document comptable réclame : un SIRET, un numéro de TVA, un IBAN, un délai de
   paiement négocié, une assurance décennale, des mentions de bas de page.

   RÈGLE : un champ vide retombe sur la vitrine. On n'écrase jamais l'identité
   dérivée avec du vide — quelqu'un qui efface son adresse dans les réglages
   veut revenir à celle de sa page, pas imprimer un document sans adresse.
   ════════════════════════════════════════════════════════════════════════════ */

export type DocSettings = {
  assistant_id: string;
  demo_slug: string | null;
  company_name: string | null;
  legal_form: string | null;
  siret: string | null;
  vat_number: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  iban: string | null;
  bic: string | null;
  payment_method: string | null;
  payment_days: number | null;
  validity_days: number | null;
  tax_rate_default: number | null;
  footer_notes: string | null;
  insurance_label: string | null;
  insurance_detail: string | null;
  created_at: string;
  updated_at: string;
};

const COLS =
  "assistant_id,demo_slug,company_name,legal_form,siret,vat_number,address,postal_code,city," +
  "country,phone,email,website,logo_url,iban,bic,payment_method,payment_days,validity_days," +
  "tax_rate_default,footer_notes,insurance_label,insurance_detail,created_at,updated_at";

export async function getSettings(assistantId: string): Promise<DocSettings | null> {
  const rows = await select<DocSettings>(
    "demo_doc_settings",
    `select=${COLS}&assistant_id=eq.${q(assistantId)}&limit=1`,
  );
  return rows[0] ?? null;
}

export type SettingsInput = Partial<Omit<DocSettings, "assistant_id" | "demo_slug" | "created_at" | "updated_at">>;

export async function saveSettings(
  tenant: DemoTenant, input: SettingsInput,
): Promise<DocSettings | null> {
  const rows = await upsert<DocSettings>(
    "demo_doc_settings",
    [{
      assistant_id: tenant.assistantId,
      demo_slug: tenant.slug,
      ...input,
      updated_at: new Date().toISOString(),
    }],
    "assistant_id",
  );
  return rows[0] ?? null;
}

/* ── L'émetteur effectif ──────────────────────────────────────────────────── */

/** Une chaîne de réglage ne compte que si elle porte quelque chose. */
function pick(override: string | null | undefined, base: string): string {
  const s = (override ?? "").trim();
  return s === "" ? base : s;
}

function pickNullable(override: string | null | undefined, base: string | null): string | null {
  const s = (override ?? "").trim();
  return s === "" ? base : s;
}

/** Ce qu'un document imprime en plus de l'identité : paiement, mentions. */
export type IssuerExtras = {
  siret: string | null;
  vatNumber: string | null;
  legalForm: string | null;
  iban: string | null;
  bic: string | null;
  paymentMethod: string | null;
  logoUrl: string | null;
  insuranceLabel: string | null;
  insuranceDetail: string | null;
  /** Mentions libres, ajoutées SOUS les mentions légales dérivées. */
  footerNotes: string | null;
};

export type EffectiveIssuer = Issuer & { extras: IssuerExtras };

/**
 * L'émetteur tel qu'il s'imprime : la vitrine, corrigée par les réglages.
 *
 * `null` si le slug n'a pas d'identité — l'appelant répond 404, comme partout.
 */
export function effectiveIssuer(
  slug: string, lang: Lang, settings: DocSettings | null,
): EffectiveIssuer | null {
  const base = issuerFor(slug, lang);
  if (!base) return null;
  if (!settings) {
    return {
      ...base,
      extras: {
        siret: null, vatNumber: null, legalForm: null, iban: null, bic: null,
        paymentMethod: null, logoUrl: null, insuranceLabel: null,
        insuranceDetail: null, footerNotes: null,
      },
    };
  }

  // L'adresse se recompose : code postal et ville sont saisis séparément dans
  // les réglages, alors que la vitrine ne connaît qu'une ligne d'adresse.
  const cityLine = [settings.postal_code, settings.city]
    .map((v) => (v ?? "").trim()).filter(Boolean).join(" ");

  const paymentDays = settings.payment_days ?? base.paymentDays;

  return {
    ...base,
    name: pick(settings.company_name, base.name),
    address: pick(settings.address, base.address),
    city: cityLine === "" ? base.city : cityLine,
    phone: pick(settings.phone, base.phone),
    email: pickNullable(settings.email, base.email),
    website: pickNullable(settings.website, base.website),
    registration: pickNullable(settings.siret, base.registration),
    taxRate: settings.tax_rate_default ?? base.taxRate,
    paymentDays,
    validityDays: settings.validity_days ?? base.validityDays,
    // Les mentions dérivées restent : elles portent le droit applicable. Celles
    // saisies ici viennent EN PLUS, jamais à la place — un exploitant ne devrait
    // pas pouvoir supprimer par inadvertance la mention des pénalités de retard.
    legalNotes: base.legalNotes,
    extras: {
      siret: settings.siret,
      vatNumber: settings.vat_number,
      legalForm: settings.legal_form,
      iban: settings.iban,
      bic: settings.bic,
      paymentMethod: settings.payment_method,
      logoUrl: settings.logo_url,
      insuranceLabel: settings.insurance_label,
      insuranceDetail: settings.insurance_detail,
      footerNotes: settings.footer_notes,
    },
  };
}
