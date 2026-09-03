// ⚠️ MODULE SERVEUR UNIQUEMENT (lit VAPI_PRIVATE_KEY).

import { select, upsert, q } from "./supabase";
import { DEMO_TENANTS, type DemoTenant } from "./registry";
import type { UsageDay, UsageSummary } from "./types";

/* ════════════════════════════════════════════════════════════════════════════
   Consommation : appels vocaux + messages écrits.

   Deux temps, et l'ordre compte :

   1. SYNCHRO (`syncUsage`) — interroge l'API Vapi et écrit l'agrégat du jour
      dans `public.demo_usage_daily`.
   2. LECTURE (`readUsage`) — l'espace client lit UNIQUEMENT Supabase.

   Pourquoi ce détour plutôt qu'un appel direct à Vapi au chargement de la page :
   le plan Vapi ne conserve que **14 JOURS** d'historique d'appels — au-delà,
   l'API répond 400 « exceeds your retention window » (vérifié le 2026-09-03).
   Un tableau de bord branché en direct sur Vapi oublierait donc tout au bout de
   deux semaines. L'archive quotidienne est la mémoire longue du suivi.
   ════════════════════════════════════════════════════════════════════════════ */

const VAPI_API = "https://api.vapi.ai";
/** Marge de sécurité sous la fenêtre de rétention Vapi (14 j annoncés). */
export const VAPI_RETENTION_DAYS = 13;
/**
 * Les CONVERSATIONS ÉCRITES, elles, ne sont pas rognées par la rétention :
 * `GET /chat` renvoie encore des sessions vieilles de plusieurs semaines. On
 * archive donc bien plus large pour les messages que pour les appels, sinon la
 * moitié de la consommation écrite serait perdue à chaque synchro.
 */
export const CHAT_LOOKBACK_DAYS = 180;

type VapiCall = {
  id: string;
  assistantId?: string;
  createdAt?: string;
  startedAt?: string;
  endedAt?: string;
  cost?: number;
};

type VapiChat = {
  id: string;
  assistantId?: string;
  createdAt?: string;
  cost?: number;
  messages?: unknown[];
  input?: unknown[];
  output?: unknown[];
};

async function vapi<T>(path: string): Promise<T> {
  const key = process.env.VAPI_PRIVATE_KEY;
  if (!key) throw new Error("VAPI_PRIVATE_KEY manquante");
  const res = await fetch(`${VAPI_API}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Vapi ${res.status} sur ${path} — ${text.slice(0, 200)}`);
  return JSON.parse(text) as T;
}

function dayKey(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(iso));
}

function emptyDay(day: string): UsageDay {
  return { day, calls: 0, call_seconds: 0, call_cost: 0, chats: 0, chat_messages: 0, chat_cost: 0 };
}

/* ── 1. Synchro depuis Vapi ───────────────────────────────────────────────── */

export type SyncResult = { slug: string; days: number; calls: number; chats: number; error?: string };

