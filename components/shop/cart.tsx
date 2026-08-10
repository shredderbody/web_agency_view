"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  slug: string;
  category: string;
  name: string;
  price: number;
  img?: string;
  color: string;
  qty: number;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ig_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(KEY, JSON.stringify(lines));
      } catch {}
    }
  }, [lines, hydrated]);

  // Verrouille le scroll quand le panier est ouvert.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const api = useMemo<CartCtx>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);
    return {
      lines,
      count,
      subtotal,
      open,
      setOpen,
      add: (line, qty = 1) =>
        setLines((cur) => {
          const i = cur.findIndex((l) => l.slug === line.slug);
          if (i >= 0) {
            const next = [...cur];
            next[i] = { ...next[i], qty: next[i].qty + qty };
            return next;
          }
          return [...cur, { ...line, qty }];
        }),
      setQty: (slug, qty) =>
        setLines((cur) =>
          cur
            .map((l) => (l.slug === slug ? { ...l, qty: Math.max(0, qty) } : l))
            .filter((l) => l.qty > 0)
        ),
      remove: (slug) => setLines((cur) => cur.filter((l) => l.slug !== slug)),
      clear: () => setLines([]),
    };
  }, [lines, open]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
