# 💳 Stripe — Mémo des actions à faire

Mémo perso : ce qui est **déjà codé** vs ce qu'il **reste à faire à la main** dans le dashboard Stripe / sur le site.

---

## ✅ Déjà en place (dans le code)

- Package `stripe` installé.
- Clés dans `.env` : `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_ENABLED=true`.
- Section **Tarifs** de la home : boutons **Essentielle** (490 €) et **Atelier** (990 €) lancent le paiement.
- Modèle de paiement (mode `subscription`) :
  - **Fee unique** = installation, ouverture de dossier, infra système, création design (sur la 1ʳᵉ facture).
  - **Abonnement 49 €/mois**.
  - **Plafond 24 mois** : posé automatiquement par le webhook (`cancel_at`).
- Après paiement → redirection vers la **home** (`/?paiement=succes` ou `/?paiement=annule`) avec bannière.
- Multi-langue FR/EN (libellés produits, locale Checkout, bannières) via `lib/i18n.ts`.

**Fichiers** : `lib/stripe.ts`, `app/api/checkout/route.ts`, `app/api/stripe/webhook/route.ts`, `app/page.tsx`, `lib/i18n.ts`.

---

## ☐ À FAIRE À LA MAIN

### 1. Enregistrer le webhook dans Stripe (obligatoire pour le cap 24 mois)
Dashboard Stripe → **Developers → Webhooks → Add endpoint** :
- **URL** : `https://receptionniste.zerocall.io/api/stripe/webhook`
- **Event à écouter** : `customer.subscription.created`
- Récupérer le **Signing secret** (`whsec_...`) et vérifier qu'il correspond à `STRIPE_WEBHOOK_SECRET` dans `.env`.
- ➡️ Sans ça, les abonnements ne s'arrêtent **PAS** après 24 mois (ils tournent indéfiniment).

### 2. ⚠️ Mode LIVE — vrais paiements
- La clé actuelle est `sk_live` → **chaque paiement est réel et débite vraiment le client**.
- Pour tester sans débit : basculer temporairement `.env` sur des clés `sk_test` / `pk_test` (+ un webhook secret de test), puis utiliser la carte de test `4242 4242 4242 4242`.

### 3. Vérifier la facturation / TVA (selon besoin)
- Activer **Stripe Tax** si la TVA doit être collectée automatiquement.
- Vérifier les **reçus / factures par email** (Dashboard → Settings → Customer emails).

### 4. Après chaque déploiement
- Confirmer que l'URL publique du site n'a pas changé (sinon mettre à jour l'URL du webhook).
- Vérifier `NEXT_PUBLIC_APP_URL` dans `.env` (sert aux URLs de redirection succès/annulation).

---

## Où changer les prix
- Montants & durée : `lib/stripe.ts` → `PLANS`, `MONTHLY_AMOUNT_EUR`, `SUBSCRIPTION_MONTHS`.
- Prix affichés sur la home : `lib/i18n.ts` → `pricing.plans` (FR et EN).
