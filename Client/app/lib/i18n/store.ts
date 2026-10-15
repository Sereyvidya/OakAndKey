"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translate, type Lang, type StringKey } from "./strings";

interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

/**
 * Site language. Persisted to localStorage but hydrated manually (see
 * LanguageSync) so server and first client render both start in English.
 */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: "en",
      setLang: (lang) => set({ lang }),
    }),
    { name: "oakkey-lang", skipHydration: true }
  )
);

export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  return {
    lang,
    t: (key: StringKey, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
  };
}
