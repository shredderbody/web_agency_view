# Suivi — Porter `~/devis_app` dans les démos (`/<slug>/admin/quotes`)

> **Fichier de reprise.** Si la session est coupée, relire ce fichier de haut en
> bas : l'état de chaque étape est à jour. Reprendre à la première étape `[ ]`.
> Mettre à jour ce fichier **après chaque étape**, jamais à la fin.

Dernière mise à jour : 2026-09-04 — 🚧 **CHANTIER OUVERT.** Audit fait,
architecture arrêtée. Rien n'est encore écrit. La production tourne sur
`5937a8b` et n'est pas affectée.

## ⏯️ Reprendre ici

Reprendre à l'**étape 2** (migration 007).

## Demande

> « Le problème du slug `/slug/admin/quotes` ne correspond pas du tout au projet
> `~/devis-app/`. Il manque des pages, plusieurs onglets, enregistrement des
> devis, options par vocal, etc. Reprends le projet et intègre les démos. Update
> du fichier de suivi et maintenir le suivi. »

## Ce que j'avais livré, et pourquoi c'était insuffisant

Le chantier précédent (`docs/SUIVI_DEVIS_FACTURES.md`) avait arrêté une
**réécriture ciblée** : reprendre le *modèle métier* de `devis_app` (lignes,
TVA, remises, statuts, numérotation, conversion) et laisser de côté le SaaS.

Cette décision était trop large. En écartant « le SaaS », j'ai écarté **des
fonctions qui ne sont pas du SaaS** : les onglets, le fichier client modifiable,
le catalogue modifiable, les réglages de l'émetteur, le tableau de bord
commercial, et surtout **la dictée vocale** — qui est la raison d'être du
produit (`devis_app` s'appelle `devis-vocal` dans son `package.json`).

Ce qui était vraiment du SaaS et reste écarté : comptes, organisations, plans et
quotas, Stripe, filigrane, parrainage, réseau multi-niveaux, blog, pages
marketing.

## Audit de `~/devis_app` (2026-09-04)

Application Next 15 / React 19, ~9 400 lignes de composants d'application.

### Les huit entrées de navigation

| Onglet | Fichier | Lignes | À porter ? |
|---|---|---|---|
| Devis (éditeur) | `components/tabs/DevisEditorTab.tsx` | 1 962 | ✅ **le cœur** |
| Mes devis (liste) | `components/tabs/DevisListTab.tsx` | 449 | ✅ |
| Factures | `components/tabs/FacturesTab.tsx` | 589 | ✅ |
| Clients | `components/tabs/ClientsTab.tsx` | 573 | ✅ |
| Catalogue | `components/tabs/CatalogueTab.tsx` | 826 | ✅ |
| Tableau de bord | `components/tabs/DashboardTab.tsx` | 731 | ✅ |
| Réglages | `components/tabs/SettingsTab.tsx` | 977 | ✅ (réduit) |
| Réseau / parrainage / démo | `NetworkPanel`, `ReferralPanel`, `DemoModal` | — | ❌ SaaS |

Plus : `components/VoiceButton.tsx` (585 l.), `VoicePlayback`,
`VoiceListeningHint`, `VoiceExamplesEmpty` — **la dictée vocale**.

### La chaîne vocale, telle qu'elle marche là-bas

```
micro (MediaRecorder)
  → POST /api/transcribe   → OpenAI Whisper (whisper-1)      → texte
  → POST /api/voice        → n8n (N8N_WEBHOOK_URL) → LLM     → lignes JSON
  → écriture des lignes du devis, puis confirmation parlée
  → POST /api/tts          → Deepgram Aura-2, repli ElevenLabs, repli navigateur
```

Le bouton gère aussi : reprise en continu (mode « infini »), phrases d'annulation
(« annule », « recommence »), phrases d'arrêt (« terminé », « c'est tout »),
détection d'une adresse e-mail dictée, et une confirmation parlée qui **compte
les prestations et signale les prix manquants**.

### Modèle de données

| Table `devis_app` | Correspondance ici |
|---|---|
| `quotes` (`items` jsonb, `status`, `valid_until`, `share_token`) | `demo_documents` ✅ déjà en place |
| `clients` | `demo_customers` ✅ existe, mais **en lecture seule** aujourd'hui |
| `catalog` + `catalog_categories` | ❌ **à créer** (migration 007) |
| `company_settings` | ❌ **à créer** (migration 007), réduite |
| `voice_sessions` | ❌ à créer (journal des dictées) |
| `organizations`, `profiles`, plans, Stripe, parrainage | ❌ hors sujet |

