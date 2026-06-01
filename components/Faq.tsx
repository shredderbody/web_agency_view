"use client";
import { useState } from "react";

const ITEMS = [
  {
    q: "Combien de temps pour mettre ma vitrine en ligne ?",
    a: "Entre 7 et 15 jours pour une vitrine complète. On commence par une démo à votre nom : vous la validez, on la met en ligne. Vous n'attendez jamais des mois sans rien voir.",
  },
  {
    q: "Je n'ai ni logo, ni photos, ni textes. C'est bloquant ?",
    a: "Non. On génère un univers visuel sur-mesure (comme les démos de ce site), on rédige vos textes et on cadre vos photos. Si vous avez déjà des éléments, on les intègre.",
  },
  {
    q: "Est-ce que je pourrai modifier le site moi-même ?",
    a: "Oui. Vous recevez un accès simple pour changer horaires, prix, photos et actualités. Pour le reste, une retouche est incluse chaque mois dans la formule Atelier.",
  },
  {
    q: "Les clients pourront-ils réserver ou commander en ligne ?",
    a: "Oui. Prise de rendez-vous, click & collect, formulaire de devis, carte commandable : on branche l'outil adapté à votre métier, sans commission cachée.",
  },
  {
    q: "Et le référencement sur Google ?",
    a: "Chaque vitrine est optimisée pour la recherche locale (fiche, mots-clés de quartier, vitesse, mobile). L'objectif : qu'on vous trouve quand on cherche votre métier près de chez vous.",
  },
  {
    q: "Combien ça coûte vraiment ?",
    a: "À partir de 690 € pour la vitrine essentielle, puis un abonnement clair pour l'hébergement et le suivi. Pas de devis surprise : le prix est annoncé avant de commencer.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {ITEMS.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="card" style={{ overflow: "hidden" }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
                padding: "1.25rem 1.4rem", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.08rem", letterSpacing: "-0.01em" }}>
                {it.q}
              </span>
              <span
                style={{
                  flexShrink: 0, width: "1.9rem", height: "1.9rem", borderRadius: "99px", display: "grid", placeItems: "center",
                  background: isOpen ? "var(--vermilion)" : "var(--paper-2)", color: isOpen ? "var(--surface)" : "var(--ink)",
                  transition: "background 0.25s var(--ease), transform 0.25s var(--ease)", transform: isOpen ? "rotate(45deg)" : "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <div className={`faq-body ${isOpen ? "open" : ""}`}>
              <div>
                <p style={{ margin: 0, padding: "0 1.4rem 1.35rem", color: "var(--ink-dim)", maxWidth: "62ch" }}>{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
