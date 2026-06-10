# VAPI FRONT-END WIDGET — Playbook complet (bulle vocale + chat, micro, responsive)

> **À quoi sert ce fichier.** À chaque fois qu'un projet client doit afficher un
> assistant Vapi **en front-end** (bulle de chat, appel vocal dans le navigateur,
> mode hybride chat+voix), on retombe sur les **mêmes 3 pièges** : la CSP qui
> bloque le bundle, la `Permissions-Policy` qui interdit le micro, et le montage
> du widget qui ne se fait pas. Ce playbook donne le diagnostic + la solution
> copier-coller, valable Next.js, Vite/React, ou HTML pur, derrière **Caddy** ou
> **nginx**, en **responsive mobile / tablette / ordinateur**.
>
> Cas réel de référence : Atelier Vitrine (`receptionniste.zerocall.io`,
> `components/VapiWidget.tsx`) — bulle hybride par métier. Voir aussi le projet
> `receptionist` (approche module custom) pour une variante 100 % sur-mesure.

---

## 0. TL;DR — la checklist qui résout 95 % des cas

Le widget Vapi front-end a besoin que **l'entrée publique** (Caddy/nginx) serve
ces en-têtes, sinon il **ne s'affiche pas** ou **n'a pas le micro** :

1. **CSP `script-src`** doit autoriser la source du bundle :
   `https://unpkg.com` (et `'unsafe-eval' blob:` pour les workers Daily/WebRTC).
2. **CSP `connect-src`** doit autoriser le transport WebRTC :
   `https://*.vapi.ai wss://*.vapi.ai https://*.daily.co wss://*.daily.co https://*.pluot.blue`.
