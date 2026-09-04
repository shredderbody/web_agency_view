// ⚠️ MODULE SERVEUR UNIQUEMENT.

import { notFound, redirect } from "next/navigation";
import { canAccess, currentSession } from "./auth";
import { getTenant, type DemoTenant } from "./registry";
import { loginHref, spaceHref } from "./paths";
import { issuerFor, type Issuer } from "./issuer";
import { catalogFor, type CatalogGroup } from "./catalog";
import { listDocuments } from "./documents";
import { listCustomers } from "./ledger";
import type { PortalDocument } from "./documents.shared";
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
  tenant: Pick<DemoTenant, "slug" | "business" | "trade" | "city" | "accent">;
  issuer: Issuer;
  catalog: CatalogGroup[];
  documents: PortalDocument[];
  /** Les clients déjà connus de l'espace : on les choisit, on ne les ressaisit pas. */
  contacts: { id: string; name: string | null; phone: string; email: string | null }[];
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
  const issuer = issuerFor(slug, lang);
  // Une vitrine du registre sans identité émettrice serait une incohérence de
  // configuration, pas une page manquante : on le dit franchement.
  if (!issuer) notFound();

  let documents: PortalDocument[] = [];
  let contacts: QuotesPageData["contacts"] = [];
  let loadError: string | null = null;
  try {
    const [docs, customers] = await Promise.all([
      listDocuments(tenant.assistantId),
      listCustomers(tenant.assistantId, 200),
    ]);
    documents = docs;
    contacts = customers.map((c) => ({
      id: c.id, name: c.full_name, phone: c.phone, email: c.email,
    }));
  } catch (err) {
    // Un devis se rédige même quand la base est muette : l'éditeur reste
    // utilisable, seule la sauvegarde échouera, et elle le dira.
    loadError = err instanceof Error ? err.message : "Base de données injoignable.";
  }

  return {
    tenant: {
      slug: tenant.slug, business: tenant.business, trade: tenant.trade,
      city: tenant.city, accent: tenant.accent,
    },
    issuer,
    catalog: catalogFor(slug, lang),
    documents,
    contacts,
    lang,
    isAdmin: session.role === "admin",
    loadError,
  };
}
