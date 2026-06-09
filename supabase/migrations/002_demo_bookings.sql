-- Historise les "réservations" de démonstration captées par les assistants Vapi
-- (cf. docs/VAPI_ASSISTANTS.md). Alimentée best-effort côté serveur (service_role)
-- par POST /api/vapi/booking — une erreur d'insert n'empêche jamais l'assistant
-- de confirmer au client. Aucune réservation réelle : table d'observabilité seule.
-- Idempotent, rejouable.

create table if not exists public.demo_bookings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- Function tool appelé : enregistrer_rendezvous | enregistrer_reservation |
  -- enregistrer_commande | enregistrer_intervention.
  tool          text,

  -- Arguments bruts renvoyés par l'assistant (prenom, nom, telephone, date,
  -- heure, et les champs spécifiques au métier).
  payload       jsonb,

  -- Contexte serveur : { slug, ts }.
  meta          jsonb,

  -- Traçabilité du domaine/projet d'origine (convention migration 001).
  domain_name   text
);

-- Index utiles pour le suivi des démos.
create index if not exists demo_bookings_created_at_idx  on public.demo_bookings (created_at desc);
create index if not exists demo_bookings_tool_idx        on public.demo_bookings (tool);
create index if not exists demo_bookings_domain_name_idx on public.demo_bookings (domain_name);

-- RLS activé sans policy : seul le service_role (qui contourne RLS) peut écrire/lire.
-- La clé anon publique ne peut donc rien faire sur cette table.
alter table public.demo_bookings enable row level security;

comment on table public.demo_bookings is
  'Réservations de démonstration captées par les assistants Vapi inbound. Non réelles : observabilité seule, alimentée best-effort par /api/vapi/booking.';
comment on column public.demo_bookings.tool is
  'Function tool Vapi appelé : enregistrer_rendezvous | enregistrer_reservation | enregistrer_commande | enregistrer_intervention.';
comment on column public.demo_bookings.payload is
  'Arguments renvoyés par l''assistant (prenom, nom, telephone, date, heure + champs métier).';
comment on column public.demo_bookings.meta is
  'Contexte serveur : { slug, ts }.';
