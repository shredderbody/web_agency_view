#!/usr/bin/env bash
# =============================================================================
#  setup.sh — Prepare a fresh Ubuntu VM for « Atelier Vitrine » (web_agency_view)
#  Usage: sudo bash setup.sh [--user <name>] [--test-port]
#
#  Installs and configures, idempotently:
#    - base system tools (git, curl, zip, htop, dnsutils, …)
#    - Docker Engine + Docker Compose v2 plugin
#    - Caddy (reverse proxy + automatic Let's Encrypt TLS) — DEFAULT publish path
#    - UFW firewall (22 / 80 / 443, + optional test port)
#    - fail2ban (SSH brute-force protection)
#    - optional repo clone
#
#  ⚠️  This script does NOT deploy the app — it only prepares the machine.
#      When done:  sudo bash deploy.sh   (then update.sh for later updates)
#
#  Publishing model (see update.sh):
#    • caddy  (DEFAULT) — the HOST Caddy reverse-proxies the domain → :3010.
#      The /etc/caddy/Caddyfile is GLOBAL/shared across several zerocall sites,
#      so this script NEVER overwrites it — you add the block manually.
#    • cloudflare (optional) — published through the cloudflared container
#      (docker-compose); no inbound 80/443 needed in that mode.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'

ok()      { echo -e "${GREEN}✔  ${1}${RESET}"; }
info()    { echo -e "${BLUE}▸  ${1}${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  ${1}${RESET}"; }
die()     { echo -e "${RED}✘  ${1}${RESET}" >&2; exit 1; }
section() { echo -e "\n${BOLD}${BLUE}══ ${1} ══${RESET}\n"; }

# ── Project constants ─────────────────────────────────────────────────────────
PORT=3010                                              # host → container :3010
DOMAIN="receptionniste.zerocall.io"                    # also: webmaster.zerocall.io
CONTAINER="atelier-vitrine"
DEFAULT_REPO="git@github.com:shredderbody/web_agency_view.git"

# ── Privileges ────────────────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && die "Run this script with sudo or as root."

# ── Arguments ─────────────────────────────────────────────────────────────────
DEPLOY_USER=""
OPEN_TEST_PORT=0
while [[ $# -gt 0 ]]; do
  case $1 in
    --user)      DEPLOY_USER="${2:-}"; shift 2 ;;
    --test-port) OPEN_TEST_PORT=1; shift ;;
    -h|--help)
      grep -E '^#( |$)' "$0" | sed -E 's/^# ?//'
      exit 0 ;;
    *) die "Unknown argument: $1 (use --user <name> | --test-port | --help)" ;;
  esac
done

# Determine the non-root user to add to the docker group
if [[ -z "$DEPLOY_USER" ]]; then
  DEPLOY_USER="${SUDO_USER:-}"
  if [[ -z "$DEPLOY_USER" || "$DEPLOY_USER" == "root" ]]; then
    read -rp "Non-root user for Docker (empty = skip): " DEPLOY_USER
  fi
fi

echo -e "\n${BOLD}  VM setup — Atelier Vitrine (${DOMAIN})${RESET}\n"

# =============================================================================
section "1 · System update"
# =============================================================================

export DEBIAN_FRONTEND=noninteractive
info "apt update + upgrade…"
apt-get update -qq
apt-get upgrade -y -qq
ok "System up to date"

# =============================================================================
section "2 · Base tools"
# =============================================================================

PACKAGES=(
  curl wget vim nano git unzip zip
  net-tools dnsutils iputils-ping
  htop jq
  ufw fail2ban
  ca-certificates gnupg lsb-release software-properties-common apt-transport-https
)
info "Installing base packages…"
apt-get install -y -qq "${PACKAGES[@]}"
ok "Tools installed"

# =============================================================================
section "3 · Docker Engine + Compose v2"
# =============================================================================

if command -v docker &>/dev/null; then
  ok "Docker already present (v$(docker --version | awk '{print $3}' | tr -d ',')) — skip"
else
  info "Adding the official Docker repository…"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq \
    docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  ok "Docker installed and started"
fi

docker compose version &>/dev/null \
  && ok "Docker Compose v2 available" \
  || die "docker compose v2 plugin not found"

if [[ -n "$DEPLOY_USER" ]] && id "$DEPLOY_USER" &>/dev/null; then
  usermod -aG docker "$DEPLOY_USER"
  ok "User '$DEPLOY_USER' added to the docker group (re-login required)"
elif [[ -n "$DEPLOY_USER" ]]; then
  warn "User '$DEPLOY_USER' does not exist — not added to the docker group"
fi

# =============================================================================
section "4 · Caddy (reverse proxy + TLS)"
# =============================================================================

if command -v caddy &>/dev/null; then
  ok "Caddy already installed ($(caddy version 2>/dev/null | awk '{print $1}')) — skip"
else
  info "Adding the official Caddy repository…"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -qq
  apt-get install -y -qq caddy
  systemctl enable caddy
  ok "Caddy installed"
fi

mkdir -p /var/log/caddy
chown -R caddy:caddy /var/log/caddy 2>/dev/null || chown -R root:root /var/log/caddy
chmod 755 /var/log/caddy
ok "/var/log/caddy ready"

# =============================================================================
section "5 · UFW firewall"
# =============================================================================

