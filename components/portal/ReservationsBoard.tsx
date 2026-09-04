"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays, Check, ChevronLeft, ChevronRight, Clock, LayoutGrid, Loader2,
  Phone, RotateCcw, Users, X,
} from "lucide-react";
import type { PortalReservation, ReservationStatus } from "@/lib/portal/types";
import type { DemoTenant } from "@/lib/portal/registry";
import { usePortalI18n } from "@/lib/portal/i18nClient";
import type { PortalStrings } from "@/lib/portal/portalStrings";
import type { Lang } from "@/lib/i18n";
import { fmtFullDay, fmtMonth, fmtSlot, fmtTimeOnly, fromLocalInput, toLocalInput } from "./format";

/* ════════════════════════════════════════════════════════════════════════════
   Réservations — deux lectures du même jeu de données, au choix de
   l'utilisateur : le CALENDRIER pour se projeter (« ma semaine est-elle
   pleine ? »), les CARTES pour traiter (« qui dois-je rappeler ? »).

   L'édition se fait EN PLACE, dans la carte : une modale pour changer un
   créneau ferait perdre de vue le reste de la journée, qui est précisément
   l'information dont on a besoin pour décider du report.

   Toute modification part vers PATCH /api/portal/reservations, qui écrit l'état
   ET une ligne dans le journal d'actions. Rien ne change ici sans laisser de trace.
   ════════════════════════════════════════════════════════════════════════════ */

/* Seule la CLASSE de couleur vit ici : c'est un choix de forme, il ne change
   pas avec la langue. Le libellé vient du dictionnaire. */
const STATUS_CLASS: Record<ReservationStatus, string> = {
  pending: "esp-badge-wait", confirmed: "esp-badge-ok", rescheduled: "esp-badge-wait",
  cancelled: "esp-badge-bad", done: "esp-badge-off", no_show: "esp-badge-bad",
};

/** Clé AAAA-MM-JJ d'un instant, dans le fuseau du commerce. */
function dayKey(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(iso));
}

function todayKey(tz: string): string {
  return dayKey(new Date().toISOString(), tz);
}

