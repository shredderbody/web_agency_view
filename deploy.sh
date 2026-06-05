#!/usr/bin/env bash
# =============================================================================
#  deploy.sh — First deploy of Atelier Vitrine (web_agency_view)
#  Run as root: sudo bash deploy.sh [--caddy | --cloudflare]
#  For subsequent zero-downtime-ish updates, use: sudo bash update.sh
#
#  TWO publishing methods (the app container is identical, only the public
#  entrypoint differs) — mirrors update.sh:
#
#    • caddy  (DEFAULT) — the HOST Caddy reverse-proxies
#                         https://receptionniste.zerocall.io → 127.0.0.1:3010.
#                         /etc/caddy/Caddyfile is GLOBAL/shared across several
#                         zerocall projects, so this script NEVER overwrites it
#                         — it only triggers a graceful reload. The cloudflared
#                         container is stopped if running.
#
#    • cloudflare       — publish through the cloudflared container (quick
#                         trycloudflare.com URL, or a named tunnel if
#                         TUNNEL_TOKEN is set in .env). The host Caddy is left
#                         untouched.
#
#  Usage:
#    sudo bash deploy.sh                  # caddy (default)
#    sudo bash deploy.sh --cloudflare     # Cloudflare tunnel
#    DEPLOY_MODE=cloudflare sudo bash deploy.sh
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'
ok()      { echo -e "${GREEN}✔  ${1}${RESET}"; }
info()    { echo -e "${BLUE}▸  ${1}${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  ${1}${RESET}"; }
die()     { echo -e "${RED}✘  ${1}${RESET}" >&2; exit 1; }
section() { echo -e "\n${BOLD}${BLUE}══ ${1} ══${RESET}\n"; }

PORT=3010
DOMAIN="receptionniste.zerocall.io"

[[ $EUID -ne 0 ]] && die "Run with sudo."
command -v docker &>/dev/null || die "Docker not installed — run: sudo bash setup.sh"

# docker compose v2 (plugin) or legacy docker-compose
if docker compose version &>/dev/null; then
  DC="docker compose"
elif command -v docker-compose &>/dev/null; then
  DC="docker-compose"
else
  die "Docker Compose not found (need 'docker compose' or 'docker-compose')."
fi

# ── Deploy method ────────────────────────────────────────────────────────────
# Default = caddy. Override with --cloudflare / --caddy or DEPLOY_MODE=...
DEPLOY_MODE="${DEPLOY_MODE:-caddy}"
for arg in "$@"; do
  case "$arg" in
    --cloudflare) DEPLOY_MODE="cloudflare" ;;
    --caddy)      DEPLOY_MODE="caddy" ;;
    -h|--help)    grep -E '^#( |$)' "$0" | sed -E 's/^# ?//'; exit 0 ;;
    *) die "Unknown argument: $arg (use --caddy or --cloudflare)" ;;
  esac
done
[[ "$DEPLOY_MODE" == "caddy" || "$DEPLOY_MODE" == "cloudflare" ]] \
  || die "Invalid DEPLOY_MODE='$DEPLOY_MODE' (expected 'caddy' or 'cloudflare')."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "\n${BOLD}  Atelier Vitrine — First Deploy${RESET}  ${BOLD}[mode: ${DEPLOY_MODE}]${RESET}\n"
echo -e "  Port: ${BLUE}${PORT}${RESET}\n"

# ── Env (optional) ─────────────────────────────────────────────────────────────
section "Environment"
NAMED_TUNNEL=0
if [[ -f ".env" ]]; then
  ok ".env present"
  # In cloudflare mode, a non-empty TUNNEL_TOKEN switches docker-compose.yml to a
  # NAMED tunnel (stable domain). We export CLOUDFLARED_RUN_ARGS=run so the only
  # thing you ever set is TUNNEL_TOKEN itself. Irrelevant in caddy mode.
  if [[ "$DEPLOY_MODE" == "cloudflare" ]] && grep -qE "^TUNNEL_TOKEN=.+" .env 2>/dev/null; then
    export CLOUDFLARED_RUN_ARGS="run"
    NAMED_TUNNEL=1
    ok "TUNNEL_TOKEN found — using a NAMED tunnel (stable domain)."
  elif [[ "$DEPLOY_MODE" == "cloudflare" ]]; then
    info "No TUNNEL_TOKEN — using an ephemeral quick tunnel (random URL below)."
  fi
else
  warn "No .env — fine for the marketing site; server features need their secrets."
fi

# ── Docker cleanup (dangling only) ─────────────────────────────────────────────
# Shared host: NEVER `docker system prune -a --volumes`, it would drop images and
# volumes of co-located projects. Dangling images only.
section "Docker cleanup (dangling images only)"
info "docker image prune -f…"
docker image prune -f | tail -1
ok "Cleanup done"

# ── Build ───────────────────────────────────────────────────────────────────────
section "Building Docker image"
$DC build --no-cache web
ok "Image built"

# ── Launch app ──────────────────────────────────────────────────────────────────
section "Starting web container"
# Start only the app. The public entrypoint is wired below per deploy mode.
$DC up -d --no-deps --force-recreate web
ok "web container started"

