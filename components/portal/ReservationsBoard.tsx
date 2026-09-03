"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays, Check, ChevronLeft, ChevronRight, Clock, LayoutGrid, Loader2,
  Phone, RotateCcw, Users, X,
} from "lucide-react";
import type { PortalReservation, ReservationStatus } from "@/lib/portal/types";
import type { DemoTenant } from "@/lib/portal/registry";
import { fmtSlot, fmtTimeOnly, fromLocalInput, toLocalInput } from "./format";

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

const STATUS: Record<ReservationStatus, { label: string; cls: string }> = {
  pending: { label: "À confirmer", cls: "esp-badge-wait" },
  confirmed: { label: "Confirmée", cls: "esp-badge-ok" },
  rescheduled: { label: "Reportée", cls: "esp-badge-wait" },
  cancelled: { label: "Annulée", cls: "esp-badge-bad" },
  done: { label: "Honorée", cls: "esp-badge-off" },
  no_show: { label: "Non venu", cls: "esp-badge-bad" },
};

const DOW = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

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

  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${cursor}-01T12:00:00Z`));

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
      if (!res.ok) throw new Error(data.error ?? "Enregistrement impossible.");
      if (data.reservation) {
        setRows((prev) => prev.map((r) => (r.id === id ? data.reservation : r)));
      }
      setOpenId(null);
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Enregistrement impossible.");
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
        <h2 className="esp-h2">Réservations</h2>
        <span className="esp-small">
          {rows.length} au total
          {undated.length > 0 && ` · ${undated.length} sans créneau`}
        </span>
        <div className="esp-seg">
          <button
            type="button" className="esp-seg-b" aria-pressed={view === "calendar"}
            onClick={() => setView("calendar")}
          >
            <CalendarDays size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.3rem" }} />
            Calendrier
          </button>
          <button
            type="button" className="esp-seg-b" aria-pressed={view === "cards"}
            onClick={() => { setView("cards"); setSelected(null); }}
          >
            <LayoutGrid size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.3rem" }} />
            Cartes
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
              onClick={() => shiftMonth(-1)} aria-label="Mois précédent"
            >
              <ChevronLeft size={15} aria-hidden />
            </button>
            <span className="esp-cal-month">{monthLabel}</span>
            <button
              type="button" className="esp-btn esp-btn-quiet esp-btn-sm"
              onClick={() => shiftMonth(1)} aria-label="Mois suivant"
            >
              <ChevronRight size={15} aria-hidden />
            </button>
            <button
              type="button" className="esp-btn esp-btn-sm" style={{ marginLeft: "0.25rem" }}
              onClick={() => { setCursor(today.slice(0, 7)); setSelected(today); }}
            >
              Aujourd&apos;hui
            </button>
            {selected && (
              <button
                type="button" className="esp-btn esp-btn-quiet esp-btn-sm"
                style={{ marginLeft: "auto" }} onClick={() => setSelected(null)}
              >
                <X size={13} aria-hidden /> Tout le mois
              </button>
            )}
            <span className="esp-micro" style={{ marginLeft: selected ? "0.5rem" : "auto" }}>
              Heures locales · {tenant.timezone.split("/")[1]?.replace("_", " ")}
            </span>
          </div>

          <div className="esp-cal-grid" role="grid">
            {DOW.map((d) => (
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
                  aria-label={`${c.day} — ${items.length} réservation${items.length > 1 ? "s" : ""}`}
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
                      {fmtTimeOnly(r.starts_at, tenant.timezone)} {r.customer_name ?? "Client"}
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
            {new Intl.DateTimeFormat("fr-FR", {
              weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
            }).format(new Date(`${selected}T12:00:00Z`))}
            <span className="esp-small" style={{ fontWeight: 400, marginLeft: "0.5rem" }}>
              {visible.length === 0 ? "aucune réservation" : `${visible.length} réservation${visible.length > 1 ? "s" : ""}`}
            </span>
          </h3>
        )}

        {visible.length === 0 && !selected && (
          <div className="esp-empty">
            <CalendarDays size={22} aria-hidden style={{ color: "var(--esp-ink-3)" }} />
            <p className="esp-empty-t">Aucune réservation pour l&apos;instant</p>
            <p className="esp-empty-d">
              Dès que l&apos;assistant prend un rendez-vous au téléphone ou par écrit, il
              apparaît ici, avec les coordonnées du client et l&apos;historique de ce
              qui a été fait.
            </p>
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
              />
            ))}
          </div>
        )}

        {undated.length > 0 && !selected && (
          <p className="esp-micro" style={{ marginTop: "0.9rem" }}>
            {undated.length} réservation{undated.length > 1 ? "s" : ""} sans créneau exploitable :
            la date dictée n&apos;a pas pu être interprétée. Ouvrez la carte pour la fixer.
          </p>
        )}
      </div>
    </section>
  );
}

function Card({
  r, tenant, canEdit, open, busy, onToggle, onApply,
}: {
  r: PortalReservation;
  tenant: DemoTenant;
  canEdit: boolean;
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  onApply: (patch: Record<string, unknown>) => void;
}) {
  const [slot, setSlot] = useState(() => toLocalInput(r.starts_at, tenant.timezone));
  const [note, setNote] = useState(r.notes ?? "");
  const st = STATUS[r.status];
  const moved = r.original_starts_at && r.starts_at && r.original_starts_at !== r.starts_at;

  return (
    <article className={`esp-card${open ? " is-open" : ""}${r.status === "cancelled" ? " is-cancelled" : ""}`}>
      <div className="esp-card-top">
        <div style={{ minWidth: 0 }}>
          <p className="esp-card-when">{fmtSlot(r.starts_at, tenant.timezone)}</p>
          <p className="esp-card-who">{r.customer_name ?? "Client sans nom"}</p>
        </div>
        <span className={`esp-badge ${st.cls}`} style={{ marginLeft: "auto", flex: "none" }}>{st.label}</span>
      </div>

      <div className="esp-card-meta">
        {r.customer_phone && (
          <span><Phone size={12} aria-hidden />
            <a href={`tel:${r.customer_phone}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "2px" }}>
              {r.customer_phone}
            </a>
          </span>
        )}
        {r.party_size != null && <span><Users size={12} aria-hidden />{r.party_size} pers.</span>}
        {moved && (
          <span title="Créneau d'origine">
            <RotateCcw size={12} aria-hidden />
            initialement {fmtSlot(r.original_starts_at, tenant.timezone)}
          </span>
        )}
      </div>

      {r.service && <p className="esp-small" style={{ margin: 0 }}>{r.service}</p>}
      {r.notes && !open && <p className="esp-micro" style={{ margin: 0 }}>Note : {r.notes}</p>}

      {canEdit && (
        <div className="esp-card-actions">
          {r.status !== "confirmed" && r.status !== "cancelled" && (
            <button type="button" className="esp-btn esp-btn-sm" disabled={busy}
              onClick={() => onApply({ status: "confirmed" })}>
              <Check size={13} aria-hidden /> Confirmer
            </button>
          )}
          <button type="button" className="esp-btn esp-btn-sm" onClick={onToggle} aria-expanded={open}>
            <Clock size={13} aria-hidden /> {open ? "Fermer" : "Modifier"}
          </button>
          {r.status !== "cancelled" && (
            <button type="button" className="esp-btn esp-btn-sm esp-btn-danger" disabled={busy}
              onClick={() => onApply({ status: "cancelled" })}>
              <X size={13} aria-hidden /> Annuler
            </button>
          )}
          {busy && <Loader2 size={14} className="esp-spin" aria-hidden style={{ alignSelf: "center", color: "var(--esp-ink-3)" }} />}
        </div>
      )}

      {open && canEdit && (
        <div className="esp-card-edit">
          <div className="esp-field">
            <label className="esp-label" htmlFor={`slot-${r.id}`}>
              Créneau <span style={{ fontWeight: 400, color: "var(--esp-ink-3)" }}>(heure du commerce)</span>
            </label>
            <input
              id={`slot-${r.id}`} className="esp-input" type="datetime-local"
              value={slot} onChange={(e) => setSlot(e.target.value)}
            />
          </div>
          <div className="esp-field">
            <label className="esp-label" htmlFor={`note-${r.id}`}>Note interne</label>
            <textarea
              id={`note-${r.id}`} className="esp-textarea" value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Visible par vous seul, jamais dite au client."
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
              {busy ? <Loader2 size={13} className="esp-spin" aria-hidden /> : "Enregistrer"}
            </button>
            {r.status === "cancelled" && (
              <button type="button" className="esp-btn esp-btn-sm" disabled={busy}
                onClick={() => onApply({ status: "confirmed" })}>
                Réactiver
              </button>
            )}
            <button type="button" className="esp-btn esp-btn-sm esp-btn-quiet" disabled={busy}
              onClick={() => onApply({ status: "no_show" })}>
              Client absent
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
