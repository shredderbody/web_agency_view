# Calls — `/call`

Source : https://docs.vapi.ai/api-reference/calls/{list,get}

---

## 1. Lister — `GET /call`

```bash
curl -s -X GET "https://api.vapi.ai/call?limit=100" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

### Query

| Param | Type | Détail |
|-------|------|--------|
| `id` | string | id d'un appel précis |
| `assistantId` | string | filtre par assistant |
| `phoneNumberId` | string | filtre par numéro (appels téléphoniques) |
| `limit` | number | défaut 100 |
| `createdAt*` / `updatedAt*` | date-time | filtres temporels (voir README racine) |

Réponse : `200` → **tableau** de `Call`.

---

## 2. Lire — `GET /call/{id}`

```bash
curl -s -X GET "https://api.vapi.ai/call/$CALL_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

Réponse : `200` → objet `Call`.

---

## 3. (Bonus) Lancer un appel — `POST /call`

Non listé dans tes URLs mais indispensable pour l'outbound.

### Appel sortant (téléphone)

```bash
curl -s -X POST https://api.vapi.ai/call \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assistantId": "<ASSISTANT_ID>",
    "phoneNumberId": "<PHONE_NUMBER_ID>",
    "customer": { "number": "+33612345678" }
  }'
```

### Avec assistant inline (au lieu d'un id)

```bash
curl -s -X POST https://api.vapi.ai/call \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumberId": "<PHONE_NUMBER_ID>",
    "customer": { "number": "+33612345678" },
    "assistant": {
      "firstMessage": "Bonjour, je vous appelle au sujet de votre rendez-vous.",
      "model": { "provider": "openai", "model": "gpt-4o",
                 "messages": [{ "role": "system", "content": "…" }] },
      "voice": { "provider": "azure", "voiceId": "fr-FR-DeniseNeural" },
      "transcriber": { "provider": "deepgram", "model": "nova-2", "language": "fr" }
    }
  }'
```

Réponse : `201` → objet `Call` (avec `id`, `status`…).

---

## Anatomie d'un objet `Call`

| Champ | Détail |
|-------|--------|
| `id` | identifiant |
| `type` | `inboundPhoneCall` \| `outboundPhoneCall` \| `webCall` \| `websocketCall` |
| `status` | `scheduled` \| `queued` \| `ringing` \| `in-progress` \| `ended` … |
| `endedReason` | raison de fin |
| `startedAt` / `endedAt` / `createdAt` / `updatedAt` | timestamps ISO8601 |
| `assistantId` / `phoneNumberId` | routage |
| `customer` | `{ number }` interlocuteur |
| `messages[]` | échanges (user, bot, system, tool) |
| `costs[]` | coûts détaillés (transport, transcriber, model, voice, analysis) |
| `transcript` | transcription texte |
| `recordingUrl` | enregistrement audio |
| `summary` / `structuredData` / `successEvaluation` | résultats d'analyse |
| `destination` / `phoneCallProvider` / `transport` | détails transport |
