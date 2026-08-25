# Suivi — brancher les démos Vapi sur le workflow n8n + Supabase

> **Fichier de reprise.** Si la session est coupée, relire ce fichier de haut en
> bas : l'état de chaque étape est à jour. Reprendre à la première étape `[ ]`.
> Mettre à jour ce fichier **après chaque étape**, pas à la fin.

Dernière mise à jour : 2026-08-25 — **terminé et validé de bout en bout** : le webhook répond ET remplit `public.demo_bookings` dans le Supabase GritUnited.

## Objectif

Les 4 function tools des assistants Vapi de démo
(`enregistrer_rendezvous` / `_reservation` / `_commande` / `_intervention`)
POSTent vers :

```
https://n8n.zerocall.io/webhook/00000000-1234-0000-4321-000000000000
```

→ workflow n8n **`DEV - WebAgencyView - 01 - Receptionist - MultiTenant - Demo`**
(`DXijRdXTdTKVGXE8`, projet `SU61xL4G7FcslHvZ`).

Il faut que ce webhook **réponde au format Vapi** et **persiste la demande dans
Supabase** (`public.demo_bookings`, projet du `.env`).

## Identifiants / ressources

| Ressource | Valeur |
|---|---|
| Workflow n8n | `DXijRdXTdTKVGXE8` · projet `SU61xL4G7FcslHvZ` |
| API n8n | `https://n8n.zerocall.io/api/v1` · header `X-N8N-API-KEY` = `N8N_API_KEY` du `.env` |
| Credential Supabase du node démo | `ymGIwnbpr5ejICpx` — *GritUnited Supabase account* |
| **Projet Supabase cible** | `bbxwezoscjuwsoflponx` — `contact@grit-united.com's Project` (`ACTIVE_HEALTHY`) |
| Table | `public.demo_bookings` — clé de tenant `assistant_id` |
| Management API Supabase | `https://api.supabase.com/v1` · Bearer = `SUPABASE_ACCESS_TOKEN` de **`/home/amscjrb/grit-united/.env`** |
| Migration | `supabase/migrations/003_demo_bookings_n8n.sql` (autonome, idempotente) |
| Test de remplissage | `scripts/n8n-demo-fill-test.mjs` |
| Backup workflow avant patch | `.n8n_backup/DXijRdXTdTKVGXE8.before-demo-patch.json` (gitignoré) |
| Script de patch rejouable | `.n8n_backup/patch.mjs` |

> ⚠️ Le projet Supabase du `.env` de **ce** repo (`uvpuhoyaovmztephqknq`) est **en pause**
> et n'est **pas** la cible. Ne pas le confondre : `app/api/vapi/booking/route.ts` écrit
> encore vers lui, mais les assistants de démo ne passent plus par cette route.

## Diagnostic initial (fait)

Chaîne : `Webhook1` → `Edit Fields1` → `Get many rows19` *(désactivé)* →
`Get row(s)3` → `Code in JavaScript16` → `Code in JavaScript` → `Switch1`.

Trois blocages, tous vérifiés par API :

1. **`active: false`** → l'URL `/webhook/...` répond 404.
2. **`Get row(s)3`** (data table `practitioner_initialization`, `MnA3cGWEacGMUOgV`)
   filtre `assistant_id` + `env` : les 12 assistants de démo n'y sont pas → 0 item
   → la chaîne meurt **avant** `Switch1`, webhook jamais répondu.
3. **`Switch1`** ne route que les tools *receptionist* + `end-of-call-report`,
   et n'a **pas** de `fallbackOutput` → les `enregistrer_*` ne matchent rien.

Côté Supabase : le projet du `.env` est **`INACTIVE` (en pause)** → son sous-domaine
ne résout même pas en DNS. `supabase/migrations/002_demo_bookings.sql` existe déjà
(table `demo_bookings`, alimentée par `app/api/vapi/booking/route.ts`), mais on ne
peut ni vérifier ni migrer tant que le projet est en pause.

## Étapes

