"use client";
import Link from "next/link";
import { shopHref } from "@/lib/shop/base";
import { useLang } from "@/lib/lang-context";
import { shopStrings } from "@/lib/shop/strings";
import { CATEGORIES, categoryName, categoryTagline, categoryDescription, formatPrice } from "@/lib/shop/catalog";
import Reveal from "./Reveal";
import TileMedia from "./TileMedia";

export default function CollectionsIndex() {
  const { lang } = useLang();
  const t = shopStrings(lang);

  return (
    <>
      <section className="s-section-sm s-wrap" style={{ paddingTop: "clamp(1.8rem,3vw,3rem)" }}>
        <nav className="s-crumb">
          <Link href={shopHref("/")}>{t.home}</Link>
          <span className="sep">/</span>
          <span style={{ color: "var(--s-ink)" }}>{t.navCollections}</span>
        </nav>
        <div style={{ marginTop: "1.4rem", maxWidth: "60ch" }}>
          <span className="s-eyebrow">{t.collectionsEyebrow}</span>
          <h1 className="s-display" style={{ fontSize: "clamp(2.2rem,5.5vw,4rem)", marginTop: "0.7rem" }}>
            {t.collectionsTitle}
          </h1>
          <p className="s-lead" style={{ marginTop: "1rem" }}>{t.collectionsLead}</p>
        </div>
      </section>

      <section className="s-wrap" style={{ paddingBottom: "clamp(3.5rem,7vw,6rem)" }}>
        <div className="s-grid-3 s-grid-3--home">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60}>
              <Link href={shopHref(`/${c.slug}`)} className="s-tile" style={{ height: "100%" }}>
                <span className="s-tile-count">
                  {c.count} {c.count > 1 ? t.products : t.product}
                </span>
                <TileMedia images={c.gallery?.length ? c.gallery : [c.hero]} alt={categoryName(c, lang)} />
                <div className="s-tile-overlay">
                  <span className="s-tile-title">{categoryName(c, lang)}</span>
                  <span className="s-tile-sub">
                    {categoryTagline(c, lang)} · {t.from} {formatPrice(c.priceFrom)}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
