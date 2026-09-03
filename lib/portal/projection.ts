// ⚠️ MODULE SERVEUR UNIQUEMENT.

import { select, update, q } from "./supabase";
import { getTenantByAssistant, type DemoTenant } from "./registry";
import { normalizePhone } from "./phone";
import { parseSlot } from "./time";
import {
  createReservation, findActiveReservation, logAction, patchReservation,
  refreshCustomerCounters, upsertCustomer,
} from "./ledger";
import type { ActionName } from "./types";

/* ════════════════════════════════════════════════════════════════════════════
   PROJECTION : boîte de réception brute → journal d'actions.

   `public.demo_bookings` est ce que le workflow n8n sait écrire : un tool call
   Vapi = une ligne, charge utile brute, aucun état. C'est une boîte de
   réception, pas un modèle de suivi. Cette projection la déverse, ligne par
   ligne, dans les trois tables qui portent réellement la traçabilité :
   `demo_customers` (qui), `demo_reservations` (quoi, maintenant),
   `demo_actions` (ce qui s'est passé, et quand).

   IDEMPOTENTE. Deux garde-fous se recouvrent volontairement :
     • `demo_bookings.projected_at` — le curseur, pour ne relire que le neuf ;
     • l'index unique `demo_actions.tool_call_id` — le filet, si le curseur est
       remis à zéro ou si deux synchros se croisent.
   Relancer la projection dix fois de suite doit produire exactement le même
   journal qu'une seule fois.
   ════════════════════════════════════════════════════════════════════════════ */

type RawBooking = {
  id: string;
  created_at: string;
  tool: string | null;
  payload: unknown;
  meta: unknown;
  domain_name: string | null;
  assistant_id: string | null;
  assistant_name: string | null;
  call_id: string | null;
  tool_call_id: string | null;
  source: string | null;
  environment: string | null;
  calendar_id: string | null;
};

/**
 * n8n écrit parfois le payload en jsonb « chaîne JSON » plutôt qu'en objet
 * (vérifié en base le 2026-09-03 : `"payload":"{\"prenom\":…}"`). On accepte les
 * deux formes, sinon la moitié des lignes serait projetée sans coordonnées.
 */
function asObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (typeof value === "object") return value as Record<string, unknown>;
  return {};
}

function str(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number") return String(v);
  return null;
}

