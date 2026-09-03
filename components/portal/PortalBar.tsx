"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, LogOut, RefreshCcw, ShieldCheck } from "lucide-react";
import { ADMIN_PATH, LOGIN_PATH } from "@/lib/portal/paths";

/* Barre d'application — seconde couche neutre, encre profonde, distincte de la
   surface de contenu. Elle porte l'identité, le contexte et les deux seules
   actions globales : synchroniser (administrateur) et se déconnecter. */

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
  const [syncing, setSyncing] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  async function sync() {
    setSyncing(true);
    setFlash(null);
    try {
      const res = await fetch("/api/portal/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Synchronisation impossible.");
      setFlash(`${data.projection?.projected ?? 0} action(s) intégrée(s)`);
      router.refresh();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Échec.");
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
            <ShieldCheck size={12} aria-hidden style={{ marginLeft: "-0.15rem" }} /> Admin
          </span>
        )}

        <span className="esp-bar-spacer" />

        {flash && <span className="esp-micro esp-bar-sm-hide" style={{ color: "oklch(0.93 0.012 84 / 0.75)" }}>{flash}</span>}

        {demoHref && (
          <a className="esp-bar-btn" href={demoHref} target="_blank" rel="noreferrer">
            <ExternalLink size={13} aria-hidden /> <span className="esp-bar-sm-hide">La vitrine</span>
          </a>
        )}
        {isAdmin && (
          <button type="button" className="esp-bar-btn" onClick={sync} disabled={syncing}>
            <RefreshCcw size={13} aria-hidden className={syncing ? "esp-spin" : undefined} />
            <span className="esp-bar-sm-hide">{syncing ? "Synchro…" : "Synchroniser"}</span>
          </button>
        )}
        <button type="button" className="esp-bar-btn" onClick={logout} aria-label="Se déconnecter">
          <LogOut size={13} aria-hidden />
        </button>
      </div>
    </header>
  );
}
