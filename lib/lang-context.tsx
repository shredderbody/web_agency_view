"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Lang, ui, DEFAULT_LANG, LANG_COOKIE, isLang } from "./i18n";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (typeof ui)["fr"] };

const LangCtx = createContext<Ctx>({ lang: DEFAULT_LANG, setLang: () => {}, t: ui[DEFAULT_LANG] });

function detect(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]+)`));
  if (m && isLang(m[1])) return m[1];
  const stored = localStorage.getItem(LANG_COOKIE);
  if (isLang(stored)) return stored;
  const nav = navigator.language?.slice(0, 2).toLowerCase();
  if (nav === "fr") return "fr";
  return DEFAULT_LANG;
}

export function LangProvider({ children }: { children: ReactNode }) {
  // Start at default so server and first client render match (no hydration mismatch),
  // then reconcile with the visitor's saved/detected preference.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const d = detect();
    setLangState(d);
    document.documentElement.lang = ui[d].htmlLang;
  }, []);

  function setLang(l: Lang) {
    localStorage.setItem(LANG_COOKIE, l);
    document.cookie = `${LANG_COOKIE}=${l};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    document.documentElement.lang = ui[l].htmlLang;
    setLangState(l);
  }

  return <LangCtx.Provider value={{ lang, setLang, t: ui[lang] }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
export const useT = () => useContext(LangCtx).t;
