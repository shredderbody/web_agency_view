-- ═══════════════════════════════════════════════════════════════════════════════
-- 011 — `demo_documents.currency` passe en minuscules
--
-- Cette colonne était la dernière à écrire ses devises en majuscules ('EUR').
-- Partout ailleurs dans la base fusionnée elles sont en minuscules :
-- `commissions.currency`, `stripe_subscriptions.currency`, et la fonction
-- `public.currency_for_country()` qui rend 'eur' ou 'usd'. Deux conventions pour
-- la même chose dans une base commune, c'est une jointure ratée qui attend.
--
-- Ordre des opérations : la contrainte CHECK doit tomber AVANT la conversion,
-- sinon elle rejette 'eur' au moment même où on l'écrit.
--
-- Idempotent, rejouable, et sans effet si la table n'existe pas.
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF to_regclass('public.demo_documents') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.demo_documents DROP CONSTRAINT IF EXISTS demo_documents_currency_chk;

  UPDATE public.demo_documents
     SET currency = lower(currency)
   WHERE currency IS NOT NULL AND currency <> lower(currency);

  ALTER TABLE public.demo_documents ALTER COLUMN currency SET DEFAULT 'eur';

  ALTER TABLE public.demo_documents
    ADD CONSTRAINT demo_documents_currency_chk CHECK (currency IN ('eur', 'usd', 'idr'));
END $$;

NOTIFY pgrst, 'reload schema';
