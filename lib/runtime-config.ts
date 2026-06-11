"use client";

/* ════════════════════════════════════════════════════════════════════════════
   Configuration lue AU RUNTIME (et non au build) depuis /config.json.

   Pourquoi : les variables `process.env.NEXT_PUBLIC_*` lues par les composants
   client sont inlinées dans le bundle au moment du `npm run build` (cf.
   Dockerfile). De plus, les pages /demo/[slug] sont statiquement générées
   (generateStaticParams), donc même un Server Component figerait la valeur au
   build. Pour basculer un flag SANS rebuild, on sert un petit /config.json
   depuis public/ et on le charge côté client.

   En prod, ce fichier est bind-monté dans le conteneur (cf. docker-compose.yml) :
   l'éditer + rafraîchir le navigateur suffit. Le /config.json baké dans l'image
   (public/config.json) sert de valeur par défaut sans bind-mount.
   ════════════════════════════════════════════════════════════════════════════ */

export type RuntimeConfig = {
  /** Affiche la bulle vocale Vapi sur les pages métier. */
  vapiWidgetEnabled: boolean;
};

// Repli si /config.json est absent ou illisible : on retombe sur le drapeau
// build-time pour rester rétro-compatible avec l'ancien comportement.
const DEFAULTS: RuntimeConfig = {
  vapiWidgetEnabled: process.env.NEXT_PUBLIC_VAPI_WIDGET_ENABLED === "true",
};

let cache: RuntimeConfig | null = null;
let inflight: Promise<RuntimeConfig> | null = null;

/** Charge (et mémoïse) /config.json. Sûr à appeler plusieurs fois. */
export function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/config.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: Partial<RuntimeConfig> = await res.json();
      cache = {
        vapiWidgetEnabled:
          typeof json.vapiWidgetEnabled === "boolean"
            ? json.vapiWidgetEnabled
            : DEFAULTS.vapiWidgetEnabled,
      };
    } catch (err) {
      console.warn("[runtime-config] /config.json illisible, valeurs par défaut utilisées", err);
      cache = DEFAULTS;
    }
    return cache;
  })();
  return inflight;
}
