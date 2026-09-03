// ⚠️ MODULE SERVEUR UNIQUEMENT. N'importer que depuis un Server Component,
//    une route handler ou un script : il lit la clé service_role.

/* ════════════════════════════════════════════════════════════════════════════
   Accès Supabase de l'espace client — PostgREST direct, service_role.

   Pourquoi pas `@supabase/supabase-js` : le projet n'a pas la dépendance et
   n'en a pas besoin. Toutes les tables du suivi (`demo_actions`,
   `demo_reservations`, `demo_customers`, `demo_usage_daily`, `demo_bookings`)
   ont RLS activé SANS policy : seule la clé service_role y accède, et elle ne
   quitte jamais le serveur. Un client JS apporterait de l'auth dont on ne se
   sert pas.

   QUEL PROJET : celui où le workflow n8n écrit réellement, c'est-à-dire
   GritUnited `bbxwezoscjuwsoflponx` (cf. docs/SUIVI_N8N_VAPI_DEMO.md).
   Il se configure via DEMO_DB_SUPABASE_URL / DEMO_DB_SUPABASE_SERVICE_ROLE_KEY.
   Repli sur NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (le projet du
   `.env`, où /api/vapi/booking écrit) pour rester fonctionnel sans config.
   ════════════════════════════════════════════════════════════════════════════ */

export type SupabaseTarget = { url: string; key: string };

export function demoDb(): SupabaseTarget | null {
  const url = process.env.DEMO_DB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.DEMO_DB_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

export class SupabaseError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "SupabaseError";
  }
}

type RestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  /** Query PostgREST déjà encodée, ex. `select=*&assistant_id=eq.abc`. */
  query?: string;
  body?: unknown;
  /** En-tête `Prefer` (ex. `return=representation`, `resolution=merge-duplicates`). */
  prefer?: string;
};

/**
 * Un appel PostgREST. Lève `SupabaseError` — les appelants qui veulent du
 * best-effort attrapent ; l'espace client, lui, préfère afficher une erreur
 * honnête plutôt qu'un tableau vide qui ferait croire à zéro réservation.
 */
export async function rest<T>(table: string, opts: RestOptions = {}): Promise<T> {
  const target = demoDb();
  if (!target) {
    throw new SupabaseError("Supabase non configuré (DEMO_DB_SUPABASE_URL manquant)", 500);
  }
  const url = `${target.url}/rest/v1/${table}${opts.query ? `?${opts.query}` : ""}`;
  const headers: Record<string, string> = {
    apikey: target.key,
    Authorization: `Bearer ${target.key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (opts.prefer) headers.Prefer = opts.prefer;

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new SupabaseError(`Supabase ${res.status} sur ${table}`, res.status, text.slice(0, 400));
  }
  if (!text) return [] as unknown as T;
  return JSON.parse(text) as T;
}

/** SELECT. `query` est un filtre PostgREST déjà construit. */
export function select<T>(table: string, query: string): Promise<T[]> {
  return rest<T[]>(table, { query });
}

/** INSERT et renvoie les lignes créées. */
export function insert<T>(table: string, rows: unknown): Promise<T[]> {
  return rest<T[]>(table, {
    method: "POST",
    body: rows,
    prefer: "return=representation",
  });
}

/**
 * UPSERT sur une contrainte unique (`on_conflict`). Utilisé par la synchro de
 * consommation (une ligne par tenant et par jour) et par la fiche client.
 */
export function upsert<T>(table: string, rows: unknown, onConflict: string): Promise<T[]> {
  return rest<T[]>(table, {
    method: "POST",
    query: `on_conflict=${encodeURIComponent(onConflict)}`,
    body: rows,
    prefer: "resolution=merge-duplicates,return=representation",
  });
}

/** UPDATE ciblé par un filtre PostgREST. */
export function update<T>(table: string, query: string, patch: unknown): Promise<T[]> {
  return rest<T[]>(table, {
    method: "PATCH",
    query,
    body: patch,
    prefer: "return=representation",
  });
}

/** Échappe une valeur pour un filtre PostgREST (`eq.`, `in.`…). */
export function q(value: string): string {
  return encodeURIComponent(value);
}
