#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────────────────────
# Atelier Vitrine — Générateur de personnages (KIE AI, text-to-image)
# Pour chaque métier de démo : 1 portrait propre + 1 planche-contact (contact sheet)
# d'un artisan photoréaliste, incorporés ensuite dans chaque vitrine.
#
# Usage : KIE_API_KEY=... python3 scripts/gen_characters.py
# Sortie : public/characters/{slug}-portrait.png  et  {slug}-sheet.png
# ─────────────────────────────────────────────────────────────────────────────
import json, os, sys, time, urllib.request, urllib.error

KIE_API_KEY = os.environ.get("KIE_API_KEY")
if not KIE_API_KEY:
    raise SystemExit("KIE_API_KEY manquant. Lancez : KIE_API_KEY=... python3 scripts/gen_characters.py")
MODEL = "gpt-image-2-text-to-image"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "characters")
BASE = "https://api.kie.ai/api/v1/jobs"

# Identité de chaque artisan : décrite finement pour la cohérence du visage.
PEOPLE = {
    "barbershop": {
        "who": "a confident French male barber in his late thirties, short dark hair with a faded undercut, well-groomed full dark beard, warm olive skin, expressive dark brown eyes, sleeve tattoos on the forearms, wearing a black work apron over a fitted charcoal t-shirt",
        "scene": "inside a warm vintage barbershop with brass fixtures, leather chairs and amber edison-bulb lighting, soft cinematic bokeh",
    },
    "onglerie": {
        "who": "a graceful French female nail artist in her early thirties, smooth dark hair in a sleek low bun, fair warm skin, soft natural makeup, kind hazel eyes, wearing an elegant blush-pink work blouse with delicate gold jewelry",
        "scene": "inside a bright airy nail studio with blush-pink and cream tones, dried pampas grass, soft daylight from a large window, gentle bokeh",
    },
    "traiteur": {
        "who": "a hearty French male charcutier-traiteur in his late forties, salt-and-pepper hair, neat short beard, ruddy warm skin, friendly crinkled eyes, wearing a natural linen apron over a rolled-sleeve oxford shirt",
        "scene": "behind a rustic artisan deli counter with cured hams, terrines and wooden boards, warm tungsten light, shallow depth of field",
    },
    "restaurant": {
        "who": "a poised French female chef-restaurateur in her early thirties, dark wavy hair tied back, warm light-brown skin, calm confident smile, deep brown eyes, wearing a clean white chef jacket with sleeves rolled",
        "scene": "inside a cozy neighborhood bistro with warm wood, brass and candlelight, blurred dining room behind, cinematic evening glow",
    },
    "plombier": {
        "who": "a trustworthy French male plumber in his early forties, short brown hair, light stubble, fair weathered skin, friendly confident eyes, wearing dark navy work overalls over a fitted slate-blue t-shirt, a leather tool belt with chrome tools",
        "scene": "inside a freshly renovated modern bathroom with large-format stone tiles, a sleek floating vanity and chrome fixtures, bright natural daylight, soft cinematic bokeh",
    },
}

# Scènes & détails métier (environnement + produit), pour une imagerie sur-mesure.
SCENES = {
    "barbershop": [
        ("barber-scene", "16:9", "Interior of a warm vintage barbershop: a row of classic leather barber chairs facing large mirrors, brass and dark wood fixtures, amber edison-bulb lighting, hexagonal floor tiles, bottles and tools neatly arranged on the counter, no people, cinematic editorial wide shot."),
        ("barber-detail", "4:3", "Extreme close-up of a barber's hand holding a professional black hair clipper (tondeuse) next to scissors, a straight razor and a comb laid on warm leather, shallow depth of field, amber light, premium product photography."),
    ],
    "onglerie": [
        ("onglerie-scene", "16:9", "Interior of a bright airy nail studio in blush-pink and cream tones, two elegant manicure stations with soft cushioned seats, dried pampas grass, ring lights, shelves of nail polish in pastel gradient, large window daylight, no people, editorial wide shot."),
        ("onglerie-detail", "4:3", "Extreme close-up of a woman's well-manicured hands with glossy nude-pink almond-shaped nails resting on a soft towel, a nail artist's brush applying delicate gel polish, soft daylight, premium beauty product photography, shallow depth of field."),
    ],
    "traiteur": [
        ("traiteur-detail", "4:3", "Top-down close-up of a rustic charcuterie and terrine board: sliced cured ham, saucisson, pâté, cornichons, crusty bread and figs on a worn wooden board, warm tungsten light, artisan food photography, rich appetizing colors."),
        ("traiteur-scene", "16:9", "Interior of an artisan charcuterie-traiteur shop: a glass deli counter full of terrines, pâtés and saucissons, cured hams hanging from a wooden beam above, chalkboard menu, warm tungsten light, no people, inviting editorial wide shot."),
    ],
    "restaurant": [
        ("restaurant-scene", "16:9", "Interior of a cozy neighborhood French bistro at dusk: warm wood tables with white linen, bentwood chairs, brass pendant lights and candles, a zinc bar in the background, intimate evening glow, no people, editorial wide shot."),
        ("restaurant-detail", "4:3", "Overhead close-up of an elegant plated bistro dish: seared duck breast with seasonal vegetables and a glossy reduction, on a ceramic plate, a glass of red wine beside it, warm candlelight, fine-dining food photography."),
    ],
    "plombier": [
        ("plombier-scene", "16:9", "Interior of a freshly renovated modern bathroom: a walk-in glass shower with chrome fittings, a floating wood vanity with a white basin, large-format stone-look tiles, a wall-hung WC, soft natural daylight from a window, spotless and bright, no people, editorial wide shot."),
        ("plombier-detail", "4:3", "Extreme close-up of a plumber's hands tightening a chrome adjustable wrench on a polished chrome pipe fitting under a basin, copper and chrome pipes, a few professional tools laid out nearby, shallow depth of field, cool daylight, premium trade product photography."),
    ],
}

