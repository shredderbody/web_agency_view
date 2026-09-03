# Suivi — Espace client des démos (login, consommation, réservations, admin)

> **Fichier de reprise.** Si la session est coupée, relire ce fichier de haut en
> bas : l'état de chaque étape est à jour. Reprendre à la première étape `[ ]`.
> Mettre à jour ce fichier **après chaque étape**, jamais à la fin.

Dernière mise à jour : 2026-09-03 — en service sur https://receptionniste.zerocall.io.
Lot 2 terminé et en service (comptes de démonstration par vitrine + petits
écrans, étapes 13 à 15) — commits `fb98add` et `424991c`.
**Lot 3 terminé et en service** : URL déménagées vers `/<slug>/admin` — commit `d6575ea`.

## Demande

1. Reprendre le **login de `~/receptionist`** et l'adapter aux **slugs de démo**.
2. Mettre en avant la **consommation des appels et des messages** (suivi complet).
3. Un slug **`admin`** → vision administrateur sur **toutes** les démos.
4. Intégrer un **calendrier** pour voir / mettre à jour les **réservations**
   (vue calendrier **et** vue cards).
5. Compléter ce qui manque, cohérence des templates de démo, design soigné.
6. **Rebuild + redéploiement Docker** en fin de chantier.

### Précision du 2026-09-03 (message en cours de chantier)

> « l'objectif est d'avoir une **traçabilité complète des ACTIONS** — pas du
> contenu de discussion, mais des actions : booking, annulation, reschedule, etc.
> — et le **client avec ses coordonnées** pour le suivi. **Stockage dans Supabase**
> puis **relecture depuis Supabase**. »

Conséquences, actées :

- On ne stocke ni transcript ni contenu de conversation. **Une action = une ligne.**
- Le modèle passe de « lire l'API Vapi » à **3 tables Supabase** (migration 005) :
  `demo_customers` (fiche client) · `demo_reservations` (état courant) ·
  `demo_actions` (journal immuable : qui, quoi, quand, avant → après).
- `demo_bookings` reste la **boîte de réception brute** où n8n écrit ; une
  **projection idempotente** (clé `tool_call_id`) la déverse dans les 3 tables.
- L'espace client lit **uniquement Supabase**. L'API Vapi ne sert plus qu'à la
  synchro de consommation (`demo_usage_daily`), jamais à l'affichage direct.

## Décisions d'architecture (arrêtées le 2026-09-03)

| Sujet | Décision | Pourquoi |
|---|---|---|
| URL | `/espace/login` puis `/espace/[slug]` | ne touche pas à `/demo/[slug]` (public) |
| Slug `admin` | `/espace/admin` — même route, rôle `admin` | exactement la demande |
| Auth | cookie **HttpOnly signé HMAC-SHA256** (`node:crypto`), pas de dépendance | le Supabase auth de receptionist est un AUTRE projet ; aucune table `profiles` ici |
| Codes d'accès | **dérivés** `HMAC(PORTAL_SECRET, slug)` → 8 caractères, surchargeables par `PORTAL_CODE_<SLUG>` | aucun secret à créer par démo ; l'admin les lit dans son tableau de bord |
| Consommation appels | **API Vapi** `GET /call?assistantId=…` (coût, durée, breakdown) | source de vérité |
| Consommation messages | **API Vapi** `GET /chat?assistantId=…` (messages + coût chat) | le widget est hybride chat+call |
| ⚠️ Rétention Vapi | **14 jours** sur ce plan (erreur 400 au-delà) | → archivage local obligatoire |
| Archive consommation | table `public.demo_usage_daily` + route de sync | conserve l'historique au-delà des 14 j |
| Réservations | table `public.demo_bookings` du projet **GritUnited** `bbxwezoscjuwsoflponx` | c'est là que le workflow n8n écrit |
| Écriture réservation | colonnes `status`, `starts_at`, `customer_*`, `notes`, `updated_at`, `demo_slug` (migration 004) | permet update/annulation depuis l'espace |
| `payload` | jsonb contenant parfois une **chaîne** JSON (écriture n8n) | normalisation côté app obligatoire |

## Ressources vérifiées

