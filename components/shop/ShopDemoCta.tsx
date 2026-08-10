"use client";
import { useLang } from "@/lib/lang-context";
import BusinessSearch from "@/components/BusinessSearch";
import { FACTS } from "@/lib/inesGarden";
import Reveal from "./Reveal";

/**
 * Bandeau « demandez la vôtre » commun à toutes les démos, adapté aux jetons
 * de la boutique (`--s-*`) puisqu'il vit dans le scope `.shop`.
 */
export default function ShopDemoCta() {
  const { lang, t } = useLang();
  const trade = FACTS.trade[lang === "en" ? "en" : "fr"];

  return (
    <section
      id="demo-request"
      className="s-section"
      style={{ background: "var(--s-bg-2)", borderTop: "1px solid var(--s-line)" }}
    >
      <div className="s-wrap">
        <Reveal>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "3px",
              background: "var(--s-accent-deep)",
              color: "#fff",
              padding: "clamp(2rem, 5vw, 3.5rem)",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: "-30%",
                right: "-8%",
                width: "26rem",
                height: "26rem",
                maxWidth: "100vw",
                borderRadius: "50%",
                background: "radial-gradient(circle, oklch(1 0 0 / 0.16), transparent 60%)",
                pointerEvents: "none",
              }}
            />
            <div className="s-demo-cta">
              <div style={{ flex: "1 1 0", minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    opacity: 0.78,
                    marginBottom: "0.8rem",
                  }}
                >
                  {trade}
                </span>
                <h2
                  className="s-serif"
                  style={{
                    fontSize: "clamp(1.8rem, 3.8vw, 3rem)",
                    margin: "0 0 0.7rem",
                    color: "#fff",
                    lineHeight: 1.1,
                  }}
                >
                  {t.cta.title}
                </h2>
                <p style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)", opacity: 0.9, margin: 0, maxWidth: "44ch" }}>
                  {t.cta.body}
                </p>
              </div>
              <div className="s-demo-cta-search" style={{ flexShrink: 0, minWidth: "min(100%, 22rem)" }}>
                <BusinessSearch />
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        .s-demo-cta { position: relative; display: flex; align-items: center; justify-content: space-between; gap: clamp(1.5rem, 4vw, 3rem); }
        @media (max-width: 900px) {
          .s-demo-cta { flex-direction: column; align-items: stretch; }
          .s-demo-cta-search { min-width: 0 !important; }
        }
      `}</style>
    </section>
  );
}
