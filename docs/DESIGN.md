# DESIGN — Atelier Vitrine

Design system réel. **Source de vérité technique : `app/globals.css`** (374 lignes),
complétée par `tailwind.config.js` et le chargement des polices dans `app/layout.tsx`.

## Tailwind

- **Tailwind CSS v3.4** (config classique `tailwind.config.js`, PostCSS via
  `postcss.config.mjs` : plugins `tailwindcss` + `autoprefixer`).
- `app/globals.css` ouvre sur `@tailwind base; @tailwind components; @tailwind utilities;`.
- `tailwind.config.js` mappe quelques utilitaires sur les tokens CSS :
  - couleurs : `background` → `--surface`, `foreground` → `--ink`,
    `primary` → `--vermilion`, `muted` → `--paper-2`, `border` → `--border`,
    `ring` → `--vermilion`, `card` → `--surface`.
  - rayons : `lg` → `--r-lg`, `md` → `--r`, `sm` → `--r-sm`.
  - animations Radix : `accordion-down` / `accordion-up` (keyframes redéfinies aussi
    dans `globals.css`).

> Note : le code applique l'essentiel du design via du **CSS maison** (classes `.d-*`,
> `.kicker`, `.chip`, `.wrap`, etc.) et des tokens OKLCH, plutôt que via des utilitaires
> Tailwind. Tailwind sert surtout la base/reset et quelques mappings.

## Stratégie couleur — marque agence

Stratégie **Committed** : toile crème chaude, encre profonde, accent vermillon.
Neutres teintés vers le hue chaud (jamais `#000` / `#fff`). Tout en **OKLCH**.
Définis dans `:root` (`app/globals.css`).

| Rôle | Token | Valeur |
|---|---|---|
| Toile | `--paper` | `oklch(0.972 0.012 84)` |
| Toile 2 / sections | `--paper-2` | `oklch(0.952 0.016 80)` |
| Toile 3 | `--paper-3` | `oklch(0.93 0.02 78)` |
| Surface / cartes | `--surface` | `oklch(0.992 0.006 86)` |
| Encre (texte) | `--ink` | `oklch(0.235 0.018 55)` |
| Encre atténuée | `--ink-dim` | `oklch(0.43 0.022 55)` |
| Encre sourde | `--ink-muted` | `oklch(0.585 0.02 60)` |
| Accent | `--vermilion` | `oklch(0.605 0.2 33)` |
| Accent profond | `--vermilion-deep` | `oklch(0.5 0.18 32)` |
| Accent doux | `--vermilion-soft` | `oklch(0.93 0.045 45)` |
| Tertiaire chaud | `--clay` | `oklch(0.74 0.11 66)` |
| Tertiaire profond | `--clay-deep` | `oklch(0.62 0.11 64)` |
| Nuit | `--night` | `oklch(0.255 0.025 60)` |
| Bord | `--border` | `oklch(0.235 0.018 55 / 0.12)` |
| Bord renforcé | `--border-strong` | `oklch(0.235 0.018 55 / 0.22)` |

## Typographie

Polices chargées via `next/font/google` dans `app/layout.tsx`, exposées en variables
CSS sur `<html>` :

| Police | Variable next/font | Rôle |
|---|---|---|
| **Bricolage Grotesque** | `--font-bricolage` | display marque |
| **Hanken Grotesk** | `--font-hanken` | corps / UI |
| **Anton** (400) | `--font-anton` | display vitrine « barber » |
| **Marcellus** (400) | `--font-marcellus` | accent serif / vitrines élégantes |

Le CSS (`globals.css`) référence des **alias logiques** : `--font-display`,
`--font-body`, `--font-elegant`, `--font-barber` (ex. `.d-hero { font-family: var(--font-display) }`,
`body { font-family: var(--font-body) }`).

> ✅ **Anomalie corrigée le 2026-09-03.** Ces alias `--font-display`, `--font-body`,
> `--font-elegant`, `--font-barber` n'étaient **définis nulle part** : chaque
> `font-family: var(--font-display)` tombait sur une variable indéfinie, donc sur
> la pile sans-serif par défaut de la base Tailwind. Les quatre polices étaient
> chargées par `layout.tsx`, payées en octets, et jamais appliquées (vérifié au
> navigateur sur la production : `ui-sans-serif, system-ui` partout, corps comme
> titres). Un bloc d'aliasing a été ajouté dans `:root` de `app/globals.css` :
> `--font-display: var(--font-bricolage)`, `--font-body: var(--font-hanken)`,
> `--font-elegant: var(--font-marcellus)`, `--font-barber: var(--font-anton)`,
> chacun avec sa pile de repli. La typographie de marque s'applique désormais
> réellement sur tout le site et les douze vitrines.

Échelle de titres (classes CSS, `clamp()` fluide) : `.d-hero`, `.d-xl`, `.d-lg`,
`.d-md`. Accent italique : `.serif-accent` (poids 400, italique). Largeur de contenu :
`.wrap` (max 1240px) / `.wrap-tight` (max 980px). Corps : `line-height: 1.65`,
`font-feature-settings: "ss01", "cv01"`.

## Vitrines de démo — mondes scopés

Chaque démo applique sa palette + sa police via `[data-vit="…"]` dans `globals.css`,
consommée par les classes `.vit-*` et les variables locales
`--bg / --bg-2 / --surf / --fg / --fg-dim / --accent / --line` ainsi que
`--vit-display` / `--vit-body`.

| `data-vit` | Ambiance | Accent | Display (`--vit-display`) |
|---|---|---|---|
| `barber` | espresso sombre | laiton / braise | `--font-barber` (Anton, capitales) |
| `onglerie` | blush + crème | rose / rose-gold | `--font-elegant` (Marcellus, serif) |
| `traiteur` | crème | lie-de-vin / terre cuite | `--font-display` (Bricolage) |
| `resto` | vert nuit | bougie / sauge | `--font-elegant` (Marcellus) |
| `plombier` | bleu clair / ardoise | bleu / cuivre | `--font-display` (Bricolage) |

(Le même aliasing vaut pour `--vit-display` / `--vit-body`, corrigé en même temps.)

## Élévation & rayons

- Rayons : `--r-sm 0.5rem`, `--r 0.9rem`, `--r-lg 1.4rem`, `--r-xl 2.2rem`.
- Ombres chaudes teintées encre : `--shadow-sm`, `--shadow`, `--shadow-lg`.
- Cartes : bord 1px `--border`, élévation au survol.

## Motion

- Entrée au scroll via `<Reveal>` (`components/Reveal.tsx`, IntersectionObserver).
  Le script de captures `scripts/shoot.mjs` neutralise l'animation `.reveal` pour des
  screenshots stables.
- Easing maison : `--ease: cubic-bezier(0.16, 1, 0.3, 1)` et
  `--ease-quart: cubic-bezier(0.25, 1, 0.5, 1)`.
- Accordéon (FAQ) via `@radix-ui/react-accordion` + keyframes `accordion-down/up`.

## Interdits (rappel directionnel)

Pas de texte en dégradé, pas de bordure-accent latérale > 1px, pas de glassmorphism
décoratif par défaut, pas de tirets cadratins dans la copie, pas de grilles de cartes
identiques.
</content>
