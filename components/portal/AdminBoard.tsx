"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, AtSign, Check, ClipboardCopy, FileText, Gauge } from "lucide-react";
import type { AdminDashboardData } from "@/lib/portal/dashboard";
import { ADMIN_PATH, quotesHref, spaceHref } from "@/lib/portal/paths";
import { usePortalI18n } from "@/lib/portal/i18nClient";
import PortalBar from "./PortalBar";
import StatTiles from "./StatTiles";
import UsageChart from "./UsageChart";
import ActionFeed from "./ActionFeed";
import { fmtAgo, fmtCost, fmtDayLabel, fmtDuration } from "./format";

/* Vision administrateur : les douze démos d'un coup d'œil, la consommation
   consolidée, et le journal de TOUTES les actions.

   La colonne « accès » est la raison pratique d'être de cet écran : quand un
   client demande comment entrer, la réponse est ici, copiable en un clic — pas
   dans un fichier de configuration. Deux entrées par vitrine, et c'est voulu :
   le CODE dérivé (à dicter au téléphone) et le COMPTE DE DÉMONSTRATION
   (<slug>@debug.com + mot de passe), qui n'ouvre que cette vitrine — un
   prospect à qui on montre sa démo ne voit pas les onze autres.

   DEUX RENDUS pour « par vitrine », choisis en CSS (jamais en JavaScript : pas
   de mesure de fenêtre, donc pas de saut à l'hydratation) :
     • ≥ 1040 px — le tableau, onze colonnes comparables ligne à ligne ;
     • en dessous — une CARTE par vitrine. Onze colonnes dans un défilement
       horizontal sur téléphone, c'est un tableau qu'on ne lit jamais : le nom
       de l'enseigne sort de l'écran dès la deuxième colonne. */

const PERIODS = [7, 30, 90] as const;

