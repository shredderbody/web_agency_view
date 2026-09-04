"use client";

import { useState } from "react";
import { FolderPlus, Plus, Trash2 } from "lucide-react";
import { CATALOG_UNITS, type StoredCatalogItem } from "@/lib/portal/catalogStore";
import { formatMoney, moneyStep } from "@/lib/portal/money";
import type { DocUnit } from "@/lib/portal/documents.shared";
import { numValue, toNum, useQuotes } from "./context";

/* Le catalogue de l'exploitant.

   Il a été semé depuis la vitrine au premier accès ; à partir de là il lui
   appartient. La marge s'affiche quand un prix d'achat est renseigné — c'est
   souvent la seule raison pour laquelle quelqu'un ouvre cet écran deux fois.

   Édition EN PLACE, ligne à ligne : un catalogue se corrige par petites touches
   (un prix qui change, une prestation qu'on renomme), et un formulaire modal
   par prestation ferait trois clics là où il en faut zéro. */

export default function CatalogTab() {
  const ctx = useQuotes();
  const { t, issuer, categories, items } = ctx;
  const [busy, setBusy] = useState(false);
  const currency = issuer.currency;

  const groups = [
    ...categories.map((c) => ({
      id: c.id, name: c.name, color: c.color,
      list: items.filter((i) => i.category_id === c.id),
    })),
    {
      id: null as string | null, name: t.cat.noCategory, color: "#8a8a8a",
      list: items.filter((i) => !i.category_id),
    },
  ];

  const change = (item: StoredCatalogItem, patch: Record<string, unknown>) =>
    ctx.saveItem(patch, item.id);

  return (
    <div className="esp-stack">
      <section className="esp-panel">
        <header className="esp-panel-head">
          <h2 className="esp-h2">{t.cat.title}</h2>
          <span className="esp-small">{t.cat.count(items.length)}</span>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <button type="button" className="esp-btn esp-btn-sm" disabled={busy}
              onClick={async () => {
                setBusy(true);
                await ctx.saveCategory({ name: t.cat.addCategory, position: categories.length });
                setBusy(false);
              }}>
              <FolderPlus size={13} aria-hidden /> {t.cat.addCategory}
            </button>
            <button type="button" className="esp-btn esp-btn-primary esp-btn-sm" disabled={busy}
              onClick={async () => {
                setBusy(true);
                await ctx.saveItem({
                  name: t.cat.addItem, unitPrice: 0, taxRate: issuer.taxRate,
                  categoryId: categories[0]?.id ?? null, position: items.length,
                });
                setBusy(false);
              }}>
              <Plus size={13} aria-hidden /> {t.cat.addItem}
            </button>
          </div>
        </header>
        <div className="esp-panel-body">
          <p className="esp-micro">{t.cat.lead}</p>
        </div>
      </section>

      {items.length === 0 && categories.length === 0 && (
        <section className="esp-panel">
          <div className="esp-empty">
            <p className="esp-empty-t">{t.cat.emptyT}</p>
            <p className="esp-empty-d">{t.cat.emptyD}</p>
          </div>
        </section>
      )}

      {groups.filter((g) => g.id !== null || g.list.length > 0).map((g) => (
        <section className="esp-panel" key={g.id ?? "none"}>
          <header className="esp-panel-head">
            {g.id ? (
              <>
                <span className="qa-cat-dot" aria-hidden style={{ background: g.color }} />
                <input
                  className="esp-input qa-cat-name" value={g.name} aria-label={t.cat.categoryName}
                  onChange={(e) => ctx.saveCategory({ name: e.target.value }, g.id!)}
                />
                <input
                  className="qa-cat-color" type="color" value={g.color} aria-label={t.cat.color}
                  onChange={(e) => ctx.saveCategory({ color: e.target.value }, g.id!)}
                />
              </>
            ) : (
              <h3 className="esp-h3">{g.name}</h3>
            )}
            <span className="esp-small">{t.cat.count(g.list.length)}</span>
            {g.id && (
              <button type="button" className="esp-btn esp-btn-sm esp-btn-danger"
                aria-label={t.cat.delCategory} title={t.cat.delCategory}
                onClick={async () => {
                  if (!window.confirm(t.cat.delCategoryConfirm)) return;
                  await ctx.removeCategory(g.id!);
                }}>
                <Trash2 size={12} aria-hidden />
              </button>
            )}
          </header>

          {g.list.length === 0 ? (
            <div className="esp-panel-body"><p className="esp-micro">{t.cat.count(0)}</p></div>
          ) : (
            <div className="esp-panel-body">
              <div className="qa-cat-rows">
                <div className="qa-cat-row qa-cat-head" aria-hidden>
                  <span>{t.cat.itemName}</span>
                  <span>{t.cat.price}</span>
                  <span>{t.colUnit2}</span>
                  <span>{t.colTax}</span>
                  <span>{t.cat.purchase}</span>
                  <span>{t.cat.margin}</span>
                  <span />
                </div>

                {g.list.map((it) => {
                  // Marge en points : ce que l'exploitant regarde, pas l'écart brut.
                  const margin = it.purchase_price && it.unit_price > 0
                    ? Math.round(((it.unit_price - it.purchase_price) / it.unit_price) * 100)
                    : null;
                  return (
                    <div className="qa-cat-row" key={it.id}>
                      <div className="qa-cat-main">
                        <input className="esp-input" defaultValue={it.name} aria-label={t.cat.itemName}
                          onBlur={(e) => { if (e.target.value !== it.name) change(it, { name: e.target.value }); }} />
                        <input className="esp-input doc-line-desc" defaultValue={it.description ?? ""}
                          placeholder="…" aria-label={t.colDesignation}
                          onBlur={(e) => { if (e.target.value !== (it.description ?? "")) change(it, { description: e.target.value }); }} />
                      </div>

                      <div className="doc-line-cell">
                        <span className="doc-line-cell-k">{t.cat.price}</span>
                        <input className="esp-input n" type="number" step={moneyStep(currency)}
                          aria-label={t.cat.price} defaultValue={numValue(it.unit_price)} placeholder="0"
                          onBlur={(e) => change(it, { unitPrice: toNum(e.target.value) })} />
                      </div>

                      <div className="doc-line-cell">
                        <span className="doc-line-cell-k">{t.colUnit2}</span>
                        <select className="esp-select n" aria-label={t.colUnit2} value={it.unit}
                          onChange={(e) => change(it, { unit: e.target.value })}>
                          {CATALOG_UNITS.map((u) => (
                            <option key={u} value={u}>{t.unitsShort[u as DocUnit]}</option>
                          ))}
                        </select>
                      </div>

                      <div className="doc-line-cell">
                        <span className="doc-line-cell-k">{t.colTax}</span>
                        <input className="esp-input n" type="number" min={0} max={100} step={0.001}
                          aria-label={t.colTax} defaultValue={numValue(it.tax_rate)} placeholder="0"
                          onBlur={(e) => change(it, { taxRate: toNum(e.target.value) })} />
                      </div>

                      <div className="doc-line-cell">
                        <span className="doc-line-cell-k">{t.cat.purchase}</span>
                        <input className="esp-input n" type="number" min={0} step={moneyStep(currency)}
                          aria-label={t.cat.purchase} defaultValue={numValue(it.purchase_price)}
                          placeholder="—"
                          onBlur={(e) => change(it, { purchasePrice: e.target.value === "" ? null : toNum(e.target.value) })} />
                      </div>

                      <div className="doc-line-cell qa-cat-margin">
                        <span className="doc-line-cell-k">{t.cat.margin}</span>
                        <span className={margin === null ? "esp-micro" : `esp-small esp-num${margin < 0 ? " is-bad" : ""}`}>
                          {margin === null ? "—" : `${margin} %`}
                        </span>
                      </div>

                      <div className="qa-cat-actions">
                        <label className="qa-toquote" title={t.cat.toQuoteHint}>
                          <input type="checkbox" checked={it.to_quote}
                            onChange={(e) => change(it, { toQuote: e.target.checked })} />
                          <span>{t.cat.toQuote}</span>
                        </label>
                        <select className="esp-select" aria-label={t.cat.categoryName}
                          value={it.category_id ?? ""}
                          onChange={(e) => change(it, { categoryId: e.target.value || null })}>
                          <option value="">{t.cat.noCategory}</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <button type="button" className="doc-line-x" aria-label={t.cat.delItem}
                          onClick={() => ctx.removeItem(it.id)}>
                          <Trash2 size={13} aria-hidden />
                        </button>
                      </div>

                      <p className="qa-cat-price esp-micro">
                        {it.to_quote ? t.catalogToQuote : formatMoney(it.unit_price, currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