PORTRAIT_SUFFIX = (
    "High-end advertising portrait photography, Canon EOS R5, 85mm portrait lens, "
    "natural skin texture, soft key light, shallow depth of field, vertical 3:4 framing. "
    "Photorealistic, no cartoon, no illustration, no CGI, no text, no watermark."
)
SHEET_SUFFIX = (
    "Professional character contact sheet / model sheet: the SAME person shown in 6 frames "
    "arranged in a clean 3x2 grid on a neutral studio background — front view, three-quarter "
    "left, three-quarter right, warm smile close-up, neutral expression, candid working pose. "
    "Identical face, hair and wardrobe across every frame, consistent identity and lighting. "
    "High-end advertising photography, Canon EOS R5, natural colors, horizontal 4:3 framing. "
    "Photorealistic, no cartoon, no illustration, no CGI, no text labels, no watermark."
)


def api_post(path, payload):
    req = urllib.request.Request(
        f"{BASE}/{path}",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {KIE_API_KEY}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def api_get(path):
    req = urllib.request.Request(
        f"{BASE}/{path}", headers={"Authorization": f"Bearer {KIE_API_KEY}"}, method="GET"
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (atelier-vitrine asset fetch)"})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        f.write(r.read())


def submit(prompt, ratio):
    payload = {"model": MODEL, "input": {"prompt": prompt, "aspect_ratio": ratio, "output_format": "png"}}
    resp = api_post("createTask", payload)
    if resp.get("code") != 200:
        raise RuntimeError(f"createTask failed: {resp}")
    return resp["data"]["taskId"]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    # Optional CLI args: limit generation to the given slug(s), e.g. `... plombier`.
    only = set(sys.argv[1:])
    jobs = {}  # taskId -> (filename)
    for slug, p in PEOPLE.items():
        if only and slug not in only:
            continue
        portrait_prompt = f"Photorealistic portrait of {p['who']}, {p['scene']}. {PORTRAIT_SUFFIX}"
        sheet_prompt = f"{p['who']}. {SHEET_SUFFIX}"
        tid_p = submit(portrait_prompt, "3:4")
        print(f"[submit] {slug}-portrait  task={tid_p}", flush=True)
        jobs[tid_p] = f"{slug}-portrait.png"
        tid_s = submit(sheet_prompt, "4:3")
        print(f"[submit] {slug}-sheet     task={tid_s}", flush=True)
        jobs[tid_s] = f"{slug}-sheet.png"
        for name, ratio, prompt in SCENES.get(slug, []):
            full = f"{prompt} High-end photorealistic photography, natural colors, no text, no watermark."
            tid = submit(full, ratio)
            print(f"[submit] {name}  task={tid}", flush=True)
            jobs[tid] = f"{name}.png"
        time.sleep(1)

    pending = dict(jobs)
    deadline = time.time() + 600  # 10 min
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
                dest = os.path.join(OUT_DIR, pending[tid])
                download(url, dest)
                print(f"[done] {pending[tid]}  <- {url}", flush=True)
                del pending[tid]
            elif state in ("fail", "failed"):
                print(f"[FAIL] {pending[tid]}  {info.get('failMsg', info)}", flush=True)
                del pending[tid]
            else:
                print(f"[wait] {pending[tid]} {state}", flush=True)

    if pending:
        print(f"[timeout] still pending: {list(pending.values())}", flush=True)
        sys.exit(1)
    print("[ALL DONE]", flush=True)


if __name__ == "__main__":
    main()
