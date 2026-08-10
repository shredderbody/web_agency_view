"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { shopHref } from "@/lib/shop/base";
import { ChevronRight } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { shopStrings } from "@/lib/shop/strings";
import {
  getCategory,
  productsOf,
  categoryName,
  categoryTagline,
  categoryDescription,
  formatPrice,
} from "@/lib/shop/catalog";
import ProductCard from "./ProductCard";

function heightCm(h?: string): number {
  if (!h) return 0;
  const m = h.replace(",", ".").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

export default function CollectionView({ slug }: { slug: string }) {
  const { lang } = useLang();
  const t = shopStrings(lang);
  const cat = getCategory(slug)!;
  const all = useMemo(() => productsOf(slug), [slug]);

  const colors = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of all) if (!m.has(p.color)) m.set(p.color, p.swatch);
    return [...m.entries()];
  }, [all]);

  const [color, setColor] = useState<string | null>(null);
  const [sort, setSort] = useState<"featured" | "asc" | "desc" | "size">("featured");

  const list = useMemo(() => {
    let l = color ? all.filter((p) => p.color === color) : [...all];
    if (sort === "asc") l.sort((a, b) => a.price - b.price);
    else if (sort === "desc") l.sort((a, b) => b.price - a.price);
    else if (sort === "size") l.sort((a, b) => heightCm(b.height) - heightCm(a.height));
    return l;
  }, [all, color, sort]);

  return (
    <>
      {/* Collection header */}
      <section className="s-section-sm s-wrap" style={{ paddingTop: "clamp(1.6rem,3vw,2.6rem)" }}>
        <nav className="s-crumb" aria-label="fil d'Ariane">
          <Link href={shopHref("/")}>{t.home}</Link>
          <span className="sep">/</span>
          <Link href={shopHref("/collections")}>{t.navCollections}</Link>
          <span className="sep">/</span>
          <span style={{ color: "var(--s-ink)" }}>{categoryName(cat, lang)}</span>
        </nav>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1.4rem", marginTop: "1.4rem" }}>
          <div style={{ maxWidth: "60ch" }}>
            <span className="s-eyebrow">{categoryTagline(cat, lang)}</span>
            <h1 className="s-display" style={{ fontSize: "clamp(2rem,5vw,3.6rem)", marginTop: "0.7rem" }}>
              {categoryName(cat, lang)}
            </h1>
            <p className="s-lead" style={{ marginTop: "1rem" }}>
              {categoryDescription(cat, lang)}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="s-serif" style={{ fontSize: "2rem" }}>{cat.count}</div>
            <div className="s-muted" style={{ fontSize: "0.82rem" }}>
              {cat.count > 1 ? t.products : t.product} · {t.from} {formatPrice(cat.priceFrom)}
            </div>
          </div>
        </div>
      </section>

      <div className="s-wrap"><hr className="s-hair" /></div>

      {/* Toolbar */}
      <section className="s-wrap" style={{ paddingBlock: "1.4rem" }}>
        <div className="s-toolbar">
          <div className="s-chips" role="group" aria-label={t.filterColor}>
            <button className={`s-chip-btn${color === null ? " active" : ""}`} onClick={() => setColor(null)}>
              {t.filterAll}
            </button>
            {colors.map(([c, sw]) => (
              <button
                key={c}
                className={`s-chip-btn${color === c ? " active" : ""}`}
                onClick={() => setColor(color === c ? null : c)}
              >
                <span className="s-chip-swatch" style={{ background: sw }} />
                {c}
              </button>
            ))}
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="s-muted" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {t.sortBy}
            </span>
            <select className="s-select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="featured">{t.sortFeatured}</option>
              <option value="asc">{t.sortPriceAsc}</option>
              <option value="desc">{t.sortPriceDesc}</option>
              <option value="size">{t.sortSize}</option>
            </select>
          </label>
        </div>
      </section>

      {/* Grid */}
      <section className="s-wrap" style={{ paddingBottom: "clamp(3.5rem,7vw,6rem)" }}>
        {list.length === 0 ? (
          <p className="s-lead" style={{ padding: "3rem 0", textAlign: "center" }}>{t.noResults}</p>
        ) : (
          <div className="s-grid">
            {list.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Back to collections */}
      <section className="s-wrap" style={{ paddingBottom: "clamp(3rem,5vw,5rem)" }}>
        <hr className="s-hair" style={{ marginBottom: "1.6rem" }} />
        <Link href={shopHref("/collections")} className="s-link">
          {t.allCollections} <ChevronRight size={16} />
        </Link>
      </section>
    </>
  );
}
