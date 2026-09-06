-- ════════════════════════════════════════════════════════════════════════════
-- 009 — web_agency_view : provenance et date d'alimentation sur TOUTES les tables
--
-- DEUX COLONNES, SUR CHAQUE TABLE DE `public` :
--   · `project_name`  — quel projet a posé la ligne ;
--   · `created_at`    — quand, ajoutée UNIQUEMENT aux tables qui n'en ont pas
--                       déjà une (on ne touche jamais à un `created_at`
--                       existant, ni aux tables qui datent autrement :
--                       `occurred_at`, `subscribed_at`, `processed_at`…).
--
-- POURQUOI `project_name` À CÔTÉ DE `domain_name`
-- `domain_name` dit sur quel DOMAINE la ligne a été écrite — il change quand on
-- migre un nom de domaine (cf. docs/DOMAIN_MIGRATION.md) et plusieurs projets
-- peuvent partager un domaine. `project_name` dit de quel DÉPÔT vient
-- l'écriture ; c'est un identifiant stable, celui dont on a besoin une fois les
-- cinq bases fusionnées pour savoir qui a posé la ligne dans une table partagée
-- (`organizations`, `profiles`, `user_roles`, `leads`, `business_leads`…).
--
-- `public.project_registry` recense les projets présents dans la base. Il sert
-- aussi de témoin de fusion : tant qu'il n'y a qu'une ligne, la base appartient
-- encore à un seul projet — on peut donc estampiller l'existant et poser un
-- DEFAULT sans risque de se tromper. Dès qu'un deuxième projet s'y inscrit, ces
-- deux opérations sont sautées : c'est alors à l'applicatif d'envoyer
-- `project_name` explicitement à chaque écriture dans une table partagée.
--
-- La nouvelle colonne `created_at` est ajoutée SANS valeur par défaut, puis le
-- défaut est posé ensuite : les lignes déjà en base restent à NULL (« date
-- inconnue », ce qui est la vérité) au lieu d'être toutes datées d'aujourd'hui.
--
-- Idempotent, rejouable.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.project_registry (
  project_name  text primary key,
  domain_name   text,
  repo          text,
  registered_at timestamptz not null default now()
);

alter table public.project_registry enable row level security;

comment on table public.project_registry is
  'Projets dont le schéma est présent dans cette base. Une seule ligne = base mono-projet (avant la fusion) ; plusieurs lignes = base fusionnée, où project_name doit être renseigné à l''écriture.';

insert into public.project_registry (project_name, repo)
values ('web_agency_view', 'https://github.com/shredderbody/web_agency_view')
on conflict (project_name) do nothing;

do $$
declare
  r         record;
  pre_merge boolean;
  has_date  boolean;
begin
  select count(*) = 1 into pre_merge from public.project_registry;

  for r in
    select table_name from information_schema.tables
    where table_schema = 'public'
      and table_type   = 'BASE TABLE'
      and table_name  <> 'project_registry'
  loop
    -- 0. Domaine d'origine. La boucle de `*_all_tables_domain_name.sql` tourne
    --    tôt dans la séquence et ne voit donc pas les tables créées après elle.
    --    On repasse ici, en fin de course, pour que la colonne et son index
    --    existent sur chaque table sans exception.
    execute format(
      'alter table public.%I add column if not exists domain_name text;', r.table_name);
    execute format(
      'create index if not exists %I on public.%I (domain_name);',
      r.table_name || '_domain_name_idx', r.table_name);

    -- 1. Provenance.
    execute format(
      'alter table public.%I add column if not exists project_name text;', r.table_name);
    execute format(
      'create index if not exists %I on public.%I (project_name);',
      r.table_name || '_project_name_idx', r.table_name);

    -- 2. Date d'alimentation, seulement si la table n'en a pas déjà une.
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name   = r.table_name
        and column_name  = 'created_at'
    ) into has_date;

    if not has_date then
      execute format('alter table public.%I add column created_at timestamptz;', r.table_name);
      execute format('alter table public.%I alter column created_at set default now();', r.table_name);
      execute format(
        'create index if not exists %I on public.%I (created_at desc);',
        r.table_name || '_created_at_idx', r.table_name);
    end if;

    -- 3. Base encore mono-projet : tout ce qui s'y trouve vient d'ici, et tout
    --    ce qui s'y écrira aussi tant qu'aucun autre projet ne s'est inscrit.
    if pre_merge then
      execute format(
        'alter table public.%I alter column project_name set default %L;',
        r.table_name, 'web_agency_view');
      execute format(
        'update public.%I set project_name = %L where project_name is null;',
        r.table_name, 'web_agency_view');
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