3. **CSP `media-src`** doit inclure `blob: data: mediastream:` (flux micro).
4. **CSP `worker-src 'self' blob:`** + **`frame-src … https://*.daily.co`**.
5. **`Permissions-Policy`** doit contenir **`microphone=(self)`** (sinon
   `getUserMedia` est bloqué, l'appel vocal échoue silencieusement).
6. Le widget doit être **monté impérativement** via `window.WidgetLoader`
   (le bundle ne définit PAS de custom element `<vapi-widget>` — cf. §3).

> Diagnostic express : ouvrir la **console DevTools** sur la page. Un message
> `Refused to load the script … because it violates the Content-Security-Policy`
> = piège 1. `Refused to connect to wss://…daily.co` = piège 2. Une bulle qui
> s'ouvre mais où l'appel ne démarre jamais / pas de prompt micro = piège 5.

---

## 1. Symptôme

- La bulle Vapi **n'apparaît pas** sur la page (rien en bas à droite).
- OU la bulle apparaît, le **chat** marche, mais **l'appel vocal** ne démarre pas
  (aucune demande d'autorisation micro du navigateur).
- En local (`localhost`) ça peut marcher (CSP souvent absente en dev) puis **casser
  en production** une fois derrière Caddy/nginx → c'est presque toujours la CSP.

---

## 2. Cause racine

Le composant React peut être **parfaitement correct** : le mur est la **CSP du
domaine**, posée par le reverse proxy (Caddy ou nginx), **pas par l'app**.

| Piège | Effet | Directive en cause |
|-------|-------|--------------------|
| Bundle bloqué | `window.WidgetLoader` n'existe jamais → aucune bulle | `script-src` sans `unpkg.com` |
| Transport bloqué | Bulle visible mais chat/voix ne se connecte pas | `connect-src` sans `*.vapi.ai` / `*.daily.co` |
| Micro refusé | Appel vocal échoue, pas de prompt navigateur | `Permissions-Policy` sans `microphone=(self)` |
| Workers bloqués | WebRTC/Daily plante | `worker-src` absent, pas de `blob:` |
| Montage raté | Bulle jamais insérée même CSP OK | code qui attend un custom element inexistant |

> ⚠️ **`getUserMedia` (micro) exige HTTPS** (ou `localhost`). Sur un domaine en
> HTTP simple, le micro est bloqué par le navigateur quoi qu'on fasse dans la CSP.

---

## 3. Le composant front (montage correct)

Le bundle officiel `@vapi-ai/client-sdk-react/dist/embed/widget.umd.js` **ne
définit pas** de custom element via `customElements.define("vapi-widget", …)`.
Attendre `customElements.whenDefined("vapi-widget")` **ne se résout jamais**.

Le bundle expose `window.WidgetLoader`, un constructeur
`new WidgetLoader({ container, component: "VapiWidget", props })`. On l'instancie
nous-mêmes dans un conteneur dédié → fonctionne quel que soit l'ordre de montage
SPA, et survit aux changements de page / démontages.

### Composant React réutilisable (Next.js / Vite)

```tsx
"use client"; // Next.js App Router ; à retirer en Vite
import { useEffect } from "react";

const SCRIPT_ID = "vapi-widget-loader";
const SCRIPT_SRC =
  "https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js";

type WidgetLoaderInstance = { destroy: () => void };
type WidgetLoaderCtor = new (opts: {
  container: HTMLElement;
  component: string;
  props: Record<string, unknown>;
}) => WidgetLoaderInstance;

function getWidgetLoader(): WidgetLoaderCtor | undefined {
  return (window as unknown as { WidgetLoader?: WidgetLoaderCtor }).WidgetLoader;
}

function ensureWidgetLoader(): Promise<WidgetLoaderCtor> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const existing = getWidgetLoader();
  if (existing) return Promise.resolve(existing);

  const w = window as unknown as { __vapiWidgetLoad?: Promise<WidgetLoaderCtor> };
  if (w.__vapiWidgetLoad) return w.__vapiWidgetLoad;

  w.__vapiWidgetLoad = new Promise<WidgetLoaderCtor>((resolve, reject) => {
    const onReady = () => {
      const ctor = getWidgetLoader();
      ctor ? resolve(ctor) : reject(new Error("WidgetLoader missing after load"));
    };
    const tag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (tag) {
      getWidgetLoader() ? onReady()
        : tag.addEventListener("load", onReady, { once: true });
      tag.addEventListener("error", () => reject(new Error("vapi script error")), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.id = SCRIPT_ID; s.src = SCRIPT_SRC; s.async = true; s.type = "text/javascript";
    s.addEventListener("load", onReady, { once: true });
    s.addEventListener("error", () => reject(new Error("vapi script error")), { once: true });
    document.body.appendChild(s);
  });
  return w.__vapiWidgetLoad;
}

export default function VapiWidget({
  publicKey,
  assistantId,
}: {
  publicKey: string;
  assistantId: string;
}) {
  useEffect(() => {
    if (!assistantId) return;
    let cancelled = false;
    let instance: WidgetLoaderInstance | null = null;
    const container = document.createElement("div");
    document.body.appendChild(container);

    const props = {
      publicKey,
      assistantId,
      mode: "hybrid",            // "chat" | "voice" | "hybrid"
      position: "bottom-right",
      size: "compact",           // "tiny" | "compact" | "full"
      radius: "large",
      // Couleurs (HEX uniquement) — assortir à la charte du client :
      accentColor: "#dd9143",
      baseColor: "#2e241e",
      buttonBaseColor: "#dd9143",
      buttonAccentColor: "#18130e",
      mainLabel: "Assistant",
      startButtonText: "Appeler",
      endButtonText: "Raccrocher",
      emptyChatMessage: "Bonjour ! Posez votre question ou réservez en quelques mots.",
      emptyVoiceMessage: "Touchez pour parler à notre standardiste.",
      showTranscript: true,
    };

    ensureWidgetLoader()
      .then((WidgetLoader) => {
        if (cancelled) return;
        instance = new WidgetLoader({ container, component: "VapiWidget", props });
      })
      .catch((e) => console.error("[VapiWidget]", e));

    return () => {
      cancelled = true;
      instance?.destroy();
      container.remove();
    };
  }, [publicKey, assistantId]);

  return null; // le widget se monte lui-même dans `container` (shadow DOM)
}
```

### Variante HTML pur (sans React)

```html
<script
  src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"
  async></script>
<script>
  window.addEventListener("load", function () {
    new window.WidgetLoader({
      container: document.body.appendChild(document.createElement("div")),
      component: "VapiWidget",
      props: {
        publicKey: "VOTRE_PUBLIC_KEY",
        assistantId: "VOTRE_ASSISTANT_ID",
        mode: "hybrid",
        position: "bottom-right",
      },
    });
  });
</script>
```

> Le bundle scanne aussi le DOM au chargement et auto-monte tout
> `[data-client-widget="…"]` **sauf** `"VapiWidget"` (volontairement ignoré en
> auto-scan). C'est pourquoi on instancie `VapiWidget` **manuellement**.

### Props utiles (toutes optionnelles sauf `publicKey` + `assistantId`)

`mode` (chat/voice/hybrid), `position`, `size`, `radius`/`borderRadius`,
`theme` (light/dark), `accentColor`, `baseColor`, `baseBgColor`,
`buttonBaseColor`, `buttonAccentColor`, `ctaButtonColor`, `ctaButtonTextColor`,
`title`, `mainLabel`, `startButtonText`, `endButtonText`, `ctaTitle`,
`ctaSubtitle`, `emptyChatMessage`, `emptyVoiceMessage`, `emptyHybridMessage`,
`showTranscript`, `assistantOverrides`. **Couleurs = HEX uniquement** (pas
d'`oklch`/`rgb()` — convertir d'abord).

---

## 4. La CSP + Permissions-Policy (le vrai correctif)

### 4.a — Caddy (snippet réutilisable)

```caddyfile
# Variant de sécurité de base AVEC micro (NE PAS modifier le base_security partagé).
(base_security_mic) {
    header {
        -Server
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        Permissions-Policy "camera=(), geolocation=(), payment=(), usb=(), bluetooth=(), microphone=(self)"
    }
}

# CSP autorisant le widget Vapi (adapter les sources métier : supabase, etc.)
(csp_vapi_front) {
    header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://unpkg.com https://esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.vapi.ai wss://*.vapi.ai https://*.daily.co wss://*.daily.co https://*.pluot.blue; media-src 'self' blob: data: mediastream:; frame-src 'self' blob: https://*.daily.co; worker-src 'self' blob:; object-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
}

exemple.client.io {
    import base_security_mic
    import csp_vapi_front
    reverse_proxy 127.0.0.1:3010
}
```

> **Pourquoi `base_security_mic` séparé ?** Le `base_security` global est importé
> par d'autres sites qui ne veulent PAS le micro — le modifier ouvrirait le micro
> partout. On crée donc un variant dédié. (C'est exactement la correction
> appliquée à `receptionniste` / `webmaster` le 2026-06-10.)

### 4.b — nginx (équivalent)

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://unpkg.com https://esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.vapi.ai wss://*.vapi.ai https://*.daily.co wss://*.daily.co https://*.pluot.blue; media-src 'self' blob: data: mediastream:; frame-src 'self' blob: https://*.daily.co; worker-src 'self' blob:; object-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;
add_header Permissions-Policy "camera=(), geolocation=(), payment=(), usb=(), bluetooth=(), microphone=(self)" always;
```

> `always` est requis pour que l'en-tête soit aussi posé sur les réponses
> d'erreur. Si un `add_header` existe déjà dans un bloc parent, **tous** les
> `add_header` du bloc enfant doivent être redéclarés (héritage nginx = écrasement).

### 4.c — Next.js `next.config.js` (si pas de reverse proxy)

```js
async headers() {
  return [{
    source: "/:path*",
    headers: [
      { key: "Content-Security-Policy", value: "…(même chaîne qu'au 4.a)…" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(self)" },
    ],
  }];
}
```

> Si l'app est **derrière** Caddy/nginx, c'est le proxy qui gagne → corriger là,
> pas dans `next.config.js` (sinon double en-tête / conflit).

### Que fusionner avec une CSP existante

Garder les sources métier déjà présentes (Supabase, Stripe, Google Places, KIE,
Deepgram, Facebook…) **et** ajouter les sources Vapi. Ne **pas** repartir de zéro.
Exemple réel fusionné (Atelier Vitrine) : voir le bloc `(csp_receptionniste)` du
Caddyfile — il combine Supabase + KIE + Deepgram + Places + Facebook + Vapi.

---

## 5. Responsive — mobile / tablette / ordinateur

Le bundle officiel gère **lui-même** son layout responsive (shadow DOM, classes
`.container` avec breakpoints 640/768/1024/1280/1536px). Points d'attention pour
un rendu propre multi-format :

- **`position`** : `bottom-right` par défaut. Sur mobile la fenêtre de chat/appel
  passe en quasi plein écran automatiquement — ne pas la contraindre dans un
  conteneur `overflow:hidden` ou `transform` (un parent `transform` casse le
  `position:fixed` du widget). **Monter le widget sur `document.body`**, pas dans
  une section transformée.
- **`size`** : `compact` est le bon défaut desktop **et** mobile. `full` peut
  déborder sur petit écran ; `tiny` pour un simple bouton d'appel.
- **Zone tactile** : laisser ~16px de marge aux bords ; si la page a une barre/
  footer fixe en bas, décaler le widget (ou retirer la barre) pour éviter le
  chevauchement avec la bulle.
- **Safe areas iOS** : sur mobile, prévoir `env(safe-area-inset-bottom)` dans le
  layout de la page pour que la bulle ne tombe pas sous la barre Home.
- **z-index** : le wrapper du widget (`.vapi-widget-wrapper`) monte haut
  (≈9999) ; garder les overlays/modales du site **en dessous**, ou fermer le
  widget à l'ouverture d'une modale plein écran.
- **Micro mobile** : iOS Safari exige un **geste utilisateur** (tap) pour
  déclencher `getUserMedia` — le bouton « Appeler » du widget le fournit déjà.
  Ne pas tenter de démarrer l'appel automatiquement au chargement.
- **Pas de double bulle** : un seul `WidgetLoader` par page. En SPA, démonter
  l'instance (`instance.destroy()` + `container.remove()`) au changement de route
  pour éviter les bulles fantômes (déjà géré par le `useEffect` cleanup du §3).

### ⚠️ Panneau trop grand sur mobile (largeurs/hauteurs FIXES)

Le bundle v0.1.1 rend le panneau ouvert avec des **dimensions fixes** en `rem`
(largeur `w-96`=24rem ou `w-[28rem]`=28rem ; hauteur `h-[24rem]`…`h-[44rem]`).
Sur un mobile (~360–390px) ça **déborde** l'écran. Le widget rend dans le DOM
normal sous `.vapi-widget-wrapper` (PAS en shadow DOM ici) → on peut le **borner
en CSS**. Override responsive à coller dans le CSS global du projet :

```css
@media (max-width: 640px) {
  /* Largeur : gouttière de 1rem de chaque côté, jamais collé aux bords */
  .vapi-widget-wrapper .w-96,
  .vapi-widget-wrapper .w-\[28rem\] {
    width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
  }
  /* Hauteur : bornée au viewport (place pour la bulle + barres système) */
  .vapi-widget-wrapper .h-\[24rem\],
  .vapi-widget-wrapper .h-\[32rem\],
  .vapi-widget-wrapper .h-\[36rem\],
  .vapi-widget-wrapper .h-\[40rem\],
  .vapi-widget-wrapper .h-\[44rem\] {
    height: min(32rem, calc(100dvh - 6.5rem)) !important;
    max-height: calc(100dvh - 6.5rem) !important;
  }
  /* Padding de sécurité : décolle panneau + bulle des bords */
  .vapi-widget-wrapper .right-6 { right: 1rem !important; }
  .vapi-widget-wrapper .left-6  { left: 1rem !important; }
  .vapi-widget-wrapper .bottom-6 { bottom: 1rem !important; }
}
```

> `!important` est nécessaire : le widget **injecte sa feuille de style au
> runtime** (après le CSS de l'app), donc à spécificité égale il gagnerait sinon.
> Adapter la liste des classes `h-[…]` si une future version du bundle change ses
> paliers (vérifier dans le CSS injecté : `grep 'h-\[' widget.umd.js`).

---

## 6. Vérification (prod)

```bash
# 1) Les en-têtes autorisent-ils le widget ?
curl -sI https://exemple.client.io/ | grep -iE "content-security-policy|permissions-policy"

# Doit contenir : unpkg.com (script-src), *.vapi.ai + *.daily.co (connect-src),
#                 mediastream: (media-src), microphone=(self) (permissions-policy)

# 2) Caddy : valider AVANT de recharger
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak.$(date +%Y%m%d-%H%M%S)
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl reload caddy   # reload = zéro coupure (jamais restart)

# 3) nginx
sudo nginx -t && sudo systemctl reload nginx
```

Puis **DevTools → Console** : zéro violation CSP. **DevTools → Network** : le
`widget.umd.js` est en `200`, des WS vers `*.daily.co` s'ouvrent à l'appel. Le
navigateur demande l'autorisation **micro** au clic sur « Appeler ».

---

## 7. Checklist de déploiement client (à cocher)

- [ ] Domaine en **HTTPS** (obligatoire pour le micro).
- [ ] `script-src` ⊇ `https://unpkg.com 'unsafe-eval' blob:`
- [ ] `connect-src` ⊇ `https://*.vapi.ai wss://*.vapi.ai https://*.daily.co wss://*.daily.co https://*.pluot.blue`
- [ ] `media-src` ⊇ `blob: data: mediastream:`
- [ ] `worker-src 'self' blob:` présent
- [ ] `frame-src` ⊇ `https://*.daily.co`
- [ ] `Permissions-Policy` contient `microphone=(self)`
- [ ] Composant monte via `window.WidgetLoader` (pas `<vapi-widget>` custom element)
- [ ] Widget monté sur `document.body` (aucun parent `transform`/`overflow:hidden`)
- [ ] `publicKey` + `assistantId` injectés (env, pas en dur si possible)
- [ ] Testé sur **mobile + tablette + desktop** (bulle visible, appel + micro OK)
- [ ] Reverse proxy **validé puis rechargé** (`caddy validate` / `nginx -t`)

---

## 8. Approche alternative — module 100 % sur-mesure

Si le widget officiel impose une UX/charte non désirée (ex. boutons vert/rouge
imposés), on peut écrire un **module self-contained** qui pilote l'appel via le
SDK Vapi et monte sa propre bulle/overlay (sonnerie, visualiseur, carte de
clôture, accueil bilingue…). Référence : projet `receptionist`,
`public/altifluence-voice-demo.js` + `src/components/VapiWidget.tsx`. Les **mêmes
exigences CSP / micro du §4 s'appliquent** (le transport reste vapi.ai/daily.co).

---

## Annexe — exemple réel en prod (Atelier Vitrine)

- Composant : `components/VapiWidget.tsx` (bulle hybride par métier).
- Config par métier : `lib/vapi.ts` (couleurs HEX, assistantId, labels).
- CSP/headers : bloc `(csp_receptionniste)` + `(base_security_mic)` du Caddyfile
  global, importés par `receptionniste.zerocall.io` et `webmaster.zerocall.io`.
- Création des assistants : `docs/VAPI_ASSISTANTS.md` + `scripts/vapi-setup-assistants.mjs`.
