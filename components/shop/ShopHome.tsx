"use client";
import Link from "next/link";
import { shopHref } from "@/lib/shop/base";
import { ArrowRight, Truck, Shield, Sparkles, Star } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { shopStrings } from "@/lib/shop/strings";
import {
  CATEGORIES,
  featuredProducts,
  categoryName,
  categoryTagline,
  getCategory,
  formatPrice,
} from "@/lib/shop/catalog";
import { MARQUEE } from "@/lib/inesGarden";
import ProductCard from "./ProductCard";
import TileMedia from "./TileMedia";
import Reveal from "./Reveal";

const PERK_ICONS = [Truck, Shield, Sparkles, Star];

export default function ShopHome() {
  const { lang } = useLang();
  const t = shopStrings(lang);
  const hero = getCategory("vases-medicis")!;
  // Sélection éditoriale d'images marquantes (plein cadre, sans blanc) qui
  // défilent aléatoirement dans le hero, comme les cartes collection.
  const heroGallery = [
    "vases-medicis",
    "fontaines",
    "statues",
    "vasques-medicis",
    "tetes-de-cheval",
  ]
    .map((slug) => getCategory(slug)?.gallery?.[0])
    .filter(Boolean) as string[];
  const featured = featuredProducts();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="s-hero s-section">
        <div className="s-wrap s-hero-grid">
          <Reveal>
            <span className="s-eyebrow">{t.heroEyebrow}</span>
            <h1 className="s-display" style={{ marginTop: "1.1rem" }}>
              {t.heroTitle}
            </h1>
            <p className="s-lead s-measure" style={{ marginTop: "1.4rem" }}>
              {t.heroLead}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem", marginTop: "2rem" }}>
              <Link href={shopHref("/collections")} className="s-btn s-btn-dark s-btn-lg">
                {t.heroCta} <ArrowRight size={16} />
              </Link>
              <Link href={shopHref("/vases-medicis")} className="s-btn s-btn-ghost s-btn-lg">
                {t.heroCta2}
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "2rem" }}>
              <span style={{ display: "inline-flex", color: "var(--s-gold)" }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </span>
              <span className="s-muted" style={{ fontSize: "0.85rem" }}>
                {lang === "en" ? "Rated 5/5 · Free delivery across France" : "Noté 5/5 · Livraison offerte partout en France"}
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <TileMedia className="s-hero-media" images={heroGallery} alt={categoryName(hero, lang)} interval={4000}>
              <div className="s-hero-badge">
                <strong className="s-serif" style={{ fontSize: "1rem" }}>
                  {t.heroBadge}
                </strong>
              </div>
            </TileMedia>
          </Reveal>
        </div>
      </section>

      {/* ── Perks band ───────────────────────────────────── */}
      <div className="s-band">
        <div className="s-band-track" aria-hidden>
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>

      {/* ── Collections ──────────────────────────────────── */}
      <section className="s-section s-wrap">
        <Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginBottom: "2.4rem" }}>
            <div>
              <span className="s-eyebrow">{t.collectionsEyebrow}</span>
              <h2 className="s-h1 s-serif" style={{ marginTop: "0.7rem" }}>
                {t.collectionsTitle}
              </h2>
            </div>
            <p className="s-lead" style={{ maxWidth: "40ch" }}>
              {t.collectionsLead}
            </p>
          </div>
        </Reveal>

        <div className="s-grid-3 s-grid-3--home">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60}>
              <Link href={shopHref(`/${c.slug}`)} className="s-tile">
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

      {/* ── Featured products ────────────────────────────── */}
      <section className="s-section" style={{ background: "var(--s-bg-2)", borderBlock: "1px solid var(--s-line)" }}>
        <div className="s-wrap">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "2.6rem" }}>
              <span className="s-eyebrow s-eyebrow-gold">{t.featuredEyebrow}</span>
              <h2 className="s-h1 s-serif" style={{ marginTop: "0.7rem" }}>
                {t.featuredTitle}
              </h2>
              <p className="s-lead" style={{ marginInline: "auto", marginTop: "0.8rem", maxWidth: "48ch" }}>
                {t.featuredLead}
              </p>
            </div>
          </Reveal>
          <div className="s-grid">
            {featured.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2.6rem" }}>
            <Link href={shopHref("/collections")} className="s-btn s-btn-ghost s-btn-lg">
              {t.viewAll} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Story / craft ────────────────────────────────── */}
      <section className="s-section s-wrap">
        <div className="s-hero-grid">
          <Reveal>
            <div className="s-hero-media" style={{ aspectRatio: "2/3" }}>
              <img src={getCategory("statues")!.hero} alt="" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <span className="s-eyebrow">{t.storyEyebrow}</span>
            <h2 className="s-h1 s-serif" style={{ marginTop: "0.7rem" }}>
              {t.storyTitle}
            </h2>
            {t.storyBody.map((para, i) => (
              <p key={i} className="s-lead" style={{ marginTop: "1.1rem" }}>
                {para}
              </p>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.4rem", marginTop: "2rem" }}>
              {t.perks.map((perk, i) => {
                const Icon = PERK_ICONS[i % PERK_ICONS.length];
                return (
                  <div key={i} className="s-perk">
                    <Icon size={20} />
                    <div>
                      <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--s-ink)" }}>{perk.title}</strong>
                      <span className="s-muted" style={{ fontSize: "0.84rem" }}>{perk.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
