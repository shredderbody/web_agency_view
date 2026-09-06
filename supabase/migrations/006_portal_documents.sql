-- 006 — DEVIS & FACTURES par vitrine (`/<slug>/quotes`, `/<slug>/devis`).
--
-- Demande (2026-09-03) : « chaque démo a son propre outil de devis, et intègre
-- les informations natives de la société de la page pour qu'il puisse faire ses
-- devis au complet et facture. »
--
-- UNE SEULE TABLE pour les deux. Un devis et une facture, c'est le même objet :
-- un en-tête, des lignes, des totaux, un destinataire. Ce qui les sépare tient
-- dans une colonne (`kind`) et dans un vocabulaire de statut. Deux tables
-- auraient dupliqué le calcul des totaux, le gabarit d'impression et la
-- numérotation, pour ne rien gagner — et auraient fait de la conversion
-- devis → facture une migration entre deux schémas au lieu d'une copie.
--
-- Cloisonnement : `assistant_id`, exactement comme `demo_reservations` et
-- `demo_actions` (migration 005). Une vitrine ne voit que ses documents.
--
-- ⚠️ À appliquer sur les DEUX projets Supabase (cf. en-tête de la 004) :
--    bbxwezoscjuwsoflponx (GritUnited) et uvpuhoyaovmztephqknq (projet du .env).
-- Idempotent, rejouable.

-- ── 1. Les documents ─────────────────────────────────────────────────────────

create table if not exists public.demo_documents (
  id            uuid primary key default gen_random_uuid(),

  -- CLÉ DE TENANT : l'assistant Vapi de la vitrine, comme partout ailleurs.
  assistant_id  text not null,
  demo_slug     text,
  customer_id   uuid references public.demo_customers (id) on delete set null,

  -- Traçabilité de la conversion : la facture pointe vers son devis d'origine.
  source_id     uuid references public.demo_documents (id) on delete set null,

  kind          text not null,          -- 'quote' | 'invoice'
  -- Numéro humain : DEV-2026-0001 / FAC-2026-0001. Unique par tenant.
  number        text not null,
  status        text not null default 'draft',
  lang          text not null default 'fr',

  -- Devise et libellé de taxe FIGÉS à l'émission : un document réédité six mois
  -- plus tard doit se relire à l'identique, même si le régime a changé depuis.
  currency      text not null default 'EUR',
  tax_label     text not null default 'TVA',

  issued_on     date not null default current_date,
  -- Validité d'un devis / échéance d'une facture. Un seul champ : un document
  -- n'a jamais les deux à la fois.
  due_on        date,

  -- Destinataire, figé lui aussi. Un lien vers la fiche client existe à côté
  -- (`customer_id`), mais le document garde l'identité du jour de l'émission.
  client        jsonb not null default '{}'::jsonb,

  -- Les lignes : [{ id, kind: 'item'|'discount', label, desc, qty, unit_price,
  --                 tax_rate, percent }]
  lines         jsonb not null default '[]'::jsonb,

  -- Totaux CALCULÉS ET STOCKÉS. Recalculés à chaque écriture par le serveur, et
  -- jamais par le navigateur : une liste triée par montant, une somme dans le
  -- tableau de bord ne doivent pas rejouer l'arithmétique de douze documents.
  total_ht      numeric(12, 2) not null default 0,
  total_tax     numeric(12, 2) not null default 0,
  total_ttc     numeric(12, 2) not null default 0,

  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  sent_at       timestamptz,
  paid_at       timestamptz
);

do $$
begin
  alter table public.demo_documents
    add constraint demo_documents_kind_chk check (kind in ('quote', 'invoice'));
exception when duplicate_object then null;
end
$$;

-- Vocabulaire de statut COMMUN aux deux natures, chacune n'en utilisant qu'une
-- partie : un devis va de draft à accepted/refused, une facture de draft à paid.
do $$
begin
  alter table public.demo_documents
    add constraint demo_documents_status_chk
    check (status in ('draft', 'sent', 'accepted', 'refused', 'paid', 'cancelled'));
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.demo_documents
    add constraint demo_documents_currency_chk check (currency in ('EUR', 'USD', 'IDR'));
