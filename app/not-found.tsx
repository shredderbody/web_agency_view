import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grain" style={{ position: "relative", minHeight: "100dvh", display: "grid", placeItems: "center", padding: "2rem", overflow: "hidden" }}>
      <div style={{ textAlign: "center", maxWidth: "46ch" }}>
        <span className="kicker" style={{ justifyContent: "center", marginBottom: "1.2rem" }}>Erreur 404</span>
        <h1 className="d-xl" style={{ margin: "0 0 1rem" }}>
          Cette porte ne mène <span className="serif-accent" style={{ color: "var(--vermilion-deep)" }}>nulle part.</span>
        </h1>
        <p style={{ color: "var(--ink-dim)", fontSize: "1.1rem", margin: "0 0 2rem" }}>
          La page que vous cherchez a peut-être déménagé. Revenez à l'accueil ou visitez nos vitrines de démonstration.
        </p>
        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary"><ArrowLeft size={17} /> Retour à l'accueil</Link>
          <Link href="/demo" className="btn btn-ghost">Voir les démos</Link>
        </div>
      </div>
    </main>
  );
}
