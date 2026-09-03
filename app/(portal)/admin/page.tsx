import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  accessCodeFor, currentSession, isTestAccountEnabled, testAccountFor,
} from "@/lib/portal/auth";
import { loadAdminDashboard, type PeriodDays } from "@/lib/portal/dashboard";
import { LOGIN_PATH, spaceHref } from "@/lib/portal/paths";
import AdminBoard from "@/components/portal/AdminBoard";

/* `/admin` — l'espace de l'agence : les douze vitrines d'un coup d'œil.
   Une vitrine, elle, vit sur `/<slug>/admin`. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

function periodOf(raw: string | undefined): PeriodDays {
  const n = Number(raw);
  return n === 7 || n === 90 ? n : 30;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const session = await currentSession();

  if (!session) redirect(LOGIN_PATH);
  // Une session de client n'a rien à voir ici : on la renvoie chez elle.
  if (session.role !== "admin") redirect(spaceHref(session.slug));

  const data = await loadAdminDashboard(
    periodOf(p),
    accessCodeFor,
    (slug) => (isTestAccountEnabled() ? testAccountFor(slug) : null),
  );
  return <AdminBoard data={data} />;
}
