# Suivi — Porter `~/devis_app` dans les démos (`/<slug>/admin/quotes`)

> **Fichier de reprise.** Si la session est coupée, relire ce fichier de haut en
> bas : l'état de chaque étape est à jour. Reprendre à la première étape `[ ]`.
> Mettre à jour ce fichier **après chaque étape**, jamais à la fin.

Dernière mise à jour : 2026-09-04 — 🚧 **CHANTIER OUVERT.** Audit fait,
architecture arrêtée. Rien n'est encore écrit. La production tourne sur
`5937a8b` et n'est pas affectée.

## ⏯️ Reprendre ici

Reprendre à l'**étape 6** (coquille à onglets).

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
- [x] **2.** Migration `007` : catalogue, réglages, sessions vocales, fiche client postale
- [x] **3.** Socle serveur : catalogue (semis + CRUD), réglages, clients modifiables
- [x] **4.** API : `/api/portal/catalog`, `/api/portal/clients`, `/api/portal/doc-settings`
- [x] **5.** API vocale : transcription (Whisper), analyse en lignes, synthèse vocale
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
- **2026-09-04 · étape 2, migration 007 appliquée sur les deux projets** puis
  **vérifiée par lecture du schéma** : `demo_catalog_categories` 8 colonnes,
  `demo_catalog_items` 14, `demo_doc_settings` 25, `demo_voice_sessions` 8, et
  les six colonnes postales ajoutées à `demo_customers` (`address`, `city`,
  `company`, `postal_code`, `siret`, `source`).
  ⚠️ **Correction à la note de la 006** : le jeton d'administration du projet
  GritUnited n'est pas `JWT_SUPABASE` de `~/grit-united/.env` (41 caractères,
  `sb_se…` — c'est une clé de service, pas un jeton de gestion) mais
  **`SUPABASE_ACCESS_TOKEN`** (44 caractères, `sbp_…`). Le pare-feu Cloudflare
  exige toujours un `User-Agent` de navigateur.
- **2026-09-04 · une ligne de devis portera une UNITÉ** — pas de changement de
  schéma : les lignes vivent dans une colonne `jsonb`. `devis_app` propose
  heure / jour / forfait / m² / unité ; on y ajoute le mètre linéaire et le kilo,
  qui manquent à un traiteur et à un poseur.
- **2026-09-04 · un point tranché dans la migration : on STOCKE le transcript
  des dictées** (`demo_voice_sessions`), alors que le journal d'actions
  s'interdit tout contenu de conversation. Ce n'est pas une contradiction :
  `demo_actions` garde la parole d'un CLIENT au téléphone, `demo_voice_sessions`
  garde la dictée de l'exploitant sur son propre devis. Il dicte précisément
  pour que ce soit écrit.
- **2026-09-04 · étape 3, trois modules serveur** —
  `catalogStore.ts`, `docSettings.ts`, et le fichier client rendu modifiable
  dans `ledger.ts`. Trois décisions valent d'être notées :

  1. **`catalog.ts` et `catalogStore.ts` ne font pas la même chose**, et c'est
     voulu. Le premier dit ce que la VITRINE affiche — une vue, figée, qui suit
     la page publique. Le second dit ce que l'EXPLOITANT vend. Le catalogue est
     semé depuis la vitrine au premier accès, une fois ; ensuite il lui
     appartient : s'il supprime une ligne, elle ne repousse pas au chargement
     suivant. Présenter un catalogue vide à quelqu'un dont les prix sont déjà
     écrits sur sa page aurait été absurde ; les lui réimposer à chaque
     chargement le serait tout autant.
  2. **Les réglages sont des SURCHARGES.** Un champ vide retombe sur la vitrine :
     quelqu'un qui efface son adresse veut revenir à celle de sa page, pas
     imprimer un document sans adresse. Et les mentions légales dérivées
     (pénalités de retard, indemnité de 40 €) ne sont **pas** remplaçables — un
     exploitant ne devrait pas pouvoir les supprimer par inadvertance ; celles
     qu'il saisit viennent en plus.
  3. **Deux façons d'écrire une fiche client, pour deux auteurs.**
     `upsertCustomer` sert la standardiste : elle n'efface jamais une coordonnée
     par du vide, parce qu'un appel où le client ne redonne pas son e-mail ne
     veut pas dire qu'il n'en a plus. `createCustomerManually` / `patchCustomer`
     servent l'exploitant : lui a le droit d'effacer un champ, parce qu'il le
     fait exprès. Une fiche créée à la main sans téléphone est acceptée — on
     facture des sociétés qui n'appellent pas.
- **2026-09-04 · étape 4, trois API et une garde commune** — `apiGuard.ts` sort
  la garde de session et les bornes de saisie des quatre routes de l'outil.
  Recopier douze lignes de contrôle d'accès quatre fois, c'est se donner quatre
  occasions d'en oublier une — et un contrôle oublié ne se voit pas à
  l'exécution, seulement le jour où quelqu'un le trouve.
  Un détail tenu dans la suppression d'un rayon de catalogue : la clé étrangère
  est en `on delete set null`, ses prestations retombent dans « sans rayon ».
  **Effacer un classement ne doit pas effacer ce qui était classé.**
- **2026-09-04 · étape 5, la chaîne vocale** — `lib/portal/voice.ts` +
  trois routes. La chaîne est celle de `devis_app` : micro → Whisper → modèle →
  lignes → confirmation parlée (Deepgram, repli ElevenLabs, repli
  `SpeechSynthesis` du navigateur).
  **Un écart assumé** : là-bas l'analyse passe par n8n ; ici elle est faite dans
  ce dépôt. Le résultat est le même et cela évite d'avoir une part du
  comportement de la page dans un workflow qui vit ailleurs, qu'aucun `git log`
  ne montre et qu'aucun build ne vérifie.
  **Sur le modèle** : OpenAI, parce que `OPENAI_API_KEY` est la seule clé de
  modèle du `.env` de ce dépôt (Whisper l'utilise déjà). Basculer sur Claude
  demanderait une clé Anthropic et le changement de `callModel` — rien d'autre.
  Trois précautions :
  1. **le catalogue est envoyé au modèle**, sinon « deux pad thaï » ne peut pas
     devenir deux lignes à 12,50 € ; sans lui, le modèle inventerait un prix, et
     un devis aux prix inventés est pire qu'un devis vide ;
  2. **la dictée est une DONNÉE, pas une instruction** — elle voyage isolée dans
     son propre champ JSON, et le prompt le dit explicitement ;
  3. **le modèle propose, le serveur dispose** : chaque ligne renvoyée est
     re-typée et bornée avant d'exister, comme tout ce qui vient du navigateur.
- **2026-09-04 · deux dettes trouvées en chemin, réglées** :
  1. la migration 006 avait ajouté six verbes de document à la contrainte de
     `demo_actions` **sans les ajouter au type `ActionName`**. Le journal les
     affichait donc tous sous « Fiche client mise à jour ». Verbes ajoutés au
     type, aux deux dictionnaires et au jeu d'icônes ;
  2. `ACTION_LABEL` traînait dans `ledger.ts`, en français seulement, appelée
     nulle part, et doublait `portalStrings.feed.action` qui est bilingue. Deux
     listes de libellés finissent toujours par diverger : une seule reste.
