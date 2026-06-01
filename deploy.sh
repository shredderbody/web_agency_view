#!/usr/bin/env bash
# =============================================================================
#  deploy.sh — First deploy of Atelier Vitrine (Docker + Cloudflare tunnel)
#  Run as root: sudo bash deploy.sh
#  For subsequent zero-downtime-ish updates, use: sudo bash update.sh
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

[[ $EUID -ne 0 ]] && die "Run with sudo."
command -v docker &>/dev/null || die "Docker not installed."

# docker compose v2 (plugin) or legacy docker-compose
if docker compose version &>/dev/null; then
  DC="docker compose"
elif command -v docker-compose &>/dev/null; then
  DC="docker-compose"
else
  die "Docker Compose not found (need 'docker compose' or 'docker-compose')."
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "\n${BOLD}  Atelier Vitrine — First Deploy${RESET}\n"
echo -e "  Public: ${BLUE}Cloudflare tunnel (quick tunnel by default)${RESET}"
echo -e "  Port:   ${BLUE}${PORT}${RESET}\n"

# ── Env (optional) ─────────────────────────────────────────────────────────────
section "Environment"
if [[ -f ".env" ]]; then
  ok ".env present"
  # If a named tunnel token is set, it will be picked up by docker-compose.yml.
  if grep -q "^TUNNEL_TOKEN=" .env 2>/dev/null; then
    ok "TUNNEL_TOKEN found — make sure the named-tunnel command is enabled in docker-compose.yml"
  else
    info "No TUNNEL_TOKEN — using an ephemeral quick tunnel (URL printed below)."
  fi
else
  warn "No .env — fine for the marketing site (no runtime secrets required)."
fi

# ── Cleanup Docker ───────────────────────────────────────────────────────────
# NOTE: grit-united's deploy.sh runs `docker system prune -a --volumes`. On this
# shared host that would also drop images/volumes of co-located projects, so we
# only prune dangling images here.
section "Docker cleanup (dangling images only)"
info "docker image prune -f…"
docker image prune -f | tail -1
ok "Cleanup terminé"

# ── Build ─────────────────────────────────────────────────────────────────────
section "Building Docker image"
$DC build --no-cache
ok "Image built"

# ── Launch ────────────────────────────────────────────────────────────────────
section "Starting containers"
$DC up -d --force-recreate
ok "Containers started"

# ── Health check ──────────────────────────────────────────────────────────────
section "Health check (60s)"
TRIES=0
until $DC ps | grep -q "healthy" || [[ $TRIES -ge 12 ]]; do
  sleep 5; TRIES=$((TRIES + 1))
  info "  Waiting… ($((TRIES * 5))s)"
done
$DC ps
if curl -sf "http://localhost:${PORT}/" > /dev/null 2>&1; then
  ok "App responding on http://localhost:${PORT}/"
else
  warn "App not responding yet on :${PORT} — check: $DC logs web"
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
echo ""
echo "  Monitor: $DC logs -f"
echo "  Update:  sudo bash update.sh"
echo "  Local:   http://localhost:${PORT}/"
