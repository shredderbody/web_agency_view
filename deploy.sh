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
NAMED_TUNNEL=0
if [[ -f ".env" ]]; then
  ok ".env present"
  # A non-empty TUNNEL_TOKEN switches docker-compose.yml to a NAMED tunnel
  # (stable domain). We export CLOUDFLARED_RUN_ARGS=run so the only thing you
  # ever have to set is TUNNEL_TOKEN itself.
  if grep -qE "^TUNNEL_TOKEN=.+" .env 2>/dev/null; then
    export CLOUDFLARED_RUN_ARGS="run"
    NAMED_TUNNEL=1
    ok "TUNNEL_TOKEN found — using a NAMED tunnel (stable domain, persists across restarts)."
  else
    info "No TUNNEL_TOKEN — using an ephemeral quick tunnel (random URL printed below)."
  fi
else
  warn "No .env — fine for the marketing site; tunnel will be an ephemeral quick tunnel."
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
if [[ "$NAMED_TUNNEL" -eq 1 ]]; then
  # Named tunnel: the public hostname is whatever you routed to this tunnel in
  # the Cloudflare dashboard. It is STABLE across restarts. We surface it from
  # an optional TUNNEL_HOSTNAME=... line in .env (purely informational).
  HOST="$(grep -E '^TUNNEL_HOSTNAME=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
  if [ -n "$HOST" ]; then
    ok "Public URL (stable): https://${HOST#https://}"
  else
    ok "Named tunnel running — public URL is the hostname you routed in the dashboard."
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
    # Full deploy recreates cloudflared → new URL. Record it in .env so
    # NEXT_PUBLIC_APP_URL stays in sync with the live tunnel.
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
