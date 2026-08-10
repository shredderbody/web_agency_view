"use client";
import { useEffect } from "react";
import Link from "next/link";
import { shopHref } from "@/lib/shop/base";
import { X, ShoppingBag, Plus, Minus, Trash2, Truck } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { shopStrings } from "@/lib/shop/strings";
import { formatPrice } from "@/lib/shop/catalog";
import { useCart } from "./cart";

export default function CartDrawer() {
  const { lang } = useLang();
  const t = shopStrings(lang);
  const { lines, subtotal, open, setOpen, setQty, remove, count } = useCart();

  // Tiroir ouvert : on marque <body> pour que la bulle Vapi fixe (bas-droite)
  // s'efface — sinon elle recouvre le pied du panier sur mobile (cf. globals.css).
  useEffect(() => {
    document.body.classList.toggle("cart-open", open);
    return () => document.body.classList.remove("cart-open");
  }, [open]);

  return (
    <>
      <div
        className={`s-drawer-backdrop${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside className={`s-drawer${open ? " open" : ""}`} aria-hidden={!open} aria-label={t.yourCart}>
        <div className="s-drawer-head">
          <span className="s-h3" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={18} /> {t.yourCart}
            {count > 0 && <span className="s-muted" style={{ fontSize: "0.9rem" }}>({count})</span>}
          </span>
          <button className="s-icon-btn" aria-label={t.close} onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="s-cart-empty">
            <ShoppingBag size={40} strokeWidth={1} />
            <p>{t.cartEmpty}</p>
            <Link href={shopHref("/collections")} className="s-btn s-btn-dark" onClick={() => setOpen(false)}>
              {t.cartEmptyCta}
            </Link>
          </div>
        ) : (
          <>
            <div className="s-drawer-body">
              {lines.map((l) => (
                <div key={l.slug} className="s-cart-item">
                  <Link
                    href={shopHref(`/${l.category}/${l.slug}`)}
                    className="s-cart-thumb"
                    onClick={() => setOpen(false)}
                  >
                    {l.img && <img src={l.img} alt={l.name} loading="lazy" />}
                  </Link>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", minWidth: 0 }}>
                    <Link
                      href={shopHref(`/${l.category}/${l.slug}`)}
                      className="s-card-name"
                      style={{ fontSize: "0.95rem" }}
                      onClick={() => setOpen(false)}
                    >
                      {l.name}
                    </Link>
                    <span className="s-card-meta">{l.color}</span>
                    <div className="s-qty" style={{ marginTop: "0.3rem", alignSelf: "flex-start" }}>
                      <button aria-label="-" onClick={() => setQty(l.slug, l.qty - 1)}>
                        <Minus size={14} />
                      </button>
                      <span style={{ minWidth: "2rem" }}>{l.qty}</span>
                      <button aria-label="+" onClick={() => setQty(l.slug, l.qty + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                      {formatPrice(l.price * l.qty)}
                    </span>
                    <button
                      className="s-icon-btn"
                      style={{ width: "2rem", height: "2rem" }}
                      aria-label={t.remove}
                      onClick={() => remove(l.slug)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="s-cart-foot">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
                <span className="s-eyebrow">{t.subtotal}</span>
                <span className="s-h3">{formatPrice(subtotal)}</span>
              </div>
              <p className="s-perk" style={{ marginBottom: "1rem", fontSize: "0.8rem" }}>
                <Truck size={16} /> {t.shippingNote}
              </p>
              <a href="mailto:serviceclient@ines-garden.com" className="s-btn s-btn-accent s-btn-block s-btn-lg">
                {t.checkout}
              </a>
              <button
                className="s-btn s-btn-ghost s-btn-block"
                style={{ marginTop: "0.6rem" }}
                onClick={() => setOpen(false)}
              >
                {t.continue}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