info "Configuring UFW…"
ufw --force reset >/dev/null
ufw default deny incoming  >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp   comment "SSH"                 >/dev/null
ufw allow 80/tcp   comment "HTTP (Caddy + ACME)" >/dev/null
ufw allow 443/tcp  comment "HTTPS (Caddy)"       >/dev/null

if [[ "$OPEN_TEST_PORT" == "1" ]]; then
  ufw allow ${PORT}/tcp comment "Direct IP test (CLOSE IN PROD)" >/dev/null
  warn "Port $PORT opened for direct testing — close it afterwards:"
  warn "   sudo ufw delete allow ${PORT}/tcp"
fi

ufw --force enable >/dev/null
ok "UFW active (22 / 80 / 443)"
info "Note: in 'cloudflare' deploy mode the tunnel is outbound — 80/443 inbound unused."

# =============================================================================
section "6 · fail2ban (SSH protection)"
# =============================================================================

systemctl enable --now fail2ban
ok "fail2ban started"

# =============================================================================
section "7 · Application code"
# =============================================================================

APP_DIR="$SCRIPT_DIR"

if [[ -d "$APP_DIR/.git" ]]; then
  ok "Repo already present in $APP_DIR — skip"
else
  read -rp "Git repo URL [$DEFAULT_REPO] (empty = skip clone): " REPO_URL
  REPO_URL="${REPO_URL:-}"
  if [[ -n "$REPO_URL" ]]; then
    info "Cloning into $APP_DIR…"
    git clone "$REPO_URL" "$APP_DIR"
    [[ -n "$DEPLOY_USER" ]] && id "$DEPLOY_USER" &>/dev/null \
      && chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR"
    ok "Repo cloned"
  else
    warn "Clone skipped — copy your code into $APP_DIR before deploying"
  fi
fi

# =============================================================================
section "8 · Environment variables"
# =============================================================================

# The .env is SENSITIVE and gitignored: never present right after a clone.
# Next.js standalone reads its server secrets at RUNTIME via env_file (see
# docker-compose.yml) — Supabase service_role, Google Places key, Stripe, etc.
if [[ -f "$APP_DIR/.env" ]]; then
  ok ".env present"
elif [[ -f "$APP_DIR/.env.example" ]]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  warn ".env created from .env.example — FILL IT IN: nano $APP_DIR/.env"
else
  warn "No .env found. The marketing site can boot without it, but server"
  warn "features (Supabase, Stripe, Google Places) need their secrets in:"
  warn "   $APP_DIR/.env"
  info "Optional: TUNNEL_TOKEN=… enables a stable named Cloudflare tunnel."
fi

# =============================================================================
section "9 · Caddyfile (multi-site — MANUAL integration)"
# =============================================================================

# ⚠️ /etc/caddy/Caddyfile is a GLOBAL file shared across SEVERAL sites on this
#    VM. This repo ships NO Caddyfile — the relevant block (receptionniste +
#    webmaster .zerocall.io → 127.0.0.1:3010) is added to the global file BY
#    HAND. This script never overwrites it.
if [[ -f /etc/caddy/Caddyfile ]]; then
  info "A global /etc/caddy/Caddyfile already exists — left intact."
  if caddy validate --config /etc/caddy/Caddyfile &>/dev/null; then
    ok "Global Caddyfile is valid"
  else
    warn "Global Caddyfile present but INVALID — fix it before any reload"
  fi
  warn "Make sure it contains a block routing '$DOMAIN' → 127.0.0.1:${PORT}."
else
  warn "No global /etc/caddy/Caddyfile yet. Create one with a block such as:"
  echo -e "       ${YELLOW}${DOMAIN}, webmaster.zerocall.io {${RESET}"
  echo -e "       ${YELLOW}    reverse_proxy 127.0.0.1:${PORT}${RESET}"
  echo -e "       ${YELLOW}}${RESET}"
  info "Or deploy in cloudflare mode (no host Caddy): sudo bash deploy.sh --cloudflare"
fi

# =============================================================================
section "✅ Setup complete"
# =============================================================================

PUBLIC_IP="$(curl -s --max-time 5 ifconfig.me 2>/dev/null || echo '<YOUR_IP>')"

echo ""
echo -e "${BOLD}Next steps:${RESET}"
echo ""
echo -e "  ${YELLOW}1.${RESET} Fill in environment variables (server secrets):"
echo -e "       nano $APP_DIR/.env"
echo ""
echo -e "  ${YELLOW}2.${RESET} Point this domain's DNS at this VM (caddy mode):"
echo -e "       $DOMAIN  →  A  $PUBLIC_IP"
echo ""
echo -e "  ${YELLOW}3.${RESET} Ensure the '$DOMAIN' block is in /etc/caddy/Caddyfile (global)."
echo ""
echo -e "  ${YELLOW}4.${RESET} First deploy:"
echo -e "       cd $APP_DIR && sudo bash deploy.sh            ${BLUE}# caddy (default)${RESET}"
echo -e "       cd $APP_DIR && sudo bash deploy.sh --cloudflare ${BLUE}# Cloudflare tunnel${RESET}"
echo ""
echo -e "  ${YELLOW}5.${RESET} Later updates (zero-downtime swap):"
echo -e "       cd $APP_DIR && sudo bash update.sh"
echo ""

if [[ -n "$DEPLOY_USER" ]] && id "$DEPLOY_USER" &>/dev/null; then
  warn "Re-login as '$DEPLOY_USER' to activate the docker group."
fi

echo -e "${GREEN}${BOLD}Setup done 🎉${RESET}"
