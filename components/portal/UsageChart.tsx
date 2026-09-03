"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { UsageDay } from "@/lib/portal/types";
import { fmtDayLabel, fmtDuration, fmtNumber } from "./format";

/* ════════════════════════════════════════════════════════════════════════════
   Consommation jour par jour — colonnes empilées, SVG en ligne, aucune
   dépendance de graphique.

   Choix de forme : la question est « combien ai-je consommé, et en quoi ». Deux
   séries qui S'ADDITIONNENT en un volume total (un échange vocal + un échange
   écrit = un contact traité) → empilement, pas juxtaposition. Un seul axe : les
   deux séries se comptent en échanges, jamais un double axe.

   Palette : bleu profond (voix) + terre (écrit), validée sur la surface crème
   — ΔE protan 23,2, vision normale 29,6, contraste ≥ 3:1. Volontairement
   distincte du vermillon de marque, réservé aux actions.
   ════════════════════════════════════════════════════════════════════════════ */

/* Le repère suit la LARGEUR RÉELLE du conteneur, en pixels CSS : un viewBox
   fixe de 760 px réduit sur un téléphone divise tout par deux, y compris les
   étiquettes d'axe — un axe à 4,5 px ne se lit pas. Ici l'échelle reste 1:1 à
   toutes les tailles : ce sont les colonnes qui s'amincissent, jamais le texte.
   Le repli à 760 couvre le premier rendu (serveur) avant la mesure. */
const W_FALLBACK = 760;
const PAD_T = 12;
const PAD_B = 22;
const PAD_L = 30;

/* Demi-largeur estimée de l'infobulle, pour la garder dans le cadre. */
const TIP_HALF = 88;

type Props = { days: UsageDay[]; timezone: string };

