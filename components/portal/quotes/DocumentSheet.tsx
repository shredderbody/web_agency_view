"use client";

import type { CSSProperties } from "react";
import type { EffectiveIssuer } from "@/lib/portal/docSettings";
import {
  lineHT, type DocLine, type DocTotals, type PortalDocument,
} from "@/lib/portal/documents.shared";
import { formatMoney, roundMoney } from "@/lib/portal/money";
import type { DocStrings } from "@/lib/portal/documentsStrings";
import type { Lang } from "@/lib/i18n";
import { fmtDocDate } from "./context";

/* ════════════════════════════════════════════════════════════════════════════
   LA FEUILLE — ce qui s'imprime.

   Elle ne lit QUE le brouillon en cours, jamais la ligne en base : ce qui est à
   l'écran est ce qu'on est en train d'écrire. Et comme `@media print` ne fait
   que retirer l'application autour d'elle, c'est aussi, au pixel près, ce qui
   sortira de l'imprimante.

   Aucun token `--esp-*` ici : un document comptable est blanc, encre noire, et
   ne change pas d'apparence selon l'outil qui l'a produit. Seul `--doc-accent`,
   l'accent de la vitrine, y entre.
   ════════════════════════════════════════════════════════════════════════════ */

export type SheetDraft = {
  client: PortalDocument["client"];
  lines: DocLine[];
  notes: string;
  issuedOn: string;
  dueOn: string;
};

