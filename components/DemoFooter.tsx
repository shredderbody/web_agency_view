"use client";
import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import type { Vitrine } from "@/lib/vitrineContent";

export default function DemoFooter({ v, isBarber, ls }: { v: Vitrine; isBarber: boolean; ls: string }) {
  const { t } = useLang();
  const c = t.demoCommon;

  const navLinks = [
    { href: "#carte", label: c.navCard },
    { href: "#lieu", label: c.navPlace },
    { href: "#artisan", label: c.navArtisan },
  ];

  return (
    <footer style={{ background: "var(--ink)", color: "var(--paper)" }}>
      <div className="wrap" style={{ paddingBlock: "clamp(2.6rem, 6vw, 4.5rem)" }}>
        <div className="vit-foot-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: "clamp(2rem, 5vw, 3.5rem)" }}>
          {/* Identity */}
          <div>
            <span
              className="vit-display"
              style={{ display: "block", fontSize: "1.3rem", fontWeight: 700, letterSpacing: ls, textTransform: isBarber ? "uppercase" : "none", marginBottom: "0.4rem" }}
            >
              {v.business}
            </span>
            <p style={{ color: "var(--vermilion)", fontWeight: 600, fontSize: "0.9rem", margin: "0 0 1.4rem" }}>{v.trade}</p>
            <p style={{ color: "oklch(0.85 0.01 80)", fontSize: "0.94rem", maxWidth: "40ch", margin: 0, lineHeight: 1.6 }}>{v.heroLead}</p>
          </div>

          {/* Navigation */}
          <div>
            <p className="vit-foot-label">{c.footerNavLabel}</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.6rem" }}>
              {navLinks.map((l) => (
                <li key={l.href}><a href={l.href} className="vit-foot-link">{l.label}</a></li>
              ))}
              <li><Link href="/#metiers" className="vit-foot-link">{c.allDemos}</Link></li>
            </ul>
          </div>

          {/* Practical info */}
          <div>
            <p className="vit-foot-label">{c.footerInfoLabel}</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.7rem" }}>
              <li style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start", fontSize: "0.92rem", color: "oklch(0.85 0.01 80)" }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: "0.15rem", color: "var(--vermilion)" }} />
                <span>{v.address}</span>
              </li>
              <li style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start", fontSize: "0.92rem", color: "oklch(0.85 0.01 80)" }}>
                <Clock size={16} style={{ flexShrink: 0, marginTop: "0.15rem", color: "var(--vermilion)" }} />
                <span>{v.hours}</span>
              </li>
              <li style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start", fontSize: "0.92rem" }}>
                <Phone size={16} style={{ flexShrink: 0, marginTop: "0.15rem", color: "var(--vermilion)" }} />
                <a href={`tel:${v.phone.replace(/\s+/g, "")}`} className="vit-foot-link">{v.phone}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="vit-foot-bottom" style={{ marginTop: "clamp(2.2rem, 5vw, 3.2rem)", paddingTop: "1.4rem", borderTop: "1px solid oklch(0.97 0.01 80 / 0.14)", display: "flex", flexWrap: "wrap", gap: "0.8rem 1.5rem", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "oklch(0.72 0.01 80)" }}>{c.footerNote}</p>
          <a href="/#contact" className="vit-foot-link" style={{ fontWeight: 600 }}>{c.createCta}</a>
        </div>
      </div>

      <style>{`
        .vit-foot-label { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: oklch(0.72 0.01 80); margin: 0 0 1rem; }
        .vit-foot-link { color: oklch(0.85 0.01 80); transition: color 0.18s var(--ease); }
        .vit-foot-link:hover { color: var(--vermilion); }
        @media (max-width: 860px) { .vit-foot-grid { grid-template-columns: 1fr 1fr !important; } .vit-foot-grid > div:first-child { grid-column: 1 / -1; } }
        @media (max-width: 560px) {
          .vit-foot-grid { grid-template-columns: 1fr !important; }
          .vit-foot-grid > div:first-child { grid-column: auto; }
          .vit-foot-bottom { flex-direction: column; align-items: flex-start !important; }
        }
      `}</style>
    </footer>
  );
}
