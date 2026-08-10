"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Média à images tournantes (cartes collection ET hero de la home).
 * Fait défiler plusieurs photos plein cadre toutes les `interval` ms. Chaque
 * transition tire au sort un mouvement différent (glissé droite→gauche,
 * gauche→droite, bas→haut, haut→bas, ou fondu-dégradé) pour que chaque bloc
 * s'anime de façon distincte et vivante.
 * La première image reste toujours visible (aucun contenu masqué), la rotation
 * se met en pause quand l'onglet est caché et se coupe si l'utilisateur a
 * demandé « prefers-reduced-motion ».
 */
const VARIANTS = ["r", "l", "u", "d", "fade"] as const;
type Variant = (typeof VARIANTS)[number];

function pickVariant(prev: Variant | null): Variant {
  const pool = prev ? VARIANTS.filter((v) => v !== prev) : VARIANTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function TileMedia({
  images,
  alt,
  interval = 3000,
  className = "s-tile-media",
  children,
}: {
  images: string[];
  alt: string;
  interval?: number;
  /** Conteneur : "s-tile-media" (défaut) ou "s-hero-media" pour le hero. */
  className?: string;
  /** Sur-couche éventuelle (badge du hero, dégradé…) rendue au-dessus. */
  children?: React.ReactNode;
}) {
  const frames = images.filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [variant, setVariant] = useState<Variant>(() => pickVariant(null));
  const idxRef = useRef(0);
  const variantRef = useRef<Variant>(variant);

  useEffect(() => {
    if (frames.length < 2) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      idxRef.current = (idxRef.current + 1) % frames.length;
      const next = pickVariant(variantRef.current);
      variantRef.current = next;
      setVariant(next);
      setIdx(idxRef.current);
    };
    const start = () => {
      if (timer == null) timer = setInterval(tick, interval);
    };
    const stop = () => {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [frames.length, interval]);

  if (frames.length < 2) {
    return (
      <div className={className}>
        {frames[0] && <img src={frames[0]} alt={alt} loading="lazy" />}
        {children}
      </div>
    );
  }

  return (
    <div className={className}>
      {frames.map((src, i) => (
        <div
          key={src}
          className={`s-tile-slide${i === idx ? ` active s-enter-${variant}` : ""}`}
          aria-hidden={i !== idx}
        >
          <img src={src} alt={i === 0 ? alt : ""} loading="lazy" />
        </div>
      ))}
      {children}
    </div>
  );
}