export default function UsageChart({ days }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(W_FALLBACK);

  useEffect(() => {
    const el = plotRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      setW(Math.max(260, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Plus haut sur téléphone : moins large, donc plus étroit — sans quoi le
  // graphe devient une bande écrasée où deux colonnes ne se distinguent plus.
  const H = W < 520 ? 180 : 150;

  const { max, ticks, bw, gap, slot } = useMemo(() => {
    const peak = Math.max(1, ...days.map((d) => d.calls + d.chats));
    // Échelle arrondie au pas supérieur : un axe qui finit sur 7 se lit mal.
    const step = peak <= 4 ? 1 : peak <= 10 ? 2 : peak <= 30 ? 5 : Math.ceil(peak / 5 / 10) * 10;
    const top = Math.ceil(peak / step) * step;
    const t: number[] = [];
    for (let v = 0; v <= top; v += step) t.push(v);
    const slot = (W - PAD_L - 4) / Math.max(1, days.length);
    // 72 % de largeur utile, 28 % d'air : assez de respiration pour lire chaque
    // colonne comme une journée distincte, sans les transformer en filaments.
    const bw = Math.max(3, slot * 0.72);
    return { max: top, ticks: t, bw, gap: slot - bw, slot };
  }, [days, W]);

  const plotH = H - PAD_T - PAD_B;
  const y = (v: number) => PAD_T + plotH - (v / max) * plotH;
  const hasData = days.some((d) => d.calls + d.chats > 0);

  return (
    <div className="esp-chart">
      <div className="esp-legend" style={{ marginBottom: "0.7rem" }}>
        <span className="esp-legend-i">
          <span className="esp-legend-s" style={{ background: "var(--esp-voice)" }} />
          Appels vocaux
        </span>
        <span className="esp-legend-i">
          <span className="esp-legend-s" style={{ background: "var(--esp-text)" }} />
          Conversations écrites
        </span>
      </div>

      <div className="esp-chart-plot" ref={plotRef}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: `${H}px`, touchAction: "pan-y" }}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Consommation quotidienne sur ${days.length} jours. Détail chiffré dans le tableau qui suit.`}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line className="esp-chart-grid" x1={PAD_L} x2={W} y1={y(v)} y2={y(v)} />
            <text className="esp-chart-axis" x={PAD_L - 6} y={y(v) + 3} textAnchor="end">{v}</text>
          </g>
        ))}

        {days.map((d, i) => {
          const x = PAD_L + i * slot;
          const total = d.calls + d.chats;
          const hCalls = (d.calls / max) * plotH;
          const hChats = (d.chats / max) * plotH;
          const isOn = hover === i;
          return (
            <g key={d.day}>
              <rect
                className={`esp-chart-band${isOn ? " is-on" : ""}`}
                x={x - gap / 2} y={PAD_T - 4} width={slot} height={plotH + 8} rx={2}
              />
              {d.chats > 0 && (
                <rect
                  x={x} y={y(total)} width={bw} height={Math.max(2, hChats)}
                  rx={3} fill="var(--esp-text)"
                />
              )}
              {d.calls > 0 && (
                <rect
                  x={x}
                  /* 2px de surface entre les segments : deux aplats qui se touchent
                     se lisent comme un seul bloc. */
                  y={y(d.calls)} width={bw}
                  height={Math.max(2, hCalls - (d.chats > 0 ? 2 : 0))}
                  rx={3} fill="var(--esp-voice)"
                />
              )}
              <rect
                className="esp-chart-hit"
                x={x - gap / 2} y={0} width={slot} height={H}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                /* Le survol n'existe pas au doigt : on prend aussi l'appui. */
                onPointerDown={() => setHover(i)}
              />
            </g>
          );
        })}

        {days.map((d, i) => {
          // Une étiquette d'axe tous les n jours : la date de fin est toujours
          // écrite. Le pas se calcule sur la place réelle (44 px par étiquette),
          // pas sur le nombre de jours — sinon elles se chevauchent en étroit.
          const every = Math.max(2, Math.ceil(44 / slot));
          const isLast = i === days.length - 1;
          if (i % every !== 0 && !isLast) return null;
          // Une étiquette qui viendrait toucher la dernière saute : la date de
          // fin, elle, ne saute jamais.
          if (!isLast && (days.length - 1 - i) * slot < 44) return null;
          // La dernière est alignée à droite sur le bord du repère, sinon sa
          // moitié déborde du panneau.
          const x = isLast ? W : PAD_L + i * slot + bw / 2;
          return (
            <text
              key={d.day} className="esp-chart-axis"
              x={x} y={H - 6} textAnchor={isLast ? "end" : "middle"}
            >
              {d.day.slice(8)}/{d.day.slice(5, 7)}
            </text>
          );
        })}
      </svg>

      {hover !== null && (
        <div
          className="esp-tip"
          style={{
            left: `${Math.min(Math.max(PAD_L + hover * slot + bw / 2, TIP_HALF), Math.max(TIP_HALF, W - TIP_HALF))}px`,
            top: `${(y(days[hover].calls + days[hover].chats) / H) * 100}%`,
          }}
        >
          <div className="esp-tip-d">{fmtDayLabel(days[hover].day)}</div>
          <div className="esp-tip-r">
            <span className="esp-legend-s" style={{ background: "var(--esp-voice)" }} />
            Appels <b>{fmtNumber(days[hover].calls)}</b>
          </div>
          <div className="esp-tip-r">
            <span className="esp-legend-s" style={{ background: "var(--esp-text)" }} />
            Écrits <b>{fmtNumber(days[hover].chats)}</b>
          </div>
          {days[hover].call_seconds > 0 && (
            <div className="esp-tip-r" style={{ opacity: 0.75 }}>
              Durée <b>{fmtDuration(days[hover].call_seconds).value}{fmtDuration(days[hover].call_seconds).unit}</b>
            </div>
          )}
        </div>
      )}
      </div>

      {!hasData && (
        <p className="esp-micro" style={{ textAlign: "center", marginTop: "0.5rem" }}>
          Aucune consommation enregistrée sur la période.
        </p>
      )}
    </div>
  );
}
