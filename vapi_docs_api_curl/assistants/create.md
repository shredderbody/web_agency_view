# Créer un assistant — `POST /assistant`

Source : https://docs.vapi.ai/api-reference/assistants/create
Schéma de requête : **`CreateAssistantDTO`** · Réponse : `201` → objet `Assistant`.

```
POST https://api.vapi.ai/assistant
Authorization: Bearer $VAPI_API_KEY
Content-Type: application/json
```

---

## Schéma `model`

```jsonc
"model": {
  "provider": "openai",            // openai | anthropic | google | groq | custom-llm ...
  "model": "gpt-4o",               // id du modèle chez le provider
  "temperature": 0.4,              // 0–2 (optionnel)
  "maxTokens": 250,                // tokens de réponse (optionnel)
  "emotionRecognitionEnabled": true,
  "messages": [
    { "role": "system", "content": "Prompt système…" }
  ],
  "tools": [ /* tools inline */ ],
  "toolIds": [ "tool_id_1" ],      // référence des tools déjà créés (/tool)
  "knowledgeBaseId": "kb_id"       // Knowledge Base optionnelle
}
```

## Schéma `voice`

```jsonc
// Azure (bon support FR)
"voice": { "provider": "azure", "voiceId": "fr-FR-DeniseNeural" }

// ElevenLabs (multilingue)
"voice": {
  "provider": "11labs",
  "voiceId": "<eleven_voice_id>",
  "model": "eleven_multilingual_v2",
  "stability": 0.5,
  "similarityBoost": 0.75
}

// OpenAI
"voice": { "provider": "openai", "voiceId": "alloy" }
```

## Schéma `transcriber`

```jsonc
// Deepgram FR (recommandé)
"transcriber": { "provider": "deepgram", "model": "nova-2", "language": "fr" }

// Avec plan de secours
"transcriber": {
  "provider": "deepgram", "model": "nova-2", "language": "fr",
  "fallbackPlan": {
    "transcribers": [
      { "provider": "azure", "language": "fr-FR" }
    ]
  }
}
```

---

## Exemple complet FR — réceptionniste (prêt à l'emploi)

```bash
curl -s -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Réceptionniste Demo",
    "firstMessage": "Bonjour, vous êtes bien au cabinet. Comment puis-je vous aider ?",
    "firstMessageMode": "assistant-speaks-first",
    "model": {
      "provider": "openai",
      "model": "gpt-4o",
      "temperature": 0.3,
      "messages": [
        {
          "role": "system",
          "content": "Tu es la réceptionniste téléphonique d un cabinet. Tu parles français, de manière polie, concise et chaleureuse. Tu réponds aux questions courantes (horaires, adresse, prise de rendez-vous) et tu transfères ou prends un message si nécessaire. Ne donne jamais de conseil médical ou juridique."
        }
      ]
    },
    "voice": {
      "provider": "azure",
      "voiceId": "fr-FR-DeniseNeural"
    },
    "transcriber": {
      "provider": "deepgram",
      "model": "nova-2",
      "language": "fr"
    },
    "voicemailMessage": "Bonjour, vous êtes bien au cabinet. Merci de rappeler pendant nos horaires d ouverture.",
    "endCallMessage": "Merci de votre appel, très bonne journée !",
    "endCallPhrases": ["au revoir", "bonne journée", "merci au revoir"],
    "silenceTimeoutSeconds": 30,
    "maxDurationSeconds": 600,
    "backgroundSound": "office",
    "backgroundDenoisingEnabled": true,
    "analysisPlan": {
      "summaryPlan": {
        "enabled": true
      },
      "structuredDataPlan": {
        "enabled": true,
        "schema": {
          "type": "object",
          "properties": {
            "motif_appel": { "type": "string" },
            "rdv_demande": { "type": "boolean" },
            "rappel_souhaite": { "type": "boolean" }
          }
        }
      }
    },
    "metadata": {
      "project": "web_agency_view",
      "kind": "demo-inbound",
      "slug": "texas-plumbing-pros"
    }
  }'
```

### Variante avec tools déjà créés

```jsonc
"model": {
  "provider": "openai",
  "model": "gpt-4o",
  "messages": [ { "role": "system", "content": "…" } ],
  "toolIds": ["<id_tool_transfer>", "<id_tool_prise_rdv>"]
}
```

---

## Champs optionnels utiles

| Champ | Effet |
|-------|-------|
| `firstMessageMode` | qui parle en premier |
| `serverMessages` | events envoyés au webhook (`end-of-call-report`, `status-update`, `tool-calls`…) |
| `clientMessages` | events envoyés au widget/SDK |
| `server` | `{ "url": "https://…/webhook", "secret": "…" }` |
| `voicemailDetection` | `{ "provider": "vapi" }` ou config Twilio |
| `startSpeakingPlan` / `stopSpeakingPlan` | finesse d'interruption / endpointing |
| `artifactPlan` | `{ "recordingEnabled": true, "transcriptPlan": { "enabled": true } }` |

## Erreurs fréquentes

- `400` : `model`/`voice`/`transcriber` mal formés ou provider inconnu.
- `401` : clé API absente/mauvaise, ou clé **publique** utilisée au lieu de la privée.
- Voix muette / mauvais accent : `language` du transcriber ou `voiceId` non‑FR.
