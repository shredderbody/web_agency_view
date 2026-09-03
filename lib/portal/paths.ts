/* ════════════════════════════════════════════════════════════════════════════
   Les URL de l'espace de suivi, en un seul endroit.

     /<slug>/admin   l'espace d'une vitrine — l'adresse qu'on donne au client :
                     « votre site, puis /admin ». C'est la même forme que sur un
                     site client autonome (cf. website_expo/*), où la vitrine est
                     à la racine du domaine.
     /admin          l'espace de l'agence, vision sur toutes les vitrines.
     /admin/login    la connexion.

   Les anciennes adresses `/espace/*` redirigent en 308 (cf. next.config.js) :
   des codes d'accès et des liens ont déjà été transmis avec.
   ════════════════════════════════════════════════════════════════════════════ */

export const ADMIN_PATH = "/admin";
export const LOGIN_PATH = "/admin/login";

/** L'espace d'un slug — `admin` compris, qui a sa propre adresse. */
export function spaceHref(slug: string): string {
  return slug === "admin" ? ADMIN_PATH : `/${slug}/admin`;
}

/** La connexion, en pré-sélectionnant la vitrine quand on la connaît. */
export function loginHref(slug?: string): string {
  return slug ? `${LOGIN_PATH}?demo=${encodeURIComponent(slug)}` : LOGIN_PATH;
}
