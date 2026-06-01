import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DemoView from "@/components/DemoView";
import { getVitrine, VITRINE_SLUGS } from "@/lib/vitrineContent";
import { ui, DEFAULT_LANG } from "@/lib/i18n";

export function generateStaticParams() {
  return VITRINE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = getVitrine(DEFAULT_LANG, slug);
  if (!v) return {};
  return {
    title: `${v.business} · ${v.trade}`,
    description: `${v.heroLead} ${ui[DEFAULT_LANG].demoCommon.metaSuffix}`,
  };
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!VITRINE_SLUGS.includes(slug)) notFound();
  return <DemoView slug={slug} />;
}
