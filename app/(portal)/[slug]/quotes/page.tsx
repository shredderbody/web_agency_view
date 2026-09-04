import type { Metadata } from "next";
import { loadQuotesPage } from "@/lib/portal/quotesPage";
import DocumentsWorkspace from "@/components/portal/DocumentsWorkspace";
import "../../documents.css";

/* `/<slug>/quotes` — L'ADRESSE CANONIQUE de l'outil de devis d'une vitrine.

   Même forme que `/<slug>/admin` : le client retient « mon site, puis /quotes ».
   `/<slug>/devis` mène exactement au même endroit, en français.

   La langue, ici, n'est pas dans l'URL : elle suit la préférence du visiteur
   (cookie `av_lang`, comme partout sur le site). C'est ce qui fait de `/quotes`
   l'adresse par défaut — celle qu'on donne sans avoir à se demander qui la
   recevra. */

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
  return <DocumentsWorkspace data={await loadQuotesPage(slug)} />;
}
