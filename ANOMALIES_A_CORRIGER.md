# Anomalies à corriger — web_agency_view

> Registre des écarts **code ↔ config / doc** ouvert le 2026-06-07, à la création
> de la documentation. **Les trois points sont clos au 2026-09-04.**
> Un point n'est barré ici qu'une fois la correction faite *et* la documentation
> qui le décrivait remise d'accord avec le code.

## Design / front

- [x] **Alias de polices non définis** — `app/globals.css` référençait
  `--font-display`, `--font-body`, `--font-elegant`, `--font-barber`, alias qui
  n'étaient **définis nulle part** (le layout n'expose que `--font-bricolage`,
  `--font-hanken`, `--font-anton`, `--font-marcellus`). Toute la typographie de
  marque retombait donc sur la police système.
  **Corrigé le 2026-09-03** : bloc d'aliasing ajouté dans `:root`
  (`app/globals.css:59-62`), même traitement pour `--vit-display` / `--vit-body`.
  Voir `docs/DESIGN.md`.

## Cohérence tarifs

- [x] **Écart de prix éditorial** — la FAQ annonçait « à partir de 499 € » (FR) et
  « from €499 » (EN), alors que le tableau de prix et `lib/stripe.ts` disent
  **490 €**. Un prix qui change d'une section à l'autre de la même page se paie
  au moment de la vente, pas à la relecture.
  **Corrigé le 2026-09-04** : `lib/i18n.ts:297` et `lib/i18n.ts:549` alignés sur
  490 €. Plus aucune occurrence de « 499 » côté vitrine. La source de vérité
  reste `PLANS` dans `lib/stripe.ts`. Voir `docs/PRODUCT.md` et `docs/STRIPE.md`.

## Hygiène / config

- [x] **Variables d'env publiques inutilisées** — `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  et `NEXT_PUBLIC_SUPABASE_ANON_KEY` étaient dans le `.env` sans être lues par
  une seule ligne de code : le Checkout se fait par **redirection serveur** (pas
  de Stripe.js côté navigateur) et les écritures Supabase passent par le
  **service_role** serveur (`lib/portal/supabase.ts` n'a même pas la dépendance
  `@supabase/supabase-js`).
  **Corrigé le 2026-09-04** : les deux lignes sont **commentées** dans le `.env`,
  chacune sous une note qui dit pourquoi et quand la rouvrir. Commentées plutôt
  que supprimées — la valeur reste sous la main, et le jour où un client
  navigateur existera on retire un `#` au lieu de rouvrir un dashboard.
  Documentation remise d'accord : `docs/DEPLOY.md`, `docs/STRIPE.md`,
  `docs/DEVELOPMENT.md` (qui listait encore la clé publiable parmi les variables
  *lues par le code*).

_Dernière mise à jour : 2026-09-04 — registre clos._
