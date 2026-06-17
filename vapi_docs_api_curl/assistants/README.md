# Assistants — `/assistant`

Source : https://docs.vapi.ai/api-reference/assistants/{list,create,get,update,delete}

Un **assistant** regroupe : un `model` (LLM + prompt), une `voice` (TTS),
un `transcriber` (STT), un `firstMessage` et un ensemble d'options d'appel.

- `create.md` — POST détaillé + exemple FR complet prêt à l'emploi
- ce README — vue d'ensemble des 5 endpoints

---

## 1. Lister — `GET /assistant`

```bash
curl -s -X GET "https://api.vapi.ai/assistant?limit=100" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

Query : `limit` (défaut 100) + filtres `createdAt*` / `updatedAt*` (voir README racine).
Réponse : `200` → **tableau** d'objets `Assistant`.

---

## 2. Créer — `POST /assistant`

Voir **`create.md`** pour le schéma complet et un exemple FR.
Forme minimale :

```bash
curl -s -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Réceptionniste",
    "firstMessage": "Bonjour, comment puis-je vous aider ?",
    "model": {
      "provider": "openai",
      "model": "gpt-4o",
      "messages": [
        { "role": "system", "content": "Tu es une réceptionniste polie." }
      ]
    },
    "voice": { "provider": "azure", "voiceId": "fr-FR-DeniseNeural" },
    "transcriber": { "provider": "deepgram", "model": "nova-2", "language": "fr" }
  }'
```

Réponse : `201` → objet `Assistant` créé (avec `id`, `orgId`, `createdAt`…).

---

## 3. Lire — `GET /assistant/{id}`

```bash
curl -s -X GET "https://api.vapi.ai/assistant/$ASSISTANT_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

Réponse : `200` → objet `Assistant` complet.

---

## 4. Modifier — `PATCH /assistant/{id}`

Envoie **uniquement** les champs à changer (merge partiel).

```bash
curl -s -X PATCH "https://api.vapi.ai/assistant/$ASSISTANT_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "firstMessage": "Bonjour et bienvenue, que puis-je faire pour vous ?",
    "model": {
      "provider": "openai",
      "model": "gpt-4o",
      "messages": [
        { "role": "system", "content": "Nouveau prompt système…" }
      ]
    }
  }'
```

> Pour les objets imbriqués (`model`, `voice`…), renvoie l'objet **entier** :
> Vapi remplace le sous-objet, il ne fusionne pas champ par champ à l'intérieur.

Réponse : `200` → objet `Assistant` mis à jour.

---

## 5. Supprimer — `DELETE /assistant/{id}`

```bash
curl -s -X DELETE "https://api.vapi.ai/assistant/$ASSISTANT_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

Réponse : `200` → objet `Assistant` supprimé.

---

## Anatomie d'un objet Assistant (champs principaux)

| Champ | Type | Rôle |
|-------|------|------|
| `name` | string | Nom interne |
| `firstMessage` | string | Première phrase de l'assistant |
| `firstMessageMode` | enum | `assistant-speaks-first` \| `assistant-waits-for-user` \| `assistant-speaks-first-with-model-generated-message` |
| `model` | object | LLM + prompt système + tools (voir `create.md`) |
| `voice` | object | TTS (provider + voiceId) |
| `transcriber` | object | STT (provider + model + language) |
| `voicemailMessage` | string | Message si répondeur détecté |
| `endCallMessage` | string | Message de fin |
| `endCallPhrases` | string[] | Phrases déclenchant la fin d'appel |
| `silenceTimeoutSeconds` | number | Silence avant raccrochage (défaut 30) |
| `maxDurationSeconds` | number | Durée max d'appel (défaut 600) |
| `backgroundSound` | enum/url | `office` \| `off` \| URL |
| `backgroundDenoisingEnabled` | boolean | Réduction de bruit |
| `clientMessages` | string[] | Events poussés au client (widget/SDK) |
| `serverMessages` | string[] | Events poussés au webhook serveur |
| `server` | object | `{ url, secret, headers }` webhook |
| `analysisPlan` | object | `summaryPlan`, `structuredDataPlan`, `successEvaluationPlan` |
| `artifactPlan` | object | `recordingEnabled`, `transcriptPlan`… |
| `startSpeakingPlan` / `stopSpeakingPlan` | object | Réglages d'interruption / endpointing |
| `voicemailDetection` | object | Détection répondeur |
| `metadata` | object | Données libres |

### Providers `transcriber`
`assembly-ai`, `azure`, `deepgram`, `11labs`, `gladia`, `google`,
`talkscriber`, `speechmatics`, `openai`, `cartesia`, `soniox`, `custom-transcriber`.
Chacun supporte un `fallbackPlan` (liste de transcribers de secours).

### Providers `voice`
`11labs`, `azure`, `openai`, `cartesia`, `playht`, `deepgram`, `rime-ai`, `lmnt`, `neets`…

### Providers `model`
`openai`, `anthropic`, `google`, `groq`, `azure-openai`, `xai`, `deepinfra`,
`custom-llm`, etc.
