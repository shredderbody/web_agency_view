# ARCHITECTURE — Atelier Vitrine

## Stack technique

| Couche | Technologie | Détail |
|---|---|---|
| Framework | **Next.js 15** (App Router) | `output: "standalone"` (`next.config.js`) |
| UI | **React 19** + **TypeScript 5** | `strict: true` (`tsconfig.json`) |
| Styles | **Tailwind CSS v3.4** + CSS maison | tokens OKLCH (voir [DESIGN.md](./DESIGN.md)) |
| Polices | `next/font/google` | Bricolage, Hanken, Anton, Marcellus |
| Icônes | `lucide-react` | + `@radix-ui/react-icons` |
| UI primitives | `@radix-ui/react-accordion` | FAQ |
| Drapeaux i18n | `flag-icons` | sélecteur de langue |
| Images | `sharp` | optimisation Next (AVIF/WebP) |
| Paiement | `stripe` (SDK Node) | Checkout + webhook |
| Données | **Supabase** (PostgREST) | table `business_leads` |
| Recherche commerce | **Google Places API (New)** | proxy serveur |
| Utilitaires | `clsx`, `tailwind-merge`, `motion` | `motion` présent en dépendance |

Alias d'import TypeScript : `@/*` → racine du projet (`tsconfig.json`).

## Arborescence

```
app/
  layout.tsx                # racine HTML, polices next/font, LangProvider, metadata SEO
  page.tsx                  # Accueil (agence) — "use client"
  globals.css               # design system (tokens OKLCH, classes, mondes [data-vit])
  not-found.tsx             # 404
  icon.svg                  # favicon
  demo/
    page.tsx                # galerie des vitrines de démo
    [slug]/page.tsx         # une vitrine (generateStaticParams + generateMetadata)
  api/
    checkout/route.ts       # POST → crée une session Stripe Checkout
    stripe/webhook/route.ts # POST → webhook Stripe (cap 24 mois)
    leads/route.ts          # POST → insère un lead dans Supabase
    places/
      autocomplete/route.ts # GET → proxy Google Places Autocomplete
      details/route.ts      # GET → proxy Google Place Details

components/
  SiteNav.tsx · SiteFooter.tsx · LangSelector.tsx
  Reveal.tsx                # animation d'entrée au scroll (IntersectionObserver)
  Faq.tsx                   # accordéon Radix
  Testimonials.tsx · DemoTestimonials.tsx
  BusinessSearch.tsx        # widget recherche commerce (Places + lead Supabase)
  DemoView.tsx              # rendu d'une vitrine de démo (scopée [data-vit])
  OrderModal.tsx            # modale de réservation/commande/devis (démo UI, sans backend)

lib/
  i18n.ts                   # toutes les chaînes UI, keyées FR/EN (objet `ui`)
  lang-context.tsx          # LangProvider, useLang(), useT() (cookie + localStorage)
  demos.ts                  # métadonnées des démos (galerie)
  vitrineContent.ts         # contenu complet de chaque vitrine
  stripe.ts                 # client Stripe + catalogue PLANS + constantes
  utils.ts                  # helpers (clsx/tailwind-merge)

supabase/
  business_leads.sql        # schéma de la table des leads

scripts/
  gen_characters.py         # génération d'images (KIE AI, text-to-image)
  gen_studio.py             # génération d'images (KIE AI)
  shoot.mjs                 # captures de vérification (Playwright)

public/                     # assets statiques (characters/*.webp, etc.)
```

## Routes

### Pages
- `/` — accueil agence (`app/page.tsx`).
- `/demo` — galerie des démos (`app/demo/page.tsx`).
- `/demo/[slug]` — vitrine de démo. `generateStaticParams()` pré-rend les slugs de
  `VITRINE_SLUGS` (`lib/vitrineContent.ts`) ; slug inconnu → `notFound()`.