exception when duplicate_object then null;
end
$$;

-- Un numéro ne se réutilise pas dans une même maison.
create unique index if not exists demo_documents_tenant_number_uidx
  on public.demo_documents (assistant_id, number);

-- La liste d'une vitrine, du plus récent au plus ancien, sans tri en mémoire.
create index if not exists demo_documents_tenant_recent_idx
  on public.demo_documents (assistant_id, created_at desc);
create index if not exists demo_documents_kind_idx     on public.demo_documents (assistant_id, kind, created_at desc);
create index if not exists demo_documents_customer_idx on public.demo_documents (customer_id);
create index if not exists demo_documents_source_idx   on public.demo_documents (source_id);
create index if not exists demo_documents_slug_idx     on public.demo_documents (demo_slug);

alter table public.demo_documents enable row level security;

comment on table public.demo_documents is
  'DEVIS ET FACTURES d''une vitrine de démonstration. Une seule table pour les deux natures (colonne kind) : même en-tête, mêmes lignes, mêmes totaux, même gabarit d''impression. Cloisonnée par assistant_id comme le reste de l''espace de suivi.';
comment on column public.demo_documents.number is
  'Numéro humain, séquence par tenant et par année : DEV-2026-0001 (devis), FAC-2026-0001 (facture).';
comment on column public.demo_documents.client is
  'Destinataire FIGÉ à l''émission : { name, email, phone, address, postal_code, city }. La fiche client peut changer ensuite sans réécrire le document.';
comment on column public.demo_documents.lines is
  'Lignes du document : [{ id, kind: item|discount, label, desc, qty, unit_price, tax_rate, percent }]. Une ligne discount porte un pourcentage, appliqué au prorata sur chaque assiette de taxe.';
comment on column public.demo_documents.total_ht is
  'Total hors taxe, recalculé par le SERVEUR à chaque écriture. Jamais renseigné depuis le navigateur.';
comment on column public.demo_documents.source_id is
  'Devis d''origine, quand ce document est une facture issue d''une conversion.';

-- ── 2. Le journal d'actions couvre aussi les documents ───────────────────────
--
-- La traçabilité d'une vitrine est UNE seule histoire : un rendez-vous pris par
-- la voix, puis un devis émis, puis une facture payée. Ces trois faits doivent
-- se lire dans le même journal, pas dans trois endroits séparés. On étend donc
-- le vocabulaire de `demo_actions` plutôt que d'ouvrir un second journal.

alter table public.demo_actions add column if not exists document_id uuid;

do $$
begin
  alter table public.demo_actions
    add constraint demo_actions_document_fk
    foreign key (document_id) references public.demo_documents (id) on delete set null;
exception when duplicate_object then null;
end
$$;

create index if not exists demo_actions_document_idx
  on public.demo_actions (document_id, occurred_at);

-- Le check de la 005 est remplacé, pas contourné : on le supprime et on le
-- repose avec les six nouveaux verbes. `drop if exists` rend l'opération
-- rejouable sans erreur.
alter table public.demo_actions drop constraint if exists demo_actions_action_chk;
alter table public.demo_actions
  add constraint demo_actions_action_chk
  check (action in (
    'booking_created', 'booking_rescheduled', 'booking_cancelled',
    'booking_confirmed', 'booking_completed', 'booking_no_show',
    'order_placed', 'intervention_requested', 'quote_requested',
    'customer_updated', 'note_added', 'contacted',
    -- Nouveaux (006) : le cycle de vie d'un document.
    'quote_issued', 'quote_sent', 'quote_accepted', 'quote_refused',
    'invoice_issued', 'invoice_paid'
  ));

comment on column public.demo_actions.document_id is
  'Devis ou facture (public.demo_documents) concerné par cette action. NULL pour les actions de réservation.';
