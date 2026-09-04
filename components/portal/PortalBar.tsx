"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, LogOut, RefreshCcw, ShieldCheck } from "lucide-react";
import { ADMIN_PATH, LOGIN_PATH } from "@/lib/portal/paths";
import { usePortalI18n } from "@/lib/portal/i18nClient";
import { LANGS } from "@/lib/i18n";

/* Barre d'application — seconde couche neutre, encre profonde, distincte de la
   surface de contenu. Elle porte l'identité, le contexte et les seules actions
   globales : changer de langue, synchroniser (administrateur), se déconnecter.

   Le sélecteur de langue est ICI et nulle part ailleurs. Sur un espace de
   travail, la langue est un réglage qu'on pose une fois : le mettre dans chaque
   page reviendrait à le proposer sans arrêt à quelqu'un qui a déjà choisi. */

export default function PortalBar({
  title, subtitle, demoHref, isAdmin, adminHome,
}: {
  title: string;
  subtitle?: string;
  demoHref?: string;
  isAdmin: boolean;
  adminHome?: boolean;
}) {
  const router = useRouter();
  const { lang, setLang, switching, t } = usePortalI18n();
  const [syncing, setSyncing] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  async function sync() {
    setSyncing(true);
    setFlash(null);
    try {
      const res = await fetch("/api/portal/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.bar.syncFail);
      setFlash(t.bar.syncDone(data.projection?.projected ?? 0));
      router.refresh();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : t.bar.syncFail);
    } finally {
      setSyncing(false);
      setTimeout(() => setFlash(null), 6000);
    }
  }

  async function logout() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.replace(LOGIN_PATH);
    router.refresh();
  }

  return (
    <header className="esp-bar">
      <div className="esp-wrap esp-bar-in">
        <Link href={adminHome ? ADMIN_PATH : "/"} className="esp-bar-brand">
          <span className="esp-wordmark">Atelier Vitrine</span>
        </Link>
        <span className="esp-bar-sep" aria-hidden />
        <span className="esp-bar-title">{title}</span>
        {subtitle && (
          <span className="esp-micro esp-bar-sm-hide" style={{ color: "oklch(0.93 0.012 84 / 0.55)" }}>{subtitle}</span>
        )}
        {isAdmin && (
          <span className="esp-badge esp-badge-flat esp-bar-sm-hide" style={{ color: "oklch(0.93 0.012 84 / 0.7)" }}>
            <ShieldCheck size={12} aria-hidden style={{ marginLeft: "-0.15rem" }} /> {t.bar.admin}
          </span>
        )}

        <span className="esp-bar-spacer" />

        {flash && <span className="esp-micro esp-bar-sm-hide" style={{ color: "oklch(0.93 0.012 84 / 0.75)" }}>{flash}</span>}

        {/* Deux langues, deux boutons : une liste déroulante pour deux choix
            demande un clic de plus pour rien. */}
        <div className="esp-bar-lang" role="group" aria-label={t.bar.langLabel}>
          {LANGS.map((l) => (
            <button
              key={l.id} type="button" aria-pressed={lang === l.id}
              onClick={() => setLang(l.id)} disabled={switching}
              lang={l.id} title={l.label}
            >
              {l.id.toUpperCase()}
            </button>
          ))}
        </div>

        {demoHref && (
          <a className="esp-bar-btn" href={demoHref} target="_blank" rel="noreferrer">
            <ExternalLink size={13} aria-hidden /> <span className="esp-bar-sm-hide">{t.bar.demo}</span>
          </a>
        )}
        {isAdmin && (
          <button type="button" className="esp-bar-btn" onClick={sync} disabled={syncing}>
            <RefreshCcw size={13} aria-hidden className={syncing ? "esp-spin" : undefined} />
            <span className="esp-bar-sm-hide">{syncing ? t.bar.syncing : t.bar.sync}</span>
          </button>
        )}
        <button type="button" className="esp-bar-btn" onClick={logout} aria-label={t.bar.logout}>
          <LogOut size={13} aria-hidden />
        </button>
      </div>
    </header>
  );
}
