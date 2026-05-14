"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePropertyStore } from "@/app/lib/propertyStore";
import FlyerPreview from "../components/FlyerPreview";
import InlineSpinner from "../components/InlineSpinner";
import { hasMinimumFlyerData } from "@/app/lib/flyer/guards";
import { makeSafeFilename } from "@/app/lib/flyer/filename";
import { exportFlyerPNG } from "@/app/lib/flyer/export";
import { buildFlyerTheme, FLYER_THEME_PRESETS } from "@/app/lib/flyer/theme";

const TEMPLATES = [
  { key: "hero", label: "Showcase" },
  { key: "grid", label: "Gallery" },
  { key: "minimal", label: "Modern" },
];
const SUPPORTED_RESIDENTIAL_TYPES = new Set(["house", "condo"]);

export default function FlyerPage() {
  const [template, setTemplate] = useState("hero");
  const [themePreset, setThemePreset] = useState("classic");
  const flyerTheme = useMemo(() => buildFlyerTheme(themePreset), [themePreset]);

  const formData = usePropertyStore((s) => s.formData);
  const images = usePropertyStore((s) => s.images);

  const flyerRef = useRef(null);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const isExporting = isExportingPNG;

  const hasData = useMemo(
    () => hasMinimumFlyerData({ formData, images }),
    [formData, images]
  );
  const hasUnsupportedType = useMemo(() => {
    const type = (formData.propertyType || "").trim();
    return Boolean(type) && !SUPPORTED_RESIDENTIAL_TYPES.has(type);
  }, [formData.propertyType]);

  const safeFileBase = useMemo(
    () => makeSafeFilename(formData.propertyTitle, "flyer"),
    [formData.propertyTitle]
  );

  const exportPNG = async () => {
    if (!flyerRef.current) return;
    try {
      setIsExportingPNG(true);
      await exportFlyerPNG(flyerRef.current, { filename: safeFileBase });
    } finally {
      setIsExportingPNG(false);
    }
  };

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.7)]">
        <h1 className="mb-2 text-3xl font-semibold text-[color:var(--ink-strong)]">
          Flyer Builder
        </h1>
        <p className="mb-6 text-[color:var(--ink-soft)]">
          No listing data yet. Start with General Info.
        </p>
        <Link
          href="/property/general"
          className="hover-lift inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 font-semibold text-[#0b0f14] hover:bg-[var(--brand-strong)]"
        >
          Go to General Info
        </Link>
      </div>
    );
  }

  if (hasUnsupportedType) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.7)]">
        <h1 className="mb-2 text-3xl font-semibold text-[color:var(--ink-strong)]">
          Residential Templates Only
        </h1>
        <p className="mb-3 text-[color:var(--ink-soft)]">
          Current flyer templates are optimized for residential listings.
        </p>
        <p className="mb-6 text-sm text-[color:var(--ink-muted)]">
          Please select <span className="font-semibold">House</span> or{" "}
          <span className="font-semibold">Condo</span> in General Information.
        </p>
        <Link
          href="/property/general"
          className="hover-lift inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 font-semibold text-[#0b0f14] hover:bg-[var(--brand-strong)]"
        >
          Go to General Info
        </Link>
      </div>
    );
  }

  return (
    <div className="interactive-form min-h-[calc(100vh-80px)]">
      {/* Top controls bar */}
      {/* Top controls bar */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/90 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.75)] backdrop-blur">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold text-[color:var(--ink-strong)]">
            Flyer Builder
          </h1>

          <div className="flex w-full flex-wrap items-center gap-3 rounded-xl border border-[var(--field-border)] bg-[color:var(--field-bg)] p-2">
            {/* Color presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 text-xs font-semibold text-[color:var(--ink-muted)]">
                Colors
              </span>

              {Object.entries(FLYER_THEME_PRESETS).map(([key, preset]) => {
                const colors = buildFlyerTheme(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setThemePreset(key)}
                    title={preset.name}
                    aria-label={`Use ${preset.name} theme`}
                    className={[
                      "hover-lift flex h-9 w-12 items-center justify-center rounded-lg border transition",
                      themePreset === key
                        ? "border-[var(--brand)] bg-[color:var(--surface-soft)] ring-2 ring-[var(--brand)]"
                        : "border-transparent hover:bg-[color:var(--surface-soft)]",
                    ].join(" ")}
                  >
                    <div className="flex h-5 w-8 overflow-hidden rounded-md border border-black/10">
                      <span
                        className="h-full flex-1"
                        style={{ background: colors.primary }}
                      />
                      <span
                        className="h-full flex-1"
                        style={{ background: colors.secondary }}
                      />
                      <span
                        className="h-full flex-1"
                        style={{ background: colors.surface }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="h-6 w-px bg-[var(--field-border)]" />

            {/* Templates */}
            <div className="flex flex-wrap items-center gap-2">
              {TEMPLATES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTemplate(key)}
                  className={[
                    "hover-lift rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    template === key
                      ? "bg-[var(--brand)] text-[#0b0f14]"
                      : "text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={exportPNG}
              disabled={isExporting}
              aria-label="Download flyer as PNG"
              className="hover-lift ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--ink-base)] transition hover:bg-[color:var(--surface-soft)] disabled:opacity-60"
            >
              {isExportingPNG ? (
                <InlineSpinner />
              ) : (
                <span className="text-lg leading-none">↓</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Flyer preview below */}
      <div className="mt-8 flex w-full justify-center overflow-auto">
        <div className="w-full">
          <FlyerPreview
            formData={formData}
            images={images}
            template={template}
            theme={flyerTheme}
            ref={flyerRef}
          />
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-[color:var(--ink-muted)]">
        Preview scales to your screen. Exports remain 1080×1350.
      </div>
    </div>
  );
}
