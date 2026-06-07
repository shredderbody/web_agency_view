# Atelier Vitrine

Site marketing d'un studio web qui crée des vitrines en ligne sur-mesure pour les commerces de quartier (barbiers, ongleries, charcutiers-traiteurs, restaurants). Le site présente l'offre **et** fait visiter des vitrines de démonstration complètes, chacune dans son propre univers visuel.

> 📚 **Documentation complète** dans [`docs/`](./docs/) :
> [PRODUCT](./docs/PRODUCT.md) · [DESIGN](./docs/DESIGN.md) · [ARCHITECTURE](./docs/ARCHITECTURE.md) · [DEVELOPMENT](./docs/DEVELOPMENT.md) · [DEPLOY](./docs/DEPLOY.md) · [STRIPE](./docs/STRIPE.md) — index : [docs/README.md](./docs/README.md).

## Stack
- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v3.4 + design system maison (tokens OKLCH) dans `app/globals.css`
- Polices : Bricolage Grotesque, Hanken Grotesk, Anton, Marcellus (`next/font/google`)
- Icônes : `lucide-react`

## Démarrer
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```

## Structure
```
app/
  page.tsx              # Accueil (agence)
  demo/page.tsx         # Galerie des vitrines de démo
  demo/[slug]/page.tsx  # Une vitrine de démo (univers scopé via [data-vit])
  not-found.tsx · icon.svg · globals.css · layout.tsx
components/             # SiteNav, SiteFooter, Faq, Reveal
lib/
  demos.ts              # Métadonnées des démos (galerie)
  vitrineContent.ts     # Contenu complet de chaque vitrine
public/characters/      # Imagerie générée (portraits, planches-contact, scènes)
scripts/
  gen_characters.py     # Génération d'images via KIE AI (text-to-image)
  shoot.mjs             # Captures de vérification (Playwright)
```

## Internationalisation (FR / EN)
Bilingue via un contexte client léger. Toutes les chaînes vivent dans `lib/i18n.ts`
(UI) et `lib/vitrineContent.ts` / `lib/demos.ts` (contenu des vitrines), keyées par langue.
- `lib/lang-context.tsx` : `LangProvider`, `useT()`, `useLang()` (persistance cookie + localStorage, FR par défaut).
- `components/LangSelector.tsx` : sélecteur à drapeaux 🇫🇷 / 🇺🇸 (`flag-icons`), présent sur toutes les pages.
- Ajouter une langue : étendre `Lang`, `LANGS`, `ui`, et les maps `DEMO_TEXT` / `TEXT`.

## Responsive
Mobile-first, breakpoints desktop / tablette / mobile. Menu hamburger sous 1000px
(nav agence) et sous 860px (pages métier). Images en WebP, jamais croppées pour les
planches-contact (affichées en entier).

## Imagerie sur-mesure
Les visuels de chaque métier (portrait d'artisan, planche-contact, scène de boutique,
détail produit) sont générés via l'API KIE (`gpt-image-2-text-to-image`) puis convertis en WebP.

```bash
KIE_API_KEY=... python3 scripts/gen_characters.py   # -> public/characters/*.webp (PNG puis cwebp)
```

Voir `PRODUCT.md` et `DESIGN.md` pour la direction de marque et les tokens.
