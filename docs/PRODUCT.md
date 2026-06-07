# PRODUCT — Atelier Vitrine

**Register :** brand. Document de produit, déduit du code (`app/`, `lib/i18n.ts`,
`lib/demos.ts`, `lib/vitrineContent.ts`).

## Produit

Atelier Vitrine est un studio web qui conçoit et héberge des sites vitrines
sur-mesure pour les commerces de proximité francophones : barbiers, ongleries,
charcutiers-traiteurs, restaurants, plombiers, et métiers de bouche/soin/artisanat
similaires. Argument central : avant de s'engager, le prospect peut visualiser une
**vitrine de démonstration** complète et navigable, dans l'univers de son métier.

Le site marketing sert deux objectifs :

1. **Convaincre** le commerçant que son métier mérite mieux qu'une fiche Google
   (sections valeur, audience, méthode, tarifs, FAQ, témoignages sur la home).
2. **Faire visiter** des vitrines de démonstration complètes (`/demo` puis
   `/demo/<slug>`), chacune dans son propre monde visuel, pour matérialiser la
   promesse « voyez votre future vitrine ».

## Parcours utilisateur (réel, vérifié dans le code)

1. **Accueil** (`app/page.tsx`) : hero, valeur, audience, métiers, contenu inclus,
   méthode, **tarifs**, add-ons, témoignages, FAQ, footer.
2. **Widget « cherchez votre commerce »** (`components/BusinessSearch.tsx`) :
   le visiteur tape le nom de son établissement → autocomplétion Google Places →
   prévisualisation de la fiche (note, avis, horaires) → un **lead** est enregistré
   dans Supabase via `/api/leads`.
3. **Galerie de démos** (`app/demo/page.tsx`) : cartes des vitrines disponibles.
4. **Vitrine de démo** (`app/demo/[slug]/page.tsx` → `components/DemoView.tsx`) :
   une mini-vitrine complète scopée à son univers (`[data-vit]`), avec un
   **OrderModal** simulant une réservation / commande / devis (démo UI, sans backend).
5. **Tarifs → paiement** : les formules **Essentielle** et **Atelier** lancent un
   **Stripe Checkout** (voir [STRIPE.md](./STRIPE.md)). La formule **Signature** est
   « Sur devis » (pas de paiement automatique). Retour sur la home avec bannière de
   confirmation/annulation.

## Utilisateurs

Gérants de TPE / commerces locaux, 30-60 ans, peu à l'aise avec le jargon web,
sensibles à la preuve concrète et au prix annoncé d'avance. Ils décident vite si
« ça leur ressemble ».

## Offre & tarifs (source : `lib/i18n.ts` → `pricing.plans`)

Trois formules affichées sur la home :

| Formule | Prix de mise en place | Abonnement | Paiement Stripe |
|---|---|---|---|
| **Essentielle** | 490 € | + 49 €/mois | Oui (`plan=essentielle`) |
| **Atelier** (mise en avant) | 990 € | + 49 €/mois | Oui (`plan=atelier`) |
| **Signature** | Sur devis | projet dédié | Non — prise de contact |

L'abonnement mensuel (49 €) est plafonné à **24 mois** côté Stripe (voir
[STRIPE.md](./STRIPE.md)). Des **add-ons** sont listés (`addons` dans `lib/i18n.ts`)
mais ne déclenchent pas de paiement automatique.

> Note de cohérence : la FAQ FR mentionne « à partir de 499 € » alors que le tableau
> de prix et le code Stripe utilisent **490 €**. Écart purement éditorial dans le
> texte de la FAQ, à harmoniser si besoin.

## Vitrines de démonstration (source : `lib/demos.ts`)

Cinq mondes, chacun avec son entreprise fictive, sa ville, sa palette et ses visuels :

| Slug | Entreprise | Ville | Univers (`vit`) |
|---|---|---|---|
| `barbershop` | Maison Brutus | Lyon 1er | `barber` |
| `onglerie` | L'Atelier Rosé | Bordeaux | `onglerie` |
| `traiteur` | Maison Ferrand | Annecy | `traiteur` |
| `restaurant` | Le Comptoir 12 | Paris 11e | `resto` |
| `plombier` | Plomberie Mercier | Nantes | `plombier` |

Chaque vitrine consomme son contenu complet dans `lib/vitrineContent.ts` et applique
son univers visuel via `[data-vit="…"]` (voir [DESIGN.md](./DESIGN.md)).

## Voix de marque

Artisanale, chaleureuse, confiante, sans jargon. Trois mots-objets :
*atelier · enseigne peinte à la main · papier kraft*. On parle le langage du
commerçant, pas celui de l'agence digitale.

## Anti-références (rappel directionnel)

- Le cliché « agence web » : fond sombre néon, dégradés, Inter/Space Grotesk, buzzwords.
- Les templates SaaS génériques (grille de cartes icône-titre-texte identiques, hero-metric).
- L'éditorial-magazine par défaut (serif italique + lettrines + grille broadsheet)
  hors brief magazine.

## Principes produit

- **Imagerie sur-mesure** : chaque métier a ses propres visuels (générés via KIE AI,
  voir [DEVELOPMENT.md](./DEVELOPMENT.md)).
- Chaque vitrine de démo est un **monde distinct** (palette, police, imagerie) ;
  cohérence de voix, pas de traitement uniforme.
- **Bilingue FR/EN** : tout le contenu est keyé par langue.
- **Prix clair**, promesse concrète (livraison annoncée 7 jours), zéro engagement piège.
</content>
