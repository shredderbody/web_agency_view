-- Ajoute domain_name (nullable, indexée) à TOUTES les tables public — traçabilité
-- du domaine/projet d'origine de chaque enregistrement. Idempotent, rejouable.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS domain_name text;',
      r.table_name);
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (domain_name);',
      r.table_name || '_domain_name_idx', r.table_name);
  END LOOP;
END $$;
