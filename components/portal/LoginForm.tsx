"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, ArrowRight, CalendarCheck, KeyRound, Loader2, PhoneCall, ShieldCheck,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════════
   Écran de connexion — repris du login de ~/receptionist (Zerocall) : même
   composition en deux volets, même promesse à gauche, même formulaire compact
   à droite. Deux écarts assumés :

     • Pas de Google OAuth ni de mot de passe : une démo n'a pas de compte
       utilisateur, elle a un SLUG et un CODE D'ACCÈS (cf. lib/portal/auth.ts).
     • Le choix de la démo est explicite (liste déroulante) : un client sait
       quelle vitrine est la sienne, et l'administrateur choisit « Administration ».
   ════════════════════════════════════════════════════════════════════════════ */

type Option = { slug: string; label: string; city: string; accent: string };

export default function LoginForm({
  options, initialSlug, expired, devSecret,
}: {
  options: Option[];
  initialSlug: string;
  expired: boolean;
  devSecret: boolean;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initialSlug);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(
    expired ? "Votre session a expiré. Reconnectez-vous." : null,
  );
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Connexion impossible.");
      router.replace(`/espace/${data.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
      setBusy(false);
    }
  };

  const highlights = [
    { icon: PhoneCall, t: "Consommation réelle", d: "Appels et messages, jour par jour, coût compris." },
    { icon: CalendarCheck, t: "Réservations tenues", d: "Calendrier, confirmation, report, annulation." },
    { icon: ShieldCheck, t: "Traçabilité complète", d: "Chaque action est journalisée, jamais réécrite." },
  ];

  return (
    <div className="esp-login">
      <aside className="esp-login-side">
        <div>
          <Link href="/" className="esp-bar-brand">
            <span className="esp-wordmark" style={{ fontSize: "1.0625rem" }}>Atelier Vitrine</span>
          </Link>
          <h1 className="esp-login-t">Le suivi de votre standardiste.</h1>
          <p className="esp-login-p">
            Tout ce que l&apos;assistant a fait pour vous depuis la mise en ligne de votre
            vitrine, et ce que cela vous a coûté.
          </p>
          <ul className="esp-login-list">
            {highlights.map(({ icon: Icon, t, d }) => (
              <li key={t} className="esp-login-li">
                <span className="esp-login-ic"><Icon size={15} aria-hidden /></span>
                <span>
                  <b style={{ fontWeight: 650 }}>{t}</b>
                  <br />
                  <span style={{ color: "oklch(0.93 0.012 84 / 0.62)" }}>{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="esp-login-foot">
          Espace réservé. Le code d&apos;accès vous est remis par l&apos;agence et reste
          valable douze heures après connexion.
        </p>
      </aside>

      <main className="esp-login-main">
        <form className="esp-login-form" onSubmit={submit} noValidate>
          <div>
            <h2 className="esp-h1">Accéder à votre espace</h2>
            <p className="esp-small" style={{ marginTop: "0.35rem" }}>
              Choisissez votre vitrine, puis saisissez le code fourni par l&apos;agence.
            </p>
          </div>

          {error && (
            <p className="esp-login-err" role="alert">
              <AlertCircle size={15} aria-hidden style={{ flex: "none", marginTop: "0.1rem" }} />
              {error}
            </p>
          )}

          <div className="esp-field">
            <label className="esp-label" htmlFor="esp-slug">Votre vitrine</label>
            <select
              id="esp-slug"
              className="esp-select"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            >
              <option value="" disabled>Sélectionner…</option>
              {options.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.label} — {o.city}
                </option>
              ))}
              <option value="admin">Administration — toutes les vitrines</option>
            </select>
          </div>

          <div className="esp-field">
            <label className="esp-label" htmlFor="esp-code">Code d&apos;accès</label>
            <div style={{ position: "relative" }}>
              <KeyRound
                size={15}
                aria-hidden
                style={{
                  position: "absolute", left: "0.7rem", top: "50%",
                  transform: "translateY(-50%)", color: "var(--esp-ink-3)",
                }}
              />
              <input
                id="esp-code"
                className="esp-input esp-code"
                style={{ paddingLeft: "2rem" }}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="XXXX-XXXX"
                autoComplete="one-time-code"
                spellCheck={false}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="esp-btn esp-btn-primary esp-btn-block"
            style={{ minHeight: "2.6rem" }}
            disabled={busy || !slug || !code.trim()}
          >
            {busy ? <Loader2 size={15} className="esp-spin" aria-hidden /> : <>Entrer <ArrowRight size={15} aria-hidden /></>}
          </button>

          {devSecret && (
            <p className="esp-note esp-note-warn">
              <AlertCircle size={15} aria-hidden />
              <span>
                <b>PORTAL_SECRET n&apos;est pas configuré.</b> Les codes d&apos;accès sont
                ceux du secret de repli : posez <code>PORTAL_SECRET</code> dans le
                <code> .env</code> avant de communiquer un code à un client.
              </span>
            </p>
          )}

          <p className="esp-micro" style={{ textAlign: "center" }}>
            Code perdu&nbsp;? L&apos;agence le retrouve dans son espace d&apos;administration.
          </p>
        </form>
      </main>
    </div>
  );
}
