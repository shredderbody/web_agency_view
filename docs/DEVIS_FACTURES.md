# Devis & factures — `/<slug>/admin/quotes`

Chaque vitrine de démonstration dispose de **son propre outil de devis et de
factures**, pré-rempli avec les informations natives du commerce affiché sur la
page publique : enseigne, adresse, téléphone, métier, accent de marque, **et le
catalogue des prestations avec leurs prix**.

Rien n'est saisi deux fois. Le prix « La coupe Brutus · 28 € » est écrit une
seule fois, dans `lib/vitrineContent.ts` ; c'est cette ligne-là qui se pose dans
le devis. Le jour où il change sur la vitrine, il change dans l'outil.

## Les deux adresses

| URL | Langue |
|---|---|
| `/<slug>/admin/quotes` | **canonique** — suit la préférence du visiteur (cookie `av_lang`) |
| `/<slug>/admin/devis` | forcée en **français** |

`/devis` n'est **pas** une redirection vers `/quotes` : une adresse donnée à un
artisan français doit rester française dans sa barre d'adresse, et s'ouvrir en
français sans dépendre d'un cookie. Deux portes, une pièce — les deux pages
appellent le même chargeur, `lib/portal/quotesPage.ts`.

L'outil est niché **sous l'accueil** `/<slug>/admin`, avec le suivi. Le client
retient donc une seule adresse — « votre site, puis `/admin` » — et choisit son
outil en arrivant. Les deux adresses de départ, `/<slug>/quotes` et
`/<slug>/devis`, ont vécu quelques heures en production : elles **redirigent en
308**, elles ne cassent pas.

## Accès et cloisonnement

Aucun compte à créer : **la session de l'espace client** ouvre l'outil (cookie
HMAC `av_espace`, `canAccess`, cf. [ESPACE_CLIENT.md](./ESPACE_CLIENT.md)). Qui
peut ouvrir `/<slug>/admin` peut ouvrir `/<slug>/admin/quotes`.

La garde est posée dans **`app/(portal)/[slug]/admin/layout.tsx`**, partagée par
tout ce qui vit sous ce segment : une page ajoutée demain y est protégée avant
même d'avoir été écrite. Les pages gardent par-dessus leur propre vérification —
leurs chargeurs ont de toute façon besoin de la session pour savoir quelle
vitrine lire, et un contrôle d'accès qui ne tient qu'à un seul endroit tient
mal.

La clé de tenant est l'**`assistant_id`** du registre (`lib/portal/registry.ts`),
comme partout ailleurs dans l'espace : Maison Brutus ne voit pas les devis
d'Ines Garden. Les gardes de page sont identiques à celles de l'espace : slug
inconnu ⇒ 404 franc, pas de session ⇒ connexion avec la vitrine
pré-sélectionnée, mauvaise vitrine ⇒ retour chez soi.

## L'émetteur — `lib/portal/issuer.ts`

L'identité imprimée en tête de document est **lue là où la vitrine publique
puise déjà** : les modules `FACTS` des sept démos bâties sur un commerce réel,
et `VIT_BASE` pour les cinq vitrines génériques.

À cela le module ajoute les trois choses qu'une page vitrine n'a pas besoin de
dire, mais qu'un document comptable exige :

| Vitrine | Devise | Taxe par défaut |
|---|---|---|
| barbershop · onglerie · plombier · barbershop-courbevoie · ines-garden · maison-ephemere | € | TVA **20 %** (prestation de service) |
| traiteur · restaurant · thai-viens-express | € | TVA **10 %** (restauration) |
| lak-nail-salon | $ | Sales tax **8,875 %** (NY) |
| texas-plumbing-pros | $ | Sales tax **8,25 %** (TX) |
| openhouse-canggu | Rp | PB1 **10 %** (Bali) |

Plus les **mentions légales** de pied de document : délai de paiement,
pénalités de retard et indemnité forfaitaire de 40 € pour les vitrines
françaises (art. L441-10 et D441-5 du code de commerce), usages locaux ailleurs
— on ne colle pas un texte français traduit sur une facture texane.

**Aucun numéro n'est inventé.** Une vitrine fictive n'a pas de SIRET, et le
document ne prétend pas le contraire : le champ reste vide plutôt que faux. Seul
Texas Plumbing Pros porte une immatriculation, parce qu'elle est réelle
(licence TSBPE).

