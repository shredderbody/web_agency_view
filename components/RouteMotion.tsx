"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/* ════════════════════════════════════════════════════════════════════════════
   Motion de route — monté une seule fois dans app/layout.tsx, donc actif sur
   TOUTES les pages (landing + démos).

   - ScrollProgress : fin liseré accent en haut, se remplit selon la position
     de défilement (scaleX piloté par rAF, GPU, jamais de reflow).
   - PageFade : fond enchaîné (cross-fade) à chaque changement de route. Opacity
     UNIQUEMENT — surtout pas de transform/filter ici, sinon le wrapper devient
     un bloc conteneur et casse tous les `position: fixed` enfants (bulle Vapi,
     barre rapide, modales…).
   Les deux respectent `prefers-reduced-motion` via app/globals.css.
   ════════════════════════════════════════════════════════════════════════════ */

export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setP(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="scroll-progress" aria-hidden>
      <span className="scroll-progress-bar" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

export function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // `key` force le remontage à chaque route → relance l'animation d'entrée.
  return (
    <div key={pathname} className="page-fade">
      {children}
    </div>
  );
}
