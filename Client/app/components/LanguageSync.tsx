"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/app/lib/i18n/store";

/** Restores the saved language after mount and mirrors it onto <html lang>. */
export default function LanguageSync() {
  const lang = useLanguageStore((s) => s.lang);

  useEffect(() => {
    void useLanguageStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
