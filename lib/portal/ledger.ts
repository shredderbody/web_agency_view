// ⚠️ MODULE SERVEUR UNIQUEMENT.

import { select, insert, update, upsert, q } from "./supabase";
import { normalizePhone } from "./phone";
import type {
  ActionName, Actor, PortalAction, PortalCustomer, PortalReservation, ReservationStatus,
} from "./types";
import type { DemoTenant } from "./registry";

/* ════════════════════════════════════════════════════════════════════════════
   Lecture et écriture du journal d'actions.

   Règle du modèle, valable partout dans ce fichier :
   `demo_actions` est IMMUABLE. On n'y fait jamais d'UPDATE ni de DELETE. Changer
   l'état d'une réservation, c'est écrire UNE ligne d'action de plus, puis
   refléter le nouvel état dans `demo_reservations`. C'est ce qui rend le suivi
   auditable : l'historique ne peut pas être réécrit après coup.
   ════════════════════════════════════════════════════════════════════════════ */

const ACTION_COLS =
  "id,occurred_at,assistant_id,demo_slug,reservation_id,customer_id,action,actor,actor_label," +
  "channel,from_starts_at,to_starts_at,from_status,to_status,customer_name,customer_phone," +
  "party_size,service,note,tool,call_id,tool_call_id";

const RESERVATION_COLS =
  "id,assistant_id,demo_slug,customer_id,reference,starts_at,original_starts_at,duration_min," +
  "party_size,service,status,customer_name,customer_phone,origin,call_id,notes,created_at," +
  "updated_at,cancelled_at";

const CUSTOMER_COLS =
  "id,assistant_id,demo_slug,phone,phone_raw,full_name,email,lang,first_seen_at,last_seen_at," +
  "actions_count,bookings_count,cancels_count,notes";

/* ── Lectures ─────────────────────────────────────────────────────────────── */

/** Journal d'un tenant, du plus récent au plus ancien. */
export function listActions(assistantId: string, limit = 200): Promise<PortalAction[]> {
  return select<PortalAction>(
    "demo_actions",
    `select=${ACTION_COLS}&assistant_id=eq.${q(assistantId)}&order=occurred_at.desc&limit=${limit}`,
  );
}

/** Journal de TOUTES les démos — vue administrateur. */
export function listAllActions(limit = 300): Promise<PortalAction[]> {
  return select<PortalAction>(
    "demo_actions",
    `select=${ACTION_COLS}&order=occurred_at.desc&limit=${limit}`,
  );
}

/** Historique d'une réservation précise, du plus ancien au plus récent. */
export function listActionsForReservation(reservationId: string): Promise<PortalAction[]> {
  return select<PortalAction>(
    "demo_actions",
    `select=${ACTION_COLS}&reservation_id=eq.${q(reservationId)}&order=occurred_at.asc`,
  );
}

export function listReservations(assistantId: string, limit = 500): Promise<PortalReservation[]> {
  return select<PortalReservation>(
    "demo_reservations",
    `select=${RESERVATION_COLS}&assistant_id=eq.${q(assistantId)}&order=starts_at.desc.nullslast&limit=${limit}`,
  );
}

export function listAllReservations(limit = 800): Promise<PortalReservation[]> {
  return select<PortalReservation>(
    "demo_reservations",
    `select=${RESERVATION_COLS}&order=starts_at.desc.nullslast&limit=${limit}`,
  );
}

export function listCustomers(assistantId: string, limit = 400): Promise<PortalCustomer[]> {
  return select<PortalCustomer>(
    "demo_customers",
    `select=${CUSTOMER_COLS}&assistant_id=eq.${q(assistantId)}&order=last_seen_at.desc&limit=${limit}`,
  );
}

export function listAllCustomers(limit = 800): Promise<PortalCustomer[]> {
  return select<PortalCustomer>(
    "demo_customers",
    `select=${CUSTOMER_COLS}&order=last_seen_at.desc&limit=${limit}`,
  );
}

export async function getReservation(id: string): Promise<PortalReservation | null> {
  const rows = await select<PortalReservation>(
    "demo_reservations",
    `select=${RESERVATION_COLS}&id=eq.${q(id)}&limit=1`,
  );
  return rows[0] ?? null;
}

/* ── Fiche client ─────────────────────────────────────────────────────────── */

export type CustomerInput = {
  phoneRaw?: string | null;
  name?: string | null;
  email?: string | null;
  lang?: string | null;
  seenAt?: string;
};

