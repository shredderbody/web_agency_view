import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/shop/ProductDetail";
import { PRODUCTS, getProduct } from "@/lib/shop/catalog";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ categorie: p.category, produit: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string; produit: string }>;
}): Promise<Metadata> {
  const { categorie, produit } = await params;
  const p = getProduct(categorie, produit);
  if (!p) return {};
  return {
    title: `${p.name} · Ines Garden`,
    description: p.description
      ? `${p.description} ${p.price} € · Livraison offerte.`
      : `${p.name} en fonte — ${p.price} €. Livraison offerte.`,
    openGraph: { title: `${p.name} · Ines Garden`, images: p.img ? [{ url: p.img }] : undefined },
  };
}

export default async function ProduitPage({
  params,
}: {
  params: Promise<{ categorie: string; produit: string }>;
}) {
  const { categorie, produit } = await params;
  if (!getProduct(categorie, produit)) notFound();
  return <ProductDetail category={categorie} slug={produit} />;
}
