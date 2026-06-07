# DEPLOY — Atelier Vitrine

Déploiement réel du projet : image Docker `standalone` servie sur le port **3010**,
publiée soit derrière le **Caddy de l'hôte** (par défaut), soit via un **tunnel
Cloudflare**. Domaine de production : `receptionniste.zerocall.io`
(alias `webmaster.zerocall.io`).

## Vue d'ensemble

| Élément | Détail |
|---|---|
| Image | `atelier-vitrine:latest` (multi-stage, `node:22-alpine`) |
| Port interne | `3010` (`PORT`, `HOSTNAME=0.0.0.0`) |
| Conteneur app | `atelier-vitrine` (compose service `web`) |
| Conteneur tunnel | `atelier-vitrine-tunnel` (compose service `cloudflared`) |
| Domaine | `receptionniste.zerocall.io`, `webmaster.zerocall.io` |
| Reverse proxy défaut | **Caddy de l'hôte** → `127.0.0.1:3010` |
| Alternative | **tunnel Cloudflare** (quick URL ou tunnel nommé) |

## Dockerfile (`Dockerfile`)

Build multi-stage :
1. `base` : `node:22-alpine` + `libc6-compat` (pour `sharp`).
2. `deps` : `npm ci` (couche cache).
3. `builder` : `npm run build` (`NEXT_TELEMETRY_DISABLED=1`).
4. `runner` : copie `.next/standalone`, `.next/static` et `public/` ; utilisateur
   non-root `nextjs:nodejs` ; `EXPOSE 3010` ; `CMD ["node", "server.js"]`.
   Variables : `NODE_ENV=production`, `PORT=3010`, `HOSTNAME=0.0.0.0`.

`.dockerignore` exclut `node_modules`, `.next`, `.git`, le `.env`, `log_tmp`, les docs
racine et les fichiers d'infra non nécessaires à l'image.

## docker-compose (`docker-compose.yml`)

Deux services :

