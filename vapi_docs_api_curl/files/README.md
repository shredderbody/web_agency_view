# Files — `/file`

Source : https://docs.vapi.ai/api-reference/files/{list,create,get,update,delete}

Upload de fichiers (PDF, txt, docx, md…) destinés à la **Knowledge Base**
d'un assistant. ⚠️ L'upload se fait en **`multipart/form-data`**, pas en JSON.

---

## 1. Lister — `GET /file`

```bash
curl -s -X GET "https://api.vapi.ai/file" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

Réponse : `200` → **tableau** de fichiers.

---

## 2. Uploader — `POST /file` (multipart)

```bash
curl -s -X POST https://api.vapi.ai/file \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -F "file=@/chemin/vers/faq_cabinet.pdf"
```

> Ne PAS mettre `Content-Type: application/json` : `-F` pose
> automatiquement `multipart/form-data` avec le bon boundary.

### Réponse `201`

```json
{
  "id": "string",
  "object": "file",
  "status": "processing",          // processing | done | failed
  "name": "string",
  "originalName": "faq_cabinet.pdf",
  "bytes": 12345,
  "mimetype": "application/pdf",
  "url": "https://…",
  "parsedTextUrl": "https://…",
  "parsedTextBytes": 6789,
  "key": "string",
  "path": "string",
  "bucket": "string",
  "purpose": "string",
  "metadata": {},
  "orgId": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

`400` si format invalide.

---

## 3. Lire — `GET /file/{id}`

```bash
curl -s -X GET "https://api.vapi.ai/file/$FILE_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

Permet de vérifier `status` (attendre `done` avant usage en KB).

## 4. Modifier — `PATCH /file/{id}`

Renomme / met à jour les métadonnées (JSON ici).

```bash
curl -s -X PATCH "https://api.vapi.ai/file/$FILE_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "FAQ cabinet v2" }'
```

## 5. Supprimer — `DELETE /file/{id}`

```bash
curl -s -X DELETE "https://api.vapi.ai/file/$FILE_ID" \
  -H "Authorization: Bearer $VAPI_API_KEY"
```

---

## Utiliser le fichier dans une Knowledge Base

Après upload (`status: done`), on crée une KB référençant le `fileId`,
puis on met son `knowledgeBaseId` dans `model.knowledgeBaseId` de l'assistant
(ou on utilise un tool `query` selon la config KB de ton compte).
