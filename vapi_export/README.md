# vapi_export — assistants & fonctions du projet (source d'inspiration)

Export **réel** des assistants Vapi DE CE PROJET (`web_agency_view`), via la clé
privée `VAPI_PRIVATE_KEY` du `.env`, à réutiliser comme modèles.

> Le compte Vapi est **partagé** avec le projet `receptionist`. Cet export ne
> contient QUE les assistants `metadata.project === "web_agency_view"` (les
> « Démo vitrine · … » d'`/demo/[slug]`). Les assistants du projet receptionist
> sont, eux, exportés dans `~/receptionist/vapi_export/`.

> Pour la doc des endpoints API (cURL create/update/delete), voir `../vapi_docs_api_curl/`.

## Contenu

| Dossier | Quoi | Nb |
|---------|------|----|
| `assistants/` | tous les assistants de démo (un fichier JSON par assistant) | 12 |
| `functions/`  | les tools **inline** extraits des assistants (un par nom) | 4 |

- `assistants/_index.md` — table récap (nom, model, voice, transcriber, #tools, slug)
- `functions/_index.md` / `_index.json` — table `id8 → type → nom → utilisé par`

### Convention de nommage des fichiers

- Assistants : `<nom-slug>__<id8>.json`
  ex. `demo-vitrine-barbershop-courbevoie__4cee76d9.json`
- Fonctions : `<type>__<nom-fonction>__<id8>.json`
  ex. `function__enregistrer-intervention__458bb2cf.json`

`id8` = pour un assistant, les 8 premiers caractères de l'`id` Vapi ; pour une
fonction **inline**, un hash SHA‑1 du contenu (les tools de démo n'ont PAS de
`toolId` Vapi, ils sont définis directement dans `model.tools`).

## Lien assistant → fonctions

Contrairement aux assistants « receptionist » (qui référencent des tools par
`model.toolIds`), les assistants de démo embarquent leurs tools **en inline**
dans `model.tools`. Chaque assistant porte donc déjà la définition complète de
son tool.

```bash
# le(s) tool(s) inline d'un assistant
jq -r '.model.tools[].function.name' \
  assistants/demo-vitrine-barbershop-courbevoie__4cee76d9.json

# quels assistants utilisent un tool donné
jq -r '.[] | select(.name=="enregistrer_intervention") | .usedBy[]' functions/_index.json
```

## Fonctions disponibles (vue métier)

| Fonction | Rôle | Métiers |
|----------|------|---------|
| `enregistrer_commande` | enregistrer commande | ines-garden, traiteur |
| `enregistrer_intervention` | enregistrer intervention | plombier, texas-plumbing-pros |
| `enregistrer_rendezvous` | enregistrer rendezvous | barbershop, barbershop-courbevoie, lak-nail-salon, maison-ephemere, onglerie |
| `enregistrer_reservation` | enregistrer reservation | openhouse-canggu, restaurant, thai-viens-express |

Toutes POSTent vers le webhook n8n (`server.url`, cf. `VAPI_TOOL_URL`) — le
booking n'est PAS réel : démo. La source de vérité reste
`scripts/vapi-setup-assistants.mjs`.

## Recréer / mettre à jour

- **Recréer / patcher** les assistants de démo : `node scripts/vapi-setup-assistants.mjs`
  (crée si absent, PATCH si l'ID est déjà dans `.env`).
- **Ré-exporter ce dossier** : `node scripts/vapi-export.mjs`
  (refetch l'API, filtre `project=web_agency_view`, réécrit `vapi_export/` + ce README).

```bash
# recréer un tool standalone à partir d'un export inline nettoyé
jq 'del(.messages)' functions/function__enregistrer-intervention__458bb2cf.json > /tmp/new_tool.json
curl -s -X POST https://api.vapi.ai/tool \
  -H "Authorization: Bearer \$VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  --data @/tmp/new_tool.json
```

> ⚠️ Ces fichiers contiennent les prompts système et l'URL de webhook n8n interne
> (`n8n.zerocall.io/webhook/…`). Ne pas exposer publiquement.
> Aucune clé API n'est stockée dedans (`isServerUrlSecretSet` indique juste qu'un
> secret existe côté Vapi).
