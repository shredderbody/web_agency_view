import type { Metadata } from "next";
import MaisonEphemere from "@/components/MaisonEphemere";

export const metadata: Metadata = {
  title: "Maison Éphémère · Wedding & Event Planner à Paris",
  description:
    "Wedding & event planner à Paris (Le Marais) : mariages clé en main, décoration & scénographie florale, coordination jour J et événements privés. Rendez-vous découverte offert. Démo de vitrine signée Atelier Vitrine.",
  openGraph: {
    title: "Maison Éphémère · Wedding & Event Planner à Paris",
    description:
      "Mariages clé en main, décoration florale et coordination jour J. Votre jour, orchestré dans le moindre détail. Démo de vitrine signée Atelier Vitrine.",
    images: [{ url: "/clients/maison-ephemere/photo_00.webp" }],
  },
};

export default function Page() {
  return <MaisonEphemere />;
}
