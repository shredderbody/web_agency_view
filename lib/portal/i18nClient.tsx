"use client";

import { createContext, useCallback, useContext, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, type Lang } from "../i18n";
import { portalStrings, type PortalStrings } from "./portalStrings";

/* ════════════════════════════════════════════════════════════════════════════
   LA LANGUE DE L'ESPACE, distribuée par contexte.

   Pourquoi un contexte plutôt qu'une prop `lang` passée de composant en
   composant : l'espace compte dix composants imbriqués sur trois niveaux. Une
   prop traversante s'oublie quelque part, et l'oubli ne se voit pas — le
   composant continue d'afficher du français, au milieu d'une page anglaise.
   Ici, un composant qui ne demande pas la langue n'a simplement rien à traduire.

   ── Le changement de langue ─────────────────────────────────────────────────
   Il ne suffit PAS de changer un état React. Les pages de l'espace sont
   `force-dynamic` : les libellés du serveur (métadonnées, données préparées,
   pages sans JavaScript) ne se retraduisent qu'au prochain rendu serveur. Le
   bouton écrit donc le cookie — le même que le site public — puis demande à
   Next de refaire le rendu. `useTransition` garde l'écran en place pendant ce
   temps au lieu de le vider.
   ════════════════════════════════════════════════════════════════════════════ */

type Ctx = {
  lang: Lang;
  t: PortalStrings;
  setLang: (l: Lang) => void;
  /** Vrai le temps que le serveur renvoie la page dans l'autre langue. */
  switching: boolean;
};

const PortalI18n = createContext<Ctx | null>(null);

export function PortalI18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const router = useRouter();
  const [switching, start] = useTransition();

  const setLang = useCallback(
    (l: Lang) => {
      if (l === lang) return;
      // Un an : c'est une préférence, pas une session.
      document.cookie = `${LANG_COOKIE}=${l};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      try {
        localStorage.setItem(LANG_COOKIE, l);
      } catch {
        // Navigation privée, stockage refusé : le cookie suffit, on n'insiste pas.
      }
      document.documentElement.lang = l;
      start(() => router.refresh());
    },
    [lang, router],
  );

  return (
    <PortalI18n.Provider value={{ lang, t: portalStrings(lang), setLang, switching }}>
      {children}
    </PortalI18n.Provider>
  );
}

/** La langue et le vocabulaire de l'espace. À n'appeler que sous le fournisseur. */
export function usePortalI18n(): Ctx {
  const ctx = useContext(PortalI18n);
  if (!ctx) throw new Error("usePortalI18n hors de PortalI18nProvider");
  return ctx;
}
