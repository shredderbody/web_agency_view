"use client";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/* ════════════════════════════════════════════════════════════════════════════
   Barre de navigation rapide — MOBILE UNIQUEMENT (cachée ≥768px via globals.css).
   Présentationnelle : chaque page métier lui passe SES propres raccourcis
   (cf. DemoView / BarberCourbevoie / ThaiVienExpress) → barre « spécifique au
   métier ». Un item peut être un lien (ancre #section ou tel:) ou un bouton
   (ouvrir une modale). L'item `primary` ressort en pastille accent surélevée.

   Vivant :
   - scroll-spy léger (IntersectionObserver) → l'item dont la section est à
     l'écran s'allume (couleur accent + point indicateur animé).
   - entrée échelonnée, filet d'accent qui respire, pulsation sur l'action
     principale (cf. keyframes bn* dans app/globals.css).

   Anti-superposition (cf. app/globals.css) :
   - `body.has-quicknav` (posé ici au montage) réserve l'espace bas sur la page
     (.demo-page) et remonte la bulle Vapi + le hint de défilement.
   - `body.om-open` (modale ouverte) masque la barre, comme la bulle Vapi.
   ════════════════════════════════════════════════════════════════════════════ */

export type BottomNavItem = {
  key: string;
  label: string;
  icon: ReactNode;
  /** Lien (ancre `#section` ou `tel:`). Mutuellement exclusif avec onClick. */
  href?: string;
  /** Action (ex : ouvrir la modale de réservation). */
  onClick?: () => void;
  /** Met l'item en avant (pastille accent surélevée) — l'action principale. */
  primary?: boolean;
};

export default function DemoBottomNav({ items }: { items: BottomNavItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  // Marque <body> : la barre existe → réserve l'espace bas + remonte Vapi/hint.
  useEffect(() => {
    document.body.classList.add("has-quicknav");
    return () => document.body.classList.remove("has-quicknav");
  }, []);

  // Scroll-spy : surligne l'item dont la section ancre est la plus visible.
  useEffect(() => {
    const anchors = items
      .filter((it) => it.href?.startsWith("#") && it.href.length > 1)
      .map((it) => ({ key: it.key, el: document.querySelector(it.href!) }))
      .filter((x): x is { key: string; el: Element } => !!x.el);
    if (!anchors.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const hit = anchors.find((a) => a.el === visible.target);
        if (hit) setActive(hit.key);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5, 1] }
    );
    anchors.forEach((a) => io.observe(a.el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="demo-bottomnav" aria-label="Navigation rapide">
      {items.map((it, i) => {
        const isActive = active === it.key && !it.primary;
        const cls = `demo-bottomnav-it${it.primary ? " is-primary" : ""}${isActive ? " is-active" : ""}`;
        const style = { ["--bn-i" as string]: String(i) } as CSSProperties;
        const inner = (
          <>
            <span className="demo-bottomnav-ic" aria-hidden>{it.icon}</span>
            <span className="demo-bottomnav-lb">{it.label}</span>
            <span className="demo-bottomnav-dot" aria-hidden />
          </>
        );
        return it.href ? (
          <a
            key={it.key}
            href={it.href}
            className={cls}
            style={style}
            aria-current={isActive ? "true" : undefined}
          >
            {inner}
          </a>
        ) : (
          <button key={it.key} type="button" onClick={it.onClick} className={cls} style={style} aria-label={it.label}>
            {inner}
          </button>
        );
      })}
    </nav>
  );
}
