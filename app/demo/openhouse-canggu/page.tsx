import type { Metadata } from "next";
import OpenHouseCanggu from "@/components/OpenHouseCanggu";

export const metadata: Metadata = {
  title: "Open House Café · Café en plein air à Pererenan (Canggu, Bali)",
  description:
    "Café tout-en-plein-air à Pererenan, au cœur de Canggu (Bali) : brunch all-day, bowls healthy, burgers, smoothies et cocktails, sous un toit de rotin. Ouvert tous les jours 7h–23h, 4,6/5 sur Google (1 053 avis). Démo de vitrine signée Atelier Vitrine.",
  openGraph: {
    title: "Open House Café · Pererenan, Canggu — Bali",
    description:
      "Brunch all-day, bowls healthy et cocktails sous les manguiers — Jl. Munduk Tengah, Pererenan. Démo de vitrine signée Atelier Vitrine.",
    images: [{ url: "/clients/openhouse-canggu/photo_00.webp" }],
  },
};

export default function Page() {
  return <OpenHouseCanggu />;
}