### API (route handlers)
| Route | Méthode | Rôle |
|---|---|---|
| `/api/checkout` | POST | Crée une session Stripe Checkout (voir [STRIPE.md](./STRIPE.md)). |
| `/api/stripe/webhook` | POST | Webhook Stripe ; `runtime = "nodejs"` (corps brut nécessaire). |
| `/api/leads` | POST | Insère un lead dans Supabase via PostgREST (service_role). |
| `/api/places/autocomplete` | GET | Proxy Google Places Autocomplete (`?q=&lang=&sessiontoken=`). |
| `/api/places/details` | GET | Proxy Google Place Details (`?id=&lang=&sessiontoken=`). |

## Flux de données

### 1. Lead entreprise (Google Places → Supabase)
1. `BusinessSearch.tsx` appelle `GET /api/places/autocomplete?q=…&lang=…&sessiontoken=…`
   dès 3 caractères.
2. À la sélection, `GET /api/places/details?id=…&lang=…&sessiontoken=…` renvoie les
   champs textuels (identité, métier, adresse, géoloc, contact, note, avis, horaires).
3. Le composant poste l'objet vers `POST /api/leads`, qui filtre via une liste blanche
   de colonnes puis insère dans `public.business_leads` (PostgREST, en-têtes
   `apikey` / `Authorization: Bearer` = `SUPABASE_SERVICE_ROLE_KEY`).
4. Les deux proxies Places partagent un **session token** : autocomplétions gratuites,
   seul le Details final est facturé (optimisation de coût Google).

**Sécurité** : la clé Google Places (`GOOGLE_PLACES_API_KEY`) et la clé service_role
Supabase restent **côté serveur** (jamais exposées au client). `/api/leads` valide
`name` obligatoire et applique `source = 'google'` par défaut.

### 2. Paiement (Stripe)
Voir [STRIPE.md](./STRIPE.md). Résumé : `page.tsx` → `POST /api/checkout` →
redirection vers Stripe → retour sur `/` avec `?paiement=succes|annule` →
`POST /api/stripe/webhook` pose le `cancel_at` (cap 24 mois).

### 3. Vitrines de démo
Pages statiques rendues à partir de `lib/vitrineContent.ts` ; aucun appel réseau.
La modale `OrderModal` simule un tunnel de réservation/commande **localement**
(aucun appel backend, c'est une démonstration d'UX).

## Internationalisation (FR / EN)

- Toutes les chaînes UI vivent dans `lib/i18n.ts` (objet `ui` keyé `fr` / `en`),
  contenu des vitrines dans `lib/vitrineContent.ts` et `lib/demos.ts`.
- `lib/lang-context.tsx` : `LangProvider`, `useLang()`, `useT()`. La langue par
  défaut est **FR** (`DEFAULT_LANG`). Persistée via cookie `av_lang` (`LANG_COOKIE`)
  **et** `localStorage` ; détection au montage (cookie → localStorage → `navigator.language`).
- `components/LangSelector.tsx` : sélecteur à drapeaux 🇫🇷 / 🇺🇸 (`flag-icons`).
- Ajouter une langue : étendre `Lang`, `LANGS`, l'objet `ui`, et les maps
  `DEMO_TEXT` / `TEXT`.

## Base de données (Supabase)

Table `public.business_leads` (`supabase/business_leads.sql`) : identité, métier,
adresse décomposée, géolocalisation, contact, lien Maps, réputation (`rating`,
`user_rating_count`), `opening_hours` (`text[]`), `reviews` (`jsonb`), `business_status`.

- Clé primaire `id uuid` (`gen_random_uuid()`), `created_at timestamptz default now()`.
- `source` (`'google' | 'manual'`, défaut `'google'`), `name` obligatoire.
- Index : `created_at desc`, `place_id`.
- **RLS activé sans policy** : seul le `service_role` (qui contourne RLS) peut
  écrire/lire. La clé `anon` publique ne peut rien faire sur cette table.

## Rendu & build

- `output: "standalone"` → bundle serveur autonome (`server.js`) copié dans l'image
  Docker (voir [DEPLOY.md](./DEPLOY.md)).
- `next.config.js` : `images.formats = ["image/avif", "image/webp"]`,
  `minimumCacheTTL` = 1 an, `remotePatterns` autorisés :
  `images.unsplash.com` et `randomuser.me` (avatars de témoignages).
</content>
