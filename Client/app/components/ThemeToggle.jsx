"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "angkor-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className={[
        "relative inline-flex h-8 w-14 items-center rounded-full border transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/70",
        isDark
          ? "border-[var(--card-border)] bg-[color:var(--surface-soft)]"
          : "border-[var(--card-border)] bg-[#e8edf6]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute left-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-transform",
          "bg-white shadow-sm ring-1 ring-black/10",
          isDark ? "translate-x-6" : "translate-x-0",
        ].join(" ")}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
