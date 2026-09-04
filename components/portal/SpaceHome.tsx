"use client";

import Link from "next/link";
import { ArrowRight, FileText, Gauge, Lock } from "lucide-react";
import type { SpaceHomeData } from "@/lib/portal/spaceHome";
import { dashboardHref, quotesHref } from "@/lib/portal/paths";
import { usePortalI18n } from "@/lib/portal/i18nClient";
import PortalBar from "./PortalBar";

/* ════════════════════════════════════════════════════════════════════════════
   L'ACCUEIL d'une vitrine — deux cartes, et rien d'autre.

   La tentation, sur une page comme celle-ci, est d'y remettre des chiffres :
   une tuile de consommation, un aperçu du calendrier. Ce serait refaire le
   tableau de bord en moins bien, et donner deux endroits où lire la même chose.
   Une page d'aiguillage n'a qu'un travail : dire où sont les portes, et laisser
   voir en passant s'il se passe quelque chose derrière — d'où UN chiffre par
   carte, pas plus.

   Quand la base n'a pas répondu, la ligne de chiffre disparaît et la carte
   reste : on n'empêche personne d'atteindre son outil de devis parce qu'on n'a
   pas su compter ses réservations.
   ════════════════════════════════════════════════════════════════════════════ */

export default function SpaceHome({ data }: { data: SpaceHomeData }) {
  const { t } = usePortalI18n();
  const { tenant, isAdmin, upcoming, quotes, invoices } = data;

  const cards = [
    {
      key: "dash",
      href: dashboardHref(tenant.slug),
      icon: Gauge,
      title: t.home.dashT,
      desc: t.home.dashD,
      cta: t.home.dashCta,
      stat: upcoming === null ? null : t.home.dashStat(upcoming),
    },
    {
      key: "quotes",
      href: quotesHref(tenant.slug),
      icon: FileText,
      title: t.home.quotesT,
      desc: t.home.quotesD,
      cta: t.home.quotesCta,
      stat: quotes === null || invoices === null ? null : t.home.quotesStat(quotes, invoices),
    },
  ];

  return (
    <div className="esp-shell">
      <PortalBar
        title={tenant.business} subtitle={tenant.city}
        demoHref={`/demo/${tenant.slug}`} isAdmin={isAdmin} adminHome={isAdmin}
      />

      <main className="esp-main">
        <div className="esp-wrap">
          <div className="esp-pagehead" style={{ marginBottom: "1.5rem" }}>
            <div>
              <h1 className="esp-h1">{t.home.title}</h1>
              <p className="esp-lead" style={{ marginTop: "0.3rem" }}>{t.home.lead(tenant.trade)}</p>
            </div>
          </div>

          <div className="esp-home">
            {cards.map(({ key, href, icon: Icon, title, desc, cta, stat }) => (
              // La carte ENTIÈRE est le lien : viser un petit bouton « ouvrir »
              // au pouce, sur une page qui ne sert qu'à choisir, n'a pas de sens.
              <Link key={key} href={href} className="esp-home-card">
                <span
                  className="esp-home-ic"
                  style={{ background: `${tenant.accent}1f`, color: tenant.accent }}
                  aria-hidden
                >
                  <Icon size={20} />
                </span>
                <span className="esp-home-t">{title}</span>
                <span className="esp-home-d">{desc}</span>
                {stat && <span className="esp-home-s">{stat}</span>}
                <span className="esp-home-cta">
                  {cta} <ArrowRight size={14} aria-hidden />
                </span>
              </Link>
            ))}
          </div>

          <p className="esp-note" style={{ marginTop: "1.25rem" }}>
            <Lock size={15} aria-hidden />
            <span>{t.home.protected}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
