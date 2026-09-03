import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  accessCodeFor, canAccess, currentSession, isTestAccountEnabled, testAccountFor,
} from "@/lib/portal/auth";
import { ADMIN_SLUG, getTenant } from "@/lib/portal/registry";
import { loadAdminDashboard, loadTenantDashboard, type PeriodDays } from "@/lib/portal/dashboard";
import TenantDashboard from "@/components/portal/TenantDashboard";
import AdminBoard from "@/components/portal/AdminBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

function periodOf(raw: string | undefined): PeriodDays {
  const n = Number(raw);
  return n === 7 || n === 90 ? n : 30;
}

export default async function EspacePage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { slug } = await params;
  const { p } = await searchParams;
  const period = periodOf(p);

  const session = await currentSession();
  // Pas de session, session expirée, ou espace d'un autre client : retour au
  // login avec le slug pré-sélectionné, pour ne pas rejouer le choix.
  if (!session) redirect(`/espace/login?demo=${encodeURIComponent(slug)}`);
  if (!canAccess(session, slug)) redirect(`/espace/${session.slug}`);

  if (slug === ADMIN_SLUG) {
    if (session.role !== "admin") redirect(`/espace/${session.slug}`);
    const data = await loadAdminDashboard(
      period,
      accessCodeFor,
      (s) => (isTestAccountEnabled() ? testAccountFor(s) : null),
    );
    return <AdminBoard data={data} />;
  }

  const tenant = getTenant(slug);
  if (!tenant) redirect(session.role === "admin" ? "/espace/admin" : "/espace/login");

  const data = await loadTenantDashboard(tenant, period);
  return <TenantDashboard data={data} isAdmin={session.role === "admin"} />;
}
