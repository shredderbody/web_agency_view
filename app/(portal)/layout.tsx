import type { Metadata } from "next";
import "./espace.css";

export const metadata: Metadata = {
  title: "Espace client",
  description: "Suivi de consommation et des réservations des démonstrations Atelier Vitrine.",
  // Un espace protégé n'a rien à faire dans un index de moteur de recherche.
  robots: { index: false, follow: false },
};

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  return <div className="esp">{children}</div>;
}
