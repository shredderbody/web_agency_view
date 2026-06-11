# Reproduire une démo « client réel » (de A à Z)

Ce guide décrit, étape par étape, comment fabriquer une **page démo immersive à partir
des vraies données Google** d'un commerce — comme celle de **Thaï Vien Express**
(`/demo/thai-viens-express`). Suivez-le pour brancher un nouveau client.

> Exemple de référence livré : `Thaï Vien Express` (restaurant thaï, Courbevoie).
> Fichiers produits : `demo_thai_viens_express/`, `lib/thaiViens.ts`,
> `components/ThaiVienExpress.tsx`, `app/demo/thai-viens-express/`,
> `public/clients/thai-viens-express/`, + liens landing/index + config Vapi.

---

## Vue d'ensemble

| # | Étape | Sortie |
|---|-------|--------|
| 1 | Trouver l'établissement sur Google Places | `place_id` |
| 2 | Télécharger les détails (infos, avis, horaires, menu, photos) | `demo_<client>/place_details.json` |
| 3 | Télécharger les photos | `demo_<client>/photos/*.jpg` |
| 4 | Compresser en WebP | `public/clients/<slug>/*.webp` |
| 5 | Structurer les données (bilingue) | `lib/<client>.ts` |
| 6 | Construire la page immersive | `components/<Client>.tsx` |
| 7 | Créer la route + metadata | `app/demo/<slug>/page.tsx` |
| 8 | Brancher la réservation (OrderModal) | bouton « Réserver » fonctionnel |
| 9 | Brancher la bulle Vapi | `lib/vapi.ts` + `<VapiWidget slug=…>` |
| 10 | Lier depuis la landing + l'index | `app/page.tsx`, `app/demo/page.tsx` |
| 11 | Vérifier | `tsc`, dev server, screenshots |
| 12 | Déployer | commit → push → `update.sh` |

Pré-requis : `GOOGLE_PLACES_API_KEY` dans `.env` (déjà présent). Le projet tourne
sur le port **3010** ([[project-overview]]).

---

## 1) Trouver le `place_id`

```bash
KEY=$(grep '^GOOGLE_PLACES_API_KEY=' .env | cut -d= -f2- | tr -d '"' | xargs)
curl -s -X POST 'https://places.googleapis.com/v1/places:searchText' \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $KEY" \
  -H "X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount" \
  -d '{"textQuery":"NOM DU COMMERCE VILLE","languageCode":"fr"}'
```

Récupérez `places[0].id` (le `place_id`, ex. `ChIJX93BDLdl5kcRi4GQqMHtXaY`).

## 2) Télécharger les détails

```bash
mkdir -p demo_<client>/photos
ID=<place_id>
MASK="id,displayName,primaryType,primaryTypeDisplayName,types,formattedAddress,addressComponents,location,internationalPhoneNumber,nationalPhoneNumber,websiteUri,googleMapsUri,rating,userRatingCount,priceLevel,regularOpeningHours,businessStatus,editorialSummary,reviews,photos"
curl -s "https://places.googleapis.com/v1/places/$ID?languageCode=fr" \
  -H "X-Goog-Api-Key: $KEY" -H "X-Goog-FieldMask: $MASK" \
  -o demo_<client>/place_details.json
```

Le JSON contient : nom, adresse, téléphone, **horaires** (`regularOpeningHours.weekdayDescriptions`),
**avis** (`reviews[]`), et les **métadonnées des photos** (`photos[].name`).
⚠️ Astuce : une photo du **tableau du menu** est souvent présente — c'est la source
de la carte réelle (chez Thaï Vien, `photo_06`).

## 3) Télécharger les photos

```bash
node -e "const d=require('./demo_<client>/place_details.json');(d.photos||[]).forEach(p=>console.log(p.name))" > /tmp/names.txt
i=0; while IFS= read -r name; do
  curl -s -L "https://places.googleapis.com/v1/${name}/media?maxWidthPx=1600&key=$KEY" \
    -o "demo_<client>/photos/photo_$(printf '%02d' $i).jpg"; i=$((i+1));
done < /tmp/names.txt
```

