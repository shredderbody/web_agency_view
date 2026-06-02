#!/usr/bin/env bash
# =============================================================================
#  update.sh — Build & (re)deploy Atelier Vitrine via Docker + Cloudflare tunnel
#  Usage: bash update.sh
#  Strategy (inspired by grit-united):
#    Phase 1 — git pull + build new image (old container keeps serving)
#    Phase 2 — swap container, then health-check on :3010
#    Rollback — if the new image is unhealthy, revert to :rollback tag
#  Finally prints the public Cloudflare tunnel URL.
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

# docker compose v2 (plugin) or legacy docker-compose
if docker compose version &>/dev/null; then
  DC="docker compose"
elif command -v docker-compose &>/dev/null; then
  DC="docker-compose"
else
  die "Docker Compose not found (need 'docker compose' or 'docker-compose')."
fi
command -v docker &>/dev/null || die "Docker not installed."

_rollback() {
  if docker image inspect atelier-vitrine:rollback &>/dev/null; then
    warn "Rolling back to atelier-vitrine:rollback…"
    docker tag atelier-vitrine:rollback "$IMAGE"
    # Recreate ONLY web — never bring cloudflared down, or the quick-tunnel URL
    # would change. The tunnel stays up and reconnects to the rolled-back web.
    $DC up -d --no-deps --force-recreate web
    ok "Rollback complete (tunnel URL preserved) — check: $DC logs -f"
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

# A non-empty TUNNEL_TOKEN in .env switches cloudflared to a NAMED tunnel
# (stable domain). Exporting CLOUDFLARED_RUN_ARGS=run means TUNNEL_TOKEN is the
# only thing you ever set — and the stable domain is kept on every restart.
NAMED_TUNNEL=0
if grep -qE "^TUNNEL_TOKEN=.+" .env 2>/dev/null; then
  export CLOUDFLARED_RUN_ARGS="run"
  NAMED_TUNNEL=1
fi

echo -e "\n${BOLD}  Atelier Vitrine — Build & Deploy${RESET}\n"

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
# Recreate ONLY the web app. cloudflared keeps running untouched, so a quick
# tunnel keeps the SAME public trycloudflare.com URL across redeploys.
# (--no-deps: don't touch dependencies; cloudflared proxies to web:3010 over the
#  docker network and reconnects to the new web container automatically.)
info "Replacing web container (tunnel left running)…"
$DC up -d --no-deps --force-recreate web
ok "web container swapped"

# Make sure the tunnel is up — but NEVER recreate it while it's running, or the
# quick-tunnel URL would change. `up` would re-apply config changes (recreate);
# so we only `up` cloudflared when it is NOT already running.
if [ -n "$(docker ps -q -f 'name=^/atelier-vitrine-tunnel$' -f 'status=running')" ]; then
  ok "cloudflared already running — left untouched (public URL preserved)"
else
  info "cloudflared not running — starting it…"
  $DC up -d --no-deps cloudflared
  ok "Tunnel started"
fi

# ── Health check (60s) ────────────────────────────────────────────────────────
section "Health check (60s)"
TRIES=0
until curl -sf "http://localhost:${PORT}/" > /dev/null 2>&1 || [[ $TRIES -ge 12 ]]; do
  sleep 5; TRIES=$((TRIES + 1))
  info "  Waiting… ($((TRIES * 5))s)"
done
if curl -sf "http://localhost:${PORT}/" > /dev/null 2>&1; then
  ok "Health check passed"
  docker image prune -f > /dev/null   # dangling only, keeps :rollback
else
  die "Health check failed after 60s — triggering rollback"
fi

# ── Public URL ─────────────────────────────────────────────────────────────────
section "Cloudflare tunnel"
if [[ "$NAMED_TUNNEL" -eq 1 ]]; then
  HOST="$(grep -E '^TUNNEL_HOSTNAME=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
  if [ -n "$HOST" ]; then
    ok "Public URL (stable): https://${HOST#https://}"
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
    # Tunnel is left running so the URL is stable across this redeploy. Resync
    # .env anyway so NEXT_PUBLIC_APP_URL always matches the live tunnel.
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
ok "Deploy complete."
echo "  Logs:  $DC logs -f"
echo "  Local: http://localhost:${PORT}/"