function int(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

/** Nom du function tool Vapi → action du journal. */
export function actionForTool(tool: string | null): ActionName {
  const t = (tool ?? "").toLowerCase();
  if (t.includes("annul")) return "booking_cancelled";
  if (t.includes("modifi") || t.includes("report") || t.includes("resched")) {
    return "booking_rescheduled";
  }
  if (t.includes("confirm")) return "booking_confirmed";
  if (t.includes("commande")) return "order_placed";
  if (t.includes("intervention")) return "intervention_requested";
  if (t.includes("devis") || t.includes("quote")) return "quote_requested";
  return "booking_created";
}

/** Le canal d'origine, déduit de l'identifiant d'appel Vapi. */
function channelOf(raw: RawBooking): string {
  if (!raw.call_id) return "web";
  return raw.call_id.startsWith("chat") ? "chat" : "voice";
}

export type ProjectionResult = {
  scanned: number;
  projected: number;
  skipped: number;
  errors: { rowId: string; message: string }[];
};

/**
 * Projette les lignes brutes non encore traitées.
 * `reprocess` rejoue TOUT l'historique (le filet `tool_call_id` évite les
 * doublons) : utile après un changement de règle de mapping.
 */
export async function projectPendingBookings(
  opts: { limit?: number; reprocess?: boolean; assistantId?: string } = {},
): Promise<ProjectionResult> {
  const limit = opts.limit ?? 500;
  const filters = [
    "select=id,created_at,tool,payload,meta,domain_name,assistant_id,assistant_name,call_id," +
      "tool_call_id,source,environment,calendar_id",
    opts.reprocess ? "" : "projected_at=is.null",
    opts.assistantId ? `assistant_id=eq.${q(opts.assistantId)}` : "",
    "order=created_at.asc",
    `limit=${limit}`,
  ].filter(Boolean);

  const rows = await select<RawBooking>("demo_bookings", filters.join("&"));
  const result: ProjectionResult = { scanned: rows.length, projected: 0, skipped: 0, errors: [] };

  for (const raw of rows) {
    try {
      const done = await projectRow(raw);
      if (done) result.projected += 1;
      else result.skipped += 1;
    } catch (err) {
      result.errors.push({
        rowId: raw.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return result;
}

async function projectRow(raw: RawBooking): Promise<boolean> {
  // Sans assistant_id, la ligne n'appartient à aucun tenant : on la marque
  // traitée pour ne pas la relire à chaque synchro, mais on ne journalise rien.
  const tenant: DemoTenant | null = raw.assistant_id
    ? getTenantByAssistant(raw.assistant_id)
    : null;
  if (!tenant) {
    await markProjected(raw.id, null);
    return false;
  }

  // Filet d'idempotence : ce tool call a-t-il déjà produit une action ?
  if (raw.tool_call_id) {
    const seen = await select<{ id: string }>(
      "demo_actions",
      `select=id&tool_call_id=eq.${q(raw.tool_call_id)}&limit=1`,
    );
    if (seen.length > 0) {
      await markProjected(raw.id, null);
      return false;
    }
  }

  const payload = asObject(raw.payload);
  const meta = asObject(raw.meta);
  const action = actionForTool(raw.tool);
  const occurredAt = raw.created_at;
  const environment = raw.environment ?? "prod";

  const nameParts = [str(payload.prenom), str(payload.nom)].filter(Boolean);
  const customerName = nameParts.length ? nameParts.join(" ") : str(payload.nom_complet);
  const phoneRaw = str(payload.telephone) ?? str(payload.phone);
  const phone = normalizePhone(phoneRaw, tenant.dialCode);

  const slot = parseSlot(payload.date, payload.heure, tenant.timezone, new Date(occurredAt));
  const previousSlot = parseSlot(
    payload.ancienne_date ?? payload.date_actuelle,
    payload.ancienne_heure ?? payload.heure_actuelle,
    tenant.timezone,
    new Date(occurredAt),
  );

  const customer = await upsertCustomer(tenant, {
    phoneRaw,
    name: customerName,
    email: str(payload.email),
    lang: str(payload.langue),
    seenAt: occurredAt,
  });

  const partySize =
    int(payload.nombre_personnes) ?? int(payload.nombre_couverts) ?? int(payload.couverts);
  const service =
    str(payload.prestation) ?? str(payload.commande) ?? str(payload.nature_probleme) ??
    str(payload.service) ?? str(payload.projet);
  const note = str(payload.note) ?? str(payload.commentaire) ?? str(payload.precisions);

  let reservationId: string | null = null;
  let fromStartsAt: string | null = null;
  let fromStatus: string | null = null;
  let toStatus: string | null = null;

  if (action === "booking_rescheduled" || action === "booking_cancelled") {
    // Un report ou une annulation vise une réservation existante : on la
    // retrouve par le téléphone du client (et l'ancien créneau s'il l'a donné).
    const target = await findActiveReservation(tenant.assistantId, phone, previousSlot);
    if (target) {
      reservationId = target.id;
      fromStartsAt = target.starts_at;
      fromStatus = target.status;
      toStatus = action === "booking_cancelled" ? "cancelled" : "rescheduled";
      await patchReservation(target.id, {
        starts_at: action === "booking_cancelled" ? target.starts_at : (slot ?? target.starts_at),
        status: toStatus,
        cancelled_at: action === "booking_cancelled" ? occurredAt : null,
        ...(note ? { notes: note } : {}),
      });
    } else if (action === "booking_rescheduled" && slot) {
      // Report d'une réservation qu'on n'a jamais vue (créée avant la mise en
      // place du journal) : on matérialise l'état d'arrivée plutôt que de perdre
      // le rendez-vous. L'action, elle, reste bien un report.
      const created = await createReservation({
        tenant, customerId: customer?.id, startsAt: slot, partySize, service,
        customerName, customerPhone: phone, origin: raw.source === "n8n" ? "n8n" : "assistant",
        callId: raw.call_id, firstToolCallId: raw.tool_call_id, calendarId: raw.calendar_id,
        notes: note, createdAt: occurredAt, environment, domainName: raw.domain_name,
      });
      reservationId = created?.id ?? null;
      toStatus = "rescheduled";
    }
  } else {
    const created = await createReservation({
      tenant, customerId: customer?.id, startsAt: slot, partySize, service,
      customerName, customerPhone: phone, origin: raw.source === "n8n" ? "n8n" : "assistant",
      callId: raw.call_id, firstToolCallId: raw.tool_call_id, calendarId: raw.calendar_id,
      notes: note, createdAt: occurredAt, environment, domainName: raw.domain_name,
    });
    reservationId = created?.id ?? null;
    toStatus = "pending";
  }

  await logAction({
    tenant, action, actor: raw.source === "n8n" ? "n8n" : "assistant",
    actorLabel: raw.assistant_name ?? str(meta.workflow),
    channel: channelOf(raw),
    occurredAt, reservationId, customerId: customer?.id ?? null,
    fromStartsAt, toStartsAt: slot, fromStatus, toStatus,
    customerName, customerPhone: phone,
    partySize, service, note,
    tool: raw.tool, callId: raw.call_id, toolCallId: raw.tool_call_id,
    sourceRowId: raw.id, environment, domainName: raw.domain_name,
  });

  if (customer) await refreshCustomerCounters(customer.id);
  await markProjected(raw.id, reservationId);
  return true;
}

async function markProjected(rowId: string, reservationId: string | null): Promise<void> {
  await update("demo_bookings", `id=eq.${q(rowId)}`, {
    projected_at: new Date().toISOString(),
    ...(reservationId ? { reservation_id: reservationId } : {}),
  });
}
