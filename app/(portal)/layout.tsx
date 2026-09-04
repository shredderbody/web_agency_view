import type { Metadata } from "next";
import { portalLang } from "@/lib/portal/lang";
import { portalStrings } from "@/lib/portal/portalStrings";
import { PortalI18nProvider } from "@/lib/portal/i18nClient";
import "./espace.css";

export const metadata: Metadata = {
  title: "Espace client",
  description: "Suivi de consommation et des réservations des démonstrations Atelier Vitrine.",
  // Un espace protégé n'a rien à faire dans un index de moteur de recherche.
  robots: { index: false, follow: false },
};

/* La langue est lue ICI, une seule fois, et distribuée à tout l'espace.
   La lire dans chaque page reviendrait à la relire quatre fois pour la même
   requête, et à risquer qu'une page nouvelle oublie de le faire. */

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const lang = await portalLang();
  return (
    <PortalI18nProvider lang={lang}>
      <div className="esp" lang={portalStrings(lang).locale.slice(0, 2)}>
        {children}
      </div>
    </PortalI18nProvider>
  );
}
