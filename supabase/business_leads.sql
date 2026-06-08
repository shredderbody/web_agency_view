-- Table des leads "entreprise" captés depuis le widget de la landing page.
-- Alimentée côté serveur (service_role) via /api/leads, à partir de
-- l'API Google Places (source='google') ou de la saisie manuelle (source='manual').

create table if not exists public.business_leads (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  source                text not null default 'google',   -- 'google' | 'manual'
  lang                  text,

  -- Identité
  place_id              text,
  name                  text not null,

  -- Métier
  primary_type          text,
  primary_type_display  text,
  types                 text[],

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
  phone_international    text,
  email                 text,
  website               text,

  -- Lien Maps
  google_maps_uri       text,

  -- Réputation
  rating                numeric,
  user_rating_count     integer,

  -- Horaires (une ligne par jour, texte lisible)
  opening_hours         text[],

  -- Avis (note + texte + auteur + date relative)
  reviews               jsonb,

  -- Statut
  business_status       text
);

-- Index utiles pour le suivi des leads.
create index if not exists business_leads_created_at_idx on public.business_leads (created_at desc);
create index if not exists business_leads_place_id_idx   on public.business_leads (place_id);

-- RLS activé sans policy : seul le service_role (qui contourne RLS) peut écrire/lire.
-- La clé anon publique ne peut donc rien faire sur cette table.
alter table public.business_leads enable row level security;

-- ── Suivi commercial (ajouté après coup — colonnes éditées depuis le dashboard
--    Supabase par l'agence, jamais par le formulaire public) ──────────────────
alter table public.business_leads
  add column if not exists sector text,
  add column if not exists status text not null default 'new',
  add column if not exists notes  text;

comment on column public.business_leads.sector is
  'Secteur d''activité normalisé, choisi/validé dans le formulaire (liste contrôlée), distinct du primary_type_display brut renvoyé par Google.';
comment on column public.business_leads.status is
  'Suivi commercial du lead : new | contacted | converted | lost. Renseigné par l''agence, jamais par le formulaire public.';
comment on column public.business_leads.notes is
  'Notes internes libres ajoutées par l''agence après prise de contact.';

alter table public.business_leads drop constraint if exists business_leads_status_check;
alter table public.business_leads
  add constraint business_leads_status_check check (status in ('new', 'contacted', 'converted', 'lost'));

create index if not exists business_leads_status_idx on public.business_leads (status);
