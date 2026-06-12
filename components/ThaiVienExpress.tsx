"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Clock, MapPin, Phone, Star, UtensilsCrossed, Quote } from "lucide-react";
import Reveal from "@/components/Reveal";
import LangSelector from "@/components/LangSelector";
import BusinessSearch from "@/components/BusinessSearch";
import OrderModal from "@/components/OrderModal";
import VapiWidget from "@/components/VapiWidget";
import { useLang } from "@/lib/lang-context";
import { getThaiContent, FACTS, MARQUEE, IMG } from "@/lib/thaiViens";

function Eyebrow({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.1rem" }}>
      <span
        className="tve-display"
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

export default function ThaiVienExpress() {
  const { lang, t } = useLang();
  const c = getThaiContent(lang);
  const hours = FACTS.hours[lang === "en" ? "en" : "fr"];
  const trade = FACTS.trade[lang === "en" ? "en" : "fr"];
  const rating = lang === "en" ? FACTS.ratingEn : FACTS.rating;
  const telHref = `tel:+33${FACTS.phone.replace(/\D/g, "").replace(/^0/, "")}`;

  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  useEffect(() => {
    // OrderModal gère son propre verrou de scroll ; on n'agit que pour le menu.
    if (!modal) document.body.style.overflow = menu ? "hidden" : "";
    return () => { if (!modal) document.body.style.overflow = ""; };
  }, [menu, modal]);
  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 80) setShowScrollHint(false); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#dishes", label: c.navDishes },
    { href: "#carte", label: c.navCard },
    { href: "#ambiance", label: c.navAmbiance },
    { href: "#avis", label: c.navReviews },
    { href: "#infos", label: c.navInfo },
  ];

  return (
    <div
      className="tve-root"
      style={{
        // Thème thaï — clair, chaud et accueillant : ivoire crème, brun chaud,
        // or terracotta, piment, vert herbe. Le héros garde sa photo immersive.
        ["--bg" as string]: "oklch(0.976 0.016 73)",
        ["--bg-2" as string]: "oklch(0.953 0.026 66)",
        ["--surf" as string]: "oklch(0.995 0.009 80)",
        ["--fg" as string]: "oklch(0.29 0.038 45)",
        ["--fg-dim" as string]: "oklch(0.47 0.04 45)",
        ["--accent" as string]: "oklch(0.585 0.16 48)",
        ["--accent-2" as string]: "oklch(0.53 0.19 28)",
        ["--jade" as string]: "oklch(0.5 0.1 158)",
        ["--line" as string]: "oklch(0.32 0.04 45 / 0.15)",
        ["--tve-display" as string]: "var(--font-marcellus), Georgia, serif",
        ["--tve-body" as string]: "var(--font-hanken), system-ui, sans-serif",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--tve-body)",
        minHeight: "100dvh",
      }}
    >
      {/* Ribbon démo */}
      <div className="demo-ribbon">
        <Link href="/#metiers" className="back"><ArrowLeft size={16} /> {t.demoCommon.allDemos}</Link>
        <span className="ribbon-mid" style={{ opacity: 0.78 }}>{t.demoCommon.isDemoBanner}</span>
        <a href="#demo-request" className="cta">{t.demoCommon.wantMine}</a>
      </div>

      {/* Header local */}
      <header style={{ borderBottom: "1px solid var(--line)", position: "sticky", top: 0, zIndex: 40, background: "color-mix(in oklch, var(--bg) 88%, transparent)", backdropFilter: "blur(14px)" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4.3rem", gap: "1rem" }}>
          <span className="tve-display" style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.01em", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "0.55rem" }}>
            <span aria-hidden style={{ color: "var(--accent)" }}>✦</span> {FACTS.name}
          </span>
          <nav className="tve-nav-desktop" style={{ display: "none", alignItems: "center", gap: "1.5rem", fontSize: "0.9rem" }}>
            {navLinks.map((l) => <a key={l.href} href={l.href} className="tve-navlink">{l.label}</a>)}
            <LangSelector tone="light" />
            <button onClick={() => setModal(true)} className="tve-btn" style={{ padding: "0.55rem 1.1rem", border: "none", cursor: "pointer" }}>{c.heroPrimary}</button>
          </nav>
          <button
            className="tve-burger" aria-label={t.nav.menu} aria-expanded={menu} onClick={() => setMenu((x) => !x)}
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
        className="tve-overlay" aria-hidden onClick={() => setMenu(false)}
        style={{ position: "fixed", inset: 0, zIndex: 55, background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(2px)", opacity: menu ? 1 : 0, pointerEvents: menu ? "auto" : "none", transition: "opacity 0.32s var(--ease)" }}
      />
      <aside
        className="tve-sidebar" aria-hidden={!menu}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 60, width: "min(86vw, 360px)",
          background: "var(--bg-2)", color: "var(--fg)", borderLeft: "1px solid var(--line)", boxShadow: "0 0 60px oklch(0 0 0 / 0.4)",
          transform: menu ? "translateX(0)" : "translateX(101%)", transition: "transform 0.4s var(--ease)",
          display: "flex", flexDirection: "column", padding: "1.3rem 1.4rem calc(1.6rem + env(safe-area-inset-bottom))", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem" }}>
          <span className="tve-display" style={{ fontSize: "1.15rem", fontWeight: 700 }}>{FACTS.name}</span>
          <button aria-label={t.nav.close} onClick={() => setMenu(false)} style={{ display: "inline-flex", background: "transparent", border: "1px solid var(--line)", borderRadius: "0.6rem", width: "2.4rem", height: "2.4rem", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--fg)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12" /><path d="M18 6 6 18" /></svg>
          </button>
        </div>
        <nav style={{ display: "flex", flexDirection: "column" }}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="tve-display" style={{ padding: "0.95rem 0.2rem", fontSize: "1.2rem", borderBottom: "1px solid var(--line)" }}>{l.label}</a>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: "1.8rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <LangSelector tone="light" />
          <button onClick={() => { setMenu(false); setModal(true); }} className="tve-btn" style={{ width: "100%", justifyContent: "center", border: "none", cursor: "pointer" }}>{c.heroPrimary}</button>
        </div>
      </aside>

      {/* ░░ HERO immersif — photo plein cadre + dégradé ░░ */}
      <section className="tve-hero">
        <div className="tve-hero-bg">
          <Image src={`${IMG}/photo_00.webp`} alt={`${FACTS.name} — ${trade}`} fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "center" }} />
          <div className="tve-hero-scrim" />
        </div>
        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <Reveal>
            <div style={{ maxWidth: "46rem", paddingBlock: "clamp(4rem, 12vw, 8.5rem)" }}>
              <span className="tve-kicker tve-kicker-hero">{c.heroKicker}</span>
              <h1 className="tve-display" style={{ fontSize: "clamp(2.4rem, 6.5vw, 5rem)", lineHeight: 1.02, letterSpacing: "-0.01em", margin: "1.1rem 0 1.3rem", color: "oklch(0.985 0.012 88)", textShadow: "0 2px 30px oklch(0 0 0 / 0.5)" }}>
                {c.heroTitle}
              </h1>
              <p style={{ fontSize: "clamp(1.04rem, 1.5vw, 1.22rem)", color: "oklch(0.95 0.012 82)", maxWidth: "44ch", margin: "0 0 2rem", textShadow: "0 1px 14px oklch(0 0 0 / 0.5)" }}>
                {c.heroLead}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", alignItems: "center" }}>
                <button onClick={() => setModal(true)} className="tve-btn tve-btn-lg" style={{ border: "none", cursor: "pointer" }}>{c.heroPrimary}</button>
                <a href="#dishes" className="tve-btn tve-btn-outline tve-btn-lg" style={{ color: "oklch(0.98 0.012 85)", borderColor: "oklch(1 0 0 / 0.5)" }}>{c.heroSecondary}</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1.4rem", marginTop: "2rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ display: "flex", gap: "1px", color: "oklch(0.86 0.12 80)" }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill="currentColor" stroke="none" />)}</div>
                  <span style={{ fontSize: "0.95rem", color: "oklch(0.95 0.01 80)" }}><strong>{rating}/5</strong> · {c.ratingMeta}</span>
                </div>
                <div className="tve-hero-hours">
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
      <div className="tve-marquee" aria-hidden>
        <div className="tve-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="tve-marquee-item">
              <span className="tve-display">{m}</span>
              <span className="tve-marquee-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ░░ Story + stats ░░ */}
      <section style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <div className="tve-story" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "center" }}>
            <Reveal>
              <Eyebrow num="01" label={c.storyKicker} />
              <h2 className="tve-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 1.4rem" }}>{c.storyTitle}</h2>
              {c.storyBody.map((p, i) => <p key={i} style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: "0 0 1rem", maxWidth: "54ch" }}>{p}</p>)}
            </Reveal>
            <Reveal delay={120}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {c.stats.map((s, i) => (
                  <div key={i} className="tve-stat">
                    <span className="tve-display" style={{ fontSize: "1.9rem", color: "var(--accent)", lineHeight: 1 }}>{s.n}</span>
                    <span style={{ color: "var(--fg-dim)", fontSize: "0.95rem" }}>{s.l}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ░░ SPÉCIALITÉS — grille de plats ░░ */}
      <section id="dishes" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ maxWidth: "56ch", marginBottom: "2.6rem" }}>
              <Eyebrow num="02" label={c.dishesKicker} />
              <h2 className="tve-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.9rem" }}>{c.dishesTitle}</h2>
              <p style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: 0 }}>{c.dishesLead}</p>
            </div>
          </Reveal>
          <div className="tve-dish-grid">
            {c.dishes.map((d, i) => (
              <Reveal key={d.name} delay={(i % 3) * 70}>
                <article className="tve-dish">
                  <div className="tve-dish-img">
                    <Image src={d.img} alt={d.name} fill sizes="(max-width: 700px) 100vw, 380px" style={{ objectFit: "cover" }} />
                    {d.tag && <span className="tve-dish-tag">{d.tag}</span>}
                    <span className="tve-dish-price">{d.price}</span>
                  </div>
                  <div className="tve-dish-body">
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.6rem" }}>
                      <h3 className="tve-display" style={{ fontSize: "1.3rem", margin: 0 }}>{d.name}</h3>
                      {d.thai && <span style={{ fontSize: "0.95rem", color: "var(--accent)", opacity: 0.85 }}>{d.thai}</span>}
                    </div>
                    <p style={{ color: "var(--fg-dim)", fontSize: "0.95rem", margin: "0.5rem 0 0", lineHeight: 1.5 }}>{d.desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ░░ CARTE — l'ardoise réelle recréée + photo du tableau ░░ */}
      <section id="carte" style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "1.2rem", marginBottom: "2.4rem" }}>
              <div style={{ maxWidth: "52ch" }}>
                <Eyebrow num="03" label={c.menuKicker} />
                <h2 className="tve-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.9rem" }}>{c.menuTitle}</h2>
                <p style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: 0 }}>{c.menuLead}</p>
              </div>
              <span className="tve-price-badge"><UtensilsCrossed size={17} /> {c.menuPriceNote}</span>
            </div>
          </Reveal>

          <div className="tve-menu-layout">
            {/* Colonnes protéines */}
            <Reveal>
              <div className="tve-menu-board">
                <div className="tve-menu-cols">
                  {c.menuColumns.map((col) => (
                    <div key={col.title} className="tve-menu-col">
                      <h3 className="tve-display" style={{ fontSize: "1.12rem", margin: "0 0 0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent)", borderBottom: "1px solid var(--line)", paddingBottom: "0.6rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        <span aria-hidden>{col.icon}</span> {col.title}
                      </h3>
                      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.42rem" }}>
                        {col.items.map((it) => <li key={it} style={{ fontSize: "0.95rem", color: "var(--fg-dim)" }}>{it}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="tve-menu-extras">
                  {[{ t: c.extrasTitle, items: c.extras }, { t: c.dessertsTitle, items: c.desserts }, { t: c.drinksTitle, items: c.drinks }].map((b) => (
                    <div key={b.t}>
                      <h4 className="tve-display" style={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", margin: "0 0 0.6rem" }}>{b.t}</h4>
                      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: "0.4rem 0.9rem" }}>
                        {b.items.map((it) => <li key={it} style={{ fontSize: "0.9rem", color: "var(--fg-dim)" }}>{it}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Photo du vrai tableau */}
            <Reveal delay={120}>
              <figure style={{ margin: 0 }}>
                <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 24px 60px oklch(0 0 0 / 0.3)" }}>
                  <Image src={`${IMG}/photo_06.webp`} alt={c.menuBoardCaption} fill sizes="(max-width: 980px) 92vw, 440px" style={{ objectFit: "cover" }} />
                </div>
                <figcaption style={{ marginTop: "0.7rem", fontSize: "0.84rem", color: "var(--fg-dim)", fontStyle: "italic" }}>{c.menuBoardCaption}</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ░░ AMBIANCE — galerie ░░ */}
      <section id="ambiance" style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)", background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ maxWidth: "56ch", marginBottom: "2.4rem" }}>
              <Eyebrow num="04" label={c.ambianceKicker} />
              <h2 className="tve-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.9rem" }}>{c.ambianceTitle}</h2>
              <p style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: 0 }}>{c.ambianceLead}</p>
            </div>
          </Reveal>
          <div className="tve-gallery">
            <Reveal>
              <figure style={{ margin: 0 }}>
                <div style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                  <Image src={`${IMG}/photo_00.webp`} alt={c.ambianceCaptions[0]} fill sizes="(max-width: 860px) 92vw, 420px" style={{ objectFit: "cover" }} />
                </div>
                <figcaption className="tve-cap">{c.ambianceCaptions[0]}</figcaption>
              </figure>
            </Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Reveal delay={80}>
                <figure style={{ margin: 0 }}>
                  <div style={{ position: "relative", aspectRatio: "16 / 10", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                    <Image src={`${IMG}/photo_08.webp`} alt={c.ambianceCaptions[1]} fill sizes="(max-width: 860px) 92vw, 560px" style={{ objectFit: "cover" }} />
                  </div>
                  <figcaption className="tve-cap">{c.ambianceCaptions[1]}</figcaption>
                </figure>
              </Reveal>
              <Reveal delay={140}>
                <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)" }}>
                  <Image src={`${IMG}/photo_09.webp`} alt="Bouchées vapeur" fill sizes="(max-width: 860px) 92vw, 560px" style={{ objectFit: "cover" }} />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ░░ AVIS ░░ */}
      <section id="avis" style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)" }}>
        <div className="wrap">
          <Reveal>
            <div style={{ maxWidth: "56ch", marginBottom: "2.4rem" }}>
              <Eyebrow num="05" label={c.reviewsKicker} />
              <h2 className="tve-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.9rem" }}>{c.reviewsTitle}</h2>
              <p style={{ color: "var(--fg-dim)", fontSize: "1.06rem", margin: 0 }}>{c.reviewsLead}</p>
            </div>
          </Reveal>
          <div className="tve-reviews">
            {c.reviews.map((r, i) => (
              <Reveal key={i} delay={(i % 2) * 80}>
                <figure className="tve-review">
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
      <section id="infos" style={{ paddingBlock: "clamp(3.4rem, 7vw, 6rem)", background: "var(--bg-2)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap">
          <Reveal>
            <Eyebrow num="06" label={c.infoKicker} />
            <h2 className="tve-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 2.2rem" }}>{c.infoTitle}</h2>
          </Reveal>
          <div className="tve-info">
            <Reveal>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span className="tve-info-ic"><MapPin size={18} /></span>
                  <div><div className="tve-info-l">{c.addressLabel}</div><div style={{ fontWeight: 600 }}>{FACTS.address}</div></div>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span className="tve-info-ic"><Phone size={18} /></span>
                  <div><div className="tve-info-l">{c.phoneLabel}</div><a href={telHref} style={{ fontWeight: 600, color: "var(--fg)" }}>{FACTS.phone}</a></div>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span className="tve-info-ic"><Clock size={18} /></span>
                  <div style={{ minWidth: 0 }}>
                    <div className="tve-info-l">{c.hoursLabel}</div>
                    <table style={{ borderCollapse: "collapse", fontSize: "0.92rem" }}>
                      <tbody>
                        {hours.map((h) => (
                          <tr key={h.d}>
                            <td style={{ padding: "0.15rem 1.2rem 0.15rem 0", color: "var(--fg-dim)" }}>{h.d}</td>
                            <td style={{ padding: "0.15rem 0", fontWeight: h.h.includes("Ferm") || h.h.includes("Closed") ? 400 : 600, color: h.h.includes("Ferm") || h.h.includes("Closed") ? "var(--fg-dim)" : "var(--fg)" }}>{h.h}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <a href={FACTS.mapsUri} target="_blank" rel="noopener noreferrer" className="tve-btn tve-btn-outline" style={{ alignSelf: "flex-start" }}>
                  <MapPin size={16} /> {c.mapsCta}
                </a>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <a
                href={FACTS.mapsUri} target="_blank" rel="noopener noreferrer"
                aria-label={c.mapsCta}
                style={{ position: "relative", display: "block", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid var(--line)", minHeight: "20rem", height: "100%" }}
              >
                <iframe
                  title="Carte — Thaï Vien Express"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${FACTS.lon - 0.006}%2C${FACTS.lat - 0.0032}%2C${FACTS.lon + 0.006}%2C${FACTS.lat + 0.0032}&layer=mapnik&marker=${FACTS.lat}%2C${FACTS.lon}`}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, pointerEvents: "none" }}
                  loading="lazy"
                />
                {/* Épingle dorée par-dessus le marqueur OSM, plus lisible */}
                <span aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -100%)", color: "var(--accent)", filter: "drop-shadow(0 2px 4px oklch(0 0 0 / 0.5))" }}>
                  <MapPin size={34} fill="currentColor" stroke="var(--bg)" strokeWidth={1.5} />
                </span>
                <span style={{ position: "absolute", left: "0.9rem", bottom: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "color-mix(in oklch, var(--bg) 86%, transparent)", color: "var(--fg)", border: "1px solid var(--line)", borderRadius: "0.6rem", padding: "0.5rem 0.8rem", fontSize: "0.84rem", fontWeight: 600, backdropFilter: "blur(6px)" }}>
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
            <div className="tve-closing">
              <div style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
                <Image src={`${IMG}/photo_07.webp`} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
              </div>
              <div className="tve-closing-scrim" />
              <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: "40ch", margin: "0 auto" }}>
                <h2 className="tve-display" style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)", letterSpacing: "-0.01em", margin: "0 0 0.8rem" }}>{c.closingTitle}</h2>
                <p style={{ color: "var(--fg-dim)", fontSize: "1.05rem", margin: "0 0 1.8rem" }}>{c.closingLead}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", justifyContent: "center" }}>
                  <button onClick={() => setModal(true)} className="tve-btn tve-btn-lg" style={{ border: "none", cursor: "pointer" }}>{c.closingPrimary}</button>
                  <a href={telHref} className="tve-btn tve-btn-outline tve-btn-lg"><Phone size={16} /> {c.closingSecondary}</a>
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
              <div aria-hidden style={{ position: "absolute", top: "-30%", right: "-8%", width: "26rem", height: "26rem", maxWidth: "100vw", borderRadius: "50%", background: "radial-gradient(circle, oklch(1 0 0 / 0.12), transparent 60%)", pointerEvents: "none" }} />
              <div className="tve-cta-layout" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "clamp(1.5rem, 4vw, 3rem)" }}>
                <div style={{ flex: "1 1 0", minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.7, marginBottom: "0.8rem" }}>{trade}</span>
                  <h2 className="tve-display" style={{ fontSize: "clamp(1.8rem, 3.8vw, 3rem)", letterSpacing: "-0.01em", margin: "0 0 0.7rem", color: "var(--bg)", lineHeight: 1.1 }}>{t.cta.title}</h2>
                  <p style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)", opacity: 0.82, margin: 0, maxWidth: "44ch", color: "var(--bg)" }}>{t.cta.body}</p>
                </div>
                <div className="tve-cta-search" style={{ flexShrink: 0, minWidth: "min(100%, 22rem)" }}>
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
            <div className="tve-display" style={{ fontSize: "1.15rem", fontWeight: 700 }}>{FACTS.name}</div>
            <div style={{ fontSize: "0.88rem", color: "var(--fg-dim)" }}>{FACTS.address} · {FACTS.phone}</div>
          </div>
          <Link href="/#metiers" className="tve-navlink" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem" }}>
            <ArrowLeft size={15} /> {t.demoCommon.allDemos}
          </Link>
        </div>
      </footer>

      {/* Scroll hint */}
      {showScrollHint && (
        <div className="md:hidden" style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", pointerEvents: "none", animation: "avScrollFadeIn 0.6s ease both" }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", opacity: 0.9 }}>{t.demoCommon.scroll}</span>
          <div style={{ width: 40, height: 40, borderRadius: "999px", display: "grid", placeItems: "center", background: "var(--accent)", animation: "avScrollPulse 1.4s ease-in-out infinite" }}>
            <ChevronDown size={22} color="var(--bg)" strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* Commande — réservation de table OU livraison à domicile (sélecteur dans la modale) */}
      {modal && (
        <OrderModal
          vit="resto"
          services={[]}
          menu={c.dishes.map(d => ({ name: d.name, desc: d.desc, price: d.price }))}
          business={FACTS.name}
          modes={[
            { vit: "resto", label: lang === "en" ? "Dine-in" : "Sur place" },
            { vit: "livraison", label: lang === "en" ? "Delivery" : "Livraison" },
          ]}
          onClose={() => setModal(false)}
        />
      )}

      {/* Bulle Vapi — réception FR (voix MiniMax), couleurs & nom Thaï Vien Express */}
      <VapiWidget slug="thai-viens-express" />

      <style>{`
        .tve-display { font-family: var(--tve-display); }
        .tve-kicker { display: inline-flex; align-items: center; gap: 0.6rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }
        .tve-kicker::before { content: ""; width: 1.7rem; height: 2px; background: var(--accent); }
        /* Kicker du héros : sur la photo, version or clair pour le contraste. */
        .tve-kicker-hero { color: oklch(0.9 0.09 78); }
        .tve-kicker-hero::before { background: oklch(0.9 0.09 78); }
        .tve-navlink { color: var(--fg-dim); transition: color 0.18s var(--ease); }
        .tve-navlink:hover { color: var(--accent); }

        .tve-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.4rem; border-radius: 0.7rem; font-weight: 600; background: var(--accent); color: var(--bg); border: 1px solid var(--accent); cursor: pointer; transition: transform 0.2s var(--ease), filter 0.2s var(--ease), box-shadow 0.2s var(--ease); }
        .tve-btn:hover { transform: translateY(-2px); filter: brightness(1.06); box-shadow: 0 14px 30px oklch(0 0 0 / 0.3); }
        .tve-btn:active { transform: scale(0.97); }
        .tve-btn-lg { padding: 0.9rem 1.7rem; font-size: 1.02rem; }
        .tve-btn-outline { background: transparent; color: var(--fg); border-color: color-mix(in oklch, var(--fg) 35%, transparent); }
        .tve-btn-outline:hover { border-color: var(--accent); color: var(--accent); box-shadow: none; }

        /* HERO */
        .tve-hero { position: relative; isolation: isolate; }
        .tve-hero-bg { position: absolute; inset: 0; z-index: 0; }
        /* Scrim chaud (brun ambré) : lisibilité du texte clair tout en gardant
           une teinte chaleureuse plutôt qu'un noir froid. */
        .tve-hero-scrim { position: absolute; inset: 0; background:
          linear-gradient(100deg, oklch(0.22 0.04 48 / 0.92) 0%, oklch(0.24 0.045 46 / 0.74) 40%, oklch(0.28 0.05 45 / 0.32) 74%, oklch(0.2 0.04 42 / 0.5) 100%); }
        .tve-hero-hours { display: inline-flex; align-items: center; gap: 0.55rem; padding: 0.55rem 0.9rem; border-radius: 0.7rem; background: oklch(0.22 0.03 45 / 0.55); color: oklch(0.96 0.012 82); border: 1px solid oklch(1 0 0 / 0.18); backdrop-filter: blur(6px); }

        /* MARQUEE */
        .tve-marquee { overflow: hidden; border-bottom: 1px solid var(--line); background: var(--accent); color: var(--bg); }
        .tve-marquee-track { display: inline-flex; align-items: center; white-space: nowrap; padding-block: 0.7rem; animation: tveMarquee 30s linear infinite; }
        .tve-marquee-item { display: inline-flex; align-items: center; gap: 1.6rem; font-size: 1.05rem; font-weight: 600; }
        .tve-marquee-item .tve-display { padding-left: 1.6rem; }
        .tve-marquee-dot { opacity: 0.6; }
        @keyframes tveMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .tve-stat { background: var(--surf); border: 1px solid var(--line); border-radius: 1rem; padding: 1.1rem 1.3rem; display: flex; flex-direction: column; gap: 0.25rem; }

        /* DISH GRID */
        .tve-dish-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .tve-dish { background: var(--surf); border: 1px solid var(--line); border-radius: 1.2rem; overflow: hidden; height: 100%; transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease); }
        .tve-dish:hover { transform: translateY(-5px); box-shadow: 0 22px 48px oklch(0.4 0.05 45 / 0.16); }
        .tve-dish-img { position: relative; aspect-ratio: 4 / 3; overflow: hidden; }
        .tve-dish-img img { transition: transform 0.5s var(--ease); }
        .tve-dish:hover .tve-dish-img img { transform: scale(1.06); }
        .tve-dish-tag { position: absolute; top: 0.8rem; left: 0.8rem; background: var(--accent-2); color: oklch(0.98 0.01 80); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; padding: 0.32rem 0.7rem; border-radius: 99px; }
        .tve-dish-price { position: absolute; bottom: 0.8rem; right: 0.8rem; background: var(--accent); color: oklch(0.99 0.01 85); font-weight: 700; font-size: 0.95rem; padding: 0.35rem 0.7rem; border-radius: 0.6rem; box-shadow: 0 6px 16px oklch(0.4 0.08 45 / 0.35); }
        .tve-dish-body { padding: 1.2rem 1.3rem 1.4rem; }

        /* PRICE BADGE */
        .tve-price-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--surf); border: 1px solid var(--accent); color: var(--accent); border-radius: 99px; padding: 0.55rem 1.1rem; font-weight: 700; font-size: 0.95rem; white-space: nowrap; }

        /* MENU */
        .tve-menu-layout { display: grid; grid-template-columns: 1.55fr 1fr; gap: clamp(1.5rem, 4vw, 3rem); align-items: start; }
        .tve-menu-board { background: var(--surf); border: 1px solid var(--line); border-radius: 1.3rem; padding: clamp(1.4rem, 3vw, 2.2rem); }
        .tve-menu-cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.6rem; }
        .tve-menu-extras { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4rem; margin-top: 1.8rem; padding-top: 1.6rem; border-top: 1px dashed var(--line); }

        /* GALLERY */
        .tve-gallery { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 1rem; align-items: start; }
        .tve-cap { margin-top: 0.6rem; font-size: 0.82rem; color: var(--fg-dim); font-style: italic; }

        /* REVIEWS */
        .tve-reviews { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.3rem; }
        .tve-review { margin: 0; background: var(--surf); border: 1px solid var(--line); border-radius: 1.2rem; padding: 1.6rem 1.7rem; height: 100%; }

        /* INFO */
        .tve-info { display: grid; grid-template-columns: 0.95fr 1.05fr; gap: clamp(1.5rem, 4vw, 3rem); align-items: stretch; }
        .tve-info-ic { flex-shrink: 0; width: 2.6rem; height: 2.6rem; border-radius: 0.8rem; display: grid; place-items: center; background: var(--surf); color: var(--accent); border: 1px solid var(--line); }
        .tve-info-l { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-dim); margin-bottom: 0.25rem; }

        /* CLOSING */
        .tve-closing { position: relative; overflow: hidden; border-radius: var(--r-xl); border: 1px solid var(--line); padding: clamp(2.6rem, 7vw, 5rem) clamp(1.5rem, 5vw, 3rem); background: var(--bg-2); }
        /* Voile crème chaud : la photo reste visible en filigrane, texte sombre lisible. */
        .tve-closing-scrim { position: absolute; inset: 0; background: radial-gradient(circle at 50% 35%, oklch(0.97 0.02 72 / 0.62), oklch(0.95 0.026 66 / 0.93)); }

        @keyframes avScrollPulse {
          0% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--accent) 65%, transparent); transform: translateY(0); }
          50% { box-shadow: 0 0 0 10px transparent; transform: translateY(4px); }
          100% { box-shadow: 0 0 0 0 transparent; transform: translateY(0); }
        }
        @keyframes avScrollFadeIn { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }

        @media (min-width: 860px) { .tve-burger, .tve-sidebar, .tve-overlay { display: none !important; } }
        @media (max-width: 859px) { .tve-nav-desktop { display: none !important; } }
        @media (max-width: 980px) {
          .tve-menu-layout { grid-template-columns: 1fr; }
          .tve-info { grid-template-columns: 1fr; }
          .tve-story { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 760px) {
          .tve-dish-grid { grid-template-columns: 1fr 1fr; }
          .tve-menu-cols { grid-template-columns: 1fr 1fr; gap: 1.3rem; }
          .tve-menu-extras { grid-template-columns: 1fr; }
          .tve-reviews { grid-template-columns: 1fr; }
          .tve-gallery { grid-template-columns: 1fr; }
          .tve-cta-layout { flex-direction: column; align-items: stretch; }
          .tve-cta-search { min-width: 0 !important; }
        }
        @media (max-width: 520px) {
          .tve-dish-grid { grid-template-columns: 1fr; }
          .tve-menu-cols { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) { .demo-ribbon .ribbon-mid { display: none; } }
      `}</style>
    </div>
  );
}
