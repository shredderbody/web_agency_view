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
import { DEMOS } from "@/lib/demos";

// Ce que le site apporte concrètement, par corps de métier (affiché sur la card).
const METIER_HIGHLIGHT: Record<string, string> = {
  barbershop: "Prise de rendez-vous en ligne",
  onglerie: "Réservation de soins 24h/24",
  traiteur: "Commande de plateaux en ligne",
  restaurant: "Réservation de table + menu",
};

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        {/* ─── HERO — créateur de sites web ─────────────────── */}
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
                    <Sparkles size={15} /> Créateur de sites web pour commerces
                  </span>
                </Reveal>
                <Reveal delay={70}>
                  <h1 className="d-hero" style={{ margin: "0 0 1.3rem" }}>
                    Je crée le site
                    <br />
                    web de votre
                    <br />
                    <span className="serif-accent" style={{ color: "var(--vermilion-deep)" }}>commerce.</span>
                  </h1>
                </Reveal>
                <Reveal delay={140}>
                  <p style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.25rem)", color: "var(--ink-dim)", maxWidth: "47ch", margin: "0 0 2rem" }}>
                    Conception, design et mise en ligne de vitrines web sur-mesure pour les artisans et commerces de proximité. Choisissez votre métier ci-dessous : vous verrez un site complet, déjà pensé pour vous.
                  </p>
                </Reveal>
                <Reveal delay={210}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                    <a href="#metiers" className="btn btn-primary btn-lg">
                      Choisir mon métier <ArrowRight size={18} />
                    </a>
                    <a href="#contact" className="btn btn-ghost btn-lg">
                      Demander un devis
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

              {/* Hero visual: le studio au travail (neutre, pas de métier précis) */}
              <Reveal delay={180}>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "relative", aspectRatio: "16 / 12", borderRadius: "1.4rem", overflow: "hidden", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-lg)" }}>
                    <Image src="/studio/hero-desk.webp" alt="Atelier de création web : un site de commerce en cours de design sur un ordinateur portable" fill priority sizes="(max-width: 880px) 90vw, 520px" style={{ objectFit: "cover" }} />
                  </div>
                  <div
                    className="card"
                    style={{
                      position: "absolute", bottom: "-1.4rem", left: "-1.2rem", padding: "0.75rem 1.05rem",
                      display: "flex", alignItems: "center", gap: "0.6rem", boxShadow: "var(--shadow)",
                    }}
                  >
                    <span style={{ width: "2.1rem", height: "2.1rem", borderRadius: "0.6rem", display: "grid", placeItems: "center", background: "var(--vermilion-soft)", color: "var(--vermilion-deep)" }}>
                      <Clock size={17} />
                    </span>
                    <div style={{ lineHeight: 1.15 }}>
                      <strong style={{ fontSize: "0.95rem" }}>Démo en 7 jours</strong>
                      <div style={{ fontSize: "0.76rem", color: "var(--ink-muted)" }}>à votre nom, gratuite</div>
                    </div>
                  </div>
                  <div
                    className="card"
                    style={{
                      position: "absolute", top: "-1.3rem", right: "-0.6rem", padding: "0.7rem 1rem",
                      display: "flex", alignItems: "center", gap: "0.6rem", boxShadow: "var(--shadow)",
                    }}
                  >
                    <span style={{ width: "2.1rem", height: "2.1rem", borderRadius: "0.6rem", display: "grid", placeItems: "center", background: "var(--ink)", color: "var(--paper)" }}>
                      <PenTool size={16} />
                    </span>
                    <div style={{ lineHeight: 1.15 }}>
                      <strong style={{ fontSize: "0.95rem" }}>100% sur-mesure</strong>
                      <div style={{ fontSize: "0.76rem", color: "var(--ink-muted)" }}>jamais un thème recyclé</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─── VALEUR (générique : ce que je fais) ──────────── */}
        <section style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)" }}>
          <div className="wrap">
            <div className="pitch-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(2rem, 5vw, 5rem)", alignItems: "end" }}>
              <Reveal>
                <span className="kicker" style={{ marginBottom: "1.2rem" }}>Ce que je fais</span>
                <h2 className="d-xl" style={{ margin: 0 }}>
                  Un seul interlocuteur, du design à la mise en ligne.
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p style={{ fontSize: "1.12rem", color: "var(--ink-dim)", margin: 0 }}>
                  Je dessine, j'écris, je développe et j'héberge votre vitrine. Pas d'agence à étages ni de jargon : vous parlez à la personne qui fabrique votre site, et vous le voyez en ligne avant de vous engager.
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

        {/* ─── CARDS PAR MÉTIER (pièce centrale) ─────────────── */}
        <section id="metiers" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--paper-2)", borderBlock: "1px solid var(--border)" }}>
          <div className="wrap">
            <Reveal>
              <div style={{ maxWidth: "62ch", marginBottom: "clamp(2.5rem, 5vw, 3.5rem)" }}>
                <span className="kicker" style={{ marginBottom: "1.1rem" }}>Choisissez votre métier</span>
                <h2 className="d-xl" style={{ margin: "0 0 1rem" }}>Votre métier a son propre site. Cliquez pour le voir en entier.</h2>
                <p style={{ fontSize: "1.1rem", color: "var(--ink-dim)", margin: 0 }}>
                  Chaque métier a ses codes, ses photos, ses moments forts. Voici un site complet et navigable conçu pour chacun. Trouvez le vôtre et projetez-vous.
                </p>
              </div>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "clamp(1.2rem, 2.5vw, 1.8rem)" }}>
              {DEMOS.map((d, i) => (
                <Reveal key={d.slug} delay={(i % 2) * 80}>
                  <Link href={`/demo/${d.slug}`} className="card card-hover metier-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
                    <div style={{ position: "relative", aspectRatio: "16 / 11" }}>
                      <Image src={d.cover} alt={`Site web pour ${d.trade.toLowerCase()} (exemple : ${d.business})`} fill sizes="(max-width: 700px) 100vw, 420px" style={{ objectFit: "cover" }} />
                      <span className="chip" style={{ position: "absolute", top: "0.9rem", left: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        <Check size={13} strokeWidth={3} style={{ color: "var(--vermilion-deep)" }} /> {METIER_HIGHLIGHT[d.slug]}
                      </span>
                    </div>
                    <div style={{ padding: "1.5rem 1.6rem 1.7rem", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h3 className="d-lg" style={{ margin: "0 0 0.5rem" }}>{d.trade}</h3>
                      <p style={{ color: "var(--ink-dim)", margin: "0 0 1.4rem", flex: 1 }}>{d.tagline}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1.1rem" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>Exemple : {d.business} · {d.city}</span>
                        <span className="link-arrow" style={{ fontSize: "0.98rem" }}>
                          Voir la page <ArrowUpRight size={18} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <p style={{ textAlign: "center", marginTop: "2.5rem", color: "var(--ink-muted)" }}>
                Votre métier n'est pas listé ? <a href="#contact" className="link-arrow" style={{ display: "inline-flex" }}>Parlons-en <ArrowRight size={15} /></a>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── INCLUS / SERVICES (générique) ────────────────── */}
        <section style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)", background: "var(--ink)", color: "var(--paper)" }}>
          <div className="wrap">
            <Reveal>
              <span className="kicker" style={{ marginBottom: "1.1rem", color: "var(--clay)" }}>Ce qui est inclus</span>
              <h2 className="d-xl" style={{ margin: "0 0 2.8rem", maxWidth: "20ch" }}>Tout pour ouvrir, rien à gérer seul.</h2>
            </Reveal>
            <div className="incl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.5rem 3rem" }}>
              {[
                { icon: PenTool, t: "Design sur-mesure", d: "Un univers dessiné pour votre métier : couleurs, typographies, photos. Pas de thème recyclé." },
                { icon: Store, t: "Vitrine complète", d: "Accueil, prestations, galerie, avis, accès et contact. Tout ce qu'un client veut savoir avant de venir." },
                { icon: Clock, t: "Réservation intégrée", d: "Rendez-vous, click & collect ou formulaire de devis, branchés sur l'outil adapté à votre activité." },
                { icon: Compass, t: "Visibilité locale", d: "Optimisation pour la recherche de quartier et synchronisation avec votre fiche Google." },
                { icon: Wrench, t: "Suivi et retouches", d: "Horaires, prix, photos : on ajuste ensemble. Une retouche incluse chaque mois." },
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

        {/* ─── MÉTHODE (générique) ──────────────────────────── */}
        <section id="methode" style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)" }}>
          <div className="wrap">
            <Reveal>
              <div style={{ maxWidth: "56ch", marginBottom: "clamp(2.5rem, 5vw, 3.5rem)" }}>
                <span className="kicker" style={{ marginBottom: "1.1rem" }}>La méthode</span>
                <h2 className="d-xl" style={{ margin: 0 }}>Quatre étapes, zéro jargon.</h2>
              </div>
            </Reveal>
            <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0" }}>
              {[
                { n: "01", t: "On échange", d: "Un appel de 20 minutes pour comprendre votre métier, vos clients et vos envies." },
                { n: "02", t: "Je dessine la démo", d: "Je crée votre vitrine à votre nom, photos et textes compris, et je vous l'envoie en ligne." },
                { n: "03", t: "Vous ajustez", d: "Vous visitez, vous commentez. Je retouche jusqu'à ce que ce soit vraiment vous." },
                { n: "04", t: "Mise en ligne", d: "Domaine, hébergement, Google : je m'occupe de tout. Vous ouvrez votre vitrine." },
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

        {/* ─── TARIFS (générique) ───────────────────────────── */}
        <section id="tarifs" style={{ paddingBlock: "clamp(3rem, 6vw, 5rem)", background: "var(--paper-2)", borderBlock: "1px solid var(--border)" }}>
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
        <section id="faq" style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)" }}>
          <div className="wrap wrap-tight">
            <Reveal>
              <div style={{ marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
                <span className="kicker" style={{ marginBottom: "1.1rem" }}>Questions fréquentes</span>
                <h2 className="d-xl" style={{ margin: 0 }}>Ce qu'on me demande souvent.</h2>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <Faq />
            </Reveal>
          </div>
        </section>

        {/* ─── CTA FINAL ────────────────────────────────────── */}
        <section id="contact" style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)" }}>
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
                <div style={{ position: "relative", maxWidth: "42ch" }}>
                  <h2 className="d-xl" style={{ margin: "0 0 1.1rem", color: "var(--surface)" }}>
                    Je vous prépare une démo. Gratuite, à votre nom.
                  </h2>
                  <p style={{ fontSize: "1.15rem", color: "oklch(0.96 0.02 40)", margin: "0 0 2rem" }}>
                    Dites-moi votre métier et votre ville. Sous 7 jours, vous recevez le lien d'une vitrine pensée pour vous. Vous décidez ensuite, en connaissance de cause.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                    <a href="mailto:bonjour@atelier-vitrine.fr" className="btn btn-lg" style={{ background: "var(--surface)", color: "var(--ink)" }}>
                      Demander ma démo gratuite <ArrowRight size={18} />
                    </a>
                    <a href="tel:+33400000000" className="btn btn-lg btn-ghost" style={{ color: "var(--surface)", borderColor: "oklch(1 0 0 / 0.4)" }}>
                      M'appeler
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
          .hero-grid, .pitch-grid { grid-template-columns: 1fr !important; }
          .figures, .incl-grid, .steps-grid, .price-grid { grid-template-columns: 1fr !important; }
          .figures > div, .steps-grid > div > div { border-left: none !important; }
        }
        @media (min-width: 881px) and (max-width: 1100px) {
          .incl-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}
