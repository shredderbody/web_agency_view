import type { Metadata } from "next";
import TexasPlumbing from "@/components/TexasPlumbing";

export const metadata: Metadata = {
  title: "Texas Plumbing Pros · Plombier à Gun Barrel City (Cedar Creek Lake, TX)",
  description:
    "Plombier à Gun Barrel City, TX (322 N Gun Barrel Ln) : chauffe-eau, fuites, débouchage, canalisations d'égout, gaz. Entreprise familiale depuis 2014, licence RMP #41426, service d'urgence 24/7. 4,9/5 sur Google. Démo de vitrine signée Atelier Vitrine.",
  openGraph: {
    title: "Texas Plumbing Pros · Plombier à Gun Barrel City, TX",
    description:
      "Chauffe-eau, fuites, débouchage et urgences 24/7 — 322 N Gun Barrel Ln, Gun Barrel City. Démo de vitrine signée Atelier Vitrine.",
    images: [{ url: "/clients/texas-plumbing-pros/photo_04.webp" }],
  },
};

export default function Page() {
  return <TexasPlumbing />;
}
