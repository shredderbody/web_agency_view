# Suivi — Espace bilingue, `/<slug>/dashboard` et l'accueil à deux cartes

> **Fichier de reprise.** Si la session est coupée, relire ce fichier de haut en
> bas : l'état de chaque étape est à jour. Reprendre à la première étape `[ ]`.
> Mettre à jour ce fichier **après chaque étape**, jamais à la fin.

Dernière mise à jour : 2026-09-04 — ✅ **CHANTIER TERMINÉ ET EN SERVICE.**
Les douze étapes sont closes. Commits `2fe0772` et `a6d45e4` poussés sur `main`,
déployés et vérifiés sur https://receptionniste.zerocall.io.

## ✅ En service

    https://receptionniste.zerocall.io/<slug>/admin            l'accueil, 2 cartes
    https://receptionniste.zerocall.io/<slug>/admin/dashboard  le suivi
    https://receptionniste.zerocall.io/<slug>/admin/quotes     les devis (alias /devis)

Sur les douze vitrines, en **français et en anglais**, avec le même code d'accès
qu'avant. Les deux anciennes adresses de devis redirigent en 308.

La documentation de référence est [ESPACE_CLIENT.md](./ESPACE_CLIENT.md) et
[DEVIS_FACTURES.md](./DEVIS_FACTURES.md). Ce fichier-ci reste le journal de bord
du chantier.

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
| Adresses | `/<slug>/admin` = **accueil** (2 cartes) · `/<slug>/admin/dashboard` = le suivi · `/<slug>/admin/quotes` = les devis (alias `/admin/devis`) | l'adresse déjà donnée aux clients (`/admin`) **reste valide** et devient le hall d'entrée ; tout ce qui est protégé vit **sous** elle |
| Garde d'accès | posée dans `app/(portal)/[slug]/admin/layout.tsx`, **partagée par tout le segment** | c'est ce que le nid apporte de concret : une page ajoutée demain sous `/admin/` est protégée avant d'être écrite. Le chemin seul ne protège rien |
| Anciennes adresses | `/<slug>/quotes` et `/<slug>/devis` redirigent en **308** | elles ont vécu en production quelques heures ; elles ne cassent pas |
| Langue | cookie `av_lang`, **le même que le site public** | un visiteur qui a mis le site en anglais retrouve son espace en anglais, sans second réglage |
| Transport de la langue | lue au serveur dans le `layout` de l'espace, distribuée par un **contexte client** | sinon il faut passer `lang` en prop à travers dix composants, et un oubli passe inaperçu |
| Changement de langue | bouton FR/EN dans la barre → écrit le cookie puis `router.refresh()` | l'espace est `force-dynamic` : la page doit être **re-rendue par le serveur**, un simple état React ne retraduirait pas ce qui vient du serveur |
| Dictionnaire | `lib/portal/portalStrings.ts`, à part de `lib/i18n.ts` | `lib/i18n.ts` sert le site PUBLIC et part dans le bundle de chaque vitrine ; le vocabulaire d'un espace protégé n'a rien à y faire |
| Pluriels | **des fonctions**, jamais un `+ "s"` dans le composant | « 1 réservation / 2 réservations » et « 1 booking / 2 bookings » ne se forment pas au même endroit de la phrase selon la langue |
| Dates et nombres | `format.ts` prend la **locale** en argument | `fr-FR` était écrit en dur dans sept fonctions ; un espace anglais qui affiche « 4 septembre » n'est pas bilingue |
| Responsive | la barre bilingue, l'accueil et les tableaux repris **à 3 seuils** (560 / 780 / 1040 px), comme le reste de `espace.css` | demande explicite du client ; et un sélecteur de langue de plus dans une barre déjà dense casserait la barre sur téléphone si on ne s'en occupait pas |
| Authentification des devis | **inchangée** — la session existante | voir le constat ci-dessus : la protection est déjà là, en bâtir une seconde serait un second endroit où se tromper |

## Étapes

