"use client";

import { useMemo, useState } from "react";
import {
  Ban, Bot, CalendarPlus, CheckCircle2, ClipboardList, MessageSquare, Package,
  RefreshCcw, ShieldCheck, UserCog, UserRound, Wrench,
} from "lucide-react";
import type { ActionName, PortalAction } from "@/lib/portal/types";
import { usePortalI18n } from "@/lib/portal/i18nClient";
import { fmtAgo, fmtExact, fmtSlot } from "./format";

/* ════════════════════════════════════════════════════════════════════════════
   JOURNAL DES ACTIONS — le cœur de la traçabilité.

   Une ligne = un fait : ce qui a été fait, par qui, quand, et pour quel client.
   Aucun contenu de conversation n'est stocké ni affiché : on ne relit pas ce
   que le client a dit, on constate ce qui a été FAIT. C'est ce qui rend ce
   journal consultable sans arrière-pensée et exploitable pour un litige
   (« vous m'aviez décalé au 14 » → la ligne le dit, avec l'avant et l'après).

   Le journal ne se modifie pas : il n'y a aucun bouton d'édition ici, par
   construction. Corriger une réservation ajoute une ligne, elle n'en réécrit
   aucune.
   ════════════════════════════════════════════════════════════════════════════ */

/* L'icône et le TON d'une action restent ici : ce sont des choix de forme, ils
   ne changent pas avec la langue. Le libellé, lui, vient du dictionnaire. */
type Look = { icon: typeof CalendarPlus; tone: "ok" | "wait" | "off" | "bad" };

const LOOK: Record<ActionName, Look> = {
  booking_created: { icon: CalendarPlus, tone: "ok" },
  booking_rescheduled: { icon: RefreshCcw, tone: "wait" },
  booking_cancelled: { icon: Ban, tone: "bad" },
  booking_confirmed: { icon: CheckCircle2, tone: "ok" },
  booking_completed: { icon: ShieldCheck, tone: "ok" },
  booking_no_show: { icon: Ban, tone: "bad" },
  order_placed: { icon: Package, tone: "ok" },
  intervention_requested: { icon: Wrench, tone: "wait" },
  quote_requested: { icon: ClipboardList, tone: "wait" },
  customer_updated: { icon: UserCog, tone: "off" },
  note_added: { icon: MessageSquare, tone: "off" },
  contacted: { icon: UserRound, tone: "off" },
};

const TONE_BG: Record<Look["tone"], string> = {
  ok: "var(--esp-ok-bg)", wait: "var(--esp-wait-bg)",
  off: "var(--esp-off-bg)", bad: "var(--esp-bad-bg)",
};
const TONE_FG: Record<Look["tone"], string> = {
  ok: "var(--esp-ok)", wait: "var(--esp-wait)",
  off: "var(--esp-off)", bad: "var(--esp-bad)",
};

type Filter = "all" | "bookings" | "changes" | "portal";

export default function ActionFeed({
  actions, timezone, showTenant = false, slugLabel,
}: {
  actions: PortalAction[];
  timezone: string;
  showTenant?: boolean;
  slugLabel?: (slug: string | null) => string;
}) {
  const { lang, t } = usePortalI18n();
  const [filter, setFilter] = useState<Filter>("all");

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t.feed.all },
    { id: "bookings", label: t.feed.bookings },
    { id: "changes", label: t.feed.changes },
    { id: "portal", label: t.feed.portal },
  ];

  const rows = useMemo(() => actions.filter((a) => {
    if (filter === "bookings") {
      return a.action === "booking_created" || a.action === "order_placed" ||
        a.action === "intervention_requested" || a.action === "quote_requested";
    }
    if (filter === "changes") {
      return a.action === "booking_rescheduled" || a.action === "booking_cancelled" ||
        a.action === "booking_no_show";
    }
    if (filter === "portal") return a.actor === "portal";
    return true;
  }), [actions, filter]);

  return (
    <section className="esp-panel">
      <header className="esp-panel-head">
        <h2 className="esp-h2">{t.feed.title}</h2>
        <span className="esp-small">{t.feed.count(actions.length)}</span>
        <div className="esp-seg">
          {filters.map((f) => (
            <button
              key={f.id} type="button" className="esp-seg-b"
              aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="esp-empty">
          <ClipboardList size={22} aria-hidden style={{ color: "var(--esp-ink-3)" }} />
          <p className="esp-empty-t">
            {actions.length === 0 ? t.feed.emptyT : t.feed.filteredT}
          </p>
          <p className="esp-empty-d">
            {actions.length === 0
              ? t.feed.emptyD
              : t.feed.filteredD}
          </p>
        </div>
      ) : (
        <div className="esp-feed">
          {rows.map((a) => {
            const look = LOOK[a.action] ?? LOOK.customer_updated;
            const Icon = look.icon;
            return (
              <div key={a.id} className="esp-feed-row">
                <time className="esp-feed-when" dateTime={a.occurred_at} title={fmtExact(a.occurred_at, lang)}>
                  {fmtAgo(a.occurred_at, lang)}
                </time>
                <span
                  className="esp-feed-mark"
                  style={{ background: TONE_BG[look.tone], color: TONE_FG[look.tone] }}
                  aria-hidden
                >
                  <Icon />
                </span>
                <p className="esp-feed-what">
                  <b>{t.feed.action[a.action] ?? t.feed.action.customer_updated}</b>
                  {showTenant && slugLabel && (
                    <span style={{ color: "var(--esp-ink-3)" }}> · {slugLabel(a.demo_slug)}</span>
                  )}
                  {a.customer_name && <> — {a.customer_name}</>}
                  {a.customer_phone && <span style={{ color: "var(--esp-ink-3)" }}> · {a.customer_phone}</span>}
                  {a.action === "booking_rescheduled" && a.from_starts_at && a.to_starts_at && (
                    <>
                      <br />
                      <span className="esp-small">
                        {fmtSlot(a.from_starts_at, timezone, lang)}
                        <span className="esp-arrow" aria-label={t.feed.becomes}>→</span>
                        {fmtSlot(a.to_starts_at, timezone, lang)}
                      </span>
                    </>
                  )}
                  {a.action !== "booking_rescheduled" && a.to_starts_at && (
                    <>
                      <br />
                      <span className="esp-small">{fmtSlot(a.to_starts_at, timezone, lang)}</span>
                      {a.party_size != null && <span className="esp-small"> · {t.feed.people(a.party_size)}</span>}
                      {a.service && <span className="esp-small"> · {a.service}</span>}
                    </>
                  )}
                  {a.note && <><br /><span className="esp-micro">{t.feed.note(a.note)}</span></>}
                </p>
                <span className="esp-feed-who" title={a.actor_label ?? undefined}>
                  {a.actor === "portal" ? (
                    <><UserRound size={11} aria-hidden style={{ verticalAlign: "-1px" }} /> {a.actor_label ?? t.feed.space}</>
                  ) : (
                    <><Bot size={11} aria-hidden style={{ verticalAlign: "-1px" }} /> {t.feed.assistant}{a.channel === "chat" ? t.feed.written : a.channel === "voice" ? t.feed.voice : ""}</>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