# ── Public entrypoint ─────────────────────────────────────────────────────────
section "Public entrypoint [${DEPLOY_MODE}]"
if [[ "$DEPLOY_MODE" == "caddy" ]]; then
  # Host Caddy reverse-proxies $DOMAIN → 127.0.0.1:3010. cloudflared is not used.
  if [ -n "$(docker ps -q -f 'name=^/atelier-vitrine-tunnel$' -f 'status=running')" ]; then
    info "Stopping leftover cloudflared container (not used in caddy mode)…"
    $DC stop cloudflared 2>/dev/null || true
    ok "cloudflared stopped"
  fi
  command -v caddy &>/dev/null || die "Caddy not installed — run: sudo bash setup.sh"
  # The global /etc/caddy/Caddyfile is shared across projects — we validate and
  # reload it, never rewrite. The '$DOMAIN' block must already be present there.
  if [[ -f /etc/caddy/Caddyfile ]]; then
    caddy validate --config /etc/caddy/Caddyfile &>/dev/null \
      && ok "Global Caddyfile valid" \
      || die "Global /etc/caddy/Caddyfile invalid — fix it before reloading Caddy"
    if ! grep -q "$DOMAIN" /etc/caddy/Caddyfile; then
      warn "No '$DOMAIN' block found in /etc/caddy/Caddyfile — add it manually:"
      warn "   ${DOMAIN}, webmaster.zerocall.io { reverse_proxy 127.0.0.1:${PORT} }"
    fi
  else
    die "No /etc/caddy/Caddyfile — create the global config first (see setup.sh)"
  fi
  if systemctl is-active --quiet caddy 2>/dev/null; then
    info "Reloading host Caddy (graceful)…"
    systemctl reload caddy 2>/dev/null && ok "Caddy reloaded" \
      || warn "Could not reload Caddy — check: systemctl status caddy"
  else
    info "Starting host Caddy…"
    systemctl start caddy && ok "Caddy started" \
      || warn "Could not start Caddy — check: systemctl status caddy"
  fi
else
  # Cloudflare mode: bring up the tunnel container.
  info "Starting cloudflared tunnel…"
  $DC up -d --no-deps cloudflared
  ok "Tunnel started"
fi

# ── Health check (60s) ──────────────────────────────────────────────────────────
section "Health check (60s)"
TRIES=0
until curl -sf "http://localhost:${PORT}/" > /dev/null 2>&1 || [[ $TRIES -ge 12 ]]; do
  sleep 5; TRIES=$((TRIES + 1))
  info "  Waiting… ($((TRIES * 5))s)"
done
$DC ps
if curl -sf "http://localhost:${PORT}/" > /dev/null 2>&1; then
  ok "App responding on http://localhost:${PORT}/"
else
  warn "App not responding yet on :${PORT} — check: $DC logs web"
fi

# ── Public URL ──────────────────────────────────────────────────────────────────
section "Public URL"
if [[ "$DEPLOY_MODE" == "caddy" ]]; then
  URL="https://${DOMAIN}"
  info "Checking public endpoint ${URL} …"
  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$URL/" 2>/dev/null || echo 000)"
  if [[ "$CODE" =~ ^(200|301|302|308)$ ]]; then
    ok "Public URL live (HTTP ${CODE}): ${URL}"
  else
    warn "Public endpoint returned HTTP ${CODE}. Local app is healthy — check Caddy:"
    warn "  sudo systemctl status caddy   |   sudo tail -n 50 /var/log/caddy/${DOMAIN}.log"
    warn "  (TLS may still be issuing on a fresh DNS record — retry in a minute.)"
  fi
  # Keep .env's NEXT_PUBLIC_APP_URL in sync (bookkeeping; not baked into image).
  if [ -f .env ]; then
    if grep -qE '^NEXT_PUBLIC_APP_URL=' .env; then
      sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${URL}|" .env
    else
      printf '\nNEXT_PUBLIC_APP_URL=%s\n' "$URL" >> .env
    fi
    ok ".env in sync: NEXT_PUBLIC_APP_URL=${URL}"
  fi
elif [[ "$NAMED_TUNNEL" -eq 1 ]]; then
  HOST="$(grep -E '^TUNNEL_HOSTNAME=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
  if [ -n "$HOST" ]; then
    ok "Public URL (stable named tunnel): https://${HOST#https://}"
  else
    ok "Named tunnel running — public URL is the hostname routed in the dashboard."
    info "Tip: add TUNNEL_HOSTNAME=atelier.mondomaine.com to .env to print it here."
  fi
  info "Tunnel status: $DC logs cloudflared | grep -i 'Registered\\|connection'"
else
  info "Resolving public URL from cloudflared logs…"
  URL=""
  for _ in $(seq 1 20); do
    URL="$($DC logs cloudflared 2>/dev/null | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || true)"
    [ -n "$URL" ] && break
    sleep 1
  done
  if [ -n "$URL" ]; then
    ok "Public URL (fresh quick tunnel): ${URL}"
    if [ -f .env ]; then
      if grep -qE '^NEXT_PUBLIC_APP_URL=' .env; then
        sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${URL}|" .env
      else
        printf '\nNEXT_PUBLIC_APP_URL=%s\n' "$URL" >> .env
      fi
      ok ".env synced: NEXT_PUBLIC_APP_URL=${URL}"
    fi
  else
    warn "No quick-tunnel URL found. Check: $DC logs cloudflared"
  fi
fi

echo ""
ok "Deploy complete."
echo ""
echo "  Monitor: $DC logs -f"
echo "  Update:  sudo bash update.sh"
echo "  Local:   http://localhost:${PORT}/"
