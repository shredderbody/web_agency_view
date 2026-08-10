"use client";
import Link from "next/link";
import { shopHref } from "@/lib/shop/base";
import { Landmark, MapPin, Phone, Mail, Clock, Globe, Share2 } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { shopStrings } from "@/lib/shop/strings";
import { CATEGORIES, categoryName } from "@/lib/shop/catalog";
import { FACTS } from "@/lib/inesGarden";

export default function ShopFooter() {
  const { lang } = useLang();
  const t = shopStrings(lang);
  const year = new Date().getFullYear();

  return (
    <footer className="s-footer">
      <div className="s-wrap" style={{ paddingBlock: "clamp(2.8rem, 5vw, 4.5rem)" }}>
        <div className="s-footer-grid">
          {/* Brand + newsletter */}
          <div>
            <span className="s-logo" style={{ color: "#fff" }}>
              <Landmark size={20} /> Ines Garden
            </span>
            <p style={{ marginTop: "1rem", fontSize: "0.9rem", lineHeight: 1.65, maxWidth: "34ch", color: "oklch(0.82 0.012 90)" }}>
              {t.footerTagline}
            </p>
            <h4 style={{ marginTop: "1.6rem", fontSize: "0.95rem" }}>{t.newsletterTitle}</h4>
            <p style={{ fontSize: "0.84rem", color: "oklch(0.78 0.012 90)", maxWidth: "38ch" }}>{t.newsletterText}</p>
            <form className="s-newsletter" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder={t.newsletterPlaceholder} aria-label={t.newsletterPlaceholder} />
              <button type="submit" className="s-btn s-btn-accent">
                {t.newsletterCta}
              </button>
            </form>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.2rem" }}>
              <a className="s-icon-btn" style={{ color: "inherit", border: "1px solid oklch(0.9 0.01 90 / 0.2)" }} href={FACTS.website} aria-label={lang === "en" ? "Website" : "Site web"}>
                <Globe size={18} />
              </a>
              <a className="s-icon-btn" style={{ color: "inherit", border: "1px solid oklch(0.9 0.01 90 / 0.2)" }} href={FACTS.website} aria-label={lang === "en" ? "Share" : "Partager"}>
                <Share2 size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4>{t.footerShop}</h4>
            <div className="s-footer-links">
              <Link href={shopHref("/collections")}>{t.allCollections}</Link>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={shopHref(`/${c.slug}`)}>
                  {categoryName(c, lang)}
                </Link>
              ))}
            </div>
          </div>

          {/* House */}
          <div>
            <h4>{t.footerHouse}</h4>
            <div className="s-footer-links">
              <Link href={shopHref("/")}>{t.aboutUs}</Link>
              <span>{t.delivery}</span>
              <span>{t.legal}</span>
              <span>{t.cgv}</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4>{t.footerContact}</h4>
            <div className="s-footer-links">
              <a href={FACTS.mapsUri} style={{ display: "flex", gap: "0.55rem", alignItems: "flex-start" }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: "0.15rem" }} />
                <span>{FACTS.address}</span>
              </a>
              <a href={`tel:${FACTS.phone.replace(/\s/g, "")}`} style={{ display: "flex", gap: "0.55rem", alignItems: "center" }}>
                <Phone size={16} /> {FACTS.phone}
              </a>
              <a href="mailto:serviceclient@ines-garden.com" style={{ display: "flex", gap: "0.55rem", alignItems: "center" }}>
                <Mail size={16} /> serviceclient@ines-garden.com
              </a>
              <span style={{ display: "flex", gap: "0.55rem", alignItems: "center" }}>
                <Clock size={16} /> {lang === "en" ? "Online 24/7" : "En ligne · 24h/24, 7j/7"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="s-wrap s-footer-bottom">
        <span>© {year} Les Jardins d'Inès · {t.rights}</span>
        <span style={{ display: "inline-flex", gap: "1rem", flexWrap: "wrap" }}>
          <span>{t.legal}</span>
          <span>{t.cgv}</span>
          <span>{lang === "en" ? "Rated 5/5 on Google" : "Noté 5/5 sur Google"}</span>
        </span>
      </div>
    </footer>
  );
}
