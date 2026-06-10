"use client";
import Image from "next/image";
import { useEffect } from "react";
import { getVapiAvatar, getVapiMetier, vapiPublicKey } from "@/lib/vapi";

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

  // Avatar "présentateur" en badge sur le coin de la bulle Vapi : incarne
  // l'assistant vocal (genre assorti à la voix configurée, cf. lib/vapi.ts).
  // Chevauche le coin haut-droit de la bulle (au lieu de flotter séparément)
  // pour former un seul bloc visuel. Liseré = couleur de fond du panneau de
  // chat (cfg.base) pour le détacher proprement de la bulle.
  // z-index volontairement < 9999 (vapi-widget-wrapper) : quand la fenêtre de
  // chat/appel s'ouvre, son panneau opaque recouvre naturellement le badge.
  const cfg = getVapiMetier(slug);
  const avatar = getVapiAvatar(slug);
  if (!cfg || !avatar) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        right: "0.125rem",
        bottom: "3.625rem",
        width: "2.75rem",
        height: "2.75rem",
        borderRadius: "9999px",
        overflow: "hidden",
        border: `2px solid ${cfg.base}`,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
        zIndex: 9998,
        pointerEvents: "none",
      }}
    >
      <Image
        src={avatar.src}
        alt={avatar.alt}
        fill
        sizes="44px"
        style={{ objectFit: "cover", objectPosition: "50% 15%" }}
      />
    </div>
  );
}