- **`web`** : build local, image `atelier-vitrine:latest`, `restart: unless-stopped`.
  - `ports: 127.0.0.1:3010:3010` (lié au loopback : l'accès public passe par le
    reverse proxy / le tunnel, jamais directement par l'hôte).
  - `env_file: .env` → injecte les secrets serveur **au runtime** (le bundle
    standalone ne lit pas `.env` tout seul).
  - `environment` : `NODE_ENV=production`, `PORT=3010`, `HOSTNAME=0.0.0.0`.
  - `healthcheck` : `wget --spider http://127.0.0.1:3010/` (interval 30s).
- **`cloudflared`** : `cloudflare/cloudflared:latest`, démarre après `web` (sain).
  - `TUNNEL_TOKEN` vide → **quick tunnel** (URL `*.trycloudflare.com` éphémère).
  - `TUNNEL_TOKEN` renseigné → **tunnel nommé** (domaine stable), avec
    `CLOUDFLARED_RUN_ARGS=run`.

## Scripts d'exploitation

### `setup.sh` — préparer une VM Ubuntu (à lancer en root)

```bash
sudo bash setup.sh [--user <name>] [--test-port]
```

Installe/configure de façon idempotente : outils de base, **Docker Engine + Compose v2**,
**Caddy** (reverse proxy + TLS Let's Encrypt automatique), **UFW** (22/80/443, +
port de test optionnel), **fail2ban**, et clone optionnel du dépôt. Prépare
`/var/log/caddy`. **Ne déploie pas** l'app.

Points clés :
- Le `/etc/caddy/Caddyfile` est **global/partagé** entre plusieurs sites zerocall :
  le script ne l'écrase **jamais**, il vérifie sa validité et rappelle d'y ajouter
  manuellement le bloc routant `receptionniste.zerocall.io` → `127.0.0.1:3010`.
- Le `.env` (sensible, gitignored) doit être renseigné après clone ; à défaut, il est
  copié depuis `.env.example` s'il existe.

### `deploy.sh` — premier déploiement (à lancer en root)

```bash
sudo bash deploy.sh                 # mode caddy (défaut)
sudo bash deploy.sh --cloudflare    # mode tunnel Cloudflare
DEPLOY_MODE=cloudflare sudo bash deploy.sh
```

Étapes : détecte `docker compose` v2 ou `docker-compose` legacy → nettoyage des
**images dangling uniquement** (jamais `prune -a` sur cet hôte partagé) → `build --no-cache web`
→ démarre le conteneur `web` → câble l'entrée publique selon le mode → health check 60s
→ affiche l'URL publique.

- **Mode caddy** : stoppe `cloudflared` s'il tournait, **valide** et **recharge** le
  Caddy de l'hôte (jamais de réécriture du Caddyfile global), avertit si le bloc du
  domaine est absent.
- **Mode cloudflare** : démarre le conteneur `cloudflared` ; tunnel nommé si
  `TUNNEL_TOKEN` présent, sinon quick tunnel (URL résolue depuis les logs).
- Tient à jour `NEXT_PUBLIC_APP_URL` dans `.env` (bookkeeping ; non « baked » dans
  l'image — réinjecté au runtime via `env_file`).

### `update.sh` — mises à jour (swap quasi sans coupure)

```bash
bash update.sh                  # mode caddy (défaut)
bash update.sh --cloudflare     # mode tunnel Cloudflare
```

Stratégie : **Phase 1** `git pull` + build de la nouvelle image (l'ancien conteneur
continue de servir, tag `:rollback` sauvegardé) → **Phase 2** swap du conteneur `web`
(`--no-deps --force-recreate`, l'entrée publique reste up) → health check 60s →
**rollback automatique** vers `atelier-vitrine:rollback` si le nouveau conteneur est
défaillant. Verrou anti-concurrence via `/tmp/atelier-vitrine-update.lock`.

En mode caddy, le Caddy de l'hôte est rechargé gracieusement (jamais réécrit) et tout
`cloudflared` résiduel est stoppé. En mode cloudflare, un `cloudflared` déjà en cours
n'est **pas** recréé (préserve l'URL du quick tunnel).

## Caddy (hôte) — `Caddyfile`

Le `Caddyfile` à la racine du dépôt est un **miroir** du `/etc/caddy/Caddyfile`
global, partagé entre plusieurs projets (`devis`, `quotes`, `n8n`,
`receptionist`, etc.). Bloc concernant cette app :

```caddy
receptionniste.zerocall.io {
    import base_security
    import csp_receptionniste
    import nextjs_optim
    reverse_proxy 127.0.0.1:3010 {
        import proxy_config
        header_up X-Site-Lang fr
    }
    log { output file /var/log/caddy/receptionniste.zerocall.io.log { roll_size 10MB roll_keep 3 } }
}

webmaster.zerocall.io {  # même app que receptionniste, :3010
    import base_security
    import csp_receptionniste
    import nextjs_optim
    reverse_proxy 127.0.0.1:3010 { import proxy_config  header_up X-Site-Lang fr }
    log { output file /var/log/caddy/webmaster.zerocall.io.log { roll_size 10MB roll_keep 3 } }
}
```

Le snippet `csp_receptionniste` définit une Content-Security-Policy autorisant
notamment `places.googleapis.com`, `api.kie.ai`, `connect.facebook.net` /
`www.facebook.com`, une instance Supabase et `n8n.zerocall.io`.

> Important : sur cet hôte, **ne jamais** écraser le `/etc/caddy/Caddyfile` global ni
> purger les images/volumes Docker partagés. Les scripts respectent cette contrainte.

## Variables d'environnement (par NOM et rôle)

Le `.env` du dépôt est un fichier **partagé/global** contenant des variables pour
plusieurs services. Les variables **réellement lues par CE code** (grep
`process.env` sur `app/`, `lib/`, `components/`, `scripts/`) :

| Variable | Rôle | Côté |
|---|---|---|
| `STRIPE_SECRET_KEY` | clé secrète Stripe (création de session, webhook) | serveur |
| `STRIPE_WEBHOOK_SECRET` | secret de signature du webhook Stripe | serveur |
| `STRIPE_ENABLED` | active Stripe si `= "true"` (+ clé secrète présente) | serveur |
| `GOOGLE_PLACES_API_KEY` | clé API Google Places (New) pour les proxies | serveur |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (REST `/rest/v1/...`) | serveur* |
| `SUPABASE_SERVICE_ROLE_KEY` | clé service_role pour insérer les leads | serveur |
| `NEXT_PUBLIC_APP_URL` | base des URLs de redirection Stripe (succès/annulation) | serveur |
| `NEXT_PUBLIC_APP_URL_LOCAL` | base d'URL alternative (fallback local) | serveur |
| `KIE_API_KEY` | clé KIE AI pour `scripts/gen_*.py` (génération d'images) | script |
| `SHOOT_BASE` | base URL pour `scripts/shoot.mjs` (captures Playwright) | script |

\* `NEXT_PUBLIC_SUPABASE_URL` est préfixée `NEXT_PUBLIC_` mais n'est lue, dans ce code,
que côté serveur (`/api/leads`).

Variables d'**infra** lues par compose / scripts (pas par le code applicatif) :

| Variable | Rôle |
|---|---|
| `TUNNEL_TOKEN` | jeton d'un tunnel Cloudflare nommé (domaine stable) ; vide → quick tunnel |
| `CLOUDFLARED_RUN_ARGS` | args de `cloudflared` (mis à `run` en mode tunnel nommé) |
| `TUNNEL_HOSTNAME` | (optionnel) hostname du tunnel nommé, pour l'affichage des scripts |
| `DEPLOY_MODE` | `caddy` (défaut) ou `cloudflare` pour `deploy.sh` / `update.sh` |

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
existent dans le `.env` mais **ne sont pas référencées** par le code de cette app
(le Checkout fonctionne par redirection serveur, sans Stripe.js côté client ; les
écritures Supabase passent par le service_role serveur). Le `.env` partagé contient
en outre de nombreuses autres clés (Deepgram, ElevenLabs, OpenAI, n8n, Google
Calendar, etc.) **sans rapport** avec ce projet.

> Les valeurs de tous ces secrets ne sont jamais reproduites dans cette documentation.

## Procédure type

```bash
# 1) Préparer la VM (une fois)
sudo bash setup.sh --user <user>
# 2) Renseigner les secrets
nano .env
# 3) S'assurer que le bloc du domaine est dans /etc/caddy/Caddyfile (global)
# 4) Premier déploiement
sudo bash deploy.sh                 # caddy par défaut
# 5) Mises à jour suivantes
bash update.sh
```

Surveillance : `docker compose logs -f` · local : `http://localhost:3010/` ·
public : `https://receptionniste.zerocall.io/`.
</content>