| Ressource | Valeur / état |
|---|---|
| Démos | 12 slugs (`lib/vapi.ts` `CONFIG`) — 1 assistant Vapi dédié chacun |
| Supabase repo | `uvpuhoyaovmztephqknq` — **répond de nouveau** (n'est plus en pause) |
| Supabase n8n/démo | `bbxwezoscjuwsoflponx` (GritUnited) — contient les vraies lignes |
| Clé Vapi privée | `.env` `VAPI_PRIVATE_KEY` — testée OK (`/call`, `/chat`) |
| Docker | `docker-compose.yml` (service `web`, port 3010) + `update.sh` (mode caddy) |
| Domaine public | `https://receptionniste.zerocall.io` |

## Étapes

- [x] **1.** Audit : login receptionist, démos, tables, API Vapi, Docker
- [x] **2.** Migration `004_portal_espace_client.sql` (colonnes réservation + `demo_usage_daily`) + application sur les 2 projets
- [x] **3a.** `lib/portal/registry.ts` — 12 tenants, clé `assistant_id`
- [x] **3b.** Migration `005_portal_ledger.sql` — `demo_customers` / `demo_reservations` / `demo_actions` (appliquée sur les 2 projets)
- [x] **3c.** Socle serveur : `lib/portal/*` — `registry` `supabase` `phone` `time` `auth` `types` `ledger` `projection` `usage`
- [x] **4.** Routes API `/api/portal/*` — `login` `logout` `actions` `reservations` `sync` — **testées sur données réelles**
- [x] **5.** UI login `/espace/login` — repris de receptionist, charte Atelier Vitrine
- [x] **6.** UI espace démo `/espace/[slug]` — 4 onglets, tuiles + graphe + tableau chiffré
- [x] **7.** UI calendrier + cartes, édition en place (confirmer / reporter / annuler / note)
- [x] **8.** UI admin `/espace/admin` — 12 vitrines, codes d'accès copiables, journal global
- [x] **9.** Cohérence : alias de polices corrigé + lien « Espace client » au pied du site + boucle de synchro
- [x] **10.** `npm run build` + `tsc --noEmit` : OK
- [x] **11.** Rebuild Docker + redéploiement (`bash update.sh`) + vérif publique
- [x] **12.** Doc (`docs/ESPACE_CLIENT.md`, index, `docs/DESIGN.md`) + mémoire + commits

## Lot 2 — comptes de démonstration & petits écrans (2026-09-03, après mise en service)

Deux demandes arrivées après la mise en service, traitées à la suite.

**A. Un compte e-mail + mot de passe pour entrer.** Livré d'abord en compte
unique (`test@debug.com` → administration), puis **corrigé sur remarque du
demandeur** : ce n'est pas ce qu'il fallait. Il faut **un compte PAR DÉMO** —
quand on montre une vitrine à un prospect, il se connecte à SA démo et n'y voit
que SES données, pas la consommation des onze autres ni leurs codes d'accès.

Forme retenue : `<slug>@debug.com` → session **`client`** sur `/espace/<slug>`
(cette vitrine seule) ; `test@debug.com` → session **`admin`** (toutes les
vitrines). Mot de passe commun `Test123!` : il se dicte à voix haute devant un
prospect. Surcharges : `PORTAL_TEST_DOMAIN`, `PORTAL_TEST_EMAIL[_<SLUG>]`,
`PORTAL_TEST_PASSWORD[_<SLUG>]`, et `PORTAL_TEST_ACCOUNT=off` qui ferme tout.

**B. Espace administrateur sur tablette et téléphone.** Le tableau « par
vitrine » (onze colonnes) cède la place à **une carte par vitrine sous 1040 px**.

### Étapes

- [x] **13.** Lot A, première version : compte unique `test@debug.com` → admin
      (`lib/portal/auth.ts`, route de login, onglet « Identifiants »)
- [x] **14.** Lot B : cartes « par vitrine » < 1040 px, tuiles 2 colonnes < 560 px,
      première colonne des tableaux épinglée, `UsageChart` à la largeur réelle
      du conteneur + réponse au doigt — **vérifié 390 / 820 / 1280**
- [x] **14b.** Commit `fb98add`, push, `bash update.sh`, vérifié en production
- [ ] **15.** Lot A, reprise : **un compte par démo** (la vraie demande)
  - [x] `lib/portal/auth.ts` — `testEmailFor` / `testPasswordFor` /
        `testAccountFor`, `verifyCredentials` renvoie `{ slug, role }`
  - [x] `POST /api/portal/login` — l'e-mail choisit l'espace ouvert
  - [x] `/espace/login` + `LoginForm` — e-mail pré-rempli depuis la vitrine choisie
  - [x] `/espace/admin` — identifiants de chaque vitrine, copiables d'un clic
        (e-mail + mot de passe ensemble), dans le tableau **et** dans la carte
  - [x] Vérification navigateur : un compte de démo ne voit QUE sa vitrine
        (cookie `barbershop` → son espace 200 ; `/espace/thai-viens-express` et
        `/espace/admin` → 307 vers son propre espace). E-mail inconnu et mauvais
        mot de passe : même 401, même message.
  - [x] `.env`, `docs/ESPACE_CLIENT.md`, mémoire
  - [x] `npm run build`, commit `424991c`, push, `bash update.sh`
  - [x] **Vérifié EN PRODUCTION** : `barbershop@debug.com` → son espace 200,
        `/espace/thai-viens-express` et `/espace/admin` → 307 vers son propre
        espace ; parcours prospect complet au téléphone sur `openhouse-canggu`
        (e-mail pré-rempli, connexion, ni badge Admin ni bouton Synchroniser) ;
        côté agence, les 12 comptes listés, défilement interne du tableau 0 px.

### Détail utile à la reprise

- La colonne « Accès » du tableau porte **deux** boutons empilés : le code dérivé
  et le compte de démonstration. Le second copie l'e-mail ET le mot de passe.
- Deux réglages de largeur ont été nécessaires pour que les onze colonnes tiennent
  encore dans les 1180 px du conteneur une fois le compte ajouté : les nombres ne
  se coupent plus (`white-space: nowrap` sur `.esp-table .n`), la mention « réel »
  est descendue avec la ville, et la gouttière des cellules est passée de 0,75 à
  0,6 rem. Défilement interne mesuré : **0 px** à 1280 et 1440.
- `verifyCredentials` renvoie `{ slug, role }` : c'est l'**e-mail** qui choisit
  l'espace ouvert, le slug n'est plus demandé dans cet onglet.

## Lot 3 — les URL déménagent vers `/<slug>/admin` (2026-09-03)

> « remplace /espace/slug par /slug/admin »

Trois lectures possibles ; celle retenue après arbitrage du demandeur : **tout à
la racine**, l'espace de suivi n'a plus de préfixe à lui.

| Avant | Après |
|---|---|
| `/espace/<slug>` | `/<slug>/admin` |
| `/espace/admin` | `/admin` |
| `/espace/login` | `/admin/login` |

Raison de forme : c'est l'adresse qu'on donne au client — « votre site, puis
`/admin` » — et c'est déjà la forme d'un site client autonome, où la vitrine est
à la racine du domaine.

**Écartée : `/demo/<slug>/admin`.** Collision réelle — `/demo/ines-garden/admin`
serait capté par `app/demo/ines-garden/[categorie]`, la route du catalogue.

### Étapes

- [x] **16.** Déménagement
  - [x] Groupe de routes `app/(portal)/` — un seul layout pour `/admin`,
        `/admin/login` et `/<slug>/admin` (deux branches de l'arbre, une seule
        coquille). `app/espace/` supprimé.
  - [x] La page unique `/espace/[slug]` est **scindée en deux** : `/admin`
        (agence) et `/<slug>/admin` (une vitrine). Elles ne partageaient qu'un
        `if`.
  - [x] `lib/portal/paths.ts` — `spaceHref` / `loginHref` / `ADMIN_PATH` /
        `LOGIN_PATH`. Plus une seule URL en dur dans les composants.
  - [x] Redirections **308** des anciennes adresses (`next.config.js`), l'ordre
        des règles compte : `/espace/:slug` attraperait `login` et `admin`.
  - [x] Liens internes : barre, tableau agence, tableau vitrine, formulaire de
        connexion, pied du site public.
  - [x] Vérifié : les 5 redirections, `/admin` et `/<slug>/admin` sans session
        (307 vers le login), **404 franc** sur `/nimportequoi/admin`,
        cloisonnement inchangé, et le site public intact — `/`,
        `/demo/barbershop`, `/demo/ines-garden`, `/demo/ines-garden/vases-medicis`
        et une fiche produit : 200.
  - [x] `npm run build`, commit `d6575ea`, push, `bash update.sh`
  - [x] **Vérifié EN PRODUCTION** : les 5 redirections 308 partent bien vers les
        nouvelles adresses ; `/admin` et `/barbershop/admin` sans session → 307
        vers `/admin/login` (avec `?demo=barbershop`) ; `/nimportequoi/admin`
        → **404** ; cloisonnement intact (cookie `barbershop` : `/admin` et
        `/ines-garden/admin` → 307 vers `/barbershop/admin`). Parcours agence
        complet au navigateur depuis l'ANCIENNE adresse : `/espace/login` mène à
        `/admin/login`, connexion → `/admin`, « Ouvrir » → `/thai-viens-express/admin`,
        marque → `/admin`, déconnexion → `/admin/login`, pied du site public →
        `/admin/login`. Aucune erreur console. Site public intact.

## En service

| | |
|---|---|
| Connexion | https://receptionniste.zerocall.io/admin/login |
| Vision admin | https://receptionniste.zerocall.io/admin |
| Conteneurs | `atelier-vitrine` (web) · `atelier-vitrine-sync` (boucle horaire) |
| Codes d'accès | dérivés de `PORTAL_SECRET`, lisibles et copiables dans `/admin` |

**Reste optionnel** — rien de bloquant :

- `git push` non fait (à faire quand tu veux publier le dépôt).
- Trois actions de test du 2026-09-03 sur `thai-viens-express` restent dans le
  journal (report → confirmation → report). Le journal est immuable : on n'y
  fait pas de ménage. Si tu les veux hors de vue, le plus honnête est de les
  laisser et de filtrer par date.
- Le ruban des pages de démo déborde à 390 px (`.demo-ribbon`). **Antérieur à ce
  chantier**, vérifié à l'identique sur l'ancienne production. Pas corrigé ici :
  hors périmètre, et ça touche les douze vitrines publiques.

## Journal

- **2026-09-03 · audit** — 12 démos recensées, API Vapi validée (appels + chats,
  coûts détaillés), rétention 14 j découverte, `demo_bookings` lue sur les deux
  projets Supabase, conception arrêtée (tableau ci-dessus).
- **2026-09-03 · migration 004** — appliquée via l'API management Supabase sur
  `bbxwezoscjuwsoflponx` (GritUnited) **et** `uvpuhoyaovmztephqknq` (projet du `.env`).
  Le projet du `.env` n'avait jamais reçu la 003 : elle a été jouée avant la 004.
  Vérifié : `demo_usage_daily` répond, `demo_bookings.status/starts_at/demo_slug` existent.
- **2026-09-03 · anomalie design confirmée** — `--font-display` / `--font-body` /
  `--font-elegant` / `--font-barber` sont utilisées partout dans `app/globals.css`
  mais **définies nulle part** : tout le site rend avec la pile sans-serif par
  défaut de Tailwind, pas avec Bricolage/Hanken/Anton/Marcellus (pourtant chargées
  par `app/layout.tsx`). Déjà signalé « à corriger » dans `docs/DESIGN.md`.
  → corrigé à l'étape 9 (cohérence).
- **2026-09-03 · modèle d'actions** — migration 005 appliquée sur les deux projets :
  `demo_customers` (dédoublonnée sur `(assistant_id, phone E.164)`),
  `demo_reservations` (état courant + `original_starts_at` pour la dérive),
  `demo_actions` (journal immuable, index unique sur `tool_call_id`).
  `demo_bookings` gagne `projected_at` + `reservation_id` : curseur de projection.
- **2026-09-03 · socle serveur** — `lib/portal/` : `supabase.ts` (PostgREST
  service_role, pas de dépendance ajoutée), `phone.ts` (E.164 par indicatif du
  tenant), `time.ts` (créneau dicté → UTC **dans le fuseau du commerce** :
  Bali/New York/Chicago ne sont pas Paris), `auth.ts` (cookie HMAC + codes
  dérivés), `ledger.ts`, `projection.ts` (idempotente, double garde-fou),
  `usage.ts` (Vapi → `demo_usage_daily` → lecture Supabase uniquement).
- **2026-09-03 · `.env`** — ajout de `PORTAL_SECRET`, `PORTAL_ADMIN_CODE`,
  `DEMO_DB_SUPABASE_URL` / `_SERVICE_ROLE_KEY` (projet GritUnited), `PORTAL_SYNC_SECRET`.
- **2026-09-03 · première synchro réelle** — `POST /api/portal/sync` :
  15 lignes brutes lues → **12 actions projetées**, 3 ignorées (assistant de test
  inconnu du registre, marquées traitées pour ne plus être relues).
  12 fiches clients créées, 12 réservations, téléphones normalisés E.164
  (`+33`, `+1`, `+62`). Relance : `scanned: 0` → **idempotence vérifiée**.
  Consommation archivée pour `thai-viens-express` (2 appels, 5 conversations écrites).
- **2026-09-03 · deux corrections de justesse** issues du test :
  1. **Ordre des dates** — le schéma des tools impose `JJ/MM/AAAA` pour les douze
     démos, mais un assistant répondant en anglais peut glisser en `MM/JJ`.
     Garde-fou ajouté dans `time.ts` : si le second nombre dépasse 12, ce n'est
     pas un mois, on retourne la lecture. Aucune supposition dans les cas ambigus.
  2. **Fenêtre des messages** — les conversations écrites ne subissent PAS la
     rétention de 14 jours (l'API `/chat` renvoie des sessions du 8 août).
     Fenêtre séparée de 180 jours : sinon la moitié de la consommation écrite
     était jetée à chaque synchro (vérifié : 0 → 5 conversations archivées).
- **2026-09-03 · interface** — feuille dédiée `app/espace/espace.css` (registre
  PRODUIT : une seule famille, échelle rem fixe, vermillon réservé aux actions,
  seconde couche neutre pour la barre d'application). Palette de séries
  (bleu voix / terre écrit) **validée** par `validate_palette.js` sur la surface
  crème : ΔE protan 23,2 · vision normale 29,6 · contraste ≥ 3:1.
  Graphe SVG maison (colonnes empilées, un seul axe, infobulle), aucune
  dépendance ajoutée au projet.
- **2026-09-03 · parcours vérifié au navigateur (Playwright)** — connexion,
  4 onglets, calendrier mensuel, édition en place. Chaîne de traçabilité relue
  **en base** :
  `booking_created` (n8n) → `booking_rescheduled` (espace, 16/09 19h30 → 17/09 20h30)
  → `booking_confirmed` (espace) → `booking_rescheduled` (espace, → 18/09 12h15).
  Chaque ligne porte son avant → après et son auteur. Aucune erreur console.
  *(Ces trois actions de test restent dans le journal : il est immuable par
  construction, on n'y fait pas de ménage. Elles sont datées du 2026-09-03.)*
- **2026-09-03 · deux corrections d'affichage** — en-tête de panneau (le dernier
  élément va à droite, pas le premier venu) et **suppression d'un pourcentage
  mensonger** : le rendement affichait « 171 % des échanges ont donné une prise »
  quand des actions existent sans appel Vapi correspondant (rétention de 14 jours,
  saisie depuis l'espace). Remplacé par le compte brut dans ce cas.
- **2026-09-03 · anomalie de polices CORRIGÉE** — bloc d'alias ajouté dans
  `:root` (`app/globals.css`) : `--font-display` → Bricolage, `--font-body` →
  Hanken, `--font-elegant` → Marcellus, `--font-barber` → Anton.
  **Vérifié avant/après au navigateur** : la production servait
  `ui-sans-serif, system-ui` pour le corps ET les titres — les quatre polices
  étaient chargées par `layout.tsx`, payées en octets, et jamais appliquées.
  Contrôle de non-régression sur `/demo/barbershop`, `/demo/restaurant`,
  `/demo/ines-garden` à 1280 px et 390 px : **aucun débordement nouveau**
  (le seul relevé — le bandeau défilant d'Ines Garden et le ruban de démo à
  390 px — existe **à l'identique** sur la production actuelle, donc antérieur).
  ⚠️ **Changement visuel volontaire sur TOUT le site public et les 12 démos.**
- **2026-09-03 · mise en service de la synchro** — pas de `crontab` sur cette
  machine : la boucle horaire est un **service Docker** (`portal-sync`,
  `curlimages/curl`), démarré par `update.sh`. `scripts/portal-sync.sh` reste
  pour les relances manuelles depuis l'hôte.
- **2026-09-03 · passe mobile (390 px)** — barre d'application réduite aux
  icônes sous 680 px, en-tête de calendrier qui passe à la ligne, pastilles de
  jour pleines. Débordement horizontal ramené de 422 px à 390 px : **zéro**.
- **2026-09-03 · incident sans rapport** — le conteneur `atelier-vitrine` était
  `Exited (0)` en cours de session (arrêt propre, cause inconnue, logs pollués
  par des sondes de robots sur des Server Actions). **Redémarré** ; le
  déploiement de l'étape 11 le remplace de toute façon.
- **2026-09-03 · mise en service** — `bash update.sh` : image reconstruite,
  conteneur `web` remplacé, Caddy rechargé, `https://receptionniste.zerocall.io`
  répond 200. `/espace/login` 200, `/espace/admin` 307 vers le login sans cookie
  (comportement attendu). Parcours complet rejoué **en production** (admin et
  `thai-viens-express`) : **aucune erreur console**.
- **2026-09-03 · la boucle de synchro s'est cassée deux fois sur du YAML** —
  d'abord un bloc plié (`>`) qui conserve les retours à la ligne des lignes plus
  indentées (« syntax error: unexpected | »), puis une commande chaîne redécoupée
  en mots par compose (« expecting "do" »). Réglé en sortant la boucle du YAML :
  `scripts/portal-sync-loop.sh`, monté en lecture seule. Première exécution en
  production vérifiée : `{"ok":true, projection:{scanned:0}}` — la projection est
  bien idempotente, elle n'a rien retrouvé à faire.
