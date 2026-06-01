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
    $DC down --remove-orphans 2>/dev/null || true
    docker tag atelier-vitrine:rollback "$IMAGE"
    $DC up -d --no-build
    ok "Rollback complete — check: $DC logs -f"
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
info "Replacing container…"
$DC up -d
ok "Containers up"

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

# ── Public URL (quick tunnel) ─────────────────────────────────────────────────
section "Cloudflare tunnel"
info "Resolving public URL from cloudflared logs…"
URL=""
for _ in $(seq 1 20); do
  URL="$($DC logs cloudflared 2>/dev/null | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || true)"
  [ -n "$URL" ] && break
  sleep 1
done
if [ -n "$URL" ]; then
  ok "Public URL: ${URL}"
else
  warn "No quick-tunnel URL found (named tunnel in use?). Check: $DC logs cloudflared"
fi

echo ""
ok "Deploy complete."
echo "  Logs:  $DC logs -f"
echo "  Local: http://localhost:${PORT}/"
