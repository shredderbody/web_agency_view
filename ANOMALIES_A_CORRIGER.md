# Anomalies à corriger — web_agency_view

> Rappel des écarts **code ↔ config / doc** relevés lors de la création de la documentation du 2026-06-07.
> Ces points sont **documentés mais non corrigés** : ils touchent au code, hors périmètre de la révision doc.

## Design / front

- [ ] **Alias de polices non définis (bug probable)** — `app/globals.css` référence `--font-display`, `--font-body`, `--font-elegant`, `--font-barber`, mais ces alias **ne sont définis nulle part** (le layout n'expose que `--font-bricolage`, `--font-hanken`, `--font-anton`, `--font-marcellus`). En l'état, la typographie de marque retombe sur la police par défaut. Voir `docs/DESIGN.md`.

## Cohérence tarifs

- [ ] **Écart de prix éditorial** — la FAQ FR annonce « à partir de 499 € », alors que le tableau de prix et `lib/stripe.ts` utilisent **490 €**. Harmoniser. Voir `docs/PRODUCT.md` et `docs/STRIPE.md`.

## Hygiène / config

- [ ] **Variables d'env publiques inutilisées** — `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont présentes dans `.env` mais **non utilisées** par le code (checkout par redirection serveur ; écritures Supabase via `service_role`). À retirer ou à câbler. Voir `docs/DEPLOY.md` / `docs/STRIPE.md`.

_Dernière mise à jour : 2026-06-07_