export default function AdminBoard({ data }: { data: AdminDashboardData }) {
  const router = useRouter();
  const { lang, t } = usePortalI18n();
  const [copied, setCopied] = useState<string | null>(null);

  const sorted = [...data.rows].sort(
    (a, b) => (b.usage.calls + b.usage.chats + b.actions) - (a.usage.calls + a.usage.chats + a.actions),
  );
  const labelOf = (slug: string | null) =>
    data.rows.find((r) => r.tenant.slug === slug)?.tenant.business ?? slug ?? "—";

  /** `key` distingue les deux boutons d'une même ligne (code / compte). */
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      setCopied(null);
    }
  };

  const totalUpcoming = data.rows.reduce((s, r) => s + r.upcoming, 0);
  const totalCustomers = data.rows.reduce((s, r) => s + r.customers, 0);

  /** Durée d'appel formatée, ou tiret : même écriture dans le tableau et la carte. */
  const durationOf = (seconds: number) => {
    if (!seconds) return "—";
    const d = fmtDuration(seconds, lang);
    return `${d.value}${d.unit}`;
  };

  /** Le bouton « code d'accès », identique dans les deux rendus. */
  const codeButton = (slug: string, code: string) => (
    <button
      type="button" className="esp-btn esp-btn-sm esp-btn-quiet esp-code"
      onClick={() => copy(`${slug}:code`, code)}
      title={t.admin.copyCode}
    >
      {code}
      {copied === `${slug}:code`
        ? <Check size={12} aria-hidden style={{ color: "var(--esp-ok)" }} />
        : <ClipboardCopy size={12} aria-hidden />}
    </button>
  );

  /* Le compte de démonstration de la vitrine. Un clic copie les DEUX lignes,
     e-mail et mot de passe : c'est ce qu'on colle dans un message au prospect. */
  const accountButton = (slug: string, account: { email: string; password: string }) => (
    <button
      type="button" className="esp-btn esp-btn-sm esp-btn-quiet esp-account"
      onClick={() => copy(`${slug}:account`, `${account.email}\n${account.password}`)}
      title={t.admin.copyAccount}
    >
      <AtSign size={12} aria-hidden style={{ color: "var(--esp-ink-3)" }} />
      <span className="esp-account-mail">{account.email}</span>
      <span className="esp-account-pw">{account.password}</span>
      {copied === `${slug}:account`
        ? <Check size={12} aria-hidden style={{ color: "var(--esp-ok)" }} />
        : <ClipboardCopy size={12} aria-hidden />}
    </button>
  );

  return (
    <div className="esp-shell">
      <PortalBar title={t.admin.barTitle} subtitle={t.admin.barSub(data.rows.length)} isAdmin adminHome />

      <main className="esp-main">
        <div className="esp-wrap esp-stack">
          <div className="esp-pagehead">
            <div>
              <h1 className="esp-h1">{t.admin.title}</h1>
              <p className="esp-lead" style={{ marginTop: "0.3rem" }}>
                {t.admin.lead(
                  fmtDayLabel(data.usage.from, lang), fmtDayLabel(data.usage.to, lang),
                  totalUpcoming, totalCustomers,
                )}
              </p>
            </div>
            <div className="esp-seg" role="group" aria-label={t.dash.periodAria}>
              {PERIODS.map((d) => (
                <button
                  key={d} type="button" className="esp-seg-b"
                  aria-pressed={data.period === d}
                  onClick={() => router.push(`${ADMIN_PATH}?p=${d}`)}
                >
                  {t.dash.period(d)}
                </button>
              ))}
            </div>
          </div>

          {data.error && (
            <p className="esp-note esp-note-bad" role="alert">
              <AlertCircle size={15} aria-hidden />
              <span><b>{t.admin.errT}</b> {data.error}</span>
            </p>
          )}

          <StatTiles usage={data.usage} />

          <section className="esp-panel">
            <header className="esp-panel-head">
              <h2 className="esp-h2">{t.admin.consolidatedT}</h2>
              <span className="esp-small">{t.admin.consolidatedD(data.rows.length)}</span>
            </header>
            <div className="esp-panel-body">
              <UsageChart days={data.usage.days} timezone="Europe/Paris" />
            </div>
          </section>

          <section className="esp-panel">
            <header className="esp-panel-head">
              <h2 className="esp-h2">{t.admin.perT}</h2>
              <span className="esp-small">{t.admin.perD}</span>
            </header>

            {/* ── Grand écran : le tableau comparatif ─────────────────────── */}
            <div className="esp-tablewrap esp-wide-only">
              <table className="esp-table">
                <thead>
                  <tr>
                    <th scope="col">{t.admin.colVitrine}</th>
                    <th scope="col" className="n">{t.admin.colCalls}</th>
                    <th scope="col" className="n">{t.admin.colDuration}</th>
                    <th scope="col" className="n">{t.admin.colMessages}</th>
                    <th scope="col" className="n">{t.admin.colActions}</th>
                    <th scope="col" className="n">{t.admin.colUpcoming}</th>
                    <th scope="col" className="n">{t.admin.colCustomers}</th>
                    <th scope="col" className="n">{t.admin.colCost}</th>
                    <th scope="col">{t.admin.colLastSign}</th>
                    <th scope="col">{t.admin.colAccess}</th>
                    <th scope="col"><span className="esp-micro">{t.admin.colSpace}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => {
                    const quiet = r.actions === 0 && r.usage.calls === 0 && r.usage.chats === 0;
                    return (
                      <tr key={r.tenant.slug}>
                        {/* L'enseigne tient sur UNE ligne ; la mention « réel »
                            descend avec la ville, sinon un nom de vingt lettres
                            se coupe en deux au milieu du tableau. */}
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", whiteSpace: "nowrap" }}>
                            <span
                              aria-hidden
                              style={{
                                width: "0.6rem", height: "0.6rem", borderRadius: "2px",
                                background: r.tenant.accent, flex: "none",
                              }}
                            />
                            <span style={{ fontWeight: 600 }}>{r.tenant.business}</span>
                          </span>
                          <br />
                          <span className="esp-micro">
                            {r.tenant.city}
                            {r.tenant.real && (
                              <span title={t.admin.realTitle}> · {t.admin.real}</span>
                            )}
                          </span>
                        </td>
                        <td className="n">{r.usage.calls || "—"}</td>
                        <td className="n">{durationOf(r.usage.call_seconds)}</td>
                        <td className="n">{r.usage.chat_messages || "—"}</td>
                        <td className="n" style={{ fontWeight: 600 }}>{r.actions || "—"}</td>
                        <td className="n">{r.upcoming || "—"}</td>
                        <td className="n">{r.customers || "—"}</td>
                        <td className="n">{fmtCost(r.usage.call_cost + r.usage.chat_cost, lang)} $</td>
                        <td className="esp-small" style={{ color: quiet ? "var(--esp-ink-3)" : undefined }}>
                          {r.lastActionAt ? fmtAgo(r.lastActionAt, lang) : t.admin.never}
                        </td>
                        <td>
                          <span className="esp-access">
                            {codeButton(r.tenant.slug, r.accessCode)}
                            {r.testAccount && accountButton(r.tenant.slug, r.testAccount)}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", gap: "0.3rem", flexWrap: "wrap" }}>
                            <Link className="esp-btn esp-btn-sm" href={spaceHref(r.tenant.slug)}>
                              {t.admin.open} <ArrowUpRight size={12} aria-hidden />
                            </Link>
                            <Link
                              className="esp-btn esp-btn-sm" href={quotesHref(r.tenant.slug)}
                              title={t.admin.quotesTitle}
                            >
                              <FileText size={12} aria-hidden /> {t.admin.quotes}
                            </Link>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Tablette et téléphone : une carte par vitrine ───────────── */}
            <div className="esp-panel-body esp-narrow-only">
              <ul className="esp-vitrines">
                {sorted.map((r) => {
                  const quiet = r.actions === 0 && r.usage.calls === 0 && r.usage.chats === 0;
                  const stats: { k: string; v: string; strong?: boolean }[] = [
                    { k: t.admin.colCalls, v: String(r.usage.calls || "—") },
                    { k: t.admin.colDuration, v: durationOf(r.usage.call_seconds) },
                    { k: t.admin.colMessages, v: String(r.usage.chat_messages || "—") },
                    { k: t.admin.colActions, v: String(r.actions || "—"), strong: true },
                    { k: t.admin.colUpcoming, v: String(r.upcoming || "—") },
                    { k: t.admin.colCustomers, v: String(r.customers || "—") },
                    { k: t.admin.colCost, v: `${fmtCost(r.usage.call_cost + r.usage.chat_cost, lang)} $` },
                  ];
                  return (
                    <li key={r.tenant.slug} className="esp-vitrine">
                      <div className="esp-vitrine-top">
                        <span
                          className="esp-vitrine-dot"
                          aria-hidden
                          style={{ background: r.tenant.accent }}
                        />
                        <span className="esp-vitrine-id">
                          <span className="esp-vitrine-name">
                            {r.tenant.business}
                            {r.tenant.real && (
                              <span className="esp-micro" title={t.admin.realTitle}> {t.admin.real}</span>
                            )}
                          </span>
                          <span className="esp-micro">{r.tenant.trade} · {r.tenant.city}</span>
                        </span>
                        <span
                          className="esp-micro esp-vitrine-ago"
                          style={{ color: quiet ? "var(--esp-ink-3)" : "var(--esp-ink-2)" }}
                        >
                          {r.lastActionAt ? fmtAgo(r.lastActionAt, lang) : t.admin.never}
                        </span>
                      </div>

                      <dl className="esp-minis">
                        {stats.map((s) => (
                          <div key={s.k} className="esp-mini">
                            <dt className="esp-mini-k">{s.k}</dt>
                            <dd className={`esp-mini-v${s.strong ? " is-strong" : ""}`}>{s.v}</dd>
                          </div>
                        ))}
                      </dl>

                      <div className="esp-vitrine-foot">
                        {codeButton(r.tenant.slug, r.accessCode)}
                        <Link className="esp-btn esp-btn-sm" href={spaceHref(r.tenant.slug)}>
                          {t.admin.open} <ArrowUpRight size={12} aria-hidden />
                        </Link>
                        <Link
                          className="esp-btn esp-btn-sm" href={quotesHref(r.tenant.slug)}
                          title={t.admin.quotesTitle}
                        >
                          <FileText size={12} aria-hidden /> {t.admin.quotes}
                        </Link>
                        {r.testAccount && accountButton(r.tenant.slug, r.testAccount)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="esp-panel-body" style={{ paddingTop: "0.9rem" }}>
              <p className="esp-note">
                <Gauge size={15} aria-hidden />
                <span>
                  <b>{t.admin.noteT}</b> {t.admin.noteD1} <code>PORTAL_SECRET</code>{" "}
                  {t.admin.noteD2} <b>{t.admin.noteD3}</b> {t.admin.noteD4}{" "}
                  <code>.env</code> : <code>PORTAL_CODE_&lt;SLUG&gt;</code>,{" "}
                  <code>PORTAL_TEST_EMAIL_&lt;SLUG&gt;</code>,{" "}
                  <code>PORTAL_TEST_PASSWORD_&lt;SLUG&gt;</code>{t.admin.andThe}{" "}
                  <code>PORTAL_TEST_ACCOUNT=off</code> {t.admin.noteD5}
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
