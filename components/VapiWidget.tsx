"use client";
import { useEffect } from "react";
import { getVapiMetier, vapiPublicKey } from "@/lib/vapi";

/* ════════════════════════════════════════════════════════════════════════════
   Bulle de discussion HYBRIDE Vapi (chat + appel vocal) pour les pages métier.

   - Charge le web-component officiel <vapi-widget> depuis unpkg (le SDK lui-même
     est tiré depuis esm.sh → la CSP des domaines servant cette app doit autoriser
     https://unpkg.com + https://esm.sh + *.vapi.ai + *.daily.co, cf.
     docs/VAPI_ASSISTANTS.md et le bloc csp_receptionniste du Caddyfile).
   - Un assistant inbound par métier (lib/vapi.ts), couleurs = couleur de la page.
   - L'élément est monté impérativement (attributs kebab-case) puis nettoyé au
     changement de métier / démontage, donc 100 % indépendant de la version React.
   ════════════════════════════════════════════════════════════════════════════ */

const SCRIPT_ID = "vapi-widget-loader";
const SCRIPT_SRC = "https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js";

function ensureScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.customElements?.get("vapi-widget")) return Promise.resolve();

  let loader = (window as unknown as { __vapiWidgetLoad?: Promise<void> }).__vapiWidgetLoad;
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const onReady = () => {
      // attend que le custom element soit réellement défini
      if (window.customElements?.get("vapi-widget")) return resolve();
      window.customElements
        ?.whenDefined("vapi-widget")
        .then(() => resolve())
        .catch(() => resolve());
    };
    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      onReady();
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

  (window as unknown as { __vapiWidgetLoad?: Promise<void> }).__vapiWidgetLoad = loader;
  return loader;
}

export default function VapiWidget({ slug }: { slug: string }) {
  useEffect(() => {
    const cfg = getVapiMetier(slug);
    if (!cfg || !cfg.assistantId) return;

    let el: HTMLElement | null = null;
    let cancelled = false;

    ensureScript()
      .then(() => {
        if (cancelled) return;
        el = document.createElement("vapi-widget");
        const attrs: Record<string, string> = {
          "public-key": vapiPublicKey(),
          "assistant-id": cfg.assistantId,
          mode: "hybrid",
          theme: cfg.theme,
          position: "bottom-right",
          size: "compact",
          radius: "large",
          "accent-color": cfg.accent,
          "base-color": cfg.base,
          "button-base-color": cfg.accent,
          "button-accent-color": cfg.buttonIcon,
          "main-label": cfg.label,
          "start-button-text": "Appeler",
          "end-button-text": "Raccrocher",
          "empty-chat-message": "Bonjour ! Posez votre question ou réservez en quelques mots.",
          "empty-voice-message": "Touchez pour parler à notre standardiste.",
          "show-transcript": "true",
        };
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        el.setAttribute("data-vapi-metier", slug);
        document.body.appendChild(el);
      })
      .catch((e) => console.error("[VapiWidget]", e));

    return () => {
      cancelled = true;
      if (el && el.parentNode) el.parentNode.removeChild(el);
      // filet de sécurité : retire tout widget résiduel
      document.querySelectorAll("vapi-widget").forEach((n) => n.remove());
    };
  }, [slug]);

  return null;
}
