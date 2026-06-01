import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Clock, MapPin, Phone, Star,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import { VITRINES, VITRINE_SLUGS } from "@/lib/vitrineContent";

export function generateStaticParams() {
  return VITRINE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = VITRINES[slug];
  if (!v) return {};
  return {
    title: `${v.business} · Démo ${v.trade}`,
    description: `${v.heroLead} Vitrine de démonstration réalisée par Atelier Vitrine.`,
  };
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = VITRINES[slug];
  if (!v) notFound();

  const darkWorld = v.vit === "barber" || v.vit === "resto";

  return (
    <div data-vit={v.vit} style={{ fontFamily: "var(--vit-body)", minHeight: "100dvh" }}>
      {/* Ribbon: it's a live demo */}
      <div className="demo-ribbon">
        <Link href="/#demos" className="back">
          <ArrowLeft size={16} /> Toutes les démos
        </Link>
        <span style={{ opacity: 0.75, display: "none" }} className="ribbon-mid">
          Démonstration : votre vitrine pourrait ressembler à ça
        </span>
        <Link href="/#contact" className="cta">
          Je veux la mienne <ArrowRight size={14} />
        </Link>
      </div>

      {/* Local nav */}
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.4rem" }}>
          <span className="vit-display" style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: v.vit === "barber" ? "0.04em" : "-0.01em", textTransform: v.vit === "barber" ? "uppercase" : "none" }}>
            {v.business}
          </span>
          <nav style={{ display: "flex", alignItems: "center", gap: "1.6rem", fontSize: "0.9rem" }} className="vit-nav">
            <a href="#carte" className="vit-navlink">La carte</a>
            <a href="#lieu" className="vit-navlink">Le lieu</a>
            <a href="#artisan" className="vit-navlink">L'artisan</a>
            <a href="#reserver" className="vit-btn" style={{ padding: "0.55rem 1.1rem" }}>{v.primaryCta}</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ paddingBlock: "clamp(2.5rem, 5vw, 4.5rem)" }}>
        <div className="wrap">
          <div className="demo-hero" style={{ display: "grid", gridTemplateColumns: v.vit === "onglerie" ? "1fr 1.05fr" : "1.05fr 1fr", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "center" }}>
            <Reveal style={{ order: v.vit === "onglerie" ? 2 : 1 } as React.CSSProperties}>
              <span className="vit-kicker" style={{ marginBottom: "1.3rem" }}>{v.kicker}</span>
              <h1 className="vit-display" style={{ fontSize: "clamp(2.4rem, 6vw, 4.6rem)", lineHeight: v.vit === "barber" ? 0.95 : 1.02, letterSpacing: v.vit === "barber" ? "0.01em" : "-0.025em", margin: "0 0 1.3rem", textTransform: v.vit === "barber" ? "uppercase" : "none" }}>
                {v.heroTitle}
              </h1>
              <p style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)", color: "var(--fg-dim)", maxWidth: "46ch", margin: "0 0 2rem" }}>
                {v.heroLead}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", alignItems: "center" }}>
                <a href="#reserver" className="vit-btn">{v.primaryCta}</a>
                <a href="#carte" className="vit-btn vit-btn-outline">{v.secondaryCta}</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginTop: "1.8rem" }}>
                <div style={{ display: "flex", gap: "1px", color: "var(--accent)" }}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" stroke="none" />)}
                </div>
                <span style={{ fontSize: "0.92rem", color: "var(--fg-dim)" }}>
                  <strong style={{ color: "var(--fg)" }}>{v.rating}/5</strong> · {v.ratingMeta}
                </span>
              </div>
            </Reveal>

            <Reveal delay={120} style={{ order: v.vit === "onglerie" ? 1 : 2 } as React.CSSProperties}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: "1.4rem", overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 30px 70px oklch(0 0 0 / 0.25)" }}>
                  <Image src={v.cover} alt={`${v.business}, ${v.trade}`} fill priority sizes="(max-width: 820px) 92vw, 540px" style={{ objectFit: "cover" }} />
                </div>
                <div className="vit-card" style={{ position: "absolute", bottom: "-1.3rem", left: v.vit === "onglerie" ? "auto" : "-1.3rem", right: v.vit === "onglerie" ? "-1.3rem" : "auto", padding: "0.8rem 1.1rem", display: "flex", alignItems: "center", gap: "0.7rem" }}>
                  <Clock size={18} style={{ color: "var(--accent)" }} />
                  <div style={{ lineHeight: 1.2, fontSize: "0.85rem" }}>
                    <strong>Ouvert aujourd'hui</strong>
                    <div style={{ color: "var(--fg-dim)" }}>{v.hours}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* INFO STRIP */}
      <section style={{ borderBlock: "1px solid var(--line)", background: "var(--bg-2)" }}>
        <div className="wrap">
          <div className="info-strip" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              { icon: MapPin, label: "Adresse", value: v.address },
              { icon: Clock, label: "Horaires", value: v.hours },
              { icon: Phone, label: "Téléphone", value: v.phone },
            ].map((it, i) => (
              <div key={i} style={{ display: "flex", gap: "0.8rem", alignItems: "center", padding: "1.3rem 1.2rem", borderLeft: i === 0 ? "none" : "1px solid var(--line)" }}>
                <span style={{ flexShrink: 0, width: "2.4rem", height: "2.4rem", borderRadius: "0.7rem", display: "grid", placeItems: "center", background: "var(--surf)", color: "var(--accent)", border: "1px solid var(--line)" }}>
                  <it.icon size={18} />
                </span>
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: "0.74rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-dim)" }}>{it.label}</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{it.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARTE / SERVICES */}
      <section id="carte" style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <Reveal>
            <span className="vit-kicker" style={{ marginBottom: "1rem" }}>{v.servicesTitle}</span>
            <h2 className="vit-display" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: v.vit === "barber" ? "0.01em" : "-0.02em", margin: "0 0 2.5rem", textTransform: v.vit === "barber" ? "uppercase" : "none" }}>
              {v.galleryTitle.includes("carte") ? "Choisissez, on s'occupe du reste" : "Ce qu'on vous propose"}
            </h2>
          </Reveal>
          <div className="menu-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "start" }}>
            <div style={{ display: "grid", gap: "0" }}>
              {v.services.map((s, i) => (
                <Reveal key={i} delay={i * 50}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem", alignItems: "baseline", padding: "1.15rem 0", borderTop: i === 0 ? "1px solid var(--line)" : "none", borderBottom: "1px solid var(--line)" }}>
                    <div>
                      <h3 className="vit-display" style={{ fontSize: "1.2rem", margin: "0 0 0.2rem", letterSpacing: "-0.005em" }}>{s.name}</h3>
                      <p style={{ margin: 0, color: "var(--fg-dim)", fontSize: "0.95rem", maxWidth: "48ch" }}>{s.desc}</p>
                    </div>
                    <span className="vit-display" style={{ fontSize: "1.15rem", color: "var(--accent)", whiteSpace: "nowrap" }}>{s.price}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={120}>
              <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: "1.3rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                <Image src={v.detail} alt={`Détail · ${v.business}`} fill sizes="(max-width: 820px) 92vw, 420px" style={{ objectFit: "cover" }} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* GALLERY / LIEU */}
      <section id="lieu" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ maxWidth: "56ch", marginBottom: "2.5rem" }}>
              <span className="vit-kicker" style={{ marginBottom: "1rem" }}>Le lieu</span>
              <h2 className="vit-display" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: v.vit === "barber" ? "0.01em" : "-0.02em", margin: "0 0 0.9rem", textTransform: v.vit === "barber" ? "uppercase" : "none" }}>{v.galleryTitle}</h2>
              <p style={{ color: "var(--fg-dim)", fontSize: "1.05rem", margin: 0 }}>{v.galleryLead}</p>
            </div>
          </Reveal>
          <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gridTemplateRows: "auto auto", gap: "1rem" }}>
            <Reveal className="g-main" style={{ gridRow: "1 / 3" } as React.CSSProperties}>
              <div style={{ position: "relative", height: "100%", minHeight: "20rem", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                <Image src={v.scene} alt={`Intérieur · ${v.business}`} fill sizes="(max-width: 820px) 92vw, 640px" style={{ objectFit: "cover" }} />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                <Image src={v.detail} alt={`Détail · ${v.business}`} fill sizes="(max-width: 820px) 92vw, 360px" style={{ objectFit: "cover" }} />
              </div>
            </Reveal>
            <Reveal delay={140}>
              <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                <Image src={v.portrait} alt={`${v.artisanName} · ${v.business}`} fill sizes="(max-width: 820px) 92vw, 360px" style={{ objectFit: "cover" }} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ARTISAN + CONTACT SHEET */}
      <section id="artisan" style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <div className="artisan-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "center" }}>
            <Reveal>
              <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: "1.4rem", overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 24px 60px oklch(0 0 0 / 0.22)" }}>
                <Image src={v.portrait} alt={`${v.artisanName}, ${v.artisanRole}`} fill sizes="(max-width: 820px) 92vw, 460px" style={{ objectFit: "cover" }} />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <span className="vit-kicker" style={{ marginBottom: "1rem" }}>L'artisan</span>
              <h2 className="vit-display" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: v.vit === "barber" ? "0.01em" : "-0.02em", margin: "0 0 0.4rem", textTransform: v.vit === "barber" ? "uppercase" : "none" }}>{v.artisanName}</h2>
              <p style={{ color: "var(--accent)", fontWeight: 600, margin: "0 0 1.5rem" }}>{v.artisanRole}</p>
              {v.artisanBio.map((p, i) => (
                <p key={i} style={{ color: "var(--fg-dim)", fontSize: "1.05rem", margin: "0 0 1rem", maxWidth: "52ch" }}>{p}</p>
              ))}

              <figure style={{ margin: "1.8rem 0 0" }}>
                <div style={{ position: "relative", aspectRatio: "3 / 2", borderRadius: "1rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                  <Image src={v.sheet} alt={`${v.artisanName} sous tous les angles, planche-contact`} fill sizes="(max-width: 820px) 92vw, 520px" style={{ objectFit: "cover" }} />
                </div>
                <figcaption style={{ marginTop: "0.7rem", fontSize: "0.85rem", color: "var(--fg-dim)", fontStyle: "italic" }}>
                  Le même accueil, quel que soit l'angle. Imagerie réalisée sur-mesure pour la vitrine.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap", marginBottom: "2.2rem" }}>
              <h2 className="vit-display" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)", letterSpacing: v.vit === "barber" ? "0.01em" : "-0.02em", margin: 0, textTransform: v.vit === "barber" ? "uppercase" : "none" }}>Ils en parlent mieux que nous</h2>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--accent)" }}>
                <Star size={17} fill="currentColor" stroke="none" /> <strong style={{ color: "var(--fg)" }}>{v.rating}</strong>
                <span style={{ color: "var(--fg-dim)" }}>· {v.ratingMeta}</span>
              </span>
            </div>
          </Reveal>
          <div className="reviews-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.2rem" }}>
            {v.reviews.map((r, i) => (
              <Reveal key={i} delay={i * 80}>
                <figure className="vit-card" style={{ height: "100%", margin: 0, padding: "1.6rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "1px", color: "var(--accent)" }}>
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={15} fill="currentColor" stroke="none" />)}
                  </div>
                  <blockquote style={{ margin: 0, fontSize: "1.02rem", lineHeight: 1.6, flex: 1 }}>« {r.text} »</blockquote>
                  <figcaption style={{ fontSize: "0.88rem" }}>
                    <strong>{r.author}</strong>
                    <span style={{ color: "var(--fg-dim)" }}> · {r.meta}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING / RESERVER */}
      <section id="reserver" style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ position: "relative", overflow: "hidden", borderRadius: "1.8rem", border: "1px solid var(--line)" }}>
              <Image src={v.scene} alt="" fill sizes="100vw" style={{ objectFit: "cover", opacity: darkWorld ? 0.32 : 0.18 }} />
              <div style={{ position: "absolute", inset: 0, background: darkWorld ? "linear-gradient(180deg, oklch(0 0 0 / 0.55), oklch(0 0 0 / 0.7))" : "linear-gradient(180deg, var(--bg) , oklch(1 0 0 / 0.55))" }} />
              <div style={{ position: "relative", padding: "clamp(2.5rem, 6vw, 4.5rem)", textAlign: "center", maxWidth: "44ch", marginInline: "auto" }}>
                <h2 className="vit-display" style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", letterSpacing: v.vit === "barber" ? "0.01em" : "-0.025em", margin: "0 0 1rem", textTransform: v.vit === "barber" ? "uppercase" : "none" }}>{v.closingTitle}</h2>
                <p style={{ color: "var(--fg-dim)", fontSize: "1.1rem", margin: "0 0 2rem" }}>{v.closingLead}</p>
                <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <a href={`tel:${v.phone.replace(/\s/g, "")}`} className="vit-btn">{v.primaryCta}</a>
                  <a href="#carte" className="vit-btn vit-btn-outline">{v.secondaryCta}</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DEMO FOOTER */}
      <footer style={{ borderTop: "1px solid var(--line)", paddingBlock: "2.5rem" }}>
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "1.2rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ maxWidth: "52ch" }}>
            <span className="vit-display" style={{ fontSize: "1.1rem", fontWeight: 700 }}>{v.business}</span>
            <p style={{ margin: "0.3rem 0 0", color: "var(--fg-dim)", fontSize: "0.92rem" }}>
              Vitrine de démonstration. Le commerce est fictif, le savoir-faire ne l'est pas.
            </p>
          </div>
          <Link href="/#contact" className="vit-btn">
            Créer ma vitrine avec Atelier Vitrine <ArrowUpRight size={16} />
          </Link>
        </div>
      </footer>

      <style>{`
        .vit-navlink { color: var(--fg-dim); transition: color 0.18s var(--ease); }
        .vit-navlink:hover { color: var(--accent); }
        @media (max-width: 820px) {
          .demo-hero, .menu-grid, .artisan-grid { grid-template-columns: 1fr !important; }
          .demo-hero > *, .gallery-grid .g-main { order: 0 !important; grid-row: auto !important; }
          .info-strip { grid-template-columns: 1fr !important; }
          .info-strip > div { border-left: none !important; border-top: 1px solid var(--line); }
          .info-strip > div:first-child { border-top: none; }
          .gallery-grid, .reviews-grid { grid-template-columns: 1fr !important; }
          .vit-nav a:not(.vit-btn) { display: none; }
        }
      `}</style>
    </div>
  );
}
