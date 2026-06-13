"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Clock, Home, Images, MapPin, Phone, Scissors, ScrollText, Star, Quote } from "lucide-react";
import Reveal from "@/components/Reveal";
import LangSelector from "@/components/LangSelector";
import BusinessSearch from "@/components/BusinessSearch";
import OrderModal from "@/components/OrderModal";
import VapiWidget from "@/components/VapiWidget";
import DemoBottomNav, { type BottomNavItem } from "@/components/DemoBottomNav";
import { useLang } from "@/lib/lang-context";
import { getBarberContent, FACTS, MARQUEE, IMG } from "@/lib/barberCourbevoie";

function Eyebrow({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.1rem" }}>
      <span
        className="bcb-display"
        style={{
          flexShrink: 0, width: "2.1rem", height: "2.1rem", borderRadius: "99px",
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

export default function BarberCourbevoie() {
  const { lang, t } = useLang();
  const c = getBarberContent(lang);
  const hours = FACTS.hours[lang === "en" ? "en" : "fr"];
  const trade = FACTS.trade[lang === "en" ? "en" : "fr"];
  const rating = lang === "en" ? FACTS.ratingEn : FACTS.rating;
  const telHref = `tel:+33${FACTS.phone.replace(/\D/g, "").replace(/^0/, "")}`;

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

  const navLinks = [
    { href: "#services", label: c.navServices },
    { href: "#carte", label: c.navCard },
    { href: "#barbier", label: c.navBarber },
    { href: "#salon", label: c.navGallery },
    { href: "#avis", label: c.navReviews },
    { href: "#infos", label: c.navInfo },
  ];

  // ── Barre de navigation rapide (mobile) — raccourcis barbier ────────────────
  const bottomNavItems: BottomNavItem[] = [
    { key: "home", label: lang === "en" ? "Top" : "Accueil", icon: <Home size={21} />, onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { key: "carte", label: c.navCard, icon: <ScrollText size={21} />, href: "#carte" },
    { key: "cta", label: lang === "en" ? "Book" : "RDV", icon: <Scissors size={25} />, onClick: () => setModal(true), primary: true },
    { key: "salon", label: c.navGallery, icon: <Images size={21} />, href: "#salon" },
    { key: "call", label: lang === "en" ? "Call" : "Appeler", icon: <Phone size={20} />, href: telHref },
  ];

  return (
    <div
      className="bcb-root demo-page"
      style={{
        // Thème barbier — sombre chaleureux, masculin et luxueux : brun espresso
        // ambré (pas charbon froid), or laiton riche, cuivre. L'or rappelle les
        // capes Versace et l'enseigne dorée du salon.
        ["--bg" as string]: "oklch(0.205 0.024 56)",
        ["--bg-2" as string]: "oklch(0.245 0.029 53)",
        ["--surf" as string]: "oklch(0.288 0.033 50)",
        ["--fg" as string]: "oklch(0.955 0.016 82)",
        ["--fg-dim" as string]: "oklch(0.78 0.024 74)",
        ["--accent" as string]: "oklch(0.815 0.145 84)",
        ["--accent-2" as string]: "oklch(0.62 0.15 46)",
        ["--line" as string]: "oklch(0.85 0.05 82 / 0.17)",
        ["--bcb-display" as string]: "var(--font-marcellus), Georgia, serif",
        ["--bcb-body" as string]: "var(--font-hanken), system-ui, sans-serif",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--bcb-body)",
        minHeight: "100dvh",
      }}
    >
      {/* Ribbon démo */}
      <div className="demo-ribbon">
        <Link href="/#metiers" className="back"><ArrowLeft size={16} /> {t.demoCommon.allDemos}</Link>
        <span className="ribbon-mid" style={{ opacity: 0.78 }}>{t.demoCommon.isDemoBanner}</span>
        <span className="ribbon-end" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
          <LangSelector tone="dark" />
          <a href="#demo-request" className="cta">{t.demoCommon.wantMine}</a>
        </span>
      </div>

      {/* Header local */}
      <header style={{ borderBottom: "1px solid var(--line)", position: "sticky", top: 0, zIndex: 40, background: "color-mix(in oklch, var(--bg) 86%, transparent)", backdropFilter: "blur(14px)" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.3rem", gap: "1rem" }}>
          <span className="bcb-display" style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.01em", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "0.55rem" }}>
            <span aria-hidden style={{ color: "var(--accent)", display: "inline-flex" }}><Scissors size={18} /></span> {FACTS.name}
          </span>
          <nav className="bcb-nav-desktop" style={{ display: "none", alignItems: "center", gap: "1.4rem", fontSize: "0.9rem" }}>
            {navLinks.map((l) => <a key={l.href} href={l.href} className="bcb-navlink">{l.label}</a>)}
            <LangSelector tone="dark" />
            <button onClick={() => setModal(true)} className="bcb-btn" style={{ padding: "0.55rem 1.1rem", border: "none", cursor: "pointer" }}>{c.heroPrimary}</button>
          </nav>
          <button
            className="bcb-burger" aria-label={t.nav.menu} aria-expanded={menu} onClick={() => setMenu((x) => !x)}
            style={{ display: "inline-flex", background: "transparent", border: "1px solid var(--line)", borderRadius: "0.6rem", width: "2.6rem", height: "2.6rem", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--fg)", flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menu ? (<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>) : (<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>)}
            </svg>
          </button>
        </div>
      </header>

      {/* Backdrop + sidebar mobile */}
      <div
        className="bcb-overlay" aria-hidden onClick={() => setMenu(false)}
        style={{ position: "fixed", inset: 0, zIndex: 55, background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(2px)", opacity: menu ? 1 : 0, pointerEvents: menu ? "auto" : "none", transition: "opacity 0.32s var(--ease)" }}
      />
      <aside
        className="bcb-sidebar" aria-hidden={!menu}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 60, width: "min(86vw, 360px)",
          background: "var(--bg-2)", color: "var(--fg)", borderLeft: "1px solid var(--line)", boxShadow: "0 0 60px oklch(0 0 0 / 0.5)",
          transform: menu ? "translateX(0)" : "translateX(101%)", transition: "transform 0.4s var(--ease)",
          display: "flex", flexDirection: "column", padding: "1.3rem 1.4rem calc(1.6rem + env(safe-area-inset-bottom))", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem" }}>
          <span className="bcb-display" style={{ fontSize: "1.15rem", fontWeight: 700 }}>{FACTS.name}</span>
          <button aria-label={t.nav.close} onClick={() => setMenu(false)} style={{ display: "inline-flex", background: "transparent", border: "1px solid var(--line)", borderRadius: "0.6rem", width: "2.4rem", height: "2.4rem", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--fg)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12" /><path d="M18 6 6 18" /></svg>
          </button>
        </div>
        <nav style={{ display: "flex", flexDirection: "column" }}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="bcb-display" style={{ padding: "0.95rem 0.2rem", fontSize: "1.2rem", borderBottom: "1px solid var(--line)" }}>{l.label}</a>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: "1.8rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <LangSelector tone="dark" />
          <button onClick={() => { setMenu(false); setModal(true); }} className="bcb-btn" style={{ width: "100%", justifyContent: "center", border: "none", cursor: "pointer" }}>{c.heroPrimary}</button>
        </div>
      </aside>

      {/* ░░ HERO immersif — devanture du salon + dégradé ░░ */}
      <section className="bcb-hero">
        <div className="bcb-hero-bg">
          <Image src={`${IMG}/photo_03.webp`} alt={`${FACTS.fullName} — ${trade}`} fill priority unoptimized sizes="100vw" style={{ objectFit: "cover", objectPosition: "center" }} />
          <div className="bcb-hero-scrim" />
        </div>
        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <Reveal>
            <div style={{ maxWidth: "46rem", paddingBlock: "clamp(4rem, 12vw, 8.5rem)" }}>
              <span className="bcb-kicker bcb-kicker-hero">{c.heroKicker}</span>
              <h1 className="bcb-display" style={{ fontSize: "clamp(2.4rem, 6.5vw, 5rem)", lineHeight: 1.02, letterSpacing: "-0.01em", margin: "1.1rem 0 1.3rem", color: "oklch(0.985 0.014 88)", textShadow: "0 2px 30px oklch(0 0 0 / 0.6), 0 0 64px oklch(0.82 0.14 86 / 0.22)" }}>
                {c.heroTitle}
              </h1>
              <p style={{ fontSize: "clamp(1.04rem, 1.5vw, 1.22rem)", color: "oklch(0.93 0.012 82)", maxWidth: "46ch", margin: "0 0 2rem", textShadow: "0 1px 14px oklch(0 0 0 / 0.6)" }}>
                {c.heroLead}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", alignItems: "center" }}>
                <button onClick={() => setModal(true)} className="bcb-btn bcb-btn-lg" style={{ border: "none", cursor: "pointer" }}>{c.heroPrimary}</button>
                <a href="#services" className="bcb-btn bcb-btn-outline bcb-btn-lg" style={{ color: "oklch(0.98 0.012 85)", borderColor: "oklch(1 0 0 / 0.5)" }}>{c.heroSecondary}</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1.4rem", marginTop: "2rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ display: "flex", gap: "1px", color: "var(--accent)" }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill="currentColor" stroke="none" />)}</div>
                  <span style={{ fontSize: "0.95rem", color: "oklch(0.95 0.01 80)" }}><strong>{rating}/5</strong> · {c.ratingMeta}</span>
                </div>
                <div className="bcb-hero-hours">
                  <Clock size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <div style={{ lineHeight: 1.2 }}>
                    <strong style={{ fontSize: "0.82rem" }}>{c.openBadge}</strong>
                    <div style={{ fontSize: "0.78rem", color: "oklch(0.88 0.01 80)" }}>{c.openHoursShort}</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ░░ Bandeau défilant ░░ */}
      <div className="bcb-marquee" aria-hidden>
        <div className="bcb-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="bcb-marquee-item">
              <span className="bcb-display">{m}</span>
              <span className="bcb-marquee-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ░░ Story + stats ░░ */}
      <section style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <div className="bcb-story" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "center" }}>
            <Reveal variant="left">
              <Eyebrow num="01" label={c.storyKicker} />
              <h2 className="bcb-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 1.4rem" }}>{c.storyTitle}</h2>
              {c.storyBody.map((p, i) => <p key={i} style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: "0 0 1rem", maxWidth: "54ch" }}>{p}</p>)}
            </Reveal>
            <Reveal variant="right" delay={120}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {c.stats.map((s, i) => (
                  <div key={i} className="bcb-stat">
                    <span className="bcb-display" style={{ fontSize: "1.9rem", color: "var(--accent)", lineHeight: 1 }}>{s.n}</span>
                    <span style={{ color: "var(--fg-dim)", fontSize: "0.95rem" }}>{s.l}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ░░ PRESTATIONS — cartes en vedette ░░ */}
      <section id="services" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ maxWidth: "56ch", marginBottom: "2.6rem" }}>
              <Eyebrow num="02" label={c.servicesKicker} />
              <h2 className="bcb-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.9rem" }}>{c.servicesTitle}</h2>
              <p style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: 0 }}>{c.servicesLead}</p>
            </div>
          </Reveal>
          <div className="bcb-service-grid">
            {c.featured.map((d, i) => (
              <Reveal key={d.name} delay={(i % 3) * 70}>
                <article className="bcb-service">
                  <div className="bcb-service-img">
                    <Image src={d.img!} alt={d.name} fill unoptimized sizes="(max-width: 700px) 100vw, 380px" style={{ objectFit: "cover" }} />
                    {d.tag && <span className="bcb-service-tag">{d.tag}</span>}
                    <span className="bcb-service-price">{d.price}</span>
                  </div>
                  <div className="bcb-service-body">
                    <h3 className="bcb-display" style={{ fontSize: "1.3rem", margin: 0 }}>{d.name}</h3>
                    <p style={{ color: "var(--fg-dim)", fontSize: "0.95rem", margin: "0.5rem 0 0", lineHeight: 1.5 }}>{d.desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ░░ CARTE — l'ardoise réelle recréée + photo de la vitrine ░░ */}
      <section id="carte" style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "1.2rem", marginBottom: "2.4rem" }}>
              <div style={{ maxWidth: "52ch" }}>
                <Eyebrow num="03" label={c.menuKicker} />
                <h2 className="bcb-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.9rem" }}>{c.menuTitle}</h2>
                <p style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: 0 }}>{c.menuLead}</p>
              </div>
              <span className="bcb-price-badge"><Scissors size={17} /> {c.menuPriceNote}</span>
            </div>
          </Reveal>

          <div className="bcb-menu-layout">
            {/* Colonnes de prestations */}
            <Reveal variant="left">
              <div className="bcb-menu-board">
                <div className="bcb-menu-cols">
                  {c.priceColumns.map((col) => (
                    <div key={col.title} className="bcb-menu-col">
                      <h3 className="bcb-display" style={{ fontSize: "1.12rem", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent)", borderBottom: "1px solid var(--line)", paddingBottom: "0.7rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        <span aria-hidden>{col.icon}</span> {col.title}
                      </h3>
                      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                        {col.items.map((it) => (
                          <li key={it.name} className="bcb-price-row">
                            <span style={{ fontSize: "0.97rem", color: "var(--fg)" }}>{it.name}</span>
                            <span aria-hidden className="bcb-price-dots" />
                            <span className="bcb-display" style={{ fontSize: "0.97rem", color: "var(--accent)", fontWeight: 700, whiteSpace: "nowrap" }}>{it.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <button onClick={() => setModal(true)} className="bcb-btn" style={{ marginTop: "1.8rem", border: "none", cursor: "pointer" }}>
                  <Scissors size={16} /> {c.heroPrimary}
                </button>
              </div>
            </Reveal>

            {/* Photo de la vraie vitrine */}
            <Reveal variant="right" delay={120}>
              <figure style={{ margin: 0 }}>
                <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 24px 60px oklch(0 0 0 / 0.4)" }}>
                  <Image src={`${IMG}/photo_04.webp`} alt={c.menuBoardCaption} fill unoptimized sizes="(max-width: 980px) 92vw, 380px" style={{ objectFit: "cover" }} />
                </div>
                <figcaption style={{ marginTop: "0.7rem", fontSize: "0.84rem", color: "var(--fg-dim)", fontStyle: "italic" }}>{c.menuBoardCaption}</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ░░ LE BARBIER — Montassar ░░ */}
      <section id="barbier" style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)", background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="bcb-barber-layout">
            <Reveal variant="left">
              <figure style={{ margin: 0 }}>
                <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: "1.3rem", overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 24px 60px oklch(0 0 0 / 0.4)" }}>
                  <Image src={`${IMG}/photo_07.webp`} alt={c.barberCaption} fill unoptimized sizes="(max-width: 900px) 92vw, 400px" style={{ objectFit: "cover" }} />
                </div>
              </figure>
            </Reveal>
            <Reveal variant="right" delay={120}>
              <div>
                <Eyebrow num="04" label={c.barberKicker} />
                <h2 className="bcb-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.4rem" }}>{c.barberTitle}</h2>
                <span style={{ display: "inline-block", fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1.4rem" }}>{c.barberRole}</span>
                {c.barberBody.map((p, i) => <p key={i} style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: "0 0 1rem", maxWidth: "52ch" }}>{p}</p>)}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "0.6rem" }}>
                  <button onClick={() => setModal(true)} className="bcb-btn" style={{ border: "none", cursor: "pointer" }}>{c.heroPrimary}</button>
                  <a href={telHref} className="bcb-btn bcb-btn-outline"><Phone size={16} /> {c.closingSecondary}</a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ░░ LE SALON — galerie ░░ */}
      <section id="salon" style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ maxWidth: "56ch", marginBottom: "2.4rem" }}>
              <Eyebrow num="05" label={c.galleryKicker} />
              <h2 className="bcb-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.9rem" }}>{c.galleryTitle}</h2>
              <p style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: 0 }}>{c.galleryLead}</p>
            </div>
          </Reveal>
          <div className="bcb-gallery">
            {[
              { src: `${IMG}/photo_01.webp`, cap: c.galleryCaptions[0] },
              { src: `${IMG}/photo_08.webp`, cap: c.galleryCaptions[1] },
              { src: `${IMG}/photo_00.webp`, cap: c.galleryCaptions[2] },
            ].map((g, i) => (
              <Reveal key={g.src} delay={i * 80}>
                <figure style={{ margin: 0 }}>
                  <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                    <Image src={g.src} alt={g.cap} fill unoptimized sizes="(max-width: 860px) 92vw, 360px" style={{ objectFit: "cover" }} />
                  </div>
                  <figcaption className="bcb-cap">{g.cap}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ░░ AVIS ░░ */}
      <section id="avis" style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)", background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ maxWidth: "56ch", marginBottom: "2.4rem" }}>
              <Eyebrow num="06" label={c.reviewsKicker} />
              <h2 className="bcb-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.9rem" }}>{c.reviewsTitle}</h2>
              <p style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: 0 }}>{c.reviewsLead}</p>
            </div>
          </Reveal>
          <div className="bcb-reviews">
            {c.reviews.map((r, i) => (
              <Reveal key={i} delay={(i % 2) * 80}>
                <figure className="bcb-review">
                  <Quote size={26} style={{ color: "var(--accent)", opacity: 0.5 }} />
                  <blockquote style={{ margin: "0.8rem 0 1.1rem", fontSize: "1.02rem", lineHeight: 1.6, color: "var(--fg)" }}>{r.text}</blockquote>
                  <figcaption style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600 }}>{r.author}<span style={{ display: "block", fontSize: "0.82rem", color: "var(--fg-dim)", fontWeight: 400 }}>{r.meta}</span></span>
                    <span style={{ display: "flex", gap: "1px", color: "var(--accent)" }}>{Array.from({ length: r.rating }).map((_, k) => <Star key={k} size={15} fill="currentColor" stroke="none" />)}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ░░ INFOS PRATIQUES ░░ */}
      <section id="infos" style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <Reveal>
            <Eyebrow num="07" label={c.infoKicker} />
            <h2 className="bcb-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 2.2rem" }}>{c.infoTitle}</h2>
          </Reveal>
          <div className="bcb-info">
            <Reveal variant="left">
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span className="bcb-info-ic"><MapPin size={18} /></span>
                  <div><div className="bcb-info-l">{c.addressLabel}</div><div style={{ fontWeight: 600 }}>{FACTS.address}</div></div>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span className="bcb-info-ic"><Phone size={18} /></span>
                  <div><div className="bcb-info-l">{c.phoneLabel}</div><a href={telHref} style={{ fontWeight: 600, color: "var(--fg)" }}>{FACTS.phone}</a></div>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span className="bcb-info-ic"><Clock size={18} /></span>
                  <div style={{ minWidth: 0 }}>
                    <div className="bcb-info-l">{c.hoursLabel}</div>
                    <table style={{ borderCollapse: "collapse", fontSize: "0.92rem" }}>
                      <tbody>
                        {hours.map((h) => (
                          <tr key={h.d}>
                            <td style={{ padding: "0.15rem 1.2rem 0.15rem 0", color: "var(--fg-dim)" }}>{h.d}</td>
                            <td style={{ padding: "0.15rem 0", fontWeight: 600, color: "var(--fg)" }}>{h.h}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <a href={FACTS.mapsUri} target="_blank" rel="noopener noreferrer" className="bcb-btn bcb-btn-outline" style={{ alignSelf: "flex-start" }}>
                  <MapPin size={16} /> {c.mapsCta}
                </a>
              </div>
            </Reveal>
            <Reveal variant="right" delay={120}>
              <a
                href={FACTS.mapsUri} target="_blank" rel="noopener noreferrer"
                aria-label={c.mapsCta}
                style={{ position: "relative", display: "block", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)", minHeight: "20rem", height: "100%" }}
              >
                <iframe
                  title="Carte — Barbershop Courbevoie"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${FACTS.lon - 0.006}%2C${FACTS.lat - 0.0032}%2C${FACTS.lon + 0.006}%2C${FACTS.lat + 0.0032}&layer=mapnik&marker=${FACTS.lat}%2C${FACTS.lon}`}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, pointerEvents: "none", filter: "grayscale(0.3) contrast(1.05)" }}
                  loading="lazy"
                />
                <span aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -100%)", color: "var(--accent)", filter: "drop-shadow(0 2px 4px oklch(0 0 0 / 0.6))" }}>
                  <MapPin size={34} fill="currentColor" stroke="var(--bg)" strokeWidth={1.5} />
                </span>
                <span style={{ position: "absolute", left: "0.9rem", bottom: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "color-mix(in oklch, var(--bg) 84%, transparent)", color: "var(--fg)", border: "1px solid var(--line)", borderRadius: "0.6rem", padding: "0.5rem 0.8rem", fontSize: "0.84rem", fontWeight: 600, backdropFilter: "blur(6px)" }}>
                  <MapPin size={14} style={{ color: "var(--accent)" }} /> {c.mapsCta}
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ░░ CLOSING ░░ */}
      <section style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)" }}>
        <div className="wrap">
          <Reveal>
            <div className="bcb-closing">
              <div style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
                <Image src={`${IMG}/photo_06.webp`} alt="" fill unoptimized sizes="100vw" style={{ objectFit: "cover" }} />
              </div>
              <div className="bcb-closing-scrim" />
              <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: "42ch", margin: "0 auto" }}>
                <h2 className="bcb-display" style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)", letterSpacing: "-0.01em", margin: "0 0 0.8rem", color: "oklch(0.985 0.012 88)" }}>{c.closingTitle}</h2>
                <p style={{ color: "oklch(0.9 0.012 82)", fontSize: "1.05rem", margin: "0 0 1.8rem" }}>{c.closingLead}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", justifyContent: "center" }}>
                  <button onClick={() => setModal(true)} className="bcb-btn bcb-btn-lg" style={{ border: "none", cursor: "pointer" }}>{c.closingPrimary}</button>
                  <a href={telHref} className="bcb-btn bcb-btn-outline bcb-btn-lg" style={{ color: "oklch(0.98 0.012 85)", borderColor: "oklch(1 0 0 / 0.5)" }}><Phone size={16} /> {c.closingSecondary}</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ░░ DEMO REQUEST (identique aux autres démos) ░░ */}
      <section id="demo-request" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div className="grain" style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r-xl)", background: "var(--accent)", color: "var(--bg)", padding: "clamp(2rem, 5vw, 3.5rem)" }}>
              <div aria-hidden style={{ position: "absolute", top: "-30%", right: "-8%", width: "26rem", height: "26rem", maxWidth: "100vw", borderRadius: "50%", background: "radial-gradient(circle, oklch(1 0 0 / 0.14), transparent 60%)", pointerEvents: "none" }} />
              <div className="bcb-cta-layout" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "clamp(1.5rem, 4vw, 3rem)" }}>
                <div style={{ flex: "1 1 0", minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.7, marginBottom: "0.8rem" }}>{trade}</span>
                  <h2 className="bcb-display" style={{ fontSize: "clamp(1.8rem, 3.8vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.7rem", color: "var(--bg)", lineHeight: 1.1 }}>{t.cta.title}</h2>
                  <p style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)", opacity: 0.82, margin: 0, maxWidth: "44ch", color: "var(--bg)" }}>{t.cta.body}</p>
                </div>
                <div className="bcb-cta-search" style={{ flexShrink: 0, minWidth: "min(100%, 22rem)" }}>
                  <BusinessSearch />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ░░ Footer mini ░░ */}
      <footer style={{ borderTop: "1px solid var(--line)", paddingBlock: "2.4rem" }}>
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="bcb-display" style={{ fontSize: "1.15rem", fontWeight: 700 }}>{FACTS.fullName}</div>
            <div style={{ fontSize: "0.88rem", color: "var(--fg-dim)" }}>{FACTS.address} · {FACTS.phone}</div>
          </div>
          <Link href="/#metiers" className="bcb-navlink" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem" }}>
            <ArrowLeft size={15} /> {t.demoCommon.allDemos}
          </Link>
        </div>
      </footer>

      {/* Scroll hint */}
      {showScrollHint && (
        <div className="md:hidden" style={{ position: "fixed", bottom: "calc(var(--bottomnav-h, 4.5rem) + 1.6rem)", left: "50%", transform: "translateX(-50%)", zIndex: 51, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", pointerEvents: "none", animation: "avScrollFadeIn 0.6s ease both" }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", opacity: 0.9 }}>{t.demoCommon.scroll}</span>
          <div style={{ width: 40, height: 40, borderRadius: "999px", display: "grid", placeItems: "center", background: "var(--accent)", animation: "avScrollPulse 1.4s ease-in-out infinite" }}>
            <ChevronDown size={22} color="var(--bg)" strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* Prise de rendez-vous */}
      {modal && (
        <OrderModal
          vit="barber"
          services={c.featured.map(s => ({ name: s.name, desc: s.desc, price: s.price }))}
          business={FACTS.name}
          onClose={() => setModal(false)}
        />
      )}

      {/* Barre de navigation rapide (mobile) — raccourcis barbier */}
      <DemoBottomNav items={bottomNavItems} />

      {/* Bulle Vapi — réception barbier dédiée (assistant propre au salon) */}
      <VapiWidget slug="barbershop-courbevoie" />

      <style>{`
        .bcb-display { font-family: var(--bcb-display); }
        .bcb-kicker { display: inline-flex; align-items: center; gap: 0.6rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }
        .bcb-kicker::before { content: ""; width: 1.7rem; height: 2px; background: var(--accent); }
        .bcb-kicker-hero { color: oklch(0.88 0.13 86); }
        .bcb-kicker-hero::before { background: oklch(0.88 0.13 86); }
        .bcb-navlink { color: var(--fg-dim); transition: color 0.18s var(--ease); }
        .bcb-navlink:hover { color: var(--accent); }

        /* Bouton or laiton « métallique » : dégradé clair→cuivre + liseré et reflet */
        .bcb-btn { position: relative; overflow: hidden; isolation: isolate; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.4rem; border-radius: 0.7rem; font-weight: 700; letter-spacing: 0.01em; color: oklch(0.21 0.035 50); cursor: pointer;
          background: linear-gradient(143deg, color-mix(in oklch, var(--accent) 80%, white 24%) 0%, var(--accent) 50%, var(--accent-2) 128%);
          border: 1px solid color-mix(in oklch, var(--accent) 65%, white 22%);
          box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.35), 0 6px 16px color-mix(in oklch, var(--accent) 24%, transparent);
          transition: transform 0.2s var(--ease), filter 0.2s var(--ease), box-shadow 0.2s var(--ease); }
        .bcb-btn::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(110deg, transparent 32%, oklch(1 0 0 / 0.5) 50%, transparent 68%); transform: translateX(-140%); transition: transform 0.65s var(--ease); }
        .bcb-btn:hover::after { transform: translateX(140%); }
        .bcb-btn:hover { transform: translateY(-2px); filter: brightness(1.05); box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.4), 0 16px 34px color-mix(in oklch, var(--accent) 38%, transparent), 0 4px 12px oklch(0 0 0 / 0.5); }
        .bcb-btn:active { transform: scale(0.97); }
        .bcb-btn-lg { padding: 0.9rem 1.7rem; font-size: 1.02rem; }
        .bcb-btn-outline { background: transparent; color: var(--fg); border-color: color-mix(in oklch, var(--accent) 42%, transparent); box-shadow: none; }
        .bcb-btn-outline::after { display: none; }
        .bcb-btn-outline:hover { border-color: var(--accent); color: var(--accent); box-shadow: none; filter: none; transform: translateY(-2px); }
        @media (prefers-reduced-motion: reduce) { .bcb-btn::after { display: none !important; } }

        /* HERO */
        .bcb-hero { position: relative; isolation: isolate; }
        .bcb-hero-bg { position: absolute; inset: 0; z-index: 0; }
        .bcb-hero-scrim { position: absolute; inset: 0; background:
          linear-gradient(100deg, oklch(0.16 0.03 54 / 0.94) 0%, oklch(0.18 0.032 52 / 0.8) 42%, oklch(0.22 0.032 52 / 0.4) 74%, oklch(0.15 0.028 54 / 0.66) 100%),
          radial-gradient(120% 85% at 86% 8%, oklch(0.82 0.14 86 / 0.18), transparent 56%); }
        .bcb-hero-hours { display: inline-flex; align-items: center; gap: 0.55rem; padding: 0.55rem 0.9rem; border-radius: 0.7rem; background: oklch(0.24 0.03 50 / 0.55); color: oklch(0.96 0.014 82); border: 1px solid oklch(0.82 0.1 84 / 0.32); backdrop-filter: blur(6px); }

        /* MARQUEE */
        .bcb-marquee { overflow: hidden; border-block: 1px solid color-mix(in oklch, var(--accent) 40%, transparent); color: oklch(0.21 0.04 50);
          background: linear-gradient(100deg, color-mix(in oklch, var(--accent) 82%, white 18%), var(--accent) 55%, var(--accent-2) 140%); }
        .bcb-marquee-track { display: inline-flex; align-items: center; white-space: nowrap; padding-block: 0.7rem; animation: bcbMarquee 32s linear infinite; }
        .bcb-marquee-item { display: inline-flex; align-items: center; gap: 1.6rem; font-size: 1.05rem; font-weight: 600; }
        .bcb-marquee-item .bcb-display { padding-left: 1.6rem; }
        .bcb-marquee-dot { opacity: 0.55; }
        @keyframes bcbMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .bcb-stat { background: var(--surf); border: 1px solid var(--line); border-radius: 1rem; padding: 1.1rem 1.3rem; display: flex; flex-direction: column; gap: 0.25rem; }

        /* SERVICE GRID */
        .bcb-service-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .bcb-service { background: var(--surf); border: 1px solid var(--line); border-radius: 1.2rem; overflow: hidden; height: 100%; transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease); }
        .bcb-service:hover { transform: translateY(-5px); box-shadow: 0 22px 48px oklch(0 0 0 / 0.45), 0 0 0 1px color-mix(in oklch, var(--accent) 38%, transparent); border-color: color-mix(in oklch, var(--accent) 45%, var(--line)); }
        .bcb-service-img { position: relative; aspect-ratio: 4 / 3; overflow: hidden; }
        .bcb-service-img img { transition: transform 0.5s var(--ease); }
        .bcb-service:hover .bcb-service-img img { transform: scale(1.06); }
        .bcb-service-tag { position: absolute; top: 0.8rem; left: 0.8rem; background: var(--accent-2); color: oklch(0.98 0.01 80); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; padding: 0.32rem 0.7rem; border-radius: 99px; }
        .bcb-service-price { position: absolute; bottom: 0.8rem; right: 0.8rem; background: var(--accent); color: oklch(0.18 0.01 70); font-weight: 700; font-size: 0.95rem; padding: 0.35rem 0.7rem; border-radius: 0.6rem; box-shadow: 0 6px 16px oklch(0 0 0 / 0.5); }
        .bcb-service-body { padding: 1.2rem 1.3rem 1.4rem; }

        /* PRICE BADGE */
        .bcb-price-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--surf); border: 1px solid var(--accent); color: var(--accent); border-radius: 99px; padding: 0.55rem 1.1rem; font-weight: 700; font-size: 0.95rem; white-space: nowrap; }

        /* MENU */
        .bcb-menu-layout { display: grid; grid-template-columns: 1.55fr 1fr; gap: clamp(1.5rem, 4vw, 3rem); align-items: start; }
        .bcb-menu-board { background: var(--surf); border: 1px solid var(--line); border-top: 2px solid color-mix(in oklch, var(--accent) 55%, transparent); border-radius: 1.3rem; padding: clamp(1.4rem, 3vw, 2.2rem); box-shadow: 0 18px 44px oklch(0 0 0 / 0.32), inset 0 1px 0 oklch(1 0 0 / 0.04); }
        .bcb-menu-cols { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
        .bcb-price-row { display: flex; align-items: baseline; gap: 0.5rem; }
        .bcb-price-dots { flex: 1; border-bottom: 1px dotted color-mix(in oklch, var(--fg) 28%, transparent); transform: translateY(-0.2rem); }

        /* BARBER */
        .bcb-barber-layout { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: clamp(1.8rem, 5vw, 4rem); align-items: center; }

        /* GALLERY */
        .bcb-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; align-items: start; }
        .bcb-cap { margin-top: 0.6rem; font-size: 0.82rem; color: var(--fg-dim); font-style: italic; }

        /* REVIEWS */
        .bcb-reviews { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.3rem; }
        .bcb-review { margin: 0; background: var(--surf); border: 1px solid var(--line); border-radius: 1.2rem; padding: 1.6rem 1.7rem; height: 100%; }

        /* INFO */
        .bcb-info { display: grid; grid-template-columns: 0.95fr 1.05fr; gap: clamp(1.5rem, 4vw, 3rem); align-items: stretch; }
        .bcb-info-ic { flex-shrink: 0; width: 2.6rem; height: 2.6rem; border-radius: 0.8rem; display: grid; place-items: center; background: var(--surf); color: var(--accent); border: 1px solid var(--line); }
        .bcb-info-l { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-dim); margin-bottom: 0.25rem; }

        /* CLOSING */
        .bcb-closing { position: relative; overflow: hidden; border-radius: var(--r-xl); border: 1px solid var(--line); padding: clamp(2.6rem, 7vw, 5rem) clamp(1.5rem, 5vw, 3rem); background: var(--bg-2); }
        .bcb-closing-scrim { position: absolute; inset: 0; background:
          radial-gradient(circle at 50% 30%, oklch(0.82 0.14 86 / 0.12), transparent 48%),
          radial-gradient(circle at 50% 38%, oklch(0.21 0.032 50 / 0.5), oklch(0.15 0.026 54 / 0.94)); }

        @keyframes avScrollPulse {
          0% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--accent) 65%, transparent); transform: translateY(0); }
          50% { box-shadow: 0 0 0 10px transparent; transform: translateY(4px); }
          100% { box-shadow: 0 0 0 0 transparent; transform: translateY(0); }
        }
        @keyframes avScrollFadeIn { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }

        @media (min-width: 860px) { .bcb-burger, .bcb-sidebar, .bcb-overlay { display: none !important; } .bcb-nav-desktop { display: flex !important; } }
        @media (max-width: 859px) { .bcb-nav-desktop { display: none !important; } }
        @media (max-width: 980px) {
          .bcb-menu-layout { grid-template-columns: 1fr; }
          .bcb-info { grid-template-columns: 1fr; }
          .bcb-story { grid-template-columns: 1fr !important; }
          .bcb-barber-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 760px) {
          .bcb-service-grid { grid-template-columns: 1fr 1fr; }
          .bcb-menu-cols { grid-template-columns: 1fr; gap: 1.6rem; }
          .bcb-reviews { grid-template-columns: 1fr; }
          .bcb-gallery { grid-template-columns: 1fr; }
          .bcb-cta-layout { flex-direction: column; align-items: stretch; }
          .bcb-cta-search { min-width: 0 !important; }
        }
        @media (max-width: 520px) {
          .bcb-service-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) { .demo-ribbon .ribbon-mid { display: none; } }
      `}</style>
    </div>
  );
}
