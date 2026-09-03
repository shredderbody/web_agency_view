"use client";

import { useMemo, useState } from "react";
import {
  Ban, Bot, CalendarPlus, CheckCircle2, ClipboardList, MessageSquare, Package,
  RefreshCcw, ShieldCheck, UserCog, UserRound, Wrench,
} from "lucide-react";
import type { ActionName, PortalAction } from "@/lib/portal/types";
import { fmtAgo, fmtSlot } from "./format";

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

type Look = { label: string; icon: typeof CalendarPlus; tone: "ok" | "wait" | "off" | "bad" };

const LOOK: Record<ActionName, Look> = {
  booking_created: { label: "Réservation prise", icon: CalendarPlus, tone: "ok" },
  booking_rescheduled: { label: "Créneau reporté", icon: RefreshCcw, tone: "wait" },
  booking_cancelled: { label: "Réservation annulée", icon: Ban, tone: "bad" },
  booking_confirmed: { label: "Réservation confirmée", icon: CheckCircle2, tone: "ok" },
  booking_completed: { label: "Client honoré", icon: ShieldCheck, tone: "ok" },
  booking_no_show: { label: "Client absent", icon: Ban, tone: "bad" },
  order_placed: { label: "Commande passée", icon: Package, tone: "ok" },
  intervention_requested: { label: "Intervention demandée", icon: Wrench, tone: "wait" },
  quote_requested: { label: "Devis demandé", icon: ClipboardList, tone: "wait" },
  customer_updated: { label: "Fiche client mise à jour", icon: UserCog, tone: "off" },
  note_added: { label: "Note ajoutée", icon: MessageSquare, tone: "off" },
  contacted: { label: "Client recontacté", icon: UserRound, tone: "off" },
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

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "bookings", label: "Prises" },
  { id: "changes", label: "Reports & annulations" },
  { id: "portal", label: "Faites depuis l'espace" },
];

export default function ActionFeed({
  actions, timezone, showTenant = false, slugLabel,
}: {
  actions: PortalAction[];
  timezone: string;
  showTenant?: boolean;
  slugLabel?: (slug: string | null) => string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

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
        <h2 className="esp-h2">Journal des actions</h2>
        <span className="esp-small">{actions.length} enregistrées</span>
        <div className="esp-seg">
          {FILTERS.map((f) => (
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
            {actions.length === 0 ? "Rien à tracer pour l'instant" : "Aucune action de ce type"}
          </p>
          <p className="esp-empty-d">
            {actions.length === 0
              ? "Chaque prise de rendez-vous, report ou annulation viendra s'inscrire ici, avec son auteur et son horodatage. Rien n'y sera jamais modifié."
              : "Changez de filtre pour voir le reste du journal."}
          </p>
        </div>
      ) : (
        <div className="esp-feed">
          {rows.map((a) => {
            const look = LOOK[a.action] ?? LOOK.customer_updated;
            const Icon = look.icon;
            return (
              <div key={a.id} className="esp-feed-row">
                <time className="esp-feed-when" dateTime={a.occurred_at} title={new Date(a.occurred_at).toLocaleString("fr-FR")}>
                  {fmtAgo(a.occurred_at)}
                </time>
                <span
                  className="esp-feed-mark"
                  style={{ background: TONE_BG[look.tone], color: TONE_FG[look.tone] }}
                  aria-hidden
                >
                  <Icon />
                </span>
                <p className="esp-feed-what">
                  <b>{look.label}</b>
                  {showTenant && slugLabel && (
                    <span style={{ color: "var(--esp-ink-3)" }}> · {slugLabel(a.demo_slug)}</span>
                  )}
                  {a.customer_name && <> — {a.customer_name}</>}
                  {a.customer_phone && <span style={{ color: "var(--esp-ink-3)" }}> · {a.customer_phone}</span>}
                  {a.action === "booking_rescheduled" && a.from_starts_at && a.to_starts_at && (
                    <>
                      <br />
                      <span className="esp-small">
                        {fmtSlot(a.from_starts_at, timezone)}
                        <span className="esp-arrow" aria-label="devient">→</span>
                        {fmtSlot(a.to_starts_at, timezone)}
                      </span>
                    </>
                  )}
                  {a.action !== "booking_rescheduled" && a.to_starts_at && (
                    <>
                      <br />
                      <span className="esp-small">{fmtSlot(a.to_starts_at, timezone)}</span>
                      {a.party_size != null && <span className="esp-small"> · {a.party_size} pers.</span>}
                      {a.service && <span className="esp-small"> · {a.service}</span>}
                    </>
                  )}
                  {a.note && <><br /><span className="esp-micro">Note : {a.note}</span></>}
                </p>
                <span className="esp-feed-who" title={a.actor_label ?? undefined}>
                  {a.actor === "portal" ? (
                    <><UserRound size={11} aria-hidden style={{ verticalAlign: "-1px" }} /> {a.actor_label ?? "Espace"}</>
                  ) : (
                    <><Bot size={11} aria-hidden style={{ verticalAlign: "-1px" }} /> Assistant{a.channel === "chat" ? " · écrit" : a.channel === "voice" ? " · voix" : ""}</>
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
