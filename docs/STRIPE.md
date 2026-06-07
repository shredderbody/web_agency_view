# STRIPE — Atelier Vitrine

Intégration Stripe réelle, vérifiée dans le code. Fichiers concernés :
`lib/stripe.ts`, `app/api/checkout/route.ts`, `app/api/stripe/webhook/route.ts`,
`app/page.tsx`, `lib/i18n.ts`.

## Modèle de paiement

Chaque formule payante = **un abonnement mensuel** + **des frais de mise en place
uniques** ajoutés à la première facture, en **mode `subscription`** Stripe Checkout :

- **Frais de mise en place** (unique) : installation, ouverture de dossier,
  infrastructure système, création du design.
- **Abonnement** : **49 €/mois** (`MONTHLY_AMOUNT_EUR` dans `lib/stripe.ts`).
- **Plafond 24 mois** (`SUBSCRIPTION_MONTHS`) : le webhook pose `cancel_at` à la
  création de l'abonnement, pour que Stripe arrête de prélever automatiquement après
  la durée prévue.

### Catalogue (`lib/stripe.ts` → `PLANS`)

| `PlanId` | Label | Frais de mise en place | Abonnement mensuel |
|---|---|---|---|
| `essentielle` | Essentielle | 490 € (`feeEur`) | 49 € (`monthlyEur`) |
| `atelier` | Atelier | 990 € (`feeEur`) | 49 € (`monthlyEur`) |

La formule **Signature** affichée sur la home (`lib/i18n.ts`) est « Sur devis » et ne
déclenche **pas** de checkout Stripe.

Le client Stripe est créé côté serveur uniquement :
`stripeEnabled = (STRIPE_ENABLED === "true") && Boolean(STRIPE_SECRET_KEY)`.

## Flux de paiement (vérifié)

1. **Home** (`app/page.tsx`, `startCheckout`) : clic sur un bouton de formule
   (`essentielle` ou `atelier`) → `POST /api/checkout` avec `{ plan, lang }`.
2. **`/api/checkout`** (`app/api/checkout/route.ts`) :
   - Si Stripe désactivé → `503 { error: "stripe_disabled" }`.
   - Valide `plan` via `isPlanId` (sinon `400 invalid_plan`).
   - Détermine l'origine des URLs de retour : `NEXT_PUBLIC_APP_URL` ou
     `NEXT_PUBLIC_APP_URL_LOCAL`, sinon en-têtes `x-forwarded-proto` / `host`.
   - Crée la session Checkout en `mode: "subscription"` avec :
     - `locale: lang` (FR/EN), `customer_email` si un email valide est fourni,
       `billing_address_collection: "auto"`, `allow_promotion_codes: true`.
     - **2 line items** via `price_data` créés à la volée :
       1. abonnement récurrent mensuel (`recurring.interval: "month"`,
          `unit_amount = monthlyEur * 100`),
       2. frais de mise en place (montant unique, `unit_amount = feeEur * 100`).
     - `subscription_data.metadata = { plan, cap_months: "24" }` — **c'est ce
       `cap_months` que lit le webhook**.
     - `success_url = {origin}/?paiement=succes&session_id={CHECKOUT_SESSION_ID}`,
       `cancel_url = {origin}/?paiement=annule`.
   - Renvoie `{ url }` (URL hébergée Stripe). Erreur Stripe → `502 checkout_failed`.
3. **Redirection** : la home redirige le navigateur vers `data.url`.
4. **Retour** sur `/?paiement=succes|annule` : `page.tsx` affiche une bannière
   (`t.checkout.successBanner` / `canceledBanner`) puis nettoie l'URL.
5. **Webhook** (`app/api/stripe/webhook/route.ts`, `runtime = "nodejs"`) :
   - Lit le **corps brut** (`req.text()`) pour vérifier la signature.
   - Refuse si `STRIPE_WEBHOOK_SECRET` ou l'en-tête `stripe-signature` manque
     (`400`), ou si la signature est invalide (`400 invalid_signature`).
   - Sur l'événement **`customer.subscription.created`** : lit `metadata.cap_months`,
     et si `cap > 0` et qu'aucun `cancel_at` n'est posé, appelle
     `stripe.subscriptions.update(id, { cancel_at: début + cap_months })`.
   - Toujours `200` en cas d'erreur de traitement (évite les retries en boucle).

> **Le webhook est indispensable** pour le plafond 24 mois. Sans endpoint webhook
> enregistré et signé, les abonnements **ne s'arrêtent jamais automatiquement**.

## Multi-langue

Les libellés produit (`subName`, `subDesc`, `feeName`, `feeDesc`), la `locale` du
Checkout et les bannières de retour proviennent de `lib/i18n.ts` (`ui[lang].checkout`).
`subDesc` interpole `{months}` avec `SUBSCRIPTION_MONTHS`.

## Variables d'environnement (par NOM, jamais les valeurs)

| Variable | Rôle |
|---|---|
| `STRIPE_SECRET_KEY` | clé secrète serveur (création de session, appels API, webhook) |
| `STRIPE_WEBHOOK_SECRET` | secret de signature (`whsec_…`) pour vérifier le webhook |
| `STRIPE_ENABLED` | active l'intégration si `= "true"` (et clé secrète présente) |
| `NEXT_PUBLIC_APP_URL` | base des `success_url` / `cancel_url` |
| `NEXT_PUBLIC_APP_URL_LOCAL` | base d'URL alternative (fallback) |

> `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est présente dans le `.env` mais **n'est pas
> utilisée** par le code : le paiement se fait par **redirection serveur** vers la
> page Checkout hébergée, sans Stripe.js côté client.

## À configurer manuellement dans Stripe

### 1. Enregistrer le webhook (obligatoire pour le cap 24 mois)
Dashboard Stripe → **Developers → Webhooks → Add endpoint** :
- **URL** : `https://receptionniste.zerocall.io/api/stripe/webhook`
- **Événement** : `customer.subscription.created`
- Récupérer le **Signing secret** (`whsec_…`) et le reporter dans
  `STRIPE_WEBHOOK_SECRET` (`.env`).

### 2. Mode LIVE vs TEST
- Une clé `sk_live` ⇒ **chaque paiement est réel**. Pour tester sans débit, basculer
  `.env` sur des clés `sk_test` / `pk_test` (+ un webhook secret de test) et utiliser
  la carte de test `4242 4242 4242 4242`.

### 3. Facturation / TVA (selon besoin)
- Activer **Stripe Tax** si la TVA doit être collectée automatiquement.
- Vérifier l'envoi des reçus/factures par email (Dashboard → Settings → Customer emails).

### 4. Après chaque déploiement
- Confirmer que l'URL publique n'a pas changé (sinon mettre à jour l'URL du webhook).
- Vérifier `NEXT_PUBLIC_APP_URL` dans `.env` (URLs de redirection succès/annulation).
  Les scripts `deploy.sh` / `update.sh` resynchronisent cette variable.

## Où changer les prix

- Montants & durée : `lib/stripe.ts` → `PLANS`, `MONTHLY_AMOUNT_EUR`,
  `SUBSCRIPTION_MONTHS`.
- Prix **affichés** sur la home : `lib/i18n.ts` → `pricing.plans` (FR et EN).

> Les prix affichés et les montants facturés sont **deux sources distinctes** :
> garder `lib/stripe.ts` et `lib/i18n.ts` cohérents. (La FAQ FR cite « 499 € » là où
> le code utilise 490 € — écart éditorial à harmoniser.)
</content>
