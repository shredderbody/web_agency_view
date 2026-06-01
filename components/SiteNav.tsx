"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/#metiers", label: "Métiers" },
  { href: "/#methode", label: "Méthode" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#faq", label: "Questions" },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        insetInline: 0,
        top: 0,
        zIndex: 50,
        transition: "background 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s",
        background: scrolled ? "oklch(0.972 0.012 84 / 0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <nav className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.6rem" }}>
        <Link href="/" aria-label="Atelier Vitrine, accueil" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Mark />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
            Atelier <span style={{ color: "var(--vermilion-deep)" }}>Vitrine</span>
          </span>
        </Link>

        <div className="nav-desktop" style={{ display: "none", alignItems: "center", gap: "2rem" }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} style={{ fontSize: "0.92rem", fontWeight: 500, color: "var(--ink-dim)" }} className="nav-link">
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <a href="/#contact" className="btn btn-accent" style={{ padding: "0.62rem 1.25rem" }}>
            Devis gratuit
          </a>
          <button
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="nav-burger"
            style={{
              display: "inline-flex", background: "none", border: "1px solid var(--border-strong)",
              borderRadius: "0.6rem", width: "2.6rem", height: "2.6rem", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <Burger open={open} />
          </button>
        </div>
      </nav>

      {open && (
        <div
          className="wrap"
          style={{
            paddingBottom: "1.2rem", display: "flex", flexDirection: "column", gap: "0.2rem",
            background: "oklch(0.972 0.012 84 / 0.96)", backdropFilter: "blur(14px)",
          }}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ padding: "0.75rem 0.4rem", fontSize: "1.05rem", fontWeight: 500, borderBottom: "1px solid var(--border)" }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 880px) {
          .nav-desktop { display: flex !important; }
          .nav-burger { display: none !important; }
        }
        .nav-link { transition: color 0.18s var(--ease); }
        .nav-link:hover { color: var(--vermilion-deep); }
      `}</style>
    </header>
  );
}

function Mark() {
  return (
    <span
      style={{
        width: "2.2rem", height: "2.2rem", borderRadius: "0.7rem", flexShrink: 0,
        display: "grid", placeItems: "center", background: "var(--ink)", color: "var(--paper)",
        boxShadow: "0 6px 16px oklch(0.235 0.018 55 / 0.25)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}
