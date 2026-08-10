"use client";
import { useState } from "react";
import Link from "next/link";
import { shopHref } from "@/lib/shop/base";
import { Plus, Minus, Truck, Shield, RotateCcw, Check, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { shopStrings } from "@/lib/shop/strings";
import {
  getProduct,
  getCategory,
  relatedProducts,
  categoryName,
  formatPrice,
} from "@/lib/shop/catalog";
import { useCart } from "./cart";
import ProductCard from "./ProductCard";

export default function ProductDetail({ category, slug }: { category: string; slug: string }) {
  const { lang } = useLang();
  const t = shopStrings(lang);
  const p = getProduct(category, slug)!;
  const cat = getCategory(category)!;
  const related = relatedProducts(p, 4);
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function addToCart() {
    add({ slug: p.slug, category: p.category, name: p.name, price: p.price, img: p.img, color: p.color }, qty);
    setAdded(true);
    setOpen(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const specs: [string, string | undefined][] = [
    [t.reference, p.ref || undefined],
    [t.finish, p.color],
    [t.height, p.height],
    [t.width, p.width],
    [t.base, p.footBase],
    [t.weight, p.weight],
  ];

  return (
    <>
      <section className="s-section-sm s-wrap" style={{ paddingTop: "clamp(1.4rem,3vw,2.2rem)", paddingBottom: 0 }}>
        <nav className="s-crumb">
          <Link href={shopHref("/")}>{t.home}</Link>
          <span className="sep">/</span>
          <Link href={shopHref(`/${cat.slug}`)}>{categoryName(cat, lang)}</Link>
          <span className="sep">/</span>
          <span style={{ color: "var(--s-ink)" }}>{p.name}</span>
        </nav>
      </section>

      <section className="s-section-sm s-wrap">
        <div className="s-pd-grid">
          {/* Media */}
          <div className="s-pd-media">{p.img && <img src={p.img} alt={p.name} />}</div>

          {/* Info */}
          <div className="s-pd-info">
            <Link href={shopHref(`/${cat.slug}`)} className="s-eyebrow" style={{ marginBottom: "0.6rem", display: "inline-block" }}>
              {categoryName(cat, lang)}
            </Link>
            <h1 className="s-h1 s-serif">{p.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginTop: "0.9rem" }}>
              <span className="s-h2 s-serif" style={{ color: "var(--s-accent-deep)" }}>{formatPrice(p.price)}</span>
              {p.stock && p.stock > 0 ? (
                <span className="s-pill s-pill-accent">
                  <Check size={13} /> {t.inStock}
                </span>
              ) : (
                <span className="s-pill">{t.onOrder}</span>
              )}
            </div>

            {p.description && (
              <p className="s-lead" style={{ marginTop: "1.3rem" }}>
                {p.description}
              </p>
            )}

            {/* Finish swatch */}
            <div style={{ marginTop: "1.6rem" }}>
              <span className="s-eyebrow">{t.finish}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.6rem" }}>
                <span className="s-swatch" style={{ width: "1.6rem", height: "1.6rem", background: p.swatch }} />
                <span style={{ fontWeight: 500 }}>{p.color}</span>
              </div>
            </div>

            {/* Qty + add */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "1.8rem", alignItems: "stretch" }}>
              <div className="s-qty">
                <button aria-label="-" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus size={16} />
                </button>
                <span>{qty}</span>
                <button aria-label="+" onClick={() => setQty((q) => q + 1)}>
                  <Plus size={16} />
                </button>
              </div>
              <button className="s-btn s-btn-accent s-btn-lg" style={{ flex: 1, minWidth: "12rem" }} onClick={addToCart}>
                {added ? <Check size={17} /> : <Plus size={17} />}
                {added ? (lang === "en" ? "Added" : "Ajouté") : t.addToCart}
              </button>
            </div>

            {/* Perks */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginTop: "1.8rem", paddingTop: "1.6rem", borderTop: "1px solid var(--s-line)" }}>
              <p className="s-perk"><Truck size={17} /> {t.shippingNote}</p>
              <p className="s-perk"><Shield size={17} /> {lang === "en" ? "Solid cast iron, built to last outdoors." : "Fonte de fer massive, faite pour durer dehors."}</p>
              <p className="s-perk"><RotateCcw size={17} /> {lang === "en" ? "Careful, insured shipping." : "Expédition soignée et assurée."}</p>
            </div>

            {/* Specs */}
            <div style={{ marginTop: "1.8rem" }}>
              <h2 className="s-eyebrow" style={{ marginBottom: "0.4rem" }}>{t.specifications}</h2>
              <table className="s-spec-table">
                <tbody>
                  {specs
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <tr key={k}>
                        <td>{k}</td>
                        <td>{v}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="s-section" style={{ background: "var(--s-bg-2)", borderTop: "1px solid var(--s-line)" }}>
          <div className="s-wrap">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span className="s-eyebrow s-eyebrow-gold">{t.relatedLead}</span>
                <h2 className="s-h2 s-serif" style={{ marginTop: "0.5rem" }}>{t.related}</h2>
              </div>
              <Link href={shopHref(`/${cat.slug}`)} className="s-link">
                {categoryName(cat, lang)} <ChevronRight size={16} />
              </Link>
            </div>
            <div className="s-grid">
              {related.map((rp) => (
                <ProductCard key={rp.slug} p={rp} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