Différence de modèle à tenir : leur `QuoteItem` porte `tva` et un `total` **TTC**
par ligne, plus une `unit` (heure / jour / forfait / m² / unité). Le mien porte
`tax_rate` et calcule le HT ; **je garde le mien** (les totaux sont calculés
serveur, c'est un acquis) et **j'ajoute `unit`**.

## Décisions d'architecture (arrêtées le 2026-09-04)

| Sujet | Décision | Pourquoi |
|---|---|---|
| Forme | `/<slug>/admin/quotes` devient une **application à onglets**, pas un écran | c'est la demande, et c'est la forme de `devis_app` |
| Onglets | Éditeur · Devis · Factures · Clients · Catalogue · Tableau de bord · Réglages | les sept de `devis_app` qui ne sont pas du SaaS |
| Navigation | onglets en haut sur grand écran, **barre basse fixe** sur téléphone | repris de `BottomNav` : les onglets courants restent au pouce |
| Enregistrement | **automatique**, débounce ~1,2 s, plus un `Enregistrer` explicite | « il manque l'enregistrement des devis » : un devis dicté qu'on perd en changeant d'onglet est inacceptable |
| Dictée vocale | `MediaRecorder` → Whisper → **OpenAI directement**, pas n8n | `OPENAI_API_KEY` est déjà dans le `.env` de ce dépôt ; passer par n8n ajouterait un workflow à maintenir hors du dépôt pour le même résultat. La chaîne reste identique côté produit |
| Confirmation parlée | Deepgram Aura-2 → ElevenLabs → `SpeechSynthesis` du navigateur | exactement le repli en cascade de `devis_app` ; les trois clés sont déjà là |
| Catalogue | table `demo_catalog_items`, **semée depuis la vitrine** au premier accès | on ne part pas d'un catalogue vide : les prestations publiques sont déjà les bonnes |
| Clients | `demo_customers`, rendue **modifiable** | la table existe et porte déjà les gens qui ont appelé la standardiste |
| Réglages | table `demo_doc_settings`, **surcharges** de l'émetteur dérivé | l'identité reste dérivée de la vitrine ; les réglages ne font que la corriger (IBAN, mentions, TVA par défaut, logo) |
| PDF | **on garde l'impression navigateur** | `devis_app` embarque `jspdf` (775 lignes de `PDFExport`) ; la feuille `@media print` déjà en service rend mieux et ne pèse rien. C'est le seul point où je ne suis pas `devis_app` |
| Langues | tout en FR/EN, comme le reste de l'espace | acquis du chantier précédent |

## Étapes

- [x] **1.** Audit de `~/devis_app`, architecture arrêtée, fichier de suivi ouvert
- [ ] **2.** Migration `007` : catalogue, réglages, sessions vocales, `unit` sur les lignes
- [ ] **3.** Socle serveur : catalogue (semis + CRUD), réglages, clients modifiables
- [ ] **4.** API : `/api/portal/catalog`, `/api/portal/clients`, `/api/portal/doc-settings`
- [ ] **5.** API vocale : transcription (Whisper), analyse en lignes, synthèse vocale
- [ ] **6.** Coquille à onglets + barre basse mobile
- [ ] **7.** Onglet Éditeur : enregistrement automatique, unités, bouton de dictée
- [ ] **8.** Onglets Devis et Factures (listes, filtres, actions)
- [ ] **9.** Onglet Clients (CRUD)
- [ ] **10.** Onglet Catalogue (CRUD, catégories)
- [ ] **11.** Onglet Tableau de bord (chiffre d'affaires, conversion, encours)
- [ ] **12.** Onglet Réglages (émetteur, paiement, mentions)
- [ ] **13.** Bilingue + responsive de tout ce qui précède
- [ ] **14.** Build + vérification locale
- [ ] **15.** Commit + push + redéploiement
- [ ] **16.** Documentation

## Journal

- **2026-09-04 · audit** — `~/devis_app` relu en entier : 8 entrées de
  navigation, ~9 400 lignes de composants d'application, chaîne vocale
  Whisper → n8n → TTS en cascade, 31 migrations Supabase.
  **Je m'étais trompé de découpe au chantier précédent** : en écartant « le
  SaaS » j'ai écarté avec lui les onglets, le catalogue modifiable, le fichier
  client modifiable, les réglages, le tableau de bord et la dictée vocale — qui
  n'ont rien de SaaS et qui font le produit. `devis_app` s'appelle
  `devis-vocal` : la voix n'était pas un détail à laisser de côté.
- **2026-09-04 · les clés nécessaires sont déjà dans le `.env` d'ici** —
  `OPENAI_API_KEY` (Whisper), `DEEPGRAM_API_KEY` et `ELEVENLABS_API_KEY` (voix
  de retour), `N8N_*`. Rien à demander pour que la dictée fonctionne.
- **2026-09-04 · un écart assumé avec `devis_app` : le PDF.** Là-bas,
  `jspdf` + 775 lignes de `PDFExport`. Ici, la feuille `@media print` en service
  depuis ce matin rend le même document en mieux et ne pèse rien. Je ne
  reprends donc pas cette brique — c'est le seul point du produit où je ne suis
  pas `devis_app`, et il est noté ici pour qu'on puisse me contredire.
