// ⚠️ MODULE SERVEUR UNIQUEMENT.

import { notFound, redirect } from "next/navigation";
import { canAccess, currentSession } from "./auth";
import { getTenant, type DemoTenant } from "./registry";
import { loginHref, spaceHref } from "./paths";
import { listReservations } from "./ledger";
import { listDocuments } from "./documents";
import { portalLang } from "./lang";
import type { Lang } from "../i18n";

/* ════════════════════════════════════════════════════════════════════════════
   L'ACCUEIL d'une vitrine — ce qu'il y a derrière `/<slug>/admin`.

   La page ne montre que deux cartes, mais elle charge de quoi mettre UN CHIFFRE
   VRAI sur chacune : « 3 réservations à venir », « 2 devis · 1 facture ». Deux
   grands boutons sans rien dedans obligeraient à ouvrir chaque outil pour
   savoir s'il s'y passe quelque chose — ce qui est exactement le travail qu'une
   page d'accueil est censée épargner.

   Les gardes sont celles de tout l'espace : slug inconnu ⇒ 404 franc, pas de
   session ⇒ connexion avec la vitrine pré-sélectionnée, mauvaise vitrine ⇒
   retour chez soi.

   Si Supabase est muet, les cartes s'affichent SANS leur chiffre plutôt que de
   faire échouer la page : on n'empêche pas quelqu'un d'atteindre son outil de
   devis parce qu'on n'a pas su compter ses réservations.
   ════════════════════════════════════════════════════════════════════════════ */

export type SpaceHomeData = {
  tenant: Pick<DemoTenant, "slug" | "business" | "trade" | "city" | "accent">;
  lang: Lang;
  isAdmin: boolean;
  /** `null` quand la base n'a pas répondu — la carte s'affiche sans son chiffre. */
  upcoming: number | null;
  quotes: number | null;
  invoices: number | null;
};

export async function loadSpaceHome(slug: string): Promise<SpaceHomeData> {
  const tenant = getTenant(slug);
  if (!tenant) notFound();

  const session = await currentSession();
  if (!session) redirect(loginHref(slug));
  if (!canAccess(session, slug)) redirect(spaceHref(session.slug));

  const lang = await portalLang();

  let upcoming: number | null = null;
  let quotes: number | null = null;
  let invoices: number | null = null;
  try {
    const nowIso = new Date().toISOString();
    const [reservations, documents] = await Promise.all([
      listReservations(tenant.assistantId),
      listDocuments(tenant.assistantId),
    ]);
    upcoming = reservations.filter(
      (r) => r.starts_at && r.starts_at >= nowIso &&
             r.status !== "cancelled" && r.status !== "done",
    ).length;
    quotes = documents.filter((d) => d.kind === "quote").length;
    invoices = documents.filter((d) => d.kind === "invoice").length;
  } catch {
    // Volontairement silencieux : l'accueil est un aiguillage, pas un rapport.
    // Les deux outils savent chacun dire leur propre panne, en détail.
  }

  return {
    tenant: {
      slug: tenant.slug, business: tenant.business, trade: tenant.trade,
      city: tenant.city, accent: tenant.accent,
    },
    lang,
    isAdmin: session.role === "admin",
    upcoming,
    quotes,
    invoices,
  };
}
