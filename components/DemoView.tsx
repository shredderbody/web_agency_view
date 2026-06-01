"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, MapPin, Phone, Star } from "lucide-react";
import Reveal from "@/components/Reveal";
import LangSelector from "@/components/LangSelector";
import { useLang } from "@/lib/lang-context";
import { getVitrine } from "@/lib/vitrineContent";

export default function DemoView({ slug }: { slug: string }) {
  const { lang, t } = useLang();
  const [menu, setMenu] = useState(false);
  const v = getVitrine(lang, slug);
  if (!v) return null;
  const c = t.demoCommon;
  const dark = v.vit === "barber" || v.vit === "resto";
  const isBarber = v.vit === "barber";
  const tt = (s: string) => (isBarber ? s.toUpperCase() : s);
  const ls = isBarber ? "0.01em" : "-0.02em";

  const navLinks = [
    { href: "#carte", label: c.navCard },
    { href: "#lieu", label: c.navPlace },
    { href: "#artisan", label: c.navArtisan },
  ];

  return (
    <div data-vit={v.vit} style={{ fontFamily: "var(--vit-body)", minHeight: "100dvh" }}>
      {/* Ribbon */}
      <div className="demo-ribbon">
        <Link href="/#metiers" className="back"><ArrowLeft size={16} /> {c.allDemos}</Link>
        <span className="ribbon-mid" style={{ opacity: 0.78 }}>{c.isDemoBanner}</span>
        <Link href="/#contact" className="cta">{c.wantMine} <ArrowRight size={14} /></Link>
      </div>

      {/* Local header */}
      <header style={{ borderBottom: "1px solid var(--line)", position: "relative", zIndex: 30 }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.3rem", gap: "1rem" }}>
          <span className="vit-display" style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: ls, textTransform: isBarber ? "uppercase" : "none", whiteSpace: "nowrap" }}>{v.business}</span>
          <nav className="vit-nav-desktop" style={{ display: "none", alignItems: "center", gap: "1.5rem", fontSize: "0.9rem" }}>
            {navLinks.map((l) => <a key={l.href} href={l.href} className="vit-navlink">{l.label}</a>)}
            <LangSelector tone={dark ? "dark" : "light"} />
            <a href="#reserver" className="vit-btn" style={{ padding: "0.55rem 1.1rem" }}>{v.primaryCta}</a>
          </nav>
          <button
            className="vit-burger" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((x) => !x)}
            style={{ display: "inline-flex", background: "transparent", border: "1px solid var(--line)", borderRadius: "0.6rem", width: "2.6rem", height: "2.6rem", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--fg)", flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menu ? (<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>) : (<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>)}
            </svg>
          </button>
        </div>
        {/* Mobile drawer */}
        <div className="vit-drawer" style={{ overflow: "hidden", maxHeight: menu ? "24rem" : 0, transition: "max-height 0.34s var(--ease)", borderTop: menu ? "1px solid var(--line)" : "none", background: "var(--bg-2)" }}>
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: "0.1rem", padding: menu ? "0.6rem 0 1.2rem" : 0 }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="vit-display" style={{ padding: "0.8rem 0.3rem", fontSize: "1.15rem", borderBottom: "1px solid var(--line)" }}>{l.label}</a>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
              <LangSelector tone={dark ? "dark" : "light"} />
              <a href="#reserver" onClick={() => setMenu(false)} className="vit-btn">{v.primaryCta}</a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ paddingBlock: "clamp(2.4rem, 5vw, 4.5rem)" }}>
        <div className="wrap">
          <div className="demo-hero" style={{ display: "grid", gridTemplateColumns: v.vit === "onglerie" ? "1fr 1.05fr" : "1.05fr 1fr", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "center" }}>
            <Reveal style={{ order: v.vit === "onglerie" ? 2 : 1 }}>
              <span className="vit-kicker" style={{ marginBottom: "1.2rem" }}>{v.kicker}</span>
              <h1 className="vit-display" style={{ fontSize: "clamp(2.2rem, 6vw, 4.4rem)", lineHeight: isBarber ? 0.96 : 1.03, letterSpacing: ls, margin: "0 0 1.3rem", textTransform: isBarber ? "uppercase" : "none" }}>{v.heroTitle}</h1>
              <p style={{ fontSize: "clamp(1.02rem, 1.4vw, 1.18rem)", color: "var(--fg-dim)", maxWidth: "46ch", margin: "0 0 2rem" }}>{v.heroLead}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", alignItems: "center" }}>
                <a href="#reserver" className="vit-btn">{v.primaryCta}</a>
                <a href="#carte" className="vit-btn vit-btn-outline">{v.secondaryCta}</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginTop: "1.7rem" }}>
                <div style={{ display: "flex", gap: "1px", color: "var(--accent)" }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" stroke="none" />)}</div>
                <span style={{ fontSize: "0.9rem", color: "var(--fg-dim)" }}><strong style={{ color: "var(--fg)" }}>{v.rating}/5</strong> · {v.ratingMeta}</span>
              </div>
            </Reveal>
            <Reveal delay={120} style={{ order: v.vit === "onglerie" ? 1 : 2 }}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: "1.4rem", overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 30px 70px oklch(0 0 0 / 0.25)" }}>
                  <Image src={v.cover} alt={`${v.business}, ${v.trade}`} fill priority sizes="(max-width: 860px) 92vw, 540px" style={{ objectFit: "cover" }} />
                </div>
                <div className="vit-card hero-badge" style={{ position: "absolute", bottom: "-1.1rem", left: v.vit === "onglerie" ? "auto" : "-1rem", right: v.vit === "onglerie" ? "-1rem" : "auto", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Clock size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <div style={{ lineHeight: 1.2, fontSize: "0.82rem" }}><strong>{c.openToday}</strong><div style={{ color: "var(--fg-dim)" }}>{v.hours}</div></div>
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
            {[{ icon: MapPin, label: c.addressLabel, value: v.address }, { icon: Clock, label: c.hoursLabel, value: v.hours }, { icon: Phone, label: c.phoneLabel, value: v.phone }].map((it, i) => (
              <div key={i} className="info-item" style={{ display: "flex", gap: "0.8rem", alignItems: "center", padding: "1.25rem 1.1rem", borderLeft: i === 0 ? "none" : "1px solid var(--line)" }}>
                <span style={{ flexShrink: 0, width: "2.4rem", height: "2.4rem", borderRadius: "0.7rem", display: "grid", placeItems: "center", background: "var(--surf)", color: "var(--accent)", border: "1px solid var(--line)" }}><it.icon size={18} /></span>
                <div style={{ lineHeight: 1.3, minWidth: 0 }}><div style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-dim)" }}>{it.label}</div><div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{it.value}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARTE */}
      <section id="carte" style={{ paddingBlock: "clamp(3.2rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <Reveal>
            <span className="vit-kicker" style={{ marginBottom: "1rem" }}>{v.servicesTitle}</span>
            <h2 className="vit-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: ls, margin: "0 0 2.3rem", textTransform: isBarber ? "uppercase" : "none" }}>{c.servicesIntro}</h2>
          </Reveal>
          <div className="menu-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "start" }}>
            <div>
              {v.services.map((s, i) => (
                <Reveal key={i} delay={i * 50}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1.2rem", alignItems: "baseline", padding: "1.1rem 0", borderTop: i === 0 ? "1px solid var(--line)" : "none", borderBottom: "1px solid var(--line)" }}>
                    <div><h3 className="vit-display" style={{ fontSize: "1.18rem", margin: "0 0 0.2rem" }}>{s.name}</h3><p style={{ margin: 0, color: "var(--fg-dim)", fontSize: "0.94rem", maxWidth: "48ch" }}>{s.desc}</p></div>
                    <span className="vit-display" style={{ fontSize: "1.12rem", color: "var(--accent)", whiteSpace: "nowrap" }}>{s.price}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={120}>
              <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: "1.3rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                <Image src={v.detail} alt={`${v.business}`} fill sizes="(max-width: 860px) 92vw, 420px" style={{ objectFit: "cover" }} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* LIEU / GALLERY */}
      <section id="lieu" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ maxWidth: "56ch", marginBottom: "2.3rem" }}>
              <span className="vit-kicker" style={{ marginBottom: "1rem" }}>{c.placeKicker}</span>
              <h2 className="vit-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: ls, margin: "0 0 0.9rem", textTransform: isBarber ? "uppercase" : "none" }}>{v.galleryTitle}</h2>
              <p style={{ color: "var(--fg-dim)", fontSize: "1.04rem", margin: 0 }}>{v.galleryLead}</p>
            </div>
          </Reveal>
          <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" }}>
            <Reveal className="g-main">
              <div style={{ position: "relative", height: "100%", minHeight: "16rem", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                <Image src={v.scene} alt={`${v.business}`} fill sizes="(max-width: 860px) 92vw, 620px" style={{ objectFit: "cover" }} />
              </div>
            </Reveal>
            <div style={{ display: "grid", gap: "1rem" }}>
              <Reveal delay={80}>
                <div style={{ position: "relative", aspectRatio: "5 / 4", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                  <Image src={v.detail} alt={`${v.business}`} fill sizes="(max-width: 860px) 92vw, 360px" style={{ objectFit: "cover" }} />
                </div>
              </Reveal>
              <Reveal delay={140}>
                <div style={{ position: "relative", aspectRatio: "5 / 4", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                  <Image src={v.portrait} alt={`${v.artisanName} · ${v.business}`} fill sizes="(max-width: 860px) 92vw, 360px" style={{ objectFit: "cover" }} />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ARTISAN + CONTACT SHEET (uncropped) */}
      <section id="artisan" style={{ paddingBlock: "clamp(3.2rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <div className="artisan-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "center" }}>
            <Reveal>
              <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: "1.4rem", overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 24px 60px oklch(0 0 0 / 0.22)" }}>
                <Image src={v.portrait} alt={`${v.artisanName}, ${v.artisanRole}`} fill sizes="(max-width: 860px) 92vw, 460px" style={{ objectFit: "cover" }} />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <span className="vit-kicker" style={{ marginBottom: "1rem" }}>{c.artisanKicker}</span>
              <h2 className="vit-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: ls, margin: "0 0 0.4rem", textTransform: isBarber ? "uppercase" : "none" }}>{v.artisanName}</h2>
              <p style={{ color: "var(--accent)", fontWeight: 600, margin: "0 0 1.4rem" }}>{v.artisanRole}</p>
              {v.artisanBio.map((p, i) => <p key={i} style={{ color: "var(--fg-dim)", fontSize: "1.04rem", margin: "0 0 1rem", maxWidth: "52ch" }}>{p}</p>)}
              <figure style={{ margin: "1.7rem 0 0" }}>
                {/* Planche-contact : affichée en entier (jamais croppée) */}
                <div style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid var(--line)", background: "var(--surf)" }}>
                  <Image src={v.sheet} alt={`${v.artisanName}`} width={1600} height={1200} sizes="(max-width: 860px) 92vw, 540px" style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
                <figcaption style={{ marginTop: "0.7rem", fontSize: "0.84rem", color: "var(--fg-dim)", fontStyle: "italic" }}>{c.sheetCaption}</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap", marginBottom: "2.1rem" }}>
              <h2 className="vit-display" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)", letterSpacing: ls, margin: 0, textTransform: isBarber ? "uppercase" : "none" }}>{c.reviewsTitle}</h2>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--accent)" }}><Star size={17} fill="currentColor" stroke="none" /> <strong style={{ color: "var(--fg)" }}>{v.rating}</strong><span style={{ color: "var(--fg-dim)" }}>· {v.ratingMeta}</span></span>
            </div>
          </Reveal>
          <div className="reviews-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.2rem" }}>
            {v.reviews.map((r, i) => (
              <Reveal key={i} delay={i * 80}>
                <figure className="vit-card" style={{ height: "100%", margin: 0, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "1px", color: "var(--accent)" }}>{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={15} fill="currentColor" stroke="none" />)}</div>
                  <blockquote style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6, flex: 1 }}>« {r.text} »</blockquote>
                  <figcaption style={{ fontSize: "0.86rem" }}><strong>{r.author}</strong><span style={{ color: "var(--fg-dim)" }}> · {r.meta}</span></figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section id="reserver" style={{ paddingBlock: "clamp(3.2rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ position: "relative", overflow: "hidden", borderRadius: "1.8rem", border: "1px solid var(--line)" }}>
              <Image src={v.scene} alt="" fill sizes="100vw" style={{ objectFit: "cover", opacity: dark ? 0.3 : 0.16 }} />
              <div style={{ position: "absolute", inset: 0, background: dark ? "linear-gradient(180deg, oklch(0 0 0 / 0.55), oklch(0 0 0 / 0.72))" : "linear-gradient(180deg, var(--bg), oklch(1 0 0 / 0.5))" }} />
              <div style={{ position: "relative", padding: "clamp(2.4rem, 6vw, 4.5rem)", textAlign: "center", maxWidth: "44ch", marginInline: "auto" }}>
                <h2 className="vit-display" style={{ fontSize: "clamp(1.9rem, 5vw, 3.6rem)", letterSpacing: ls, margin: "0 0 1rem", textTransform: isBarber ? "uppercase" : "none" }}>{v.closingTitle}</h2>
                <p style={{ color: "var(--fg-dim)", fontSize: "1.08rem", margin: "0 0 2rem" }}>{v.closingLead}</p>
                <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <a href={`tel:${v.phone.replace(/\s/g, "")}`} className="vit-btn">{v.primaryCta}</a>
                  <a href="#carte" className="vit-btn vit-btn-outline">{v.secondaryCta}</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--line)", paddingBlock: "2.4rem" }}>
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "1.2rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ maxWidth: "52ch" }}>
            <span className="vit-display" style={{ fontSize: "1.1rem", fontWeight: 700 }}>{v.business}</span>
            <p style={{ margin: "0.3rem 0 0", color: "var(--fg-dim)", fontSize: "0.9rem" }}>{c.footerNote}</p>
          </div>
          <Link href="/#contact" className="vit-btn">{c.createCta} <ArrowUpRight size={16} /></Link>
        </div>
      </footer>

      <style>{`
        .vit-navlink { color: var(--fg-dim); transition: color 0.18s var(--ease); }
        .vit-navlink:hover { color: var(--accent); }
        @media (min-width: 860px) { .vit-burger { display: none !important; } .vit-drawer { display: none !important; } }
        @media (max-width: 859px) { .vit-nav-desktop { display: none !important; } }
        @media (max-width: 860px) {
          .demo-hero, .menu-grid, .artisan-grid { grid-template-columns: 1fr !important; }
          .demo-hero > * { order: 0 !important; }
          .gallery-grid { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 561px) and (max-width: 860px) { .reviews-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 620px) {
          .info-strip { grid-template-columns: 1fr !important; }
          .info-item { border-left: none !important; border-top: 1px solid var(--line); }
          .info-item:first-child { border-top: none; }
        }
        @media (max-width: 720px) { .demo-ribbon .ribbon-mid { display: none; } }
      `}</style>
    </div>
  );
}
