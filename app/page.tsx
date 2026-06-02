"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Check, Clock, Compass,
  PenTool, Rocket, Sparkles, Star, Store, Wrench,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import Testimonials from "@/components/Testimonials";
import { getDemos } from "@/lib/demos";
import { useLang } from "@/lib/lang-context";

const INCLUDED_ICONS = [PenTool, Store, Clock, Compass, Wrench, Rocket];

export default function Home() {
  const { lang, t } = useLang();
  const demos = getDemos(lang);

  return (
    <>
      <SiteNav />
      <main>
        {/* ─── HERO ──────────────────────────────────────────── */}
        <section className="grain" style={{ position: "relative", paddingTop: "6.8rem", paddingBottom: "clamp(3rem, 6vw, 5rem)", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", top: "-12%", right: "-8%", width: "46rem", height: "46rem", maxWidth: "100vw", borderRadius: "50%", background: "radial-gradient(circle, oklch(0.605 0.2 33 / 0.10), transparent 62%)", pointerEvents: "none" }} />
          <div className="wrap" style={{ position: "relative" }}>
            <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(2.2rem, 5vw, 4.5rem)", alignItems: "center" }}>
              <div>
                <Reveal><span className="chip chip-accent" style={{ marginBottom: "1.4rem" }}><Sparkles size={15} /> {t.hero.badge}</span></Reveal>
                <Reveal delay={70}>
                  <h1 className="d-hero" style={{ margin: "0 0 1.3rem" }}>
                    {t.hero.titleLead} <span className="serif-accent" style={{ color: "var(--vermilion-deep)" }}>{t.hero.titleAccent}</span>
                  </h1>
                </Reveal>
                <Reveal delay={140}>
                  <p style={{ fontSize: "clamp(1.02rem, 1.5vw, 1.22rem)", color: "var(--ink-dim)", maxWidth: "47ch", margin: "0 0 2rem" }}>{t.hero.lead}</p>
                </Reveal>
                <Reveal delay={210}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                    <a href="#metiers" className="btn btn-primary btn-lg">{t.hero.ctaPrimary} <ArrowRight size={18} /></a>
                    <a href="#contact" className="btn btn-ghost btn-lg">{t.hero.ctaSecondary}</a>
                  </div>
                </Reveal>
                <Reveal delay={290}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "2.1rem", color: "var(--ink-muted)", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", gap: "2px", color: "var(--clay-deep)" }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill="currentColor" stroke="none" />)}</div>
                    <span>{t.hero.rating}</span>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={180}>
                <div className="hero-visual" style={{ position: "relative", maxWidth: "560px", marginInline: "auto", width: "100%" }}>
                  <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: "1.4rem", overflow: "hidden", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-lg)" }}>
                    <Image src="/studio/hero-desk.webp" alt={t.hero.heroAlt} fill priority sizes="(max-width: 1000px) 92vw, 520px" style={{ objectFit: "cover", objectPosition: "center" }} />
                  </div>
                  <div className="hero-chip hero-chip-bl card" style={{ position: "absolute", bottom: "-1.2rem", left: "-0.9rem", padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", boxShadow: "var(--shadow)" }}>
                    <span style={{ width: "2rem", height: "2rem", borderRadius: "0.6rem", display: "grid", placeItems: "center", background: "var(--vermilion-soft)", color: "var(--vermilion-deep)", flexShrink: 0 }}><Clock size={16} /></span>
                    <div style={{ lineHeight: 1.15 }}><strong style={{ fontSize: "0.9rem" }}>{t.hero.chipDemoTitle}</strong><div style={{ fontSize: "0.74rem", color: "var(--ink-muted)" }}>{t.hero.chipDemoSub}</div></div>
                  </div>
                  <div className="hero-chip hero-chip-tr card" style={{ position: "absolute", top: "-1.1rem", right: "-0.5rem", padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", boxShadow: "var(--shadow)" }}>
                    <span style={{ width: "2rem", height: "2rem", borderRadius: "0.6rem", display: "grid", placeItems: "center", background: "var(--ink)", color: "var(--paper)", flexShrink: 0 }}><PenTool size={15} /></span>
                    <div style={{ lineHeight: 1.15 }}><strong style={{ fontSize: "0.9rem" }}>{t.hero.chipCraftTitle}</strong><div style={{ fontSize: "0.74rem", color: "var(--ink-muted)" }}>{t.hero.chipCraftSub}</div></div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─── VALUE ─────────────────────────────────────────── */}
        <section style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)", background: "var(--paper-2)", borderTop: "1px solid var(--border)" }}>
          <div className="wrap">
            <div className="pitch-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(1.6rem, 4vw, 5rem)", alignItems: "end" }}>
              <Reveal><span className="kicker" style={{ marginBottom: "1.1rem" }}>{t.value.kicker}</span><h2 className="d-xl" style={{ margin: 0 }}>{t.value.title}</h2></Reveal>
              <Reveal delay={120}><p style={{ fontSize: "clamp(1.02rem, 1.4vw, 1.12rem)", color: "var(--ink-dim)", margin: 0 }}>{t.value.body}</p></Reveal>
            </div>
            <div className="figures" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0", marginTop: "clamp(2.2rem, 5vw, 4rem)", borderTop: "1px solid var(--border)" }}>
              {t.value.figures.map((f, i) => (
                <Reveal key={i} delay={i * 90}>
                  <div className="figure-item" style={{ padding: "1.6rem 1.3rem 0.4rem", borderLeft: i === 0 ? "none" : "1px solid var(--border)" }}>
                    <div className="d-xl" style={{ color: "var(--vermilion-deep)", lineHeight: 1 }}>{f.n}</div>
                    <p style={{ color: "var(--ink-dim)", margin: "0.7rem 0 0", maxWidth: "32ch" }}>{f.l}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── POUR QUI ──────────────────────────────────────── */}
        <section id="pour-qui" style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)", borderTop: "1px solid var(--border)" }}>
          <div className="wrap">
            <Reveal>
              <div style={{ maxWidth: "62ch", marginBottom: "clamp(2.2rem, 5vw, 3.5rem)" }}>
                <span className="kicker" style={{ marginBottom: "1rem" }}>{t.audience.kicker}</span>
                <h2 className="d-xl" style={{ margin: "0 0 1rem" }}>{t.audience.title}</h2>
                <p style={{ fontSize: "1.08rem", color: "var(--ink-dim)", margin: 0 }}>{t.audience.body}</p>
              </div>
            </Reveal>
            <div className="audience-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "clamp(1.1rem, 2.5vw, 1.6rem)" }}>
              {t.audience.items.map((a, i) => (
                <Reveal key={a.n} delay={(i % 4) * 80}>
                  <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column", padding: "1.6rem 1.5rem 1.7rem" }}>
                    <div className="d-lg" style={{ color: "var(--vermilion)", fontFamily: "var(--font-display)", margin: "0 0 1rem", letterSpacing: "0.02em" }}>{a.n}</div>
                    <h3 className="d-md" style={{ margin: "0 0 0.55rem" }}>{a.t}</h3>
                    <p style={{ color: "var(--ink-dim)", margin: 0 }}>{a.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── MÉTIERS ───────────────────────────────────────── */}
        <section id="metiers" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--paper-2)", borderTop: "1px solid var(--border)" }}>
          <div className="wrap">
            <Reveal>
              <div style={{ maxWidth: "62ch", marginBottom: "clamp(2.2rem, 5vw, 3.5rem)" }}>
                <span className="kicker" style={{ marginBottom: "1rem" }}>{t.metiers.kicker}</span>
                <h2 className="d-xl" style={{ margin: "0 0 1rem" }}>{t.metiers.title}</h2>
                <p style={{ fontSize: "1.08rem", color: "var(--ink-dim)", margin: 0 }}>{t.metiers.body}</p>
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 288px), 1fr))", gap: "clamp(1.1rem, 2.5vw, 1.8rem)" }}>
              {demos.map((d, i) => (
                <Reveal key={d.slug} delay={(i % 2) * 80}>
                  <Link href={`/demo/${d.slug}`} className="card card-hover" style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
                    <div style={{ position: "relative", aspectRatio: "16 / 9" }}>
                      <Image src={d.cover} alt={t.metiers.cardAlt(d.trade, d.business)} fill sizes="(max-width: 700px) 100vw, 380px" style={{ objectFit: "cover", objectPosition: "center" }} />
                      <span className="chip" style={{ position: "absolute", top: "0.85rem", left: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        <Check size={13} strokeWidth={3} style={{ color: "var(--vermilion-deep)" }} /> {t.metiers.highlight[d.slug]}
                      </span>
                    </div>
                    <div style={{ padding: "1.4rem 1.5rem 1.6rem", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h3 className="d-lg" style={{ margin: "0 0 0.5rem" }}>{d.trade}</h3>
                      <p style={{ color: "var(--ink-dim)", margin: "0 0 1.3rem", flex: 1 }}>{d.tagline}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "1.05rem" }}>
                        <span style={{ fontSize: "0.82rem", color: "var(--ink-muted)" }}>{t.metiers.example} {d.business} · {d.city}</span>
                        <span className="link-arrow" style={{ fontSize: "0.95rem" }}>{t.metiers.seePage} <ArrowUpRight size={17} /></span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <Reveal delay={120}>
              <p style={{ textAlign: "center", marginTop: "2.4rem", color: "var(--ink-muted)" }}>
                {t.metiers.notListed} <a href="#contact" className="link-arrow" style={{ display: "inline-flex" }}>{t.metiers.talk} <ArrowRight size={15} /></a>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── INCLUDED ──────────────────────────────────────── */}
        <section style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)", background: "var(--ink)", color: "var(--paper)" }}>
          <div className="wrap">
            <Reveal><span className="kicker" style={{ marginBottom: "1.1rem", color: "var(--clay)" }}>{t.included.kicker}</span><h2 className="d-xl" style={{ margin: "0 0 2.6rem", maxWidth: "20ch" }}>{t.included.title}</h2></Reveal>
            <div className="incl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(2rem, 4vw, 3rem)" }}>
              {t.included.items.map((s, i) => {
                const Icon = INCLUDED_ICONS[i];
                return (
                  <Reveal key={i} delay={(i % 3) * 80}>
                    <div>
                      <span style={{ display: "inline-grid", placeItems: "center", width: "2.8rem", height: "2.8rem", borderRadius: "0.8rem", background: "oklch(0.97 0.01 80 / 0.08)", color: "var(--clay)", marginBottom: "1.1rem" }}><Icon size={22} /></span>
                      <h3 className="d-md" style={{ margin: "0 0 0.5rem", color: "var(--paper)" }}>{s.t}</h3>
                      <p style={{ color: "oklch(0.84 0.01 80)", margin: 0, maxWidth: "34ch" }}>{s.d}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── METHOD ────────────────────────────────────────── */}
        <section id="methode" style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)", borderTop: "1px solid var(--border)" }}>
          <div className="wrap">
            <Reveal><div style={{ maxWidth: "56ch", marginBottom: "clamp(2.2rem, 5vw, 3.5rem)" }}><span className="kicker" style={{ marginBottom: "1.1rem" }}>{t.method.kicker}</span><h2 className="d-xl" style={{ margin: 0 }}>{t.method.title}</h2></div></Reveal>
            <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0" }}>
              {t.method.steps.map((s, i) => (
                <Reveal key={i} delay={i * 90}>
                  <div className="step-item" style={{ padding: "0 1.3rem", borderLeft: i === 0 ? "none" : "1px solid var(--border)", height: "100%" }}>
                    <div className="d-lg" style={{ color: "var(--vermilion)", margin: "0 0 1rem", fontFamily: "var(--font-display)" }}>{s.n}</div>
                    <h3 className="d-md" style={{ margin: "0 0 0.5rem" }}>{s.t}</h3>
                    <p style={{ color: "var(--ink-dim)", margin: 0 }}>{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TÉMOIGNAGES ───────────────────────────────────── */}
        <Testimonials />

        {/* ─── PRICING ───────────────────────────────────────── */}
        <section id="tarifs" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", borderTop: "1px solid var(--border)" }}>
          <div className="wrap">
            <Reveal>
              <div style={{ maxWidth: "56ch", marginBottom: "clamp(2.2rem, 5vw, 3.5rem)" }}>
                <span className="kicker" style={{ marginBottom: "1.1rem" }}>{t.pricing.kicker}</span>
                <h2 className="d-xl" style={{ margin: "0 0 1rem" }}>{t.pricing.title}</h2>
                <p style={{ fontSize: "1.08rem", color: "var(--ink-dim)", margin: 0 }}>{t.pricing.body}</p>
              </div>
            </Reveal>
            <div className="price-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.3rem", alignItems: "stretch" }}>
              {t.pricing.plans.map((p, i) => {
                const featured = p.featured;
                return (
                  <Reveal key={i} delay={i * 90}>
                    <div className="price-card" style={{ height: "100%", display: "flex", flexDirection: "column", padding: "1.8rem 1.6rem", borderRadius: "var(--r-lg)", border: `1px solid ${featured ? "var(--ink)" : "var(--border)"}`, background: featured ? "var(--ink)" : "var(--surface)", color: featured ? "var(--paper)" : "var(--ink)", transform: featured ? "translateY(-0.6rem)" : "none", boxShadow: featured ? "var(--shadow-lg)" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", minHeight: "1.6rem", gap: "0.5rem", flexWrap: "wrap" }}>
                        <h3 className="d-md" style={{ margin: 0, color: featured ? "var(--paper)" : "var(--ink)" }}>{p.name}</h3>
                        {featured && <span className="chip" style={{ background: "var(--vermilion)", color: "var(--surface)", border: "none" }}>{t.pricing.mostChosen}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "1.4rem", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2.3rem", letterSpacing: "-0.03em", color: featured ? "var(--clay)" : "var(--vermilion-deep)" }}>{p.price}</span>
                        <span style={{ color: featured ? "oklch(0.82 0.01 80)" : "var(--ink-muted)", fontSize: "0.9rem" }}>{p.sub}</span>
                      </div>
                      <ul style={{ listStyle: "none", margin: "0 0 1.7rem", padding: 0, display: "grid", gap: "0.7rem", flex: 1 }}>
                        {p.feats.map((f) => (
                          <li key={f} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", color: featured ? "oklch(0.88 0.01 80)" : "var(--ink-dim)" }}>
                            <Check size={17} strokeWidth={2.6} style={{ flexShrink: 0, marginTop: "0.15rem", color: featured ? "var(--clay)" : "var(--vermilion)" }} /><span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <a href="#contact" className={featured ? "btn btn-accent" : "btn btn-ghost"} style={{ width: "100%" }}>{p.cta}</a>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── OPTIONS / ADD-ONS ─────────────────────────────── */}
        <section id="options" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--paper-2)", borderTop: "1px solid var(--border)" }}>
          <div className="wrap">
            <Reveal>
              <div style={{ maxWidth: "56ch", marginBottom: "clamp(2rem, 5vw, 3.2rem)" }}>
                <span className="kicker" style={{ marginBottom: "1rem" }}>{t.addons.kicker}</span>
                <h2 className="d-xl" style={{ margin: "0 0 1rem" }}>{t.addons.title}</h2>
                <p style={{ fontSize: "1.08rem", color: "var(--ink-dim)", margin: 0 }}>{t.addons.body}</p>
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "0.9rem" }}>
              {t.addons.items.map((a, i) => (
                <Reveal key={a.name} delay={(i % 3) * 70}>
                  <div className="card" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", padding: "1.1rem 1.35rem", height: "100%" }}>
                    <span style={{ fontWeight: 500 }}>{a.name}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--vermilion-deep)", whiteSpace: "nowrap" }}>{a.price}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={120}>
              <p style={{ marginTop: "1.6rem", color: "var(--ink-muted)", fontSize: "0.85rem" }}>{t.addons.note}</p>
            </Reveal>
          </div>
        </section>

        {/* ─── FAQ ───────────────────────────────────────────── */}
        <section id="faq" style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)", borderTop: "1px solid var(--border)" }}>
          <div className="wrap wrap-tight">
            <Reveal><div style={{ marginBottom: "clamp(1.8rem, 4vw, 3rem)" }}><span className="kicker" style={{ marginBottom: "1.1rem" }}>{t.faq.kicker}</span><h2 className="d-xl" style={{ margin: 0 }}>{t.faq.title}</h2></div></Reveal>
            <Reveal delay={100}><Faq /></Reveal>
          </div>
        </section>

        {/* ─── CTA ───────────────────────────────────────────── */}
        <section id="contact" style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)", background: "var(--paper-2)", borderTop: "1px solid var(--border)" }}>
          <div className="wrap">
            <Reveal>
              <div className="grain" style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r-xl)", background: "var(--vermilion-deep)", color: "var(--surface)", padding: "clamp(2.2rem, 6vw, 4.5rem)" }}>
                <div aria-hidden style={{ position: "absolute", top: "-30%", right: "-10%", width: "30rem", height: "30rem", maxWidth: "100vw", borderRadius: "50%", background: "radial-gradient(circle, oklch(0.74 0.11 66 / 0.4), transparent 60%)" }} />
                <div style={{ position: "relative", maxWidth: "42ch" }}>
                  <h2 className="d-xl" style={{ margin: "0 0 1.1rem", color: "var(--surface)" }}>{t.cta.title}</h2>
                  <p style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.15rem)", color: "oklch(0.96 0.02 40)", margin: "0 0 2rem" }}>{t.cta.body}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                    <a href="mailto:bonjour@atelier-vitrine.fr" className="btn btn-lg" style={{ background: "var(--surface)", color: "var(--ink)" }}>{t.cta.primary} <ArrowRight size={18} /></a>
                    <a href="tel:+33100000000" className="btn btn-lg btn-ghost" style={{ color: "var(--surface)", borderColor: "oklch(1 0 0 / 0.4)" }}>{t.cta.secondary}</a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        @media (max-width: 980px) { .hero-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 820px) { .pitch-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 700px) and (max-width: 1024px) { .incl-grid { grid-template-columns: 1fr 1fr !important; } .steps-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 1000px) { .audience-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .audience-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 760px) {
          .figures { grid-template-columns: 1fr !important; }
          .figure-item { border-left: none !important; border-top: 1px solid var(--border); }
          .figure-item:first-child { border-top: none; }
        }
        @media (max-width: 700px) { .incl-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .step-item { border-left: none !important; padding: 0 0 1.4rem !important; }
        }
        @media (max-width: 900px) { .price-grid { grid-template-columns: 1fr !important; max-width: 30rem; margin-inline: auto; } .price-card { transform: none !important; } }
        @media (max-width: 540px) {
          .hero-chip-bl { left: 0.4rem !important; bottom: -0.9rem !important; }
          .hero-chip-tr { right: 0.4rem !important; top: -0.9rem !important; }
        }
      `}</style>
    </>
  );
}
