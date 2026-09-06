-- ═══════════════════════════════════════════════════════════════════════════════
--  web_agency_view — SCHÉMA COMPLET, RECONSTRUIT DEPUIS TOUS LES FICHIERS SQL
--
--  Ce fichier est un INSTANTANÉ : l'état d'arrivée de supabase/business_leads.sql
--  et des migrations 001 → 009, à jour au 2026-09-06. Il se joue seul sur une
--  base neuve et donne exactement le même schéma que la suite des migrations.
--
--  À RÉACTUALISER à chaque nouvelle migration. En cas d'écart entre ce fichier
--  et les migrations numérotées, ce sont les migrations qui font foi.
--
--  Entièrement idempotent : `if not exists` partout, `drop … if exists` avant
--  chaque policy et chaque trigger, contraintes sous garde `duplicate_object`.
--  Il peut donc être rejoué, et surtout joué sur une base qui contient DÉJÀ le
--  schéma d'un autre projet — c'est la condition de la fusion des cinq bases.
--
--  ORDRE DES COLONNES — la même grille dans les cinq projets, pour qu'un
--  `select *` et une lecture de `\d table` se ressemblent partout :
--     1. `id`                       — clé primaire
--     2. clés de rattachement       — assistant_id, customer_id, document_id…
--     3. colonnes métier            — groupées par thème
--     4. traçabilité                — project_name, domain_name
--     5. horodatage                 — created_at, updated_at, puis les dates
--                                     d'état (cancelled_at, paid_at…)
--  Attention : Postgres ne sait PAS réordonner les colonnes d'une table qui
--  existe déjà (`alter table` ajoute toujours à la fin). L'ordre ci-dessous ne
--  s'applique donc qu'aux bases créées par ce fichier ; sur une base existante
--  il reste la référence de lecture et d'écriture des requêtes — raison de plus
--  pour lister les colonnes explicitement plutôt que d'écrire `select *`.
--
--  CLÉ DE TENANT : `assistant_id` (l'assistant Vapi du client démo) pour toutes
--  les tables `demo_*` de l'espace client, `place_id` pour les vitrines.
--
--  Tables : project_registry, business_leads, demo_bookings, demo_customers,
--           demo_reservations, demo_actions, demo_documents, demo_usage_daily,
--           demo_catalog_categories, demo_catalog_items, demo_doc_settings,
--           demo_voice_sessions
-- ═══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. REGISTRE DES PROJETS (migration 009)
--    Recense les projets dont le schéma vit dans cette base. Une seule ligne =
--    base mono-projet ; plusieurs = base fusionnée.
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.project_registry (
  project_name  text primary key,
  domain_name   text,
  repo          text,
  registered_at timestamptz not null default now()
);
alter table public.project_registry enable row level security;

insert into public.project_registry (project_name, repo)
values ('web_agency_view', 'https://github.com/shredderbody/web_agency_view')
on conflict (project_name) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── business_leads ────────────────────────────────────────────────────────────
-- Leads « entreprise » captés depuis le widget de la landing page. Alimentée
-- côté serveur (service_role) via /api/leads, depuis l'API Google Places
-- (source='google') ou la saisie manuelle (source='manual').
-- Table PARTAGÉE avec receptionist, qui y ajoute le tunnel de démo (colonnes
-- `assistant_*`, `twilio_number`) et le rapprochement Stripe — cf. 008.
create table if not exists public.business_leads (
  id                    uuid primary key default gen_random_uuid(),

  -- Identité
  place_id              text,
  source                text not null default 'google',   -- 'google' | 'manual'
  lang                  text,
  name                  text not null,

  -- Métier
  primary_type          text,
  primary_type_display  text,
  types                 text[],
  sector                text,

  -- Adresse
  formatted_address     text,
  street_number         text,
  route                 text,
  locality              text,
  postal_code           text,
  admin_area            text,
  country               text,

  -- Géolocalisation
  latitude              double precision,
  longitude             double precision,

  -- Contact
  phone_national        text,
  phone_international   text,
  email                 text,
  website               text,
  google_maps_uri       text,

  -- Réputation
  rating                numeric,
  user_rating_count     integer,
  opening_hours         text[],           -- une ligne par jour, texte lisible
  reviews               jsonb,            -- note + texte + auteur + date relative
  business_status       text,

  -- Suivi commercial (édité depuis le dashboard Supabase par l'agence)
  status                text not null default 'new',
  notes                 text,

  -- Tunnel de démo receptionist (migrations receptionist 024 / 025, ici 008)
  assistant_language        text,
  assistant_voice_name      text,
  assistant_voice_gender    text,
  assistant_temp_id         text,
  vapi_assistant_id         text,
  twilio_number             text,
  stripe_customer_id        text,
  stripe_checkout_session_id text,

  domain_name           text,
  created_at            timestamptz not null default now()
);

-- `business_leads` porte le même nom dans plusieurs projets. Si l'un d'eux a créé la
-- table en premier, le CREATE TABLE ci-dessus n'a rien fait : on garantit donc
-- ici la présence de chacune de nos colonnes avant de s'en servir plus bas.
ALTER TABLE public.business_leads
  ADD COLUMN IF NOT EXISTS place_id                   text,
  ADD COLUMN IF NOT EXISTS source                     text not null default 'google',
  ADD COLUMN IF NOT EXISTS lang                       text,
  ADD COLUMN IF NOT EXISTS name                       text,
  ADD COLUMN IF NOT EXISTS primary_type               text,
  ADD COLUMN IF NOT EXISTS primary_type_display       text,
  ADD COLUMN IF NOT EXISTS types                      text[],
  ADD COLUMN IF NOT EXISTS sector                     text,
  ADD COLUMN IF NOT EXISTS formatted_address          text,
  ADD COLUMN IF NOT EXISTS street_number              text,
  ADD COLUMN IF NOT EXISTS route                      text,
  ADD COLUMN IF NOT EXISTS locality                   text,
  ADD COLUMN IF NOT EXISTS postal_code                text,
  ADD COLUMN IF NOT EXISTS admin_area                 text,
  ADD COLUMN IF NOT EXISTS country                    text,
  ADD COLUMN IF NOT EXISTS latitude                   double precision,
  ADD COLUMN IF NOT EXISTS longitude                  double precision,
  ADD COLUMN IF NOT EXISTS phone_national             text,
  ADD COLUMN IF NOT EXISTS phone_international        text,
  ADD COLUMN IF NOT EXISTS email                      text,
  ADD COLUMN IF NOT EXISTS website                    text,
  ADD COLUMN IF NOT EXISTS google_maps_uri            text,
  ADD COLUMN IF NOT EXISTS rating                     numeric,
  ADD COLUMN IF NOT EXISTS user_rating_count          integer,
  ADD COLUMN IF NOT EXISTS opening_hours              text[],
  ADD COLUMN IF NOT EXISTS reviews                    jsonb,
  ADD COLUMN IF NOT EXISTS business_status            text,
  ADD COLUMN IF NOT EXISTS status                     text not null default 'new',
  ADD COLUMN IF NOT EXISTS notes                      text,
  ADD COLUMN IF NOT EXISTS assistant_language         text,
  ADD COLUMN IF NOT EXISTS assistant_voice_name       text,
  ADD COLUMN IF NOT EXISTS assistant_voice_gender     text,
  ADD COLUMN IF NOT EXISTS assistant_temp_id          text,
  ADD COLUMN IF NOT EXISTS vapi_assistant_id          text,
  ADD COLUMN IF NOT EXISTS twilio_number              text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id         text,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS domain_name                text,
  ADD COLUMN IF NOT EXISTS created_at                 timestamptz not null default now();

alter table public.business_leads drop constraint if exists business_leads_status_check;
alter table public.business_leads
  add constraint business_leads_status_check check (status in ('new', 'contacted', 'converted', 'lost'));

-- ── demo_bookings ─────────────────────────────────────────────────────────────
-- JOURNAL BRUT des tool calls des assistants Vapi de démo : une ligne par
-- appel de fonction, jamais mise à jour par l'assistant. Deux voies d'écriture :
-- le workflow n8n (source='n8n') et POST /api/vapi/booking (source='api').
-- L'espace client projette ensuite ces lignes vers demo_actions /
-- demo_reservations / demo_customers.
create table if not exists public.demo_bookings (
  id             uuid primary key default gen_random_uuid(),

  -- CLÉ DE TENANT : l'assistant Vapi du client démo.
  assistant_id   text,
  reservation_id uuid,
  demo_slug      text,

  -- Function tool appelé : enregistrer_rendezvous | enregistrer_reservation |
  -- enregistrer_commande | enregistrer_intervention.
  tool           text,
  payload        jsonb,          -- arguments bruts renvoyés par l'assistant
  meta           jsonb,          -- contexte serveur : { slug, ts }

  assistant_name text,
  call_id        text,
  tool_call_id   text,
  source         text,           -- 'n8n' | 'api'
  environment    text not null default 'dev',
  calendar_id    text default 'hello@zerocall.io',
  limit_creneau  integer not null default 1,

  -- Cycle de vie côté espace client
  status         text not null default 'pending',
  starts_at      timestamptz,
  customer_name  text,
  customer_phone text,
  notes          text,

  domain_name    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  projected_at   timestamptz
);

do $$ begin
  alter table public.demo_bookings
    add constraint demo_bookings_environment_chk check (environment in ('dev', 'rec', 'prod'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.demo_bookings
    add constraint demo_bookings_status_chk
    check (status in ('pending', 'confirmed', 'cancelled', 'done', 'no_show'));
exception when duplicate_object then null;
end $$;

-- ── demo_customers ────────────────────────────────────────────────────────────
-- Fiche client par tenant. Dédoublonnée sur (assistant_id, phone), phone
-- normalisé E.164. Aucun contenu de conversation.
create table if not exists public.demo_customers (
  id             uuid primary key default gen_random_uuid(),

  assistant_id   text not null,
  demo_slug      text,

  phone          text not null,   -- E.164 — CLÉ DE DÉDOUBLONNAGE
  phone_raw      text,            -- tel que dicté, avant normalisation
  full_name      text,
  email          text,
  lang           text,

  address        text,
  postal_code    text,
  city           text,
  company        text,
  siret          text,
  source         text,

  -- Compteurs recalculés par la projection
  actions_count  integer not null default 0,
  bookings_count integer not null default 0,
  cancels_count  integer not null default 0,
  notes          text,

  environment    text not null default 'prod',
  domain_name    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now()
);

-- ── demo_reservations ─────────────────────────────────────────────────────────
-- ÉTAT COURANT d'une réservation (le créneau qui fait foi aujourd'hui).
-- L'historique des changements n'est PAS ici : il est dans demo_actions.
create table if not exists public.demo_reservations (
  id                 uuid primary key default gen_random_uuid(),

  assistant_id       text not null,
  customer_id        uuid references public.demo_customers (id) on delete set null,
  demo_slug          text,

  reference          text,
  starts_at          timestamptz,
  duration_min       integer,
  party_size         integer,
  service            text,
  status             text not null default 'pending',

  customer_name      text,
  customer_phone     text,

  origin             text not null default 'assistant',  -- assistant|portal|n8n|api
  call_id            text,
  first_tool_call_id text,
  calendar_id        text,
  notes              text,

  environment        text not null default 'prod',
  domain_name        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- Créneau posé à la création : jamais réécrit par un report.
  -- starts_at - original_starts_at donne la dérive totale.
  original_starts_at timestamptz,
  cancelled_at       timestamptz
);

do $$ begin
  alter table public.demo_reservations
    add constraint demo_reservations_status_chk
    check (status in ('pending', 'confirmed', 'rescheduled', 'cancelled', 'done', 'no_show'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.demo_reservations
    add constraint demo_reservations_origin_chk
    check (origin in ('assistant', 'portal', 'n8n', 'api'));
exception when duplicate_object then null;
end $$;

-- ── demo_documents ────────────────────────────────────────────────────────────
-- DEVIS ET FACTURES d'une vitrine. Une seule table pour les deux natures
-- (colonne kind) : même en-tête, mêmes lignes, mêmes totaux, même gabarit.
create table if not exists public.demo_documents (
  id            uuid primary key default gen_random_uuid(),

  assistant_id  text not null,
  customer_id   uuid references public.demo_customers (id) on delete set null,
  source_id     uuid references public.demo_documents (id) on delete set null,
  demo_slug     text,

  kind          text not null,                    -- 'quote' | 'invoice'
  number        text not null,                    -- DEV-2026-0001 / FAC-2026-0001
  status        text not null default 'draft',
  lang          text not null default 'fr',
  currency      text not null default 'EUR',
  tax_label     text not null default 'TVA',
  issued_on     date not null default current_date,
  due_on        date,

  -- Destinataire FIGÉ à l'émission : la fiche client peut changer ensuite.
  client        jsonb not null default '{}'::jsonb,
  -- [{ id, kind: item|discount, label, desc, qty, unit_price, tax_rate, percent }]
  lines         jsonb not null default '[]'::jsonb,

  -- Totaux recalculés par le SERVEUR à chaque écriture, jamais par le navigateur.
  total_ht      numeric(12, 2) not null default 0,
  total_tax     numeric(12, 2) not null default 0,
  total_ttc     numeric(12, 2) not null default 0,
  notes         text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  sent_at       timestamptz,
  paid_at       timestamptz
);

do $$ begin
  alter table public.demo_documents
    add constraint demo_documents_kind_chk check (kind in ('quote', 'invoice'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.demo_documents
    add constraint demo_documents_status_chk
    check (status in ('draft', 'sent', 'accepted', 'refused', 'paid', 'cancelled'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.demo_documents
    add constraint demo_documents_currency_chk check (currency in ('EUR', 'USD', 'IDR'));
exception when duplicate_object then null;
end $$;

-- ── demo_actions ──────────────────────────────────────────────────────────────
-- JOURNAL IMMUABLE : une action = une ligne, jamais modifiée ni supprimée.
-- Aucun contenu de conversation — uniquement le fait, son auteur, son
-- horodatage et le avant → après.
create table if not exists public.demo_actions (
  id             uuid primary key default gen_random_uuid(),

  assistant_id   text not null,
  reservation_id uuid references public.demo_reservations (id) on delete set null,
  customer_id    uuid references public.demo_customers (id) on delete set null,
  document_id    uuid references public.demo_documents (id) on delete set null,
  source_row_id  uuid,                    -- id de la ligne demo_bookings projetée
  demo_slug      text,

  action         text not null,
  actor          text not null default 'assistant',  -- assistant|portal|n8n|api|system
  actor_label    text,
  channel        text,                    -- voice | chat | web

  from_starts_at timestamptz,
  to_starts_at   timestamptz,
  from_status    text,
  to_status      text,

  customer_name  text,
  customer_phone text,
  party_size     integer,
  service        text,
  note           text,

  tool           text,
  call_id        text,
  tool_call_id   text,

  environment    text not null default 'prod',
  domain_name    text,
  occurred_at    timestamptz not null default now()
);

do $$ begin
  alter table public.demo_actions drop constraint if exists demo_actions_action_chk;
  alter table public.demo_actions add constraint demo_actions_action_chk check (action in (
    'booking_created', 'booking_rescheduled', 'booking_cancelled',
    'booking_confirmed', 'booking_completed', 'booking_no_show',
    'order_placed', 'intervention_requested', 'quote_requested',
    'customer_updated', 'note_added', 'contacted',
    'quote_issued', 'quote_sent', 'quote_accepted', 'quote_refused',
    'invoice_issued', 'invoice_paid',
    'quote_dictated'
  ));
end $$;

do $$ begin
  alter table public.demo_actions
    add constraint demo_actions_actor_chk
    check (actor in ('assistant', 'portal', 'n8n', 'api', 'system'));
exception when duplicate_object then null;
end $$;

-- ── demo_usage_daily ──────────────────────────────────────────────────────────
-- Archive JOUR PAR JOUR de la consommation Vapi (appels + chats + coûts).
-- Raison d'être : le plan Vapi ne garde que 14 jours d'historique.
create table if not exists public.demo_usage_daily (
  id            uuid primary key default gen_random_uuid(),

  assistant_id  text not null,
  demo_slug     text,

  day           date not null,
  calls         integer not null default 0,
  call_seconds  integer not null default 0,        -- endedAt - startedAt cumulé
  call_cost     numeric(10, 4) not null default 0, -- USD, champ `cost` de l'API
  chats         integer not null default 0,
  chat_messages integer not null default 0,        -- user + assistant
  chat_cost     numeric(10, 4) not null default 0,

  environment   text not null default 'prod',
  domain_name   text,
  synced_at     timestamptz not null default now()
);

-- ── demo_catalog_categories / demo_catalog_items ──────────────────────────────
create table if not exists public.demo_catalog_categories (
  id           uuid primary key default gen_random_uuid(),

  assistant_id text not null,
  demo_slug    text,

  name         text not null,
  color        text not null default '#6366f1',
  position     integer not null default 0,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.demo_catalog_items (
  id             uuid primary key default gen_random_uuid(),

  assistant_id   text not null,
  category_id    uuid references public.demo_catalog_categories (id) on delete set null,
  demo_slug      text,

  name           text not null,
  description    text,
  unit_price     numeric not null default 0,
  tax_rate       numeric not null default 20,
  unit           text not null default 'unite',
  purchase_price numeric,
  to_quote       boolean not null default false,
  position       integer not null default 0,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── demo_doc_settings ─────────────────────────────────────────────────────────
-- En-tête et pied de page des documents, un enregistrement par tenant.
create table if not exists public.demo_doc_settings (
  assistant_id     text primary key,
  demo_slug        text,

  company_name     text,
  legal_form       text,
  siret            text,
  vat_number       text,
  address          text,
  postal_code      text,
  city             text,
  country          text,
  phone            text,
  email            text,
  website          text,
  logo_url         text,

  iban             text,
  bic              text,
  payment_method   text,
  payment_days     integer,
  validity_days    integer,
  tax_rate_default numeric,
  footer_notes     text,
  insurance_label  text,
  insurance_detail text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── demo_voice_sessions ───────────────────────────────────────────────────────
-- Dictée vocale d'un devis depuis l'espace client : transcription + lignes
-- extraites.
create table if not exists public.demo_voice_sessions (
  id           uuid primary key default gen_random_uuid(),

  assistant_id text not null,
  document_id  uuid references public.demo_documents (id) on delete cascade,
  demo_slug    text,

  transcript   text not null,
  result       jsonb not null default '[]'::jsonb,
  outcome      text not null default 'ok',

  created_at   timestamptz not null default now()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. INDEX
-- ═══════════════════════════════════════════════════════════════════════════════

-- business_leads
create index if not exists business_leads_created_at_idx         on public.business_leads (created_at desc);
create index if not exists business_leads_place_id_idx           on public.business_leads (place_id);
create index if not exists business_leads_domain_name_idx        on public.business_leads (domain_name);
create index if not exists business_leads_status_idx             on public.business_leads (status);
create index if not exists business_leads_twilio_number_idx      on public.business_leads (twilio_number);
create index if not exists business_leads_assistant_temp_id_idx  on public.business_leads (assistant_temp_id);
create index if not exists business_leads_vapi_assistant_id_idx  on public.business_leads (vapi_assistant_id);
create index if not exists business_leads_stripe_customer_id_idx on public.business_leads (stripe_customer_id);

-- demo_bookings — la clé de tenant seule, puis en composite pour lister
-- l'historique d'un client démo sans tri en mémoire.
create index if not exists demo_bookings_created_at_idx    on public.demo_bookings (created_at desc);
create index if not exists demo_bookings_tool_idx          on public.demo_bookings (tool);
create index if not exists demo_bookings_domain_name_idx   on public.demo_bookings (domain_name);
create index if not exists demo_bookings_assistant_id_idx  on public.demo_bookings (assistant_id);
create index if not exists demo_bookings_tenant_recent_idx on public.demo_bookings (assistant_id, created_at desc);
create index if not exists demo_bookings_call_id_idx       on public.demo_bookings (call_id);
create index if not exists demo_bookings_source_idx        on public.demo_bookings (source);
create index if not exists demo_bookings_environment_idx   on public.demo_bookings (environment);
create index if not exists demo_bookings_status_idx        on public.demo_bookings (status);
create index if not exists demo_bookings_starts_at_idx     on public.demo_bookings (starts_at);
create index if not exists demo_bookings_demo_slug_idx     on public.demo_bookings (demo_slug);
create index if not exists demo_bookings_tenant_calendar_idx on public.demo_bookings (assistant_id, starts_at);
create index if not exists demo_bookings_unprojected_idx   on public.demo_bookings (created_at) where projected_at is null;
-- Un tool call Vapi ne doit produire qu'une ligne, même sur rejeu du POST.
-- Partiel : les écritures historiques de /api/vapi/booking n'ont pas d'id.
create unique index if not exists demo_bookings_tool_call_id_uidx
  on public.demo_bookings (tool_call_id) where tool_call_id is not null;

-- demo_customers
create unique index if not exists demo_customers_tenant_phone_uidx on public.demo_customers (assistant_id, phone);
create index if not exists demo_customers_tenant_recent_idx on public.demo_customers (assistant_id, last_seen_at desc);
create index if not exists demo_customers_demo_slug_idx     on public.demo_customers (demo_slug);

-- demo_reservations
create index if not exists demo_reservations_tenant_slot_idx   on public.demo_reservations (assistant_id, starts_at);
create index if not exists demo_reservations_tenant_recent_idx on public.demo_reservations (assistant_id, created_at desc);
create index if not exists demo_reservations_customer_idx      on public.demo_reservations (customer_id);
create index if not exists demo_reservations_status_idx        on public.demo_reservations (status);
create unique index if not exists demo_reservations_first_tool_call_uidx
  on public.demo_reservations (first_tool_call_id) where first_tool_call_id is not null;

-- demo_actions — garde-fou d'idempotence de la projection.
create unique index if not exists demo_actions_tool_call_uidx
  on public.demo_actions (tool_call_id) where tool_call_id is not null;
create index if not exists demo_actions_tenant_recent_idx on public.demo_actions (assistant_id, occurred_at desc);
create index if not exists demo_actions_reservation_idx   on public.demo_actions (reservation_id, occurred_at);
create index if not exists demo_actions_customer_idx      on public.demo_actions (customer_id, occurred_at desc);
create index if not exists demo_actions_action_idx        on public.demo_actions (action);
create index if not exists demo_actions_occurred_idx      on public.demo_actions (occurred_at desc);
create index if not exists demo_actions_document_idx      on public.demo_actions (document_id, occurred_at);

-- demo_documents — numérotation par tenant et par année.
create unique index if not exists demo_documents_tenant_number_uidx on public.demo_documents (assistant_id, number);
create index if not exists demo_documents_tenant_recent_idx on public.demo_documents (assistant_id, created_at desc);
create index if not exists demo_documents_kind_idx     on public.demo_documents (assistant_id, kind, created_at desc);
create index if not exists demo_documents_customer_idx on public.demo_documents (customer_id);
create index if not exists demo_documents_source_idx   on public.demo_documents (source_id);
create index if not exists demo_documents_slug_idx     on public.demo_documents (demo_slug);

-- demo_usage_daily
create unique index if not exists demo_usage_daily_tenant_day_uidx on public.demo_usage_daily (assistant_id, day);
create index if not exists demo_usage_daily_day_idx       on public.demo_usage_daily (day desc);
create index if not exists demo_usage_daily_demo_slug_idx on public.demo_usage_daily (demo_slug);

-- catalogue et dictée
create index if not exists demo_catalog_categories_tenant_idx on public.demo_catalog_categories (assistant_id, position);
create index if not exists demo_catalog_items_tenant_idx      on public.demo_catalog_items (assistant_id, position);
create index if not exists demo_catalog_items_category_idx    on public.demo_catalog_items (category_id);
create index if not exists demo_voice_sessions_tenant_idx     on public.demo_voice_sessions (assistant_id, created_at desc);
create index if not exists demo_voice_sessions_document_idx   on public.demo_voice_sessions (document_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. ROW LEVEL SECURITY
--    RLS activée SANS aucune policy sur toutes les tables : seul le
--    service_role, qui contourne RLS, écrit et lit. La clé anon publique ne peut
--    donc rien faire. (receptionist ouvre à part l'insertion anonyme sur
--    business_leads, pour son widget navigateur — cf. sa migration 024.)
-- ═══════════════════════════════════════════════════════════════════════════════

alter table public.business_leads          enable row level security;
alter table public.demo_bookings           enable row level security;
alter table public.demo_customers          enable row level security;
alter table public.demo_reservations       enable row level security;
alter table public.demo_actions            enable row level security;
alter table public.demo_documents          enable row level security;
alter table public.demo_usage_daily        enable row level security;
alter table public.demo_catalog_categories enable row level security;
alter table public.demo_catalog_items      enable row level security;
alter table public.demo_doc_settings       enable row level security;
alter table public.demo_voice_sessions     enable row level security;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. TRAÇABILITÉ : domain_name, project_name, created_at (migrations 001 et 009)
--    Appliqué en boucle sur toutes les tables de `public` — y compris celles
--    créées par les autres projets une fois les bases fusionnées.
-- ═══════════════════════════════════════════════════════════════════════════════

do $$
declare
  r         record;
  pre_merge boolean;
  has_date  boolean;
  -- Tables portant le même nom dans plusieurs projets. Une base fusionnée se
  -- reconstruit d'un bloc : le premier projet rejoué voit alors un registre à
  -- une seule ligne — la sienne — et poserait son nom en défaut partout. Sur
  -- une table partagée aucune valeur n'est juste pour tout le monde : on n'y
  -- pose donc jamais de défaut, c'est à l'applicatif d'envoyer project_name.
  partagees text[] := ARRAY[
    'agents',
    'analytics_pageviews',
    'analytics_sessions',
    'business_leads',
    'calls',
    'commissions',
    'company_settings',
    'documents',
    'kie_assets',
    'leads',
    'newsletter_subscribers',
    'organizations',
    'profiles',
    'referral_codes',
    'referral_notifications',
    'referral_relationships',
    'referrals',
    'stripe_events',
    'stripe_subscriptions',
    'user_roles',
    'users_extended',
    'webhook_events'
  ];
begin
  select count(*) = 1 into pre_merge from public.project_registry;

  for r in
    select table_name from information_schema.tables
    where table_schema = 'public'
      and table_type   = 'BASE TABLE'
      and table_name  <> 'project_registry'
  loop
    execute format('alter table public.%I add column if not exists domain_name text;', r.table_name);
    execute format('create index if not exists %I on public.%I (domain_name);',
                   r.table_name || '_domain_name_idx', r.table_name);

    execute format('alter table public.%I add column if not exists project_name text;', r.table_name);
    execute format('create index if not exists %I on public.%I (project_name);',
                   r.table_name || '_project_name_idx', r.table_name);

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = r.table_name and column_name = 'created_at'
    ) into has_date;

    if not has_date then
      execute format('alter table public.%I add column created_at timestamptz;', r.table_name);
      execute format('alter table public.%I alter column created_at set default now();', r.table_name);
      execute format('create index if not exists %I on public.%I (created_at desc);',
                     r.table_name || '_created_at_idx', r.table_name);
    end if;

    if pre_merge and not (r.table_name = any(partagees)) then
      execute format('alter table public.%I alter column project_name set default %L;',
                     r.table_name, 'web_agency_view');
      execute format('update public.%I set project_name = %L where project_name is null;',
                     r.table_name, 'web_agency_view');
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════════════════
-- Contraintes divergentes levées, et devise déduite du pays
--
-- 1. TOUT CE QUI DIVERGEAIT DEVIENT NULLABLE
-- Une même colonne était NOT NULL dans un projet et nullable dans un autre.
-- `create table if not exists` ne rejoue pas les contraintes : c'était donc le
-- premier projet appliqué qui imposait la sienne à tous les autres, et l'un
-- d'eux se serait retrouvé bloqué à l'insertion sans jamais l'avoir demandé.
-- On tranche dans le sens permissif : la colonne devient nullable partout,
-- l'invariant reste porté par l'applicatif qui en a besoin.
--
--   profiles.organization_id            NOT NULL sauf grit-united
--   profiles.created_at                 NOT NULL sauf grit-united
--   referral_relationships.parent_org_id      NOT NULL chez grit-united
--   referral_relationships.ancestor_org_id    NOT NULL chez devis_app
--   stripe_subscriptions.profile_id           NOT NULL chez grit-united
--   stripe_subscriptions.organization_id      NOT NULL chez devis_app
--
-- Les deux dernières paires sont les deux noms d'une même chose : les rendre
-- nullables est indispensable, chaque projet ne renseignant que la sienne.
--
-- 2. DEVISE DÉDUITE DU PAYS, EURO PAR DÉFAUT
-- `currency` valait 'eur' chez devis_app et 'usd' chez grit-united. La devise
-- suit désormais le pays : 'usd' si le pays est les États-Unis, 'eur' sinon —
-- et 'eur' quand aucun pays n'est renseigné. Le pays par défaut est l'Europe.
--
-- Les colonnes `country` d'OBSERVATION (analytics_sessions, business_leads,
-- assessment_sessions : pays constaté, renvoyé par Google ou déduit de l'IP) ne
-- reçoivent aucun défaut — y écrire 'Europe' inventerait une donnée. Seules les
-- colonnes d'ADRESSE saisie (company_settings, clients, demo_doc_settings) en
-- reçoivent un.
--
-- Idempotent, rejouable. Chaque bloc est gardé par l'existence de la table :
-- le fichier passe quel que soit le projet et quel que soit l'ordre.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Contraintes divergentes → nullable ────────────────────────────────────
DO $$
DECLARE
  r record;
  -- table, colonne
  relax text[][] := ARRAY[
    ['profiles',               'organization_id'],
    ['profiles',               'created_at'],
    ['referral_relationships', 'parent_org_id'],
    ['referral_relationships', 'ancestor_org_id'],
    ['referral_relationships', 'child_org_id'],
    ['referral_relationships', 'descendant_org_id'],
    ['stripe_subscriptions',   'profile_id'],
    ['stripe_subscriptions',   'organization_id']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(relax, 1) LOOP
    IF to_regclass('public.' || quote_ident(relax[i][1])) IS NOT NULL
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public'
                     AND table_name   = relax[i][1]
                     AND column_name  = relax[i][2]
                     AND is_nullable  = 'NO')
    THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP NOT NULL;',
                     relax[i][1], relax[i][2]);
    END IF;
  END LOOP;
END $$;

-- ── 2. Devise déduite du pays ────────────────────────────────────────────────
-- 'usd' pour les États-Unis sous toutes leurs graphies, 'eur' partout ailleurs,
-- 'eur' aussi quand le pays est inconnu — c'est le défaut Europe/euro.
-- Volontairement sans `unaccent` : cette extension n'est installée que par
-- grit-united, et le corps d'une fonction SQL est validé à la création — la
-- fonction serait donc impossible à créer dans les autres projets. Les graphies
-- accentuées sont listées telles quelles.
CREATE OR REPLACE FUNCTION public.currency_for_country(p_country text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    -- Rien de saisi : on retombe sur le défaut, l'Europe et donc l'euro.
    WHEN p_country IS NULL OR btrim(p_country) = '' THEN 'eur'
    WHEN lower(btrim(p_country)) IN
         ('europe', 'eu', 'union europeenne', 'union européenne')
      THEN 'eur'
    WHEN lower(btrim(p_country)) IN
         ('us', 'usa', 'u.s.', 'u.s.a.', 'united states',
          'united states of america', 'etats-unis', 'etats unis',
          'états-unis', 'états unis', 'amerique', 'amérique')
      THEN 'usd'
    ELSE 'eur'
  END
$$;

COMMENT ON FUNCTION public.currency_for_country(text) IS
  'Devise ISO minuscule attendue pour un pays : usd pour les États-Unis, eur sinon — Europe/euro étant le défaut, y compris quand le pays est inconnu.';

-- Pays par défaut sur les colonnes d'ADRESSE saisie, jamais sur un pays constaté.
DO $$
DECLARE
  r    record;
  addr text[] := ARRAY['company_settings', 'clients', 'demo_doc_settings'];
  t    text;
BEGIN
  FOREACH t IN ARRAY addr LOOP
    IF to_regclass('public.' || quote_ident(t)) IS NOT NULL
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name=t AND column_name='country')
    THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN country SET DEFAULT %L;', t, 'Europe');
    END IF;
  END LOOP;
END $$;

-- Devise par défaut : euro, là où aucun pays n'accompagne la colonne.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['commissions', 'stripe_subscriptions'] LOOP
    IF to_regclass('public.' || quote_ident(t)) IS NOT NULL
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name=t AND column_name='currency')
    THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN currency SET DEFAULT %L;', t, 'eur');
      EXECUTE format('UPDATE public.%I SET currency = %L WHERE currency IS NULL;', t, 'eur');
    END IF;
  END LOOP;
END $$;

-- `orders` porte un pays (shipping_country) ET une devise : la devise s'en
-- déduit. On retire le DEFAULT de la colonne pour que le trigger puisse
-- distinguer « rien fourni » de « eur fourni explicitement » — un trigger BEFORE
-- s'exécute avant le contrôle NOT NULL, la colonne est donc toujours remplie.
CREATE OR REPLACE FUNCTION public.orders_currency_from_country()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.currency IS NULL THEN
    NEW.currency := public.currency_for_country(NEW.shipping_country);
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    ALTER TABLE public.orders ALTER COLUMN currency DROP DEFAULT;

    DROP TRIGGER IF EXISTS orders_currency_from_country ON public.orders;
    CREATE TRIGGER orders_currency_from_country
      BEFORE INSERT OR UPDATE ON public.orders
      FOR EACH ROW EXECUTE FUNCTION public.orders_currency_from_country();
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════════════════
-- FIN DE SCRIPT
-- ═══════════════════════════════════════════════════════════════════════════════
