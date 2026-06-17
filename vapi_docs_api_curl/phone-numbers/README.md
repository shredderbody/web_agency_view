# Phone numbers — `/phone-number`

Source : https://docs.vapi.ai/api-reference/phone-numbers/{list,create,get,update,delete}

L'objet est une **union discriminée par `provider`** :
`vapi`, `twilio`, `vonage`, `telnyx`, `byo-phone-number`.

---

## 1. Lister — `GET /phone-number`

```bash
curl -s -X GET "https://api.vapi.ai/phone-number?limit=100" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

Query : `limit` + filtres `createdAt*` / `updatedAt*`.
Réponse : `200` → **tableau** de numéros.

---

## 2. Créer / importer — `POST /phone-number`

### a) Numéro géré par Vapi (le plus simple)

```bash
curl -s -X POST https://api.vapi.ai/phone-number \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "vapi",
    "name": "Ligne demo",
    "assistantId": "<ASSISTANT_ID>"
  }'
```

### b) Import Twilio

```bash
curl -s -X POST https://api.vapi.ai/phone-number \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "twilio",
    "number": "+14155551234",
    "twilioAccountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "twilioAuthToken": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "assistantId": "<ASSISTANT_ID>"
  }'
```

### Paramètres du body

| Param | Type | Requis | Détail |
|-------|------|--------|--------|
| `provider` | enum | oui | `vapi` \| `twilio` \| `vonage` \| `telnyx` \| `byo-phone-number` |
| `number` | string | selon provider | numéro E.164 |
| `twilioAccountSid` | string | si Twilio | SID du compte |
| `twilioAuthToken` | string | si Twilio | token (ou `twilioApiKey`/`twilioApiSecret`) |
| `credentialId` | string | si vonage/telnyx/byo | credential stockée |
| `assistantId` | string | non | assistant pour les appels entrants |
| `squadId` / `workflowId` | string | non | routage alternatif |
| `name` | string | non | libellé |
| `fallbackDestination` | object | non | transfert si assistant indisponible |
| `hooks` | array | non | hooks d'événement (ringing/ending) |
| `server` | object | non | webhook |
| `smsEnabled` | boolean | non | SMS Twilio (défaut true) |

Réponse : `201` → objet numéro (`id`, `orgId`, `provider`, `status` `active`/`activating`/`blocked`, `createdAt`…).

---

## 3. Lire — `GET /phone-number/{id}`

```bash
curl -s -X GET "https://api.vapi.ai/phone-number/$PHONE_NUMBER_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

---

## 4. Modifier — `PATCH /phone-number/{id}`

Sert surtout à **réassigner l'assistant** d'une ligne.

```bash
curl -s -X PATCH "https://api.vapi.ai/phone-number/$PHONE_NUMBER_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ligne accueil",
    "assistantId": "<NOUVEL_ASSISTANT_ID>"
  }'
```

Réponse : `200` → numéro mis à jour.

---

## 5. Supprimer — `DELETE /phone-number/{id}`

```bash
curl -s -X DELETE "https://api.vapi.ai/phone-number/$PHONE_NUMBER_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

Réponse : `200` → numéro supprimé.

> Note : l'endpoint paginé `phone-number-controller-find-all-paginated` est une
> variante de la liste renvoyant `{ results, metadata }` au lieu d'un simple tableau.
