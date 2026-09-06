-- Table des leads "entreprise" captés depuis le widget de la landing page.
-- Alimentée côté serveur (service_role) via /api/leads, à partir de
-- l'API Google Places (source='google') ou de la saisie manuelle (source='manual').

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
  business_status       text,

  -- Traçabilité du domaine/projet d'origine
  domain_name           text,
  created_at            timestamptz not null default now()
);

-- `business_leads` porte le même nom dans plusieurs projets. Si l'un d'eux a créé la
-- table en premier, le CREATE TABLE ci-dessus n'a rien fait : on garantit donc
-- ici la présence de chacune de nos colonnes avant de s'en servir plus bas.
ALTER TABLE public.business_leads
  ADD COLUMN IF NOT EXISTS place_id             text,
  ADD COLUMN IF NOT EXISTS source               text not null default 'google',
  ADD COLUMN IF NOT EXISTS lang                 text,
  ADD COLUMN IF NOT EXISTS name                 text,
  ADD COLUMN IF NOT EXISTS primary_type         text,
  ADD COLUMN IF NOT EXISTS primary_type_display text,
  ADD COLUMN IF NOT EXISTS types                text[],
  ADD COLUMN IF NOT EXISTS formatted_address    text,
  ADD COLUMN IF NOT EXISTS street_number        text,
  ADD COLUMN IF NOT EXISTS route                text,
  ADD COLUMN IF NOT EXISTS locality             text,
  ADD COLUMN IF NOT EXISTS postal_code          text,
  ADD COLUMN IF NOT EXISTS admin_area           text,
  ADD COLUMN IF NOT EXISTS country              text,
  ADD COLUMN IF NOT EXISTS latitude             double precision,
  ADD COLUMN IF NOT EXISTS longitude            double precision,
  ADD COLUMN IF NOT EXISTS phone_national       text,
  ADD COLUMN IF NOT EXISTS phone_international  text,
  ADD COLUMN IF NOT EXISTS email                text,
  ADD COLUMN IF NOT EXISTS website              text,
  ADD COLUMN IF NOT EXISTS google_maps_uri      text,
  ADD COLUMN IF NOT EXISTS rating               numeric,
  ADD COLUMN IF NOT EXISTS user_rating_count    integer,
  ADD COLUMN IF NOT EXISTS opening_hours        text[],
  ADD COLUMN IF NOT EXISTS reviews              jsonb,
  ADD COLUMN IF NOT EXISTS business_status      text,
  ADD COLUMN IF NOT EXISTS domain_name          text,
  ADD COLUMN IF NOT EXISTS created_at           timestamptz not null default now();

-- Index utiles pour le suivi des leads.
create index if not exists business_leads_created_at_idx on public.business_leads (created_at desc);
create index if not exists business_leads_place_id_idx   on public.business_leads (place_id);
create index if not exists business_leads_domain_name_idx on public.business_leads (domain_name);

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
