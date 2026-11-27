"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AppLocale = "en" | "es";

const LANG_STORAGE_KEY = "coachpro_lang";

interface LanguageContextValue {
  locale: AppLocale;
  isEs: boolean;
  setLocale: (next: AppLocale) => void;
  toggleLocale: () => void;
  tx: (en: string, es: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  isEs: false,
  setLocale: () => {},
  toggleLocale: () => {},
  tx: (en) => en,
});

export function getSavedLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  try {
    const raw = localStorage.getItem(LANG_STORAGE_KEY);
    return raw === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("en");

  useEffect(() => {
    const saved = getSavedLocale();
    setLocaleState(saved);
    if (typeof document !== "undefined") {
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (next: AppLocale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LANG_STORAGE_KEY, next);
      } catch {
        // Ignore storage quota errors
      }
      window.dispatchEvent(new CustomEvent("coachpro_lang_changed", { detail: next }));
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "en" ? "es" : "en");
  };

  const tx = (en: string, es: string) => (locale === "es" ? es : en);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        isEs: locale === "es",
        setLocale,
        toggleLocale,
        tx,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
