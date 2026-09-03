import { NextRequest, NextResponse } from "next/server";
import { canAccess, currentSession } from "@/lib/portal/auth";
import { getTenant, getTenantByAssistant } from "@/lib/portal/registry";
import {
  getReservation, logAction, patchReservation, refreshCustomerCounters,
} from "@/lib/portal/ledger";
import type { ActionName, ReservationStatus } from "@/lib/portal/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ════════════════════════════════════════════════════════════════════════════
   PATCH /api/portal/reservations — agir sur une réservation depuis l'espace.

   Toute modification suit la même discipline que les actions de l'assistant :
   on écrit l'état dans `demo_reservations` ET une ligne d'action dans
   `demo_actions`. Une réservation ne change jamais d'état sans laisser de trace
   — c'est toute la raison d'être de ce module.
   ════════════════════════════════════════════════════════════════════════════ */

const STATUS_ACTION: Record<string, ActionName> = {
  confirmed: "booking_confirmed",
  cancelled: "booking_cancelled",
  done: "booking_completed",
  no_show: "booking_no_show",
  pending: "customer_updated",
  rescheduled: "booking_rescheduled",
};

type Body = {
  id?: string;
  status?: ReservationStatus;
  startsAt?: string | null;
  note?: string | null;
  partySize?: number | null;
  service?: string | null;
};

export async function PATCH(req: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const reservation = await getReservation(body.id);
  if (!reservation) return NextResponse.json({ error: "introuvable" }, { status: 404 });

  const tenant = getTenantByAssistant(reservation.assistant_id);
  if (!tenant) return NextResponse.json({ error: "tenant inconnu" }, { status: 404 });
  if (!canAccess(session, tenant.slug)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const actorLabel = session.role === "admin" ? "Administrateur" : tenant.business;
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {};
  let action: ActionName | null = null;
  let toStatus: ReservationStatus | null = null;

  // 1. Report de créneau — l'action la plus riche : on garde avant ET après.
  const reschedules =
    body.startsAt !== undefined && body.startsAt !== reservation.starts_at;
  if (reschedules) {
    patch.starts_at = body.startsAt;
    // Un report réactive une réservation annulée : sinon on la verrait
    // « annulée » alors qu'un créneau vient d'être reposé.
    toStatus = body.status ?? (reservation.status === "cancelled" ? "rescheduled" : "rescheduled");
    action = "booking_rescheduled";
  }

  // 2. Changement de statut explicite.
  if (body.status && body.status !== reservation.status) {
    toStatus = body.status;
    if (!action) action = STATUS_ACTION[body.status] ?? "customer_updated";
    if (body.status === "cancelled") patch.cancelled_at = now;
    if (reservation.status === "cancelled" && body.status !== "cancelled") patch.cancelled_at = null;
  }

  if (body.partySize !== undefined) patch.party_size = body.partySize;
  if (body.service !== undefined) patch.service = body.service;
  if (body.note !== undefined && body.note !== reservation.notes) {
    patch.notes = body.note;
    if (!action) action = "note_added";
  }
  if (toStatus) patch.status = toStatus;

  if (!action) return NextResponse.json({ ok: true, unchanged: true, reservation });

  const updated = await patchReservation(reservation.id, patch);

  await logAction({
    tenant,
    action,
    actor: "portal",
    actorLabel,
    occurredAt: now,
    reservationId: reservation.id,
    customerId: reservation.customer_id,
    fromStartsAt: reschedules ? reservation.starts_at : null,
    toStartsAt: reschedules ? (body.startsAt ?? null) : null,
    fromStatus: toStatus ? reservation.status : null,
    toStatus,
    customerName: reservation.customer_name,
    customerPhone: reservation.customer_phone,
    partySize: body.partySize ?? reservation.party_size,
    service: body.service ?? reservation.service,
    note: body.note ?? null,
  });

  if (reservation.customer_id) await refreshCustomerCounters(reservation.customer_id);

  return NextResponse.json({ ok: true, reservation: updated ?? reservation });
}

/** GET /api/portal/reservations?slug=… — rafraîchissement de la liste sans rechargement. */
export async function GET(req: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const slug = req.nextUrl.searchParams.get("slug") ?? session.slug;
  const tenant = getTenant(slug);
  if (!tenant) return NextResponse.json({ error: "tenant inconnu" }, { status: 404 });
  if (!canAccess(session, slug)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { listReservations } = await import("@/lib/portal/ledger");
  return NextResponse.json({ reservations: await listReservations(tenant.assistantId) });
}
