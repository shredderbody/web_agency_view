# Thaï Vien Express — données client (démo)

Données réelles récupérées depuis Google Places API (New) le 2026-06-11.

- **place_id** : `ChIJX93BDLdl5kcRi4GQqMHtXaY`
- **Nom** : Thaï Vien Express
- **Adresse** : 17 Rue de l'Abreuvoir, 92400 Courbevoie, France
- **Téléphone** : 09 86 71 32 70
- **Note** : 4,7 / 5 (424 avis)
- **Type** : Restaurant thaï

## Fichiers
- `place_details.json` — réponse brute Place Details (infos, horaires, avis, métadonnées photos).
- `photos/photo_00..09.jpg` — 10 photos téléchargées (médias Google Places, maxWidthPx=1600).
  - `photo_06.jpg` = le tableau du **menu réel** (Plats 10,50 €).

## Utilisation dans le site
- Photos copiées vers `public/clients/thai-viens-express/`.
- Contenu structuré (bilingue FR/EN) : `lib/thaiViens.ts`.
- Page démo immersive : `app/demo/thai-viens-express/` → `components/ThaiVienExpress.tsx`.
- Liée depuis la landing (`#metiers`) et l'index des démos (`/demo`).
