"use client";
import { useState } from "react";
import { useT } from "@/lib/lang-context";

export default function Faq() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {t.faq.items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="card" style={{ overflow: "hidden" }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1.15rem 1.3rem", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>{it.q}</span>
              <span
                style={{ flexShrink: 0, width: "1.9rem", height: "1.9rem", borderRadius: "99px", display: "grid", placeItems: "center", background: isOpen ? "var(--vermilion)" : "var(--paper-2)", color: isOpen ? "var(--surface)" : "var(--ink)", transition: "background 0.25s var(--ease), transform 0.25s var(--ease)", transform: isOpen ? "rotate(45deg)" : "none" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </button>
            <div className={`faq-body ${isOpen ? "open" : ""}`}>
              <div>
                <p style={{ margin: 0, padding: "0 1.3rem 1.3rem", color: "var(--ink-dim)", maxWidth: "62ch" }}>{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