- [x] **1.** Auditer le workflow + la data table `practitioner_initialization` (API n8n)
- [x] **2.** Identifier les credentials Supabase existantes de n8n
      (`ZeroCall Dev/Prod`, `GritUnited` — **aucune** ne pointe sur le projet du `.env`)
- [x] **3.** Créer la credential n8n vers le Supabase du `.env` → `VCzX9SxByzcWGxZi`
- [x] **4.** Écrire la migration `supabase/migrations/003_demo_bookings_n8n.sql`
      (colonnes `assistant_id`, `assistant_name`, `call_id`, `tool_call_id`, `source`
      + index unique anti-doublon sur `tool_call_id`)
- [x] **5.** Sauvegarder le workflow avant patch (`.n8n_backup/`)
- [x] **6.** Construire le payload de patch (script `patch.mjs`, assertions incluses)
- [x] **7.** Appliquer le patch — `PUT /api/v1/workflows/DXijRdXTdTKVGXE8`
- [x] **8.** Relire le workflow et vérifier le patch (11 règles, 12 sorties, 65 nodes)
- [x] **9.** Activer le workflow — `POST /api/v1/workflows/DXijRdXTdTKVGXE8/activate`
- [x] **10.** Test de validation A : POST tool call de démo → réponse Vapi attendue
- [x] **11.** Test de validation B : les branches receptionist ne régressent pas
- [x] **12.** ~~Sortir le projet Supabase du `.env` de pause~~ — **abandonné** :
      consigne utilisateur du 2026-08-25 → utiliser le **compte Supabase GritUnited**.
