-- ════════════════════════════════════════════════════════════════════════════
-- 008 — Alignement inter-projets, en vue de la fusion sur UNE SEULE base
--
-- POURQUOI
-- Les cinq projets (web_agency_view, receptionist, zerocall-io, devis_app,
-- grit-united) écrivent aujourd'hui dans des bases Supabase distinctes. Le jour
-- de la fusion, le premier projet joué crée la table et les suivants la
-- trouvent déjà là (`create table if not exists`) : leurs colonnes propres
-- n'existeraient JAMAIS et leurs requêtes casseraient silencieusement.
--
-- LA RÈGLE : une table de même nom = le MÊME sur-ensemble de colonnes dans tous
-- les projets. Chaque projet ajoute ici les colonnes que les autres possèdent.
--
-- CE PROJET N'A QU'UNE TABLE PARTAGÉE : `business_leads`, dont il porte la
-- définition d'origine (supabase/business_leads.sql). C'est receptionist qui y
-- a ajouté après coup le tunnel de démo (voix choisie, assistant Vapi, numéro
-- Twilio) et le rapprochement Stripe, dans ses migrations 024 et 025. On les
-- reprend ici à l'identique pour que les deux dépôts décrivent la même table.
-- Les tables `demo_*` sont propres à ce projet : aucun risque de télescopage.
--
-- CE QUI N'EST PAS REPRIS : la policy « Anyone can insert business leads » de
-- receptionist/024. Ici la table reste en RLS sans policy — seul le
-- service_role (via /api/leads) écrit. Ouvrir l'insertion anonyme est un choix
-- propre au widget de receptionist, pas une caractéristique de la table.
--
-- Idempotent, rejouable.
-- ════════════════════════════════════════════════════════════════════════════

-- `business_leads` est définie dans supabase/business_leads.sql, hors séquence
-- numérotée. Sur une base neuve où seules les migrations sont jouées, elle
-- n'existe pas encore et les ALTER ci-dessous échoueraient. On la crée donc ici
-- à l'identique, sans rien écraser si elle est déjà là.
create table if not exists public.business_leads (
  id                    uuid primary key default gen_random_uuid(),

  place_id              text,
  source                text not null default 'google',   -- 'google' | 'manual'
  lang                  text,
  name                  text not null,

  primary_type          text,
  primary_type_display  text,
  types                 text[],

  formatted_address     text,
  street_number         text,
  route                 text,
  locality              text,
  postal_code           text,
  admin_area            text,
  country               text,

  latitude              double precision,
  longitude             double precision,

  phone_national        text,
  phone_international   text,
  email                 text,
  website               text,
  google_maps_uri       text,

  rating                numeric,
  user_rating_count     integer,
  opening_hours         text[],
  reviews               jsonb,
  business_status       text,

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

alter table public.business_leads
  add column if not exists sector text,
  add column if not exists status text not null default 'new',
  add column if not exists notes  text;

alter table public.business_leads enable row level security;

alter table public.business_leads
  add column if not exists assistant_language         text,
  add column if not exists assistant_voice_name       text,
  add column if not exists assistant_voice_gender     text,
  add column if not exists assistant_temp_id          text,
  add column if not exists vapi_assistant_id          text,
  add column if not exists twilio_number              text,
  add column if not exists stripe_customer_id         text,
  add column if not exists stripe_checkout_session_id text;

comment on column public.business_leads.assistant_language is
  'Langue choisie pour l''assistant vocal de démo (ex: French, English) — étape voix de FindBusinessSection / VoiceSelectionStep (receptionist).';
comment on column public.business_leads.assistant_voice_name is
  'Nom de la voix sélectionnée (ex: Eric, Sarah), tel que défini dans VOICES (VoiceSelectionStep.tsx).';
comment on column public.business_leads.assistant_voice_gender is
  'Genre de la voix sélectionnée (Male | Female | Non-binary).';
comment on column public.business_leads.assistant_temp_id is
  'Identifiant généré côté client en attendant la création réelle de l''agent ElevenLabs.';
comment on column public.business_leads.vapi_assistant_id is
  'ID de l''assistant Vapi correspondant à ce lead, une fois celui-ci créé côté Vapi.';
comment on column public.business_leads.twilio_number is
  'Numéro Twilio attribué à ce lead, vers lequel son numéro professionnel doit être redirigé pour que l''assistant prenne les appels entrants.';
comment on column public.business_leads.stripe_customer_id is
  'Client Stripe créé au choix d''une formule dans PlanCheckoutModal — voir create-lead-checkout-session.';
comment on column public.business_leads.stripe_checkout_session_id is
  'Session Stripe Checkout ouverte pour ce lead — permet de retrouver le paiement/l''abonnement correspondant.';

create index if not exists business_leads_twilio_number_idx      on public.business_leads (twilio_number);
create index if not exists business_leads_assistant_temp_id_idx  on public.business_leads (assistant_temp_id);
create index if not exists business_leads_vapi_assistant_id_idx  on public.business_leads (vapi_assistant_id);
create index if not exists business_leads_stripe_customer_id_idx on public.business_leads (stripe_customer_id);
