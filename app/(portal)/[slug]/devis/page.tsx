import type { Metadata } from "next";
import { loadQuotesPage } from "@/lib/portal/quotesPage";
import DocumentsWorkspace from "@/components/portal/DocumentsWorkspace";
import "../../documents.css";

/* `/<slug>/devis` — la même pièce, par la porte française.

   Ce n'est pas une redirection vers `/quotes` : une adresse qu'on donne à un
   artisan français doit rester dans sa langue dans sa barre d'adresse, et
   arriver en français sans dépendre d'un cookie. La langue est donc FORCÉE ici,
   là où `/quotes` suit la préférence du visiteur. */

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
  return <DocumentsWorkspace data={await loadQuotesPage(slug, "fr")} />;
}
