#!/usr/bin/env bash
# =============================================================================
#  update.sh — Build & (re)deploy Atelier Vitrine (Docker)
#
#  TWO publishing methods (the app container is identical, only the public
#  entrypoint differs):
#
#    • caddy  (DEFAULT) — the HOST Caddy reverse-proxies
#                         https://receptionniste.zerocall.io → 127.0.0.1:3010.
#                         The /etc/caddy/Caddyfile is GLOBAL/shared between
#                         several zerocall projects, so this script NEVER
#                         overwrites it — it only triggers a graceful reload.
#                         The cloudflared container is stopped if running.
#
#    • cloudflare (kept for later) — publish through the cloudflared container
#                         (quick trycloudflare.com URL, or named tunnel if
#                         TUNNEL_TOKEN is set in .env). The host Caddy is left
#                         untouched.
#
#  Usage:
#    bash update.sh                    # Caddy (default)
#    bash update.sh --cloudflare       # Cloudflare tunnel
#    DEPLOY_MODE=cloudflare bash update.sh
#
#  Strategy (inspired by grit-united):
#    Phase 1 — git pull + build new image (old container keeps serving)
#    Phase 2 — swap container, then health-check on :3010
#    Rollback — if the new image is unhealthy, revert to :rollback tag
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'
ok()      { echo -e "${GREEN}✔  ${1}${RESET}"; }
info()    { echo -e "${BLUE}▸  ${1}${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  ${1}${RESET}"; }
die()     { echo -e "${RED}✘  ${1}${RESET}" >&2; exit 1; }
section() { echo -e "\n${BOLD}${BLUE}══ ${1} ══${RESET}\n"; }

IMAGE="atelier-vitrine:latest"
PORT=3010
DOMAIN="receptionniste.zerocall.io"

# ── Deploy method ────────────────────────────────────────────────────────────
# Default = caddy. Override with --cloudflare / --caddy or DEPLOY_MODE=...
DEPLOY_MODE="${DEPLOY_MODE:-caddy}"
for arg in "$@"; do
  case "$arg" in
    --cloudflare) DEPLOY_MODE="cloudflare" ;;
    --caddy)      DEPLOY_MODE="caddy" ;;
    *) die "Unknown argument: $arg (use --caddy or --cloudflare)" ;;
  esac
done
[[ "$DEPLOY_MODE" == "caddy" || "$DEPLOY_MODE" == "cloudflare" ]] \
  || die "Invalid DEPLOY_MODE='$DEPLOY_MODE' (expected 'caddy' or 'cloudflare')."

# docker compose v2 (plugin) or legacy docker-compose
if docker compose version &>/dev/null; then
  DC="docker compose"
elif command -v docker-compose &>/dev/null; then
  DC="docker-compose"
else
  die "Docker Compose not found (need 'docker compose' or 'docker-compose')."
fi
command -v docker &>/dev/null || die "Docker not installed."

# sudo helper (passwordless sudo on this host); falls back to plain command.
_sudo() { if command -v sudo &>/dev/null; then sudo "$@"; else "$@"; fi; }

_rollback() {
  if docker image inspect atelier-vitrine:rollback &>/dev/null; then
    warn "Rolling back to atelier-vitrine:rollback…"
    docker tag atelier-vitrine:rollback "$IMAGE"
    # Recreate ONLY web — the public entrypoint (Caddy or cloudflared) stays up
    # and reconnects to the rolled-back web container on the same :3010 port.
    $DC up -d --no-deps --force-recreate web
    ok "Rollback complete (public entrypoint preserved) — check: $DC logs -f"
  else
    warn "No :rollback image available — redeploy manually."
  fi
}

# Prevent concurrent runs
LOCKFILE="/tmp/atelier-vitrine-update.lock"
if ! ( set -o noclobber; echo "$$" > "$LOCKFILE" ) 2>/dev/null; then
  die "Another update.sh is already running (PID $(cat "$LOCKFILE")). Aborting."
fi
trap 'rm -f "$LOCKFILE"' EXIT
trap 'rm -f "$LOCKFILE"; _rollback' ERR

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# In cloudflare mode, a non-empty TUNNEL_TOKEN switches cloudflared to a NAMED
# tunnel (stable domain). Irrelevant in caddy mode.
NAMED_TUNNEL=0
if [[ "$DEPLOY_MODE" == "cloudflare" ]] && grep -qE "^TUNNEL_TOKEN=.+" .env 2>/dev/null; then
  export CLOUDFLARED_RUN_ARGS="run"
  NAMED_TUNNEL=1
fi

echo -e "\n${BOLD}  Atelier Vitrine — Build & Deploy${RESET}  ${BOLD}[mode: ${DEPLOY_MODE}]${RESET}\n"

