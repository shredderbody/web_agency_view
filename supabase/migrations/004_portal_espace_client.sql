-- 004 — Espace client des démos (`/espace/[slug]`, vue admin `/espace/admin`).
--
-- ⚠️ À appliquer sur les DEUX projets Supabase, car les deux voies d'écriture
--    coexistent (cf. 003) :
--      • `bbxwezoscjuwsoflponx` (GritUnited)  ← le workflow n8n y écrit, c'est
--        la base que l'espace client LIT et MET À JOUR.
--      • `uvpuhoyaovmztephqknq` (projet du .env) ← `/api/vapi/booking` y écrit
--        encore ; on garde le schéma aligné pour que l'espace puisse basculer.
--
--    Application (idempotente, rejouable) :
--      PAT="$(grep -m1 '^JWT_SUPABASE=' .env | cut -d= -f2-)"
--      curl -X POST -H "Authorization: Bearer $PAT" -H 'Content-Type: application/json' \
--        -d "$(jq -Rs '{query:.}' < supabase/migrations/004_portal_espace_client.sql)" \
--        https://api.supabase.com/v1/projects/<ref>/database/query
--
-- Deux apports :
--   1. `demo_bookings` devient éditable depuis l'espace client (statut, créneau
--      confirmé, coordonnées normalisées, note interne).
--   2. `demo_usage_daily` archive la consommation Vapi jour par jour. INDISPENSABLE :
--      l'API Vapi ne conserve que **14 jours** d'historique d'appels sur ce plan
--      (au-delà elle renvoie HTTP 400). Sans cette table, le suivi de consommation
--      est amnésique.

-- ── 1. Réservations éditables ────────────────────────────────────────────────

alter table public.demo_bookings add column if not exists demo_slug      text;
alter table public.demo_bookings add column if not exists status         text not null default 'pending';
alter table public.demo_bookings add column if not exists starts_at      timestamptz;
alter table public.demo_bookings add column if not exists customer_name  text;
alter table public.demo_bookings add column if not exists customer_phone text;
alter table public.demo_bookings add column if not exists notes          text;
alter table public.demo_bookings add column if not exists updated_at     timestamptz not null default now();

-- Statuts autorisés. Pas de `add constraint if not exists` en Postgres : on avale
-- le duplicate_object pour rester rejouable (même motif que 003).
do $$
begin
  alter table public.demo_bookings
    add constraint demo_bookings_status_chk
    check (status in ('pending', 'confirmed', 'cancelled', 'done', 'no_show'));
exception
  when duplicate_object then null;
end
$$;

create index if not exists demo_bookings_status_idx     on public.demo_bookings (status);
create index if not exists demo_bookings_starts_at_idx  on public.demo_bookings (starts_at);
create index if not exists demo_bookings_demo_slug_idx  on public.demo_bookings (demo_slug);
-- Vue calendrier d'un client : « les réservations de CE tenant sur CE mois ».
create index if not exists demo_bookings_tenant_calendar_idx
  on public.demo_bookings (assistant_id, starts_at);

comment on column public.demo_bookings.demo_slug is
  'Slug de la démo (/demo/<slug>, /espace/<slug>). Dérivé de assistant_id via lib/portal/registry.ts ; dénormalisé ici pour les requêtes directes en SQL.';
comment on column public.demo_bookings.status is
  'Cycle de vie côté espace client : pending (posée par l''assistant) | confirmed | cancelled | done | no_show. Contrainte demo_bookings_status_chk.';
comment on column public.demo_bookings.starts_at is
  'Créneau normalisé en timestamptz. NULL tant que personne n''a édité la ligne : l''espace client dérive alors le créneau du payload (date JJ/MM/AAAA + heure). Une édition depuis l''espace écrit ici et cette valeur fait autorité.';
comment on column public.demo_bookings.customer_name is
  'Nom affiché du client, normalisé depuis payload.prenom + payload.nom au moment de l''édition.';
comment on column public.demo_bookings.customer_phone is
  'Téléphone normalisé depuis payload.telephone.';
comment on column public.demo_bookings.notes is
  'Note interne saisie depuis l''espace client. Jamais renvoyée à l''assistant.';
comment on column public.demo_bookings.updated_at is
  'Horodatage de la dernière édition depuis l''espace client (posé par l''app, pas par un trigger).';

-- ── 2. Archive de consommation Vapi ──────────────────────────────────────────

create table if not exists public.demo_usage_daily (
  id             uuid primary key default gen_random_uuid(),
  assistant_id   text not null,
  demo_slug      text,
  day            date not null,

  -- Appels vocaux (API Vapi GET /call).
  calls          integer not null default 0,
  call_seconds   integer not null default 0,
  call_cost      numeric(10, 4) not null default 0,

  -- Conversations écrites (API Vapi GET /chat) — la bulle est hybride chat+call.
  chats          integer not null default 0,
  chat_messages  integer not null default 0,
  chat_cost      numeric(10, 4) not null default 0,

  environment    text not null default 'prod',
  domain_name    text,
  synced_at      timestamptz not null default now()
);

-- Une seule ligne par (tenant, jour) : la synchro fait un upsert idempotent.
create unique index if not exists demo_usage_daily_tenant_day_uidx
  on public.demo_usage_daily (assistant_id, day);
create index if not exists demo_usage_daily_day_idx       on public.demo_usage_daily (day desc);
create index if not exists demo_usage_daily_demo_slug_idx on public.demo_usage_daily (demo_slug);

alter table public.demo_usage_daily enable row level security;

comment on table public.demo_usage_daily is
  'Archive JOUR PAR JOUR de la consommation Vapi par assistant de démo (appels + chats + coûts). Alimentée par POST /api/portal/sync, qui lit l''API Vapi. Raison d''être : le plan Vapi ne garde que 14 jours d''historique d''appels ; cette table est la mémoire longue du suivi de consommation. RLS activé sans policy : service_role uniquement.';
comment on column public.demo_usage_daily.assistant_id is
  'CLÉ DE TENANT — même convention que demo_bookings.assistant_id.';
comment on column public.demo_usage_daily.call_seconds is
  'Somme des durées d''appel du jour, en secondes (endedAt - startedAt).';
comment on column public.demo_usage_daily.chat_messages is
  'Nombre de messages échangés dans les conversations écrites du jour (user + assistant).';
comment on column public.demo_usage_daily.call_cost is
  'Coût Vapi cumulé des appels du jour, en USD (champ `cost` de l''API).';
comment on column public.demo_usage_daily.chat_cost is
  'Coût Vapi cumulé des conversations écrites du jour, en USD.';
