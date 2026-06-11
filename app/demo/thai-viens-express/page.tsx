import type { Metadata } from "next";
import ThaiVienExpress from "@/components/ThaiVienExpress";

export const metadata: Metadata = {
  title: "Thaï Vien Express · Restaurant thaïlandais à Courbevoie",
  description:
    "Cuisine thaïlandaise authentique à Courbevoie : Pad Kapao, Massaman, Khao Pad, Bo Bun. Plats à 10,50 €, midi et soir. 4,7/5 sur 424 avis Google. Démo de vitrine signée Atelier Vitrine.",
  openGraph: {
    title: "Thaï Vien Express · Restaurant thaïlandais à Courbevoie",
    description:
      "Le vrai goût de la Thaïlande au cœur de Courbevoie. Plats à 10,50 €, midi et soir. 4,7/5 sur 424 avis Google.",
    images: [{ url: "/clients/thai-viens-express/photo_00.webp" }],
  },
};

export default function Page() {
  return <ThaiVienExpress />;
}
