"use client";
import { useLang } from "@/lib/lang-context";
import { LANGS } from "@/lib/i18n";

export default function LangSelector({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { lang, setLang } = useLang();
  const dark = tone === "dark";
  return (
    <div
      role="group"
      aria-label={lang === "fr" ? "Choisir la langue" : "Choose language"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.15rem",
        padding: "0.2rem",
        borderRadius: "99px",
        border: `1px solid ${dark ? "var(--line, oklch(1 0 0 / 0.18))" : "var(--border-strong)"}`,
        background: dark ? "oklch(1 0 0 / 0.06)" : "var(--surface)",
      }}
    >
      {LANGS.map(({ id, flag, label }) => {
        const active = lang === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setLang(id)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.28rem 0.55rem",
              border: "none",
              borderRadius: "99px",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              transition: "background 0.18s var(--ease), color 0.18s var(--ease), box-shadow 0.18s var(--ease)",
              background: active ? (dark ? "oklch(1 0 0 / 0.92)" : "var(--ink)") : "transparent",
              color: active ? (dark ? "var(--ink)" : "var(--paper)") : dark ? "var(--fg-dim, inherit)" : "var(--ink-dim)",
              boxShadow: active ? "0 2px 8px oklch(0.235 0.018 55 / 0.18)" : "none",
            }}
          >
            <span className={`fi fi-${flag}`} style={{ borderRadius: "2px", width: "1.15em", height: "0.85em" }} aria-hidden />
            <span>{id.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
