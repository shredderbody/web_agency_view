import { NextRequest, NextResponse } from "next/server";
import { currentSession } from "@/lib/portal/auth";
import { projectPendingBookings } from "@/lib/portal/projection";
import { syncAllUsage, syncTenantUsage } from "@/lib/portal/usage";
import { getTenant } from "@/lib/portal/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/* ════════════════════════════════════════════════════════════════════════════
   POST /api/portal/sync — la synchronisation du suivi. Deux traitements :

     1. PROJECTION  — `demo_bookings` (ce que n8n a écrit) → journal d'actions.
     2. CONSOMMATION — API Vapi → `demo_usage_daily`.

   Deux façons de l'appeler :
     • depuis l'espace admin, session ouverte (bouton « Synchroniser ») ;
     • par un planificateur, en-tête `x-portal-sync-secret` = PORTAL_SYNC_SECRET
       (cron horaire recommandé : la rétention Vapi de 14 jours ne pardonne pas
       une longue absence de synchro).

   Idempotente : deux exécutions consécutives ne dupliquent rien.
   ════════════════════════════════════════════════════════════════════════════ */

async function authorize(req: NextRequest): Promise<boolean> {
  const secret = process.env.PORTAL_SYNC_SECRET;
  if (secret && req.headers.get("x-portal-sync-secret") === secret) return true;
  const session = await currentSession();
  return session?.role === "admin";
}

export async function POST(req: NextRequest) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const slug = params.get("slug");
  const reprocess = params.get("reprocess") === "1";
  const skipUsage = params.get("usage") === "0";
  const tenant = slug ? getTenant(slug) : null;

  const started = Date.now();
  const projection = await projectPendingBookings({
    reprocess,
    assistantId: tenant?.assistantId,
    limit: reprocess ? 2000 : 500,
  });

  const usage = skipUsage
    ? []
    : tenant
      ? [await syncTenantUsage(tenant)]
      : await syncAllUsage();

  return NextResponse.json({
    ok: true,
    ms: Date.now() - started,
    projection,
    usage,
  });
}

/** GET : même chose, pour un cron qui ne sait faire que des GET. */
export async function GET(req: NextRequest) {
  return POST(req);
}