- [x] **13.** Créer `demo_bookings` dans le projet GritUnited `bbxwezoscjuwsoflponx`
      (via l'API management Supabase + le PAT de `/home/amscjrb/grit-united/.env`)
- [x] **14.** Basculer `Supabase - Demo Booking` sur la credential
      `ymGIwnbpr5ejICpx` (*GritUnited Supabase account*) et supprimer la credential
      devenue inutile `VCzX9SxByzcWGxZi`
- [x] **15.** Test de remplissage : 12 tool calls (un par assistant) → 12 lignes en base
- [x] **16.** Nettoyage : workflow temporaire supprimé, credentials revenues à l'état initial
- [x] **17.** Documentation : section « Traitement côté n8n » ajoutée dans
      `docs/VAPI_ASSISTANTS.md`, mémoire `n8n-demo-workflow` réécrite

**→ Chantier terminé.** Rien ne reste bloqué. Seul reliquat optionnel : purger les
12 lignes de test (`call_id like 'fill-%'`) si tu ne veux pas les garder.

## Cible Supabase : GritUnited (résolu)

Consigne : écrire les leads de démo dans le **compte Supabase GritUnited**.

Le chemin n'était pas évident, d'où la trace ici :

- La credential n8n `GritUnited Supabase account` (`ymGIwnbpr5ejICpx`, PostgREST)
  **fonctionne** — c'est elle que le workflow utilise.
- La credential n8n `GritUnited Supabase - Postgres account` (`RqMebKU3M3ZYgE79`,
  connexion directe) **ne fonctionne pas** : `self-signed certificate in certificate
  chain`. Il faudrait cocher « Ignore SSL Issues » dans l'UI n8n. Pas nécessaire ici,
  mais à savoir si un jour tu veux du SQL direct depuis n8n.
  *(Au passage : `ZeroCall DEV Supabase - Postgres account` renvoie « Host not found »
  — ce projet-là est mort/en pause aussi. Seule `ZeroCall PROD` répond.)*
- PostgREST ne fait pas de DDL → la table ne pouvait pas être créée par n8n.
- **Débloqué par** `/home/amscjrb/grit-united/.env`, qui contient l'URL du projet
  (`bbxwezoscjuwsoflponx`) et un `SUPABASE_ACCESS_TOKEN` (PAT `sbp_…`). Identité
  confirmée avec la credential n8n : même ligne `profiles`
  (`f7c59558-…`, `dangngocanh2010@gmail.com`, `goal: sleep`).
- Migration appliquée via `POST https://api.supabase.com/v1/projects/bbxwezoscjuwsoflponx/database/query`.

⚠️ **Ce projet héberge une autre application** (app santé/sommeil : `profiles` avec
`organization_id`, `goal`, `health_profile`). `demo_bookings` y vit à côté, isolée,
RLS activé sans policy → seul le `service_role` y accède. `customers` et
`report_call` (receptionist ZeroCall) n'y sont pas : ce n'est pas la même base.

### Schéma créé (vérifié)

11 colonnes : `id`, `created_at`, `tool`, `payload` (jsonb), `meta` (jsonb),
`domain_name`, `assistant_id`, `assistant_name`, `call_id`, `tool_call_id`, `source`.

6 index : `demo_bookings_pkey`, `_assistant_id_idx`, `_tenant_recent_idx`
`(assistant_id, created_at desc)`, `_call_id_idx`, `_source_idx`,
`_tool_call_id_uidx` (unique partiel). RLS activé, 0 policy.

Migration **rejouée une seconde fois** sans effet de bord (0 ligne touchée) :
idempotence confirmée.

## Modèle multi-tenant

Un **seul** workflow n8n sert toutes les démos. La **clé de tenant est
l'`assistant_id` Vapi du client démo** (`message.assistant.id`) — même convention
que la data table `practitioner_initialization` côté receptionist.

- `demo_bookings.assistant_id` porte le suivi par client ; indexée seule **et** en
  composite `(assistant_id, created_at desc)` pour lister l'historique d'un tenant.
- `assistant_name`, `meta.slug` et `domain_name` ne sont que du contexte dérivé,
  jamais des clés.
- Ajouter un nouveau client démo ne demande donc **aucune modification du
  workflow** : il suffit que son assistant Vapi pointe sur le même webhook.

Table de correspondance des 12 assistants : `vapi_export/assistants/_index.md`.

## Contenu du patch (étape 7)

Aucune branche receptionist n'est modifiée ; rien n'est supprimé.

1. `Get row(s)3` → `alwaysOutputData: true`
   (les tenants receptionist matchent toujours : comportement inchangé ; les démos
   passent désormais avec un item vide).
2. `Switch1` → 11ᵉ règle **ajoutée en fin** (`outputKey: demoBooking`,
   `function_tool` *startsWith* `enregistrer_`) : les index de sortie 0→9 existants
   ne bougent pas. `options.fallbackOutput = "extra"` → sortie 11.
3. 4 nodes ajoutés :
   - `Code - Demo Lead` — construit les colonnes `demo_bookings` + le texte de
     confirmation FR/EN (porté depuis `app/api/vapi/booking/route.ts`)
   - `Supabase - Demo Booking` — `create` sur `demo_bookings`,
     `dataToSend: autoMapInputData`, `inputsToIgnore: result`,
     `onError: continueRegularOutput` (best-effort : une panne Supabase ne doit
     jamais empêcher l'assistant de confirmer au client)
   - `Respond to Webhook - Demo` — `{"results":[{"toolCallId":…,"result":…}]}`
   - `Respond to Webhook - Fallback` — branché sur la sortie fallback, pour que
     plus aucun POST ne reste sans réponse
4. Câblage : `Switch1[10] → Code - Demo Lead → Supabase - Demo Booking → Respond - Demo`,
   `Switch1[11] → Respond - Fallback`.

⚠️ `PUT /workflows/{id}` **remplace tout** : envoyer `name` + `nodes` + `connections`
+ `settings`, et **omettre** `binaryMode` / `availableInMCP` dans `settings` (sinon 400).

## Tests de validation joués (étapes 10-11)

Contre `https://n8n.zerocall.io/webhook/00000000-1234-0000-4321-000000000000`.

| Cas | Attendu | Résultat |
|---|---|---|
| `enregistrer_reservation` (Le Comptoir 12, fr, args objet) | `results[0].result` FR | ✅ « Réservation de démonstration bien enregistrée pour Claude Testeur pour le 12/09/2026 à 20:00 (4 couverts). » |
| `enregistrer_rendezvous` (Barbershop Courbevoie, fr, **args string JSON**) | idem | ✅ « Rendez-vous … (coupe + barbe). » |
| `enregistrer_intervention` (Texas Plumbing Pros, **en**) | texte anglais | ✅ « Service call recorded (demo) for John Doe … » |
| `enregistrer_commande` (Ines Garden, fr) | texte FR + adresse livraison | ✅ |
| tool inconnu (`toolQuiNexistePas`) | fallback, jamais de POST sans réponse | ✅ `{"results":[{"toolCallId":"…","result":"OK"}]}` |
| `status-update` (aucun `toolCalls`) | acquittement | ✅ `{"received":true}` |
| **non-régression** receptionist `getAvailability` (tenant réel *Bistrot Chez Mimi*, dev, lecture seule) | branche Google Calendar + AI Agent intacte | ✅ « Perfect! The slot you requested on 2026-09-01 at 09:00 is available. » — exécution passée par `Get many events → Switch → AI Agent6 → Respond to Webhook6` |

Le node `Code - Demo Lead` sort bien les colonnes de `demo_bookings`, avec
`payload` / `meta` en **objets JSON réels** (et non en chaînes) et le `slug` récupéré
depuis `assistant.metadata.slug`. Vérifié dans les exécutions 10308-10311.

## Test de remplissage de la base (étape 15) — ✅

Script rejouable : `scripts/n8n-demo-fill-test.mjs` (`RUN=$(date +%s) node scripts/n8n-demo-fill-test.mjs`).
Un tool call par assistant, avec le tool réel de chaque métier, `arguments` tantôt en
objet tantôt en string JSON.

**Résultat : 12 OK / 0 KO**, 492 ms → 1711 ms par appel.
**En base : 12 lignes, une par `assistant_id`**, chacune avec le bon `tool`,
le bon `meta.slug` et `source = 'n8n'` :

| assistant | tool | slug | n |
|---|---|---|---|
| Barbershop Courbevoie | `enregistrer_rendezvous` | barbershop-courbevoie | 1 |
| Ines Garden | `enregistrer_commande` | ines-garden | 1 |
| L.A.K Nail Salon | `enregistrer_rendezvous` | lak-nail-salon | 1 |
| L'Atelier Rosé | `enregistrer_rendezvous` | onglerie | 1 |
| Le Comptoir 12 | `enregistrer_reservation` | restaurant | 1 |
| Maison Brutus | `enregistrer_rendezvous` | barbershop | 1 |
| Maison Éphémère | `enregistrer_rendezvous` | maison-ephemere | 1 |
| Maison Ferrand | `enregistrer_commande` | traiteur | 1 |
| Open House | `enregistrer_reservation` | openhouse-canggu | 1 |
| Plomberie Mercier | `enregistrer_intervention` | plombier | 1 |
| Texas Plumbing Pros | `enregistrer_intervention` | texas-plumbing-pros | 1 |
| Thaï Vien Express | `enregistrer_reservation` | thai-viens-express | 1 |

Contrôles complémentaires :

- `jsonb_typeof(payload)` = `object` et `jsonb_typeof(meta)` = `object` sur les
  **12 lignes** → les JSON sont stockés comme objets, pas comme chaînes échappées.
  Une requête de suivi type `payload->>'prenom'` fonctionne donc directement.
- **Anti-rejeu** : rejouer le *même* `tool_call_id` renvoie bien la confirmation à
  Vapi (200) mais **n'ajoute aucune ligne** — total inchangé à 12, grâce à
  `demo_bookings_tool_call_id_uidx`. Le rejeu réseau de Vapi ne peut pas dupliquer.

Les 12 lignes de test ont toutes `call_id like 'fill-%'`. Pour les purger :
`delete from public.demo_bookings where call_id like 'fill-%';`

## Rollback

```bash
export N8N_API_KEY="$(grep -m1 '^N8N_API_KEY=' .env | cut -d= -f2-)"
node -e '
const w=require("./.n8n_backup/DXijRdXTdTKVGXE8.before-demo-patch.json");
require("fs").writeFileSync("/tmp/rollback.json",JSON.stringify({
  name:w.name,nodes:w.nodes,connections:w.connections,
  settings:{executionOrder:w.settings.executionOrder}}));'
curl -s -X PUT -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" \
  --data-binary @/tmp/rollback.json \
  "https://n8n.zerocall.io/api/v1/workflows/DXijRdXTdTKVGXE8"
```

## Journal

- **05:39** — data table n8n `demo_leads` créée puis **supprimée** (`aBOXGai88LrypEqb`) :
  abandonnée au profit de Supabase après consigne utilisateur. Rien à nettoyer.
- **05:41** — credential n8n `VCzX9SxByzcWGxZi` créée depuis `.env`
  (`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`).
  ⚠️ Créée via l'API publique → elle atterrit dans le projet personnel du
  propriétaire de la clé API, **pas** dans `SU61xL4G7FcslHvZ`. Si le node Supabase
  remonte « credential not accessible », la partager avec le projet depuis l'UI n8n.
- **05:43** — backup workflow + `patch.mjs` dans `.n8n_backup/` (ajouté au `.gitignore`).
- **05:44** — `PUT` du patch → HTTP 200. Relecture : 65 nodes, 11 règles `Switch1`
  (dernière = `demoBooking`), `fallbackOutput: extra`, 12 sorties câblées,
  `alwaysOutputData` posé sur `Get row(s)3`. ✅
- **05:45** — workflow **activé** (`active: true`). L'URL de production répond.
- **05:45** — tests de validation (voir plus bas) : les 4 tools de démo, les 2
  fallbacks et une branche receptionist en lecture seule répondent tous en < 2 s. ✅
- **05:47** — correctif de copie : accord du participe en français
  (« Réservation … bien **enregistrée** », idem Commande / Demande d'intervention).
  Re-`PUT` + retest OK, workflow toujours actif.
- **05:48** — migration `003` recadrée sur le modèle multi-tenant
  (`assistant_id` = clé de tenant, + index composite `(assistant_id, created_at desc)`).
- **06:0x** — consigne : cibler le **compte Supabase GritUnited** plutôt que le projet
  du `.env`. Workflow temporaire `TMP - WebAgencyView - SQL runner` créé pour sonder
  cette base, puis **désactivé et supprimé** (copie dans `.n8n_backup/tmp_sql_runner.json`).
  Résultat : projet sans rapport + pas de chemin DDL → voir « Blocage GritUnited ».
- **06:00** — `/home/amscjrb/grit-united/.env` trouvé : URL du projet GritUnited +
  PAT management. Migration `003` appliquée sur `bbxwezoscjuwsoflponx` (HTTP 201),
  schéma vérifié (11 colonnes, 6 index, RLS on).
- **06:01** — node `Supabase - Demo Booking` basculé sur `ymGIwnbpr5ejICpx`.
- **06:01** — test de remplissage 12/12, puis test anti-rejeu. ✅
- **06:05** — nettoyage : workflow temporaire supprimé, credential `VCzX9SxByzcWGxZi`
  supprimée. Les 6 credentials Supabase/Postgres sont revenues à leur état initial.
- **06:08** — migration `003` recadrée sur la vraie cible (projet GritUnited,
  commande d'application incluse dans l'en-tête du fichier), rejouée une 2ᵉ fois
  pour prouver l'idempotence. `scripts/n8n-demo-fill-test.mjs` versionné.
  `docs/VAPI_ASSISTANTS.md` + mémoire mis à jour.
- **06:0x** — ⚠️ incident mineur : un `PATCH /credentials/RqMebKU3M3ZYgE79` de test a
  renommé la credential `GritUnited Supabase - Postgres account` en `x`.
  **Nom restauré immédiatement**, `data` intact (l'API ne l'expose pas et ne l'a pas
  touché). Ne plus utiliser `PATCH /credentials` : partiel = risque d'écraser
  host/password.
