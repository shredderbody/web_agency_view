"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import LangSelector from "@/components/LangSelector";

/**
 * Ruban « démo » posé au-dessus de la boutique Ines Garden dans le site agence
 * (le site client autonome, lui, ne l'affiche pas). Même structure que les
 * autres démos : retour au catalogue, rappel du statut de démo, CTA.
 */
export default function ShopDemoRibbon() {
  const { t } = useLang();

  return (
    <div className="demo-ribbon">
      <Link href="/#metiers" className="back">
        <ArrowLeft size={16} /> {t.demoCommon.allDemos}
      </Link>
      <span className="ribbon-mid" style={{ opacity: 0.78 }}>
        {t.demoCommon.isDemoBanner}
      </span>
      <span className="ribbon-end">
        <LangSelector tone="dark" />
        <a href="#demo-request" className="cta">
          {t.demoCommon.wantMine}
        </a>
      </span>

      <style>{`
        /* Comme les autres démos : sur mobile, le rappel « démonstration » cède
           la place au retour catalogue + sélecteur de langue. */
        @media (max-width: 720px) { .demo-ribbon .ribbon-mid { display: none; } }
      `}</style>
    </div>
  );
}
