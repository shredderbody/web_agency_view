// ⚠️ MODULE SERVEUR UNIQUEMENT.

import { notFound, redirect } from "next/navigation";
import { canAccess, currentSession } from "./auth";
import { getTenant, type DemoTenant } from "./registry";
import { loginHref, spaceHref } from "./paths";
import { issuerFor } from "./issuer";
import { catalogFor, type CatalogGroup } from "./catalog";
import { listDocuments } from "./documents";
import { listCustomers } from "./ledger";
import { loadCatalog, type StoredCatalogItem, type StoredCategory } from "./catalogStore";
import { effectiveIssuer, getSettings, type DocSettings, type EffectiveIssuer } from "./docSettings";
import type { PortalDocument } from "./documents.shared";
import type { PortalCustomer } from "./types";
import type { Lang } from "../i18n";
import { portalLang } from "./lang";

/* ════════════════════════════════════════════════════════════════════════════
   Le chargement de l'outil de devis, partagé par ses DEUX adresses.

     /<slug>/quotes   l'adresse canonique — la langue suit le visiteur
     /<slug>/devis    l'adresse française — la langue est dans l'URL

   Une seule fonction, parce qu'il n'y a qu'une seule page : deux portes, une
   pièce. Ce qui change entre les deux tient dans un argument.
   ════════════════════════════════════════════════════════════════════════════ */

export type QuotesPageData = {
  tenant: Pick<DemoTenant, "slug" | "business" | "trade" | "city" | "accent" | "timezone">;
  /** L'émetteur tel qu'il s'imprime : la vitrine, corrigée par les réglages. */
  issuer: EffectiveIssuer;
  /** Les réglages bruts — ce que le formulaire de l'onglet Réglages édite. */
  settings: DocSettings | null;
  /** Le catalogue de la VITRINE : la vue figée, gardée pour la comparaison. */
  vitrineCatalog: CatalogGroup[];
  /** Le catalogue de l'EXPLOITANT : celui qu'il modifie. */
  categories: StoredCategory[];
  items: StoredCatalogItem[];
  documents: PortalDocument[];
  /** Le fichier client complet : on le choisit, on le complète, on ne le ressaisit pas. */
  customers: PortalCustomer[];
  lang: Lang;
  isAdmin: boolean;
  /** Message affiché quand Supabase n'est pas joignable — plutôt qu'un écran vide. */
  loadError: string | null;
};

/**
 * Prépare la page. `forcedLang` vient de l'adresse (`/devis` ⇒ français) ;
 * sans elle, c'est la préférence du visiteur qui décide.
 *
 * Les gardes sont exactement celles de `/<slug>/admin` : slug inconnu ⇒ 404
 * franc (répondre autre chose ferait de cette page un annuaire des démos),
 * pas de session ⇒ login avec la vitrine pré-sélectionnée, mauvaise vitrine ⇒
 * retour chez soi.
 */
export async function loadQuotesPage(
  slug: string,
  forcedLang?: Lang,
): Promise<QuotesPageData> {
  const tenant = getTenant(slug);
  if (!tenant) notFound();

  const session = await currentSession();
  if (!session) redirect(loginHref(slug));
  if (!canAccess(session, slug)) redirect(spaceHref(session.slug));

  const lang = forcedLang ?? (await portalLang());
  // Une vitrine du registre sans identité émettrice serait une incohérence de
  // configuration, pas une page manquante : on le dit franchement.
  if (!issuerFor(slug, lang)) notFound();

  let documents: PortalDocument[] = [];
  let customers: PortalCustomer[] = [];
  let categories: StoredCategory[] = [];
  let items: StoredCatalogItem[] = [];
  let settings: DocSettings | null = null;
  let loadError: string | null = null;

  /* UN SEUL aller-retour de préparation, comme le tableau de bord : une
     application à sept onglets qui irait chercher ses données onglet par onglet
     donnerait l'impression de ramer à chaque clic, même en étant rapide. */
  try {
    const [docs, people, catalog, saved] = await Promise.all([
      listDocuments(tenant.assistantId),
      listCustomers(tenant.assistantId, 400),
      loadCatalog(tenant, lang),
      getSettings(tenant.assistantId),
    ]);
    documents = docs;
    customers = people;
    categories = catalog.categories;
    items = catalog.items;
    settings = saved;
  } catch (err) {
    // Un devis se rédige même quand la base est muette : l'éditeur reste
    // utilisable, seule la sauvegarde échouera, et elle le dira.
    loadError = err instanceof Error ? err.message : "Base de données injoignable.";
  }

  const issuer = effectiveIssuer(slug, lang, settings);
  if (!issuer) notFound();

  return {
    tenant: {
      slug: tenant.slug, business: tenant.business, trade: tenant.trade,
      city: tenant.city, accent: tenant.accent, timezone: tenant.timezone,
    },
    issuer,
    settings,
    vitrineCatalog: catalogFor(slug, lang),
    categories,
    items,
    documents,
    customers,
    lang,
    isAdmin: session.role === "admin",
    loadError,
  };
}
