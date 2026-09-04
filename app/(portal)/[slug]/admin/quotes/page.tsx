import type { Metadata } from "next";
import { loadQuotesPage } from "@/lib/portal/quotesPage";
import QuotesApp from "@/components/portal/quotes/QuotesApp";
import "../../../documents.css";

/* `/<slug>/admin/quotes` — L'ADRESSE CANONIQUE de l'outil de devis.

   Elle est nichée sous `/<slug>/admin`, l'accueil : le client retient une seule
   adresse — « mon site, puis /admin » — et choisit son outil en arrivant. Le
   layout de ce segment porte la garde de session pour toutes les pages qu'il
   contient, celle-ci comprise.

   `/<slug>/admin/devis` mène exactement au même endroit, en français.

   La langue, ici, n'est pas dans l'URL : elle suit la préférence du visiteur
   (cookie `av_lang`, comme partout sur le site). C'est ce qui fait de
   `/admin/quotes` l'adresse par défaut — celle qu'on donne sans avoir à se
   demander qui la recevra. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Devis & factures",
  robots: { index: false, follow: false },
};

export default async function QuotesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <QuotesApp data={await loadQuotesPage(slug)} />;
}
