-- 007 — L'OUTIL DE DEVIS DEVIENT UNE APPLICATION (`/<slug>/admin/quotes`).
--
-- Demande (2026-09-04) : « le slug /slug/admin/quotes ne correspond pas du tout
-- au projet ~/devis_app : il manque des pages, plusieurs onglets,
-- l'enregistrement des devis, les options par vocal. Reprends le projet et
-- intègre les démos. »
--
-- La 006 avait posé les DOCUMENTS. Il manquait ce qui, dans `devis_app`, fait
-- que ces documents se composent vite : un CATALOGUE qu'on modifie, des
-- RÉGLAGES d'émetteur qu'on corrige, et la trace des DICTÉES vocales.
--
-- Cloisonnement : `assistant_id`, comme partout depuis la 003.
--
-- ⚠️ À appliquer sur les DEUX projets Supabase (cf. en-tête de la 004) :
--    bbxwezoscjuwsoflponx (GritUnited) et uvpuhoyaovmztephqknq (projet du .env).
-- Idempotent, rejouable.

-- ── 1. Catégories de catalogue ───────────────────────────────────────────────
-- Un rayon dans la carte : « Coupes », « Barbe », « Forfaits ». La couleur sert
-- à les distinguer d'un coup d'œil dans la liste des pastilles de l'éditeur.

create table if not exists public.demo_catalog_categories (
  id           uuid primary key default gen_random_uuid(),
  assistant_id text not null,
  demo_slug    text,
  name         text not null,
  color        text not null default '#6366f1',
  -- Rang d'affichage. Les rayons d'une carte ont un ordre voulu : l'entrée
  -- avant le plat, la coupe avant la barbe. Un tri alphabétique le perdrait.
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists demo_catalog_categories_tenant_idx
  on public.demo_catalog_categories (assistant_id, position);

-- ── 2. Prestations du catalogue ──────────────────────────────────────────────
-- SEMÉES depuis la vitrine au premier accès (cf. lib/portal/catalogStore.ts) :
-- on ne présente jamais un catalogue vide à quelqu'un dont les prix sont déjà
-- écrits sur sa page publique. Ensuite, il est à lui : il ajoute, corrige,
-- supprime, et la vitrine n'y touche plus.

create table if not exists public.demo_catalog_items (
  id             uuid primary key default gen_random_uuid(),
  assistant_id   text not null,
  demo_slug      text,
  category_id    uuid references public.demo_catalog_categories (id) on delete set null,

  name           text not null,
  description    text,
  unit_price     numeric not null default 0,
  -- Taux de taxe de la ligne, en points (20 = 20 %).
  tax_rate       numeric not null default 20,
  -- 'unite' | 'heure' | 'jour' | 'forfait' | 'm2' | 'ml' | 'kg'
  unit           text not null default 'unite',

  -- Prix d'achat, pour la marge. Nullable : la plupart des prestations n'en ont
  -- pas, et on ne force personne à inventer un coût.
  purchase_price numeric,

  -- `true` quand la prestation n'a pas de prix affiché sur la vitrine
  -- (« sur devis », « offert », « Free quote ») : elle se chiffre au cas par cas.
  to_quote       boolean not null default false,

  position       integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists demo_catalog_items_tenant_idx
  on public.demo_catalog_items (assistant_id, position);
create index if not exists demo_catalog_items_category_idx
  on public.demo_catalog_items (category_id);

-- ── 3. Réglages de l'émetteur ────────────────────────────────────────────────
-- SURCHARGES, pas remplacement. L'identité reste dérivée de la vitrine
-- (lib/portal/issuer.ts) ; cette table ne porte que ce qu'une page vitrine n'a
-- pas de raison de dire : un IBAN, un SIRET, un délai de paiement, des mentions
-- de bas de page. Toute colonne laissée vide retombe sur la vitrine.

create table if not exists public.demo_doc_settings (
  assistant_id     text primary key,
  demo_slug        text,

  -- Identité — vide = on garde ce que la vitrine dit.
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

  -- Paiement.
  iban             text,
  bic              text,
  payment_method   text,
  payment_days     integer,
  validity_days    integer,

  -- Fiscalité et mentions.
  tax_rate_default numeric,
  footer_notes     text,
  -- Assurance décennale : obligatoire sur un devis de bâtiment en France.
  insurance_label  text,
  insurance_detail text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── 4. Sessions de dictée ────────────────────────────────────────────────────
-- Ce que la personne a dit, et ce que le modèle en a tiré. Deux usages :
-- comprendre une analyse ratée sans redemander à l'utilisateur de redicter, et
-- montrer en démonstration que la voix produit bien des lignes chiffrées.
--
-- ⚠️ On stocke ICI un transcript, alors que le journal d'actions
-- (`demo_actions`) s'interdit tout contenu de conversation. Ce n'est pas une
-- contradiction : là-bas c'est la parole d'un CLIENT au téléphone, ici c'est la
-- dictée de l'exploitant sur son propre devis. Il dicte pour que ce soit écrit.

create table if not exists public.demo_voice_sessions (
  id           uuid primary key default gen_random_uuid(),
  assistant_id text not null,
  demo_slug    text,
  document_id  uuid references public.demo_documents (id) on delete cascade,
  transcript   text not null,
  -- Les lignes produites par l'analyse, telles qu'elles ont été appliquées.
  result       jsonb not null default '[]'::jsonb,
  -- 'ok' | 'empty' | 'error' — pour retrouver les dictées qui n'ont rien donné.
  outcome      text not null default 'ok',
  created_at   timestamptz not null default now()
);

create index if not exists demo_voice_sessions_tenant_idx
  on public.demo_voice_sessions (assistant_id, created_at desc);
create index if not exists demo_voice_sessions_document_idx
  on public.demo_voice_sessions (document_id);

-- ── 5. Le fichier client devient modifiable ──────────────────────────────────
-- `demo_customers` (migration 003) ne portait que ce que la standardiste
-- apprenait au téléphone. Un devis a besoin d'une ADRESSE POSTALE — on ne
-- facture pas quelqu'un sans savoir où il habite.

alter table public.demo_customers add column if not exists address     text;
alter table public.demo_customers add column if not exists postal_code text;
alter table public.demo_customers add column if not exists city        text;
alter table public.demo_customers add column if not exists company     text;
alter table public.demo_customers add column if not exists siret       text;
-- Créée depuis l'espace, ou remontée d'un appel ? La fiche saisie à la main ne
-- doit pas être écrasée par une synchronisation.
alter table public.demo_customers add column if not exists source      text;

-- ── 6. RLS ───────────────────────────────────────────────────────────────────
-- Active, SANS policy : seule la clé `service_role` passe, et elle n'est jamais
-- exposée au navigateur. Même règle que 003, 005 et 006 — tout accès passe par
-- `lib/portal/supabase.ts`, côté serveur.

alter table public.demo_catalog_categories enable row level security;
alter table public.demo_catalog_items      enable row level security;
alter table public.demo_doc_settings       enable row level security;
alter table public.demo_voice_sessions     enable row level security;

-- ── 7. Le journal accueille la dictée ────────────────────────────────────────
-- Un devis dicté est un fait de la vie du commerce, au même titre qu'un devis
-- émis : il se lit dans le même fil.

do $$
begin
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
