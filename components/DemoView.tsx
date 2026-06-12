"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Clock, MapPin, Phone, Star } from "lucide-react";
import Reveal from "@/components/Reveal";
import LangSelector from "@/components/LangSelector";
import DemoTestimonials from "@/components/DemoTestimonials";
import DemoFooter from "@/components/DemoFooter";
import OrderModal from "@/components/OrderModal";
import BusinessSearch from "@/components/BusinessSearch";
import VapiWidget from "@/components/VapiWidget";
import { useLang } from "@/lib/lang-context";
import { getVitrine } from "@/lib/vitrineContent";

// Numbered chapter marker that gives each section a clear, highlighted identity.
// Inherits the per-vitrine theme (accent / bg) so it adapts to every trade.
function SectionEyebrow({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.1rem" }}>
      <span
        className="vit-display"
        style={{
          flexShrink: 0, width: "2rem", height: "2rem", borderRadius: "99px",
          display: "grid", placeItems: "center",
          background: "var(--accent)", color: "var(--bg)",
          fontSize: "0.82rem", fontWeight: 700, lineHeight: 1,
        }}
      >
        {num}
      </span>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--accent)" }}>
        {label}
      </span>
    </div>
  );
}

export default function DemoView({ slug }: { slug: string }) {
  const { lang, t } = useLang();
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  useEffect(() => {
    if (!modal) document.body.style.overflow = menu ? "hidden" : "";
    return () => { if (!modal) document.body.style.overflow = ""; };
  }, [menu, modal]);
  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 80) setShowScrollHint(false); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
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
        <a href="#demo-request" className="cta">{c.wantMine}</a>
      </div>

      {/* Local header */}
      <header style={{ borderBottom: "1px solid var(--line)", position: "relative", zIndex: 30 }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.3rem", gap: "1rem" }}>
          <span className="vit-display" style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: ls, textTransform: isBarber ? "uppercase" : "none", whiteSpace: "nowrap" }}>{v.business}</span>
          <nav className="vit-nav-desktop" style={{ display: "none", alignItems: "center", gap: "1.5rem", fontSize: "0.9rem" }}>
            {navLinks.map((l) => <a key={l.href} href={l.href} className="vit-navlink">{l.label}</a>)}
            <LangSelector tone={dark ? "dark" : "light"} />
            <button onClick={() => setModal(true)} className="vit-btn" style={{ padding: "0.55rem 1.1rem", border: "none", cursor: "pointer" }}>{v.primaryCta}</button>
          </nav>
          <button
            className="vit-burger" aria-label={t.nav.menu} aria-expanded={menu} onClick={() => setMenu((x) => !x)}
            style={{ display: "inline-flex", background: "transparent", border: "1px solid var(--line)", borderRadius: "0.6rem", width: "2.6rem", height: "2.6rem", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--fg)", flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menu ? (<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>) : (<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>)}
            </svg>
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className="vit-overlay" aria-hidden onClick={() => setMenu(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 55, background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(2px)",
          opacity: menu ? 1 : 0, pointerEvents: menu ? "auto" : "none", transition: "opacity 0.32s var(--ease)",
        }}
      />

      {/* Retractable sidebar */}
      <aside
        className="vit-sidebar" data-open={menu} aria-hidden={!menu}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 60,
          width: "min(86vw, 360px)", background: "var(--bg-2)", color: "var(--fg)",
          borderLeft: "1px solid var(--line)", boxShadow: "0 0 60px oklch(0 0 0 / 0.4)",
          transform: menu ? "translateX(0)" : "translateX(101%)", transition: "transform 0.4s var(--ease)",
          display: "flex", flexDirection: "column",
          padding: "1.3rem 1.4rem calc(1.6rem + env(safe-area-inset-bottom))", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem" }}>
          <span className="vit-display" style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: ls, textTransform: isBarber ? "uppercase" : "none" }}>{v.business}</span>
          <button
            aria-label={t.nav.close} onClick={() => setMenu(false)}
            style={{ display: "inline-flex", background: "transparent", border: "1px solid var(--line)", borderRadius: "0.6rem", width: "2.4rem", height: "2.4rem", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--fg)", flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12" /><path d="M18 6 6 18" /></svg>
          </button>
        </div>
        <nav style={{ display: "flex", flexDirection: "column" }}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="vit-display" style={{ padding: "0.95rem 0.2rem", fontSize: "1.2rem", borderBottom: "1px solid var(--line)" }}>{l.label}</a>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: "1.8rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <LangSelector tone={dark ? "dark" : "light"} />
          <button onClick={() => { setMenu(false); setModal(true); }} className="vit-btn" style={{ width: "100%", border: "none", cursor: "pointer" }}>{v.primaryCta}</button>
        </div>
      </aside>

      {/* HERO */}
      <section style={{ paddingBlock: "clamp(2.4rem, 5vw, 4.5rem)" }}>
        <div className="wrap">
          <div className="demo-hero" style={{ display: "grid", gridTemplateColumns: v.vit === "onglerie" ? "1fr 1.05fr" : "1.05fr 1fr", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "center" }}>
            <Reveal style={{ order: v.vit === "onglerie" ? 2 : 1 }}>
              <span className="vit-kicker" style={{ marginBottom: "1.2rem" }}>{v.kicker}</span>
              <h1 className="vit-display" style={{ fontSize: "clamp(2.2rem, 6vw, 4.4rem)", lineHeight: isBarber ? 0.96 : 1.03, letterSpacing: ls, margin: "0 0 1.3rem", textTransform: isBarber ? "uppercase" : "none" }}>{v.heroTitle}</h1>
              <p style={{ fontSize: "clamp(1.02rem, 1.4vw, 1.18rem)", color: "var(--fg-dim)", maxWidth: "46ch", margin: "0 0 2rem" }}>{v.heroLead}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", alignItems: "center" }}>
                <button onClick={() => setModal(true)} className="vit-btn" style={{ border: "none", cursor: "pointer" }}>{v.primaryCta}</button>
                <a href="#carte" className="vit-btn vit-btn-outline">{v.secondaryCta}</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginTop: "1.7rem" }}>
                <div style={{ display: "flex", gap: "1px", color: "var(--accent)" }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" stroke="none" />)}</div>
                <span style={{ fontSize: "0.9rem", color: "var(--fg-dim)" }}><strong style={{ color: "var(--fg)" }}>{v.rating}/5</strong> · {v.ratingMeta}</span>
              </div>
            </Reveal>
            <Reveal delay={120} style={{ order: v.vit === "onglerie" ? 1 : 2 }}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: "1.4rem", overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 30px 70px oklch(0 0 0 / 0.25)" }}>
                  <Image src={v.cover} alt={`${v.business}, ${v.trade}`} fill priority unoptimized sizes="(max-width: 860px) 92vw, 560px" style={{ objectFit: "cover", objectPosition: "center" }} />
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
            <SectionEyebrow num="01" label={v.servicesTitle} />
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
              <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: "1.3rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                <Image src={v.detail} alt={`${v.business}`} fill unoptimized sizes="(max-width: 860px) 92vw, 460px" style={{ objectFit: "cover", objectPosition: "center" }} />
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
              <SectionEyebrow num="02" label={c.placeKicker} />
              <h2 className="vit-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: ls, margin: "0 0 0.9rem", textTransform: isBarber ? "uppercase" : "none" }}>{v.galleryTitle}</h2>
              <p style={{ color: "var(--fg-dim)", fontSize: "1.04rem", margin: 0 }}>{v.galleryLead}</p>
            </div>
          </Reveal>
          <div className="gallery-stack" style={{ display: "grid", gap: "1rem" }}>
            <Reveal>
              <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                <Image src={v.scene} alt={`${v.business}`} fill unoptimized sizes="(max-width: 860px) 92vw, 1180px" style={{ objectFit: "cover", objectPosition: "center" }} />
              </div>
            </Reveal>
            <div className="gallery-pair" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "start" }}>
              <Reveal delay={80}>
                <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                  <Image src={v.detail} alt={`${v.business}`} fill unoptimized sizes="(max-width: 860px) 46vw, 560px" style={{ objectFit: "cover", objectPosition: "center" }} />
                </div>
              </Reveal>
              <Reveal delay={140}>
                <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                  <Image src={v.portrait} alt={`${v.artisanName} · ${v.business}`} fill unoptimized sizes="(max-width: 860px) 46vw, 420px" style={{ objectFit: "cover", objectPosition: "center top" }} />
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
                <Image src={v.portrait} alt={`${v.artisanName}, ${v.artisanRole}`} fill unoptimized sizes="(max-width: 860px) 92vw, 460px" style={{ objectFit: "cover" }} />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <SectionEyebrow num="03" label={c.artisanKicker} />
              <h2 className="vit-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: ls, margin: "0 0 0.4rem", textTransform: isBarber ? "uppercase" : "none" }}>{v.artisanName}</h2>
              <p style={{ color: "var(--accent)", fontWeight: 600, margin: "0 0 1.4rem" }}>{v.artisanRole}</p>
              {v.artisanBio.map((p, i) => <p key={i} style={{ color: "var(--fg-dim)", fontSize: "1.04rem", margin: "0 0 1rem", maxWidth: "52ch" }}>{p}</p>)}
              <figure style={{ margin: "1.7rem 0 0" }}>
                {/* Planche-contact : affichée en entier (jamais croppée) */}
                <div style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid var(--line)", background: "var(--surf)" }}>
                  <Image src={v.sheet} alt={`${v.artisanName}`} width={1600} height={1200} unoptimized sizes="(max-width: 860px) 92vw, 540px" style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
                <figcaption style={{ marginTop: "0.7rem", fontSize: "0.84rem", color: "var(--fg-dim)", fontStyle: "italic" }}>{c.sheetCaption}</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* REVIEWS — landing-style animated testimonial columns */}
      <DemoTestimonials reviews={v.reviews} title={c.reviewsTitle} rating={v.rating} ratingMeta={v.ratingMeta} index="04" />

      {/* CLOSING */}
      <section id="reserver" style={{ paddingBlock: "clamp(2.5rem, 5vw, 4rem)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div className="vit-reserver-layout" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "clamp(1.5rem, 4vw, 3rem)" }}>
              <div style={{ flex: "1 1 0", minWidth: 0 }}>
                <h2 className="vit-display" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)", letterSpacing: ls, margin: "0 0 0.65rem", textTransform: isBarber ? "uppercase" : "none" }}>{v.closingTitle}</h2>
                <p style={{ color: "var(--fg-dim)", fontSize: "1rem", margin: 0, maxWidth: "44ch" }}>{v.closingLead}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", flexShrink: 0, minWidth: "min(100%, 15rem)" }}>
                <button onClick={() => setModal(true)} className="vit-btn" style={{ justifyContent: "center", border: "none", cursor: "pointer" }}>{v.primaryCta}</button>
                <a href="#carte" className="vit-btn vit-btn-outline" style={{ justifyContent: "center" }}>{v.secondaryCta}</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DEMO REQUEST — recherche intégrée, même processus que la landing */}
      <section id="demo-request" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div
              className="grain vit-demo-cta"
              style={{
                position: "relative", overflow: "hidden",
                borderRadius: "var(--r-xl)",
                background: "var(--accent)", color: "var(--bg)",
                padding: "clamp(2rem, 5vw, 3.5rem)",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute", top: "-30%", right: "-8%",
                  width: "26rem", height: "26rem", maxWidth: "100vw",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, oklch(1 0 0 / 0.12), transparent 60%)",
                  pointerEvents: "none",
                }}
              />
              <div
                className="vit-cta-layout"
                style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "clamp(1.5rem, 4vw, 3rem)" }}
              >
                <div style={{ flex: "1 1 0", minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.7, marginBottom: "0.8rem" }}>
                    {v.trade}
                  </span>
                  <h2
                    className="vit-display"
                    style={{
                      fontSize: "clamp(1.8rem, 3.8vw, 3rem)",
                      letterSpacing: ls, margin: "0 0 0.7rem",
                      color: "var(--bg)",
                      textTransform: isBarber ? "uppercase" : "none",
                      lineHeight: 1.1,
                    }}
                  >
                    {t.cta.title}
                  </h2>
                  <p style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)", opacity: 0.82, margin: 0, maxWidth: "44ch", color: "var(--bg)" }}>
                    {t.cta.body}
                  </p>
                </div>
                <div className="vit-cta-search" style={{ flexShrink: 0, minWidth: "min(100%, 22rem)" }}>
                  <BusinessSearch />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <DemoFooter v={v} isBarber={isBarber} ls={ls} />

      {/* Scroll hint — mobile only, disparaît après 80px */}
      {showScrollHint && (
        <div
          className="md:hidden"
          style={{
            position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
            zIndex: 55, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
            pointerEvents: "none", animation: "avScrollFadeIn 0.6s ease both",
          }}
        >
          <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", opacity: 0.9 }}>
            {c.scroll}
          </span>
          <div style={{
            width: 40, height: 40, borderRadius: "999px", display: "grid", placeItems: "center",
            background: "var(--accent)", animation: "avScrollPulse 1.4s ease-in-out infinite",
          }}>
            <ChevronDown size={22} color="var(--bg)" strokeWidth={2.5} />
          </div>
        </div>
      )}

      {modal && (
        <OrderModal
          vit={v.vit}
          services={v.services}
          business={v.business}
          onClose={() => setModal(false)}
        />
      )}

      {/* Bulle Vapi hybride (chat + appel) — assistant inbound dédié au métier,
          couleurs alignées sur la page. */}
      <VapiWidget slug={slug} />

      <style>{`
        @keyframes avScrollPulse {
          0%   { box-shadow: 0 0 0 0 color-mix(in oklch, var(--accent) 65%, transparent); transform: translateY(0); }
          50%  { box-shadow: 0 0 0 10px transparent; transform: translateY(4px); }
          100% { box-shadow: 0 0 0 0 transparent; transform: translateY(0); }
        }
        @keyframes avScrollFadeIn {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .vit-navlink { color: var(--fg-dim); transition: color 0.18s var(--ease); }
        .vit-navlink:hover { color: var(--accent); }
        @media (min-width: 860px) { .vit-burger { display: none !important; } .vit-sidebar, .vit-overlay { display: none !important; } }
        @media (max-width: 859px) { .vit-nav-desktop { display: none !important; } }
        @media (max-width: 860px) {
          .demo-hero, .menu-grid, .artisan-grid { grid-template-columns: 1fr !important; }
          .demo-hero > * { order: 0 !important; }
        }
        @media (max-width: 480px) { .gallery-pair { grid-template-columns: 1fr !important; } }
        @media (max-width: 620px) {
          .info-strip { grid-template-columns: 1fr !important; }
          .info-item { border-left: none !important; border-top: 1px solid var(--line); }
          .info-item:first-child { border-top: none; }
        }
        @media (max-width: 720px) { .demo-ribbon .ribbon-mid { display: none; } }
        @media (max-width: 640px) {
          .vit-reserver-layout { flex-direction: column; align-items: stretch; }
          .vit-reserver-layout > div:last-child { min-width: 0 !important; }
          .vit-reserver-layout .vit-btn { width: 100%; min-height: 3.2rem; }
        }
        @media (max-width: 700px) {
          .vit-cta-layout { flex-direction: column; align-items: stretch; }
          .vit-cta-search { min-width: 0 !important; }
        }
      `}</style>
    </div>
  );
}
