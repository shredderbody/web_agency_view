"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/lang-context";

export default function NotFound() {
  const t = useT();
  return (
    <main className="grain" style={{ position: "relative", minHeight: "100dvh", display: "grid", placeItems: "center", padding: "2rem", overflow: "hidden" }}>
      <div style={{ textAlign: "center", maxWidth: "46ch" }}>
        <span className="kicker" style={{ justifyContent: "center", marginBottom: "1.2rem" }}>{t.notFound.code}</span>
        <h1 className="d-xl" style={{ margin: "0 0 1rem" }}>
          {t.notFound.titleLead} <span className="serif-accent" style={{ color: "var(--vermilion-deep)" }}>{t.notFound.titleAccent}</span>
        </h1>
        <p style={{ color: "var(--ink-dim)", fontSize: "1.1rem", margin: "0 0 2rem" }}>{t.notFound.body}</p>
        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary"><ArrowLeft size={17} /> {t.notFound.home}</Link>
          <Link href="/demo" className="btn btn-ghost">{t.notFound.demos}</Link>
        </div>
      </div>
    </main>
  );
}
