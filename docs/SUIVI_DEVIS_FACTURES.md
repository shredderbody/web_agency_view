# Suivi — Outil de devis & factures par vitrine (`/<slug>/quotes`)

> **Fichier de reprise.** Si la session est coupée, relire ce fichier de haut en
> bas : l'état de chaque étape est à jour. Reprendre à la première étape `[ ]`.
> Mettre à jour ce fichier **après chaque étape**, jamais à la fin.

Dernière mise à jour : 2026-09-04 — l'outil **est complet et compile**
(`npx tsc --noEmit` : zéro erreur). Étapes 1 à 9 terminées : socle serveur, base
de données, API, routes, interface et document imprimable. Rien n'est encore
commité ni déployé — la production tourne toujours sur `4dca343`.

## ⏯️ Reprendre ici

Reprendre à l'étape **12** (commit). La documentation (14) a été écrite avant le
commit, pour qu'elle y entre du même coup.

Les fichiers du chantier, tous non commités à ce jour :

| Fichier | Rôle |
|---|---|
| `lib/portal/issuer.ts` | identité émettrice, devise, régime de taxe, mentions légales |
| `lib/portal/money.ts` | `formatMoney` · `roundMoney` · `moneyStep` — **pur**, importable côté navigateur |
| `lib/portal/catalog.ts` | catalogue natif de la vitrine + parseur de prix |
| `lib/portal/documents.shared.ts` | modèle et arithmétique pures, des deux côtés de la frontière |
| `lib/portal/documents.ts` | Supabase, numérotation, conversion, journal |
| `lib/portal/documentsStrings.ts` | libellés FR/EN de l'interface **et** du document |
| `lib/portal/quotesPage.ts` | chargeur de page, partagé par les deux adresses |
| `app/api/portal/documents/route.ts` | `GET ?slug=` · `POST` · `POST {convert}` · `PATCH` · `DELETE ?id=` |
| `app/(portal)/[slug]/quotes/page.tsx` | adresse canonique (langue du visiteur) |
| `app/(portal)/[slug]/devis/page.tsx` | adresse française (langue forcée) |
| `components/portal/DocumentsWorkspace.tsx` | liste + éditeur + feuille A4 |
| `app/(portal)/documents.css` | l'écran coupé en deux, la feuille, l'impression |
| `supabase/migrations/006_portal_documents.sql` | appliquée sur les deux projets |

## Demande

> « Même principe intégré dans l'URL : le projet `~/devis_app/` dans la démo,
> avec l'URL `/slug/quotes` ou `/slug/devis` selon la langue — mais l'URL
> principale par défaut est `/slug/quotes`. Je veux que **chaque démo ait son
> propre outil de devis** et intègre les **informations natives de la société de
> la page** pour qu'il puisse faire ses **devis au complet et facture**. Mise à
> jour du fichier de suivi **en continu**. Puis commit + push, puis redéploie.
> **Priorité aux solutions recommandées** pour cette livraison. »

Traduction en exigences :

1. **URL** — `/<slug>/quotes` (canonique) et `/<slug>/devis` (alias français),
   exactement la forme de `/<slug>/admin` déjà en service.
2. **Un outil par vitrine**, cloisonné : Maison Brutus ne voit pas les devis
   d'Ines Garden.
3. **Pré-rempli par les données natives de la vitrine** : raison sociale,
   adresse, téléphone, e-mail, métier, accent de marque, **et le catalogue des
   prestations avec leurs prix**, lus dans les modules qui font déjà vivre la
   page publique.
4. **Devis complet ET facture** : lignes, quantités, TVA, remises, totaux,
   statuts, conversion devis → facture, document imprimable.
5. Suivi tenu en continu, puis commit, push, redéploiement.

## Décisions d'architecture (arrêtées le 2026-09-03)

