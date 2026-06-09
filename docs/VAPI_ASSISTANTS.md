# Bulle Vapi hybride & assistants inbound (pages /demo/[slug])

Chaque page métier (`/demo/<slug>`) embarque une **bulle de discussion hybride
Vapi** (chat écrit **et** appel vocal) branchée sur un **assistant inbound dédié
au métier**. Les assistants sont **bilingues FR + EN** (démarrage en français,
bascule automatique en anglais), prennent des **rendez-vous de démonstration**
(le booking n'est **pas réel**) et collectent les coordonnées du client.

> Tout est autoportant dans ce dépôt : aucun besoin du projet `receptionist`.
> Pour (re)provisionner les assistants : `node scripts/vapi-setup-assistants.mjs`.

---

## 1. Vue d'ensemble

| Pièce | Fichier |
|---|---|
| Composant bulle (web-component `<vapi-widget>`) | `components/VapiWidget.tsx` |
| Câblage dans la page métier | `components/DemoView.tsx` (`<VapiWidget slug={slug} />`) |
| Config par métier (IDs + couleurs) | `lib/vapi.ts` |
| Endpoint des function tools (démo) | `app/api/vapi/booking/route.ts` |
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
                                                   └─ function tool ──POST──▶ /api/vapi/booking
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

Chaque assistant expose **un** function tool, appelé une fois que le client a
confirmé. Tous pointent vers `POST {NEXT_PUBLIC_APP_URL}/api/vapi/booking`.

### Champs communs (tous les métiers)

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `prenom` | string | ✅ | Prénom du client |
| `nom` | string | ✅ | Nom de famille |
| `telephone` | string | ✅ | Numéro de téléphone |
| `date` | string | ✅ | Date souhaitée (JJ/MM/AAAA) |
| `heure` | string | ✅ | Heure souhaitée (HH:MM, dans les horaires) |
| `langue` | string | — | Langue de la conversation (`fr` / `en`) |

### Champs spécifiques par métier

| Tool | slug | Champs additionnels |
|---|---|---|
| `enregistrer_rendezvous` | `barbershop`, `onglerie` | `prestation` (string) |
| `enregistrer_commande` | `traiteur` | `commande` (string), `nombre_personnes` (string) — la date/heure = **retrait** |
| `enregistrer_reservation` | `restaurant` | `nombre_couverts` (string) |
| `enregistrer_intervention` | `plombier` | `adresse_intervention` (string), `nature_probleme` (string), `urgence` (boolean) |

> **Le plombier demande systématiquement l'adresse complète du lieu
> d'intervention** et la nature du problème — c'est imposé dans son prompt.

### Endpoint `/api/vapi/booking`

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

Table Supabase optionnelle (à créer si on veut historiser les démos) :

```sql
create table if not exists demo_bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  tool text,
  payload jsonb,
  meta jsonb
);
```

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
