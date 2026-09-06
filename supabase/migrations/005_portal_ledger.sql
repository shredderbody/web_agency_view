-- 005 — Traçabilité COMPLÈTE DES ACTIONS + fiche client (espace `/espace/[slug]`).
--
-- Consigne (2026-09-03) : « traçabilité complète des ACTIONS — pas du contenu de
-- discussion, mais des actions : booking, annulation, reschedule… — et le client
-- avec ses coordonnées pour le suivi. Stockage dans Supabase puis relecture
-- depuis Supabase. »
--
-- Donc : on ne stocke NI transcript NI contenu de conversation. Une action =
-- une ligne. Trois tables, un rôle chacune :
--
--   public.demo_bookings      (déjà là)  BOÎTE DE RÉCEPTION BRUTE. n8n y écrit
--                                        un tool call = une ligne. Intouchée.
--   public.demo_customers     (nouveau)  FICHE CLIENT par tenant : coordonnées,
--                                        première/dernière venue, compteurs.
--   public.demo_reservations  (nouveau)  ÉTAT COURANT d'une réservation : le
--                                        créneau qui fait foi, aujourd'hui.
--   public.demo_actions       (nouveau)  JOURNAL IMMUABLE : qui a fait quoi,
--                                        quand, et avant → après. Jamais modifié,
--                                        jamais supprimé. C'est la traçabilité.
--
-- Alimentation : une PROJECTION idempotente (POST /api/portal/sync) lit les
-- lignes de `demo_bookings` non encore projetées et les déverse dans les trois
-- tables. Clé d'idempotence : `demo_actions.tool_call_id` (unique). Les actions
-- faites depuis l'espace client écrivent directement dans `demo_actions` +
-- `demo_reservations`, sans passer par `demo_bookings`.
--
-- ⚠️ À appliquer sur les DEUX projets Supabase (cf. en-tête de la 004).
-- Idempotent, rejouable.

-- ── 1. Fiche client ──────────────────────────────────────────────────────────

create table if not exists public.demo_customers (
  id            uuid primary key default gen_random_uuid(),
  assistant_id  text not null,
  demo_slug     text,

  -- Identité de dédoublonnage : le téléphone normalisé E.164.
  phone         text not null,
  phone_raw     text,
  full_name     text,
  email         text,
  lang          text,
  actions_count integer not null default 0,
  bookings_count integer not null default 0,
  cancels_count integer not null default 0,

  -- Note interne de l'exploitant (jamais renvoyée à l'assistant).
  notes         text,
  environment   text not null default 'prod',
  domain_name   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

-- Un client = un téléphone, PAR tenant. Deux commerces distincts peuvent avoir
-- le même client sans se voir : c'est le cloisonnement multi-tenant.
create unique index if not exists demo_customers_tenant_phone_uidx
  on public.demo_customers (assistant_id, phone);
create index if not exists demo_customers_tenant_recent_idx
  on public.demo_customers (assistant_id, last_seen_at desc);
create index if not exists demo_customers_demo_slug_idx on public.demo_customers (demo_slug);

alter table public.demo_customers enable row level security;

comment on table public.demo_customers is
  'Fiche client par tenant de démo. Coordonnées + compteurs de suivi. Dédoublonnée sur (assistant_id, phone) où phone est normalisé E.164. Aucun contenu de conversation.';
comment on column public.demo_customers.phone is
  'Téléphone normalisé E.164 (ex. +33612345678) — CLÉ DE DÉDOUBLONNAGE. Normalisation côté app (lib/portal/phone.ts) avec l''indicatif du tenant.';
comment on column public.demo_customers.phone_raw is
  'Téléphone tel que dicté par le client, avant normalisation. Conservé pour lever un doute.';
comment on column public.demo_customers.actions_count is
  'Nombre total d''actions du client (créations + reports + annulations…). Recalculé par la projection.';

-- ── 2. État courant d'une réservation ────────────────────────────────────────

create table if not exists public.demo_reservations (
  id            uuid primary key default gen_random_uuid(),
  assistant_id  text not null,
  demo_slug     text,
  customer_id   uuid references public.demo_customers (id) on delete set null,

  -- Référence courte lisible à l'oral (« votre réservation ABC-123 »).
  reference     text,
  duration_min  integer,
  party_size    integer,
  service       text,

  status        text not null default 'pending',

  -- Coordonnées dénormalisées : la liste et le calendrier s'affichent sans jointure.
  customer_name  text,
  customer_phone text,

  -- Traçabilité de l'origine.
  origin        text not null default 'assistant',
  call_id       text,
  first_tool_call_id text,
  calendar_id   text,
  notes         text,

  environment   text not null default 'prod',
  domain_name   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Le créneau qui FAIT FOI aujourd'hui. Reflète le dernier reschedule.
  starts_at     timestamptz,
  -- Créneau d'origine, jamais réécrit : permet de voir la dérive d'un bout à l'autre.
  original_starts_at timestamptz,
  cancelled_at  timestamptz
);

do $$
begin
  alter table public.demo_reservations
    add constraint demo_reservations_status_chk
    check (status in ('pending', 'confirmed', 'rescheduled', 'cancelled', 'done', 'no_show'));
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.demo_reservations
    add constraint demo_reservations_origin_chk
    check (origin in ('assistant', 'portal', 'n8n', 'api'));
exception
  when duplicate_object then null;
end
$$;

-- Vue calendrier d'un tenant : « ce mois-ci, chez ce client ».
create index if not exists demo_reservations_tenant_slot_idx
  on public.demo_reservations (assistant_id, starts_at);