- [x] **1.** `lib/portal/portalStrings.ts` — le dictionnaire FR/EN de tout l'espace
- [x] **2.** `format.ts` bilingue (locale en argument) + contexte de langue client
- [x] **3.** `paths.ts` : `dashboardHref`, et ce que `spaceHref` désigne désormais
- [x] **4.** Déplacer les outils SOUS `/<slug>/admin/` + garde de layout partagée
- [x] **5.** Nouvelle page d'accueil `/<slug>/admin` à deux cartes (+ chargeur)
- [x] **6.** Bilinguer les composants : barre, tuiles, graphe, réservations, journal, fichier client
- [x] **7.** Bilinguer l'espace de l'agence et l'écran de connexion
- [x] **8.** Sélecteur de langue dans la barre d'application ET sur la connexion
- [x] **9.** Passe responsive : téléphone et tablette, dans les deux langues
- [x] **9b.** Build + vérification locale dans les deux langues
- [x] **10.** Commit + push
- [x] **11.** Redéploiement + vérification en production
- [x] **12.** Documentation (`docs/ESPACE_CLIENT.md`, `docs/DEVIS_FACTURES.md`, `docs/README.md`)

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
- **2026-09-04 · étape 2, le formatage** — `format.ts` prend maintenant la
  LANGUE en argument, partout. `fr-FR` y était écrit en dur dans sept fonctions,
  et c'est ce qui empêchait l'espace d'être réellement bilingue : un tableau de
  bord anglais qui annonce « 4 septembre » et « il y a 3 j » n'est pas traduit,
  il est **à moitié** traduit — ce qui se remarque davantage.
  Trois fonctions ajoutées pour les `Intl.DateTimeFormat` qui traînaient en dur
  dans les composants : `fmtMonth` (en-tête du calendrier), `fmtFullDay` (titre
  d'une journée sélectionnée), `fmtExact` (infobulle du journal).
  `toLocalInput` et `fromLocalInput` restent, elles, indépendantes de la langue :
  un `<input type="datetime-local">` parle toujours `AAAA-MM-JJTHH:MM`.
- **2026-09-04 · étape 2, la langue voyage par CONTEXTE, pas par prop** —
  `lib/portal/lang.ts` la lit au serveur (le même cookie `av_lang` que le site
  public), `app/(portal)/layout.tsx` la lit **une seule fois** et
  `lib/portal/i18nClient.tsx` la distribue. Une prop `lang` traversante à
  travers dix composants sur trois niveaux s'oublie quelque part, et l'oubli ne
  se voit pas : le composant continue d'afficher du français au milieu d'une
  page anglaise.
  Le changement de langue écrit le cookie **puis appelle `router.refresh()`** :
  les pages sont `force-dynamic`, un simple état React ne retraduirait pas ce
  qui vient du serveur. `useTransition` garde l'écran en place pendant l'aller
  et retour au lieu de le vider.
- **2026-09-04 · ⚠️ changement de structure demandé en cours de route** — les
  outils passent de `/<slug>/dashboard` et `/<slug>/quotes` à
  **`/<slug>/admin/dashboard`** et **`/<slug>/admin/quotes`**, « pour forcer
  l'accès par la page admin ».
  Le nid, seul, ne force rien : c'est la session qui protège, et elle protégeait
  déjà les deux adresses. Pour que le changement porte VRAIMENT ce qu'on lui
  demande, la garde a été posée dans `app/(portal)/[slug]/admin/layout.tsx`,
  **partagée par tout le segment** : slug inconnu ⇒ 404, pas de session ⇒
  connexion, mauvaise vitrine ⇒ retour chez soi. Une page ajoutée demain sous
  `/admin/` est protégée avant même d'avoir été écrite.
  Les pages gardent leur propre vérification par-dessus : leurs chargeurs ont de
  toute façon besoin de la session pour savoir quelle vitrine lire, et un
  contrôle d'accès qui ne tient qu'à un seul endroit tient mal.
  Les deux anciennes adresses redirigent en **308** (`next.config.js`). Le
  `(?!admin$)` de la règle écarte l'espace de l'agence — sans lui,
  `/admin/quotes` se redirigerait vers `/admin/admin/quotes`.
- **2026-09-04 · étape 5, l'accueil** — `lib/portal/spaceHome.ts` +
  `components/portal/SpaceHome.tsx`. Deux cartes, et **un seul chiffre par
  carte** (« 3 réservations à venir », « 2 devis · 1 facture ») : y remettre des
  tuiles de consommation aurait refait le tableau de bord en moins bien, et créé
  deux endroits où lire la même chose. La carte ENTIÈRE est le lien — viser un
  petit bouton au pouce, sur une page qui ne sert qu'à choisir, n'a pas de sens.
  Si Supabase ne répond pas, le chiffre disparaît et la carte reste : on
  n'empêche personne d'atteindre son outil de devis parce qu'on n'a pas su
  compter ses réservations.
- **2026-09-04 · demande ajoutée en cours de route : « multiresponsive, mobile
  tablette »** — inscrite comme étape 9. Trois pièces neuves à reprendre : le
  sélecteur de langue (une commande de plus dans une barre déjà dense), les
  cartes d'accueil, et les libellés anglais, plus longs que les français dans
  la plupart des cas — un bouton qui tient en français peut déborder en anglais.
- **2026-09-04 · étapes 6 et 7, les dix composants** — barre, tuiles, graphe,
  réservations, journal, fichier client, tableau de bord, espace de l'agence,
  écran de connexion. Un principe suivi partout : **ce qui est une décision de
  FORME reste dans le composant, ce qui est du TEXTE part au dictionnaire.**
  Concrètement, `LOOK` du journal ne porte plus que l'icône et le ton, `STATUS`
  des réservations plus que la classe de couleur : une pastille verte reste
  verte en anglais, seul son libellé change. Mélanger les deux dans une même
  table obligeait à traduire des noms de variables CSS.
- **2026-09-04 · étape 8, DEUX sélecteurs de langue, pas un** — dans la barre
  (FR/EN abrégé, la place y est comptée) et **en tête de l'écran de connexion**
  (les langues en toutes lettres). Le second n'est pas une redite : quelqu'un
  qui ne lit pas le français doit pouvoir basculer AVANT de chercher à
  comprendre les champs. Sur la connexion, il n'y a pas encore de barre.
- **2026-09-04 · étape 9, responsive** — trois choses ont changé de nature avec
  la traduction, et chacune a son seuil :
  1. **la barre porte une commande de plus.** Sous 680 px elle perdait déjà le
     logotype et les libellés ; le sélecteur de langue, lui, **reste** — c'est
     précisément la commande qu'on cherche quand on ne comprend pas l'écran. Ce
     sont les autres qui se resserrent autour ;
  2. **les libellés anglais sont plus longs** (« Reschedules & cancellations »
     contre « Reports & annulations »). Les segments de filtre débordaient : ils
     passent en grille de deux sur téléphone plutôt qu'en ligne de quatre ;
  3. **les cartes d'accueil** sont la première chose qu'on voit après connexion,
     souvent sur un téléphone tenu d'une main : elles gardent leur hauteur de
     frappe et ne perdent que du rembourrage (900 px puis 560 px).
- **2026-09-04 · étape 9b, build et vérification locale** — `npm run build`
  passe. Les quatre routes sont là :
  `/[slug]/admin` (3,3 kB) · `/[slug]/admin/dashboard` (5,96 kB) ·
  `/[slug]/admin/quotes` et `/admin/devis` (138 B) · `/admin` (2,79 kB).
  Serveur de production sur le port 3099, **quinze vérifications passées** :

  | Vérification | Résultat |
  |---|---|
  | `/pas-une-vitrine/admin` | **404** |
  | les quatre adresses sans session | **307** vers `/admin/login?demo=barbershop` |
  | `/barbershop/quotes` et `/devis` (anciennes) | **308** vers `/barbershop/admin/quotes` et `/admin/devis` |
  | accueil · suivi · devis, session ouverte, **en français** | 200 — « Votre espace », « Ouvrir le suivi », « Ouvrir les devis », « Suivi de votre standardiste » |
  | les trois mêmes, **en anglais** (`av_lang=en`) | 200 — « Your space », « Open the dashboard », « Open quotes », « receptionist, tracked » |
  | connexion FR et EN | 200 — « Accéder à votre espace » / « Sign in to your space », les deux langues offertes dans les deux cas |
  | espace agence FR et EN | 200 — « Toutes les vitrines » / « All sites », « Dernier signe » / « Last sign of life » |
  | français résiduel dans la page anglaise | **aucun** |
  | session `barbershop` sur `/ines-garden/admin` et `/admin/quotes` | **307** retour chez soi, dans les deux cas |

  Le dernier point mérite d'être noté : c'est la **garde du layout** qui répond
  pour `/ines-garden/admin/quotes`, avant même que la page ne s'exécute.
- **2026-09-04 · étape 12, documentation** — écrite AVANT le commit pour y
  entrer du même coup. `ESPACE_CLIENT.md` : les nouvelles adresses, la section
  « pourquoi tous les outils sont nichés sous `/<slug>/admin` », et une section
  bilingue complète. `DEVIS_FACTURES.md` : toutes les URL reprises (l'outil a
  déménagé le jour même de sa mise en service) et les redirections 308 notées.
  `README.md` : les deux fichiers de suivi indexés.
- **2026-09-04 · étapes 10 et 11, en production** — commit `a6d45e4` (30
  fichiers), poussé, puis `bash update.sh` en mode caddy : conteneur remplacé,
  `portal-sync` relancé, Caddy rechargé, contrôle de santé passé, URL publique
  en 200. Onze vérifications sur le domaine public :

  | Vérification | Résultat |
  |---|---|
  | `/pas-une-vitrine/admin` | **404** |
  | les trois adresses sans session | **307** vers la connexion |
  | `/barbershop/quotes` · `/devis` | **308** vers `/barbershop/admin/quotes` · `/admin/devis` |
  | accueil · suivi · devis, **français** | 200 — « Votre espace », « Ouvrir le suivi », « Ouvrir les devis » |
  | les trois mêmes, **anglais** | 200 — « Your space », « Open the dashboard », « Open quotes » |
  | session `barbershop` sur `/ines-garden/admin/quotes` | **307** retour chez soi — répondu par la garde du layout |

## Bilan

Les douze étapes sont closes. Deux points méritent d'être retenus pour la suite :

1. **Le nid d'URL ne protège rien par lui-même.** Ce qui protège, c'est le
   `layout.tsx` que le nid fait partager. La demande était « forcer l'accès par
   la page admin » ; c'est le layout qui l'exécute, pas le chemin.
2. **La traduction a coûté plus cher hors des textes que dedans.** Les 180
   chaînes se remplacent mécaniquement ; ce sont `fr-FR` écrit en dur dans sept
   fonctions de formatage, les pluriels formés au milieu du JSX, et les tables
   qui mêlaient libellé et couleur qui ont demandé de la réflexion.
