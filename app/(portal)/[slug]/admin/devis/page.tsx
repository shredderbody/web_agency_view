import type { Metadata } from "next";
import { loadQuotesPage } from "@/lib/portal/quotesPage";
import QuotesApp from "@/components/portal/quotes/QuotesApp";
import "../../../documents.css";

/* `/<slug>/admin/devis` — la même pièce, par la porte française.

   Ce n'est pas une redirection vers `/admin/quotes` : une adresse qu'on donne à
   un artisan français doit rester dans sa langue dans sa barre d'adresse, et
   arriver en français sans dépendre d'un cookie. La langue est donc FORCÉE ici,
   là où `/admin/quotes` suit la préférence du visiteur. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Devis & factures",
  robots: { index: false, follow: false },
};

export default async function DevisPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <QuotesApp data={await loadQuotesPage(slug, "fr")} />;
}
