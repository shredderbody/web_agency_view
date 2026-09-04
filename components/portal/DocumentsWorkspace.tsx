"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  AlertCircle, ArrowLeft, FilePlus2, FileText, Percent, Plus, Printer,
  Receipt, Save, Trash2, UserRound,
} from "lucide-react";
import type { QuotesPageData } from "@/lib/portal/quotesPage";
import type { CatalogItem } from "@/lib/portal/catalog";
import type { Issuer } from "@/lib/portal/issuer";
import {
  computeTotals, lineHT, newLineId, statusesFor, STATUS_LABEL, STATUS_TONE,
  type DocClient, type DocKind, type DocLine, type DocStatus, type DocTotals,
  type PortalDocument,
} from "@/lib/portal/documents.shared";
import { formatMoney, moneyStep, roundMoney } from "@/lib/portal/money";
import { docStrings, type DocStrings } from "@/lib/portal/documentsStrings";
import { spaceHref } from "@/lib/portal/paths";
import PortalBar from "./PortalBar";

/* ════════════════════════════════════════════════════════════════════════════
   L'OUTIL DE DEVIS ET DE FACTURES d'une vitrine — /<slug>/quotes, /<slug>/devis.

   Deux écrans, pas trois : la LISTE, et l'ÉDITEUR. Il n'y a pas d'écran
   « aperçu », parce que l'éditeur montre le document en même temps qu'on le
   compose — c'est la feuille de droite, et c'est exactement elle qui sort de
   l'imprimante (cf. `documents.css`, section impression).

   Trois partis pris de fonctionnement :

   1. UN DOCUMENT NAÎT SUR LE SERVEUR. « Nouveau devis » écrit tout de suite en
      base et reçoit son numéro. Pas de brouillon local sans numéro : un devis
      qu'on croit avoir et qui n'existe nulle part est pire que pas de devis.

   2. LES TOTAUX SE RECALCULENT ICI À CHAQUE FRAPPE, avec le code exact du
      serveur (`documents.shared.ts`) et l'arrondi exact de la devise. L'écran
      ne peut donc pas annoncer un total que la base contredira.

   3. LE CATALOGUE EST DÉJÀ LÀ. Les prestations de la vitrine, avec leurs prix
      publics, sont des pastilles : un clic pose la ligne. Ce qui n'a pas de
      prix affiché (« sur devis », « offert ») arrive à 0, à chiffrer.
   ════════════════════════════════════════════════════════════════════════════ */

/** L'état d'édition : ce que l'utilisateur a sous les doigts, pas encore en base. */
type Draft = {
  id: string;
  client: DocClient;
  customerId: string | null;
  lines: DocLine[];
  notes: string;
  status: DocStatus;
  issuedOn: string;
  dueOn: string;
};

type Busy = null | "create-quote" | "create-invoice" | "save" | "convert" | "delete";

function draftOf(doc: PortalDocument): Draft {
  return {
    id: doc.id,
    client: { ...doc.client },
    customerId: doc.customer_id,
    lines: Array.isArray(doc.lines) ? doc.lines.map((l) => ({ ...l })) : [],
    notes: doc.notes ?? "",
    status: doc.status,
    issuedOn: doc.issued_on,
    dueOn: doc.due_on ?? "",
  };
}

/** Date de document, écrite en toutes lettres — un devis n'affiche pas `2026-09-04`. */
function fmtDate(day: string, lang: "fr" | "en"): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return "—";
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
}

/** Un champ numérique vide vaut zéro — et s'affiche vide, pas « 0 ». */
function numValue(n: number): string | number {
  return n === 0 ? "" : n;
}

