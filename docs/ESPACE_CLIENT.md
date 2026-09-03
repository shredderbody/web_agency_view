# Espace client des démos — `/espace`

Suivi de consommation et **traçabilité complète des actions** pour les douze
vitrines de démonstration. Un espace par démo, plus une vision administrateur.

| | |
|---|---|
| Connexion | `/espace/login` |
| Espace d'une démo | `/espace/<slug>` (les 12 slugs de `lib/portal/registry.ts`) |
| Vision administrateur | `/espace/admin` |
| Suivi du chantier | [SUIVI_ESPACE_CLIENT.md](./SUIVI_ESPACE_CLIENT.md) |

## Ce qu'on stocke, et ce qu'on ne stocke pas

**On journalise des ACTIONS, jamais du contenu de conversation.** Ni transcript,
ni verbatim, ni résumé d'échange. Une ligne du journal dit *ce qui a été fait*
(réservation prise, créneau reporté, annulation), *par qui*, *quand*, *pour quel
client*, et *l'avant → après*. C'est ce qui rend le journal consultable sans
arrière-pensée, et exploitable en cas de litige (« vous m'aviez décalé au 14 »).

## Modèle de données

Quatre tables, un rôle chacune. Migrations `004` et `005`, appliquées sur les
**deux** projets Supabase (cf. en-tête des fichiers SQL).

| Table | Rôle | Écrite par |
|---|---|---|
| `demo_bookings` | **Boîte de réception brute** : un tool call Vapi = une ligne | le workflow n8n |
| `demo_customers` | **Fiche client** : coordonnées, compteurs, première/dernière venue | la projection, l'espace |
| `demo_reservations` | **État courant** : le créneau qui fait foi aujourd'hui | la projection, l'espace |
| `demo_actions` | **Journal immuable** : qui, quoi, quand, avant → après | la projection, l'espace |
| `demo_usage_daily` | **Archive de consommation** : appels, minutes, messages, coûts, par jour | la synchro Vapi |

`demo_actions` ne subit **jamais** d'`UPDATE` ni de `DELETE`. Changer l'état
d'une réservation, c'est ajouter une ligne, pas en réécrire une.

### Clé de tenant

`assistant_id` — l'identifiant de l'assistant Vapi de la démo. Même convention
que `demo_bookings` (migration 003) et que la data table n8n
`practitioner_initialization`. Le slug de démo est dénormalisé à côté pour le
confort des requêtes SQL, mais ce n'est pas la clé.

### Dédoublonnage client

Sur `(assistant_id, phone)` où `phone` est **normalisé E.164** avec l'indicatif
du tenant (`lib/portal/phone.ts`). Un client qui dicte « zéro six douze… » puis
« +33 6 12… » retombe sur la même fiche. Deux commerces différents ne partagent
jamais une fiche, même pour le même numéro.

### Fuseau horaire

Un créneau dicté est une **heure locale du commerce**. « 19 h » chez Open House,
c'est 19 h à Bali. `DemoTenant.timezone` porte le fuseau, `lib/portal/time.ts`
convertit dans les deux sens. Sans ça, les réservations de Bali seraient
décalées de sept heures dans le calendrier.

## Flux

```
Vapi (appel ou chat)
   └─ function tool ──> webhook n8n ──> demo_bookings        (brut, sans état)
                                            │
                       POST /api/portal/sync │ projection idempotente
                                            ▼
                        demo_customers · demo_reservations · demo_actions
                                            ▲
                   PATCH /api/portal/reservations (confirmer, reporter, annuler…)
                                            │
                                     /espace/<slug>   ← lit UNIQUEMENT Supabase

API Vapi (/call, /chat) ──> POST /api/portal/sync ──> demo_usage_daily
```

**Idempotence de la projection** : deux garde-fous qui se recouvrent —
`demo_bookings.projected_at` (le curseur) et l'index unique
`demo_actions.tool_call_id` (le filet). Relancer dix fois produit le même journal.

## ⚠️ Rétention Vapi : 14 jours

Le plan Vapi ne conserve que **14 jours** d'historique d'**appels** — au-delà,
`GET /call` répond `400 … exceeds your retention window`. Les **conversations
écrites** (`GET /chat`) ne sont pas rognées de la même façon : la synchro les
reprend sur 180 jours.

Conséquence directe : `demo_usage_daily` est la **seule mémoire longue** de la
consommation. Si la synchro ne tourne pas pendant deux semaines, les jours
concernés sont perdus **définitivement**. D'où la boucle horaire.

### La boucle de synchro

Cette machine n'a pas de `crontab`. La boucle est donc un **service Docker**,
`portal-sync` (image `curlimages/curl`), déclaré dans `docker-compose.yml` et
démarré par `update.sh`. Il appelle `POST http://web:3010/api/portal/sync`
toutes les heures avec l'en-tête `x-portal-sync-secret`.

```bash
docker compose logs -f portal-sync        # suivre
bash scripts/portal-sync.sh               # relance manuelle depuis l'hôte
```

## Authentification

Volontairement **sans Supabase Auth** : les démos n'ont pas de comptes
utilisateurs, elles ont des slugs. Un code d'accès par slug, un cookie signé
HMAC-SHA256 (`HttpOnly`, `SameSite=Lax`, 12 h). Zéro dépendance, zéro table.

Les codes sont **dérivés** de `PORTAL_SECRET` — rien à créer quand une démo
s'ajoute — et l'espace administrateur les affiche, copiables en un clic. Le code
administrateur ouvre tous les espaces (mode dépannage au téléphone).

### Compte de test

Une seule exception au « pas de comptes utilisateurs » : l'onglet **Identifiants**
de l'écran de connexion, e-mail + mot de passe, qui ouvre directement
`/espace/admin`. Il sert aux essais et aux démonstrations — on ne dicte pas un
code dérivé à quelqu'un qui veut juste voir l'espace d'administration.

Par défaut `test@debug.com` / `Test123!` ; surchargeable par `PORTAL_TEST_EMAIL`
et `PORTAL_TEST_PASSWORD`. `PORTAL_TEST_ACCOUNT=off` retire l'onglet **et** ferme
la route : c'est le geste à faire le jour où l'espace sert à de vrais clients
payants.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `PORTAL_SECRET` | Signature du cookie **et** graine des codes d'accès. La changer révoque tout. |
| `PORTAL_ADMIN_CODE` | Code administrateur explicite. Vide = code dérivé. |
| `PORTAL_CODE_<SLUG>` | Fige le code d'un client (slug en majuscules, tirets → `_`). |
| `PORTAL_TEST_ACCOUNT` | `off` désactive le compte de test. Toute autre valeur (ou absente) le laisse actif. |
| `PORTAL_TEST_EMAIL` | E-mail du compte de test. Défaut : `test@debug.com`. |
| `PORTAL_TEST_PASSWORD` | Mot de passe du compte de test. Défaut : `Test123!`. |
| `PORTAL_SYNC_SECRET` | En-tête `x-portal-sync-secret` de `POST /api/portal/sync`. |
| `DEMO_DB_SUPABASE_URL` | Projet Supabase des réservations (**GritUnited**, celui où n8n écrit). |
| `DEMO_DB_SUPABASE_SERVICE_ROLE_KEY` | Clé `service_role` du même projet. Serveur uniquement. |
| `VAPI_PRIVATE_KEY` | Lecture de la consommation (`/call`, `/chat`). Déjà présente. |

Sans `DEMO_DB_*`, l'app retombe sur `NEXT_PUBLIC_SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` (le projet du `.env`) — utile en local, mais ce
n'est pas là que le workflow n8n écrit.

## Routes API

| Route | Rôle |
|---|---|
| `POST /api/portal/login` | `{ slug, code }` — ou `{ email, password }` pour le compte de test → cookie de session |
| `POST /api/portal/logout` | Efface le cookie |
| `GET /api/portal/actions` | Journal d'un tenant, d'une réservation, ou global (admin) |
| `GET /api/portal/reservations` | Liste des réservations d'un tenant |
| `PATCH /api/portal/reservations` | Confirmer / reporter / annuler / noter — **écrit aussi une action** |
| `POST /api/portal/sync` | Projection + archive de consommation (admin ou secret) |

Options de synchro : `?slug=<slug>` (un seul tenant), `?reprocess=1` (rejoue tout
l'historique brut — sûr, le filet `tool_call_id` évite les doublons),
`?usage=0` (projection seule).

## Adaptation aux écrans

Un seul point mérite d'être connu : le tableau « par vitrine » de l'espace
administrateur (onze colonnes) **cède la place à une carte par vitrine sous
1040 px**. Les deux formes sont dans le HTML, la CSS tranche — pas de mesure de
fenêtre, donc pas de saut à l'hydratation, et l'impression garde le tableau.

Le reste suit : tuiles à deux colonnes sous 560 px, commande de période pleine
largeur, première colonne des tableaux restants épinglée pendant le défilement
latéral, et le graphe de consommation dessiné à la **largeur réelle** de son
conteneur (échelle 1:1) — un `viewBox` fixe réduit sur téléphone rendrait les
étiquettes d'axe illisibles. Le graphe répond aussi à l'appui du doigt, le
survol n'existant pas sur mobile.

## Design

Registre **produit**, pas marque : une seule famille (Hanken Grotesk), échelle
rem fixe, vermillon réservé aux actions primaires et à la sélection, seconde
couche neutre pour la barre d'application. Feuille dédiée `app/espace/espace.css`,
tout préfixé `esp-` sous `.esp` — aucune interférence avec le site public ni
avec les mondes des vitrines.

La palette des séries du graphe (bleu voix / terre écrit) est **validée**
programmatiquement sur la surface crème : ΔE protan 23,2 · vision normale 29,6 ·
contraste ≥ 3:1. Elle est volontairement distincte du vermillon de marque — une
barre de graphe n'est pas un bouton.

Le graphe est du **SVG écrit à la main** : aucune bibliothèque de graphiques
n'a été ajoutée au projet.
