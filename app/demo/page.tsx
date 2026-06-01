"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import LangSelector from "@/components/LangSelector";
import { getDemos } from "@/lib/demos";
import { useLang } from "@/lib/lang-context";

export default function DemoIndex() {
  const { lang, t } = useLang();
  const demos = getDemos(lang);
  return (
    <>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "oklch(0.972 0.012 84 / 0.85)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--border)" }}>
        <nav className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.3rem", gap: "1rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "var(--ink-dim)" }}>
            <ArrowLeft size={17} /> {t.demoIndex.back}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <LangSelector />
            <a href="/#contact" className="btn btn-accent" style={{ padding: "0.55rem 1.1rem" }}>{t.demoIndex.devis}</a>
          </div>
        </nav>
      </header>

      <main className="wrap" style={{ paddingTop: "clamp(2.4rem, 5vw, 4rem)", paddingBottom: "clamp(3rem, 6vw, 5rem)" }}>
        <Reveal>
          <div style={{ maxWidth: "60ch", marginBottom: "clamp(2.4rem, 5vw, 3.5rem)" }}>
            <span className="kicker" style={{ marginBottom: "1.1rem" }}>{t.demoIndex.kicker}</span>
            <h1 className="d-hero" style={{ fontSize: "clamp(2.3rem, 6vw, 4.6rem)", margin: "0 0 1rem" }}>{t.demoIndex.title}</h1>
            <p style={{ fontSize: "1.12rem", color: "var(--ink-dim)", margin: 0 }}>{t.demoIndex.body}</p>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 288px), 1fr))", gap: "1.5rem" }}>
          {demos.map((d, i) => (
            <Reveal key={d.slug} delay={(i % 2) * 80}>
              <Link href={`/demo/${d.slug}`} className="card card-hover" style={{ display: "block", overflow: "hidden", height: "100%" }}>
                <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
                  <Image src={d.cover} alt={`${d.business}, ${d.trade}`} fill sizes="(max-width: 700px) 100vw, 400px" style={{ objectFit: "cover" }} />
                  <span className="chip" style={{ position: "absolute", top: "0.9rem", left: "0.9rem" }}>{d.trade}</span>
                </div>
                <div style={{ padding: "1.3rem 1.5rem 1.5rem" }}>
                  <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.8rem" }}>
                    {d.swatches.map((s) => <span key={s} style={{ width: "1.3rem", height: "1.3rem", borderRadius: "0.4rem", background: s, border: "1px solid var(--border)" }} />)}
                  </div>
                  <h2 className="d-md" style={{ margin: "0 0 0.15rem" }}>{d.business}</h2>
                  <p style={{ color: "var(--ink-muted)", margin: "0 0 0.9rem", fontWeight: 500 }}>{d.city}</p>
                  <p style={{ color: "var(--ink-dim)", margin: "0 0 1.2rem" }}>{d.tagline}</p>
                  <span className="link-arrow">{t.demoIndex.visit} <ArrowUpRight size={18} /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
