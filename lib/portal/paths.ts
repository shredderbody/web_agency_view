/* ════════════════════════════════════════════════════════════════════════════
   Les URL de l'espace, en un seul endroit.

     /<slug>/admin            L'ACCUEIL d'une vitrine — l'adresse qu'on donne
                              au client : « votre site, puis /admin ». C'est la
                              même forme que sur un site client autonome (cf.
                              website_expo/*), où la vitrine est à la racine du
                              domaine. Après connexion, elle présente les outils.
     /<slug>/admin/dashboard  Le SUIVI : consommation, réservations, journal, clients.
     /<slug>/admin/quotes     Les DEVIS & FACTURES (alias français .../devis).
     /admin                   L'espace de l'agence, toutes les vitrines.
     /admin/login             La connexion.

   ── Pourquoi TOUT est niché sous `/<slug>/admin` ────────────────────────────
   L'accueil garde l'adresse `/admin` : c'est celle qui a déjà été communiquée
   aux clients, imprimée dans des messages et retenue de tête. Elle reste valide
   et devient le hall d'entrée — personne ne tombe sur une 404, et celui qui
   arrive découvre qu'il y a deux outils derrière son code, pas un.

   Les outils, eux, sont DESSOUS. Ce n'est pas qu'une affaire de rangement : la
   garde de session est posée dans `app/(portal)/[slug]/admin/layout.tsx`, donc
   une page ajoutée demain sous ce segment est protégée avant même d'être
   écrite. Le chemin seul ne protège rien ; le layout qu'il partage, si.

   Les anciennes adresses `/<slug>/quotes` et `/<slug>/devis` redirigent en 308
   (cf. next.config.js) — elles ont vécu en production, elles ne cassent pas.

   Les anciennes adresses `/espace/*` redirigent en 308 (cf. next.config.js) :
   des codes d'accès et des liens ont déjà été transmis avec.
   ════════════════════════════════════════════════════════════════════════════ */

export const ADMIN_PATH = "/admin";
export const LOGIN_PATH = "/admin/login";

/** Le slug réservé à l'agence : son espace est `/admin`, pas `/admin/admin`. */
const AGENCY = "admin";

/**
 * L'ACCUEIL d'un slug — la destination après connexion, et l'adresse qu'on
 * donne au client. Pour l'agence, c'est directement son tableau de bord : elle
 * n'a pas d'outil de devis à elle, une page à une seule carte serait un détour.
 */
export function spaceHref(slug: string): string {
  return slug === AGENCY ? ADMIN_PATH : `/${slug}/admin`;
}

/** Le suivi d'une vitrine : consommation, réservations, journal, clients. */
export function dashboardHref(slug: string): string {
  return slug === AGENCY ? ADMIN_PATH : `/${slug}/admin/dashboard`;
}

/** L'outil de devis d'une vitrine. `/devis` mène au même endroit, en français. */
export function quotesHref(slug: string): string {
  return `/${slug}/admin/quotes`;
}

/** La connexion, en pré-sélectionnant la vitrine quand on la connaît. */
export function loginHref(slug?: string): string {
  return slug ? `${LOGIN_PATH}?demo=${encodeURIComponent(slug)}` : LOGIN_PATH;
}