function toNum(raw: string): number {
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export default function DocumentsWorkspace({ data }: { data: QuotesPageData }) {
  const { tenant, issuer, catalog, contacts, lang, isAdmin } = data;
  const t = docStrings(lang);

  const [docs, setDocs] = useState<PortalDocument[]>(data.documents);
  const [kind, setKind] = useState<DocKind>("quote");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  /** L'empreinte du dernier état enregistré : sert uniquement à dire « modifié ». */
  const [clean, setClean] = useState<string>("");
  const [busy, setBusy] = useState<Busy>(null);
  const [err, setErr] = useState<string | null>(data.loadError);
  const [flash, setFlash] = useState<string | null>(null);

  const open = openId ? docs.find((d) => d.id === openId) ?? null : null;

  /* ── Réseau ─────────────────────────────────────────────────────────────── */

  async function call(method: string, body?: unknown, query = ""): Promise<PortalDocument | null> {
    const res = await fetch(`/api/portal/documents${query}`, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error ?? t.errorSave);
    return (payload.document as PortalDocument) ?? null;
  }

  function enter(doc: PortalDocument) {
    const d = draftOf(doc);
    setDraft(d);
    setClean(JSON.stringify(d));
    setOpenId(doc.id);
    setFlash(null);
    setErr(null);
  }

  function leave() {
    if (draft && JSON.stringify(draft) !== clean && !window.confirm(t.leaveConfirm)) return;
    setOpenId(null);
    setDraft(null);
    setFlash(null);
  }

  async function create(newKind: DocKind) {
    setBusy(newKind === "quote" ? "create-quote" : "create-invoice");
    setErr(null);
    try {
      const doc = await call("POST", { slug: tenant.slug, kind: newKind, lang });
      if (!doc) throw new Error(t.errorSave);
      setDocs((prev) => [doc, ...prev]);
      setKind(newKind);
      enter(doc);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.errorSave);
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!draft || !open) return;
    setBusy("save");
    setErr(null);
    try {
      const doc = await call("PATCH", {
        id: draft.id,
        client: draft.client,
        customerId: draft.customerId,
        lines: draft.lines,
        notes: draft.notes,
        status: draft.status,
        issuedOn: draft.issuedOn,
        dueOn: draft.dueOn || null,
      });
      if (!doc) throw new Error(t.errorSave);
      // On repart de ce que le SERVEUR a retenu, pas de ce qu'on lui a envoyé :
      // c'est lui qui borne les lignes et recalcule les totaux.
      setDocs((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
      const d = draftOf(doc);
      setDraft(d);
      setClean(JSON.stringify(d));
      setFlash(t.saved);
      window.setTimeout(() => setFlash(null), 4000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.errorSave);
    } finally {
      setBusy(null);
    }
  }

  async function convert() {
    if (!open || open.kind !== "quote") return;
    setBusy("convert");
    setErr(null);
    try {
      const invoice = await call("POST", { convert: open.id });
      if (!invoice) throw new Error(t.errorSave);
      setDocs((prev) => [invoice, ...prev]);
      setKind("invoice");
      enter(invoice);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.errorSave);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!open || !window.confirm(t.delConfirm)) return;
    setBusy("delete");
    setErr(null);
    try {
      await call("DELETE", undefined, `?id=${encodeURIComponent(open.id)}`);
      setDocs((prev) => prev.filter((d) => d.id !== open.id));
      setOpenId(null);
      setDraft(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.errorSave);
    } finally {
      setBusy(null);
    }
  }

  /* ── Modifications locales ──────────────────────────────────────────────── */

  const patch = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const setLine = (id: string, p: Partial<DocLine>) =>
    setDraft((d) =>
      d ? { ...d, lines: d.lines.map((l) => (l.id === id ? { ...l, ...p } : l)) } : d,
    );

  const dropLine = (id: string) =>
    setDraft((d) => (d ? { ...d, lines: d.lines.filter((l) => l.id !== id) } : d));

  const pushLine = (line: DocLine) =>
    setDraft((d) => (d ? { ...d, lines: [...d.lines, line] } : d));

  const addCatalog = (it: CatalogItem) =>
    pushLine({
      id: newLineId(), kind: "item", label: it.name, desc: it.desc,
      qty: 1, unit_price: it.unitPrice, tax_rate: issuer.taxRate,
    });

  const addFree = () =>
    pushLine({
      id: newLineId(), kind: "item", label: "", qty: 1, unit_price: 0,
      tax_rate: issuer.taxRate,
    });

  const addDiscount = () =>
    pushLine({
      id: newLineId(), kind: "discount", label: t.discountLine,
      qty: 0, unit_price: 0, tax_rate: 0, percent: 10,
    });

  /** Reprendre un client de l'espace : on ne ressaisit pas ce qu'on connaît. */
  function pickContact(id: string) {
    const c = contacts.find((x) => x.id === id);
    if (!c) {
      patch({ customerId: null });
      return;
    }
    setDraft((d) =>
      d
        ? {
            ...d,
            customerId: c.id,
            client: { ...d.client, name: c.name ?? d.client.name, phone: c.phone, email: c.email },
          }
        : d,
    );
  }

  /* ── Dérivés ────────────────────────────────────────────────────────────── */

  const currency = open?.currency ?? issuer.currency;
  const totals: DocTotals = useMemo(
    () => computeTotals(draft?.lines ?? [], (n) => roundMoney(n, currency)),
    [draft?.lines, currency],
  );
  const money = (n: number) => formatMoney(n, currency);
  const dirty = Boolean(draft) && JSON.stringify(draft) !== clean;
  const rows = docs.filter((d) => d.kind === kind);
  const counts = {
    quote: docs.filter((d) => d.kind === "quote").length,
    invoice: docs.filter((d) => d.kind === "invoice").length,
  };

  /* ══════════════════════════════════════════════════════════════════════════
     ÉCRAN 1 — la liste
     ══════════════════════════════════════════════════════════════════════════ */

  if (!open || !draft) {
    return (
      <div className="esp-shell">
        <PortalBar
          title={tenant.business} subtitle={tenant.city}
          demoHref={`/demo/${tenant.slug}`} isAdmin={isAdmin} adminHome={isAdmin}
        />
        <main className="esp-main">
          <div className="esp-wrap">
            <div className="esp-pagehead" style={{ marginBottom: "1.25rem" }}>
              <div>
                <h1 className="esp-h1">{t.title}</h1>
                <p className="esp-lead" style={{ marginTop: "0.3rem" }}>{t.lead(issuer.trade)}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <a className="esp-btn" href={spaceHref(tenant.slug)}>{t.backToSpace}</a>
                <button
                  type="button" className="esp-btn esp-btn-primary"
                  onClick={() => create(kind)} disabled={busy !== null}
                >
                  <Plus size={13} aria-hidden />
                  {busy?.startsWith("create")
                    ? t.creating
                    : kind === "quote" ? t.newQuote : t.newInvoice}
                </button>
              </div>
            </div>

            {err && (
              <p className="esp-note esp-note-bad" role="alert" style={{ marginBottom: "1.25rem" }}>
                <AlertCircle size={15} aria-hidden />
                <span>{err}</span>
              </p>
            )}

            <div className="esp-tabs" role="tablist">
              {(["quote", "invoice"] as const).map((k) => (
                <button
                  key={k} type="button" role="tab" className="esp-tab"
                  aria-selected={kind === k} onClick={() => setKind(k)}
                >
                  {k === "quote"
                    ? <FileText size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
                    : <Receipt size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />}
                  {t.tabs[k]}
                  <span className="esp-tab-count">{counts[k]}</span>
                </button>
              ))}
            </div>

            <section className="esp-panel">
              {rows.length === 0 ? (
                <div className="esp-empty">
                  <p className="esp-empty-t">{kind === "quote" ? t.emptyQuoteT : t.emptyInvoiceT}</p>
                  <p className="esp-empty-d">{kind === "quote" ? t.emptyQuoteD : t.emptyInvoiceD}</p>
                  <button
                    type="button" className="esp-btn esp-btn-primary esp-btn-sm"
                    style={{ marginTop: "0.4rem" }}
                    onClick={() => create(kind)} disabled={busy !== null}
                  >
                    <FilePlus2 size={13} aria-hidden />
                    {kind === "quote" ? t.newQuote : t.newInvoice}
                  </button>
                </div>
              ) : (
                <div className="esp-tablewrap">
                  <table className="esp-table">
                    <thead>
                      <tr>
                        <th scope="col">{t.colNumber}</th>
                        <th scope="col">{t.colDate}</th>
                        <th scope="col">{t.colClient}</th>
                        <th scope="col" className="n">{t.colTotal}</th>
                        <th scope="col">{t.colStatus}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((d) => (
                        <tr key={d.id}>
                          <td>
                            <button type="button" className="doc-open" onClick={() => enter(d)}>
                              {d.number}
                            </button>
                          </td>
                          <td>{fmtDate(d.issued_on, d.lang)}</td>
                          <td>
                            {d.client?.name || (
                              <span style={{ color: "var(--esp-ink-3)" }}>{t.noClient}</span>
                            )}
                          </td>
                          <td className="n">{formatMoney(d.total_ttc, d.currency)}</td>
                          <td>
                            <span className={`esp-badge esp-badge-${STATUS_TONE[d.status]}`}>
                              {STATUS_LABEL[d.lang][d.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ÉCRAN 2 — l'éditeur, la feuille à côté
     ══════════════════════════════════════════════════════════════════════════ */

  const source = open.source_id ? docs.find((d) => d.id === open.source_id) ?? null : null;

  return (
    <div className="esp-shell">
      <PortalBar
        title={tenant.business} subtitle={tenant.city}
        demoHref={`/demo/${tenant.slug}`} isAdmin={isAdmin} adminHome={isAdmin}
      />
      <main className="esp-main">
        <div className="esp-wrap">
          <div className="doc-toolbar esp-print-hide">
            <button type="button" className="esp-btn esp-btn-quiet" onClick={leave}>
              <ArrowLeft size={13} aria-hidden /> {t.back}
            </button>
            <div className="doc-toolbar-title">
              <span className="doc-toolbar-num">
                {open.kind === "quote" ? t.quoteWord : t.invoiceWord} {open.number}
              </span>
              {dirty && <span className="esp-micro">{t.unsaved}</span>}
              {!dirty && flash && <span className="esp-micro">{flash}</span>}
            </div>

            <span className="doc-toolbar-spacer" />

            <select
              className="esp-select" style={{ width: "auto" }} aria-label={t.statusLabel}
              value={draft.status}
              onChange={(e) => patch({ status: e.target.value as DocStatus })}
            >
              {statusesFor(open.kind).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[lang][s]}</option>
              ))}
            </select>

            {open.kind === "quote" && (
              <button type="button" className="esp-btn" onClick={convert} disabled={busy !== null}>
                <Receipt size={13} aria-hidden />
                {busy === "convert" ? t.converting : t.convert}
              </button>
            )}
            <button type="button" className="esp-btn" onClick={() => window.print()}>
              <Printer size={13} aria-hidden /> {t.print}
            </button>
            <button
              type="button" className="esp-btn esp-btn-primary" onClick={save}
              disabled={busy !== null || !dirty}
            >
              <Save size={13} aria-hidden />
              {busy === "save" ? t.saving : t.save}
            </button>
            <button
              type="button" className="esp-btn esp-btn-danger esp-btn-sm"
              onClick={remove} disabled={busy !== null} aria-label={t.del}
            >
              <Trash2 size={13} aria-hidden />
            </button>
          </div>

          {err && (
            <p className="esp-note esp-note-bad esp-print-hide" role="alert" style={{ marginBottom: "1rem" }}>
              <AlertCircle size={15} aria-hidden />
              <span>{err}</span>
            </p>
          )}

          <div className="doc-split">
            {/* ── Volet de saisie ────────────────────────────────────────── */}
            <div className="doc-pane esp-print-hide">
              <section className="esp-panel">
                <header className="esp-panel-head">
                  <h2 className="esp-h3">
                    <UserRound size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
                    {t.clientTitle}
                  </h2>
                </header>
                <div className="esp-panel-body" style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  {contacts.length > 0 && (
                    <label className="esp-field">
                      <span className="esp-label">{t.pickContact}</span>
                      <select
                        className="esp-select" value={draft.customerId ?? ""}
                        onChange={(e) => pickContact(e.target.value)}
                      >
                        <option value="">—</option>
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name ? `${c.name} · ${c.phone}` : c.phone}
                          </option>
                        ))}
                      </select>
                      <span className="esp-micro">{t.pickContactHint}</span>
                    </label>
                  )}

                  <label className="esp-field">
                    <span className="esp-label">{t.clientName}</span>
                    <input
                      className="esp-input" value={draft.client.name}
                      onChange={(e) => patch({ client: { ...draft.client, name: e.target.value } })}
                    />
                  </label>

                  <div className="doc-grid-2">
                    <label className="esp-field">
                      <span className="esp-label">{t.clientEmail}</span>
                      <input
                        className="esp-input" type="email" value={draft.client.email ?? ""}
                        onChange={(e) => patch({ client: { ...draft.client, email: e.target.value } })}
                      />
                    </label>
                    <label className="esp-field">
                      <span className="esp-label">{t.clientPhone}</span>
                      <input
                        className="esp-input" type="tel" value={draft.client.phone ?? ""}
                        onChange={(e) => patch({ client: { ...draft.client, phone: e.target.value } })}
                      />
                    </label>
                  </div>

                  <label className="esp-field">
                    <span className="esp-label">{t.clientAddress}</span>
                    <input
                      className="esp-input" value={draft.client.address ?? ""}
                      onChange={(e) => patch({ client: { ...draft.client, address: e.target.value } })}
                    />
                  </label>

                  <div className="doc-grid-3">
                    <label className="esp-field">
                      <span className="esp-label">{t.clientPostal}</span>
                      <input
                        className="esp-input" value={draft.client.postal_code ?? ""}
                        onChange={(e) => patch({ client: { ...draft.client, postal_code: e.target.value } })}
                      />
                    </label>
                    <label className="esp-field">
                      <span className="esp-label">{t.clientCity}</span>
                      <input
                        className="esp-input" value={draft.client.city ?? ""}
                        onChange={(e) => patch({ client: { ...draft.client, city: e.target.value } })}
                      />
                    </label>
                  </div>
                </div>
              </section>

              {catalog.length > 0 && (
                <section className="esp-panel">
                  <header className="esp-panel-head">
                    <h2 className="esp-h3">{t.catalogTitle}</h2>
                    <span className="esp-micro">{t.catalogHint}</span>
                  </header>
                  <div className="esp-panel-body">
                    <div className="doc-catalog">
                      {catalog.map((g) => (
                        <div className="doc-catalog-group" key={g.title}>
                          <p className="doc-catalog-title">{g.title}</p>
                          <div className="doc-catalog-items">
                            {g.items.map((it, i) => (
                              <button
                                key={`${g.title}-${it.name}-${i}`} type="button"
                                className="doc-chip" onClick={() => addCatalog(it)}
                                title={it.desc}
                              >
                                <span className="doc-chip-name">{it.name}</span>
                                <span className={`doc-chip-price${it.toQuote ? " is-toquote" : ""}`}>
                                  {it.toQuote ? t.catalogToQuote : money(it.unitPrice)}
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
                        <span>{t.colUnit}</span>
                        <span>{t.colTax}</span>
                        <span />
                      </div>

                      {draft.lines.map((l) =>
                        l.kind === "discount" ? (
                          <div className="doc-line is-discount" key={l.id}>
                            <div className="doc-line-main">
                              <input
                                className="esp-input" value={l.label}
                                aria-label={t.colDesignation}
                                onChange={(e) => setLine(l.id, { label: e.target.value })}
                              />
                            </div>
                            <div className="doc-line-cell" style={{ gridColumn: "span 2" }}>
                              <span className="doc-line-cell-k">%</span>
                              <input
                                className="esp-input n" type="number" min={0} max={100} step={1}
                                aria-label={t.addDiscount}
                                value={numValue(l.percent ?? 0)} placeholder="0"
                                onChange={(e) => setLine(l.id, { percent: toNum(e.target.value) })}
                              />
                            </div>
                            <div className="doc-line-cell" style={{ alignSelf: "center" }}>
                              <span className="esp-small esp-num">
                                −{money(roundMoney((totals.subtotalHT * (l.percent ?? 0)) / 100, currency))}
                              </span>
                            </div>
                            <button
                              type="button" className="doc-line-x" onClick={() => dropLine(l.id)}
                              aria-label={t.removeLine}
                            >
                              <Trash2 size={13} aria-hidden />
                            </button>
                          </div>
                        ) : (
                          <div className="doc-line" key={l.id}>
                            <div className="doc-line-main">
                              <input
                                className="esp-input" value={l.label} placeholder={t.colDesignation}
                                aria-label={t.colDesignation}
                                onChange={(e) => setLine(l.id, { label: e.target.value })}
                              />
                              <input
                                className="esp-input doc-line-desc" value={l.desc ?? ""}
                                placeholder="…" aria-label={t.colDesignation}
                                onChange={(e) => setLine(l.id, { desc: e.target.value })}
                              />
                            </div>
                            <div className="doc-line-cell">
                              <span className="doc-line-cell-k">{t.colQty}</span>
                              <input
                                className="esp-input n" type="number" min={0} step={1}
                                aria-label={t.colQty} value={numValue(l.qty)} placeholder="0"
                                onChange={(e) => setLine(l.id, { qty: toNum(e.target.value) })}
                              />
                            </div>
                            <div className="doc-line-cell">
                              <span className="doc-line-cell-k">{t.colUnit}</span>
                              <input
                                className="esp-input n" type="number" step={moneyStep(currency)}
                                aria-label={t.colUnit} value={numValue(l.unit_price)} placeholder="0"
                                onChange={(e) => setLine(l.id, { unit_price: toNum(e.target.value) })}
                              />
                            </div>
                            <div className="doc-line-cell">
                              <span className="doc-line-cell-k">{t.colTax}</span>
                              <input
                                className="esp-input n" type="number" min={0} max={100} step={0.001}
                                aria-label={t.colTax} value={numValue(l.tax_rate)} placeholder="0"
                                onChange={(e) => setLine(l.id, { tax_rate: toNum(e.target.value) })}
                              />
                            </div>
                            <button
                              type="button" className="doc-line-x" onClick={() => dropLine(l.id)}
                              aria-label={t.removeLine}
                            >
                              <Trash2 size={13} aria-hidden />
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <div className="doc-totals" style={{ marginTop: "1rem" }}>
                    <div className="doc-total-row">
                      <span>{t.subtotal}</span><b>{money(totals.subtotalHT)}</b>
                    </div>
                    {totals.discount > 0 && (
                      <div className="doc-total-row">
                        <span>{t.discount}</span><b>−{money(totals.discount)}</b>
                      </div>
                    )}
                    {totals.taxes.map((b) => (
                      <div className="doc-total-row" key={b.rate}>
                        <span>{open.tax_label} {b.rate} %</span><b>{money(b.amount)}</b>
                      </div>
                    ))}
                    <div className="doc-total-row is-grand">
                      <span>{t.totalTTC}</span><b>{money(totals.totalTTC)}</b>
                    </div>
                  </div>
                </div>
              </section>

              <section className="esp-panel">
                <header className="esp-panel-head">
                  <h2 className="esp-h3">{t.dates}</h2>
                </header>
                <div className="esp-panel-body">
                  <div className="doc-grid-2">
                    <label className="esp-field">
                      <span className="esp-label">{t.issuedOn}</span>
                      <input
                        className="esp-input" type="date" value={draft.issuedOn}
                        onChange={(e) => patch({ issuedOn: e.target.value })}
                      />
                    </label>
                    <label className="esp-field">
                      <span className="esp-label">{open.kind === "quote" ? t.validUntil : t.dueOn}</span>
                      <input
                        className="esp-input" type="date" value={draft.dueOn}
                        onChange={(e) => patch({ dueOn: e.target.value })}
                      />
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
                  <textarea
                    className="esp-textarea" value={draft.notes} aria-label={t.notesTitle}
                    onChange={(e) => patch({ notes: e.target.value })}
                  />
                </div>
              </section>
            </div>

            {/* ── La feuille — l'aperçu EST le document imprimé ──────────── */}
            <div className="doc-preview">
              <DocumentSheet
                doc={open} draft={draft} issuer={issuer} totals={totals}
                t={t} lang={lang} sourceNumber={source?.number ?? null}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   LA FEUILLE.

   Elle ne lit QUE le brouillon en cours, jamais la ligne en base : ce qui est à
   l'écran est ce qu'on est en train d'écrire. Et comme `@media print` ne fait
   que retirer l'application autour d'elle, c'est aussi, au pixel près, ce qui
   sortira de l'imprimante.
   ════════════════════════════════════════════════════════════════════════════ */

function DocumentSheet({
  doc, draft, issuer, totals, t, lang, sourceNumber,
}: {
  doc: PortalDocument;
  draft: Draft;
  issuer: Issuer;
  totals: DocTotals;
  t: DocStrings;
  lang: "fr" | "en";
  sourceNumber: string | null;
}) {
  const money = (n: number) => formatMoney(n, doc.currency);
  const contact = [issuer.phone, issuer.email, issuer.website].filter(Boolean).join(" · ");
  const c = draft.client;
  const hasClient = Boolean(c.name || c.address || c.city || c.email || c.phone);

  return (
    <article className="esp-doc-sheet" style={{ "--doc-accent": issuer.accent } as CSSProperties}>
      <div className="doc-rule" />

      <header className="doc-head">
        <div className="doc-head-id">
          <p className="doc-issuer-name">{issuer.name}</p>
          <p className="doc-issuer-trade">{issuer.trade}</p>
          <p className="doc-issuer-meta">{issuer.address}<br />{issuer.city}</p>
          {contact && <p className="doc-issuer-meta">{contact}</p>}
          {issuer.registration && <p className="doc-issuer-reg">{issuer.registration}</p>}
        </div>
        <div className="doc-head-mark">
          <p className="doc-kind">{doc.kind === "quote" ? t.quoteWord : t.invoiceWord}</p>
          <p className="doc-number">{t.numberWord} {doc.number}</p>
          <p className="doc-dates">
            <span>{t.issuedOn} <b>{fmtDate(draft.issuedOn, lang)}</b></span>
            {draft.dueOn && (
              <span>
                {doc.kind === "quote" ? t.validUntil : t.dueOn} <b>{fmtDate(draft.dueOn, lang)}</b>
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
            <tr>
              <td className="doc-table-empty" colSpan={5}>{t.noLines}</td>
            </tr>
          )}
          {draft.lines.map((l) =>
            l.kind === "discount" ? (
              <tr className="doc-row-discount" key={l.id}>
                <td colSpan={4}>
                  {l.label || t.discountLine} · {l.percent ?? 0} %
                </td>
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
                <td className="n">{l.qty}</td>
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

      {doc.kind === "quote" && <div className="doc-sign">{t.signature}</div>}

      <footer className="doc-legal">
        <p className="doc-legal-from">{t.page} {issuer.name} · {issuer.city}</p>
        {issuer.legalNotes.map((n) => <p key={n}>{n}</p>)}
      </footer>
    </article>
  );
}