export default function ReservationsBoard({
  tenant, reservations: initial, canEdit,
}: {
  tenant: DemoTenant;
  reservations: PortalReservation[];
  canEdit: boolean;
}) {
  const { lang, t } = usePortalI18n();
  const [rows, setRows] = useState(initial);
  const [view, setView] = useState<"calendar" | "cards">("calendar");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const today = todayKey(tenant.timezone);
  const [cursor, setCursor] = useState(() => today.slice(0, 7)); // AAAA-MM
  const [selected, setSelected] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, PortalReservation[]>();
    for (const r of rows) {
      if (!r.starts_at) continue;
      const key = dayKey(r.starts_at, tenant.timezone);
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.starts_at ?? "").localeCompare(b.starts_at ?? ""));
    }
    return map;
  }, [rows, tenant.timezone]);

  const undated = rows.filter((r) => !r.starts_at);

  /* Grille du mois : on part du lundi de la semaine du 1er. */
  const cells = useMemo(() => {
    const [y, m] = cursor.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const start = new Date(first.getTime() - offset * 86400_000);
    // 4, 5 ou 6 semaines selon le mois : une sixième rangée entièrement grise
    // ajoute de la hauteur sans rien apprendre.
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const weeks = Math.ceil((offset + daysInMonth) / 7);
    return Array.from({ length: weeks * 7 }, (_, i) => {
      const d = new Date(start.getTime() + i * 86400_000);
      const key = d.toISOString().slice(0, 10);
      return { key, day: d.getUTCDate(), inMonth: key.slice(0, 7) === cursor };
    });
  }, [cursor]);

  const monthLabel = fmtMonth(cursor, lang);

  const shiftMonth = (delta: number) => {
    const [y, m] = cursor.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    setCursor(d.toISOString().slice(0, 7));
    setSelected(null);
  };

  async function apply(id: string, patch: Record<string, unknown>) {
    setBusyId(id);
    setFailure(null);
    try {
      const res = await fetch("/api/portal/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.res.saveError);
      if (data.reservation) {
        setRows((prev) => prev.map((r) => (r.id === id ? data.reservation : r)));
      }
      setOpenId(null);
    } catch (err) {
      setFailure(err instanceof Error ? err.message : t.res.saveError);
    } finally {
      setBusyId(null);
    }
  }

  const visible = selected
    ? (byDay.get(selected) ?? [])
    : [...rows].sort((a, b) => (b.starts_at ?? "").localeCompare(a.starts_at ?? ""));

  return (
    <section className="esp-panel">
      <header className="esp-panel-head">
        <h2 className="esp-h2">{t.res.title}</h2>
        <span className="esp-small">
          {t.res.total(rows.length)}
          {undated.length > 0 && ` · ${t.res.undated(undated.length)}`}
        </span>
        <div className="esp-seg">
          <button
            type="button" className="esp-seg-b" aria-pressed={view === "calendar"}
            onClick={() => setView("calendar")}
          >
            <CalendarDays size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.3rem" }} />
            {t.res.calendar}
          </button>
          <button
            type="button" className="esp-seg-b" aria-pressed={view === "cards"}
            onClick={() => { setView("cards"); setSelected(null); }}
          >
            <LayoutGrid size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.3rem" }} />
            {t.res.cards}
          </button>
        </div>
      </header>

      {failure && (
        <div className="esp-panel-body" style={{ paddingBottom: "0.85rem" }}>
          <p className="esp-note esp-note-bad" role="alert">{failure}</p>
        </div>
      )}

      {view === "calendar" && (
        <>
          <div className="esp-cal-head">
            <button
              type="button" className="esp-btn esp-btn-quiet esp-btn-sm"
              onClick={() => shiftMonth(-1)} aria-label={t.res.prevMonth}
            >
              <ChevronLeft size={15} aria-hidden />
            </button>
            <span className="esp-cal-month">{monthLabel}</span>
            <button
              type="button" className="esp-btn esp-btn-quiet esp-btn-sm"
              onClick={() => shiftMonth(1)} aria-label={t.res.nextMonth}
            >
              <ChevronRight size={15} aria-hidden />
            </button>
            <button
              type="button" className="esp-btn esp-btn-sm" style={{ marginLeft: "0.25rem" }}
              onClick={() => { setCursor(today.slice(0, 7)); setSelected(today); }}
            >
              {t.res.today}
            </button>
            {selected && (
              <button
                type="button" className="esp-btn esp-btn-quiet esp-btn-sm"
                style={{ marginLeft: "auto" }} onClick={() => setSelected(null)}
              >
                <X size={13} aria-hidden /> {t.res.wholeMonth}
              </button>
            )}
            <span className="esp-micro" style={{ marginLeft: selected ? "0.5rem" : "auto" }}>
              {t.res.localHours(tenant.timezone.split("/")[1]?.replace("_", " ") ?? tenant.timezone)}
            </span>
          </div>

          <div className="esp-cal-grid" role="grid">
            {t.res.dow.map((d) => (
              <div key={d} className="esp-cal-dow" role="columnheader">{d}</div>
            ))}
            {cells.map((c) => {
              const items = byDay.get(c.key) ?? [];
              return (
                <button
                  key={c.key}
                  type="button"
                  role="gridcell"
                  className={[
                    "esp-cal-cell",
                    c.inMonth ? "" : "is-out",
                    selected === c.key ? "is-sel" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => setSelected(selected === c.key ? null : c.key)}
                  aria-label={t.res.cellAria(c.day, items.length)}
                >
                  <span className="esp-cal-n">
                    {c.key === today ? <span className="esp-cal-today">{c.day}</span> : c.day}
                  </span>
                  {items.slice(0, 3).map((r) => (
                    <span
                      key={r.id}
                      className="esp-cal-chip"
                      style={{
                        background: r.status === "cancelled" ? "var(--esp-off-bg)" : "var(--esp-voice-soft)",
                        color: r.status === "cancelled" ? "var(--esp-off)" : "var(--esp-voice)",
                        textDecoration: r.status === "cancelled" ? "line-through" : "none",
                      }}
                    >
                      {fmtTimeOnly(r.starts_at, tenant.timezone, lang)} {r.customer_name ?? t.res.client}
                    </span>
                  ))}
                  {items.length > 3 && <span className="esp-cal-more">+{items.length - 3}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="esp-panel-body" style={{ paddingTop: view === "calendar" ? "1.1rem" : "0.25rem" }}>
        {selected && (
          <h3 className="esp-h3" style={{ marginBottom: "0.7rem" }}>
            {fmtFullDay(selected, lang)}
            <span className="esp-small" style={{ fontWeight: 400, marginLeft: "0.5rem" }}>
              {t.res.onDay(visible.length)}
            </span>
          </h3>
        )}

        {visible.length === 0 && !selected && (
          <div className="esp-empty">
            <CalendarDays size={22} aria-hidden style={{ color: "var(--esp-ink-3)" }} />
            <p className="esp-empty-t">{t.res.emptyT}</p>
            <p className="esp-empty-d">{t.res.emptyD}</p>
          </div>
        )}

        {visible.length > 0 && (
          <div className="esp-cards">
            {visible.map((r) => (
              <Card
                key={r.id}
                r={r}
                tenant={tenant}
                canEdit={canEdit}
                open={openId === r.id}
                busy={busyId === r.id}
                onToggle={() => setOpenId(openId === r.id ? null : r.id)}
                onApply={(patch) => apply(r.id, patch)}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        )}

        {undated.length > 0 && !selected && (
          <p className="esp-micro" style={{ marginTop: "0.9rem" }}>
            {t.res.undatedHint(undated.length)}
          </p>
        )}
      </div>
    </section>
  );
}

function Card({
  r, tenant, canEdit, open, busy, onToggle, onApply, lang, t,
}: {
  r: PortalReservation;
  tenant: DemoTenant;
  canEdit: boolean;
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  onApply: (patch: Record<string, unknown>) => void;
  lang: Lang;
  t: PortalStrings;
}) {
  const [slot, setSlot] = useState(() => toLocalInput(r.starts_at, tenant.timezone));
  const [note, setNote] = useState(r.notes ?? "");
  const statusClass = STATUS_CLASS[r.status];
  const moved = r.original_starts_at && r.starts_at && r.original_starts_at !== r.starts_at;

  return (
    <article className={`esp-card${open ? " is-open" : ""}${r.status === "cancelled" ? " is-cancelled" : ""}`}>
      <div className="esp-card-top">
        <div style={{ minWidth: 0 }}>
          <p className="esp-card-when">{fmtSlot(r.starts_at, tenant.timezone, lang)}</p>
          <p className="esp-card-who">{r.customer_name ?? t.res.unnamed}</p>
        </div>
        <span className={`esp-badge ${statusClass}`} style={{ marginLeft: "auto", flex: "none" }}>{t.res.status[r.status]}</span>
      </div>

      <div className="esp-card-meta">
        {r.customer_phone && (
          <span><Phone size={12} aria-hidden />
            <a href={`tel:${r.customer_phone}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "2px" }}>
              {r.customer_phone}
            </a>
          </span>
        )}
        {r.party_size != null && <span><Users size={12} aria-hidden />{t.res.people(r.party_size)}</span>}
        {moved && (
          <span title={t.res.originalSlot}>
            <RotateCcw size={12} aria-hidden />
            {t.res.originally(fmtSlot(r.original_starts_at, tenant.timezone, lang))}
          </span>
        )}
      </div>

      {r.service && <p className="esp-small" style={{ margin: 0 }}>{r.service}</p>}
      {r.notes && !open && <p className="esp-micro" style={{ margin: 0 }}>{t.res.note(r.notes)}</p>}

      {canEdit && (
        <div className="esp-card-actions">
          {r.status !== "confirmed" && r.status !== "cancelled" && (
            <button type="button" className="esp-btn esp-btn-sm" disabled={busy}
              onClick={() => onApply({ status: "confirmed" })}>
              <Check size={13} aria-hidden /> {t.res.confirm}
            </button>
          )}
          <button type="button" className="esp-btn esp-btn-sm" onClick={onToggle} aria-expanded={open}>
            <Clock size={13} aria-hidden /> {open ? t.res.close : t.res.edit}
          </button>
          {r.status !== "cancelled" && (
            <button type="button" className="esp-btn esp-btn-sm esp-btn-danger" disabled={busy}
              onClick={() => onApply({ status: "cancelled" })}>
              <X size={13} aria-hidden /> {t.res.cancel}
            </button>
          )}
          {busy && <Loader2 size={14} className="esp-spin" aria-hidden style={{ alignSelf: "center", color: "var(--esp-ink-3)" }} />}
        </div>
      )}

      {open && canEdit && (
        <div className="esp-card-edit">
          <div className="esp-field">
            <label className="esp-label" htmlFor={`slot-${r.id}`}>
              {t.res.slot} <span style={{ fontWeight: 400, color: "var(--esp-ink-3)" }}>{t.res.slotHint}</span>
            </label>
            <input
              id={`slot-${r.id}`} className="esp-input" type="datetime-local"
              value={slot} onChange={(e) => setSlot(e.target.value)}
            />
          </div>
          <div className="esp-field">
            <label className="esp-label" htmlFor={`note-${r.id}`}>{t.res.internalNote}</label>
            <textarea
              id={`note-${r.id}`} className="esp-textarea" value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.res.notePlaceholder}
            />
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <button
              type="button" className="esp-btn esp-btn-primary esp-btn-sm" disabled={busy}
              onClick={() => {
                const iso = slot ? fromLocalInput(slot, tenant.timezone) : null;
                onApply({
                  ...(iso !== r.starts_at ? { startsAt: iso } : {}),
                  ...(note !== (r.notes ?? "") ? { note } : {}),
                });
              }}
            >
              {busy ? <Loader2 size={13} className="esp-spin" aria-hidden /> : t.res.save}
            </button>
            {r.status === "cancelled" && (
              <button type="button" className="esp-btn esp-btn-sm" disabled={busy}
                onClick={() => onApply({ status: "confirmed" })}>
                {t.res.reactivate}
              </button>
            )}
            <button type="button" className="esp-btn esp-btn-sm esp-btn-quiet" disabled={busy}
              onClick={() => onApply({ status: "no_show" })}>
              {t.res.noShow}
            </button>
            <span className="esp-card-ref" style={{ marginLeft: "auto", alignSelf: "center" }}>
              {r.reference}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}
