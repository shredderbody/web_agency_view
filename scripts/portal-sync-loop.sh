#!/bin/sh
# =============================================================================
#  Boucle de synchronisation du suivi — tourne dans le conteneur `portal-sync`
#  (cf. docker-compose.yml), monté en lecture seule.
#
#  Un script plutôt qu'un `command:` en ligne : la boucle a d'abord été écrite
#  dans le compose et s'est cassée deux fois sur des subtilités de quoting YAML
#  (bloc plié qui garde les retours à la ligne, puis découpage en mots d'une
#  commande chaîne). Un fichier shell se lit, se teste et ne ment pas.
#
#  Deux traitements, tous deux idempotents :
#    1. PROJECTION   : demo_bookings → demo_actions / _reservations / _customers
#    2. CONSOMMATION : API Vapi → demo_usage_daily
#
#  Cadence horaire, non négociable : le plan Vapi ne conserve que 14 jours
#  d'historique d'appels. Ce qui n'est pas archivé à temps est perdu.
# =============================================================================
URL="${PORTAL_SYNC_URL:-http://web:3010/api/portal/sync}"
INTERVAL="${PORTAL_SYNC_INTERVAL:-3600}"

echo "portal-sync: démarrage — $URL toutes les ${INTERVAL}s"

# Laisse à l'app le temps d'accepter sa première requête après un redéploiement.
sleep 20

while true; do
  RESP=$(curl -s --max-time 180 -X POST "$URL" \
    -H "x-portal-sync-secret: ${PORTAL_SYNC_SECRET}" 2>&1)
  echo "$(date -Iseconds) $(printf '%s' "$RESP" | head -c 400)"
  sleep "$INTERVAL"
done
