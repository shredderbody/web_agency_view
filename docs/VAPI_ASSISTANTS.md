# Bulle Vapi hybride & assistants inbound (pages /demo/[slug])

Chaque page métier (`/demo/<slug>`) embarque une **bulle de discussion hybride
Vapi** (chat écrit **et** appel vocal) branchée sur un **assistant inbound dédié
au métier**. Les assistants sont **bilingues FR + EN** (démarrage en français,
bascule automatique en anglais), prennent des **rendez-vous de démonstration**
(le booking n'est **pas réel**) et collectent les coordonnées du client.

> Tout est autoportant dans ce dépôt : aucun besoin du projet `receptionist`.
> Pour (re)provisionner les assistants : `node scripts/vapi-setup-assistants.mjs`.

> 🔌 **Intégration front-end du widget** (montage, CSP, autorisation micro,
> responsive mobile/tablette/desktop, dépannage « la bulle ne s'affiche pas ») →
> playbook réutilisable **[`VAPI_FRONTEND_WIDGET.md`](./VAPI_FRONTEND_WIDGET.md)**.

---

## 1. Vue d'ensemble

| Pièce | Fichier |
|---|---|
| Composant bulle (web-component `<vapi-widget>`) | `components/VapiWidget.tsx` |
| Câblage dans la page métier | `components/DemoView.tsx` (`<VapiWidget slug={slug} />`) |
| Config par métier (IDs + couleurs) | `lib/vapi.ts` |
| Endpoint des function tools (démo) | webhook n8n (`VAPI_TOOL_URL`) — legacy : `app/api/vapi/booking/route.ts` |
| Provisioning / mise à jour des assistants | `scripts/vapi-setup-assistants.mjs` |
| Variables d'environnement | `.env` (section `── Vapi ──`) |
| CSP (production) | `Caddyfile` → snippet `csp_receptionniste` |
| Responsive | `app/globals.css` (bloc `vapi-widget`) |

Flux d'un échange vocal/chat :

```
Visiteur ──(chat ou voix)──▶ <vapi-widget> ──▶ Vapi (assistant du métier)
                                                   │
                                                   ├─ LLM gpt-4.1 (prompt FR/EN)
                                                   ├─ STT Deepgram flux-general-multi (fr+en)
                                                   ├─ TTS ElevenLabs eleven_multilingual_v2
                                                   └─ function tool ──POST──▶ n8n (webhook)
                                                                                  └─ confirme (démo)
```

---

## 2. Les 5 assistants inbound

Un assistant par métier. IDs réels (org Vapi `43751a3f…`) :

| Métier (slug) | Commerce | Ville | Voix 11labs | Assistant ID (env) |
|---|---|---|---|---|
| `barbershop` | Maison Brutus | Lyon 1er | Adam (H) | `NEXT_PUBLIC_VAPI_ASSISTANT_BARBERSHOP` = `58575546-41ba-46d3-a3f1-a277cbe6538f` |
| `onglerie` | L'Atelier Rosé | Bordeaux | Matilda (F) | `NEXT_PUBLIC_VAPI_ASSISTANT_ONGLERIE` = `79cf70d2-266f-4315-b684-c67f5dac7004` |
| `traiteur` | Maison Ferrand | Annecy | Adam (H) | `NEXT_PUBLIC_VAPI_ASSISTANT_TRAITEUR` = `bbde8425-ff5f-42b4-9459-53ea6f5b2dfb` |
| `restaurant` | Le Comptoir 12 | Paris 11e | Matilda (F) | `NEXT_PUBLIC_VAPI_ASSISTANT_RESTAURANT` = `07cb9db8-9944-4708-b7f8-e78f7a1ad8ec` |
| `plombier` | Plomberie Mercier | Nantes | Adam (H) | `NEXT_PUBLIC_VAPI_ASSISTANT_PLOMBIER` = `61b42505-e008-4912-9912-2d70a2c2d27e` |

### Config commune (inspirée de la démo « Altifluence »)

- **Modèle** : OpenAI `gpt-4.1`, `temperature: 0.4`.
- **Voix** : ElevenLabs `eleven_multilingual_v2` (+ `fallbackPlan`, `inputMinCharacters: 3`).
  Voix masculine `pNInz6obpgDQGcFmaJgB` (Adam), féminine `XrExE9yKIg1WjnnlVkGX` (Matilda).
- **Transcriber** : Deepgram `flux-general-multi`, `languages: ["fr","en"]`,
  `numerals: true`, `eotThreshold: 0.7`, `eotTimeoutMs: 5000`.
  Fallback : Deepgram `nova-2` `language: "multi"`.
- **firstMessageMode** : `assistant-speaks-first`.
- **startSpeakingPlan** : endpointing court (réponses réactives).
- **Bilingue FR/EN** : démarre en français, détecte la langue du client dès ses
  premiers mots et la reflète intégralement, sans jamais mélanger les deux.

### Données métier injectées dans chaque prompt

| slug | Horaires (utilisés pour valider date/heure) | Réserve… |
|---|---|---|
| `barbershop` | mar–sam 9h00–19h30 | un rendez-vous (coupe / barbe) |
| `onglerie` | lun–sam 10h00–19h00 | un rendez-vous (soin) |
| `traiteur` | mar–dim 8h–13h / 15h–19h | une commande à retirer en boutique |
| `restaurant` | mar–sam 12h–14h30 / 19h–23h | une table |
| `plombier` | lun–ven 8h–19h + urgences 7j/7 | une intervention |

L'assistant vérifie que le créneau demandé tombe dans les horaires ; sinon il
propose un créneau valide.

---

## 3. Function tools (inbound)

Chaque assistant expose **4 function tools** — la création métier + 3 tools
communs de suivi (identification / annulation / report), sur le modèle du
verrou CRM de l'assistant *receptionist* « Yelena » (`docs` du projet
`receptionist`, `VAPI_PLAYBOOK.md` — identification par nom + prénom +
téléphone avant toute modif/annulation). Tous pointent vers le **webhook n8n** :
`POST https://n8n.zerocall.io/webhook/00000000-1234-0000-4321-000000000000`
(surchargeable via `VAPI_TOOL_URL`). C'est aussi le `server.url` de l'assistant.

### 3.1 Création (1 tool par métier)

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `prenom` | string | ✅ | Prénom du client |
| `nom` | string | ✅ | Nom de famille |
| `telephone` | string | ✅ | Numéro de téléphone |
| `date` | string | ✅ | Date souhaitée (JJ/MM/AAAA) |
| `heure` | string | ✅ | Heure souhaitée (HH:MM, dans les horaires) |
| `langue` | string | — | Langue de la conversation (`fr` / `en`) |

Champs spécifiques par métier :

| Tool | slug | Champs additionnels |
|---|---|---|
| `enregistrer_rendezvous` | `barbershop`, `onglerie`, … | `prestation` (string) |
| `enregistrer_commande` | `traiteur`, `ines-garden` | `commande`/`pieces_souhaitees` (string) — la date/heure = **retrait/livraison** |
| `enregistrer_reservation` | `restaurant`, … | `nombre_couverts` (string) |
| `enregistrer_intervention` | `plombier`, `texas-plumbing-pros` | `adresse_intervention` (string), `nature_probleme` (string), `urgence` (boolean) |

> **Le plombier demande systématiquement l'adresse complète du lieu
> d'intervention** et la nature du problème — c'est imposé dans son prompt.

### 3.2 Identification / annulation / report (3 tools communs, tous métiers)

Pas de champ spécifique métier : ces tools authentifient le client par
**nom + prénom + téléphone** dans l'historique des réservations de démo de cet
assistant (recherche par téléphone normalisé, confirmée par le nom), puis
agissent sur la réservation **active** la plus récente trouvée.

| Tool | Champs | Rôle |
|---|---|---|
| `rechercher_client` | `prenom`, `nom`, `telephone`, `langue` | Vérifie si le client a déjà une réservation active ; renvoie date/heure ou l'absence de réservation |
| `annuler_reservation` | `prenom`, `nom`, `telephone`, `langue` | Annule la réservation active trouvée (aucune s'il n'y en a pas) |
| `modifier_reservation` | `prenom`, `nom`, `telephone`, `date`, `heure`, `langue` | Reporte la réservation active vers la nouvelle date/heure |

Le prompt impose le verrou : **jamais** d'appel à `annuler_reservation` /
`modifier_reservation` sans être passé par `rechercher_client` juste avant et
avoir fait confirmer au client la réservation trouvée.

### Traitement côté n8n (câblage actuel)

Workflow **`DEV - WebAgencyView - 01 - Receptionist - MultiTenant - Demo`**
(`DXijRdXTdTKVGXE8`, projet `SU61xL4G7FcslHvZ`) — le même que le projet
*receptionist*, avec deux branches dédiées aux démos ajoutées en fin de
`Switch1` (additif : aucun nœud/branche existant du workflow receptionist n'a
été modifié) :

```
Webhook1 → Edit Fields1 → Get many rows19 → Code in JavaScript16 → Code in JavaScript
        → Switch1 ─[…10 sorties receptionist existantes, inchangées…]
                  ├─[11] createDemoBooking ──▶ Demo: Build Create Payload
                  │                             → Demo: Create Booking (insert demo_bookings)
                  │                             → Demo: Respond Create
                  └─[12] demoBookingLookup ──▶ Demo: Get Client Bookings (getAll demo_bookings, assistant_id)
                                                → Demo: Match & Decide (authentifie tel+nom, déduit l'état courant)
                                                → Demo: Needs Insert? ─true─▶ Demo: Log Booking Event → Demo: Respond Mutate
                                                                      └false─▶ Demo: Respond Lookup
```

- `createDemoBooking` matche `function_tool` = `enregistrer_rendezvous` /
  `_reservation` / `_commande` / `_intervention` ; `demoBookingLookup` matche
  `rechercher_client` / `lister_reservations` / `annuler_reservation` /
  `modifier_reservation`. **Aucun** nouveau tool n'est à déclarer côté workflow
  quand on ajoute un métier de création (juste 1 nom de tool en plus dans la
  1ʳᵉ règle) ; les 3 tools de suivi sont déjà génériques.
- **Historique événementiel, pas d'UPDATE SQL** : `annuler_reservation` /
  `modifier_reservation` insèrent une **nouvelle ligne** `demo_bookings`
  (`tool = annuler_reservation` / `modifier_reservation`) plutôt que de modifier
  la ligne de création. `Demo: Match & Decide` déduit l'état courant du client
  en prenant, parmi les lignes dont le téléphone (normalisé, 9 derniers chiffres)
  correspond, la plus récente par `created_at` : si c'est une annulation → pas
  de réservation active ; sinon la date/heure de cette ligne fait foi. Aucune
  migration SQL n'était nécessaire (les colonnes existantes suffisent).
- `Demo: Get Client Bookings` est en `alwaysOutputData: true` (même pattern que
  `Get many rows19`) : même sans réservation existante pour ce client, l'item
  traverse quand même la chaîne jusqu'à `Demo: Match & Decide`, qui répond alors
  « aucune réservation trouvée ».
- `Demo: Create Booking` / `Demo: Log Booking Event` sont en
  `onError: continueRegularOutput` : une panne Supabase n'empêche jamais
  l'assistant de confirmer au client (même principe que documenté plus bas pour
  l'ancien endpoint `/api/vapi/booking`).
- Les 10 sorties `Switch1` d'origine (real inbound *receptionist* : `getAvailability`,
  `bookAppointment`, `cancelAppointment`, …) ne matchaient **aucun** nom de tool
  démo avant cet ajout ; comme `Switch1` n'avait pas de sortie de repli, ces
  appels de démo étaient auparavant silencieusement ignorés (pas de panne
  visible côté client, mais rien n'était persisté). C'est corrigé par les 2
  nouvelles sorties ci-dessus.
- Réponse renvoyée à Vapi : `{ "results": [ { "toolCallId", "result" } ] }`, avec
  une phrase de confirmation **FR ou EN** selon l'argument `langue`.

**Persistance — multi-tenant par `assistant_id`.** Les leads partent dans
`public.demo_bookings` du projet Supabase **GritUnited** `bbxwezoscjuwsoflponx`
(credential n8n `GritUnited Supabase account`), *pas* dans le projet du `.env` de
ce repo. La clé de tenant est l'**`assistant_id` Vapi** : un seul workflow sert
tous les clients de démo, et en ajouter un ne demande aucune modification.

| Colonne | Contenu |
|---|---|
| `assistant_id` | **clé de tenant** — `message.assistant.id` |
| `assistant_name` | ex. `Démo vitrine · Le Comptoir 12` |
| `tool` | `enregistrer_rendezvous` \| `_reservation` \| `_commande` \| `_intervention` \| `annuler_reservation` \| `modifier_reservation` (événement, pas d'update — cf. §3.2) |
| `payload` | jsonb — les arguments du tool |
| `meta` | jsonb — `{ slug, env, ts, workflow }` |
| `call_id` / `tool_call_id` | ids Vapi ; `tool_call_id` est **unique** → un rejeu ne duplique pas |
| `source` | `n8n` (ou `api` pour l'ancienne route) |
| `environment` | `dev` (défaut) \| `rec` \| `prod` — contrainte `check` |
| `calendar_id` | agenda de destination, défaut `hello@zerocall.io` |
| `limit_creneau` | entier, défaut `1` — créneaux posés par la demande |

Migration : **`supabase/migrations/003_demo_bookings_n8n.sql`** (autonome et
idempotente — elle crée la table si besoin, 002 n'a pas à être jouée avant).
Test de remplissage rejouable : `scripts/n8n-demo-fill-test.mjs`.
Suivi détaillé du chantier : `docs/SUIVI_N8N_VAPI_DEMO.md`.

### Endpoint `/api/vapi/booking` (legacy)

> ⚠️ Depuis 2026-08, les assistants ne pointent **plus** vers cet endpoint mais
> vers le webhook n8n ci-dessus. La route reste en place et fonctionnelle ; le
> comportement décrit ci-dessous est celui de l'ancien câblage.

- Lit le format tool-call de Vapi (`message.toolCalls[]`) et **répond au format
  attendu** : `{ "results": [ { "toolCallId", "result" } ] }`, où `result` est
  une phrase de confirmation FR construite à partir des arguments.
- **Démo** : aucune réservation réelle. Tente un enregistrement *best-effort*
  dans la table Supabase `demo_bookings` (`{ tool, payload, meta }`) si elle
  existe — toute erreur est silencieuse.
- Contrôle optionnel d'un secret : si `VAPI_WEBHOOK_SECRET` est défini, le header
  `x-vapi-secret` de la requête doit correspondre.
- Les autres événements Vapi (status-update, end-of-call-report…) sont acquittés
  par `{ received: true }`.

Table Supabase d'historisation : **`supabase/migrations/002_demo_bookings.sql`**
(table `demo_bookings`, RLS activé sans policy → service_role seul, indexée).
Comme le reste du projet, ce SQL s'applique **à la main** dans le *SQL editor*
Supabase (pas de CLI / migration runner). Une fois la table créée, l'endpoint
l'alimente automatiquement ; tant qu'elle n'existe pas, l'insert best-effort est
silencieusement ignoré et la confirmation au client reste inchangée.

---

## 4. La bulle (widget) — couleurs & responsive

`components/VapiWidget.tsx` charge le web-component officiel depuis unpkg
(`https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js`, le SDK
étant ensuite tiré depuis `esm.sh`) puis monte un `<vapi-widget>` avec, par
métier, les attributs de `lib/vapi.ts`.

### Cohérence couleur (la bulle reprend la couleur de la page)

Les couleurs viennent des variables `oklch` du thème de chaque vitrine
(`app/globals.css [data-vit="…"]`), converties en **hex** (le widget n'accepte
que du hex) :

| slug | `accent-color` (= couleur de la page) | `base-color` (fond chat) | `theme` |
|---|---|---|---|
| `barbershop` | `#dd9143` (laiton) | `#2e241e` | dark |
| `onglerie` | `#d56e7d` (rose) | `#fffcfb` | light |
| `traiteur` | `#a13029` (lie-de-vin) | `#fef9f3` | light |
| `restaurant` | `#ddb049` (or bougie) | `#243226` | dark |
| `plombier` | `#036eae` (bleu acier) | `#f9fcfe` | light |

`button-base-color` = l'accent (la bulle flottante = couleur du métier),
`button-accent-color` = icône contrastée.

### Attributs Vapi posés sur l'élément

`mode="hybrid"` (chat + voix), `size="compact"`, `radius="large"`,
`position="bottom-right"`, libellés FR (`start-button-text="Appeler"`,
`end-button-text="Raccrocher"`, `main-label` = nom du commerce,
`empty-chat-message`, `empty-voice-message`), `show-transcript="true"`.

### Responsive mobile / tablette

- `size="compact"` (panneau de taille raisonnable).
- `app/globals.css` borne l'hôte `vapi-widget` à `max-width: calc(100vw - 1.5rem)`
  sous 640px pour que la fenêtre de chat ne touche jamais les bords.

---

## 5. Variables d'environnement (`.env`)

```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY=8e445673-5be9-4914-a75b-26c8005aa6f2   # widget (navigateur)
VAPI_PRIVATE_KEY=8bfd901c-1fc9-4702-b7dd-d3b8689fd83a              # provisioning (serveur only)
VAPI_WEBHOOK_SECRET=                                              # optionnel (x-vapi-secret)
NEXT_PUBLIC_VAPI_ASSISTANT_BARBERSHOP=58575546-41ba-46d3-a3f1-a277cbe6538f
NEXT_PUBLIC_VAPI_ASSISTANT_ONGLERIE=79cf70d2-266f-4315-b684-c67f5dac7004
NEXT_PUBLIC_VAPI_ASSISTANT_TRAITEUR=bbde8425-ff5f-42b4-9459-53ea6f5b2dfb
NEXT_PUBLIC_VAPI_ASSISTANT_RESTAURANT=07cb9db8-9944-4708-b7f8-e78f7a1ad8ec
NEXT_PUBLIC_VAPI_ASSISTANT_PLOMBIER=61b42505-e008-4912-9912-2d70a2c2d27e
```

> Les `NEXT_PUBLIC_*` sont **inlinées au build** : rebuild Next après changement.
> `lib/vapi.ts` contient des **replis en dur** identiques, donc le widget reste
> fonctionnel même si l'env n'est pas injecté.

---

## 6. CSP (production) — indispensable

Le snippet `csp_receptionniste` du `Caddyfile` (servant `receptionniste.zerocall.io`
et `webmaster.zerocall.io`, port 3010) a été étendu pour autoriser Vapi :

- `script-src` : `'unsafe-eval' blob: https://unpkg.com https://esm.sh`
- `connect-src` : `https://unpkg.com https://esm.sh https://*.vapi.ai wss://*.vapi.ai https://*.daily.co wss://*.daily.co https://*.pluot.blue`
- `media-src` : `blob: data: mediastream:` (micro)
- `frame-src` : `https://*.daily.co` · `worker-src 'self' blob:`

⚠️ Le Caddyfile **de production** est `/etc/caddy/Caddyfile` (multi-sites,
partagé — voir mémoire « Caddy global topology »). Le `Caddyfile` du dépôt est la
**référence** : reporter la même modif dans `/etc/caddy/Caddyfile` puis
`sudo systemctl reload caddy`. Sans ces autorisations, le widget affiche
« Connection issue » au décrochage.

---

## 7. (Re)provisionner / modifier les assistants

```bash
# crée si l'ID n'est pas dans .env, sinon PATCH (mêmes IDs conservés)
node scripts/vapi-setup-assistants.mjs
```

Le script lit `VAPI_PRIVATE_KEY` et `NEXT_PUBLIC_APP_URL` depuis `.env`. Toute la
définition (prompt FR/EN, voix, transcriber, tools, horaires, champs) vit dans
ce fichier : éditer le tableau `METIERS` puis relancer.

### Ajouter un nouveau métier

1. Ajouter la vitrine (`lib/vitrineContent.ts`, `lib/demos.ts`, thème
   `[data-vit]` dans `globals.css`).
2. Ajouter une entrée dans `METIERS` (`scripts/vapi-setup-assistants.mjs`) +
   `lib/vapi.ts` (couleurs hex converties depuis l'oklch du thème).
3. `node scripts/vapi-setup-assistants.mjs`, coller le nouvel ID dans `.env`.
4. Rebuild.
