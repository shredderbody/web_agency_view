import { NextRequest, NextResponse } from "next/server";
import { canAccess, currentSession } from "@/lib/portal/auth";
import { getTenant } from "@/lib/portal/registry";
import { listActions, listActionsForReservation, listAllActions } from "@/lib/portal/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* GET /api/portal/actions?slug=…            → journal du tenant
   GET /api/portal/actions?reservation=<id>  → historique d'une réservation
   GET /api/portal/actions?slug=admin        → journal de toutes les démos       */

export async function GET(req: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const reservation = params.get("reservation");
  if (reservation) {
    const actions = await listActionsForReservation(reservation);
    // Le journal d'une réservation n'est lisible que par son tenant.
    const slug = actions[0]?.demo_slug ?? session.slug;
    if (!canAccess(session, slug)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    return NextResponse.json({ actions });
  }

  const slug = params.get("slug") ?? session.slug;
  const limit = Math.min(Number(params.get("limit") ?? 200) || 200, 500);

  if (slug === "admin") {
    if (session.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
    return NextResponse.json({ actions: await listAllActions(limit) });
  }

  const tenant = getTenant(slug);
  if (!tenant) return NextResponse.json({ error: "tenant inconnu" }, { status: 404 });
  if (!canAccess(session, slug)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ actions: await listActions(tenant.assistantId, limit) });
}
