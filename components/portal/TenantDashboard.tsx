"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, ClipboardList, FileText, Gauge, Home, UsersRound } from "lucide-react";
import type { TenantDashboardData } from "@/lib/portal/dashboard";
import { dashboardHref, quotesHref, spaceHref } from "@/lib/portal/paths";
import { usePortalI18n } from "@/lib/portal/i18nClient";
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
  { id: "usage", icon: Gauge },
  { id: "bookings", icon: CalendarDays },
  { id: "journal", icon: ClipboardList },
  { id: "customers", icon: UsersRound },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PERIODS = [7, 30, 90] as const;

export default function TenantDashboard({
  data, isAdmin,
}: {
  data: TenantDashboardData;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const { lang, t } = usePortalI18n();
  const [tab, setTab] = useState<TabId>("usage");
  const { tenant, usage } = data;

  const tabLabel: Record<TabId, string> = {
    usage: t.dash.tabUsage, bookings: t.dash.tabBookings,
    journal: t.dash.tabJournal, customers: t.dash.tabCustomers,
  };

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
              <h1 className="esp-h1">{t.dash.title}</h1>
              <p className="esp-lead" style={{ marginTop: "0.3rem" }}>
                {t.dash.lead(tenant.trade, fmtDayLabel(usage.from, lang), fmtDayLabel(usage.to, lang))}
              </p>
            </div>
            {/* Les deux voisins du suivi : l'accueil dont on vient, et l'outil
                de devis. Ce dernier n'est PAS un cinquième onglet — il en aurait
                fait une sous-partie de la consommation, alors que c'est un autre
                métier : on suit sa standardiste, on FACTURE ses clients. */}
            <div className="esp-dash-links">
              <a className="esp-btn esp-btn-sm" href={spaceHref(tenant.slug)}>
                <Home size={13} aria-hidden /> {t.dash.home}
              </a>
              <a className="esp-btn esp-btn-sm" href={quotesHref(tenant.slug)}>
                <FileText size={13} aria-hidden /> {t.dash.quotesBtn}
              </a>
            </div>
            <div className="esp-seg" role="group" aria-label={t.dash.periodAria}>
              {PERIODS.map((d) => (
                <button
                  key={d} type="button" className="esp-seg-b"
                  aria-pressed={data.period === d}
                  onClick={() => router.push(`${dashboardHref(tenant.slug)}?p=${d}`)}
                >
                  {t.dash.period(d)}
                </button>
              ))}
            </div>
          </div>

          {data.error && (
            <p className="esp-note esp-note-bad" role="alert" style={{ marginBottom: "1.25rem" }}>
              <AlertCircle size={15} aria-hidden />
              <span>
                <b>{t.dash.errT}</b> {data.error}
                <br />
                {t.dash.errD}
              </span>
            </p>
          )}

          <div className="esp-tabs" role="tablist">
            {TABS.map(({ id, icon: Icon }) => (
              <button
                key={id} type="button" role="tab" className="esp-tab"
                aria-selected={tab === id} onClick={() => setTab(id)}
              >
                <Icon size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
                {tabLabel[id]}
                {counts[id] !== null && <span className="esp-tab-count">{counts[id]}</span>}
              </button>
            ))}
          </div>

          {tab === "usage" && (
            <div className="esp-stack">
              <StatTiles usage={usage} />

              <section className="esp-panel">
                <header className="esp-panel-head">
                  <h2 className="esp-h2">{t.dash.dailyT}</h2>
                  <span className="esp-small">{t.dash.dailyD(usage.calls + usage.chats)}</span>
                </header>
                <div className="esp-panel-body">
                  <UsageChart days={usage.days} timezone={tenant.timezone} />
                </div>
              </section>

              <section className="esp-panel">
                <header className="esp-panel-head">
                  <h2 className="esp-h2">{t.dash.detailT}</h2>
                  <span className="esp-small">{t.dash.detailD}</span>
                </header>
                <div className="esp-tablewrap">
                  <table className="esp-table">
                    <thead>
                      <tr>
                        <th scope="col">{t.dash.colDay}</th>
                        <th scope="col" className="n">{t.dash.colCalls}</th>
                        <th scope="col" className="n">{t.dash.colDuration}</th>
                        <th scope="col" className="n">{t.dash.colChats}</th>
                        <th scope="col" className="n">{t.dash.colMessages}</th>
                        <th scope="col" className="n">{t.dash.colCost}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usage.days.filter((d) => d.calls + d.chats > 0).reverse().map((d) => {
                        const dur = fmtDuration(d.call_seconds, lang);
                        return (
                          <tr key={d.day}>
                            <td>{fmtDayLabel(d.day, lang)}</td>
                            <td className="n">{d.calls || "—"}</td>
                            <td className="n">{d.call_seconds ? `${dur.value}${dur.unit}` : "—"}</td>
                            <td className="n">{d.chats || "—"}</td>
                            <td className="n">{d.chat_messages || "—"}</td>
                            <td className="n">{fmtCost(d.call_cost + d.chat_cost, lang)} $</td>
                          </tr>
                        );
                      })}
                      {usage.days.every((d) => d.calls + d.chats === 0) && (
                        <tr>
                          <td colSpan={6} style={{ color: "var(--esp-ink-3)", textAlign: "center", padding: "1.5rem" }}>
                            {t.dash.noUsage}
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
