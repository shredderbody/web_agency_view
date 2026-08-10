import type { Metadata } from "next";
import CollectionsIndex from "@/components/shop/CollectionsIndex";

export const metadata: Metadata = {
  title: "Toutes les collections · Ines Garden",
  description:
    "Les huit collections d'ornements de jardin en fonte des Jardins d'Inès : vases et vasques Médicis, fontaines, statues, bacs à oranger, jardinières, têtes de cheval et salons de jardin.",
};

export default function CollectionsPage() {
  return <CollectionsIndex />;
}
