// ⚠️ MODULE SERVEUR UNIQUEMENT.

import {
  listActions, listAllActions, listAllCustomers, listAllReservations,
  listCustomers, listReservations,
} from "./ledger";
import { readUsage, readUsageByTenant } from "./usage";
import { DEMO_TENANTS, type DemoTenant } from "./registry";
import type {
  PortalAction, PortalCustomer, PortalReservation, UsageDay, UsageSummary,
} from "./types";

/* ════════════════════════════════════════════════════════════════════════════
   Assemblage des données d'un espace. Un seul aller-retour de préparation,
   côté serveur, pour que la page arrive complète : un tableau de bord qui
   s'affiche vide puis se remplit en quatre vagues donne l'impression d'un outil
   qui rame, même quand il est rapide.

   Tout vient de Supabase. L'API Vapi n'est jamais interrogée au chargement
   d'une page : elle n'est sollicitée que par la synchro (cf. lib/portal/usage.ts).
   ════════════════════════════════════════════════════════════════════════════ */

export type PeriodDays = 7 | 30 | 90;

/** Compte les actions de la période — c'est le rendement de la consommation. */
function countActions(actions: PortalAction[], fromIso: string) {
  const inPeriod = actions.filter((a) => a.occurred_at >= fromIso);
  return {
    actions: inPeriod.length,
    bookings: inPeriod.filter(
      (a) => a.action === "booking_created" || a.action === "order_placed" ||
             a.action === "intervention_requested" || a.action === "quote_requested",
    ).length,
    cancels: inPeriod.filter((a) => a.action === "booking_cancelled").length,
    reschedules: inPeriod.filter((a) => a.action === "booking_rescheduled").length,
  };
}

export type TenantDashboardData = {
  tenant: DemoTenant;
  period: PeriodDays;
  usage: UsageSummary;
  reservations: PortalReservation[];
  actions: PortalAction[];
  customers: PortalCustomer[];
  /** Renseigné si Supabase est injoignable : l'espace le dit au lieu d'afficher zéro. */
  error?: string;
};

export async function loadTenantDashboard(
  tenant: DemoTenant, period: PeriodDays = 30,
): Promise<TenantDashboardData> {
  const fromIso = new Date(Date.now() - (period - 1) * 86400_000).toISOString();
  try {
    const [usageBase, reservations, actions, customers] = await Promise.all([
      readUsage(tenant.assistantId, period),
      listReservations(tenant.assistantId),
      listActions(tenant.assistantId, 300),
      listCustomers(tenant.assistantId),
    ]);
    return {
      tenant, period,
      usage: { ...usageBase, ...countActions(actions, fromIso) },
      reservations, actions, customers,
    };
  } catch (err) {
    return {
      tenant, period,
      usage: emptyUsage(period),
      reservations: [], actions: [], customers: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export type AdminRow = {
  tenant: DemoTenant;
  usage: UsageDay;
  actions: number;
  bookings: number;
  cancels: number;
  upcoming: number;
  customers: number;
  lastActionAt: string | null;
  accessCode: string;
  /** Identifiants de démonstration de CETTE vitrine, `null` si les comptes sont fermés. */
  testAccount: { email: string; password: string } | null;
};

export type AdminDashboardData = {
  period: PeriodDays;
  rows: AdminRow[];
  usage: UsageSummary;
  actions: PortalAction[];
  reservations: PortalReservation[];
  error?: string;
};

export async function loadAdminDashboard(
  period: PeriodDays = 30,
  accessCode: (slug: string) => string,
  testAccount: (slug: string) => { email: string; password: string } | null = () => null,
): Promise<AdminDashboardData> {
  const fromIso = new Date(Date.now() - (period - 1) * 86400_000).toISOString();
  const nowIso = new Date().toISOString();
  try {
    const [usageBase, byTenant, reservations, actions, customers] = await Promise.all([
      readUsage(null, period),
      readUsageByTenant(period),
      listAllReservations(),
      listAllActions(400),
      listAllCustomers(),
    ]);

    const rows: AdminRow[] = DEMO_TENANTS.map((tenant) => {
      const own = actions.filter((a) => a.assistant_id === tenant.assistantId);
      const ownInPeriod = own.filter((a) => a.occurred_at >= fromIso);
      const ownRes = reservations.filter((r) => r.assistant_id === tenant.assistantId);
      return {
        tenant,
        usage: byTenant.get(tenant.assistantId) ?? {
          day: "total", calls: 0, call_seconds: 0, call_cost: 0,
          chats: 0, chat_messages: 0, chat_cost: 0,
        },
        actions: ownInPeriod.length,
        bookings: ownInPeriod.filter((a) => a.action === "booking_created" ||
          a.action === "order_placed" || a.action === "intervention_requested").length,
        cancels: ownInPeriod.filter((a) => a.action === "booking_cancelled").length,
        upcoming: ownRes.filter(
          (r) => r.starts_at && r.starts_at >= nowIso &&
                 r.status !== "cancelled" && r.status !== "done",
        ).length,
        customers: customers.filter((c) => c.assistant_id === tenant.assistantId).length,
        lastActionAt: own[0]?.occurred_at ?? null,
        accessCode: accessCode(tenant.slug),
        testAccount: testAccount(tenant.slug),
      };
    });

    return {
      period, rows, actions, reservations,
      usage: { ...usageBase, ...countActions(actions, fromIso) },
    };
  } catch (err) {
    return {
      period,
      rows: DEMO_TENANTS.map((tenant) => ({
        tenant,
        usage: { day: "total", calls: 0, call_seconds: 0, call_cost: 0, chats: 0, chat_messages: 0, chat_cost: 0 },
        actions: 0, bookings: 0, cancels: 0, upcoming: 0, customers: 0,
        lastActionAt: null, accessCode: accessCode(tenant.slug),
        testAccount: testAccount(tenant.slug),
      })),
      usage: emptyUsage(period),
      actions: [], reservations: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function emptyUsage(period: PeriodDays): UsageSummary {
  const from = new Date(Date.now() - (period - 1) * 86400_000);
  const days: UsageDay[] = Array.from({ length: period }, (_, i) => ({
    day: new Date(from.getTime() + i * 86400_000).toISOString().slice(0, 10),
    calls: 0, call_seconds: 0, call_cost: 0, chats: 0, chat_messages: 0, chat_cost: 0,
  }));
  return {
    from: days[0].day, to: days[days.length - 1].day, days,
    calls: 0, callSeconds: 0, callCost: 0, chats: 0, chatMessages: 0, chatCost: 0,
    actions: 0, bookings: 0, cancels: 0, reschedules: 0,
  };
}
