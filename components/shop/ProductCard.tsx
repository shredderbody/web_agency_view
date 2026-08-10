"use client";
import Link from "next/link";
import { shopHref } from "@/lib/shop/base";
import { Plus } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { shopStrings } from "@/lib/shop/strings";
import { formatPrice, type Product } from "@/lib/shop/catalog";
import { useCart } from "./cart";

export default function ProductCard({ p, tag }: { p: Product; tag?: string }) {
  const { lang } = useLang();
  const t = shopStrings(lang);
  const { add, setOpen } = useCart();
  const href = shopHref(`/${p.category}/${p.slug}`);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    add({ slug: p.slug, category: p.category, name: p.name, price: p.price, img: p.img, color: p.color });
    setOpen(true);
  }

  return (
    <article className="s-card">
      <Link href={href} className="s-card-media" aria-label={p.name}>
        {tag && <span className="s-card-tag s-pill s-pill-gold">{tag}</span>}
        {p.img && <img src={p.img} alt={p.name} loading="lazy" decoding="async" />}
        <div className="s-card-quick">
          <button className="s-btn s-btn-dark s-btn-block" onClick={quickAdd} style={{ fontSize: "0.74rem", padding: "0.7rem 1rem" }}>
            <Plus size={15} /> {t.addToCart}
          </button>
        </div>
      </Link>
      <Link href={href} className="s-card-body">
        <span className="s-swatches">
          <span className="s-swatch" style={{ background: p.swatch }} title={p.color} />
        </span>
        <span className="s-card-name">{p.name}</span>
        <span className="s-card-meta">
          {p.height ? `H. ${p.height}` : p.color}
          {p.ref ? ` · ${p.ref}` : ""}
        </span>
        <span className="s-card-price">{formatPrice(p.price)}</span>
      </Link>
    </article>
  );
}
