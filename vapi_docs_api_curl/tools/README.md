# Tools — `/tool`

Source : https://docs.vapi.ai/api-reference/tools/{list,create,get,update,delete}

Un **tool** est une capacité que le LLM peut déclencher pendant l'appel
(function calling vers ton serveur, transfert, raccrochage, DTMF, handoff…).
On le crée une fois, puis on le référence dans `model.toolIds` d'un assistant.

Types : `function`, `dtmf`, `transfer-call`, `end-call`, `handoff`,
`apiRequest`, `bash`, `computer`, `textEditor`, `google.calendar…`, etc.

---

## 1. Lister — `GET /tool`

```bash
curl -s -X GET "https://api.vapi.ai/tool?limit=100" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

Query : `limit` + filtres `createdAt*` / `updatedAt*`.
Réponse : `200` → **tableau** de tools.

---

## 2. Créer — `POST /tool`

### a) Tool `function` (webhook vers ton serveur)

```bash
curl -s -X POST https://api.vapi.ai/tool \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "function",
    "async": false,
    "function": {
      "name": "prendre_rendez_vous",
      "description": "Enregistre une demande de rendez-vous pour le cabinet.",
      "parameters": {
        "type": "object",
        "properties": {
          "nom":   { "type": "string", "description": "Nom du patient" },
          "date":  { "type": "string", "description": "Date souhaitée (ISO 8601)" },
          "motif": { "type": "string", "description": "Motif de la consultation" }
        },
        "required": ["nom", "date"]
      }
    },
    "server": {
      "url": "https://ton-serveur.com/vapi/rdv",
      "timeoutSeconds": 20,
      "headers": { "x-api-key": "secret" }
    },
    "messages": [
      { "type": "request-start",    "content": "Je note votre demande…" },
      { "type": "request-complete", "content": "C est enregistré." },
      { "type": "request-failed",   "content": "Désolé, je n ai pas pu enregistrer." }
    ]
  }'
```

### b) Tool `transfer-call`

```bash
curl -s -X POST https://api.vapi.ai/tool \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transfer-call",
    "destinations": [
      { "type": "number", "number": "+33123456789",
        "message": "Je vous transfère vers le secrétariat." }
    ]
  }'
```

### c) Tool `end-call`

```bash
curl -s -X POST https://api.vapi.ai/tool \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "type": "end-call" }'
```

### Paramètres du body

| Param | Type | Détail |
|-------|------|--------|
| `type` | enum | `function` \| `dtmf` \| `transfer-call` \| `end-call` \| `handoff` … |
| `function` | object | `{ name, description, parameters }` (format OpenAI ; `name` ≤ 64 car., `[a-zA-Z0-9_-]`) |
| `async` | boolean | si `true`, n'attend pas la réponse serveur |
| `server` | object | `{ url, timeoutSeconds (déf. 20), headers, credentialId, backoffPlan }` |
| `messages` | array | messages déclenchés (`request-start`, `request-complete`, `request-failed`, `request-response-delayed`) |
| `destinations` | array | (transfer-call) numéros/SIP/assistants cibles |
| `rejectionPlan` | object | conditions d'exécution |
| `variableExtractionPlan` | object | variables extraites de la réponse |

Réponse : `201` → objet tool créé (avec `id`).

---

## 3. Lire — `GET /tool/{id}`

```bash
curl -s -X GET "https://api.vapi.ai/tool/$TOOL_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

## 4. Modifier — `PATCH /tool/{id}`

```bash
curl -s -X PATCH "https://api.vapi.ai/tool/$TOOL_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "function": { "description": "Nouvelle description du tool." } }'
```

## 5. Supprimer — `DELETE /tool/{id}`

```bash
curl -s -X DELETE "https://api.vapi.ai/tool/$TOOL_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

---

## Brancher un tool sur un assistant

```jsonc
"model": {
  "provider": "openai",
  "model": "gpt-4o",
  "messages": [ { "role": "system", "content": "…" } ],
  "toolIds": ["<TOOL_ID_1>", "<TOOL_ID_2>"]
}
```
