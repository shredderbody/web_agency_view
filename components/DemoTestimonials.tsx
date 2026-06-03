"use client";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import type { Review } from "@/lib/vitrineContent";

// Landing-style animated testimonial columns for the demo (métier) pages.
// The section forces the landing tokens (cream paper / ink text / landing
// fonts) so it stays readable on top of any per-trade theme (dark or light).
export default function DemoTestimonials({
  reviews,
  title,
  rating,
  ratingMeta,
  index,
}: {
  reviews: Review[];
  title: string;
  rating: string;
  ratingMeta: string;
  index?: string;
}) {
  const cols = reviews.map((r) => ({ text: r.text, image: r.image, name: r.author, role: r.meta }));
  const firstColumn = cols.slice(0, 2);
  const secondColumn = cols.slice(2, 4);
  const thirdColumn = cols.slice(4, 6);

  return (
    <section
      style={{
        paddingBlock: "clamp(3rem, 6vw, 5rem)",
        background: "var(--bg-2, var(--paper-2))",
        borderBlock: "1px solid var(--line, var(--border))",
        color: "var(--fg, var(--ink))",
        fontFamily: "var(--vit-body, var(--font-body))",
      }}
    >
      <div className="wrap">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{ maxWidth: "60ch", marginBottom: "clamp(2rem, 5vw, 3.2rem)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1rem" }}>
            {index && (
              <span
                style={{
                  flexShrink: 0, width: "2rem", height: "2rem", borderRadius: "99px",
                  display: "grid", placeItems: "center",
                  background: "var(--accent, var(--vermilion))", color: "var(--bg, var(--surface))",
                  fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 700, lineHeight: 1,
                }}
              >
                {index}
              </span>
            )}
            <span className="kicker" style={{ margin: 0, color: "var(--accent, var(--vermilion-deep))" }}>{title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", color: "var(--accent, var(--vermilion))" }}>
            <span style={{ display: "flex", gap: "1px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} fill="currentColor" stroke="none" />
              ))}
            </span>
            <strong style={{ color: "var(--fg, var(--ink))", fontFamily: "var(--vit-display, var(--font-display))", fontSize: "1.15rem" }}>{rating}</strong>
            <span style={{ color: "var(--fg-dim, var(--ink-muted))" }}>· {ratingMeta}</span>
          </div>
        </motion.div>

        <div
          className="testi-cols"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            maxHeight: "640px",
            overflow: "hidden",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
            maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
          }}
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="testi-hide-md" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="testi-hide-lg" duration={17} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .testi-hide-lg { display: none !important; } }
        @media (max-width: 640px) { .testi-hide-md { display: none !important; } }
      `}</style>
    </section>
  );
}
