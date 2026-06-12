import type { Metadata } from "next";
import BarberCourbevoie from "@/components/BarberCourbevoie";

export const metadata: Metadata = {
  title: "Barbershop · Barbier à Courbevoie (Av. Marceau)",
  description:
    "Barbier à Courbevoie, avenue Marceau : coupe, dégradé, taille de barbe et rasage à l'ancienne. Ouvert 7j/7 de 10h à 20h. 4,3/5 sur Google. Démo de vitrine signée Atelier Vitrine.",
  openGraph: {
    title: "Barbershop · Barbier à Courbevoie",
    description:
      "Coupe nette, barbe taillée, rasage à l'ancienne — avenue Marceau, ouvert 7j/7. Démo de vitrine signée Atelier Vitrine.",
    images: [{ url: "/clients/barbershop-courbevoie/photo_03.webp" }],
  },
};

export default function Page() {
  return <BarberCourbevoie />;
}
