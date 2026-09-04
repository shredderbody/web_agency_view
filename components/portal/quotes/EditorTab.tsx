"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check, FilePlus2, Loader2, Percent, Plus, Printer, Receipt, Trash2, UserRound,
} from "lucide-react";
import {
  computeTotals, newLineId, statusesFor, STATUS_LABEL, DOC_UNITS,
  type DocLine, type DocStatus, type DocUnit,
} from "@/lib/portal/documents.shared";
import { formatMoney, moneyStep, roundMoney } from "@/lib/portal/money";
import type { StoredCatalogItem } from "@/lib/portal/catalogStore";
import type { PortalDocument } from "@/lib/portal/documents.shared";
import { fmtClock, numValue, toNum, useQuotes } from "./context";
import DocumentSheet from "./DocumentSheet";
import VoiceDictation from "./VoiceDictation";

/* ════════════════════════════════════════════════════════════════════════════
   L'ÉDITEUR — la saisie à gauche, le document à droite.

   Deux choses le séparent de la version précédente, et ce sont les deux
   reproches faits au portage :

   1. L'ENREGISTREMENT EST AUTOMATIQUE. Un devis dicté qu'on perd en changeant
      d'onglet est inacceptable. Débounce d'une seconde et demie après la
      dernière frappe, plus un enregistrement forcé quand on quitte l'éditeur.
      L'état est dit en clair — « Modifications en attente », « Enregistré à
      14 h 32 » — parce qu'un enregistrement invisible ne rassure personne.

   2. LA DICTÉE est là, à côté des lignes.
   ════════════════════════════════════════════════════════════════════════════ */

const SAVE_DEBOUNCE_MS = 1500;

type Draft = {
  client: {
    name: string; email: string | null; phone: string | null;
    address: string | null; postal_code: string | null; city: string | null;
  };
  customerId: string | null;
  lines: DocLine[];
  notes: string;
  status: DocStatus;
  issuedOn: string;
  dueOn: string;
};

function draftFrom(doc: PortalDocument): Draft {
  return {
    client: {
      name: doc.client?.name ?? "",
      email: doc.client?.email ?? null,
      phone: doc.client?.phone ?? null,
      address: doc.client?.address ?? null,
      postal_code: doc.client?.postal_code ?? null,
      city: doc.client?.city ?? null,
    },
    customerId: doc.customer_id,
    lines: Array.isArray(doc.lines) ? doc.lines.map((l) => ({ ...l })) : [],
    notes: doc.notes ?? "",
    status: doc.status,
    issuedOn: doc.issued_on,
    dueOn: doc.due_on ?? "",
  };
}

