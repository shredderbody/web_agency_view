#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────────────────────
# Atelier Vitrine — Imagerie sur-mesure « Maison Éphémère » (wedding & event planner)
# Démo concept (pas de client réel Google) : imagerie générée via KIE AI (t2i),
# puis PNG → WebP avec cwebp dans public/clients/maison-ephemere/photo_NN.webp.
#
# Usage : KIE_API_KEY=... python3 scripts/gen_ephemere.py
# ─────────────────────────────────────────────────────────────────────────────
import json, os, sys, time, subprocess, urllib.request

KIE_API_KEY = os.environ.get("KIE_API_KEY")
if not KIE_API_KEY:
    raise SystemExit("KIE_API_KEY manquant. Lancez : KIE_API_KEY=... python3 scripts/gen_ephemere.py")
MODEL = "gpt-image-2-text-to-image"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "clients", "maison-ephemere")
BASE = "https://api.kie.ai/api/v1/jobs"

SUFFIX = ("High-end editorial wedding photography, natural colors, fine-art, "
          "elegant, photorealistic, no people unless stated, no text, no watermark, no logo.")

# (numéro, ratio, prompt) — palette ivoire / eucalyptus / champagne, chic romantique.
SHOTS = [
    ("00", "16:9", "A romantic outdoor wedding ceremony at golden hour, a couple seen from behind "
     "walking down a flower-lined aisle bordered with eucalyptus and white roses, wooden chairs, "
     "warm backlight and lens flare, soft bokeh, dreamy and luxurious, cinematic wide shot."),
    ("01", "4:3", "An elegant wedding reception table beautifully set at dusk: crisp white linen, "
     "a lush eucalyptus and white-rose garland runner, gold cutlery, tall taper candles in brass "
     "holders, crystal glasses, soft warm candlelight, luxury event styling, shallow depth of field."),
    ("02", "3:4", "Portrait of an elegant French female wedding planner in her late thirties, chic "
     "neutral-toned outfit, smooth hair, warm confident smile, holding a leather planning notebook, "
     "standing in a bright airy venue with white florals and eucalyptus behind her, editorial 85mm portrait."),
    ("03", "4:3", "An elegant wedding planner woman in a chic outfit with a slim clipboard and a "
     "discreet earpiece, coordinating staff at a luxury wedding venue, candid in-action moment, "
     "soft daylight, florals and draped fabric in the background, editorial reportage."),
    ("04", "4:3", "A lush bridal bouquet of white roses, ranunculus, peonies and trailing eucalyptus "
     "held by a bride in a flowing ivory dress, soft natural window light, fine-art bridal photography, "
     "shallow depth of field, romantic and refined."),
    ("05", "3:4", "A romantic wedding ceremony arch decorated with cascading white flowers and lush "
     "greenery against a soft pastel sky, an aisle with petals, vertical fine-art photograph, dreamy light."),
    ("06", "3:4", "A bride and groom sharing a tender first dance under warm Edison string lights at an "
     "elegant evening reception, surrounded by soft golden bokeh, candid romantic moment, vertical shot."),
    ("07", "16:9", "A dreamy wedding venue at twilight with canopies of hanging Edison string lights, "
     "draped sheer fabric, tall floral installations and candles, warm romantic glow, no people, "
     "wide atmospheric editorial shot."),
    ("08", "3:4", "An intimate luxury place setting detail: a folded linen napkin with a gold ring holder, "
     "a sprig of eucalyptus, a blank cream menu card and a blank calligraphy place card, on white linen, "
     "soft warm light, vertical close-up, refined wedding tablescape."),
    ("09", "4:3", "An overhead flat-lay wedding mood board: fabric swatches in ivory, sage green and "
     "blush, sprigs of eucalyptus and dried flowers, a pair of gold wedding rings, blank invitation cards, "
     "satin ribbon and a sprig of baby's breath, arranged on a pale marble surface, elegant styling, no text."),
]


def api_post(path, payload):
    req = urllib.request.Request(f"{BASE}/{path}", data=json.dumps(payload).encode(),
                                 headers={"Authorization": f"Bearer {KIE_API_KEY}",
                                          "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def api_get(path):
    req = urllib.request.Request(f"{BASE}/{path}", headers={"Authorization": f"Bearer {KIE_API_KEY}"}, method="GET")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (atelier-vitrine asset fetch)"})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        f.write(r.read())


def submit(prompt, ratio):
    resp = api_post("createTask", {"model": MODEL, "input": {"prompt": prompt, "aspect_ratio": ratio, "output_format": "png"}})
    if resp.get("code") != 200:
        raise RuntimeError(f"createTask failed: {resp}")
    return resp["data"]["taskId"]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    only = set(sys.argv[1:])
    jobs = {}  # taskId -> num
    for num, ratio, prompt in SHOTS:
        if only and num not in only:
            continue
        tid = submit(f"{prompt} {SUFFIX}", ratio)
        print(f"[submit] photo_{num} ({ratio}) task={tid}", flush=True)
        jobs[tid] = num
        time.sleep(1)

    pending = dict(jobs)
    deadline = time.time() + 720
    while pending and time.time() < deadline:
        time.sleep(12)
        for tid in list(pending):
            try:
                info = api_get(f"recordInfo?taskId={tid}")["data"]
            except Exception as e:
                print(f"[poll] {tid} error {e}", flush=True)
                continue
            state = info.get("state")
            if state == "success":
                url = json.loads(info["resultJson"])["resultUrls"][0]
                num = pending[tid]
                png = os.path.join(OUT_DIR, f"photo_{num}.png")
                webp = os.path.join(OUT_DIR, f"photo_{num}.webp")
                download(url, png)
                subprocess.run(["/usr/bin/cwebp", "-q", "82", png, "-o", webp],
                               check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                os.remove(png)
                print(f"[done] photo_{num}.webp", flush=True)
                del pending[tid]
            elif state in ("fail", "failed"):
                print(f"[FAIL] photo_{pending[tid]}  {info.get('failMsg', info)}", flush=True)
                del pending[tid]
            else:
                print(f"[wait] photo_{pending[tid]} {state}", flush=True)

    if pending:
        print(f"[timeout] still pending: {list(pending.values())}", flush=True)
        sys.exit(1)
    print("[ALL DONE]", flush=True)


if __name__ == "__main__":
    main()