Inspectez-les (ambiance, plats, enseigne, menu) pour décider du mapping image → section.

## 4) Compresser en WebP (perf)

Les JPEG Google font 250–800 Ko. On les passe en WebP (~−65 %) avec `sharp`
(déjà dans `node_modules`, fourni par Next) :

```bash
mkdir -p public/clients/<slug>
node -e '
const sharp=require("sharp"),fs=require("fs"),p=require("path");
const dir="demo_<client>/photos",out="public/clients/<slug>";
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith(".jpg"))){
  sharp(p.join(dir,f)).resize({width:1600,height:1600,fit:"inside",withoutEnlargement:true})
    .webp({quality:78,effort:5}).toFile(p.join(out,f.replace(/\.jpg$/,".webp")));
}'
```

L'archive `demo_<client>/` (JPEG bruts + JSON) reste à la racine comme **source**.
Elle est exclue de l'image Docker via `.dockerignore`. Le site sert les **WebP**
de `public/clients/<slug>/`.

## 5) Structurer les données — `lib/<client>.ts`

Copiez `lib/thaiViens.ts` comme gabarit. Il exporte :

- `IMG` — base `/clients/<slug>`
- `FACTS` — nom, métier (FR/EN), ville, adresse, téléphone, note, nb d'avis,
  `mapsUri`, `placeId`, `hours` (FR/EN)
- `MARQUEE` — noms de plats pour le bandeau défilant
- `getThaiContent(lang)` → objet `Content` **bilingue** : héros, story, **dishes**
  (photo + nom + prix), **menuColumns** (la carte réelle recréée), extras/desserts/
  boissons, ambiance, **reviews** (avis Google réels, nettoyés), infos, closing, nav.

➡️ Retranscrivez le **menu réel** depuis la photo du tableau, et les **avis réels**
depuis `place_details.json` (gardez les meilleurs, corrigez la ponctuation).

## 6) Construire la page — `components/<Client>.tsx`

Copiez `components/ThaiVienExpress.tsx`. Points clés :

- `"use client"`, racine `.tve-root` avec un **thème scoped** via variables CSS inline
  (`--bg`, `--accent`, `--fg`, …) → identité visuelle propre au client sans toucher
  au design system global.
- Sections : ribbon démo · header sticky + sidebar mobile · **héros plein cadre**
  (photo réelle + dégradé) · bandeau défilant · story + stats · **spécialités**
  (grille de plats) · **carte** (4 colonnes + photo du tableau) · **ambiance**
  (galerie) · **avis** Google · **infos** (adresse, horaires, téléphone, carte
  Google Maps `iframe`) · closing · `BusinessSearch` (CTA démo) · footer.
- Réutilise les composants maison : `Reveal`, `LangSelector`, `BusinessSearch`,
  `OrderModal`, `VapiWidget`.
- Les `<Image>` pointent les `.webp`. Le héros est `priority`.

## 7) Route + metadata — `app/demo/<slug>/page.tsx`

Page **serveur** (pour exporter `metadata`) qui rend le composant client :

```tsx
import type { Metadata } from "next";
import <Client> from "@/components/<Client>";
export const metadata: Metadata = { title: "…", description: "…", openGraph: { images: [{ url: "/clients/<slug>/photo_00.webp" }] } };
export default function Page() { return <<Client> />; }
```

> Le segment statique `app/demo/<slug>/` **prime** sur la route dynamique
> `app/demo/[slug]/` : la démo client ne passe donc PAS par `DemoView`/`getVitrine`.

## 8) Réservation — `OrderModal`

Le bouton « Réserver une table » ouvre `OrderModal` (formulaire multi-étapes) :

```tsx
const [modal, setModal] = useState(false);
// bouton : onClick={() => setModal(true)}
{modal && <OrderModal vit="resto" services={[]} business={FACTS.name} onClose={() => setModal(false)} />}
```

