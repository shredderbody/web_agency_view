/* ════════════════════════════════════════════════════════════════════════════
   L'ÉMETTEUR d'un devis ou d'une facture — c'est-à-dire le commerce lui-même.

   Rien n'est saisi. Tout est lu là où la vitrine publique puise déjà : les
   modules `FACTS` des démos bâties sur un commerce réel, et `VIT_BASE` pour les
   vitrines génériques. Le client qui ouvre `/<slug>/quotes` trouve donc son
   enseigne, son adresse, son téléphone et son métier déjà en place, à
   l'identique de ce que voit un visiteur de sa page.

   Ce module ajoute les trois choses qu'une page vitrine n'a pas besoin de dire
   mais qu'un document comptable exige :

     • la DEVISE — Gun Barrel City facture en dollars, Pererenan en roupies ;
     • le TAUX DE TAXE par défaut, au vrai régime du métier et du pays
       (restauration française 10 %, prestation de service 20 %, sales tax
       américaine, PB1 balinaise) ;
     • les MENTIONS LÉGALES de bas de document (délai de paiement, pénalités de
       retard françaises, numéro de licence quand il existe).

   Aucun numéro n'est inventé : une vitrine fictive n'a pas de SIRET, et le
   document ne prétend pas le contraire — le champ reste vide plutôt que faux.
   ════════════════════════════════════════════════════════════════════════════ */

import type { Lang } from "../i18n";
import { VIT_BASE } from "../vitrineContent";
import { FACTS as THAI } from "../thaiViens";
import { FACTS as BARBER_C } from "../barberCourbevoie";
import { FACTS as LAK } from "../lakNailSalon";
import { FACTS as OPENHOUSE } from "../openhouseCanggu";
import { FACTS as INES } from "../inesGarden";
import { FACTS as EPHEMERE } from "../maisonEphemere";
import { FACTS as TEXAS } from "../texasPlumbing";
import { getTenant } from "./registry";
import type { CurrencyCode } from "./money";

/* ── Devises ────────────────────────────────────────────────────────────────
   Le formatage et l'arrondi vivent dans `money.ts` : l'éditeur de devis en a
   besoin DANS LE NAVIGATEUR, et il ne doit pas emporter avec lui les sept
   modules de contenu importés en tête de ce fichier. On les ré-exporte ici pour
   que le code serveur n'ait pas à savoir que cette frontière existe.          */

export type { CurrencyCode } from "./money";
export { formatMoney, roundMoney } from "./money";

/* ── L'émetteur ──────────────────────────────────────────────────────────── */

export type Issuer = {
  slug: string;
  /** Raison sociale telle qu'elle s'imprime en tête de document. */
  name: string;
  /** Métier, en clair, sous le nom. */
  trade: string;
  address: string;
  city: string;
  phone: string;
  email: string | null;
  website: string | null;
  /** Immatriculation quand elle existe VRAIMENT (licence, RCS). Sinon `null`. */
  registration: string | null;
  /** Accent de la vitrine — le document se met aux couleurs de la maison. */
  accent: string;
  currency: CurrencyCode;
  /** Taux par défaut d'une nouvelle ligne, au régime réel du métier. */
  taxRate: number;
  /** Comment s'appelle la taxe sur ce document : « TVA », « Sales tax », « PB1 ». */
  taxLabel: string;
  /** Validité d'un devis, en jours. */
  validityDays: number;
  /** Délai de paiement d'une facture, en jours. */
  paymentDays: number;
  /** Mentions imprimées en pied de document. */
  legalNotes: string[];
};

/** Régime fiscal d'une vitrine — arrêté métier par métier, pas au hasard. */
type TaxSpec = { currency: CurrencyCode; rate: number; label: { fr: string; en: string } };

const TVA_SERVICE: TaxSpec = { currency: "eur", rate: 20, label: { fr: "TVA", en: "VAT" } };
const TVA_RESTAURATION: TaxSpec = { currency: "eur", rate: 10, label: { fr: "TVA", en: "VAT" } };
const SALES_TAX_NY: TaxSpec = { currency: "usd", rate: 8.875, label: { fr: "Sales tax (NY)", en: "Sales tax (NY)" } };
const SALES_TAX_TX: TaxSpec = { currency: "usd", rate: 8.25, label: { fr: "Sales tax (TX)", en: "Sales tax (TX)" } };
const PB1_BALI: TaxSpec = { currency: "idr", rate: 10, label: { fr: "PB1 (taxe)", en: "PB1 (tax)" } };

const TAX_BY_SLUG: Record<string, TaxSpec> = {
  // France — prestation de service : 20 %.
  barbershop: TVA_SERVICE,
  onglerie: TVA_SERVICE,
  plombier: TVA_SERVICE,
  "barbershop-courbevoie": TVA_SERVICE,
  "ines-garden": TVA_SERVICE,
  "maison-ephemere": TVA_SERVICE,
  // France — nourriture consommée sur place ou à emporter : 10 %.
  traiteur: TVA_RESTAURATION,
  restaurant: TVA_RESTAURATION,
  "thai-viens-express": TVA_RESTAURATION,
  // Hors France.
  "lak-nail-salon": SALES_TAX_NY,
  "texas-plumbing-pros": SALES_TAX_TX,
  "openhouse-canggu": PB1_BALI,
};

/** Identité brute d'une vitrine, avant habillage linguistique. */
type Identity = {
  name: string;
  trade: { fr: string; en: string };
  address: string;
  city: string;
  phone: string;
  email: string | null;
  website: string | null;
  registration: string | null;
};

