import type { Metadata } from "next";
import InesGarden from "@/components/InesGarden";

export const metadata: Metadata = {
  title: "Ines Garden · Ornements de jardin en fonte, style Médicis (Chalezeule)",
  description:
    "Les Jardins d'Inès : vases et vasques Médicis, jardinières, bacs à oranger, fontaines et statues en fonte de fer. Reproductions patinées des grands jardins à la française, livrées gratuitement partout en France. Boutique notée 5/5 sur Google. Démo de vitrine signée Atelier Vitrine.",
  openGraph: {
    title: "Ines Garden · Les Jardins d'Inès — fonte de fer, style Médicis",
    description:
      "Vases Médicis, fontaines et statues en fonte de fer — livraison offerte partout en France. Démo de vitrine signée Atelier Vitrine.",
    images: [{ url: "/clients/ines-garden/photo_00.webp" }],
  },
};

export default function Page() {
  return <InesGarden />;
}
