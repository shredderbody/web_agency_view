import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { canAccess, currentSession } from "@/lib/portal/auth";
import { getTenant } from "@/lib/portal/registry";
import { loadTenantDashboard, type PeriodDays } from "@/lib/portal/dashboard";
import { loginHref, spaceHref } from "@/lib/portal/paths";
import TenantDashboard from "@/components/portal/TenantDashboard";

/* `/<slug>/dashboard` — LE SUIVI d'une vitrine : ce que la standardiste a
   consommé, ce qui est réservé, ce qui s'est passé, qui sont les clients.

   L'accueil, lui, est resté sur `/<slug>/admin` : c'est l'adresse déjà
   communiquée aux clients, et elle présente maintenant les deux outils.

   Ce segment dynamique est à la racine : il attrape n'importe quel
   `/<mot>/dashboard`. Un mot qui n'est pas une vitrine connue est donc un 404
   franc, pas une redirection — répondre autre chose ferait de cette page un
   annuaire des démos existantes. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

function periodOf(raw: string | undefined): PeriodDays {
  const n = Number(raw);
  return n === 7 || n === 90 ? n : 30;
}

export default async function TenantDashboardPage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { slug } = await params;
  const { p } = await searchParams;

  const tenant = getTenant(slug);
  if (!tenant) notFound();

  const session = await currentSession();
  // Pas de session ou session expirée : retour au login avec la vitrine
  // pré-sélectionnée, pour ne pas rejouer le choix.
  if (!session) redirect(loginHref(slug));
  // L'espace d'un autre client : chacun chez soi (l'administrateur voit tout).
  if (!canAccess(session, slug)) redirect(spaceHref(session.slug));

  const data = await loadTenantDashboard(tenant, periodOf(p));
  return <TenantDashboard data={data} isAdmin={session.role === "admin"} />;
}
