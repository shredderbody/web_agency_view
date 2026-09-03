"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, Check, ClipboardCopy, Gauge } from "lucide-react";
import type { AdminDashboardData } from "@/lib/portal/dashboard";
import PortalBar from "./PortalBar";
import StatTiles from "./StatTiles";
import UsageChart from "./UsageChart";
import ActionFeed from "./ActionFeed";
import { fmtAgo, fmtCost, fmtDayLabel, fmtDuration, fmtNumber } from "./format";

/* Vision administrateur : les douze démos d'un coup d'œil, la consommation
   consolidée, et le journal de TOUTES les actions.

   La colonne « code d'accès » est la raison pratique d'être de cet écran :
   quand un client demande comment entrer, la réponse est ici, copiable en un
   clic — pas dans un fichier de configuration. */

const PERIODS = [
  { days: 7, label: "7 j" },
  { days: 30, label: "30 j" },
  { days: 90, label: "90 j" },
] as const;

export default function AdminBoard({ data }: { data: AdminDashboardData }) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  const sorted = [...data.rows].sort(
    (a, b) => (b.usage.calls + b.usage.chats + b.actions) - (a.usage.calls + a.usage.chats + a.actions),
  );
  const labelOf = (slug: string | null) =>
    data.rows.find((r) => r.tenant.slug === slug)?.tenant.business ?? slug ?? "—";

  const copy = async (slug: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(slug);
      setTimeout(() => setCopied((c) => (c === slug ? null : c)), 2000);
    } catch {
      setCopied(null);
    }
  };

  const totalUpcoming = data.rows.reduce((s, r) => s + r.upcoming, 0);
  const totalCustomers = data.rows.reduce((s, r) => s + r.customers, 0);

  return (
    <div className="esp-shell">
      <PortalBar title="Administration" subtitle="12 vitrines" isAdmin adminHome />

      <main className="esp-main">
        <div className="esp-wrap esp-stack">
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h1 className="esp-h1">Toutes les vitrines</h1>
              <p className="esp-lead" style={{ marginTop: "0.3rem" }}>
                Consommation consolidée et journal complet, du {fmtDayLabel(data.usage.from)} au{" "}
                {fmtDayLabel(data.usage.to)}. {totalUpcoming} réservation
                {totalUpcoming > 1 ? "s" : ""} à venir · {totalCustomers} client
                {totalCustomers > 1 ? "s" : ""} au fichier.
              </p>
            </div>
            <div className="esp-seg" style={{ marginLeft: "auto" }} role="group" aria-label="Période">
              {PERIODS.map((p) => (
                <button
                  key={p.days} type="button" className="esp-seg-b"
                  aria-pressed={data.period === p.days}
                  onClick={() => router.push(`/espace/admin?p=${p.days}`)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {data.error && (
            <p className="esp-note esp-note-bad" role="alert">
              <AlertCircle size={15} aria-hidden />
              <span><b>Lecture Supabase impossible.</b> {data.error}</span>
            </p>
          )}

          <StatTiles usage={data.usage} />

          <section className="esp-panel">
            <header className="esp-panel-head">
              <h2 className="esp-h2">Consommation consolidée</h2>
              <span className="esp-small">Les douze vitrines cumulées</span>
            </header>
            <div className="esp-panel-body">
              <UsageChart days={data.usage.days} timezone="Europe/Paris" />
            </div>
          </section>

          <section className="esp-panel">
            <header className="esp-panel-head">
              <h2 className="esp-h2">Par vitrine</h2>
              <span className="esp-small">Classées par activité sur la période</span>
            </header>
            <div className="esp-tablewrap">
              <table className="esp-table">
                <thead>
                  <tr>
                    <th scope="col">Vitrine</th>
                    <th scope="col" className="n">Appels</th>
                    <th scope="col" className="n">Durée</th>
                    <th scope="col" className="n">Messages</th>
                    <th scope="col" className="n">Actions</th>
                    <th scope="col" className="n">À venir</th>
                    <th scope="col" className="n">Clients</th>
                    <th scope="col" className="n">Coût</th>
                    <th scope="col">Dernier signe</th>
                    <th scope="col">Code d&apos;accès</th>
                    <th scope="col"><span className="esp-micro">Espace</span></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => {
                    const dur = fmtDuration(r.usage.call_seconds);
                    const quiet = r.actions === 0 && r.usage.calls === 0 && r.usage.chats === 0;
                    return (
                      <tr key={r.tenant.slug}>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                            <span
                              aria-hidden
                              style={{
                                width: "0.6rem", height: "0.6rem", borderRadius: "2px",
                                background: r.tenant.accent, flex: "none",
                              }}
                            />
                            <span style={{ fontWeight: 600 }}>{r.tenant.business}</span>
                            {r.tenant.real && (
                              <span className="esp-micro" title="Bâtie sur les données réelles d'un commerce">réel</span>
                            )}
                          </span>
                          <br />
                          <span className="esp-micro">{r.tenant.city}</span>
                        </td>
                        <td className="n">{r.usage.calls || "—"}</td>
                        <td className="n">{r.usage.call_seconds ? `${dur.value}${dur.unit}` : "—"}</td>
                        <td className="n">{r.usage.chat_messages || "—"}</td>
                        <td className="n" style={{ fontWeight: 600 }}>{r.actions || "—"}</td>
                        <td className="n">{r.upcoming || "—"}</td>
                        <td className="n">{r.customers || "—"}</td>
                        <td className="n">{fmtCost(r.usage.call_cost + r.usage.chat_cost)} $</td>
                        <td className="esp-small" style={{ color: quiet ? "var(--esp-ink-3)" : undefined }}>
                          {r.lastActionAt ? fmtAgo(r.lastActionAt) : "jamais"}
                        </td>
                        <td>
                          <button
                            type="button" className="esp-btn esp-btn-sm esp-btn-quiet esp-code"
                            onClick={() => copy(r.tenant.slug, r.accessCode)}
                            title="Copier le code d'accès"
                          >
                            {r.accessCode}
                            {copied === r.tenant.slug
                              ? <Check size={12} aria-hidden style={{ color: "var(--esp-ok)" }} />
                              : <ClipboardCopy size={12} aria-hidden />}
                          </button>
                        </td>
                        <td>
                          <Link className="esp-btn esp-btn-sm" href={`/espace/${r.tenant.slug}`}>
                            Ouvrir <ArrowUpRight size={12} aria-hidden />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="esp-panel-body" style={{ paddingTop: "0.9rem" }}>
              <p className="esp-note">
                <Gauge size={15} aria-hidden />
                <span>
                  Les codes ci-dessus sont dérivés de <code>PORTAL_SECRET</code>. Changer ce
                  secret les régénère tous et ferme toutes les sessions ouvertes. Pour figer
                  le code d&apos;un client, poser <code>PORTAL_CODE_&lt;SLUG&gt;</code> dans le{" "}
                  <code>.env</code>. Les appels Vapi ne sont conservés que 14 jours côté
                  fournisseur : la synchronisation doit tourner au moins une fois par semaine.
                </span>
              </p>
            </div>
          </section>

          <ActionFeed
            actions={data.actions}
            timezone="Europe/Paris"
            showTenant
            slugLabel={labelOf}
          />
        </div>
      </main>
    </div>
  );
}