export default function EditorTab() {
  const ctx = useQuotes();
  const { t, lang, issuer, documents, customers, categories, items, openId } = ctx;

  const doc = openId ? documents.find((d) => d.id === openId) ?? null : null;

  /* Le brouillon est construit SYNCHRONEMENT, dès le premier rendu. Le poser
     dans un `useEffect` — ce qu'il faisait — le laissait vide côté serveur :
     l'éditeur rendait son état vide, puis se remplissait à l'hydratation. Un
     « aucun devis » qui clignote une demi-seconde sur un devis qui existe est
     le genre de détail qui fait douter de tout le reste. */
  const [draft, setDraft] = useState<Draft | null>(doc ? draftFrom(doc) : null);
  const [clean, setClean] = useState(doc ? JSON.stringify(draftFrom(doc)) : "");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<null | "create" | "convert" | "delete">(null);

  /* On ne le RECONSTRUIT que lorsqu'on change de document : le refaire à chaque
     rendu écraserait la frappe en cours par ce qui vient du serveur. */
  const loadedId = useRef<string | null>(doc?.id ?? null);
  useEffect(() => {
    if (!doc) { setDraft(null); loadedId.current = null; return; }
    if (loadedId.current === doc.id) return;
    const d = draftFrom(doc);
    setDraft(d);
    setClean(JSON.stringify(d));
    setSavedAt(null);
    loadedId.current = doc.id;
  }, [doc]);

  const dirty = Boolean(draft) && JSON.stringify(draft) !== clean;

  const persist = useCallback(async () => {
    if (!draft || !doc) return;
    setSaving(true);
    const snapshot = JSON.stringify(draft);
    const saved = await ctx.saveDocument({
      id: doc.id,
      client: draft.client,
      customerId: draft.customerId,
      lines: draft.lines,
      notes: draft.notes,
      status: draft.status,
      issuedOn: draft.issuedOn,
      dueOn: draft.dueOn || null,
    });
    setSaving(false);
    if (saved) {
      // On marque propre l'état ENVOYÉ, pas l'état courant : ce qui a été tapé
      // pendant l'aller-retour reste « à enregistrer », et repart au tour suivant.
      setClean(snapshot);
      setSavedAt(new Date());
    }
  }, [ctx, doc, draft]);

  /* Enregistrement automatique. Le `setTimeout` est relancé à chaque frappe :
     on n'écrit qu'une fois la phrase finie, pas une fois par caractère. */
  useEffect(() => {
    if (!dirty) return;
    const id = window.setTimeout(() => { void persist(); }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [dirty, persist]);

  /* Quitter l'éditeur, changer d'onglet, fermer la fenêtre : on enregistre
     avant. `beforeunload` ne peut pas attendre une requête — l'avertissement du
     navigateur est le dernier filet, et il ne sert que si quelque chose reste
     à écrire. */
  const dirtyRef = useRef(dirty);
  const persistRef = useRef(persist);
  useEffect(() => { dirtyRef.current = dirty; persistRef.current = persist; }, [dirty, persist]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirtyRef.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      if (dirtyRef.current) void persistRef.current();
    };
  }, []);

  /* ── Modifications locales ────────────────────────────────────────────── */

  const patch = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const setLine = (id: string, p: Partial<DocLine>) =>
    setDraft((d) => (d ? { ...d, lines: d.lines.map((l) => (l.id === id ? { ...l, ...p } : l)) } : d));
  const dropLine = (id: string) =>
    setDraft((d) => (d ? { ...d, lines: d.lines.filter((l) => l.id !== id) } : d));
  const pushLines = (lines: DocLine[]) =>
    setDraft((d) => (d ? { ...d, lines: [...d.lines, ...lines] } : d));

  const addFromCatalog = (it: StoredCatalogItem) =>
    pushLines([{
      id: newLineId(), kind: "item", label: it.name,
      desc: it.description ?? undefined,
      qty: 1, unit_price: it.unit_price, tax_rate: it.tax_rate,
      unit: it.unit as DocUnit,
    }]);

  const addFree = () =>
    pushLines([{
      id: newLineId(), kind: "item", label: "", qty: 1, unit_price: 0,
      tax_rate: issuer.taxRate, unit: "unite",
    }]);

  const addDiscount = () =>
    pushLines([{
      id: newLineId(), kind: "discount", label: t.discountLine,
      qty: 0, unit_price: 0, tax_rate: 0, percent: 10,
    }]);

  const onDictated = useCallback((lines: DocLine[], mode: "append" | "replace") => {
    setDraft((d) => (d ? { ...d, lines: mode === "replace" ? lines : [...d.lines, ...lines] } : d));
  }, []);

  /** Reprendre un client du fichier : on ne ressaisit pas ce qu'on connaît. */
  function pickCustomer(id: string) {
    const c = customers.find((x) => x.id === id);
    if (!c) { patch({ customerId: null }); return; }
    setDraft((d) => d ? {
      ...d,
      customerId: c.id,
      client: {
        name: c.full_name ?? c.company ?? d.client.name,
        email: c.email,
        phone: c.phone.startsWith("manual:") ? null : c.phone,
        address: c.address,
        postal_code: c.postal_code,
        city: c.city,
      },
    } : d);
  }

  const currency = doc?.currency ?? issuer.currency;
  const totals = useMemo(
    () => computeTotals(draft?.lines ?? [], (n) => roundMoney(n, currency)),
    [draft?.lines, currency],
  );
  const money = (n: number) => formatMoney(n, currency);

  /* ── Aucun document ouvert ────────────────────────────────────────────── */

  if (!doc || !draft) {
    return (
      <section className="esp-panel">
        <div className="esp-empty">
          <p className="esp-empty-t">{t.emptyQuoteT}</p>
          <p className="esp-empty-d">{t.emptyQuoteD}</p>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button
              type="button" className="esp-btn esp-btn-primary esp-btn-sm"
              onClick={async () => { setBusy("create"); await ctx.createDocument("quote"); setBusy(null); }}
              disabled={busy !== null}
            >
              <FilePlus2 size={13} aria-hidden /> {busy === "create" ? t.creating : t.newQuote}
            </button>
            <button
              type="button" className="esp-btn esp-btn-sm"
              onClick={async () => { setBusy("create"); await ctx.createDocument("invoice"); setBusy(null); }}
              disabled={busy !== null}
            >
              <Receipt size={13} aria-hidden /> {t.newInvoice}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const source = doc.source_id ? documents.find((d) => d.id === doc.source_id) ?? null : null;
  const catalogByCategory = [
    ...categories.map((c) => ({ id: c.id, title: c.name, color: c.color,
      list: items.filter((i) => i.category_id === c.id) })),
    { id: "none", title: t.cat.noCategory, color: "#8a8a8a",
      list: items.filter((i) => !i.category_id) },
  ].filter((g) => g.list.length > 0);

  const saveState = saving ? t.auto.saving
    : dirty ? t.auto.pending
      : savedAt ? t.auto.savedAt(fmtClock(savedAt, lang))
        : t.auto.idle;

  return (
    <>
      <div className="doc-toolbar esp-print-hide">
        <div className="doc-toolbar-title">
          <span className="doc-toolbar-num">
            {doc.kind === "quote" ? t.quoteWord : t.invoiceWord} {doc.number}
          </span>
          <span className="esp-micro qa-savestate">
            {saving && <Loader2 size={11} className="esp-spin" aria-hidden />}
            {!saving && !dirty && <Check size={11} aria-hidden />}
            {saveState}
          </span>
        </div>

        <span className="doc-toolbar-spacer" />

        <select
          className="esp-select" style={{ width: "auto" }} aria-label={t.statusLabel}
          value={draft.status}
          onChange={(e) => patch({ status: e.target.value as DocStatus })}
        >
          {statusesFor(doc.kind).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[lang][s]}</option>
          ))}
        </select>

        {doc.kind === "quote" && (
          <button
            type="button" className="esp-btn" disabled={busy !== null}
            onClick={async () => { setBusy("convert"); await persist(); await ctx.convertDocument(doc.id); setBusy(null); }}
          >
            <Receipt size={13} aria-hidden /> {busy === "convert" ? t.converting : t.convert}
          </button>
        )}
        <button type="button" className="esp-btn" onClick={() => window.print()}>
          <Printer size={13} aria-hidden /> {t.print}
        </button>
        <button
          type="button" className="esp-btn esp-btn-danger esp-btn-sm" aria-label={t.del}
          disabled={busy !== null}
          onClick={async () => {
            if (!window.confirm(t.delConfirm)) return;
            setBusy("delete");
            await ctx.removeDocument(doc.id);
            setBusy(null);
          }}
        >
          <Trash2 size={13} aria-hidden />
        </button>
      </div>

      <div className="doc-split">
        <div className="doc-pane esp-print-hide">
          <VoiceDictation documentId={doc.id} onLines={onDictated} />

          <section className="esp-panel">
            <header className="esp-panel-head">
              <h2 className="esp-h3">
                <UserRound size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
                {t.clientTitle}
              </h2>
              <button type="button" className="esp-btn esp-btn-sm esp-btn-quiet"
                onClick={() => ctx.goTo("clients")}>
                {t.clients.title}
              </button>
            </header>
            <div className="esp-panel-body" style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {customers.length > 0 && (
                <label className="esp-field">
                  <span className="esp-label">{t.pickContact}</span>
                  <select className="esp-select" value={draft.customerId ?? ""}
                    onChange={(e) => pickCustomer(e.target.value)}>
                    <option value="">—</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name ?? c.company ?? (c.phone.startsWith("manual:") ? "—" : c.phone)}
                        {c.company && c.full_name ? ` · ${c.company}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="esp-field">
                <span className="esp-label">{t.clientName}</span>
                <input className="esp-input" value={draft.client.name}
                  onChange={(e) => patch({ client: { ...draft.client, name: e.target.value } })} />
              </label>

              <div className="doc-grid-2">
                <label className="esp-field">
                  <span className="esp-label">{t.clientEmail}</span>
                  <input className="esp-input" type="email" value={draft.client.email ?? ""}
                    onChange={(e) => patch({ client: { ...draft.client, email: e.target.value } })} />
                </label>
                <label className="esp-field">
                  <span className="esp-label">{t.clientPhone}</span>
                  <input className="esp-input" type="tel" value={draft.client.phone ?? ""}
                    onChange={(e) => patch({ client: { ...draft.client, phone: e.target.value } })} />
                </label>
              </div>

              <label className="esp-field">
                <span className="esp-label">{t.clientAddress}</span>
                <input className="esp-input" value={draft.client.address ?? ""}
                  onChange={(e) => patch({ client: { ...draft.client, address: e.target.value } })} />
              </label>

              <div className="doc-grid-3">
                <label className="esp-field">
                  <span className="esp-label">{t.clientPostal}</span>
                  <input className="esp-input" value={draft.client.postal_code ?? ""}
                    onChange={(e) => patch({ client: { ...draft.client, postal_code: e.target.value } })} />
                </label>
                <label className="esp-field">
                  <span className="esp-label">{t.clientCity}</span>
                  <input className="esp-input" value={draft.client.city ?? ""}
                    onChange={(e) => patch({ client: { ...draft.client, city: e.target.value } })} />
                </label>
              </div>
            </div>
          </section>

          {catalogByCategory.length > 0 && (
            <section className="esp-panel">
              <header className="esp-panel-head">
                <h2 className="esp-h3">{t.catalogTitle}</h2>
                <span className="esp-micro">{t.catalogHint}</span>
                <button type="button" className="esp-btn esp-btn-sm esp-btn-quiet"
                  onClick={() => ctx.goTo("catalog")}>
                  {t.cat.title}
                </button>
              </header>
              <div className="esp-panel-body">
                <div className="doc-catalog">
                  {catalogByCategory.map((g) => (
                    <div className="doc-catalog-group" key={g.id}>
                      <p className="doc-catalog-title" style={{ color: g.color }}>{g.title}</p>
                      <div className="doc-catalog-items">
                        {g.list.map((it) => (
                          <button key={it.id} type="button" className="doc-chip"
                            onClick={() => addFromCatalog(it)} title={it.description ?? undefined}>
                            <span className="doc-chip-name">{it.name}</span>
                            <span className={`doc-chip-price${it.to_quote ? " is-toquote" : ""}`}>
                              {it.to_quote ? t.catalogToQuote : money(it.unit_price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="esp-panel">
            <header className="esp-panel-head">
              <h2 className="esp-h3">{t.linesTitle}</h2>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <button type="button" className="esp-btn esp-btn-sm" onClick={addFree}>
                  <Plus size={12} aria-hidden /> {t.addLine}
                </button>
                <button type="button" className="esp-btn esp-btn-sm" onClick={addDiscount}>
                  <Percent size={12} aria-hidden /> {t.addDiscount}
                </button>
              </div>
            </header>
            <div className="esp-panel-body">
              {draft.lines.length === 0 ? (
                <p className="esp-small" style={{ padding: "0.75rem 0" }}>{t.noLines}</p>
              ) : (
                <div className="doc-lines">
                  <div className="doc-line doc-line-head" aria-hidden>
                    <span>{t.colDesignation}</span>
                    <span>{t.colQty}</span>
                    <span>{t.colUnit2}</span>
                    <span>{t.colUnit}</span>
                    <span>{t.colTax}</span>
                    <span />
                  </div>

                  {draft.lines.map((l) => l.kind === "discount" ? (
                    <div className="doc-line is-discount" key={l.id}>
                      <div className="doc-line-main">
                        <input className="esp-input" value={l.label} aria-label={t.colDesignation}
                          onChange={(e) => setLine(l.id, { label: e.target.value })} />
                      </div>
                      <div className="doc-line-cell" style={{ gridColumn: "span 2" }}>
                        <span className="doc-line-cell-k">%</span>
                        <input className="esp-input n" type="number" min={0} max={100} step={1}
                          aria-label={t.addDiscount} value={numValue(l.percent ?? 0)} placeholder="0"
                          onChange={(e) => setLine(l.id, { percent: toNum(e.target.value) })} />
                      </div>
                      <div className="doc-line-cell" style={{ gridColumn: "span 2", alignSelf: "center" }}>
                        <span className="esp-small esp-num">
                          −{money(roundMoney((totals.subtotalHT * (l.percent ?? 0)) / 100, currency))}
                        </span>
                      </div>
                      <button type="button" className="doc-line-x" aria-label={t.removeLine}
                        onClick={() => dropLine(l.id)}>
                        <Trash2 size={13} aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <div className="doc-line" key={l.id}>
                      <div className="doc-line-main">
                        <input className="esp-input" value={l.label} placeholder={t.colDesignation}
                          aria-label={t.colDesignation}
                          onChange={(e) => setLine(l.id, { label: e.target.value })} />
                        <input className="esp-input doc-line-desc" value={l.desc ?? ""} placeholder="…"
                          aria-label={t.colDesignation}
                          onChange={(e) => setLine(l.id, { desc: e.target.value })} />
                      </div>
                      <div className="doc-line-cell">
                        <span className="doc-line-cell-k">{t.colQty}</span>
                        <input className="esp-input n" type="number" min={0} step={1} aria-label={t.colQty}
                          value={numValue(l.qty)} placeholder="0"
                          onChange={(e) => setLine(l.id, { qty: toNum(e.target.value) })} />
                      </div>
                      <div className="doc-line-cell">
                        <span className="doc-line-cell-k">{t.colUnit2}</span>
                        <select className="esp-select n" aria-label={t.colUnit2} value={l.unit ?? "unite"}
                          onChange={(e) => setLine(l.id, { unit: e.target.value as DocUnit })}>
                          {DOC_UNITS.map((u) => (
                            <option key={u} value={u}>{t.unitsShort[u]}</option>
                          ))}
                        </select>
                      </div>
                      <div className="doc-line-cell">
                        <span className="doc-line-cell-k">{t.colUnit}</span>
                        <input className="esp-input n" type="number" step={moneyStep(currency)}
                          aria-label={t.colUnit} value={numValue(l.unit_price)} placeholder="0"
                          onChange={(e) => setLine(l.id, { unit_price: toNum(e.target.value) })} />
                      </div>
                      <div className="doc-line-cell">
                        <span className="doc-line-cell-k">{t.colTax}</span>
                        <input className="esp-input n" type="number" min={0} max={100} step={0.001}
                          aria-label={t.colTax} value={numValue(l.tax_rate)} placeholder="0"
                          onChange={(e) => setLine(l.id, { tax_rate: toNum(e.target.value) })} />
                      </div>
                      <button type="button" className="doc-line-x" aria-label={t.removeLine}
                        onClick={() => dropLine(l.id)}>
                        <Trash2 size={13} aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="doc-totals" style={{ marginTop: "1rem" }}>
                <div className="doc-total-row"><span>{t.subtotal}</span><b>{money(totals.subtotalHT)}</b></div>
                {totals.discount > 0 && (
                  <div className="doc-total-row"><span>{t.discount}</span><b>−{money(totals.discount)}</b></div>
                )}
                {totals.taxes.map((b) => (
                  <div className="doc-total-row" key={b.rate}>
                    <span>{doc.tax_label} {b.rate} %</span><b>{money(b.amount)}</b>
                  </div>
                ))}
                <div className="doc-total-row is-grand">
                  <span>{t.totalTTC}</span><b>{money(totals.totalTTC)}</b>
                </div>
              </div>
            </div>
          </section>

          <section className="esp-panel">
            <header className="esp-panel-head"><h2 className="esp-h3">{t.dates}</h2></header>
            <div className="esp-panel-body">
              <div className="doc-grid-2">
                <label className="esp-field">
                  <span className="esp-label">{t.issuedOn}</span>
                  <input className="esp-input" type="date" value={draft.issuedOn}
                    onChange={(e) => patch({ issuedOn: e.target.value })} />
                </label>
                <label className="esp-field">
                  <span className="esp-label">{doc.kind === "quote" ? t.validUntil : t.dueOn}</span>
                  <input className="esp-input" type="date" value={draft.dueOn}
                    onChange={(e) => patch({ dueOn: e.target.value })} />
                </label>
              </div>
            </div>
          </section>

          <section className="esp-panel">
            <header className="esp-panel-head">
              <h2 className="esp-h3">{t.notesTitle}</h2>
              <span className="esp-micro">{t.notesHint}</span>
            </header>
            <div className="esp-panel-body">
              <textarea className="esp-textarea" value={draft.notes} aria-label={t.notesTitle}
                onChange={(e) => patch({ notes: e.target.value })} />
            </div>
          </section>
        </div>

        <div className="doc-preview">
          <DocumentSheet
            doc={doc} draft={draft} issuer={issuer} totals={totals}
            t={t} lang={lang} sourceNumber={source?.number ?? null}
          />
        </div>
      </div>
    </>
  );
}
