"use client";

import { LANGS } from "@/app/lib/i18n/strings";
import { useLanguageStore } from "@/app/lib/i18n/store";

export default function LanguageToggle() {
  const lang = useLanguageStore((s) => s.lang);
  const setLang = useLanguageStore((s) => s.setLang);

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex shrink-0 overflow-hidden rounded-full border border-[var(--card-border)] bg-[var(--field-bg)] text-xs font-semibold"
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={[
            "px-3 py-1.5 transition-colors",
            lang === code
              ? "bg-[var(--brand)] text-[#0b0f14]"
              : "text-[var(--ink-soft)] hover:text-[var(--ink-strong)]",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
