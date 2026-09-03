/* Types partagés entre le serveur (lecture Supabase) et les composants client
   de l'espace. Volontairement plats : ce qui traverse la frontière serveur →
   client est du JSON sérialisable, pas des objets Date. */

export type ActionName =
  | "booking_created"
  | "booking_rescheduled"
  | "booking_cancelled"
  | "booking_confirmed"
  | "booking_completed"
  | "booking_no_show"
  | "order_placed"
  | "intervention_requested"
  | "quote_requested"
  | "customer_updated"
  | "note_added"
  | "contacted";

export type Actor = "assistant" | "portal" | "n8n" | "api" | "system";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "done"
  | "no_show";

export type PortalAction = {
  id: string;
  occurred_at: string;
  assistant_id: string;
  demo_slug: string | null;
  reservation_id: string | null;
  customer_id: string | null;
  action: ActionName;
  actor: Actor;
  actor_label: string | null;
  channel: string | null;
  from_starts_at: string | null;
  to_starts_at: string | null;
  from_status: string | null;
  to_status: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  party_size: number | null;
  service: string | null;
  note: string | null;
  tool: string | null;
  call_id: string | null;
  tool_call_id: string | null;
};

export type PortalReservation = {
  id: string;
  assistant_id: string;
  demo_slug: string | null;
  customer_id: string | null;
  reference: string | null;
  starts_at: string | null;
  original_starts_at: string | null;
  duration_min: number | null;
  party_size: number | null;
  service: string | null;
  status: ReservationStatus;
  customer_name: string | null;
  customer_phone: string | null;
  origin: string;
  call_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
};

export type PortalCustomer = {
  id: string;
  assistant_id: string;
  demo_slug: string | null;
  phone: string;
  phone_raw: string | null;
  full_name: string | null;
  email: string | null;
  lang: string | null;
  first_seen_at: string;
  last_seen_at: string;
  actions_count: number;
  bookings_count: number;
  cancels_count: number;
  notes: string | null;
};

export type UsageDay = {
  day: string;
  calls: number;
  call_seconds: number;
  call_cost: number;
  chats: number;
  chat_messages: number;
  chat_cost: number;
};

/** Consommation agrégée sur une période, telle que l'affiche l'espace. */
export type UsageSummary = {
  from: string;
  to: string;
  days: UsageDay[];
  calls: number;
  callSeconds: number;
  callCost: number;
  chats: number;
  chatMessages: number;
  chatCost: number;
  /** Actions enregistrées sur la période — le rendement de la consommation. */
  actions: number;
  bookings: number;
  cancels: number;
  reschedules: number;
};
