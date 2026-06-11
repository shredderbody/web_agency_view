# Recensement & migration du nom de domaine — web_agency_view (atelier-vitrine)

> But : pouvoir **changer rapidement** les domaines du projet.
> Ce document recense tous les fichiers/lignes concernés, classés par nature, avec
> la procédure de remplacement.

Dernier recensement : **2026-06-10** (re-vérifier avec la commande d'audit §7).

> Projets jumeaux sur la même VM (Caddyfile global partagé, cf. mémoires
> `caddy-global-topology`, `deux-projets-noms-proches`) : `~/receptionist` (:3005)
> et `~/devis_app` (:3000). Chacun a son `docs/DOMAIN_MIGRATION.md`.

---

## 1. ⚠️ DEUX domaines distincts

| # | Jeton actuel | Rôle | À migrer ? |
|---|--------------|------|-----------|
| **B1** | `atelier-vitrine.fr` | **Domaine PUBLIC / MARQUE / SEO** (metadataBase, emails) | ✅ via `NEXT_PUBLIC_SITE_URL` |
| **D1** | `receptionniste.zerocall.io` | **Origine de DÉPLOIEMENT** (:3010) — fonctionnel (checkout) ; alias `webmaster.zerocall.io` | ✅ via `NEXT_PUBLIC_APP_URL` + Caddy |
| D2 | `n8n.zerocall.io` | Webhooks n8n | ⚠️ si n8n migre |
| D3 | `devis/quotes/receptionist.zerocall.io` | Autres sites de la VM (Caddyfile global) | ⚠️ selon migration |
| E1 | `bonjour@atelier-vitrine.fr` | Email public | ✅ via `CONTACT_EMAIL` |
| A1 | `og-*`, favicons | Assets | ❌ optionnel |

> Le domaine **public** (ce que voient les visiteurs / Google) est
> `atelier-vitrine.fr`. Le sous-domaine `receptionniste.zerocall.io` n'est que
> l'**hébergement** (reverse-proxy Caddy + checkout). Les deux peuvent changer
> indépendamment.

---

## 2. État de la centralisation

✅ **Code applicatif centralisé** depuis 2026-06-10 :
- **`lib/site.ts`** (nouveau) : `SITE_URL`, `SITE_DOMAIN`, `siteUrl()`,
  `CONTACT_EMAIL`, `email()` — pilotés par **`NEXT_PUBLIC_SITE_URL`**
  (+ `NEXT_PUBLIC_SITE_EMAIL_DOMAIN` optionnelle). Défaut : `atelier-vitrine.fr`.
- `app/layout.tsx` → `metadataBase: new URL(SITE_URL)`
- `components/SiteFooter.tsx` → `CONTACT_EMAIL`
- Câblé au build : `.env` (`NEXT_PUBLIC_SITE_URL`), `Dockerfile` (ARG/ENV),
  `docker-compose.yml` (build args).

> Le code applicatif **ne contient aucune** référence à `zerocall.io` : toutes
> les occurrences `zerocall` sont en **infra / scripts / docs / `.env`**.

🔴 **Restent codés en dur** (hors code) : `Caddyfile`, `setup.sh`, `deploy.sh`,
`update.sh`, webhooks `N8N_*` du `.env`.

---

## 3. INFRASTRUCTURE (priorité 1) — sous-domaine de déploiement (D1)

| Fichier | Lignes | Note |
|---------|--------|------|
| `Caddyfile` | 2, 36–78, 85–251 | **Global multi-sites**. Blocs `receptionniste.zerocall.io` + `webmaster.zerocall.io` → `127.0.0.1:3010` ; CSP `connect-src … n8n.zerocall.io` ; CORS ; logs |
| `setup.sh` | 19, 40, 229, 241 | `DOMAIN="receptionniste.zerocall.io"` (alias `webmaster`) |
| `deploy.sh` | 11, 13, 38, 128 | `DOMAIN=…` + messages |
| `update.sh` | 9, 11, 42 | `DOMAIN=…` |
| `.env` | 52–57 | `N8N_URL`, `N8N_WEBHOOK_*` → `n8n.zerocall.io` (D2) |
| `.env` | 25 | `NEXT_PUBLIC_APP_URL=https://receptionniste.zerocall.io` (D1, origine fonctionnelle) |
| `scripts/vapi-setup-assistants.mjs` | 53 | fallback `NEXT_PUBLIC_APP_URL` = `receptionniste.zerocall.io` |

> ⚠️ Le fichier réellement servi est `/etc/caddy/Caddyfile` (global, partagé) ;
> `setup.sh`/`deploy.sh`/`update.sh` ne le réécrivent jamais. Migrer les deux.

### 🐛 Anomalie repérée
`.env:106` `CALENDAR_NEXT_PUBLIC_APP_URL=https://quotes.zerocall.io` pointe vers le
domaine du projet **devis_app**, pas celui-ci — vestige de copier-coller. À
corriger si la fonctionnalité calendrier est utilisée ici.

---

## 4. DOMAINE PUBLIC / MARQUE (B1, E1) — ✅ centralisé

| Fichier | Avant | Maintenant |
|---------|-------|-----------|
| `lib/site.ts` | — | **source** (`SITE_URL`, `CONTACT_EMAIL`…) |
| `app/layout.tsx` | `new URL("https://atelier-vitrine.fr")` | `new URL(SITE_URL)` |
| `components/SiteFooter.tsx` | `bonjour@atelier-vitrine.fr` (href + texte) | `CONTACT_EMAIL` |

> Pas de canonical/hreflang/og-url par page : le projet n'a qu'un `metadataBase`
> global → la migration du domaine public se résume à `NEXT_PUBLIC_SITE_URL`.

---

## 5. DOCS (référence, non fonctionnel)

`docs/DEPLOY.md` (11), `docs/VAPI_FRONTEND_WIDGET.md`, `docs/VAPI_ASSISTANTS.md`,
`docs/STRIPE.md` mentionnent les (sous-)domaines. À mettre à jour pour cohérence,
sans impact runtime.

---

## 6. Procédure de migration

### A. Migrer le domaine PUBLIC (atelier-vitrine.fr → exemple.com)
1. `.env` : `NEXT_PUBLIC_SITE_URL=https://exemple.com` (+ `lib/site.ts` défaut).
2. `npm run build` (ou rebuild Docker — le build arg est déjà câblé).
3. Vérifier metadata (`<meta property="og:…">`, canonicals implicites) + email footer.

### B. Migrer le sous-domaine de DÉPLOIEMENT (receptionniste.zerocall.io → …)
```bash
cd ~/web_agency_view
grep -rl "receptionniste\.zerocall\.io" . | grep -vE 'node_modules|\.next/|\.git/' \
  | xargs sed -i 's#receptionniste\.zerocall\.io#NOUVEAU#g'
# puis webmaster.zerocall.io (alias) et n8n.zerocall.io si concernés
```
- [ ] `Caddyfile` local **et** `/etc/caddy/Caddyfile` global (blocs, CSP, CORS, logs).
- [ ] DNS : A record du nouveau (sous-)domaine → IP VM.
- [ ] `.env` : `NEXT_PUBLIC_APP_URL` (+ corriger `CALENDAR_NEXT_PUBLIC_APP_URL`, cf. §3).
- [ ] Supabase Auth (Site URL / Redirect URLs) si checkout/auth s'y réfèrent.
- [ ] n8n : webhooks si `n8n.zerocall.io` migre.
- [ ] `sudo systemctl reload caddy` ; `./update.sh`.

---

## 7. Commande d'audit (re-recensement)

```bash
cd ~/web_agency_view
grep -rnoE "[a-zA-Z0-9_.+-]*@?[a-zA-Z0-9.-]*(zerocall\.io|atelier-vitrine\.fr)[a-zA-Z0-9./_-]*" . \
  | grep -vE 'node_modules|\.next/|\.git/|dist/'
```

> Après toute évolution, relancer et mettre à jour §3–§5 + la date.
