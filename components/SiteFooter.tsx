import Link from "next/link";
import { DEMOS } from "@/lib/demos";

export default function SiteFooter() {
  return (
    <footer style={{ background: "var(--ink)", color: "var(--paper)", paddingBlock: "clamp(3rem, 6vw, 5rem)" }}>
      <div className="wrap">
        <div
          style={{
            display: "grid", gap: "2.5rem",
            gridTemplateColumns: "minmax(0, 1.4fr) repeat(2, minmax(0, 1fr))",
          }}
          className="footer-grid"
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <span style={{ width: "2rem", height: "2rem", borderRadius: "0.6rem", display: "grid", placeItems: "center", background: "var(--paper)", color: "var(--ink)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 9.5 12 4l8 5.5V20H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M9 20v-5h6v5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem" }}>Atelier Vitrine</span>
            </div>
            <p style={{ color: "oklch(0.85 0.01 80)", maxWidth: "38ch", lineHeight: 1.6 }}>
              L'atelier qui dessine la vitrine en ligne des commerces de quartier. Une démo à votre nom, puis un site qui travaille pour vous.
            </p>
            <a href="/#contact" className="btn btn-accent" style={{ marginTop: "1.4rem" }}>
              Réserver un appel
            </a>
          </div>

          <div>
            <p style={{ fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "oklch(0.72 0.01 80)", marginBottom: "0.9rem" }}>
              Vitrines de démo
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.55rem" }}>
              {DEMOS.map((d) => (
                <li key={d.slug}>
                  <Link href={`/demo/${d.slug}`} className="foot-link">
                    {d.business} <span style={{ opacity: 0.6 }}>· {d.trade}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{ fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "oklch(0.72 0.01 80)", marginBottom: "0.9rem" }}>
              Atelier
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.55rem" }}>
              <li><a href="/#methode" className="foot-link">Notre méthode</a></li>
              <li><a href="/#tarifs" className="foot-link">Tarifs</a></li>
              <li><a href="/#faq" className="foot-link">Questions fréquentes</a></li>
              <li><a href="mailto:bonjour@atelier-vitrine.fr" className="foot-link">bonjour@atelier-vitrine.fr</a></li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: "3rem", paddingTop: "1.4rem", borderTop: "1px solid oklch(0.97 0.01 80 / 0.14)",
            display: "flex", flexWrap: "wrap", gap: "0.6rem 1.5rem", alignItems: "center", justifyContent: "space-between",
            color: "oklch(0.72 0.01 80)", fontSize: "0.85rem",
          }}
        >
          <span>© {new Date().getFullYear()} Atelier Vitrine. Conçu à la main, à Lyon.</span>
          <span style={{ display: "inline-flex", gap: "1.2rem" }}>
            <a href="#" className="foot-link">Mentions légales</a>
            <a href="#" className="foot-link">Confidentialité</a>
          </span>
        </div>
      </div>

      <style>{`
        .foot-link { color: oklch(0.88 0.01 80); transition: color 0.18s var(--ease); }
        .foot-link:hover { color: var(--vermilion); }
        @media (max-width: 760px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
