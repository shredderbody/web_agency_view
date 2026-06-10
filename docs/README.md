# Documentation — Atelier Vitrine

Index de la documentation du projet **Atelier Vitrine** (`web_agency_view`).
Chaque document est vérifié contre le code réel du dépôt.

## Vue d'ensemble

**Atelier Vitrine** est le site marketing d'un studio web qui conçoit des sites
vitrines sur-mesure pour les commerces de proximité (barbiers, ongleries,
charcutiers-traiteurs, restaurants, plombiers…). Le site présente l'offre **et**
fait visiter des vitrines de démonstration complètes, chacune dans son propre
univers visuel.

Quatre fonctions « backend » sont branchées :
- **Stripe Checkout** (abonnement + frais de mise en place) pour les formules tarifaires.
- **Google Places (New)** via un proxy serveur, pour le widget « cherchez votre commerce ».
- **Supabase** (PostgREST) pour stocker les leads entreprises captés par ce widget.
- **Vapi** : une bulle de discussion hybride (chat + appel) par page métier, branchée
  sur un assistant inbound bilingue FR/EN qui prend des rendez-vous de démo.

## Stack (résumé)

- **Next.js 15** (App Router) · **React 19** · **TypeScript 5**
- **Tailwind CSS v3.4** + design system maison (tokens OKLCH dans `app/globals.css`)
- Polices Google via `next/font` : Bricolage Grotesque, Hanken Grotesk, Anton, Marcellus
- **Stripe** (SDK Node `stripe`), **Supabase** (REST), **Google Places API (New)**
- Déploiement **Docker** (image `standalone`) derrière **Caddy** (par défaut) ou un **tunnel Cloudflare**

## Sommaire

| Document | Contenu |
|---|---|
| [PRODUCT.md](./PRODUCT.md) | Produit, utilisateurs, voix de marque, principes (déduit du code) |
| [DESIGN.md](./DESIGN.md) | Design system réel : tokens OKLCH, typographie, mondes des vitrines |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, arborescence, routes, flux de données, Supabase, i18n |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Installation locale, commandes npm, scripts utilitaires |
| [DEPLOY.md](./DEPLOY.md) | Déploiement Docker, Caddy / Cloudflare, scripts, variables d'env |
| [STRIPE.md](./STRIPE.md) | Intégration Stripe : flux de paiement, webhook, prix, env vars |
| [VAPI_ASSISTANTS.md](./VAPI_ASSISTANTS.md) | Bulle Vapi hybride par métier, assistants inbound bilingues, function tools, CSP |
| [VAPI_FRONTEND_WIDGET.md](./VAPI_FRONTEND_WIDGET.md) | **Playbook réutilisable** : intégrer le widget Vapi en front-end (CSP, micro, montage, responsive mobile/tablette/desktop) — valable pour tout projet client |

## Conventions

- Langue de la doc et du produit : **français** (UI bilingue FR/EN).
- Les **variables d'environnement** sont documentées par leur **nom** et leur **rôle** ;
  aucune valeur de secret n'apparaît dans cette documentation.
- Le port applicatif est **3010** par convention (host → conteneur).
</content>
</invoke>
