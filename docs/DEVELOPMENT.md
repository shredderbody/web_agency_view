# DEVELOPMENT — Atelier Vitrine

Installation locale, commandes et scripts utilitaires.

## Prérequis

- **Node.js 22** recommandé (l'image Docker se base sur `node:22-alpine`).
- npm (le dépôt fournit `package-lock.json` → `npm ci` reproductible).
- Optionnel : Python 3 (génération d'images), navigateurs Playwright (captures).

## Installation

```bash
npm install        # ou: npm ci  (installe à partir du lockfile)
```

## Commandes npm (`package.json`)

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement Next.js (par défaut `http://localhost:3000`). |
| `npm run build` | Build de production (`next build`, sortie `standalone`). |
| `npm run start` | Sert le build de production (`next start`). |
| `npm run lint` | Lint Next.js (`next lint`). |

> Le **port de production** est **3010** par convention du projet (Docker / Caddy).
> En `npm run dev` / `npm run start`, Next utilise le port par défaut **3000** sauf si
> vous passez `-p 3010` ou `PORT=3010`.

## Variables d'environnement (développement)

Le code lit les variables suivantes (par leur **nom** ; valeurs jamais documentées) —
voir [DEPLOY.md](./DEPLOY.md) pour la liste complète et les rôles :

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_ENABLED`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_PLACES_API_KEY`
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_URL_LOCAL`

Le `.env` est **gitignored** (secrets). Le site marketing peut démarrer sans `.env`,
mais les fonctions serveur (Stripe / Supabase / Places) renvoient une erreur
contrôlée si leurs variables manquent (ex. `/api/checkout` → `stripe_disabled`,
`/api/leads` → `missing_supabase_env`).

## Tester le paiement Stripe en local

Voir [STRIPE.md](./STRIPE.md). En résumé : utiliser des clés `sk_test` / `pk_test`,
la carte de test `4242 4242 4242 4242`, et un secret de webhook de test pour
`/api/stripe/webhook`. `STRIPE_ENABLED` doit valoir `true`.

## Scripts utilitaires

### Génération d'images de marque (KIE AI)

`scripts/gen_characters.py` et `scripts/gen_studio.py` génèrent l'imagerie sur-mesure
(portraits d'artisans, scènes, planches-contact) via l'API KIE
(modèle `gpt-image-2-text-to-image`). Requiert la variable `KIE_API_KEY` :

```bash
KIE_API_KEY=... python3 scripts/gen_characters.py
# Sortie : public/characters/{slug}-portrait.png et {slug}-sheet.png (puis conversion WebP)
```

### Captures de vérification (Playwright)

`scripts/shoot.mjs` photographie la home, la galerie et chaque vitrine sur 3 viewports
(mobile 390, tablette 820, desktop 1280). Base configurable via `SHOOT_BASE`
(défaut `http://localhost:3210`) :

```bash
SHOOT_BASE=http://localhost:3010 node scripts/shoot.mjs   # → /tmp/shot-*.png
```

(Le script neutralise l'animation `.reveal` pour des screenshots stables.)

## Qualité

- TypeScript `strict` activé (`tsconfig.json`).
- `npm run lint` avant de commiter.
- Pas de tests automatisés dans le dépôt ; la vérification visuelle passe par
  `scripts/shoot.mjs`.
</content>