function fromVitrine(slug: string, trade: { fr: string; en: string }): Identity | null {
  const v = VIT_BASE[slug];
  if (!v) return null;
  return {
    name: v.business,
    trade,
    address: v.address,
    city: v.city,
    phone: v.phone,
    email: null,
    website: null,
    registration: null,
  };
}

const IDENTITIES: Record<string, Identity | null> = {
  // ── Vitrines génériques : `VIT_BASE` porte l'adresse et le téléphone, le
  //    registre porte le métier. Ni e-mail ni immatriculation : ces commerces
  //    n'existent pas, on ne leur en fabrique pas.
  barbershop: fromVitrine("barbershop", { fr: "Barbier · Coiffeur homme", en: "Barbershop · Men's grooming" }),
  onglerie: fromVitrine("onglerie", { fr: "Onglerie · Manucure & pédicure", en: "Nail salon · Manicure & pedicure" }),
  traiteur: fromVitrine("traiteur", { fr: "Charcutier-traiteur", en: "Deli · Caterer" }),
  restaurant: fromVitrine("restaurant", { fr: "Restaurant · Bistrot", en: "Restaurant · Bistro" }),
  plombier: fromVitrine("plombier", { fr: "Plombier · Chauffagiste", en: "Plumber · Heating engineer" }),

  // ── Démos bâties sur un commerce réel : `FACTS`, la même source que la page.
  "thai-viens-express": {
    name: THAI.name, trade: THAI.trade, address: THAI.address, city: THAI.city,
    phone: THAI.phone, email: null, website: null, registration: null,
  },
  "barbershop-courbevoie": {
    name: BARBER_C.fullName, trade: BARBER_C.trade, address: BARBER_C.address, city: BARBER_C.city,
    phone: BARBER_C.phone, email: null, website: null, registration: null,
  },
  "lak-nail-salon": {
    name: LAK.name, trade: LAK.trade, address: LAK.address, city: LAK.city,
    phone: LAK.phone, email: null, website: LAK.website, registration: null,
  },
  "openhouse-canggu": {
    name: OPENHOUSE.fullName, trade: OPENHOUSE.trade, address: OPENHOUSE.address, city: OPENHOUSE.city,
    phone: OPENHOUSE.phone, email: null, website: OPENHOUSE.website, registration: null,
  },
  "ines-garden": {
    name: INES.name, trade: INES.trade, address: INES.address, city: INES.city,
    phone: INES.phone, email: null, website: INES.website, registration: null,
  },
  "maison-ephemere": {
    name: EPHEMERE.name, trade: EPHEMERE.trade, address: EPHEMERE.address, city: EPHEMERE.city,
    phone: EPHEMERE.phone, email: null, website: EPHEMERE.website, registration: null,
  },
  "texas-plumbing-pros": {
    name: TEXAS.name, trade: TEXAS.trade, address: TEXAS.address, city: TEXAS.city,
    phone: TEXAS.phone, email: TEXAS.email, website: TEXAS.website,
    registration: `Texas State Board of Plumbing Examiners · ${TEXAS.license}`,
  },
};

/* ── Mentions de pied de document ───────────────────────────────────────────
   Le droit français impose sur une facture la mention des pénalités de retard
   et l'indemnité forfaitaire de recouvrement de 40 € (art. L441-10 et D441-5
   du code de commerce). Les vitrines hors France ont leurs propres usages :
   on ne leur colle pas un texte français traduit.                             */

function legalNotesFor(currency: CurrencyCode, lang: Lang, paymentDays: number): string[] {
  if (currency === "eur") {
    return lang === "fr"
      ? [
          `Paiement à ${paymentDays} jours à réception de facture.`,
          "En cas de retard : pénalités au taux de trois fois l'intérêt légal, et indemnité forfaitaire de 40 € pour frais de recouvrement.",
          "Pas d'escompte pour paiement anticipé.",
        ]
      : [
          `Payment due within ${paymentDays} days of invoice date.`,
          "Late payment incurs interest at three times the French statutory rate, plus a €40 fixed recovery fee.",
          "No discount for early settlement.",
        ];
  }
  if (currency === "usd") {
    return lang === "fr"
      ? [
          `Paiement à ${paymentDays} jours à réception de facture.`,
          "Taxe locale appliquée au taux en vigueur sur la juridiction du chantier.",
        ]
      : [
          `Payment due within ${paymentDays} days of invoice date.`,
          "Sales tax applied at the rate in effect for the job's jurisdiction.",
        ];
  }
  return lang === "fr"
    ? [
        `Paiement à ${paymentDays} jours à réception de facture.`,
        "Taxe locale PB1 incluse au taux en vigueur à Bali.",
      ]
    : [
        `Payment due within ${paymentDays} days of invoice date.`,
        "Local PB1 tax applied at the rate in effect in Bali.",
      ];
}

/**
 * L'émetteur d'une vitrine, prêt à imprimer. `null` si le slug n'est pas une
 * vitrine connue — l'appelant répond alors 404, comme partout dans l'espace.
 */
export function issuerFor(slug: string, lang: Lang): Issuer | null {
  const tenant = getTenant(slug);
  const identity = IDENTITIES[slug];
  if (!tenant || !identity) return null;

  const tax = TAX_BY_SLUG[slug] ?? TVA_SERVICE;
  const paymentDays = 30;

  return {
    slug,
    name: identity.name,
    trade: identity.trade[lang],
    address: identity.address,
    city: identity.city,
    phone: identity.phone,
    email: identity.email,
    website: identity.website,
    registration: identity.registration,
    accent: tenant.accent,
    currency: tax.currency,
    taxRate: tax.rate,
    taxLabel: tax.label[lang],
    validityDays: 30,
    paymentDays,
    legalNotes: legalNotesFor(tax.currency, lang, paymentDays),
  };
}