Le formatage des montants vit à part, dans `lib/portal/money.ts` : il est
importé **par le navigateur**, et ne doit pas emporter avec lui les sept modules
de contenu qu'`issuer.ts` charge en tête de fichier. La roupie s'affiche sans
décimales — « Rp 95 000,00 » est un contresens local.

## Le catalogue — `lib/portal/catalog.ts`

Les prestations de la vitrine deviennent des **pastilles cliquables** : un clic
pose la ligne, prix compris.

Les prix d'une vitrine sont écrits **pour être lus, pas pour être calculés**.
Le parseur a été vérifié sur les 22 formes réellement présentes dans les
modules :

```
28 €        → 28          dès 5 $      → 5           Rp 95K      → 95000
10,50 €     → 10,5        dès 1 200 €  → 1200        from €1,200 → 1200
Devis gratuit · Sur-mesure · offert · 24/7 · Jour même · Warrantied → à chiffrer (0)
```

La règle qui tranche `1,200` (mille deux cents) de `10,50` (dix euros
cinquante) : un séparateur suivi d'un **ou deux** chiffres est décimal, sinon
c'est un séparateur de milliers.

Ce qui n'est pas chiffrable devient une ligne **à chiffrer à 0**, libellé
d'origine conservé. Un plombier texan dont toute la grille dit « Free quote »
obtient donc son catalogue de prestations à remplir ligne par ligne — ce qui est
exactement son métier.

## Le modèle — `lib/portal/documents.shared.ts`

Devis et facture partagent **une seule table** et une colonne `kind`
(`quote` | `invoice`) : même objet métier, même gabarit d'impression, et la
conversion devient une copie plutôt qu'une migration entre deux schémas.

- **Lignes** : `item` (libellé, description, quantité, prix unitaire HT, taux de
  taxe) ou `discount` (pourcentage du sous-total HT).
- **Statuts**, distincts par nature : un devis va `brouillon → envoyé → accepté
  / refusé` ; une facture `brouillon → envoyée → payée / annulée`. Une facture
  ne devient jamais « acceptée », un devis jamais « payé » — l'API refuse.
- **Numérotation** `DEV-2026-0001` / `FAC-2026-0001`, séquence **par tenant et
  par année**, attribuée par le serveur. L'index unique `(assistant_id, number)`
  est le garde-fou si deux créations se croisent.

Deux points d'arithmétique méritent d'être connus :

1. **Les totaux sont calculés par le serveur**, jamais reçus du navigateur. Un
   total posté à la main ne devient pas une vérité comptable. L'éditeur
   recalcule les mêmes en direct avec **le code exact du serveur** et l'arrondi
   exact de la devise — l'écran ne peut donc pas annoncer un total que la base
   contredira.
2. **Une remise se répartit au prorata sur chaque assiette de taxe.** Sur un
   devis mêlant 10 % (repas) et 20 % (boissons), l'imputer en bloc sur une seule
   assiette fausserait la TVA due.

## L'API — `/api/portal/documents`

| Verbe | Effet |
|---|---|
| `GET ?slug=` | la liste du tenant |
| `POST { slug, kind, lang }` | crée un document et lui attribue son numéro |
| `POST { convert: <id> }` | copie un devis en facture (lien `source_id` conservé) |
| `PATCH { id, … }` | modifie destinataire, lignes, notes, dates, statut |
| `DELETE ?id=` | supprime |

Deux règles tenues à chaque verbe :

- **Le tenant ne vient jamais du corps de la requête seul.** Sur un document
  existant il est relu depuis la ligne en base, puis confronté à la session ; un
  `slug` posté n'ouvre aucune porte.
- **Tout ce qui arrive du navigateur est réécrit avant stockage** : lignes
  normalisées (types, bornes, longueurs, 100 lignes au plus), statut vérifié
  contre le vocabulaire de la nature du document, totaux recalculés.

Toute écriture laisse une trace dans `demo_actions`, le journal immuable de
l'espace : un devis émis est un fait de la vie du commerce, au même titre qu'un
rendez-vous pris, et se lit dans le même fil.

## L'interface — `components/portal/DocumentsWorkspace.tsx`

**Deux écrans, pas trois.**

1. **La liste** — onglets Devis / Factures, tableau (numéro · date · client ·
   total TTC · statut). Le **numéro lui-même est le lien** vers l'éditeur : on
   clique ce qu'on cherchait des yeux.
2. **L'éditeur** — la saisie à gauche, **le document à droite**. Il n'y a pas
   d'écran « aperçu » : ce qu'on modifie se voit pendant qu'on le modifie.

