"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { spaceHref } from "@/lib/portal/paths";
import {
  AlertCircle, ArrowRight, CalendarCheck, FileText, KeyRound, Loader2, Lock, Mail,
  PhoneCall,
} from "lucide-react";
import { usePortalI18n } from "@/lib/portal/i18nClient";
import { LANGS } from "@/lib/i18n";

/* ════════════════════════════════════════════════════════════════════════════
   Écran de connexion — repris du login de ~/receptionist (Zerocall) : même
   composition en deux volets, même promesse à gauche, même formulaire compact
   à droite. Deux écarts assumés :

     • Pas de Google OAuth : une démo n'a pas de compte utilisateur, elle a un
       SLUG et un CODE D'ACCÈS (cf. lib/portal/auth.ts). Le second onglet,
       « Identifiants », porte les comptes de DÉMONSTRATION : un par vitrine
       (<slug>@debug.com, qui n'ouvre que cette vitrine) plus celui de l'agence.
       Choisir sa vitrine dans le premier onglet pré-remplit l'e-mail du second.
     • Le choix de la démo est explicite (liste déroulante) : un client sait
       quelle vitrine est la sienne, et l'administrateur choisit « Administration ».
   ════════════════════════════════════════════════════════════════════════════ */

type Option = {
  slug: string; label: string; city: string; accent: string;
  /** E-mail de démonstration de cette vitrine, `null` si les comptes sont fermés. */
  testEmail: string | null;
};

type Mode = "code" | "credentials";