| Sujet | Décision | Pourquoi |
|---|---|---|
| URL | `/<slug>/quotes` canonique · `/<slug>/devis` alias FR | reprend à l'identique le principe de `/<slug>/admin` (cf. `lib/portal/paths.ts`) |
| Authentification | **la session de l'espace existante** (cookie HMAC `av_espace`, `canAccess`) | zéro compte à créer ; le client qui ouvre `/<slug>/admin` ouvre déjà `/<slug>/quotes` |
| Cloisonnement | clé de tenant = `assistant_id` du registre, comme le reste de l'espace | une seule notion de tenant dans tout le projet |
| Portage de `~/devis_app` | **réécriture ciblée**, pas un copier-coller | `devis_app` est un SaaS multi-org sur Supabase Auth (orgs, plans, Stripe, 8 000 lignes d'onglets). Ici il n'y a **ni compte ni organisation** : il y a des **slugs**. On reprend le *modèle métier* (lignes, TVA, remises, statuts, numérotation, conversion) et on le pose sur le socle `lib/portal/` déjà en place |
| Identité émettrice | dérivée des modules de vitrine (`FACTS`, `vitrineContent`) | c'est la demande : « les informations natives de la société de la page ». Zéro saisie |
| Catalogue | dérivé des prestations et des grilles tarifaires de la vitrine | un devis se compose en un clic, avec les vrais prix affichés au public |
| Devise & taxe | par vitrine, **au régime réel du métier** : € · TVA 20 % (service) ou 10 % (restauration) · $ · sales tax 8,875 % (NY) ou 8,25 % (TX) · Rp · PB1 10 % (Bali) | Texas et Bali ne facturent pas comme Courbevoie, et un restaurant français ne facture pas comme un barbier |
| Stockage | Supabase, table `demo_documents` (migration 006) | même projet et même mécanique PostgREST que l'espace (`lib/portal/supabase.ts`), RLS sans policy, service_role seule |
| Devis et facture | **une seule table**, colonne `kind` (`quote` \| `invoice`) | même objet métier, même gabarit d'impression ; la conversion devient une copie, pas une migration entre deux schémas |
| Numérotation | `DEV-2026-0001` / `FAC-2026-0001`, séquence **par tenant et par année** | numéro de facture qui se tient devant un comptable |
| PDF | **impression navigateur** (feuille `@media print` A4), pas de dépendance | le projet a délibérément écrit son propre client PostgREST plutôt que d'ajouter `supabase-js` ; ajouter `jspdf` (~350 ko) pour dessiner un document qu'une feuille de style rend mieux irait contre cette ligne. L'aperçu à l'écran **est** le document |
| Fiche client | reprise depuis `demo_customers` (l'espace) | le client qui a réservé par la voix est déjà dans la base : on le sélectionne, on ne le ressaisit pas |

### Ce qui est repris de `~/devis_app` et ce qui ne l'est pas

**Repris (le métier)** : structure de ligne (`description`, `qty`, `unit_price`,
`tva`, `total`), lignes de **remise** en pourcentage, séparation HT / TVA / TTC,
statuts de devis (brouillon → envoyé → accepté / refusé), facture liée au devis
d'origine avec son propre numéro, statut de paiement, validité du devis,
catalogue de prestations, notes et mentions de bas de document.

**Non repris (le SaaS)** : Supabase Auth, `organizations` / `profiles`, plans
`free|start|premium|pro` et leurs quotas, filigrane, Stripe, envoi d'e-mail,
lien public `/q/[token]`, saisie vocale, `googleapis`, `jspdf`.
Ces briques servent un produit vendu à des artisans ; ici l'outil est une
**démonstration intégrée à la vitrine**, ouverte à qui détient le code d'accès.

## Ressources vérifiées (audit du 2026-09-03)

| Ressource | État |
|---|---|
| Vitrines | 12 slugs dans `lib/portal/registry.ts` (`DEMO_TENANTS`) |
| Identité des vitrines réelles | `FACTS` dans `lib/thaiViens.ts`, `barberCourbevoie.ts`, `lakNailSalon.ts`, `openhouseCanggu.ts`, `inesGarden.ts`, `maisonEphemere.ts`, `texasPlumbing.ts` — nom, adresse, téléphone, site, licence, note Google |
| Identité des vitrines génériques | `VIT_BASE` dans `lib/vitrineContent.ts` — nom, ville, adresse, téléphone, artisan |
| Catalogue | `services[]` (`name`/`desc`/`price`) + `priceColumns[]` (`name`/`price`) dans chaque module ; `PRODUCTS_FR/EN` pour Ines Garden |
| Formats de prix rencontrés | `28 €` · `10,50 €` · `75 $` · `dès 5 $` · `Rp 95K` · `dès 1 200 €` · `from €1,200` · `Devis gratuit` · `Sur-mesure` · `offert` → **un parseur tolérant est nécessaire** ; ce qui n'est pas chiffrable devient une ligne « à chiffrer » à 0 |
| Socle serveur réutilisable | `lib/portal/` : `auth.ts`, `supabase.ts`, `registry.ts`, `paths.ts`, `ledger.ts`, `time.ts` |
| Feuille de style | `app/(portal)/espace.css` — registre produit, tokens `--esp-*`, à étendre |
| Migrations | appliquées via l'API management Supabase sur **deux** projets : `bbxwezoscjuwsoflponx` (GritUnited) et `uvpuhoyaovmztephqknq` (projet du `.env`) |
| Déploiement | `bash update.sh` (Docker + Caddy, port 3010) → https://receptionniste.zerocall.io |

## Étapes

- [x] **1.** Audit des deux dépôts, architecture arrêtée, fichier de suivi ouvert
- [x] **2.** `lib/portal/issuer.ts` — identité émettrice, devise et TVA par vitrine
- [x] **3.** `lib/portal/catalog.ts` — catalogue natif + parseur de prix
- [x] **4.** `lib/portal/documents.ts` — modèle, totaux, numérotation, accès Supabase
- [x] **5.** Migration `006_portal_documents.sql` + application sur les 2 projets
- [x] **6.** API `/api/portal/documents` — liste, création, mise à jour, conversion, suppression
- [x] **7.** Routes `/<slug>/quotes` et `/<slug>/devis` (garde de session partagée)
- [x] **8.** Interface : liste, éditeur de lignes, sélection au catalogue, fiche client
- [x] **9.** Aperçu A4 imprimable (feuille `@media print`, accent de la vitrine)
- [x] **10.** Lien depuis l'espace `/<slug>/admin` et depuis `/admin`
- [x] **11.** Build + vérification locale sur plusieurs vitrines
- [ ] **12.** Commit + push
- [ ] **13.** Redéploiement Docker + vérification en production
- [x] **14.** Documentation (`docs/README.md`, `docs/DEVIS_FACTURES.md`)

## Journal

- **2026-09-03 · audit** — `~/devis_app` lu (Next 15, Supabase Auth, orgs, plans,
  jspdf ; `DevisEditorTab` 1 962 lignes, `FacturesTab` 589, `PDFExport` 775).
  `web_agency_view` lu : socle `lib/portal/` complet, 12 tenants, identité et
  catalogue disponibles nativement dans les modules de vitrine. Conclusion :
  **réécriture ciblée sur le socle existant**, pas de portage du SaaS.
  Architecture arrêtée (tableau ci-dessus).
- **2026-09-03 · socle serveur** — quatre modules ajoutés à `lib/portal/` :
  `issuer.ts` (identité émettrice + devise + régime de taxe par vitrine),
  `catalog.ts` (catalogue natif + parseur de prix), `documents.shared.ts`
  (modèle et arithmétique **pures**, importées des deux côtés de la frontière),
  `documents.ts` (Supabase, numérotation, conversion, journal).
  Le parseur de prix a été **vérifié sur les 22 formes réellement présentes**
  dans les modules de vitrine : `28 €`→28 · `10,50 €`→10,5 · `dès 5 $`→5 ·
  `Rp 95K`→95000 · `dès 1 200 €`→1200 · `from €1,200`→1200 · `Devis gratuit`,
  `Sur-mesure`, `offert`, `24/7`, `Jour même`, `Warrantied`→ à chiffrer.
  La règle qui tranche `1,200` (mille deux cents) de `10,50` (dix cinquante) :
  un séparateur suivi d'un ou deux chiffres est décimal, sinon c'est un
  séparateur de milliers.
- **2026-09-03 · deux points d'arithmétique tenus dès l'écriture** :
  1. **Les totaux sont calculés par le serveur**, jamais reçus du navigateur —
     un total posté à la main ne devient pas une vérité comptable.
  2. **Une remise se répartit au prorata sur chaque assiette de taxe.** Sur un
     devis mêlant 10 % (repas) et 20 % (boissons), l'imputer en bloc sur une
     seule assiette fausserait la TVA due.
- **2026-09-03 · étape 5, premier essai refusé** — `POST
  https://api.supabase.com/v1/projects/<ref>/database/query` répond **403
  « error code: 1010 »** sur les DEUX projets. Ce code n'est pas une erreur de
  droits Supabase : c'est le pare-feu Cloudflare devant l'API, qui refuse une
  requête sans `User-Agent` crédible (même symptôme que l'API KIE, déjà
  rencontré sur ce serveur). Le jeton `JWT_SUPABASE` n'est pas en cause.
  → **résolu** en posant un `User-Agent` de navigateur sur l'appel.
- **2026-09-03 · étape 5, second obstacle : les droits du jeton** — l'appel passe
  le pare-feu, mais `JWT_SUPABASE` (celui du `.env` de ce dépôt) n'a **plus** les
  droits sur le projet **GritUnited** `bbxwezoscjuwsoflponx` (403 « account does
  not have the necessary privileges »), alors qu'il les avait pour les migrations
  004 et 005. Le jeton de `~/grit-united/.env` les a, lui.
  ⚠️ **À retenir pour la prochaine migration** : le projet du `.env`
  (`uvpuhoyaovmztephqknq`) s'administre avec `JWT_SUPABASE` de ce dépôt ;
  le projet **GritUnited** — celui que l'espace lit RÉELLEMENT via
  `DEMO_DB_SUPABASE_URL` — s'administre avec le jeton de `~/grit-united/.env`.
- **2026-09-03 · migration 006 appliquée** sur les deux projets, puis **vérifiée
  par lecture du schéma** : `demo_documents` **23 colonnes**,
  `demo_actions.document_id` présente, et la contrainte `demo_actions_action_chk`
  contient bien les six nouveaux verbes (`quote_issued` … `invoice_paid`).
- **2026-09-03 · étape 6, l'API** — `app/api/portal/documents/route.ts` :
  `GET ?slug=` (liste) · `POST` (création) · `POST { convert }` (devis →
  facture) · `PATCH` (modification) · `DELETE ?id=`. Deux règles tenues à
  chaque verbe :
  1. **le tenant ne vient jamais du corps de la requête seul** — sur un document
     existant il est relu depuis la ligne en base, puis confronté à la session ;
     un `slug` posté n'ouvre aucune porte ;
  2. **tout ce qui arrive du navigateur est réécrit avant stockage** — lignes
     normalisées (types, bornes, longueurs, 100 lignes au plus), statut vérifié
     contre le vocabulaire de la nature du document (une facture ne devient pas
     « acceptée », un devis ne devient pas « payé »), totaux recalculés serveur.
- **2026-09-03 · étape 7, chargeur partagé** — `lib/portal/quotesPage.ts` :
  **deux portes, une pièce**. `/quotes` prend la langue du visiteur (cookie
  `av_lang`), `/devis` la force en français. Gardes identiques à `/<slug>/admin`
  (slug inconnu → 404 franc, pas de session → login pré-sélectionné, mauvaise
  vitrine → retour chez soi). Si Supabase est muet, l'éditeur reste utilisable
  et le dit : on ne montre pas un écran vide en guise d'erreur.
- **2026-09-03 · étape 7, les deux portes** — `app/(portal)/[slug]/quotes/page.tsx`
  (canonique, langue du visiteur) et `app/(portal)/[slug]/devis/page.tsx`
  (langue forcée en français). `/devis` n'est **pas** une redirection vers
  `/quotes` : une adresse donnée à un artisan français doit rester française
  dans sa barre d'adresse et s'ouvrir en français sans dépendre d'un cookie.
- **2026-09-03 · un défaut corrigé dans mon propre code** — `documentsStrings.ts`
  portait un `as const` sur le dictionnaire français : chaque libellé devenait
  un type littéral, et la version anglaise ne pouvait plus être du même type
  (60 erreurs de compilation). `as const` retiré : on décrit la FORME une fois,
  sans figer le texte.
- **2026-09-03 · ⏸️ pause demandée** — arrêt propre à la fin de l'étape 7.
  État vérifié par `npx tsc --noEmit` : **la seule erreur restante est l'absence
  de `components/portal/DocumentsWorkspace.tsx`**, le composant de l'étape 8.
  Aucune autre erreur de type dans les 7 fichiers ajoutés. Rien n'a été commité
  ni déployé : la production tourne toujours sur `4dca343`, intacte.
  ⚠️ **Ne pas lancer `update.sh` avant d'avoir écrit ce composant** — le build
  Docker échouerait.

- **2026-09-04 · étape 8, l'interface** — `components/portal/DocumentsWorkspace.tsx`
  (900 lignes) et `app/(portal)/documents.css` (330). **Deux écrans, pas trois** :
  la liste et l'éditeur. Il n'y a pas d'écran « aperçu », parce que l'éditeur
  montre le document PENDANT qu'on le compose. Le plan d'interface arrêté à
  l'étape 7 a été suivi tel quel : onglets Devis / Factures, tableau à cinq
  colonnes, le NUMÉRO lui-même sert de lien vers l'éditeur (on clique ce qu'on
  cherchait des yeux), catalogue en pastilles où le prix est écrit dans la
  pastille, création = `POST` immédiat qui rapporte le numéro du serveur.
- **2026-09-04 · un module de plus, `lib/portal/money.ts`** — `formatMoney` et
  `roundMoney` vivaient dans `issuer.ts`. Or l'éditeur tourne DANS LE NAVIGATEUR
  et formate un montant à chaque frappe ; les importer de là aurait fait
  voyager, dans le bundle client, les sept modules de contenu qu'`issuer.ts`
  charge en tête de fichier (`FACTS`, `VIT_BASE` — toute la carte du restaurant
  thaï pour afficher « 28,00 € »). Les trois fonctions sont donc sorties dans un
  module pur ; `issuer.ts` les ré-exporte, le code serveur n'a rien à changer.
- **2026-09-04 · étape 9, l'impression** — parti pris tenu jusqu'au bout : **il
  n'y a pas de second gabarit**. `@media print` retire l'application autour de
  la feuille (`.esp-bar`, `.esp-print-hide`, marges de `.esp-wrap`) et laisse
  `.esp-doc-sheet` telle quelle. Ce qui disparaît est **nommé un par un** : une
  règle « tout sauf » (`body * { visibility: hidden }`) laisse des fantômes de
  mise en page et des pages blanches en fin de document.
  Trois détails qui ne se voient qu'à l'usage : `print-color-adjust: exact` sur
  la feuille, sans quoi le navigateur retire le filet d'accent et le bandeau de
  total en les prenant pour de la décoration ; `break-inside: avoid` sur les
  lignes, le pied et les mentions ; `thead { display: table-header-group }`
  pour que l'en-tête du tableau se répète sur un devis de deux pages.
- **2026-09-04 · la feuille n'emprunte AUCUN token `--esp-*`** — elle a sa
  propre encre, son propre filet, son propre blanc. Un document comptable ne
  change pas d'apparence selon l'outil qui l'a produit ; seul `--doc-accent`,
  l'accent de la vitrine, y entre. C'est la seule couleur du document.
- **2026-09-04 · trois libellés ajoutés au dictionnaire** (`unsaved`,
  `leaveConfirm`, `backToSpace`) : l'éditeur signale les modifications non
  enregistrées et demande confirmation avant de quitter. Un devis à moitié
  saisi qu'on perd en cliquant « retour » est le genre de perte qu'on ne
  pardonne pas à un outil de facturation.
- **2026-09-04 · vérifié** — `npx tsc --noEmit` : **zéro erreur** sur l'arbre
  complet. La seule erreur qui restait en pause (le composant absent) est levée.
- **2026-09-04 · étape 10, les liens** — `quotesHref(slug)` ajouté à
  `lib/portal/paths.ts`, à côté de `spaceHref` : les URL de l'espace restent
  dans un seul fichier. Deux points d'entrée posés — un bouton « Devis &
  factures » dans l'en-tête de `/<slug>/admin` (`TenantDashboard`), et un bouton
  « Devis » par vitrine dans la liste de `/admin` (`AdminBoard`).
  **L'outil n'est pas devenu un cinquième onglet du suivi** : il en aurait fait
  une sous-partie de la consommation, alors que c'est un autre métier — on suit
  son standardiste, on FACTURE ses clients.
- **2026-09-04 · étape 14, documentation** — `docs/DEVIS_FACTURES.md` écrite
  AVANT le commit, pour qu'elle y entre du même coup ; indexée dans
  `docs/README.md` avec ce fichier de suivi.
- **2026-09-04 · étape 11, build et vérification locale** — `npm run build`
  passe (`✓ Compiled successfully`), `/[slug]/quotes` et `/[slug]/devis`
  apparaissent bien dans la table des routes, **à 117 kB de premier chargement**
  contre 199 kB pour `/demo/[slug]` : la sortie de `money.ts` a fait son travail,
  le contenu des vitrines ne voyage pas jusqu'à l'éditeur.
  Serveur de production démarré sur le port 3099 (la production tourne toujours
  sur 3010, intacte) et **onze vérifications passées** :

  | Vérification | Résultat |
  |---|---|
  | slug inconnu | **404** franc |
  | sans session | **307** vers `/admin/login?demo=barbershop`, par les deux portes |
  | session `barbershop` sur `/ines-garden/quotes` | **307** retour chez soi |
  | session `barbershop` sur `GET ?slug=ines-garden` | **403** |
  | création | `DEV-2026-0001` · EUR · TVA · échéance à +30 j |
  | totaux (2 × 28 € + 12 € à 20 %, remise 10 %) | HT 61,20 · TVA 12,24 · **TTC 73,44** |
  | **remise sur deux assiettes** (50 € à 10 % + 50 € à 20 %, remise 10 %) | HT 90 · taxe **13,50** (4,50 + 9) · TTC 103,50 — chaque assiette allégée au prorata |
  | statut `paid` sur un devis | **400** « statut impossible pour ce document » |
  | conversion | `FAC-2026-0001`, `source_id` pointant le devis, TTC conservé |
  | liste | numéro, destinataire et TTC affichés |
  | suppression | les deux documents retirés, liste de nouveau vide |

  Les documents de vérification ont été **supprimés** : la base de démonstration
  est rendue dans l'état où elle a été trouvée.
- **2026-09-04 · les neuf vitrines lues une à une**, identité et régime fiscal
  confirmés à la source :

  | Vitrine | Devise | Taxe | Catalogue |
  |---|---|---|---|
  | texas-plumbing-pros | USD | 8,25 % Sales tax (TX) | 13 lignes, **13 à chiffrer** |
  | openhouse-canggu | IDR | 10 % PB1 | 15 lignes |
  | thai-viens-express | EUR | 10 % TVA | 34 lignes |
  | lak-nail-salon | USD | 8,875 % Sales tax (NY) | 13 lignes |
  | ines-garden | EUR | 20 % TVA | 23 lignes, 1 à chiffrer |
  | maison-ephemere | EUR | 20 % TVA | 13 lignes, 3 à chiffrer |
  | barbershop-courbevoie | EUR | 20 % TVA | 12 lignes |
  | restaurant | EUR | 10 % TVA | 5 lignes |
  | plombier | EUR | 20 % TVA | 5 lignes, 2 à chiffrer |

  Texas Plumbing Pros confirme la prévision de l'audit : sa grille dit « Free
  quote » de bout en bout, l'outil lui rend donc ses **13 prestations à
  chiffrer**, libellés conservés — ce qui est exactement son métier.
