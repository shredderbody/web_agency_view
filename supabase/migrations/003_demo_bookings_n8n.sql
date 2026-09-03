-- 003 — public.demo_bookings pour la voie n8n.
--
-- ⚠️ CIBLE : projet Supabase **GritUnited** `bbxwezoscjuwsoflponx`
--    (`contact@grit-united.com's Project`) — PAS le projet du `.env` de ce repo
--    (`uvpuhoyaovmztephqknq`, en pause). C'est la base à laquelle la credential
--    n8n `GritUnited Supabase account` (`ymGIwnbpr5ejICpx`) est rattachée, donc
--    la seule que le workflow peut écrire.
--    Appliquée le 2026-08-25 via l'API management Supabase :
--
--      PAT="$(grep -m1 '^SUPABASE_ACCESS_TOKEN=' /home/amscjrb/grit-united/.env | cut -d= -f2-)"
--      curl -X POST -H "Authorization: Bearer $PAT" -H 'Content-Type: application/json' \
--        -d "$(jq -Rs '{query:.}' < supabase/migrations/003_demo_bookings_n8n.sql)" \
--        https://api.supabase.com/v1/projects/bbxwezoscjuwsoflponx/database/query
--
--    (le fichier est autonome : il crée la table si elle n'existe pas, donc 002
--     n'a pas besoin d'avoir été jouée sur ce projet — elle ne l'a pas été.)
--
-- Les 4 function tools des assistants Vapi de démo (`enregistrer_rendezvous` /
-- `_reservation` / `_commande` / `_intervention`) ne tapent plus
-- /api/vapi/booking mais le webhook n8n
-- https://n8n.zerocall.io/webhook/00000000-1234-0000-4321-000000000000
-- (workflow `DXijRdXTdTKVGXE8`, branche `Switch1 → demoBooking`).
--
-- MULTI-TENANT : un seul workflow n8n sert TOUTES les démos. La clé de tenant
-- est l'`assistant_id` Vapi du client démo — même convention que la data table
-- n8n `practitioner_initialization`, qui indexe déjà les tenants receptionist par
-- assistant_id. C'est donc `assistant_id` qui porte le suivi par client ; tout le
-- reste (nom d'enseigne, slug de démo, métier) n'est que du contexte dérivé.
--
-- La branche démo du workflow n'a pas de contexte HTTP (pas de Host, pas de
-- session) : elle identifie l'appel par l'assistant et le call Vapi. On ajoute
-- donc les colonnes de traçabilité correspondantes, une colonne `source`
-- pour distinguer les deux voies d'écriture, et une colonne `environment`
-- (`dev` | `rec` | `prod`, défaut `dev`) pour séparer les écritures de mise au
-- point des écritures réelles — même convention que `public.user_roles.environment`.
-- `calendar_id` porte l'agenda de destination (défaut `hello@zerocall.io`,
-- l'agenda de l'agence : une démo n'a pas d'agenda client à elle).
-- `limit_creneau` porte le nombre de créneaux posés par la demande (défaut 1).
--
-- Idempotent, rejouable. Ne touche à aucune colonne existante.

create table if not exists public.demo_bookings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  tool          text,
  payload       jsonb,
  meta          jsonb,
  domain_name   text
);

alter table public.demo_bookings add column if not exists assistant_id   text;
alter table public.demo_bookings add column if not exists assistant_name text;
alter table public.demo_bookings add column if not exists call_id        text;
alter table public.demo_bookings add column if not exists tool_call_id   text;
alter table public.demo_bookings add column if not exists source         text;
alter table public.demo_bookings add column if not exists environment    text not null default 'dev';
alter table public.demo_bookings add column if not exists calendar_id    text default 'hello@zerocall.io';
alter table public.demo_bookings add column if not exists limit_creneau  integer not null default 1;

-- Valeurs autorisées pour `environment`. Pas de `add constraint if not exists`
-- en Postgres : on avale le duplicate_object pour rester rejouable.
do $$
begin
  alter table public.demo_bookings
    add constraint demo_bookings_environment_chk check (environment in ('dev', 'rec', 'prod'));
exception
  when duplicate_object then null;
end
$$;

-- Clé de tenant : indexée seule, et en composite pour lister l'historique d'un
-- client démo du plus récent au plus ancien sans tri en mémoire.
create index if not exists demo_bookings_assistant_id_idx on public.demo_bookings (assistant_id);
create index if not exists demo_bookings_tenant_recent_idx
  on public.demo_bookings (assistant_id, created_at desc);
create index if not exists demo_bookings_call_id_idx      on public.demo_bookings (call_id);
create index if not exists demo_bookings_source_idx       on public.demo_bookings (source);
create index if not exists demo_bookings_environment_idx  on public.demo_bookings (environment);

-- Un tool call Vapi ne doit produire qu'une ligne, même si Vapi rejoue le POST
-- (retry réseau, timeout côté assistant). Index partiel : les écritures issues
-- de /api/vapi/booking historiques n'ont pas de tool_call_id et restent valides.
create unique index if not exists demo_bookings_tool_call_id_uidx
  on public.demo_bookings (tool_call_id)
  where tool_call_id is not null;

-- RLS : rappel — activé sans policy, seul le service_role écrit/lit (cf. 002).
alter table public.demo_bookings enable row level security;

comment on column public.demo_bookings.assistant_id is
  'CLÉ DE TENANT. ID de l''assistant Vapi du client démo (message.assistant.id) : c''est par cette colonne que le workflow n8n unique fait le suivi multi-tenant. Voir vapi_export/assistants/_index.md.';
comment on column public.demo_bookings.assistant_name is
  'Nom de l''assistant Vapi émetteur, ex. "Démo vitrine · Le Comptoir 12".';
comment on column public.demo_bookings.call_id is
  'ID de l''appel Vapi (message.call.id) — regroupe les tool calls d''une même conversation.';
comment on column public.demo_bookings.tool_call_id is
  'ID du tool call Vapi (message.toolCalls[0].id). Unique : garde-fou anti-doublon sur rejeu.';
comment on column public.demo_bookings.source is
  'Voie d''écriture : "n8n" (workflow DXijRdXTdTKVGXE8) ou "api" (/api/vapi/booking).';
comment on column public.demo_bookings.calendar_id is
  'Agenda de destination du rendez-vous, ex. "hello@zerocall.io" (défaut : l''agenda de l''agence, les démos n''ont pas d''agenda client). Nullable à dessein : un insert best-effort qui pousse un calendarId vide ne doit pas être rejeté.';
comment on column public.demo_bookings.limit_creneau is
  'Nombre de créneaux réservables en une fois pour cette demande. Défaut 1 : une démo ne pose qu''un créneau par appel.';
comment on column public.demo_bookings.environment is
  'Environnement d''origine de l''écriture : "dev" (défaut), "rec" (recette) ou "prod". Contrainte demo_bookings_environment_chk. Même convention que public.user_roles.environment. L''écrivain (branche démo n8n / /api/vapi/booking) doit le positionner explicitement ; sans valeur, la ligne retombe sur "dev".';
