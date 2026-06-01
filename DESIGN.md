# DESIGN.md — Atelier Vitrine

Tokens et conventions. Source de vérité technique : `app/globals.css`.

## Stratégie couleur
Marque agence : **Committed** — toile crème chaude, encre profonde, accent vermillon. Neutres teintés vers le hue chaud (jamais `#000`/`#fff`). Tout en OKLCH.

| Rôle | Token | Valeur |
|---|---|---|
| Toile | `--paper` | `oklch(0.972 0.012 84)` |
| Toile 2 / sections | `--paper-2` | `oklch(0.952 0.016 80)` |
| Surface / cartes | `--surface` | `oklch(0.992 0.006 86)` |
| Encre (texte) | `--ink` | `oklch(0.235 0.018 55)` |
| Encre atténuée | `--ink-dim` | `oklch(0.43 0.022 55)` |
| Encre sourde | `--ink-muted` | `oklch(0.585 0.02 60)` |
| Accent | `--vermilion` | `oklch(0.605 0.2 33)` |
| Accent profond | `--vermilion-deep` | `oklch(0.5 0.18 32)` |
| Tertiaire chaud | `--clay` | `oklch(0.74 0.11 66)` |

## Vitrines de démo (mondes scopés)
Chaque démo applique une palette + police via `[data-vit="…"]` dans `globals.css`, consommée par les classes `.vit-*` et les vars `--bg / --bg-2 / --surf / --fg / --fg-dim / --accent / --line`.
- `barber` : espresso sombre, laiton + braise, display **Anton** (capitales).
- `onglerie` : blush + crème, rose / rose-gold, display **Marcellus** (serif).
- `traiteur` : crème, lie-de-vin + terre cuite, display **Bricolage Grotesque**.
- `resto` : vert nuit, bougie + sauge, display **Marcellus**.

## Typographie
- Display marque : **Bricolage Grotesque** (`--font-display`), poids 600-700, tracking serré (-0.025 à -0.035em).
- Corps / UI : **Hanken Grotesk** (`--font-body`), line-height 1.65, mesure ≤ 65ch.
- Accent italique : **Marcellus** (`.serif-accent`) pour un mot-clé du titre.
- Échelle fluide `clamp()`, ratio ≥ 1.25 entre les pas (`.d-hero / .d-xl / .d-lg / .d-md`).

## Élévation & rayons
Rayons : `--r-sm .5rem`, `--r .9rem`, `--r-lg 1.4rem`, `--r-xl 2.2rem`. Ombres chaudes teintées encre (`--shadow-sm/-/-lg`). Cartes : bord 1px `--border`, hover translateY(-5px) + ombre.

## Motion
- Entrée au scroll via `<Reveal>` (IntersectionObserver, `rise` 0.8s ease-out). Respecte `prefers-reduced-motion`.
- Easing maison `--ease cubic-bezier(0.16,1,0.3,1)`. Pas de bounce. On n'anime pas les propriétés de layout.

## Interdits (rappel)
Pas de texte en dégradé, pas de bordure-accent latérale > 1px, pas de glassmorphism décoratif par défaut, pas de tirets cadratins dans la copie, pas de grilles de cartes identiques.