Un document **naît sur le serveur** : « Nouveau devis » écrit tout de suite en
base et reçoit son numéro. Pas de brouillon local sans numéro — un devis qu'on
croit avoir et qui n'existe nulle part est pire que pas de devis.

Le destinataire se **reprend depuis `demo_customers`** : la personne qui a
réservé par la voix est déjà dans la base, on la sélectionne au lieu de la
ressaisir.

## L'impression

**Il n'y a pas de second gabarit.** `@media print` retire l'application autour
de la feuille et laisse `.esp-doc-sheet` telle quelle : ce que le client voit à
l'écran **est** ce qui sort de l'imprimante. Deux gabarits finiraient par
diverger, et c'est toujours le document envoyé au client qui porterait l'erreur.

Pas de dépendance PDF : `jspdf` pèse ~350 ko pour dessiner un document qu'une
feuille de style rend mieux. Le bouton « Imprimer / PDF » appelle
`window.print()` ; le navigateur écrit le PDF.

Quatre détails qui ne se voient qu'à l'usage, tous dans
`app/(portal)/documents.css` :

- ce qui disparaît à l'impression est **nommé un par un** (`.esp-bar`,
  `.esp-print-hide`, marges de `.esp-wrap`) — une règle « tout sauf »
  (`body * { visibility: hidden }`) laisse des fantômes de mise en page et des
  pages blanches en fin de document ;
- `print-color-adjust: exact` sur la feuille, sans quoi le navigateur retire le
  filet d'accent et le bandeau de total en les prenant pour de la décoration ;
- `break-inside: avoid` sur les lignes, le pied et les mentions légales ;
- `thead { display: table-header-group }`, pour que l'en-tête du tableau se
  répète sur un devis de deux pages.

La feuille n'emprunte **aucun token `--esp-*`** : elle a sa propre encre et son
propre blanc. Un document comptable ne change pas d'apparence selon l'outil qui
l'a produit. Seul `--doc-accent`, l'accent de la vitrine, y entre — c'est la
seule couleur du document.

## Stockage

Table `demo_documents` (migration `supabase/migrations/006_portal_documents.sql`),
même projet et même mécanique PostgREST que l'espace : RLS active sans policy,
`service_role` seule y accède, jamais depuis le navigateur.

⚠️ **Deux projets Supabase, deux jetons d'administration.** Le projet du `.env`
de ce dépôt (`uvpuhoyaovmztephqknq`) s'administre avec `JWT_SUPABASE` d'ici ;
le projet **GritUnited** (`bbxwezoscjuwsoflponx`) — celui que l'espace lit
réellement via `DEMO_DB_SUPABASE_URL` — s'administre avec le jeton de
`~/grit-united/.env`. La migration 006 est appliquée sur les deux.

## Fichiers

| Fichier | Rôle |
|---|---|
| `lib/portal/issuer.ts` | identité émettrice, devise, régime de taxe, mentions légales |
| `lib/portal/money.ts` | `formatMoney` · `roundMoney` · `moneyStep` — pur, côté navigateur compris |
| `lib/portal/catalog.ts` | catalogue natif de la vitrine + parseur de prix |
| `lib/portal/documents.shared.ts` | modèle et arithmétique pures, des deux côtés de la frontière |
| `lib/portal/documents.ts` | Supabase, numérotation, conversion, journal |
| `lib/portal/documentsStrings.ts` | libellés FR/EN de l'interface **et** du document |
| `lib/portal/quotesPage.ts` | chargeur de page, partagé par les deux adresses |
| `app/api/portal/documents/route.ts` | l'API décrite ci-dessus |
| `app/(portal)/[slug]/admin/quotes/page.tsx` · `admin/devis/page.tsx` | les deux portes |
| `components/portal/DocumentsWorkspace.tsx` | liste, éditeur, feuille A4 |
| `app/(portal)/documents.css` | l'écran coupé en deux, la feuille, l'impression |
| `supabase/migrations/006_portal_documents.sql` | la table et le journal élargi |

## Ce que l'outil ne fait pas

Il est **une démonstration intégrée à la vitrine**, pas un SaaS de facturation.
N'ont donc **pas** été repris de `~/devis_app` : les comptes et organisations
Supabase Auth, les plans et leurs quotas, le filigrane, Stripe, l'envoi
d'e-mail, le lien public `/q/[token]`, la saisie vocale, `googleapis`, `jspdf`.
