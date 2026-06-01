"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/lang-context";
import LangSelector from "./LangSelector";

export default function SiteNav() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const LINKS = [
    { href: "/#metiers", label: t.nav.metiers },
    { href: "/#methode", label: t.nav.methode },
    { href: "/#tarifs", label: t.nav.tarifs },
    { href: "/#faq", label: t.nav.faq },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
    <header
      style={{
        position: "fixed", insetInline: 0, top: 0, zIndex: 50,
        transition: "background 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s",
        background: scrolled || open ? "oklch(0.972 0.012 84 / 0.86)" : "transparent",
        backdropFilter: scrolled || open ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <nav className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.4rem", gap: "1rem" }}>
        <Link href="/" aria-label={`Atelier Vitrine, ${t.nav.home}`} onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.55rem", flexShrink: 0 }}>
          <Mark />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            Atelier <span style={{ color: "var(--vermilion-deep)" }}>Vitrine</span>
          </span>
        </Link>

        <div className="nav-desktop" style={{ display: "none", alignItems: "center", gap: "1.8rem" }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link" style={{ fontSize: "0.92rem", fontWeight: 500, color: "var(--ink-dim)", whiteSpace: "nowrap" }}>
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
          <span className="nav-lang-desktop" style={{ display: "none" }}><LangSelector /></span>
          <a href="/#contact" className="btn btn-accent nav-cta" style={{ padding: "0.6rem 1.15rem" }}>{t.nav.devis}</a>
          <button
            aria-label={t.nav.menu} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="nav-burger"
            style={{ display: "inline-flex", background: "none", border: "1px solid var(--border-strong)", borderRadius: "0.6rem", width: "2.6rem", height: "2.6rem", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <Burger open={open} />
          </button>
        </div>
      </nav>
    </header>

      {/* Backdrop */}
      <div
        className="nav-overlay" aria-hidden onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 55,
          background: "oklch(0.235 0.018 55 / 0.42)", backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.32s var(--ease)",
        }}
      />

      {/* Retractable sidebar */}
      <aside
        className="nav-sidebar" data-open={open} aria-hidden={!open}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 60,
          width: "min(86vw, 360px)", background: "var(--surface)",
          borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-lg)",
          transform: open ? "translateX(0)" : "translateX(101%)",
          transition: "transform 0.4s var(--ease)",
          display: "flex", flexDirection: "column",
          padding: "1.3rem 1.4rem calc(1.6rem + env(safe-area-inset-bottom))",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem" }}>
          <Link href="/" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Mark />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
              Atelier <span style={{ color: "var(--vermilion-deep)" }}>Vitrine</span>
            </span>
          </Link>
          <button
            aria-label={t.nav.close} onClick={() => setOpen(false)}
            style={{ display: "inline-flex", background: "none", border: "1px solid var(--border-strong)", borderRadius: "0.6rem", width: "2.4rem", height: "2.4rem", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12" /><path d="M18 6 6 18" /></svg>
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column" }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ padding: "0.95rem 0.2rem", fontSize: "1.18rem", fontWeight: 600, fontFamily: "var(--font-display)", borderBottom: "1px solid var(--border)" }}>
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "1.8rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <LangSelector />
          <a href="/#contact" onClick={() => setOpen(false)} className="btn btn-accent" style={{ width: "100%" }}>{t.nav.devis}</a>
        </div>
      </aside>

      <style>{`
        @media (min-width: 1000px) {
          .nav-desktop { display: flex !important; }
          .nav-lang-desktop { display: inline-flex !important; }
          .nav-burger { display: none !important; }
          .nav-sidebar, .nav-overlay { display: none !important; }
        }
        .nav-link { transition: color 0.18s var(--ease); }
        .nav-link:hover { color: var(--vermilion-deep); }
        @media (max-width: 380px) { .nav-cta { display: none !important; } }
      `}</style>
    </>
  );
}

function Mark() {
  return (
    <span style={{ width: "2.15rem", height: "2.15rem", borderRadius: "0.65rem", flexShrink: 0, display: "grid", placeItems: "center", background: "var(--ink)", color: "var(--paper)", boxShadow: "0 6px 16px oklch(0.235 0.018 55 / 0.25)" }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M4 9.5 12 4l8 5.5V20H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M4 11h16" stroke="var(--vermilion)" strokeWidth="1.7" />
        <path d="M9 20v-5h6v5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Burger({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
      {open ? (<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>) : (<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>)}
    </svg>
  );
}
