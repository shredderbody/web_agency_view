import type { Metadata } from "next";
import LakNailSalon from "@/components/LakNailSalon";

export const metadata: Metadata = {
  title: "L.A.K Nail Salon · Onglerie à New York (Lafayette St)",
  description:
    "Onglerie à New York, 176 Lafayette St (NoLita) : pose Gel-X, vernis gel, poudre dip, ombré et nail art sur-mesure. Ouvert 7j/7 jusqu'à 20h30. 4,5/5 sur Google. Démo de vitrine signée Atelier Vitrine.",
  openGraph: {
    title: "L.A.K Nail Salon · Onglerie à New York",
    description:
      "Gel-X, vernis gel, poudre dip et nail art sur-mesure — 176 Lafayette St, ouvert 7j/7. Démo de vitrine signée Atelier Vitrine.",
    images: [{ url: "/clients/lak-nail-salon/photo_00.webp" }],
  },
};

export default function Page() {
  return <LakNailSalon />;
}
