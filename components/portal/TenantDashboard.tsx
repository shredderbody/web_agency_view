"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, ClipboardList, Gauge, UsersRound } from "lucide-react";
import type { TenantDashboardData } from "@/lib/portal/dashboard";
import { spaceHref } from "@/lib/portal/paths";
import PortalBar from "./PortalBar";
import StatTiles from "./StatTiles";
import UsageChart from "./UsageChart";
import ReservationsBoard from "./ReservationsBoard";
import ActionFeed from "./ActionFeed";
import CustomerTable from "./CustomerTable";
import { fmtCost, fmtDayLabel, fmtDuration, fmtNumber } from "./format";

/* Espace d'une démo. Quatre onglets, un par question que se pose l'exploitant :
   ce que ça consomme · ce qui est réservé · ce qui s'est passé · qui sont mes
   clients. Les données arrivent complètes du serveur : changer d'onglet
   n'attend aucun réseau. */

const TABS = [
  { id: "usage", label: "Consommation", icon: Gauge },
  { id: "bookings", label: "Réservations", icon: CalendarDays },
  { id: "journal", label: "Journal", icon: ClipboardList },
  { id: "customers", label: "Clients", icon: UsersRound },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PERIODS = [
  { days: 7, label: "7 j" },
  { days: 30, label: "30 j" },
  { days: 90, label: "90 j" },
] as const;

export default function TenantDashboard({
  data, isAdmin,
}: {
  data: TenantDashboardData;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("usage");
  const { tenant, usage } = data;

  const counts: Record<TabId, number | null> = {
    usage: null,
    bookings: data.reservations.length,
    journal: data.actions.length,
    customers: data.customers.length,
  };

  return (
    <div className="esp-shell">
      <PortalBar
        title={tenant.business}
        subtitle={tenant.city}
        demoHref={`/demo/${tenant.slug}`}
        isAdmin={isAdmin}
        adminHome={isAdmin}
      />

      <main className="esp-main">
        <div className="esp-wrap">
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <div>
              <h1 className="esp-h1">Suivi de votre standardiste</h1>
              <p className="esp-lead" style={{ marginTop: "0.3rem" }}>
                {tenant.trade} · période du {fmtDayLabel(usage.from)} au {fmtDayLabel(usage.to)}.
              </p>
            </div>
            <div className="esp-seg" style={{ marginLeft: "auto" }} role="group" aria-label="Période">
              {PERIODS.map((p) => (
                <button
                  key={p.days} type="button" className="esp-seg-b"
                  aria-pressed={data.period === p.days}
                  onClick={() => router.push(`${spaceHref(tenant.slug)}?p=${p.days}`)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {data.error && (
            <p className="esp-note esp-note-bad" role="alert" style={{ marginBottom: "1.25rem" }}>
              <AlertCircle size={15} aria-hidden />
              <span>
                <b>Les données n&apos;ont pas pu être lues.</b> {data.error}
                <br />
                Rien n&apos;est perdu : l&apos;affichage ci-dessous est vide, pas la base.
              </span>
            </p>
          )}

          <div className="esp-tabs" role="tablist">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id} type="button" role="tab" className="esp-tab"
                aria-selected={tab === id} onClick={() => setTab(id)}
              >
                <Icon size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
                {label}
                {counts[id] !== null && <span className="esp-tab-count">{counts[id]}</span>}
              </button>
            ))}
          </div>

          {tab === "usage" && (
            <div className="esp-stack">
              <StatTiles usage={usage} />

              <section className="esp-panel">
                <header className="esp-panel-head">
                  <h2 className="esp-h2">Consommation jour par jour</h2>
                  <span className="esp-small">
                    {fmtNumber(usage.calls + usage.chats)} échange{usage.calls + usage.chats > 1 ? "s" : ""} sur la période
                  </span>
                </header>
                <div className="esp-panel-body">
                  <UsageChart days={usage.days} timezone={tenant.timezone} />
                </div>
              </section>

              <section className="esp-panel">
                <header className="esp-panel-head">
                  <h2 className="esp-h2">Détail chiffré</h2>
                  <span className="esp-small">Les jours sans activité sont masqués.</span>
                </header>
                <div className="esp-tablewrap">
                  <table className="esp-table">
                    <thead>
                      <tr>
                        <th scope="col">Jour</th>
                        <th scope="col" className="n">Appels</th>
                        <th scope="col" className="n">Durée</th>
                        <th scope="col" className="n">Conversations écrites</th>
                        <th scope="col" className="n">Messages</th>
                        <th scope="col" className="n">Coût</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usage.days.filter((d) => d.calls + d.chats > 0).reverse().map((d) => {
                        const dur = fmtDuration(d.call_seconds);
                        return (
                          <tr key={d.day}>
                            <td>{fmtDayLabel(d.day)}</td>
                            <td className="n">{d.calls || "—"}</td>
                            <td className="n">{d.call_seconds ? `${dur.value}${dur.unit}` : "—"}</td>
                            <td className="n">{d.chats || "—"}</td>
                            <td className="n">{d.chat_messages || "—"}</td>
                            <td className="n">{fmtCost(d.call_cost + d.chat_cost)} $</td>
                          </tr>
                        );
                      })}
                      {usage.days.every((d) => d.calls + d.chats === 0) && (
                        <tr>
                          <td colSpan={6} style={{ color: "var(--esp-ink-3)", textAlign: "center", padding: "1.5rem" }}>
                            Aucune consommation sur la période. La synchronisation remonte
                            les appels des 14 derniers jours et les conversations écrites plus anciennes.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {tab === "bookings" && (
            <ReservationsBoard tenant={tenant} reservations={data.reservations} canEdit />
          )}

          {tab === "journal" && (
            <ActionFeed actions={data.actions} timezone={tenant.timezone} />
          )}

          {tab === "customers" && <CustomerTable customers={data.customers} />}
        </div>
      </main>
    </div>
  );
}