/**
 * Trouve ou crée la fiche client, et rafraîchit ses coordonnées.
 * Dédoublonnage sur (assistant_id, phone normalisé) : c'est l'UPSERT qui garantit
 * qu'un client qui rappelle ne crée pas une deuxième fiche.
 * Renvoie `null` si le client n'a pas laissé de téléphone — auquel cas l'action
 * est quand même journalisée, simplement sans fiche rattachée.
 */
export async function upsertCustomer(
  tenant: DemoTenant, input: CustomerInput,
): Promise<PortalCustomer | null> {
  const phone = normalizePhone(input.phoneRaw, tenant.dialCode);
  if (!phone) return null;
  const seenAt = input.seenAt ?? new Date().toISOString();

  const existing = await select<PortalCustomer>(
    "demo_customers",
    `select=${CUSTOMER_COLS}&assistant_id=eq.${q(tenant.assistantId)}&phone=eq.${q(phone)}&limit=1`,
  );

  if (existing[0]) {
    const prev = existing[0];
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    // On ne réécrit une coordonnée que si la nouvelle apporte quelque chose :
    // un appel où le client ne redonne pas son email ne doit pas l'effacer.
    if (input.name && input.name !== prev.full_name) patch.full_name = input.name;
    if (input.email && input.email !== prev.email) patch.email = input.email;
    if (input.lang && input.lang !== prev.lang) patch.lang = input.lang;
    if (seenAt > prev.last_seen_at) patch.last_seen_at = seenAt;
    if (seenAt < prev.first_seen_at) patch.first_seen_at = seenAt;
    const rows = await update<PortalCustomer>(
      "demo_customers",
      `id=eq.${q(prev.id)}&select=${CUSTOMER_COLS}`,
      patch,
    );
    return rows[0] ?? prev;
  }

  const rows = await upsert<PortalCustomer>(
    "demo_customers",
    [{
      assistant_id: tenant.assistantId,
      demo_slug: tenant.slug,
      phone,
      phone_raw: input.phoneRaw ?? null,
      full_name: input.name ?? null,
      email: input.email ?? null,
      lang: input.lang ?? null,
      first_seen_at: seenAt,
      last_seen_at: seenAt,
    }],
    "assistant_id,phone",
  );
  return rows[0] ?? null;
}

/** Recompte les compteurs de suivi d'une fiche à partir du journal (source de vérité). */
export async function refreshCustomerCounters(customerId: string): Promise<void> {
  const actions = await select<{ action: ActionName }>(
    "demo_actions",
    `select=action&customer_id=eq.${q(customerId)}&limit=1000`,
  );
  await update("demo_customers", `id=eq.${q(customerId)}`, {
    actions_count: actions.length,
    bookings_count: actions.filter(
      (a) => a.action === "booking_created" || a.action === "order_placed" ||
             a.action === "intervention_requested",
    ).length,
    cancels_count: actions.filter((a) => a.action === "booking_cancelled").length,
    updated_at: new Date().toISOString(),
  });
}

/* ── Écriture d'une action ────────────────────────────────────────────────── */

export type ActionInput = {
  tenant: DemoTenant;
  action: ActionName;
  actor: Actor;
  actorLabel?: string | null;
  channel?: string | null;
  occurredAt?: string;
  reservationId?: string | null;
  customerId?: string | null;
  fromStartsAt?: string | null;
  toStartsAt?: string | null;
  fromStatus?: string | null;
  toStatus?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  partySize?: number | null;
  service?: string | null;
  note?: string | null;
  tool?: string | null;
  callId?: string | null;
  toolCallId?: string | null;
  sourceRowId?: string | null;
  environment?: string;
  domainName?: string | null;
};

/** Ajoute une ligne au journal. Ne met JAMAIS à jour une ligne existante. */
export async function logAction(input: ActionInput): Promise<PortalAction | null> {
  const rows = await insert<PortalAction>("demo_actions", [{
    occurred_at: input.occurredAt ?? new Date().toISOString(),
    assistant_id: input.tenant.assistantId,
    demo_slug: input.tenant.slug,
    reservation_id: input.reservationId ?? null,
    customer_id: input.customerId ?? null,
    action: input.action,
    actor: input.actor,
    actor_label: input.actorLabel ?? null,
    channel: input.channel ?? null,
    from_starts_at: input.fromStartsAt ?? null,
    to_starts_at: input.toStartsAt ?? null,
    from_status: input.fromStatus ?? null,
    to_status: input.toStatus ?? null,
    customer_name: input.customerName ?? null,
    customer_phone: input.customerPhone ?? null,
    party_size: input.partySize ?? null,
    service: input.service ?? null,
    note: input.note ?? null,
    tool: input.tool ?? null,
    call_id: input.callId ?? null,
    tool_call_id: input.toolCallId ?? null,
    source_row_id: input.sourceRowId ?? null,
    environment: input.environment ?? "prod",
    domain_name: input.domainName ?? null,
  }]);
  return rows[0] ?? null;
}

