import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionView from "@/components/shop/CollectionView";
import { CATEGORIES, getCategory } from "@/lib/shop/catalog";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ categorie: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string }>;
}): Promise<Metadata> {
  const { categorie } = await params;
  const cat = getCategory(categorie);
  if (!cat) return {};
  return {
    title: `${cat.name} · Ines Garden`,
    description: `${cat.name} en fonte de fer — ${cat.description} ${cat.count} pièces, dès ${cat.priceFrom} €. Livraison offerte.`,
    openGraph: { title: `${cat.name} · Ines Garden`, images: cat.hero ? [{ url: cat.hero }] : undefined },
  };
}

export default async function CategoriePage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie } = await params;
  if (!getCategory(categorie)) notFound();
  return <CollectionView slug={categorie} />;
}
