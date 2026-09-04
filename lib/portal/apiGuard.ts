// ⚠️ MODULE SERVEUR UNIQUEMENT.

import { NextResponse } from "next/server";
import { canAccess, currentSession } from "./auth";
import { getTenant, type DemoTenant } from "./registry";

/* ════════════════════════════════════════════════════════════════════════════
   LA GARDE des API de l'espace, écrite une fois.

   Les quatre routes de l'outil de devis (documents, catalogue, clients,
   réglages) appliquent exactement le même contrôle : session, vitrine connue,
   droit d'accès. Recopier ces douze lignes quatre fois, c'est se donner quatre
   occasions d'en oublier une — et un contrôle d'accès oublié ne se voit pas à
   l'exécution, seulement le jour où quelqu'un le trouve.

   Renvoie soit le tenant, soit la réponse d'erreur à retourner telle quelle.
   ════════════════════════════════════════════════════════════════════════════ */

export type Guarded =
  | { ok: true; tenant: DemoTenant; isAdmin: boolean }
  | { ok: false; res: NextResponse };

export async function guard(slugFromRequest: string | null): Promise<Guarded> {
  const session = await currentSession();
  if (!session) {
    return { ok: false, res: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  const slug = slugFromRequest?.trim() || session.slug;
  const tenant = getTenant(slug);
  if (!tenant) {
    return { ok: false, res: NextResponse.json({ error: "tenant inconnu" }, { status: 404 }) };
  }
  if (!canAccess(session, slug)) {
    return { ok: false, res: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { ok: true, tenant, isAdmin: session.role === "admin" };
}

/** Lit un corps JSON sans jamais lever. */
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return null;
  }
}

/* ── Normalisation ────────────────────────────────────────────────────────────
   Tout ce qui arrive du navigateur est réécrit avant d'être stocké. Ces trois
   fonctions sont celles de `/api/portal/documents`, sorties ici pour que les
   quatre routes bornent leurs entrées de la même façon.                       */

export function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max).trim() : "";
}

export function nullableStr(v: unknown, max: number): string | null {
  const s = str(v, max);
  return s === "" ? null : s;
}

/** Un nombre fini, borné. Tout le reste vaut `fallback`. */
export function num(v: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function nullableNum(v: unknown, min: number, max: number): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}
