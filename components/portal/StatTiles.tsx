import type { UsageSummary } from "@/lib/portal/types";
import { fmtCost, fmtDuration, fmtNumber } from "./format";

/* Les quatre chiffres qui répondent à « qu'ai-je consommé, et pour quel
   résultat ». Les deux premiers portent la pastille de leur série dans le
   graphe : l'œil relie la tuile à la couleur sans légende supplémentaire. */

export default function StatTiles({ usage }: { usage: UsageSummary }) {
  const dur = fmtDuration(usage.callSeconds);
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

  return (
    <div className="esp-tiles">
      <div className="esp-tile">
        <span className="esp-tile-k">
          <span className="esp-tile-dot" style={{ background: "var(--esp-voice)" }} aria-hidden />
          Appels vocaux
        </span>
        <span className="esp-tile-v esp-num">{fmtNumber(usage.calls)}</span>
        <span className="esp-tile-s">
          {usage.callSeconds > 0 ? `${dur.value}${dur.unit} de conversation` : "aucune minute consommée"}
        </span>
      </div>

      <div className="esp-tile">
        <span className="esp-tile-k">
          <span className="esp-tile-dot" style={{ background: "var(--esp-text)" }} aria-hidden />
          Messages écrits
        </span>
        <span className="esp-tile-v esp-num">{fmtNumber(usage.chatMessages)}</span>
        <span className="esp-tile-s">
          {usage.chats > 0
            ? `sur ${fmtNumber(usage.chats)} conversation${usage.chats > 1 ? "s" : ""}`
            : "aucune conversation écrite"}
        </span>
      </div>

      <div className="esp-tile">
        <span className="esp-tile-k">Actions enregistrées</span>
        <span className="esp-tile-v esp-num">{fmtNumber(usage.actions)}</span>
        <span className="esp-tile-s">
          {usage.bookings} prise{usage.bookings > 1 ? "s" : ""}
          {usage.reschedules > 0 && ` · ${usage.reschedules} report${usage.reschedules > 1 ? "s" : ""}`}
          {usage.cancels > 0 && ` · ${usage.cancels} annulation${usage.cancels > 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="esp-tile">
        <span className="esp-tile-k">Coût de la période</span>
        <span className="esp-tile-v esp-num">
          {fmtCost(cost)}<span className="esp-tile-u">$</span>
        </span>
        <span className="esp-tile-s">
          {cost === 0 && conv === 0
            ? "rien à facturer"
            : yieldPct !== null
              ? `${yieldPct} % des échanges ont donné une prise`
              : `${fmtNumber(usage.bookings)} prise${usage.bookings > 1 ? "s" : ""} pour ${fmtNumber(conv)} échange${conv > 1 ? "s" : ""}`}
        </span>
      </div>
    </div>
  );
}