export default function DocumentSheet({
  doc, draft, issuer, totals, t, lang, sourceNumber,
}: {
  doc: PortalDocument;
  draft: SheetDraft;
  issuer: EffectiveIssuer;
  totals: DocTotals;
  t: DocStrings;
  lang: Lang;
  sourceNumber: string | null;
}) {
  const money = (n: number) => formatMoney(n, doc.currency);
  const contact = [issuer.phone, issuer.email, issuer.website].filter(Boolean).join(" · ");
  const c = draft.client;
  const hasClient = Boolean(c.name || c.address || c.city || c.email || c.phone);
  const x = issuer.extras;

  /* Immatriculations : SIRET, TVA, forme juridique. Elles ne s'impriment que si
     elles existent VRAIMENT — une vitrine fictive n'a pas de SIRET, et le
     document ne prétend pas le contraire. */
  const registrations = [
    x.legalForm, x.siret ? `SIRET ${x.siret}` : null,
    x.vatNumber ? `TVA ${x.vatNumber}` : null,
    !x.siret ? issuer.registration : null,
  ].filter(Boolean).join(" · ");

  return (
    <article className="esp-doc-sheet" style={{ "--doc-accent": issuer.accent } as CSSProperties}>
      <div className="doc-rule" />

      <header className="doc-head">
        <div className="doc-head-id">
          {/* Le logo, s'il y en a un. `<img>` et non `next/image` : l'URL est
              saisie par l'exploitant, elle peut pointer n'importe où, et une
              image d'en-tête de document n'a pas besoin d'être optimisée. */}
          {x.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="doc-logo" src={x.logoUrl} alt="" />
          )}
          <p className="doc-issuer-name">{issuer.name}</p>
          <p className="doc-issuer-trade">{issuer.trade}</p>
          <p className="doc-issuer-meta">{issuer.address}<br />{issuer.city}</p>
          {contact && <p className="doc-issuer-meta">{contact}</p>}
          {registrations && <p className="doc-issuer-reg">{registrations}</p>}
        </div>
        <div className="doc-head-mark">
          <p className="doc-kind">{doc.kind === "quote" ? t.quoteWord : t.invoiceWord}</p>
          <p className="doc-number">{t.numberWord} {doc.number}</p>
          <p className="doc-dates">
            <span>{t.issuedOn} <b>{fmtDocDate(draft.issuedOn, lang)}</b></span>
            {draft.dueOn && (
              <span>
                {doc.kind === "quote" ? t.validUntil : t.dueOn} <b>{fmtDocDate(draft.dueOn, lang)}</b>
              </span>
            )}
          </p>
          {sourceNumber && <p className="doc-issuer-reg">{t.convertedFrom} {sourceNumber}</p>}
        </div>
      </header>

      <section className="doc-to">
        <p className="doc-to-k">{t.recipientWord}</p>
        {hasClient ? (
          <>
            {c.name && <p className="doc-to-name">{c.name}</p>}
            {c.address && <p className="doc-to-line">{c.address}</p>}
            {(c.postal_code || c.city) && (
              <p className="doc-to-line">{[c.postal_code, c.city].filter(Boolean).join(" ")}</p>
            )}
            {(c.phone || c.email) && (
              <p className="doc-to-line">{[c.phone, c.email].filter(Boolean).join(" · ")}</p>
            )}
          </>
        ) : (
          <p className="doc-to-empty">{t.noClient}</p>
        )}
      </section>

      <table className="doc-table">
        <thead>
          <tr>
            <th scope="col">{t.colDesignation}</th>
            <th scope="col" className="n">{t.colQty}</th>
            <th scope="col" className="n">{t.colUnit}</th>
            <th scope="col" className="n">{t.colTax}</th>
            <th scope="col" className="n">{t.colLineTotal}</th>
          </tr>
        </thead>
        <tbody>
          {draft.lines.length === 0 && (
            <tr><td className="doc-table-empty" colSpan={5}>{t.noLines}</td></tr>
          )}
          {draft.lines.map((l) =>
            l.kind === "discount" ? (
              <tr className="doc-row-discount" key={l.id}>
                <td colSpan={4}>{l.label || t.discountLine} · {l.percent ?? 0} %</td>
                <td className="n">
                  −{money(roundMoney((totals.subtotalHT * (l.percent ?? 0)) / 100, doc.currency))}
                </td>
              </tr>
            ) : (
              <tr key={l.id}>
                <td>
                  <p className="doc-cell-label">{l.label || "—"}</p>
                  {l.desc && <p className="doc-cell-desc">{l.desc}</p>}
                </td>
                {/* L'unité colle à la quantité : « 3 h » et non « 3 » dans une
                    colonne, « h » dans une autre — on lit une quantité, pas deux. */}
                <td className="n">
                  {l.qty}
                  {l.unit && l.unit !== "unite" && (
                    <span className="doc-cell-unit"> {t.unitsShort[l.unit]}</span>
                  )}
                </td>
                <td className="n">{money(l.unit_price)}</td>
                <td className="n">{l.tax_rate} %</td>
                <td className="n">{money(roundMoney(lineHT(l), doc.currency))}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>

      <div className="doc-sums">
        <div className="doc-sums-in">
          <div className="doc-sum"><span>{t.subtotal}</span><b>{money(totals.subtotalHT)}</b></div>
          {totals.discount > 0 && (
            <div className="doc-sum"><span>{t.discount}</span><b>−{money(totals.discount)}</b></div>
          )}
          <div className="doc-sum"><span>{t.totalHT}</span><b>{money(totals.totalHT)}</b></div>
          {totals.taxes.map((b) => (
            <div className="doc-sum" key={b.rate}>
              <span>{doc.tax_label} {b.rate} % · {money(b.base)}</span>
              <b>{money(b.amount)}</b>
            </div>
          ))}
          <div className="doc-sum-grand">
            <span>{t.totalTTC}</span><b>{money(totals.totalTTC)}</b>
          </div>
        </div>
      </div>

      {draft.notes.trim() && (
        <section className="doc-notes">
          <p className="doc-notes-k">{t.notesTitle}</p>
          <p className="doc-notes-p">{draft.notes}</p>
        </section>
      )}

      {/* Coordonnées bancaires : sur une FACTURE seulement. Sur un devis, elles
          invitent à payer quelque chose qui n'est pas encore dû. */}
      {doc.kind === "invoice" && (x.iban || x.paymentMethod) && (
        <section className="doc-pay">
          <p className="doc-notes-k">{t.set.payment}</p>
          {x.paymentMethod && <p className="doc-to-line">{x.paymentMethod}</p>}
          {x.iban && <p className="doc-iban">IBAN {x.iban}{x.bic ? ` · BIC ${x.bic}` : ""}</p>}
        </section>
      )}

      {doc.kind === "quote" && <div className="doc-sign">{t.signature}</div>}

      <footer className="doc-legal">
        <p className="doc-legal-from">{t.page} {issuer.name} · {issuer.city}</p>
        {issuer.legalNotes.map((n) => <p key={n}>{n}</p>)}
        {x.insuranceLabel && (
          <p>{x.insuranceLabel}{x.insuranceDetail ? ` — ${x.insuranceDetail}` : ""}</p>
        )}
        {x.footerNotes && <p>{x.footerNotes}</p>}
      </footer>
    </article>
  );
}