`vit` selon le métier : `resto` (réserver une table), `barber`/`onglerie`
(rendez-vous), `traiteur` (commande + retrait), `plombier` (devis). Le message de
confirmation interpole `{business}` → mettez le bon nom. (Démo front : pas d'envoi
backend, juste l'écran de succès — comme les autres démos.)

## 9) Bulle Vapi — `lib/vapi.ts`

Ajoutez une entrée dans `CONFIG` réutilisant l'assistant d'un métier proche
(ici l'assistant `restaurant`, réception **FR**, voix **MiniMax FR**), avec le **nom
et les couleurs** du client :

```ts
"<slug>": {
  assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_RESTAURANT || "07cb9db8-…",
  accent: "#e0a52e", base: "#2a221c", buttonIcon: "#15110d", theme: "dark",
  label: "<Nom du client>",
},
```

Puis `<VapiWidget slug="<slug>" />` dans la page.

**Disponibilité de la bulle** — elle est gated au runtime par `/config.json`
(`vapiWidgetEnabled`), modifiable **sans rebuild** (cf. `lib/runtime-config.ts`,
[[vapi-frontend-widget-playbook]]). Il faut `true` à 3 endroits cohérents :
- `config.json` (racine) — bind-monté dans le conteneur (`docker-compose.yml`),
  c'est la valeur servie en prod ;
- `public/config.json` — valeur par défaut bakée dans l'image ;
- vérifiez en live : `curl -s http://localhost:3010/config.json`.

**Voix MiniMax FR** — profil FR par défaut. La **référence canonique** des voix
est le projet sibling `receptionist` : `/home/amscjrb/receptionist/src/data/voiceCatalog.ts`
(entrée `fr-mono-minimax-journalist`). Mêmes valeurs que `lib/voiceCatalog.ts` ici :
`provider: "minimax"`, `voiceId: "French_Female Journalist"`, `model: "speech-02-turbo"`,
fallback Cartesia `sonic-2` `65b25c5d-ff07-4687-a04c-da2f43ef6fa9`.

Pour qu'un assistant l'utilise, `voice: VOICE.frMinimax` dans
`scripts/vapi-setup-assistants.mjs`, puis **poussez sur Vapi** (la clé est dans `.env`) :
```bash
node scripts/vapi-setup-assistants.mjs   # lit VAPI_PRIVATE_KEY depuis .env
```
Le script **upsert** chaque assistant : PATCH si son `NEXT_PUBLIC_VAPI_ASSISTANT_*`
est dans `.env` (cas normal → met à jour en place), sinon POST (⚠️ créerait un
doublon non câblé). Vérifiez le résultat :
```bash
KEY=$(grep '^VAPI_PRIVATE_KEY=' .env | cut -d= -f2- | tr -d '"' | xargs)
curl -s "https://api.vapi.ai/assistant/<assistantId>" -H "Authorization: Bearer $KEY" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const a=JSON.parse(s);console.log(a.voice?.provider,a.voice?.voiceId,a.voice?.model)})'
# attendu : minimax French_Female Journalist speech-02-turbo
```

## 10) Lier la page

- **Landing** `app/page.tsx`, section `#metiers` : carte « Client réel » (contour
  vermillon `--vermilion`, badge ⭐, note + ville) en tête de grille, lien
  `/demo/<slug>`.
- **Index démos** `app/demo/page.tsx` : même carte en tête de grille.

## 11) Vérifier

```bash
npx tsc --noEmit                     # 0 erreur attendue
npx next dev -p 3011                 # serveur de test (le 3010 = prod docker)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3011/demo/<slug>
```

Screenshots avec Playwright (déjà installé) — **scrollez** chaque section, sinon
les `Reveal` restent en `opacity:0` (IntersectionObserver) et la capture est vide :

```js
for (const s of ["#dishes","#carte","#ambiance","#avis","#infos"]) {
  await p.locator(s).scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  await p.screenshot({ path: `/tmp/${s.slice(1)}.png` });
}
```

## 12) Déployer (procédure complète)

`update.sh` fait `git pull origin main` → **committez et poussez TOUT d'abord**,
sinon le build repart sur l'ancien code.

```bash
# 1) Tout committer + pousser
git add -A
git commit -m "feat(demo): <client> — démo client réel immersive"
git push origin main
```

Puis, sur l'hôte, **redéploiement propre** (stop + suppression image → rebuild
100 % from scratch, garantit qu'aucune couche cachée ne traîne) :

```bash
# 2) Arrêter et supprimer le conteneur
docker stop atelier-vitrine && docker rm atelier-vitrine

# 3) Supprimer l'image (force un rebuild complet)
docker rmi atelier-vitrine:latest

# 4) Lancer le déploiement
bash update.sh            # pull + build + swap conteneur + reload Caddy + health-check :3010
```

⚠️ **Effet de la suppression d'image** : `update.sh` sauve un tag `:rollback`
à partir de l'image existante *avant* de builder — si vous l'avez supprimée, il
n'y a **pas de rollback** possible pour ce déploiement (warning « No :rollback
image available »). C'est le compromis du rebuild propre ; le health-check (60 s)
protège quand même contre une image cassée. Pour garder le filet de sécurité,
sautez l'étape 3 (`update.sh` recrée le conteneur de toute façon).

`update.sh` (mode caddy par défaut) : build l'image, recrée **uniquement** le
conteneur `web`, recharge le Caddy de l'hôte (domaine `receptionniste.zerocall.io`),
et rollback auto si le health-check échoue. Cf. [[docker-cloudflare-deploy]] et
[[caddy-receptionniste-block]].

Vérif finale :
```bash
curl -s -o /dev/null -w "local  %{http_code}\n" http://localhost:3010/demo/<slug>
curl -s -o /dev/null -w "webp   %{http_code}\n" http://localhost:3010/clients/<slug>/photo_00.webp
curl -s -o /dev/null -w "public %{http_code}\n" https://receptionniste.zerocall.io/demo/<slug>
```

---

## Pièges & correctifs UX (rencontrés en prod)

Ces correctifs sont **génériques** (valables pour toute démo) — pensez-y dès le départ.

### a) La bulle Vapi recouvre le bouton d'action d'une modale (mobile)
La bulle Vapi est `position: fixed` en bas à droite ; une modale en bottom-sheet
(`OrderModal`) y place son bouton « Continuer / Envoyer » → chevauchement.
**Fix universel** (déjà en place) : `OrderModal` ajoute la classe `om-open` sur
`<body>` à l'ouverture, et `globals.css` masque la bulle le temps de l'interaction :
```css
body.om-open [data-vapi-metier],
body.om-open .vapi-widget-wrapper { display: none !important; }
```
(Le conteneur est créé par `VapiWidget.tsx` avec l'attribut `[data-vapi-metier]`.)

### b) La carte Google Maps `output=embed` n'affiche rien (écran blanc)
L'URL `https://www.google.com/maps?q=...&output=embed` est souvent **bloquée**
(framing refusé / clé Maps Embed requise). **Fix** : carte **OpenStreetMap** sans
clé, framable, avec les `lat`/`lon` réels (présents dans `place_details.json` →
`location.latitude/longitude`, à mettre dans `FACTS`), enveloppée dans un lien vers
les directions Google :
```tsx
<iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.006}%2C${lat-0.0032}%2C${lon+0.006}%2C${lat+0.0032}&layer=mapnik&marker=${lat}%2C${lon}`} />
// mapsUri = https://www.google.com/maps/dir/?api=1&destination=<lat>,<lon>&destination_place_id=<placeId>
```
Superposez une épingle `<MapPin>` dorée (le marqueur OSM natif est peu visible).

---

## Récap des fichiers (exemple Thaï Vien Express)

```
demo_thai_viens_express/            # archive source (hors image Docker)
  place_details.json
  photos/photo_00..09.jpg
  README.md
public/clients/thai-viens-express/  # WebP servis par le site
  photo_00..09.webp
lib/thaiViens.ts                    # données bilingues
components/ThaiVienExpress.tsx       # page immersive
app/demo/thai-viens-express/page.tsx # route + metadata
lib/vapi.ts                          # + entrée "thai-viens-express"
app/page.tsx, app/demo/page.tsx      # cartes "Client réel"
scripts/vapi-setup-assistants.mjs    # voix restaurant → MiniMax FR
```
