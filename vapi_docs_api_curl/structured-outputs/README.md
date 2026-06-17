# Structured Outputs — `/structured-output`

Source : https://docs.vapi.ai/api-reference/structured-outputs/structured-output-controller-*

Définit une **extraction structurée** (JSON Schema) appliquée aux appels :
à la fin d'un appel, Vapi remplit l'objet défini (ex. motif, RDV, coordonnées).
Réutilisable sur plusieurs assistants via `assistantIds`.

| Action | Méthode | Path |
|--------|---------|------|
| find-all  | GET    | `/structured-output` |
| create    | POST   | `/structured-output` |
| find-one  | GET    | `/structured-output/{id}` |
| update    | PATCH  | `/structured-output/{id}` |
| remove    | DELETE | `/structured-output/{id}` |
| run       | POST   | `/structured-output/{id}/run` |

---

## 1. Lister — `GET /structured-output`

```bash
curl -s -X GET "https://api.vapi.ai/structured-output" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

---

## 2. Créer — `POST /structured-output`

```bash
curl -s -X POST https://api.vapi.ai/structured-output \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "fiche_appel_cabinet",
    "type": "ai",
    "description": "Synthèse structurée d un appel de réception.",
    "schema": {
      "type": "object",
      "properties": {
        "nom_appelant":   { "type": "string" },
        "telephone":      { "type": "string" },
        "motif_appel":    { "type": "string" },
        "rdv_demande":    { "type": "boolean" },
        "date_souhaitee": { "type": "string", "description": "ISO 8601" },
        "rappel_souhaite":{ "type": "boolean" }
      },
      "required": ["motif_appel"]
    },
    "assistantIds": ["<ASSISTANT_ID>"]
  }'
```

### Paramètres du body

| Param | Type | Requis | Détail |
|-------|------|--------|--------|
| `name` | string | oui | identifiant lisible |
| `schema` | JsonSchema | oui | structure de l'extraction |
| `type` | enum | non | `ai` (défaut) \| `regex` |
| `regex` | string | non | motif si `type: regex` |
| `model` | object | non | LLM dédié (openai/anthropic/google/custom) |
| `description` | string | non | contexte d'usage |
| `assistantIds` | string[] | non | assistants liés |
| `workflowIds` | string[] | non | workflows liés |
| `compliancePlan` | object | non | overrides conformité |

Réponse : `201` → objet créé (`id`, `orgId`, `createdAt`…).

---

## 3. Lire — `GET /structured-output/{id}`

```bash
curl -s -X GET "https://api.vapi.ai/structured-output/$SO_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

## 4. Modifier — `PATCH /structured-output/{id}`

```bash
curl -s -X PATCH "https://api.vapi.ai/structured-output/$SO_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "description": "Version mise à jour de la fiche d appel." }'
```

## 5. Supprimer — `DELETE /structured-output/{id}`

```bash
curl -s -X DELETE "https://api.vapi.ai/structured-output/$SO_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

## 6. Exécuter — `POST /structured-output/{id}/run`

Lance l'extraction sur des données fournies (utile pour tester un schéma
sans relancer un appel réel).

```bash
curl -s -X POST "https://api.vapi.ai/structured-output/$SO_ID/run" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Bonjour, je suis M. Martin, je voudrais un rendez-vous mardi pour un contrôle."
  }'
```

Réponse : l'objet structuré rempli selon le `schema`.

---

## Alternative : extraction inline dans l'assistant

Sans créer d'objet réutilisable, on peut définir l'extraction directement dans
`analysisPlan.structuredDataPlan.schema` à la création de l'assistant
(voir `../assistants/create.md`).
