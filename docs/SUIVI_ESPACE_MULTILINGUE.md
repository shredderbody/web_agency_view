# Suivi — Espace bilingue, `/<slug>/dashboard` et l'accueil à deux cartes

> **Fichier de reprise.** Si la session est coupée, relire ce fichier de haut en
> bas : l'état de chaque étape est à jour. Reprendre à la première étape `[ ]`.
> Mettre à jour ce fichier **après chaque étape**, jamais à la fin.

Dernière mise à jour : 2026-09-04 — 🚧 **CHANTIER EN COURS.** Étape 1 faite
(dictionnaire bilingue). L'arbre **compile** (`npx tsc --noEmit` : zéro erreur)
et la production n'est **pas** affectée : à ce stade rien n'est encore branché,
le dictionnaire est un module additif que personne n'importe.

## ⏯️ Reprendre ici

Reprendre à l'**étape 2**. Voir la liste des étapes plus bas.

⚠️ **NE PAS DÉPLOYER entre les étapes 3 et 6.** Le déplacement de
`/<slug>/admin` vers `/<slug>/dashboard` et la création de la nouvelle page
d'accueil forment un tout : déployer au milieu casse l'adresse que les clients
ont déjà en main.

## Demande

> « Maintenant faut protéger la page quotes, donc mise en place aussi d'un login
> pour accéder la page pour faire des devis, utilise les mêmes codes d'accès que
> admin. Change `/slug/admin` par `/slug/dashboard` comme ça possibilité de
> libérer la page admin, qui ouvrira la page admin après authentification deux
> cards dont un dashboard et l'autre card pour quotes. Toutes les pages doivent
> être en multilingues. »

Traduction en exigences :

1. **La page devis est protégée** par la même authentification que l'espace —
   mêmes codes d'accès, même session.
2. **`/<slug>/admin` devient `/<slug>/dashboard`** : le tableau de bord déménage.
3. **`/<slug>/admin` est libérée** et devient une **page d'accueil authentifiée**
   à **deux cartes** : le suivi, et les devis.
4. **Toutes les pages de l'espace sont bilingues** FR / EN.

## Constat préalable — le point 1 est DÉJÀ tenu

Vérifié en production avant de toucher au code :

```
GET /barbershop/quotes  sans session  → 307 vers /admin/login?demo=barbershop
GET /barbershop/devis   sans session  → 307 vers /admin/login?demo=barbershop
GET /pas-une-vitrine/quotes           → 404
session barbershop sur /ines-garden/quotes → 307 retour chez soi
session barbershop sur GET ?slug=ines-garden → 403
```

La page de devis passe par `loadQuotesPage` (`lib/portal/quotesPage.ts`), qui
applique **exactement** les gardes de `/<slug>/admin` : `currentSession()` puis
`canAccess()`, les mêmes codes d'accès dérivés de `PORTAL_SECRET`, le même
cookie HMAC `av_espace`. Il n'y a donc **pas un second système de connexion à
bâtir** — ce serait un second endroit où se tromper.

Ce qui manquait n'était pas la protection mais sa **lisibilité** : après
connexion on tombait directement sur le tableau de bord, et rien ne disait que
l'outil de devis existait derrière le même code. C'est précisément ce que la
page d'accueil à deux cartes règle.

## Décisions d'architecture

| Sujet | Décision | Pourquoi |
|---|---|---|
| Adresses | `/<slug>/admin` = **accueil** (2 cartes) · `/<slug>/dashboard` = le suivi · `/<slug>/quotes` = les devis | l'adresse déjà donnée aux clients (`/admin`) **reste valide** et devient le hall d'entrée ; personne ne se retrouve devant une 404 |
| Langue | cookie `av_lang`, **le même que le site public** | un visiteur qui a mis le site en anglais retrouve son espace en anglais, sans second réglage |
| Transport de la langue | lue au serveur dans le `layout` de l'espace, distribuée par un **contexte client** | sinon il faut passer `lang` en prop à travers dix composants, et un oubli passe inaperçu |
| Changement de langue | bouton FR/EN dans la barre → écrit le cookie puis `router.refresh()` | l'espace est `force-dynamic` : la page doit être **re-rendue par le serveur**, un simple état React ne retraduirait pas ce qui vient du serveur |
| Dictionnaire | `lib/portal/portalStrings.ts`, à part de `lib/i18n.ts` | `lib/i18n.ts` sert le site PUBLIC et part dans le bundle de chaque vitrine ; le vocabulaire d'un espace protégé n'a rien à y faire |
| Pluriels | **des fonctions**, jamais un `+ "s"` dans le composant | « 1 réservation / 2 réservations » et « 1 booking / 2 bookings » ne se forment pas au même endroit de la phrase selon la langue |
| Dates et nombres | `format.ts` prend la **locale** en argument | `fr-FR` était écrit en dur dans sept fonctions ; un espace anglais qui affiche « 4 septembre » n'est pas bilingue |
| Authentification des devis | **inchangée** — la session existante | voir le constat ci-dessus : la protection est déjà là, en bâtir une seconde serait un second endroit où se tromper |

## Étapes

- [x] **1.** `lib/portal/portalStrings.ts` — le dictionnaire FR/EN de tout l'espace
- [ ] **2.** `format.ts` bilingue (locale en argument) + contexte de langue client
- [ ] **3.** `paths.ts` : `dashboardHref`, et ce que `spaceHref` désigne désormais
- [ ] **4.** Déplacer le tableau de bord vers `/<slug>/dashboard`
- [ ] **5.** Nouvelle page d'accueil `/<slug>/admin` à deux cartes (+ chargeur)
- [ ] **6.** Bilinguer les composants : barre, tuiles, graphe, réservations, journal, fichier client
- [ ] **7.** Bilinguer l'espace de l'agence et l'écran de connexion
- [ ] **8.** Sélecteur de langue dans la barre d'application
- [ ] **9.** Build + vérification locale dans les deux langues
- [ ] **10.** Commit + push
- [ ] **11.** Redéploiement + vérification en production
- [ ] **12.** Documentation (`docs/ESPACE_CLIENT.md`, `docs/README.md`)

## Journal

- **2026-09-04 · audit** — les dix composants de `components/portal/` relevés un
  par un : **environ 180 chaînes françaises en dur**, plus `fr-FR` écrit en dur
  dans les sept fonctions de `format.ts` et dans trois `Intl.DateTimeFormat`
  disséminés (libellé de mois du calendrier, en-tête de jour sélectionné,
  infobulle du journal). Rien n'était prévu pour une seconde langue.
- **2026-09-04 · la protection des devis était déjà en place** — vérifiée en
  production avant d'écrire une ligne (404 / 307 / 403, cf. tableau ci-dessus).
  La demande porte donc sur la **lisibilité** de cette protection, pas sur son
  existence : c'est la page d'accueil à deux cartes qui la rend évidente.
- **2026-09-04 · étape 1, le dictionnaire** — `lib/portal/portalStrings.ts`,
  FR et EN, couvrant les dix composants et les quatre pages. Deux règles
  d'écriture tenues : **le pluriel est une fonction**, et **pas de `as const`**
  sur le dictionnaire français — il figerait chaque libellé en type littéral et
  la version anglaise ne pourrait plus être du même type (la leçon avait déjà
  été payée sur `documentsStrings.ts`).
  `npx tsc --noEmit` : zéro erreur. Module additif, rien n'est encore branché.
