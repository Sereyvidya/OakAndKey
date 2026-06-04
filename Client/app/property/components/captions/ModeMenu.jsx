"use client";

import { useEffect, useRef, useState } from "react";

const CAPTION_MODES = [
  { value: "local", label: "Local Generator" },
  { value: "ai", label: "AI Generator" },
];

export default function ModeMenu({ mode, setMode }) {
  const [isModeOpen, setIsModeOpen] = useState(false);
  const modeMenuRef = useRef(null);

  const selectedMode =
    CAPTION_MODES.find((option) => option.value === mode) || CAPTION_MODES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!modeMenuRef.current?.contains(event.target)) {
        setIsModeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative shrink-0" ref={modeMenuRef}>
      <button
        type="button"
        id="caption-generator-mode"
        onClick={() => setIsModeOpen((open) => !open)}
        className="form-input-focus form-field relative flex h-11 w-auto min-w-[180px] items-center justify-between rounded-[1rem] border border-[color:var(--field-border)] bg-[color:var(--field-bg)] px-4 text-left text-sm font-semibold text-[color:var(--ink-base)] shadow-[0_10px_24px_-22px_rgba(15,23,42,0.45)] transition hover:bg-[color:var(--surface-soft)]"
        aria-haspopup="listbox"
        aria-expanded={isModeOpen}
      >
        <span>{selectedMode.label}</span>
        <span className="ml-3 text-xs text-[color:var(--ink-muted)]">▾</span>
      </button>

      {isModeOpen ? (
        <div
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-[1rem] border border-[var(--card-border)] bg-[color:var(--surface)] shadow-[0_20px_35px_-24px_rgba(15,23,42,0.55)]"
          role="listbox"
          aria-label="Caption generator mode"
        >
          {CAPTION_MODES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setMode(option.value);
                setIsModeOpen(false);
              }}
              className={[
                "flex w-full items-center px-4 py-2.5 text-left text-sm font-semibold transition",
                mode === option.value
                  ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                  : "text-[color:var(--ink-strong)] hover:bg-[color:var(--surface-soft)]",
              ].join(" ")}
              role="option"
              aria-selected={mode === option.value}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