/* ── Écriture d'une réservation ───────────────────────────────────────────── */

export type ReservationInput = {
  tenant: DemoTenant;
  customerId?: string | null;
  startsAt?: string | null;
  partySize?: number | null;
  service?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  origin?: string;
  callId?: string | null;
  firstToolCallId?: string | null;
  calendarId?: string | null;
  notes?: string | null;
  createdAt?: string;
  environment?: string;
  domainName?: string | null;
};

/** Référence courte, lisible à l'oral (« votre réservation R7K-4M2 »). */
function makeReference(): string {
  const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
  return `${s.slice(0, 3)}-${s.slice(3)}`;
}

export async function createReservation(input: ReservationInput): Promise<PortalReservation | null> {
  const now = input.createdAt ?? new Date().toISOString();
  const rows = await insert<PortalReservation>("demo_reservations", [{
    assistant_id: input.tenant.assistantId,
    demo_slug: input.tenant.slug,
    customer_id: input.customerId ?? null,
    reference: makeReference(),
    starts_at: input.startsAt ?? null,
    original_starts_at: input.startsAt ?? null,
    party_size: input.partySize ?? null,
    service: input.service ?? null,
    status: "pending",
    customer_name: input.customerName ?? null,
    customer_phone: input.customerPhone ?? null,
    origin: input.origin ?? "assistant",
    call_id: input.callId ?? null,
    first_tool_call_id: input.firstToolCallId ?? null,
    calendar_id: input.calendarId ?? null,
    notes: input.notes ?? null,
    created_at: now,
    updated_at: now,
    environment: input.environment ?? "prod",
    domain_name: input.domainName ?? null,
  }]);
  return rows[0] ?? null;
}

export async function patchReservation(
  id: string, patch: Record<string, unknown>,
): Promise<PortalReservation | null> {
  const rows = await update<PortalReservation>(
    "demo_reservations",
    `id=eq.${q(id)}&select=${RESERVATION_COLS}`,
    { ...patch, updated_at: new Date().toISOString() },
  );
  return rows[0] ?? null;
}

/**
 * Retrouve la réservation visée par un report ou une annulation dictés au
 * téléphone. Le client ne connaît pas d'identifiant : il redonne son numéro, et
 * parfois l'ancien créneau. On cherche donc, chez ce tenant, la réservation
 * encore active de ce téléphone — en préférant celle dont le créneau correspond
 * à l'ancien créneau annoncé, puis la plus proche dans le temps.
 */
export async function findActiveReservation(
  assistantId: string, phone: string | null, previousSlot: string | null,
): Promise<PortalReservation | null> {
  if (!phone) return null;
  const rows = await select<PortalReservation>(
    "demo_reservations",
    `select=${RESERVATION_COLS}&assistant_id=eq.${q(assistantId)}&customer_phone=eq.${q(phone)}` +
      `&status=in.(pending,confirmed,rescheduled)&order=starts_at.desc.nullslast&limit=20`,
  );
  if (rows.length === 0) return null;
  if (previousSlot) {
    const exact = rows.find((r) => r.starts_at === previousSlot);
    if (exact) return exact;
    // Tolérance : le client donne « 14h » quand la base a 14h00 d'un autre jour.
    const sameDay = rows.find(
      (r) => r.starts_at && r.starts_at.slice(0, 10) === previousSlot.slice(0, 10),
    );
    if (sameDay) return sameDay;
  }
  return rows[0];
}

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "À confirmer",
  confirmed: "Confirmée",
  rescheduled: "Reportée",
  cancelled: "Annulée",
  done: "Honorée",
  no_show: "Non venu",
};

export const ACTION_LABEL: Record<ActionName, string> = {
  booking_created: "Réservation prise",
  booking_rescheduled: "Créneau reporté",
  booking_cancelled: "Réservation annulée",
  booking_confirmed: "Réservation confirmée",
  booking_completed: "Client honoré",
  booking_no_show: "Client absent",
  order_placed: "Commande passée",
  intervention_requested: "Intervention demandée",
  quote_requested: "Devis demandé",
  customer_updated: "Fiche client mise à jour",
  note_added: "Note ajoutée",
  contacted: "Client recontacté",
};
