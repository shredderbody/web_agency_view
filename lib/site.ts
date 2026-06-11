/**
 * Configuration centralisée du domaine public et des coordonnées.
 *
 * ⚠️ Deux domaines distincts dans ce projet :
 *  - DOMAINE PUBLIC / MARQUE / SEO  → `atelier-vitrine.fr` (ce fichier, `SITE_URL`)
 *  - ORIGINE DE DÉPLOIEMENT (checkout, fonctionnel) → `NEXT_PUBLIC_APP_URL`
 *    (= `receptionniste.zerocall.io`), géré séparément côté routes API.
 *
 * Pour migrer le domaine public : définir `NEXT_PUBLIC_SITE_URL` dans `.env`
 * (ou changer le défaut ci-dessous) puis rebuild. Ne rien coder en dur ailleurs :
 * importer `SITE_URL`, `siteUrl()`, `CONTACT_EMAIL` depuis ce module.
 *
 * Recensement complet & procédure : `docs/DOMAIN_MIGRATION.md`.
 */

/** URL racine du site public (marque/SEO), sans slash final. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://atelier-vitrine.fr"
).replace(/\/+$/, "");

/** Domaine nu dérivé de `SITE_URL`. Ex. `atelier-vitrine.fr`. */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

/** Construit une URL absolue à partir d'un chemin (canonical, OG…). */
export const siteUrl = (path = "/"): string =>
  `${SITE_URL}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;

/** Domaine des emails publics (par défaut : `SITE_DOMAIN`). */
const EMAIL_DOMAIN = process.env.NEXT_PUBLIC_SITE_EMAIL_DOMAIN ?? SITE_DOMAIN;

/** Construit une adresse email publique. Ex. `email("bonjour")`. */
export const email = (mailbox: string): string => `${mailbox}@${EMAIL_DOMAIN}`;

export const CONTACT_EMAIL = email("bonjour");