export default function LoginForm({
  options, initialSlug, expired, devSecret, testAccounts,
}: {
  options: Option[];
  initialSlug: string;
  expired: boolean;
  devSecret: boolean;
  /** Les comptes de démonstration sont-ils ouverts ? (PORTAL_TEST_ACCOUNT) */
  testAccounts: boolean;
}) {
  const router = useRouter();
  const { lang, setLang, switching, t } = usePortalI18n();
  const [mode, setMode] = useState<Mode>("code");
  const [slug, setSlug] = useState(initialSlug);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(expired ? t.login.expired : null);
  const [busy, setBusy] = useState(false);

  const ready = mode === "code"
    ? Boolean(slug && code.trim())
    : Boolean(email.trim() && password);

  const switchTo = (next: Mode) => {
    setMode(next);
    setError(null);
    // Passer aux identifiants après avoir choisi sa vitrine : l'e-mail est déjà
    // connu, autant l'écrire. On n'écrase jamais une saisie en cours.
    if (next === "credentials" && !email.trim()) {
      const chosen = options.find((o) => o.slug === slug);
      if (chosen?.testEmail) setEmail(chosen.testEmail);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "code" ? { slug, code } : { email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.login.failed);
      router.replace(spaceHref(data.slug));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.failed);
      setBusy(false);
    }
  };

  const highlights = [
    { icon: PhoneCall, title: t.login.h1, desc: t.login.h1d },
    { icon: CalendarCheck, title: t.login.h2, desc: t.login.h2d },
    { icon: FileText, title: t.login.h3, desc: t.login.h3d },
  ];

  return (
    <div className="esp-login">
      <aside className="esp-login-side">
        <div>
          <Link href="/" className="esp-bar-brand">
            <span className="esp-wordmark" style={{ fontSize: "1.0625rem" }}>Atelier Vitrine</span>
          </Link>
          <h1 className="esp-login-t">{t.login.tagline}</h1>
          <p className="esp-login-p">{t.login.pitch}</p>
          <ul className="esp-login-list">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="esp-login-li">
                <span className="esp-login-ic"><Icon size={15} aria-hidden /></span>
                <span>
                  <b style={{ fontWeight: 650 }}>{title}</b>
                  <br />
                  <span style={{ color: "oklch(0.93 0.012 84 / 0.62)" }}>{desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="esp-login-foot">{t.login.foot}</p>
      </aside>

      <main className="esp-login-main">
        <form className="esp-login-form" onSubmit={submit} noValidate>
          {/* Le choix de la langue est le PREMIER élément de l'écran : quelqu'un
              qui ne lit pas le français doit pouvoir basculer avant de chercher
              à comprendre les champs. */}
          <div className="esp-login-lang" role="group" aria-label={t.bar.langLabel}>
            {LANGS.map((l) => (
              <button
                key={l.id} type="button" aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)} disabled={switching} lang={l.id}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div>
            <h2 className="esp-h1">{t.login.title}</h2>
            <p className="esp-small" style={{ marginTop: "0.35rem" }}>
              {mode === "code" ? t.login.subCode : t.login.subCreds}
            </p>
          </div>

          {testAccounts && (
            <div className="esp-tabs" style={{ marginBottom: 0 }} role="tablist">
              <button
                type="button"
                role="tab"
                className="esp-tab"
                aria-selected={mode === "code"}
                onClick={() => switchTo("code")}
              >
                {t.login.tabCode}
              </button>
              <button
                type="button"
                role="tab"
                className="esp-tab"
                aria-selected={mode === "credentials"}
                onClick={() => switchTo("credentials")}
              >
                {t.login.tabCreds}
              </button>
            </div>
          )}

          {error && (
            <p className="esp-login-err" role="alert">
              <AlertCircle size={15} aria-hidden style={{ flex: "none", marginTop: "0.1rem" }} />
              {error}
            </p>
          )}

          {mode === "code" ? (
            <>
            <div className="esp-field">
              <label className="esp-label" htmlFor="esp-slug">{t.login.fieldVitrine}</label>
              <select
                id="esp-slug"
                className="esp-select"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              >
                <option value="" disabled>{t.login.pick}</option>
                {options.map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.label} — {o.city}
                  </option>
                ))}
                <option value="admin">{t.login.adminOption}</option>
              </select>
            </div>

            <div className="esp-field">
              <label className="esp-label" htmlFor="esp-code">{t.login.fieldCode}</label>
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
            </>
          ) : (
            <>
              <div className="esp-field">
                <label className="esp-label" htmlFor="esp-email">{t.login.fieldEmail}</label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={15}
                    aria-hidden
                    style={{
                      position: "absolute", left: "0.7rem", top: "50%",
                      transform: "translateY(-50%)", color: "var(--esp-ink-3)",
                    }}
                  />
                  <input
                    id="esp-email"
                    type="email"
                    className="esp-input"
                    style={{ paddingLeft: "2rem" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.login.emailPlaceholder}
                    autoComplete="username"
                    spellCheck={false}
                    required
                  />
                </div>
              </div>

              <div className="esp-field">
                <label className="esp-label" htmlFor="esp-password">{t.login.fieldPassword}</label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={15}
                    aria-hidden
                    style={{
                      position: "absolute", left: "0.7rem", top: "50%",
                      transform: "translateY(-50%)", color: "var(--esp-ink-3)",
                    }}
                  />
                  <input
                    id="esp-password"
                    type="password"
                    className="esp-input"
                    style={{ paddingLeft: "2rem" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="esp-btn esp-btn-primary esp-btn-block"
            style={{ minHeight: "2.6rem" }}
            disabled={busy || !ready}
          >
            {busy ? <Loader2 size={15} className="esp-spin" aria-hidden /> : <>{t.login.enter} <ArrowRight size={15} aria-hidden /></>}
          </button>

          {devSecret && (
            <p className="esp-note esp-note-warn">
              <AlertCircle size={15} aria-hidden />
              <span>
                <b>{t.login.devT}</b> {t.login.devD1} <code>PORTAL_SECRET</code>{" "}
                {t.login.devD2} <code>.env</code> {t.login.devD3}
              </span>
            </p>
          )}

          <p className="esp-micro" style={{ textAlign: "center" }}>
            {mode === "code" ? t.login.lostCode : t.login.lostCreds}
          </p>
        </form>
      </main>
    </div>
  );
}
