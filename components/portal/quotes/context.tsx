"use client";

import { createContext, useContext } from "react";
import type { QuotesPageData } from "@/lib/portal/quotesPage";
import type { StoredCatalogItem, StoredCategory } from "@/lib/portal/catalogStore";
import type { DocSettings, EffectiveIssuer } from "@/lib/portal/docSettings";
import type { PortalDocument } from "@/lib/portal/documents.shared";
import type { PortalCustomer } from "@/lib/portal/types";
import type { DocStrings } from "@/lib/portal/documentsStrings";
import type { Lang } from "@/lib/i18n";

/* ════════════════════════════════════════════════════════════════════════════
   L'ÉTAT PARTAGÉ de l'application de devis.

   Sept onglets qui touchent aux mêmes quatre jeux de données : les documents,
   les clients, le catalogue, les réglages. Faire descendre tout ça en props à
   travers sept composants reviendrait à écrire la même liste d'arguments sept
   fois — et à l'oublier quelque part le jour où un cinquième jeu apparaît.

   Le contexte porte AUSSI les écritures. C'est délibéré : quand l'onglet
   Clients crée une fiche, l'éditeur doit pouvoir la choisir dans la seconde,
   sans rechargement. Une écriture qui ne remonterait pas ici obligerait à
   recharger la page pour voir son propre travail.
   ════════════════════════════════════════════════════════════════════════════ */

export type TabId =
  | "editor" | "quotes" | "invoices" | "clients" | "catalog" | "dashboard" | "settings";

export type QuotesCtx = {
  slug: string;
  tenant: QuotesPageData["tenant"];
  lang: Lang;
  t: DocStrings;
  isAdmin: boolean;

  issuer: EffectiveIssuer;
  settings: DocSettings | null;

  documents: PortalDocument[];
  customers: PortalCustomer[];
  categories: StoredCategory[];
  items: StoredCatalogItem[];

  /** Document ouvert dans l'éditeur, `null` quand aucun. */
  openId: string | null;
  openDocument: (doc: PortalDocument) => void;
  goTo: (tab: TabId) => void;

  /* ── Écritures, toutes résolues côté serveur puis reflétées ici ─────────── */
  createDocument: (kind: "quote" | "invoice") => Promise<PortalDocument | null>;
  saveDocument: (patch: Record<string, unknown>) => Promise<PortalDocument | null>;
  convertDocument: (id: string) => Promise<PortalDocument | null>;
  removeDocument: (id: string) => Promise<void>;
  duplicateDocument: (doc: PortalDocument) => Promise<PortalDocument | null>;

  saveCustomer: (input: Record<string, unknown>, id?: string) => Promise<PortalCustomer | null>;
  removeCustomer: (id: string) => Promise<void>;

  saveCategory: (input: Record<string, unknown>, id?: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  saveItem: (input: Record<string, unknown>, id?: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;

  saveSettings: (input: Record<string, unknown>) => Promise<void>;

  /** Dernière erreur d'écriture, affichée en bandeau. */
  error: string | null;
  setError: (message: string | null) => void;
};

const Ctx = createContext<QuotesCtx | null>(null);

export const QuotesProvider = Ctx.Provider;

export function useQuotes(): QuotesCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuotes hors de QuotesProvider");
  return ctx;
}

/* ── Petits outils partagés par les onglets ──────────────────────────────── */

/** Un champ numérique vide vaut zéro — et s'affiche vide, pas « 0 ». */
export function numValue(n: number | null | undefined): string | number {
  return n === 0 || n === null || n === undefined ? "" : n;
}

export function toNum(raw: string): number {
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** Date de document, écrite en toutes lettres. */
export function fmtDocDate(day: string | null, lang: Lang): string {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return "—";
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
}

/** Heure courte, pour « Enregistré à 14 h 32 ». */
export function fmtClock(date: Date, lang: Lang): string {
  const out = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
    hour: "2-digit", minute: "2-digit",
  }).format(date);
  return lang === "fr" ? out.replace(":", " h ") : out;
}