create index if not exists demo_reservations_tenant_recent_idx
  on public.demo_reservations (assistant_id, created_at desc);
create index if not exists demo_reservations_customer_idx on public.demo_reservations (customer_id);
create index if not exists demo_reservations_status_idx   on public.demo_reservations (status);
create unique index if not exists demo_reservations_first_tool_call_uidx
  on public.demo_reservations (first_tool_call_id)
  where first_tool_call_id is not null;

alter table public.demo_reservations enable row level security;

comment on table public.demo_reservations is
  'ÉTAT COURANT d''une réservation de démo (le créneau qui fait foi aujourd''hui). L''historique des changements n''est PAS ici : il est dans public.demo_actions. Reconstruite par projection depuis demo_bookings, ou créée/éditée depuis l''espace client.';
comment on column public.demo_reservations.original_starts_at is
  'Créneau posé à la création. Jamais réécrit par un report : starts_at - original_starts_at donne la dérive totale.';
comment on column public.demo_reservations.origin is
  'Qui a créé la réservation : assistant (Vapi) | portal (espace client) | n8n | api.';

-- ── 3. Journal immuable des actions ──────────────────────────────────────────

create table if not exists public.demo_actions (
  id             uuid primary key default gen_random_uuid(),

  assistant_id   text not null,
  demo_slug      text,
  reservation_id uuid references public.demo_reservations (id) on delete set null,
  customer_id    uuid references public.demo_customers (id) on delete set null,

  -- CE QUI S'EST PASSÉ.
  action         text not null,
  -- QUI l'a fait.
  actor          text not null default 'assistant',
  actor_label    text,
  channel        text,
  from_status    text,
  to_status      text,

  -- Identité du client au moment de l'action (figée : une fiche qui change plus
  -- tard ne réécrit pas l'histoire).
  customer_name  text,
  customer_phone text,

  -- Détail métier utile à l'exploitant, sans contenu de conversation.
  party_size     integer,
  service        text,
  note           text,

  -- Traçabilité technique.
  tool           text,
  call_id        text,
  tool_call_id   text,
  source_row_id  uuid,
  environment    text not null default 'prod',
  domain_name    text,
  occurred_at    timestamptz not null default now(),

  -- AVANT → APRÈS (renseigné pour un report, un changement de statut, etc.).
  from_starts_at timestamptz,
  to_starts_at   timestamptz
);

do $$
begin
  alter table public.demo_actions
    add constraint demo_actions_action_chk
    check (action in (
      'booking_created', 'booking_rescheduled', 'booking_cancelled',
      'booking_confirmed', 'booking_completed', 'booking_no_show',
      'order_placed', 'intervention_requested', 'quote_requested',
      'customer_updated', 'note_added', 'contacted'
    ));
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.demo_actions
    add constraint demo_actions_actor_chk
    check (actor in ('assistant', 'portal', 'n8n', 'api', 'system'));
exception
  when duplicate_object then null;
end
$$;

-- Idempotence de la projection : un tool call Vapi ne produit qu'UNE action.
create unique index if not exists demo_actions_tool_call_uidx
  on public.demo_actions (tool_call_id)
  where tool_call_id is not null;

-- Le journal d'un tenant, du plus récent au plus ancien, sans tri en mémoire.
create index if not exists demo_actions_tenant_recent_idx
  on public.demo_actions (assistant_id, occurred_at desc);
create index if not exists demo_actions_reservation_idx on public.demo_actions (reservation_id, occurred_at);
create index if not exists demo_actions_customer_idx    on public.demo_actions (customer_id, occurred_at desc);
create index if not exists demo_actions_action_idx      on public.demo_actions (action);
create index if not exists demo_actions_occurred_idx    on public.demo_actions (occurred_at desc);

alter table public.demo_actions enable row level security;

comment on table public.demo_actions is
  'JOURNAL IMMUABLE des actions de démo : création, report, annulation, confirmation, commande, demande d''intervention, note, relance. Une action = une ligne, jamais modifiée ni supprimée. AUCUN contenu de conversation n''y est stocké — uniquement le fait, son auteur, son horodatage et le avant → après.';
comment on column public.demo_actions.actor is
  'Auteur de l''action : assistant (l''agent Vapi au téléphone/chat) | portal (un humain dans /espace) | n8n | api | system (projection).';
comment on column public.demo_actions.channel is
  'Canal de l''action côté assistant : voice | chat | web. NULL pour une action faite depuis l''espace.';
comment on column public.demo_actions.source_row_id is
  'id de la ligne public.demo_bookings dont cette action a été projetée. Permet de remonter à la charge utile brute du tool call.';
comment on column public.demo_actions.tool_call_id is
  'ID du tool call Vapi. Index unique partiel : garde-fou d''idempotence de la projection.';

-- ── 4. Curseur de projection sur la boîte de réception brute ─────────────────

alter table public.demo_bookings add column if not exists projected_at   timestamptz;
alter table public.demo_bookings add column if not exists reservation_id uuid;

-- « Les lignes brutes qu'il reste à projeter », en un index.
create index if not exists demo_bookings_unprojected_idx
  on public.demo_bookings (created_at)
  where projected_at is null;

comment on column public.demo_bookings.projected_at is
  'Horodatage de la projection de cette ligne brute vers demo_actions / demo_reservations / demo_customers. NULL = pas encore traitée par POST /api/portal/sync.';
comment on column public.demo_bookings.reservation_id is
  'Réservation (public.demo_reservations) créée ou touchée par cette ligne brute.';
