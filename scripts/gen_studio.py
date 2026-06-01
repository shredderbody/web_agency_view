#!/usr/bin/env python3
# Génère des visuels "studio / créateur de sites web" (neutres, sans métier précis)
# pour le hero et la section atelier de la home. Sortie : public/studio/*.webp (via PNG).
import json, os, sys, time, urllib.request

KIE_API_KEY = os.environ.get("KIE_API_KEY")
if not KIE_API_KEY:
    raise SystemExit("KIE_API_KEY manquant.")
MODEL = "gpt-image-2-text-to-image"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "studio")
BASE = "https://api.kie.ai/api/v1/jobs"

IMAGES = [
    ("hero-desk", "16:9",
     "A warm, premium web-design studio scene: an open laptop on a light oak desk displaying a beautiful, colorful small-business website, beside it a smartphone showing the same site responsive, a notebook with hand-sketched wireframes, a cup of coffee, a small plant, soft natural window light, shallow depth of field, no people. Cream and warm tones, editorial product photography."),
    ("workspace", "4:3",
     "Overhead flat-lay of a designer's desk: color swatches in warm cream and vermilion tones, a typographic specimen card, a pencil, a tablet showing a website mockup, fabric and paper textures, warm daylight. Clean, tactile, artisan studio mood, editorial flat-lay photography, no people."),
    ("creator", "3:4",
     "Photorealistic portrait of a friendly French web designer in their early thirties working at a bright studio desk, looking at a laptop screen with a warm focused smile, wearing a simple knit sweater, plants and framed prints softly blurred behind, warm natural light, Canon EOS R5, 50mm, natural colors. No text, no watermark, photorealistic."),
]

def post(p):
    r = urllib.request.Request(f"{BASE}/createTask", data=json.dumps(p).encode(),
        headers={"Authorization": f"Bearer {KIE_API_KEY}", "Content-Type": "application/json"}, method="POST")
    return json.load(urllib.request.urlopen(r, timeout=60))

def get(path):
    r = urllib.request.Request(f"{BASE}/{path}", headers={"Authorization": f"Bearer {KIE_API_KEY}"})
    return json.load(urllib.request.urlopen(r, timeout=30))

def dl(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        f.write(r.read())

os.makedirs(OUT, exist_ok=True)
jobs = {}
for name, ratio, prompt in IMAGES:
    tid = post({"model": MODEL, "input": {"prompt": prompt + " High-end photorealistic photography, no text, no watermark.", "aspect_ratio": ratio, "output_format": "png"}})["data"]["taskId"]
    print("submit", name, tid, flush=True)
    jobs[tid] = f"{name}.png"

pending = dict(jobs); deadline = time.time() + 480
while pending and time.time() < deadline:
    time.sleep(12)
    for tid in list(pending):
        try:
            info = get(f"recordInfo?taskId={tid}")["data"]
        except Exception as e:
            print("poll err", e, flush=True); continue
        st = info.get("state")
        if st == "success":
            url = json.loads(info["resultJson"])["resultUrls"][0]
            dl(url, os.path.join(OUT, pending[tid]))
            print("done", pending[tid], flush=True); del pending[tid]
        elif st in ("fail", "failed"):
            print("FAIL", pending[tid], info.get("failMsg"), flush=True); del pending[tid]
print("PENDING" if pending else "ALL DONE", list(pending.values()), flush=True)
