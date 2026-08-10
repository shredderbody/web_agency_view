/* ════════════════════════════════════════════════════════════════════════════
   Préfixe de routes de la boutique Ines Garden.

   Le site client autonome (website_expo/ines_garden) sert la boutique à la
   racine (`/`, `/collections`, `/vases-medicis/…`). Ici, la même boutique est
   montée dans le site agence sous `/demo/ines-garden`. Tous les liens internes
   de components/shop/* passent donc par `shopHref()` : c'est le seul point à
   changer si la démo déménage.
   ════════════════════════════════════════════════════════════════════════════ */

/** Racine de la boutique dans le site agence, sans slash final. */
export const SHOP_BASE = "/demo/ines-garden";

/** Construit un lien interne boutique à partir d'un chemin racine (`/`, `/collections`, `/vases-medicis/xxx`). */
export function shopHref(path = "/"): string {
  if (path === "/" || path === "") return SHOP_BASE;
  return `${SHOP_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
