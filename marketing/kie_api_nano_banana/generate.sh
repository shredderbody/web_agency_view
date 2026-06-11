#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# KIE AI — Génération image promotionnelle Atelier Vitrine
# Format : photo réaliste artisan (univers barbershop / Maison Brutus) +
#   mockup laptop de sa vitrine sur-mesure + headline + CTA + logo
#   inspiré de devis_app/marketing/kie_api_nano_banana/ad-zerocall-v02-us-devis-02.png
#
# Usage : bash generate.sh
# Output: ./ad-atelier-vitrine-v01-fr-barbershop-01.png
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

KIE_API_KEY="0bcd8ed8ff4b44dde373adf4f87613cd"
OUTPUT_DIR="$(dirname "$0")"
OUTPUT_FILE="ad-atelier-vitrine-v01-fr-barbershop-01.png"

# ── PROMPT ────────────────────────────────────────────────────────────────────
PROMPT="Landscape 16:9 photorealistic promotional banner for a French web design studio called Atelier Vitrine, \
that builds custom showcase websites for local shop owners such as barbers, nail salons, caterers, restaurants and plumbers. \
Warm artisanal aesthetic, no dark neon gradients, no generic tech-startup look. \
LEFT HALF: photorealistic photo of a confident French male barber in his late thirties, short dark hair with a faded undercut, \
well-groomed full dark beard, warm olive skin, sleeve tattoos on his forearms, wearing a black work apron with brass buckles \
over a charcoal t-shirt, standing inside his warm vintage barbershop with brass fixtures, leather chairs and amber edison-bulb \
lighting, holding a tablet and smiling proudly while looking at the camera. \
RIGHT HALF: a realistic matte cream-colored laptop mockup, slightly angled, displaying a polished dark espresso-brown \
barbershop website on its screen: bold condensed all-caps display heading MAISON BRUTUS in warm cream, brass-gold accent \
buttons and thin brass dividers, a hero photo of a leather barber chair, and a small reservation button. \
TOP-LEFT a small rounded vermilion pill badge with bold cream all-caps text VOTRE VITRINE SUR MESURE and a small paintbrush icon. \
BOTTOM: a warm deep-ink brown gradient overlay across the bottom of the image, on top of it a large bold cream all-caps \
headline VOTRE VITRINE VOTRE UNIVERS, below that a subtitle line in warm beige Site concu pour votre metier, \
with the words livre en 7 jours in vermilion at the end of the line. \
BOTTOM-RIGHT the text logo Atelier Vitrine in bold vermilion display serif, with a small hand-painted shop-sign icon to its left. \
Color palette: warm cream paper #F7F4EC, deep ink brown-black #2B2520, vermilion red-orange #D9492C, brass gold #C9A227, \
no pure black, no pure white, no blue, no neon. \
Typography: warm bold condensed display type for the headline and website heading, clean grotesque for body text, \
hand-crafted sign-painting feel. \
Subtle warm paper grain texture on background, soft warm cinematic shadows. \
Photographic realism for the left half portrait, sharp realistic rendering for the laptop mockup screen, \
premium artisanal small-business advertising photography style, warm golden-hour lighting, high detail, 4K quality."

ASPECT_RATIO="16:9"
RESOLUTION="2K"
FORMAT="png"

# ── ÉTAPE 1 : Soumettre la tâche ──────────────────────────────────────────────
echo ""
echo ">>> ÉTAPE 1 : Envoi du prompt à KIE AI (nano-banana-pro)..."

RESPONSE=$(curl -s --request POST \
  'https://api.kie.ai/api/v1/jobs/createTask' \
  --header "Authorization: Bearer ${KIE_API_KEY}" \
  --header 'Content-Type: application/json' \
  --data-raw "{
    \"model\": \"nano-banana-pro\",
    \"input\": {
      \"prompt\": \"${PROMPT}\",
      \"image_input\": [],
      \"aspect_ratio\": \"${ASPECT_RATIO}\",
      \"resolution\": \"${RESOLUTION}\",
      \"output_format\": \"${FORMAT}\"
    }
  }")

echo "Réponse API : ${RESPONSE}"

TASK_ID=$(echo "${RESPONSE}" | jq -r '.data.taskId')

if [[ -z "${TASK_ID}" || "${TASK_ID}" == "null" ]]; then
  echo "ERREUR : taskId non reçu. Vérifier la clé API ou le prompt."
  exit 1
fi

echo "Task ID : ${TASK_ID}"

# ── ÉTAPE 2 : Polling jusqu'à success ─────────────────────────────────────────
echo ""
echo ">>> ÉTAPE 2 : Attente génération (60-120s)..."

MAX_ATTEMPTS=30   # 30 × 10s = 300s max
ATTEMPT=0
STATE="waiting"
POLL=""

while [[ "${STATE}" != "success" && "${STATE}" != "failed" && ${ATTEMPT} -lt ${MAX_ATTEMPTS} ]]; do
  sleep 10
  ATTEMPT=$((ATTEMPT + 1))

  POLL=$(curl -s --request GET \
    "https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${TASK_ID}" \
    --header "Authorization: Bearer ${KIE_API_KEY}")

  STATE=$(echo "${POLL}" | jq -r '.data.state')
  echo "  [${ATTEMPT}/${MAX_ATTEMPTS}] État : ${STATE}"
done

# Si timeout, continuer à poller 10 fois de plus
if [[ "${STATE}" == "waiting" ]]; then
  echo ">>> Timeout initial — poursuite du polling (100s supplémentaires)..."
  for i in $(seq 1 10); do
    sleep 10
    POLL=$(curl -s --request GET \
      "https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${TASK_ID}" \
      --header "Authorization: Bearer ${KIE_API_KEY}")
    STATE=$(echo "${POLL}" | jq -r '.data.state')
    echo "  [extra ${i}/10] État : ${STATE}"
    if [[ "${STATE}" == "success" || "${STATE}" == "failed" ]]; then
      break
    fi
  done
fi

if [[ "${STATE}" != "success" ]]; then
  echo "ERREUR : génération échouée ou timeout. État final : ${STATE}"
  echo "Task ID pour poll manuel : ${TASK_ID}"
  exit 1
fi

# ── ÉTAPE 3 : Télécharger l'image ─────────────────────────────────────────────
echo ""
echo ">>> ÉTAPE 3 : Téléchargement..."

IMAGE_URL=$(echo "${POLL}" | jq -r '.data.resultJson | fromjson | .resultUrls[0]')

if [[ -z "${IMAGE_URL}" || "${IMAGE_URL}" == "null" ]]; then
  echo "ERREUR : URL introuvable dans la réponse."
  echo "${POLL}"
  exit 1
fi

echo "URL : ${IMAGE_URL}"
curl -s -o "${OUTPUT_DIR}/${OUTPUT_FILE}" "${IMAGE_URL}"

echo ""
echo "✓ Image sauvegardée : ${OUTPUT_DIR}/${OUTPUT_FILE}"
ls -lh "${OUTPUT_DIR}/${OUTPUT_FILE}"