# ── PHASE 1: Pull + Build (old container stays up) ───────────────────────────
section "Phase 1 — Pull + Build"

if ! git diff --quiet 2>/dev/null; then
  warn "Uncommitted local changes detected — git pull may conflict:"
  git diff --name-only 2>/dev/null | sed 's/^/     /'
fi

info "git pull…"
git pull origin main 2>/dev/null || warn "git pull failed — building from current state"

# Save rollback tag before building the new image
if docker image inspect "$IMAGE" &>/dev/null; then
  docker tag "$IMAGE" atelier-vitrine:rollback
  ok "Rollback tag saved"
fi

info "Building new image…"
$DC build
ok "New image built"

# ── PHASE 2: Swap ────────────────────────────────────────────────────────────
section "Phase 2 — Swap container"
# Recreate ONLY the web app. The public entrypoint (Caddy on the host, or the
# cloudflared container) keeps running, so the public URL is preserved and it
# reconnects to the new web container on the same :3010 port automatically.
info "Replacing web container (public entrypoint left running)…"
$DC up -d --no-deps --force-recreate web
ok "web container swapped"

if [[ "$DEPLOY_MODE" == "caddy" ]]; then
  # ── Caddy mode ──────────────────────────────────────────────────────────────
  # The host Caddy already reverse-proxies $DOMAIN → 127.0.0.1:3010. We don't
  # need cloudflared, so stop it if it's still running from a previous deploy.
  if [ -n "$(docker ps -q -f 'name=^/atelier-vitrine-tunnel$' -f 'status=running')" ]; then
    info "Stopping leftover cloudflared container (not used in caddy mode)…"
    $DC stop cloudflared 2>/dev/null || true
    ok "cloudflared stopped"
  fi
  # Graceful, zero-downtime reload so Caddy re-resolves the upstream. The global
  # /etc/caddy/Caddyfile is shared across projects — we reload it, never rewrite.
  if systemctl is-active --quiet caddy 2>/dev/null; then
    info "Reloading host Caddy (graceful)…"
    _sudo systemctl reload caddy 2>/dev/null && ok "Caddy reloaded" \
      || warn "Could not reload Caddy — it stays up; verify with: systemctl status caddy"
  else
    warn "Host Caddy is not active — start it: sudo systemctl start caddy"
  fi
else
  # ── Cloudflare mode (kept for later) ────────────────────────────────────────
  # NEVER recreate cloudflared while it's running, or a quick-tunnel URL changes.
  if [ -n "$(docker ps -q -f 'name=^/atelier-vitrine-tunnel$' -f 'status=running')" ]; then
    ok "cloudflared already running — left untouched (public URL preserved)"
  else
    info "cloudflared not running — starting it…"
    $DC up -d --no-deps cloudflared
    ok "Tunnel started"
  fi
fi

# ── Health check (60s) ────────────────────────────────────────────────────────
section "Health check (60s)"
TRIES=0
until curl -sf "http://localhost:${PORT}/" > /dev/null 2>&1 || [[ $TRIES -ge 12 ]]; do
  sleep 5; TRIES=$((TRIES + 1))
  info "  Waiting… ($((TRIES * 5))s)"
done
if curl -sf "http://localhost:${PORT}/" > /dev/null 2>&1; then
  ok "Health check passed (local :${PORT})"
  docker image prune -f > /dev/null   # dangling only, keeps :rollback
else
  die "Health check failed after 60s — triggering rollback"
fi

# ── Public URL ─────────────────────────────────────────────────────────────────
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
    ok "Named tunnel running — stable domain (the hostname routed in the dashboard)."
  fi
else
  info "Resolving public URL from cloudflared logs…"
  URL=""
  for _ in $(seq 1 20); do
    URL="$($DC logs cloudflared 2>/dev/null | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || true)"
    [ -n "$URL" ] && break
    sleep 1
  done
  if [ -n "$URL" ]; then
    ok "Public URL (unchanged — tunnel kept running): ${URL}"
    if [ -f .env ]; then
      if grep -qE '^NEXT_PUBLIC_APP_URL=' .env; then
        sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${URL}|" .env
      else
        printf '\nNEXT_PUBLIC_APP_URL=%s\n' "$URL" >> .env
      fi
      ok ".env in sync: NEXT_PUBLIC_APP_URL=${URL}"
    fi
  else
    warn "No quick-tunnel URL found. Check: $DC logs cloudflared"
  fi
fi

echo ""
ok "Deploy complete. (mode: ${DEPLOY_MODE})"
echo "  Logs:  $DC logs -f"
echo "  Local: http://localhost:${PORT}/"
[[ "$DEPLOY_MODE" == "caddy" ]] && echo "  Public: https://${DOMAIN}/"
