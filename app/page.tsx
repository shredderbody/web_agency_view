import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, CalendarCheck, Check, Compass,
  PenTool, Rocket, Sparkles, Star, Store, Wrench,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import { DEMOS } from "@/lib/demos";

const TRADES = [
  "Barbiers", "Ongleries", "Charcutiers", "Traiteurs", "Restaurants",
  "Coiffeurs", "Fleuristes", "Cavistes", "Pâtissiers", "Instituts", "Cafés", "Boulangers",
];

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="grain" style={{ position: "relative", paddingTop: "7.5rem", paddingBottom: "clamp(3rem, 6vw, 5rem)", overflow: "hidden" }}>
          <div
            aria-hidden
            style={{
              position: "absolute", top: "-12%", right: "-8%", width: "46rem", height: "46rem", borderRadius: "50%",
              background: "radial-gradient(circle, oklch(0.605 0.2 33 / 0.10), transparent 62%)", pointerEvents: "none",
            }}
          />
          <div className="wrap" style={{ position: "relative" }}>
            <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(2rem, 5vw, 4.5rem)", alignItems: "center" }}>
              <div>
                <Reveal>
                  <span className="chip chip-accent" style={{ marginBottom: "1.5rem" }}>
                    <Sparkles size={15} /> Studio web pour commerces de quartier
                  </span>
                </Reveal>
                <Reveal delay={70}>
                  <h1 className="d-hero" style={{ margin: "0 0 1.3rem" }}>
                    Une vitrine
                    <br />
                    qui donne envie
                    <br />
                    de <span className="serif-accent" style={{ color: "var(--vermilion-deep)" }}>pousser la porte.</span>
                  </h1>
                </Reveal>
                <Reveal delay={140}>
                  <p style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.25rem)", color: "var(--ink-dim)", maxWidth: "46ch", margin: "0 0 2rem" }}>
                    On dessine le site web de votre commerce, puis on vous le montre en ligne avant que vous décidiez. Vous voyez votre future vitrine pour de vrai, pas une promesse sur un devis.
                  </p>
                </Reveal>
                <Reveal delay={210}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                    <a href="#demos" className="btn btn-primary btn-lg">
                      Voir les vitrines de démo <ArrowRight size={18} />
                    </a>
                    <a href="#contact" className="btn btn-ghost btn-lg">
                      Parler de mon projet
                    </a>
                  </div>
                </Reveal>
                <Reveal delay={290}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginTop: "2.2rem", color: "var(--ink-muted)", fontSize: "0.92rem" }}>
                    <div style={{ display: "flex", gap: "2px", color: "var(--clay-deep)" }}>
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" stroke="none" />)}
                    </div>
                    <span>Noté 4,9/5 par 60+ commerçants accompagnés</span>
                  </div>
                </Reveal>
              </div>

              {/* Hero visual: browser frame + floating portrait */}
              <Reveal delay={180}>
                <div style={{ position: "relative" }}>
                  <div className="frame" style={{ transform: "rotate(0.6deg)" }}>
                    <div className="frame-bar">
                      <span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" />
                      <span className="frame-url">maison-brutus.fr</span>
                    </div>
                    <div style={{ position: "relative", aspectRatio: "16 / 11" }}>
                      <Image src="/characters/barber-scene.webp" alt="Aperçu de la vitrine d'un barbier dans son salon" fill priority sizes="(max-width: 880px) 90vw, 520px" style={{ objectFit: "cover" }} />
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute", bottom: "-1.6rem", left: "-1.4rem", width: "8.5rem",
                      borderRadius: "1rem", overflow: "hidden", border: "4px solid var(--paper)", boxShadow: "var(--shadow)",
                      transform: "rotate(-3deg)",
                    }}
                  >
                    <div style={{ position: "relative", aspectRatio: "3 / 4" }}>
                      <Image src="/characters/barbershop-portrait.webp" alt="Portrait du barbier, généré sur-mesure" fill sizes="140px" style={{ objectFit: "cover" }} />
                    </div>
                  </div>
                  <div
                    className="card"
                    style={{
                      position: "absolute", top: "-1.3rem", right: "-0.6rem", padding: "0.7rem 1rem",
                      display: "flex", alignItems: "center", gap: "0.6rem", boxShadow: "var(--shadow)",
                    }}
                  >
                    <span style={{ width: "2.1rem", height: "2.1rem", borderRadius: "0.6rem", display: "grid", placeItems: "center", background: "var(--vermilion-soft)", color: "var(--vermilion-deep)" }}>
                      <CalendarCheck size={17} />
                    </span>
                    <div style={{ lineHeight: 1.15 }}>
                      <strong style={{ fontSize: "0.95rem" }}>+38 rendez-vous</strong>
                      <div style={{ fontSize: "0.76rem", color: "var(--ink-muted)" }}>ce mois, en ligne</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─── MARQUEE TRADES ───────────────────────────────── */}
        <section style={{ paddingBlock: "1.4rem", borderBlock: "1px solid var(--border)", background: "var(--paper-2)" }}>
          <div className="marquee">
            <div className="marquee-track">
              {[...TRADES, ...TRADES].map((t, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.7rem", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.25rem", color: "var(--ink-dim)", whiteSpace: "nowrap" }}>
                  {t}
                  <span style={{ color: "var(--vermilion)", fontSize: "0.7rem" }}>✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PITCH ────────────────────────────────────────── */}
        <section style={{ paddingBlock: "clamp(4rem, 8vw, 7rem)" }}>
          <div className="wrap">
            <div className="pitch-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(2rem, 5vw, 5rem)", alignItems: "end" }}>
              <Reveal>
                <span className="kicker" style={{ marginBottom: "1.2rem" }}>Le constat</span>
                <h2 className="d-xl" style={{ margin: 0 }}>
                  Vos clients vous cherchent en ligne. Ils tombent sur trois photos floues.
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p style={{ fontSize: "1.12rem", color: "var(--ink-dim)", margin: 0 }}>
                  Une fiche Google ne raconte pas votre savoir-faire. Une vraie vitrine, si : elle montre votre univers, met en avant vos prestations et transforme un curieux en client qui réserve. C'est exactement ce qu'on construit, métier par métier.
                </p>
              </Reveal>
            </div>

            <div className="figures" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0", marginTop: "clamp(2.5rem, 5vw, 4rem)", borderTop: "1px solid var(--border)" }}>
              {[
                { n: "75%", l: "des clients jugent un commerce crédible d'abord sur son site." },
                { n: "2,6×", l: "plus de prises de contact avec une vitrine soignée qu'une simple fiche." },
                { n: "7 j", l: "en moyenne pour voir votre démo en ligne, à votre nom." },
              ].map((f, i) => (
                <Reveal key={i} delay={i * 90}>
                  <div style={{ padding: "1.8rem 1.4rem 0.4rem", borderLeft: i === 0 ? "none" : "1px solid var(--border)" }}>
                    <div className="d-xl" style={{ color: "var(--vermilion-deep)", lineHeight: 1 }}>{f.n}</div>
                    <p style={{ color: "var(--ink-dim)", margin: "0.7rem 0 0", maxWidth: "32ch" }}>{f.l}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DEMOS (alternating editorial rows) ───────────── */}
        <section id="demos" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--paper-2)", borderBlock: "1px solid var(--border)" }}>
          <div className="wrap">
            <Reveal>
              <div style={{ maxWidth: "60ch", marginBottom: "clamp(2.5rem, 5vw, 4rem)" }}>
                <span className="kicker" style={{ marginBottom: "1.1rem" }}>Vitrines de démonstration</span>
                <h2 className="d-xl" style={{ margin: "0 0 1rem" }}>Poussez la porte. Chaque démo est un site complet.</h2>
                <p style={{ fontSize: "1.1rem", color: "var(--ink-dim)", margin: 0 }}>
                  Quatre univers, quatre métiers, le même soin. Cliquez : vous visitez une vitrine réelle, navigable, exactement comme celle qu'on vous prépare.
                </p>
              </div>
            </Reveal>

            <div style={{ display: "grid", gap: "clamp(1.5rem, 3vw, 2.5rem)" }}>
              {DEMOS.map((d, i) => (
                <Reveal key={d.slug} delay={(i % 2) * 80}>
                  <Link href={`/demo/${d.slug}`} className="demo-row card card-hover" style={{ display: "grid", gridTemplateColumns: i % 2 === 0 ? "1.15fr 1fr" : "1fr 1.15fr", overflow: "hidden", minHeight: "20rem" }}>
                    <div style={{ position: "relative", minHeight: "16rem", order: i % 2 === 0 ? 0 : 1 }}>
                      <Image src={d.cover} alt={`Vitrine ${d.business}, ${d.trade.toLowerCase()} à ${d.city}`} fill sizes="(max-width: 820px) 100vw, 600px" style={{ objectFit: "cover" }} />
                      <span style={{ position: "absolute", top: "1rem", left: "1rem" }} className="chip">{d.trade}</span>
                    </div>
                    <div style={{ padding: "clamp(1.6rem, 3vw, 2.6rem)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
                        {d.swatches.map((s) => (
                          <span key={s} style={{ width: "1.5rem", height: "1.5rem", borderRadius: "0.45rem", background: s, border: "1px solid var(--border)" }} />
                        ))}
                        <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", alignSelf: "center", marginLeft: "0.3rem" }}>{d.accentLabel}</span>
                      </div>
                      <h3 className="d-lg" style={{ margin: "0 0 0.2rem" }}>{d.business}</h3>
                      <p style={{ color: "var(--ink-muted)", margin: "0 0 0.9rem", fontWeight: 500 }}>{d.city}</p>
                      <p style={{ color: "var(--ink-dim)", margin: "0 0 1.6rem", maxWidth: "44ch" }}>{d.tagline}</p>
                      <span className="link-arrow" style={{ fontSize: "1.02rem" }}>
                        Visiter la vitrine <ArrowUpRight size={19} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── MÉTIERS ──────────────────────────────────────── */}
        <section id="metiers" style={{ paddingBlock: "clamp(4rem, 8vw, 7rem)" }}>
          <div className="wrap">
            <div className="metiers-grid" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "clamp(2rem, 5vw, 4.5rem)", alignItems: "center" }}>
              <Reveal>
                <span className="kicker" style={{ marginBottom: "1.1rem" }}>Pour qui</span>
                <h2 className="d-xl" style={{ margin: "0 0 1.2rem" }}>On parle la langue des commerces de proximité.</h2>
                <p style={{ fontSize: "1.1rem", color: "var(--ink-dim)", marginBottom: "1.8rem" }}>
                  Chaque métier a ses codes, ses photos, ses moments forts. On les connaît. Votre vitrine n'a pas l'air d'un modèle : elle a l'air de chez vous.
                </p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.85rem" }}>
                  {[
                    "Une identité visuelle propre à votre métier",
                    "Réservation, click & collect ou devis selon vos besoins",
                    "Pensé mobile d'abord, là où vos clients vous trouvent",
                    "Trouvable sur Google dans votre quartier",
                  ].map((t) => (
                    <li key={t} style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                      <span style={{ flexShrink: 0, marginTop: "0.15rem", width: "1.45rem", height: "1.45rem", borderRadius: "99px", display: "grid", placeItems: "center", background: "var(--vermilion-soft)", color: "var(--vermilion-deep)" }}>
                        <Check size={14} strokeWidth={3} />
                      </span>
                      <span style={{ color: "var(--ink)" }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={120}>
                <div className="metiers-collage" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                  {[
                    { src: "/characters/barber-detail.webp", alt: "Tondeuse et outils de barbier sur le cuir", tall: true },
                    { src: "/characters/onglerie-detail.webp", alt: "Mains manucurées, pose de gel" },
                    { src: "/characters/traiteur-detail.webp", alt: "Planche de charcuterie et terrines maison" },
                    { src: "/characters/restaurant-detail.webp", alt: "Assiette de bistrot dressée", tall: true },
                  ].map((im, i) => (
                    <div key={i} style={{ position: "relative", borderRadius: "1rem", overflow: "hidden", aspectRatio: im.tall ? "3 / 4" : "1 / 1", border: "1px solid var(--border)", marginTop: i === 1 ? "1.8rem" : 0 }}>
                      <Image src={im.src} alt={im.alt} fill sizes="(max-width: 820px) 45vw, 240px" style={{ objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─── INCLUS / SERVICES ────────────────────────────── */}
        <section style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--ink)", color: "var(--paper)" }}>
          <div className="wrap">
            <Reveal>
              <span className="kicker" style={{ marginBottom: "1.1rem", color: "var(--clay)" }}>Ce qui est inclus</span>
              <h2 className="d-xl" style={{ margin: "0 0 2.8rem", maxWidth: "20ch" }}>Tout pour ouvrir, rien à gérer seul.</h2>
            </Reveal>
            <div className="incl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.5rem 3rem" }}>
              {[
                { icon: PenTool, t: "Design sur-mesure", d: "Un univers dessiné pour votre métier : couleurs, typographies, photos. Pas de thème recyclé." },
                { icon: Store, t: "Vitrine complète", d: "Accueil, prestations, galerie, avis, accès et contact. Tout ce qu'un client veut savoir avant de venir." },
                { icon: CalendarCheck, t: "Réservation intégrée", d: "Rendez-vous, click & collect ou formulaire de devis, branchés sur l'outil adapté à votre activité." },
                { icon: Compass, t: "Visibilité locale", d: "Optimisation pour la recherche de quartier et synchronisation avec votre fiche Google." },
                { icon: Wrench, t: "Suivi et retouches", d: "Horaires, prix, photos : on ajuste avec vous. Une retouche incluse chaque mois." },
                { icon: Rocket, t: "Mise en ligne rapide", d: "Hébergement, nom de domaine, sécurité et performance gérés de bout en bout." },
              ].map((s, i) => (
                <Reveal key={i} delay={(i % 3) * 80}>
                  <div>
                    <span style={{ display: "inline-grid", placeItems: "center", width: "2.8rem", height: "2.8rem", borderRadius: "0.8rem", background: "oklch(0.97 0.01 80 / 0.08)", color: "var(--clay)", marginBottom: "1.1rem" }}>
                      <s.icon size={22} />
                    </span>
                    <h3 className="d-md" style={{ margin: "0 0 0.5rem", color: "var(--paper)" }}>{s.t}</h3>
                    <p style={{ color: "oklch(0.84 0.01 80)", margin: 0, maxWidth: "34ch" }}>{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── MÉTHODE ──────────────────────────────────────── */}
        <section id="methode" style={{ paddingBlock: "clamp(4rem, 8vw, 7rem)" }}>
          <div className="wrap">
            <Reveal>
              <div style={{ maxWidth: "56ch", marginBottom: "clamp(2.5rem, 5vw, 3.5rem)" }}>
                <span className="kicker" style={{ marginBottom: "1.1rem" }}>La méthode</span>
                <h2 className="d-xl" style={{ margin: 0 }}>Quatre étapes, zéro jargon.</h2>
              </div>
            </Reveal>
            <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0" }}>
              {[
                { n: "01", t: "On vous écoute", d: "Un appel de 20 minutes pour comprendre votre métier, vos clients et vos envies." },
                { n: "02", t: "On dessine la démo", d: "On crée votre vitrine à votre nom, photos et textes compris, et on vous l'envoie en ligne." },
                { n: "03", t: "Vous ajustez", d: "Vous visitez, vous commentez. On retouche jusqu'à ce que ce soit vraiment vous." },
                { n: "04", t: "On met en ligne", d: "Domaine, hébergement, Google : on s'occupe de tout. Vous ouvrez votre vitrine." },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 90}>
                  <div style={{ padding: "0 1.4rem", borderLeft: i === 0 ? "none" : "1px solid var(--border)", height: "100%" }}>
                    <div className="d-lg" style={{ color: "var(--vermilion)", margin: "0 0 1rem", fontFamily: "var(--font-display)" }}>{s.n}</div>
                    <h3 className="d-md" style={{ margin: "0 0 0.5rem" }}>{s.t}</h3>
                    <p style={{ color: "var(--ink-dim)", margin: 0 }}>{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PREUVE / TÉMOIGNAGE ──────────────────────────── */}
        <section style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--paper-2)", borderBlock: "1px solid var(--border)" }}>
          <div className="wrap">
            <div className="proof-grid" style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: "clamp(2rem, 5vw, 4rem)", alignItems: "center" }}>
              <Reveal>
                <div style={{ position: "relative", borderRadius: "var(--r-lg)", overflow: "hidden", aspectRatio: "4 / 5", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                  <Image src="/characters/traiteur-portrait.webp" alt="Bernard, charcutier-traiteur, devant son comptoir" fill sizes="(max-width: 820px) 80vw, 360px" style={{ objectFit: "cover" }} />
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div style={{ display: "flex", gap: "2px", color: "var(--clay-deep)", marginBottom: "1.3rem" }}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={20} fill="currentColor" stroke="none" />)}
                </div>
                <blockquote className="d-lg" style={{ margin: "0 0 1.6rem", fontWeight: 500, letterSpacing: "-0.015em" }}>
                  « Les gens arrivent en boutique le sourire aux lèvres : ils ont vu nos terrines sur le site et savent déjà quoi commander. En trois semaines, les commandes de plateaux ont doublé. »
                </blockquote>
                <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                  <div>
                    <strong style={{ display: "block", fontSize: "1.05rem" }}>Bernard Ferrand</strong>
                    <span style={{ color: "var(--ink-muted)" }}>Maison Ferrand, charcutier-traiteur à Annecy</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─── TARIFS ───────────────────────────────────────── */}
        <section id="tarifs" style={{ paddingBlock: "clamp(4rem, 8vw, 7rem)" }}>
          <div className="wrap">
            <Reveal>
              <div style={{ maxWidth: "56ch", marginBottom: "clamp(2.5rem, 5vw, 3.5rem)" }}>
                <span className="kicker" style={{ marginBottom: "1.1rem" }}>Tarifs</span>
                <h2 className="d-xl" style={{ margin: "0 0 1rem" }}>Un prix clair, annoncé avant de commencer.</h2>
                <p style={{ fontSize: "1.1rem", color: "var(--ink-dim)", margin: 0 }}>Création unique, puis un abonnement simple pour l'hébergement et le suivi. Sans engagement piège.</p>
              </div>
            </Reveal>
            <div className="price-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.4rem", alignItems: "stretch" }}>
              {[
                { name: "Essentielle", price: "690 €", sub: "+ 19 €/mois", tag: "", feats: ["Vitrine une page soignée", "Photos et textes inclus", "Mobile et Google ready", "Mise en ligne en 7 jours"], cta: "Démarrer" },
                { name: "Atelier", price: "1 290 €", sub: "+ 39 €/mois", tag: "Le plus choisi", feats: ["Vitrine multi-pages complète", "Réservation ou click & collect", "Univers visuel sur-mesure", "1 retouche incluse / mois", "Suivi des performances"], cta: "Choisir Atelier" },
                { name: "Signature", price: "Sur devis", sub: "projet dédié", tag: "", feats: ["Conception 100% sur-mesure", "Fonctions avancées (boutique, espace membre)", "Séance photo de votre commerce", "Accompagnement prioritaire"], cta: "En parler" },
              ].map((p, i) => {
                const featured = p.tag !== "";
                return (
                  <Reveal key={i} delay={i * 90}>
                    <div
                      className="card"
                      style={{
                        height: "100%", display: "flex", flexDirection: "column", padding: "1.9rem 1.7rem",
                        background: featured ? "var(--ink)" : "var(--surface)", color: featured ? "var(--paper)" : "var(--ink)",
                        borderColor: featured ? "var(--ink)" : "var(--border)",
                        transform: featured ? "translateY(-0.6rem)" : "none", boxShadow: featured ? "var(--shadow-lg)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", minHeight: "1.6rem" }}>
                        <h3 className="d-md" style={{ margin: 0, color: featured ? "var(--paper)" : "var(--ink)" }}>{p.name}</h3>
                        {featured && <span className="chip" style={{ background: "var(--vermilion)", color: "var(--surface)", border: "none" }}>{p.tag}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2.4rem", letterSpacing: "-0.03em", color: featured ? "var(--clay)" : "var(--vermilion-deep)" }}>{p.price}</span>
                        <span style={{ color: featured ? "oklch(0.82 0.01 80)" : "var(--ink-muted)", fontSize: "0.92rem" }}>{p.sub}</span>
                      </div>
                      <ul style={{ listStyle: "none", margin: "0 0 1.8rem", padding: 0, display: "grid", gap: "0.7rem", flex: 1 }}>
                        {p.feats.map((f) => (
                          <li key={f} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", color: featured ? "oklch(0.88 0.01 80)" : "var(--ink-dim)" }}>
                            <Check size={17} strokeWidth={2.6} style={{ flexShrink: 0, marginTop: "0.15rem", color: featured ? "var(--clay)" : "var(--vermilion)" }} />
                            <span>{f}</span>
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

        {/* ─── FAQ ──────────────────────────────────────────── */}
        <section id="faq" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--paper-2)", borderBlock: "1px solid var(--border)" }}>
          <div className="wrap wrap-tight">
            <Reveal>
              <div style={{ marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
                <span className="kicker" style={{ marginBottom: "1.1rem" }}>Questions fréquentes</span>
                <h2 className="d-xl" style={{ margin: 0 }}>Ce qu'on nous demande souvent.</h2>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <Faq />
            </Reveal>
          </div>
        </section>

        {/* ─── CTA FINAL ────────────────────────────────────── */}
        <section id="contact" style={{ paddingBlock: "clamp(4rem, 8vw, 7rem)" }}>
          <div className="wrap">
            <Reveal>
              <div
                className="grain"
                style={{
                  position: "relative", overflow: "hidden", borderRadius: "var(--r-xl)",
                  background: "var(--vermilion-deep)", color: "var(--surface)",
                  padding: "clamp(2.5rem, 6vw, 4.5rem)",
                }}
              >
                <div aria-hidden style={{ position: "absolute", top: "-30%", right: "-10%", width: "30rem", height: "30rem", borderRadius: "50%", background: "radial-gradient(circle, oklch(0.74 0.11 66 / 0.4), transparent 60%)" }} />
                <div style={{ position: "relative", maxWidth: "40ch" }}>
                  <h2 className="d-xl" style={{ margin: "0 0 1.1rem", color: "var(--surface)" }}>
                    On vous prépare une démo. Gratuite, à votre nom.
                  </h2>
                  <p style={{ fontSize: "1.15rem", color: "oklch(0.96 0.02 40)", margin: "0 0 2rem" }}>
                    Dites-nous votre métier et votre ville. Sous 7 jours, vous recevez le lien d'une vitrine pensée pour vous. Vous décidez ensuite, en connaissance de cause.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                    <a href="mailto:bonjour@atelier-vitrine.fr" className="btn btn-lg" style={{ background: "var(--surface)", color: "var(--ink)" }}>
                      Demander ma démo gratuite <ArrowRight size={18} />
                    </a>
                    <a href="tel:+33400000000" className="btn btn-lg btn-ghost" style={{ color: "var(--surface)", borderColor: "oklch(1 0 0 / 0.4)" }}>
                      Nous appeler
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        @media (max-width: 880px) {
          .hero-grid, .pitch-grid, .metiers-grid, .proof-grid { grid-template-columns: 1fr !important; }
          .figures, .incl-grid, .steps-grid, .price-grid { grid-template-columns: 1fr !important; }
          .figures > div, .steps-grid > div > div { border-left: none !important; }
          .demo-row { grid-template-columns: 1fr !important; }
          .demo-row > div:first-child { order: 0 !important; }
        }
        @media (min-width: 881px) and (max-width: 1100px) {
          .incl-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}
