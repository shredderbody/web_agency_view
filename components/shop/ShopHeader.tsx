"use client";
import { useState } from "react";
import Link from "next/link";
import { shopHref } from "@/lib/shop/base";
import { Landmark, Menu, X, ShoppingBag, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { shopStrings } from "@/lib/shop/strings";
import { CATEGORIES, categoryName } from "@/lib/shop/catalog";
import { useCart } from "./cart";
import LangSelector from "@/components/LangSelector";

export default function ShopHeader() {
  const { lang } = useLang();
  const t = shopStrings(lang);
  const { count, setOpen: setCartOpen } = useCart();
  const [menu, setMenu] = useState(false);

  return (
    <>
      <div className="s-announce">
        <div className="s-announce-track" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, k) => (
            <span className="s-announce-item" key={k}>
              {t.announce}
              <b className="s-announce-sep">✦</b>
            </span>
          ))}
        </div>
        <span className="s-sr-only">{t.announce}</span>
      </div>

      <header className="s-header">
        <div className="s-wrap s-header-bar">
          <button
            className="s-icon-btn s-burger"
            aria-label={t.menu}
            onClick={() => setMenu(true)}
          >
            <Menu size={22} />
          </button>

          <Link href={shopHref("/")} className="s-logo" aria-label="Ines Garden">
            <Landmark size={20} /> Ines Garden
          </Link>

          <nav className="s-nav" aria-label="Collections">
            <Link href={shopHref("/")}>{t.navHome}</Link>
            <Link href={shopHref("/collections")}>{t.navCollections}</Link>
            {CATEGORIES.slice(0, 4).map((c) => (
              <Link key={c.slug} href={shopHref(`/${c.slug}`)}>
                {categoryName(c, lang)}
              </Link>
            ))}
          </nav>

          <div className="s-header-actions">
            <span className="s-lang-desktop">
              <LangSelector />
            </span>
            <button
              className="s-icon-btn"
              aria-label={`${t.cart} (${count})`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag size={20} />
              {count > 0 && <span className="s-cart-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`s-drawer-backdrop${menu ? " open" : ""}`}
        onClick={() => setMenu(false)}
        aria-hidden={!menu}
      />
      <aside
        className={`s-drawer s-drawer-left${menu ? " open" : ""}`}
        aria-hidden={!menu}
        aria-label={t.menu}
      >
        <div className="s-drawer-head">
          <span className="s-logo">
            <Landmark size={18} /> Ines Garden
          </span>
          <button className="s-icon-btn" aria-label={t.close} onClick={() => setMenu(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="s-drawer-body s-drawer-nav" onClick={() => setMenu(false)}>
          <Link href={shopHref("/")}>
            {t.navHome} <ChevronRight size={16} />
          </Link>
          <Link href={shopHref("/collections")}>
            {t.navCollections} <ChevronRight size={16} />
          </Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={shopHref(`/${c.slug}`)}>
              {categoryName(c, lang)}
              <span style={{ fontSize: "0.72rem", color: "var(--s-dim)" }}>{c.count}</span>
            </Link>
          ))}
        </div>
        <div style={{ padding: "1.2rem 1.5rem", borderTop: "1px solid var(--s-line)" }}>
          <LangSelector />
        </div>
      </aside>
    </>
  );
}
