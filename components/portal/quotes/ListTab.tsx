"use client";

import { useMemo, useState } from "react";
import { Copy, FilePlus2, Search } from "lucide-react";
import {
  STATUS_LABEL, STATUS_TONE, type DocKind, type DocStatus,
} from "@/lib/portal/documents.shared";
import { formatMoney } from "@/lib/portal/money";
import { fmtDocDate, useQuotes } from "./context";

/* Les listes de devis et de factures — le même écran, deux natures.

   Une seule différence de fond entre les deux : le vocabulaire de statut. Écrire
   deux composants pour ça aurait fait diverger le filtre, le tri et le pied de
   liste au premier changement. */

export default function ListTab({ kind }: { kind: DocKind }) {
  const ctx = useQuotes();
  const { t, lang, documents } = ctx;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DocStatus | "all">("all");
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents
      .filter((d) => d.kind === kind)
      .filter((d) => status === "all" || d.status === status)
      .filter((d) => !q
        || d.number.toLowerCase().includes(q)
        || (d.client?.name ?? "").toLowerCase().includes(q));
  }, [documents, kind, status, query]);

  // Le total ne compte QUE ce qui est affiché : un pied de liste qui totalise
  // autre chose que les lignes visibles est un piège à lecture.
  const total = rows.reduce((s, d) => s + d.total_ttc, 0);
  const currency = rows[0]?.currency ?? ctx.issuer.currency;

  return (
    <section className="esp-panel">
      <header className="esp-panel-head">
        <h2 className="esp-h2">{kind === "quote" ? t.tabs.quote : t.tabs.invoice}</h2>

        <div className="qa-search">
          <Search size={14} aria-hidden />
          <input className="esp-input" value={query} placeholder={t.list.search}
            aria-label={t.list.search} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <select className="esp-select" style={{ width: "auto" }} value={status}
          aria-label={t.statusLabel} onChange={(e) => setStatus(e.target.value as DocStatus | "all")}>
          <option value="all">{t.list.all}</option>
          {(kind === "quote"
            ? (["draft", "sent", "accepted", "refused"] as DocStatus[])
            : (["draft", "sent", "paid", "cancelled"] as DocStatus[])
          ).map((s) => <option key={s} value={s}>{STATUS_LABEL[lang][s]}</option>)}
        </select>

        <button type="button" className="esp-btn esp-btn-primary esp-btn-sm" disabled={busy}
          onClick={async () => { setBusy(true); await ctx.createDocument(kind); setBusy(false); }}>
          <FilePlus2 size={13} aria-hidden />
          {busy ? t.creating : kind === "quote" ? t.newQuote : t.newInvoice}
        </button>
      </header>

      {rows.length === 0 ? (
        <div className="esp-empty">
          <p className="esp-empty-t">{kind === "quote" ? t.emptyQuoteT : t.emptyInvoiceT}</p>
          <p className="esp-empty-d">
            {documents.some((d) => d.kind === kind)
              ? t.list.none
              : kind === "quote" ? t.emptyQuoteD : t.emptyInvoiceD}
          </p>
        </div>
      ) : (
        <>
          <div className="esp-tablewrap">
            <table className="esp-table">
              <thead>
                <tr>
                  <th scope="col">{t.colNumber}</th>
                  <th scope="col">{t.colDate}</th>
                  <th scope="col">{t.colClient}</th>
                  <th scope="col" className="n">{t.colTotal}</th>
                  <th scope="col">{t.colStatus}</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <button type="button" className="doc-open" onClick={() => ctx.openDocument(d)}>
                        {d.number}
                      </button>
                    </td>
                    <td>{fmtDocDate(d.issued_on, d.lang)}</td>
                    <td>
                      {d.client?.name || <span style={{ color: "var(--esp-ink-3)" }}>{t.noClient}</span>}
                    </td>
                    <td className="n">{formatMoney(d.total_ttc, d.currency)}</td>
                    <td>
                      <span className={`esp-badge esp-badge-${STATUS_TONE[d.status]}`}>
                        {STATUS_LABEL[d.lang][d.status]}
                      </span>
                    </td>
                    <td className="n">
                      <button type="button" className="esp-btn esp-btn-sm esp-btn-quiet"
                        title={t.list.duplicate} aria-label={t.list.duplicate} disabled={busy}
                        onClick={async () => { setBusy(true); await ctx.duplicateDocument(d); setBusy(false); }}>
                        <Copy size={12} aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="esp-panel-body" style={{ paddingTop: "0.75rem" }}>
            <p className="esp-small qa-listfoot">
              {t.list.totalRow(rows.length, formatMoney(total, currency))}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
