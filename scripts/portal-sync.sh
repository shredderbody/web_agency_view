#!/usr/bin/env bash
# =============================================================================
#  portal-sync.sh — alimente le suivi de l'espace client (/espace).
#
#  Deux traitements, tous deux idempotents (cf. app/api/portal/sync/route.ts) :
#    1. PROJECTION   : demo_bookings (écrit par n8n) → journal d'actions.
#    2. CONSOMMATION : API Vapi → public.demo_usage_daily.
#
#  POURQUOI EN CRON, et pas seulement au clic : le plan Vapi ne conserve que
#  14 JOURS d'historique d'appels. Passé ce délai, l'API refuse la requête et la
#  consommation de ces jours-là est perdue POUR TOUJOURS. Cette archive est la
#  seule mémoire longue du suivi — si le cron ne tourne pas pendant deux
#  semaines, il y a un trou définitif dans les graphes.
#
#  EN PRODUCTION, ce n'est PAS ce script qui tourne : la boucle horaire est le
#  service `portal-sync` de docker-compose.yml (cette machine n'a pas de crontab).
#  Ce script sert aux relances manuelles depuis l'hôte, et de repli si un jour
#  un cron devient disponible :
#    17 * * * * /home/amscjrb/web_agency_view/scripts/portal-sync.sh
#
#  Journal : /home/amscjrb/web_agency_view/log_tmp/portal-sync.log (tronqué à 2000 lignes).
# =============================================================================
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG="$DIR/log_tmp/portal-sync.log"
URL="${PORTAL_SYNC_URL:-http://127.0.0.1:3010/api/portal/sync}"
SECRET="$(grep -m1 '^PORTAL_SYNC_SECRET=' "$DIR/.env" 2>/dev/null | cut -d= -f2-)"

mkdir -p "$(dirname "$LOG")"

if [ -z "$SECRET" ]; then
  echo "$(date -Is) ERREUR PORTAL_SYNC_SECRET absent de $DIR/.env" >> "$LOG"
  exit 1
fi

RESP="$(curl -s --max-time 180 -X POST "$URL" -H "x-portal-sync-secret: $SECRET" || echo '{"error":"curl a échoué"}')"
echo "$(date -Is) $(printf '%s' "$RESP" | head -c 600)" >> "$LOG"

# Le journal ne doit pas grossir indéfiniment sur une machine partagée.
if [ "$(wc -l < "$LOG")" -gt 2000 ]; then
  tail -n 1000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi
