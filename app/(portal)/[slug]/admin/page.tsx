import type { Metadata } from "next";
import { loadSpaceHome } from "@/lib/portal/spaceHome";
import SpaceHome from "@/components/portal/SpaceHome";

/* `/<slug>/admin` — L'ACCUEIL d'une vitrine, après connexion.

   C'est l'adresse qu'on donne au client — « votre site, puis /admin » — et
   c'est celle qu'il a déjà. Elle ne mène plus directement au tableau de bord
   mais à un choix entre les deux outils que son code d'accès ouvre : le SUIVI
   (`/<slug>/dashboard`) et les DEVIS (`/<slug>/quotes`).

   Ce détour d'un clic est le point de la page : tant qu'on atterrissait sur le
   tableau de bord, rien ne disait que l'outil de devis existait derrière le
   même code. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SpaceHome data={await loadSpaceHome(slug)} />;
}
