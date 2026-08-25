# Vapi API — Référence cURL locale

Documentation locale dérivée de https://docs.vapi.ai/api-reference
pour la création/gestion d'assistants, numéros, tools, fichiers et structured outputs.

## Base & authentification

- **Base URL** : `https://api.vapi.ai`
- **Auth** : header `Authorization: Bearer <PRIVATE_API_KEY>`
  - La clé **privée** (server) sert pour tous les appels REST ci‑dessous.
  - La clé **publique** sert uniquement côté navigateur (widget Web SDK).
  - Récupère les clés dans le Dashboard → API Keys.
- **Content-Type** : `application/json` (sauf upload de fichier → `multipart/form-data`).

> ⚠️ Beaucoup d'exemples de la doc officielle écrivent `Authorization: YOUR_API_KEY`
> sans `Bearer`. Les deux formes fonctionnent, mais on standardise ici sur
> `Authorization: Bearer $VAPI_API_KEY`.

## Variable d'environnement conseillée

```bash
export VAPI_API_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"   # clé PRIVÉE
```

Tous les exemples utilisent `$VAPI_API_KEY`.

## Arborescence

| Dossier | Contenu |
|---------|---------|
| `assistants/`        | Créer / lister / lire / modifier / supprimer un assistant (cœur du projet) |
| `calls/`             | Lister et lire des appels (+ lancer un appel sortant) |
| `phone-numbers/`     | Acheter/importer, lister, lire, modifier, supprimer un numéro |
| `tools/`             | Créer/lister/lire/modifier/supprimer des tools (function calling, transfer, end-call…) |
| `files/`             | Upload de fichiers pour la Knowledge Base |
| `structured-outputs/`| Définir des extractions structurées (JSON Schema) sur les appels |

## Endpoints en un coup d'œil

| Ressource | Méthode | Path |
|-----------|---------|------|
| Assistants | GET | `/assistant` |
| | POST | `/assistant` |
| | GET | `/assistant/{id}` |
| | PATCH | `/assistant/{id}` |
| | DELETE | `/assistant/{id}` |
| Calls | GET | `/call` |
| | GET | `/call/{id}` |
| | POST | `/call` (lancer un appel) |
| Phone numbers | GET | `/phone-number` |
| | POST | `/phone-number` |
| | GET | `/phone-number/{id}` |
| | PATCH | `/phone-number/{id}` |
| | DELETE | `/phone-number/{id}` |
| Tools | GET | `/tool` |
| | POST | `/tool` |
| | GET | `/tool/{id}` |
| | PATCH | `/tool/{id}` |
| | DELETE | `/tool/{id}` |
| Files | GET | `/file` |
| | POST | `/file` (multipart) |
| | GET | `/file/{id}` |
| | PATCH | `/file/{id}` |
| | DELETE | `/file/{id}` |
| Structured outputs | GET | `/structured-output` |
| | POST | `/structured-output` |
| | GET | `/structured-output/{id}` |
| | PATCH | `/structured-output/{id}` |
| | DELETE | `/structured-output/{id}` |
| | POST | `/structured-output/{id}/run` |

## Conventions de pagination/filtre (list)

Tous les `GET` de liste acceptent :

| Param | Type | Détail |
|-------|------|--------|
| `limit` | number | max d'éléments, défaut `100` |
| `createdAtGt` / `createdAtLt` / `createdAtGe` / `createdAtLe` | date-time ISO8601 | filtre sur `createdAt` |
| `updatedAtGt` / `updatedAtLt` / `updatedAtGe` / `updatedAtLe` | date-time ISO8601 | filtre sur `updatedAt` |

## Notes projet (web_agency_view)

- Les assistants de démo (`/demo/[slug]`) sont créés/patchés par
  `scripts/vapi-setup-assistants.mjs` ; l'export réel est dans `../vapi_export/`.
- Clé privée lue dans `.env` → `VAPI_PRIVATE_KEY`. Filtre des assistants du projet :
  `metadata.project === "web_agency_view"` (le compte est partagé avec `receptionist`).
- Transcriber **bilingue FR + EN** (`bilingual` par défaut) : `deepgram` / `flux-general-multi`
  (`languages: ["fr","en"]`), fallback `nova-2` / `language: "multi"`.
- Transcriber **monolingue FR** (`bilingual: false`, ex. Thaï Vien Express) :
  `deepgram` / `nova-2` / `language: "fr"`, fallback `nova-3` / `language: "fr"`.
- Voix : `11labs` `eleven_multilingual_v2` (FR + EN) pour la plupart, `minimax`
  `speech-02-turbo` (FR) pour restaurant / thaï — voir `assistants/` et
  `lib/voiceCatalog.ts`.
- Tools définis **en inline** (`model.tools`), pas via `toolIds` ; ils POSTent
  vers le webhook n8n (`VAPI_TOOL_URL`, booking de démo, non réel).
- Widget Web : voir la mémoire `vapi-frontend-widget-playbook` (CSP / mic / mount).
