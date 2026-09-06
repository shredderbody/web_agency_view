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
