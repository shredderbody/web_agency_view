"use client";

import type { UsageSummary } from "@/lib/portal/types";
import { usePortalI18n } from "@/lib/portal/i18nClient";
import { fmtCost, fmtDuration, fmtNumber } from "./format";

/* Les quatre chiffres qui répondent à « qu'ai-je consommé, et pour quel
   résultat ». Les deux premiers portent la pastille de leur série dans le
   graphe : l'œil relie la tuile à la couleur sans légende supplémentaire. */

export default function StatTiles({ usage }: { usage: UsageSummary }) {
  const { lang, t } = usePortalI18n();
  const dur = fmtDuration(usage.callSeconds, lang);
  const cost = usage.callCost + usage.chatCost;
  const conv = usage.calls + usage.chats;
  /* Rendement : part des échanges qui ont abouti à une prise. Volontairement
     NON affiché en pourcentage quand il y a plus de prises que d'échanges —
     ce qui arrive quand une action a été journalisée hors appel Vapi (import,
     saisie depuis l'espace) ou quand la rétention de 14 jours a rogné les
     appels correspondants. Un « 171 % » ne veut rien dire ; le compte, si. */
  const yieldPct = conv > 0 && usage.bookings <= conv
    ? Math.round((usage.bookings / conv) * 100)
    : null;

  const extras = [
    usage.reschedules > 0 ? t.tiles.reschedules(usage.reschedules) : null,
    usage.cancels > 0 ? t.tiles.cancels(usage.cancels) : null,
  ].filter(Boolean);

  return (
    <div className="esp-tiles">
      <div className="esp-tile">
        <span className="esp-tile-k">
          <span className="esp-tile-dot" style={{ background: "var(--esp-voice)" }} aria-hidden />
          {t.tiles.calls}
        </span>
        <span className="esp-tile-v esp-num">{fmtNumber(usage.calls, lang)}</span>
        <span className="esp-tile-s">
          {usage.callSeconds > 0 ? t.tiles.callsSub(`${dur.value}${dur.unit}`) : t.tiles.callsNone}
        </span>
      </div>

      <div className="esp-tile">
        <span className="esp-tile-k">
          <span className="esp-tile-dot" style={{ background: "var(--esp-text)" }} aria-hidden />
          {t.tiles.messages}
        </span>
        <span className="esp-tile-v esp-num">{fmtNumber(usage.chatMessages, lang)}</span>
        <span className="esp-tile-s">
          {usage.chats > 0
            ? t.tiles.messagesSub(fmtNumber(usage.chats, lang), usage.chats)
            : t.tiles.messagesNone}
        </span>
      </div>

      <div className="esp-tile">
        <span className="esp-tile-k">{t.tiles.actions}</span>
        <span className="esp-tile-v esp-num">{fmtNumber(usage.actions, lang)}</span>
        <span className="esp-tile-s">
          {[t.tiles.bookings(usage.bookings), ...extras].join(" · ")}
        </span>
      </div>

      <div className="esp-tile">
        <span className="esp-tile-k">{t.tiles.cost}</span>
        <span className="esp-tile-v esp-num">
          {fmtCost(cost, lang)}<span className="esp-tile-u">$</span>
        </span>
        <span className="esp-tile-s">
          {cost === 0 && conv === 0
            ? t.tiles.costNone
            : yieldPct !== null
              ? t.tiles.yieldPct(yieldPct)
              : t.tiles.yieldRaw(
                  fmtNumber(usage.bookings, lang), usage.bookings,
                  fmtNumber(conv, lang), conv,
                )}
        </span>
      </div>
    </div>
  );
}