/** Agrège les appels et les chats d'un tenant, jour par jour, puis upsert. */
export async function syncTenantUsage(tenant: DemoTenant, days = VAPI_RETENTION_DAYS): Promise<SyncResult> {
  const since = new Date(Date.now() - days * 86400_000);
  const sinceIso = since.toISOString();

  const buckets = new Map<string, UsageDay>();
  const bucket = (iso: string): UsageDay => {
    const key = dayKey(iso, tenant.timezone);
    let b = buckets.get(key);
    if (!b) { b = emptyDay(key); buckets.set(key, b); }
    return b;
  };

  let calls: VapiCall[] = [];
  let chats: VapiChat[] = [];

  try {
    calls = await vapi<VapiCall[]>(
      `/call?assistantId=${encodeURIComponent(tenant.assistantId)}&limit=1000` +
        `&createdAtGe=${encodeURIComponent(sinceIso)}`,
    );
  } catch (err) {
    // Fenêtre de rétention dépassée, clé invalide, réseau : on remonte l'erreur
    // au lieu d'archiver un zéro qui passerait pour « aucun appel ce jour-là ».
    return {
      slug: tenant.slug, days: 0, calls: 0, chats: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  for (const c of Array.isArray(calls) ? calls : []) {
    const at = c.startedAt ?? c.createdAt;
    if (!at) continue;
    const b = bucket(at);
    b.calls += 1;
    b.call_cost += c.cost ?? 0;
    if (c.startedAt && c.endedAt) {
      const secs = (new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime()) / 1000;
      if (secs > 0) b.call_seconds += Math.round(secs);
    }
  }

  try {
    const res = await vapi<{ results?: VapiChat[] } | VapiChat[]>(
      `/chat?assistantId=${encodeURIComponent(tenant.assistantId)}&limit=1000`,
    );
    chats = Array.isArray(res) ? res : (res.results ?? []);
  } catch {
    // Les chats sont un bonus : une erreur ici ne doit pas perdre les appels
    // déjà agrégés. On archive ce qu'on a.
    chats = [];
  }

  const chatSince = new Date(Date.now() - CHAT_LOOKBACK_DAYS * 86400_000).toISOString();
  for (const ch of chats) {
    if (!ch.createdAt || ch.createdAt < chatSince) continue;
    const b = bucket(ch.createdAt);
    b.chats += 1;
    b.chat_cost += ch.cost ?? 0;
    // Un « message » = un tour de parole écrit, côté client comme côté assistant.
    const count = Array.isArray(ch.messages)
      ? ch.messages.length
      : (Array.isArray(ch.input) ? ch.input.length : 0) +
        (Array.isArray(ch.output) ? ch.output.length : 0);
    b.chat_messages += count;
  }

  const rows = [...buckets.values()].map((d) => ({
    assistant_id: tenant.assistantId,
    demo_slug: tenant.slug,
    day: d.day,
    calls: d.calls,
    call_seconds: d.call_seconds,
    call_cost: Number(d.call_cost.toFixed(4)),
    chats: d.chats,
    chat_messages: d.chat_messages,
    chat_cost: Number(d.chat_cost.toFixed(4)),
    environment: "prod",
    synced_at: new Date().toISOString(),
  }));

  if (rows.length > 0) await upsert("demo_usage_daily", rows, "assistant_id,day");

  return {
    slug: tenant.slug,
    days: rows.length,
    calls: rows.reduce((s, r) => s + r.calls, 0),
    chats: rows.reduce((s, r) => s + r.chats, 0),
  };
}

/** Synchronise les douze démos. Appelée par POST /api/portal/sync. */
export async function syncAllUsage(days = VAPI_RETENTION_DAYS): Promise<SyncResult[]> {
  const out: SyncResult[] = [];
  for (const tenant of DEMO_TENANTS) {
    try {
      out.push(await syncTenantUsage(tenant, days));
    } catch (err) {
      out.push({
        slug: tenant.slug, days: 0, calls: 0, chats: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return out;
}

/* ── 2. Lecture depuis Supabase ───────────────────────────────────────────── */

type UsageRow = UsageDay & { assistant_id: string; demo_slug: string | null };

/**
 * Consommation d'un tenant (ou de toutes les démos si `assistantId` est nul)
 * sur les `days` derniers jours, lue dans l'archive. Les jours sans activité
 * sont présents à zéro : une série trouée se lit mal en graphe.
 */
export async function readUsage(
  assistantId: string | null, days = 30,
): Promise<Omit<UsageSummary, "actions" | "bookings" | "cancels" | "reschedules">> {
  const from = new Date(Date.now() - (days - 1) * 86400_000);
  const fromKey = from.toISOString().slice(0, 10);
  const toKey = new Date().toISOString().slice(0, 10);

  const filters = [
    "select=day,calls,call_seconds,call_cost,chats,chat_messages,chat_cost,assistant_id,demo_slug",
    `day=gte.${fromKey}`,
    assistantId ? `assistant_id=eq.${q(assistantId)}` : "",
    "order=day.asc",
    "limit=5000",
  ].filter(Boolean);

  const rows = await select<UsageRow>("demo_usage_daily", filters.join("&"));

  const byDay = new Map<string, UsageDay>();
  for (let i = 0; i < days; i++) {
    const key = new Date(from.getTime() + i * 86400_000).toISOString().slice(0, 10);
    byDay.set(key, emptyDay(key));
  }
  for (const r of rows) {
    const d = byDay.get(r.day) ?? emptyDay(r.day);
    d.calls += r.calls;
    d.call_seconds += r.call_seconds;
    d.call_cost += Number(r.call_cost);
    d.chats += r.chats;
    d.chat_messages += r.chat_messages;
    d.chat_cost += Number(r.chat_cost);
    byDay.set(r.day, d);
  }

  const series = [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
  return {
    from: fromKey,
    to: toKey,
    days: series,
    calls: series.reduce((s, d) => s + d.calls, 0),
    callSeconds: series.reduce((s, d) => s + d.call_seconds, 0),
    callCost: series.reduce((s, d) => s + d.call_cost, 0),
    chats: series.reduce((s, d) => s + d.chats, 0),
    chatMessages: series.reduce((s, d) => s + d.chat_messages, 0),
    chatCost: series.reduce((s, d) => s + d.chat_cost, 0),
  };
}

/** Consommation par démo sur la période — alimente le classement de l'espace admin. */
export async function readUsageByTenant(days = 30): Promise<Map<string, UsageDay>> {
  const from = new Date(Date.now() - (days - 1) * 86400_000).toISOString().slice(0, 10);
  const rows = await select<UsageRow>(
    "demo_usage_daily",
    `select=day,calls,call_seconds,call_cost,chats,chat_messages,chat_cost,assistant_id,demo_slug` +
      `&day=gte.${from}&order=day.asc&limit=5000`,
  );
  const out = new Map<string, UsageDay>();
  for (const r of rows) {
    const key = r.assistant_id;
    const acc = out.get(key) ?? emptyDay("total");
    acc.calls += r.calls;
    acc.call_seconds += r.call_seconds;
    acc.call_cost += Number(r.call_cost);
    acc.chats += r.chats;
    acc.chat_messages += r.chat_messages;
    acc.chat_cost += Number(r.chat_cost);
    out.set(key, acc);
  }
  return out;
}
