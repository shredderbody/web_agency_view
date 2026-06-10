"use client";
import { useEffect } from "react";
import { getVapiMetier, vapiPublicKey } from "@/lib/vapi";

/* ════════════════════════════════════════════════════════════════════════════
   Bulle de discussion HYBRIDE Vapi (chat + appel vocal) pour les pages métier.

   - Charge le bundle officiel widget.umd.js depuis unpkg (cf. docs/VAPI_ASSISTANTS.md
     et le bloc csp_receptionniste du Caddyfile pour les domaines à autoriser).
   - Un assistant inbound par métier (lib/vapi.ts), couleurs = couleur de la page.
   - Le bundle ne définit PAS de custom element via customElements.define : il
     scanne le DOM une seule fois (au chargement / DOMContentLoaded) et expose
     ensuite `window.WidgetLoader`. On l'instancie donc nous-mêmes dans un
     conteneur dédié, ce qui fonctionne quel que soit l'ordre de montage côté
     SPA et survit aux changements de métier / démontages.
   ════════════════════════════════════════════════════════════════════════════ */

const SCRIPT_ID = "vapi-widget-loader";
const SCRIPT_SRC = "https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js";

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

  const existingCtor = getWidgetLoader();
  if (existingCtor) return Promise.resolve(existingCtor);

  let loader = (window as unknown as { __vapiWidgetLoad?: Promise<WidgetLoaderCtor> }).__vapiWidgetLoad;
  if (loader) return loader;

  loader = new Promise<WidgetLoaderCtor>((resolve, reject) => {
    const onReady = () => {
      const ctor = getWidgetLoader();
      if (ctor) resolve(ctor);
      else reject(new Error("vapi widget script loaded but window.WidgetLoader is missing"));
    };
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (getWidgetLoader()) return onReady();
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener("error", () => reject(new Error("vapi widget script failed")), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC;
    s.async = true;
    s.type = "text/javascript";
    s.addEventListener("load", onReady, { once: true });
    s.addEventListener("error", () => reject(new Error("vapi widget script failed")), { once: true });
    document.body.appendChild(s);
  });

  (window as unknown as { __vapiWidgetLoad?: Promise<WidgetLoaderCtor> }).__vapiWidgetLoad = loader;
  return loader;
}

export default function VapiWidget({ slug }: { slug: string }) {
  useEffect(() => {
    const cfg = getVapiMetier(slug);
    if (!cfg || !cfg.assistantId) return;

    let cancelled = false;
    let instance: WidgetLoaderInstance | null = null;
    const container = document.createElement("div");
    container.setAttribute("data-vapi-metier", slug);
    document.body.appendChild(container);

    const props = {
      publicKey: vapiPublicKey(),
      assistantId: cfg.assistantId,
      mode: "hybrid",
      theme: cfg.theme,
      position: "bottom-right",
      size: "compact",
      radius: "large",
      accentColor: cfg.accent,
      baseColor: cfg.base,
      buttonBaseColor: cfg.accent,
      buttonAccentColor: cfg.buttonIcon,
      mainLabel: cfg.label,
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
  }, [slug]);

  // On ne rend qu'une seule bulle : celle du widget Vapi hybride monté ci-dessus.
  // Le bundle officiel (shadow DOM) n'expose aucune prop pour intégrer une image
  // d'avatar à l'intérieur de sa bulle flottante, et un overlay séparé donnait
  // visuellement l'impression de deux bulles. On laisse donc le widget seul.
  return null;
}
