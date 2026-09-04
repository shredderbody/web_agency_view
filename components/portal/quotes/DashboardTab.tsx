"use client";

import { useMemo } from "react";
import { formatMoney } from "@/lib/portal/money";
import { useQuotes } from "./context";

/* Le tableau de bord commercial — ce que les devis ont produit.

   Différent du suivi de la standardiste (`/<slug>/admin/dashboard`), qui compte
   des appels et des minutes. Ici on compte de l'argent : devis émis, devis
   acceptés, taux d'acceptation, facturé, encaissé, reste dû.

   Le graphe est en SVG, sans dépendance, comme celui de l'espace : ajouter
   `recharts` (ce que fait `devis_app`) pour douze barres serait payer 90 ko
   pour ce qu'un `<rect>` fait mieux. */

const MONTHS = 12;

export default function DashboardTab() {
  const { t, lang, documents, issuer } = useQuotes();
  const currency = documents[0]?.currency ?? issuer.currency;
  const money = (n: number) => formatMoney(n, currency);

  const stats = useMemo(() => {
    const quotes = documents.filter((d) => d.kind === "quote");
    const invoices = documents.filter((d) => d.kind === "invoice");
    const accepted = quotes.filter((d) => d.status === "accepted");
    const paid = invoices.filter((d) => d.status === "paid");

    const sum = (list: typeof documents) => list.reduce((s, d) => s + d.total_ttc, 0);
    const quotedTotal = sum(quotes);
    const invoicedTotal = sum(invoices.filter((d) => d.status !== "cancelled"));
    const paidTotal = sum(paid);

    /* Douze mois glissants. On part du mois courant et on remonte : un axe qui
       commencerait en janvier montrerait des mois vides une bonne partie de
       l'année. */
    const now = new Date();
    const buckets = Array.from({ length: MONTHS }, (_, i) => {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1 - i), 1));
      const key = d.toISOString().slice(0, 7);
      return {
        key,
        label: new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
          month: "short", timeZone: "UTC",
        }).format(d),
        quotes: 0, invoices: 0,
      };
    });
    const index = new Map(buckets.map((b) => [b.key, b]));
    for (const d of documents) {
      const b = index.get((d.issued_on ?? "").slice(0, 7));
      if (!b) continue;
      if (d.kind === "quote") b.quotes += d.total_ttc;
      else if (d.status !== "cancelled") b.invoices += d.total_ttc;
    }

    /* Ce qui se vend : on agrège les libellés de ligne, tous documents
       confondus. Les remises sont écartées — elles ne se « vendent » pas. */
    const tally = new Map<string, { qty: number; amount: number }>();
    for (const d of documents) {
      for (const l of d.lines ?? []) {
        if (l.kind === "discount" || !l.label) continue;
        const key = l.label.trim().toLowerCase();
        const prev = tally.get(key) ?? { qty: 0, amount: 0 };
        tally.set(key, {
          qty: prev.qty + l.qty,
          amount: prev.amount + l.qty * l.unit_price,
        });
      }
    }
    const top = [...tally.entries()]
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    return {
      quotes, invoices, accepted, paid,
      quotedTotal, invoicedTotal, paidTotal,
      outstanding: invoicedTotal - paidTotal,
      conversion: quotes.length > 0 ? Math.round((accepted.length / quotes.length) * 100) : null,
      average: quotes.length > 0 ? quotedTotal / quotes.length : 0,
      buckets,
      top,
    };
  }, [documents, lang]);

  if (documents.length === 0) {
    return (
      <section className="esp-panel">
        <div className="esp-empty">
          <p className="esp-empty-t">{t.dash.title}</p>
          <p className="esp-empty-d">{t.dash.noData}</p>
        </div>
      </section>
    );
  }

  const max = Math.max(1, ...stats.buckets.map((b) => Math.max(b.quotes, b.invoices)));

  return (
    <div className="esp-stack">
      <div className="esp-pagehead">
        <div>
          <h2 className="esp-h2">{t.dash.title}</h2>
          <p className="esp-lead" style={{ marginTop: "0.25rem" }}>{t.dash.lead}</p>
        </div>
      </div>

      <div className="esp-tiles">
        <div className="esp-tile">
          <span className="esp-tile-k">{t.dash.quoted}</span>
          <span className="esp-tile-v esp-num">{stats.quotes.length}</span>
          <span className="esp-tile-s">{money(stats.quotedTotal)}</span>
        </div>
        <div className="esp-tile">
          <span className="esp-tile-k">{t.dash.accepted}</span>
          <span className="esp-tile-v esp-num">{stats.accepted.length}</span>
          <span className="esp-tile-s">
            {stats.conversion === null ? "—" : `${t.dash.conversion} ${stats.conversion} %`}
          </span>
        </div>
        <div className="esp-tile">
          <span className="esp-tile-k">{t.dash.invoiced}</span>
          <span className="esp-tile-v esp-num">{money(stats.invoicedTotal)}</span>
          <span className="esp-tile-s">{stats.invoices.length} · {t.dash.paid} {money(stats.paidTotal)}</span>
        </div>
        <div className="esp-tile">
          <span className="esp-tile-k">{t.dash.outstanding}</span>
          <span className="esp-tile-v esp-num">{money(Math.max(0, stats.outstanding))}</span>
          <span className="esp-tile-s">{t.dash.avgQuote} {money(stats.average)}</span>
        </div>
      </div>

      <section className="esp-panel">
        <header className="esp-panel-head">
          <h3 className="esp-h3">{t.dash.byMonth}</h3>
          <span className="esp-legend">
            <span className="esp-legend-i">
              <span className="esp-legend-s" style={{ background: "var(--esp-voice)" }} />
              {t.dash.monthQuotes}
            </span>
            <span className="esp-legend-i">
              <span className="esp-legend-s" style={{ background: "var(--esp-text)" }} />
              {t.dash.monthInvoices}
            </span>
          </span>
        </header>
        <div className="esp-panel-body">
          <div className="qa-bars" role="img" aria-label={t.dash.byMonth}>
            {stats.buckets.map((b) => (
              <div className="qa-bar-col" key={b.key}>
                <div className="qa-bar-stack">
                  {/* Deux barres côte à côte, pas empilées : devis et factures ne
                      s'additionnent pas — une facture NAÎT d'un devis, les
                      empiler compterait deux fois le même argent. */}
                  <span className="qa-bar is-q" style={{ height: `${(b.quotes / max) * 100}%` }}
                    title={`${b.label} · ${money(b.quotes)}`} />
                  <span className="qa-bar is-i" style={{ height: `${(b.invoices / max) * 100}%` }}
                    title={`${b.label} · ${money(b.invoices)}`} />
                </div>
                <span className="qa-bar-label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="esp-panel">
        <header className="esp-panel-head"><h3 className="esp-h3">{t.dash.topItems}</h3></header>
        {stats.top.length === 0 ? (
          <div className="esp-panel-body"><p className="esp-micro">{t.dash.topEmpty}</p></div>
        ) : (
          <div className="esp-tablewrap">
            <table className="esp-table">
              <thead>
                <tr>
                  <th scope="col">{t.cat.itemName}</th>
                  <th scope="col" className="n">{t.colQty}</th>
                  <th scope="col" className="n">{t.totalHT}</th>
                </tr>
              </thead>
              <tbody>
                {stats.top.map((row) => (
                  <tr key={row.label}>
                    <td style={{ textTransform: "capitalize" }}>{row.label}</td>
                    <td className="n">{Math.round(row.qty * 100) / 100}</td>
                    <td className="n">{money(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
