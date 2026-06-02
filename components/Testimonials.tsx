"use client";
import { motion } from "motion/react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { useLang } from "@/lib/lang-context";

export default function Testimonials() {
  const { t } = useLang();
  const items = t.testimonials.items;
  const firstColumn = items.slice(0, 2);
  const secondColumn = items.slice(2, 4);
  const thirdColumn = items.slice(4, 6);

  return (
    <section id="temoignages" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--paper-2)", borderBlock: "1px solid var(--border)" }}>
      <div className="wrap">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{ maxWidth: "60ch", marginBottom: "clamp(2rem, 5vw, 3.2rem)" }}
        >
          <span className="kicker" style={{ marginBottom: "1rem" }}>{t.testimonials.kicker}</span>
          <h2 className="d-xl" style={{ margin: "0 0 1rem" }}>{t.testimonials.title}</h2>
          <p style={{ fontSize: "1.08rem", color: "var(--ink-dim)", margin: 0 }}>{t.testimonials.body}</p>
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
