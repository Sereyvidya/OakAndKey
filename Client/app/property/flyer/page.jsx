"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePropertyStore } from "@/app/lib/propertyStore";
import FlyerPreview from "../components/FlyerPreview";
import InlineSpinner from "../components/InlineSpinner";
import { hasMinimumFlyerData } from "@/app/lib/flyer/guards";
import { makeSafeFilename } from "@/app/lib/flyer/filename";
import { exportFlyerPNG } from "@/app/lib/flyer/export";

const TEMPLATES = [
  { key: "hero", label: "Showcase" },
  { key: "grid", label: "Gallery" },
  { key: "minimal", label: "Modern" },
];
const SUPPORTED_RESIDENTIAL_TYPES = new Set(["house", "condo"]);

export default function FlyerPage() {
  const [template, setTemplate] = useState("hero");

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

  const exportPDF = async () => {
    if (!flyerRef.current) return;
    try {
      setIsExportingPDF(true);
      await exportFlyerPDF(flyerRef.current, { filename: safeFileBase });
    } finally {
      setIsExportingPDF(false);
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
      <div className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/90 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.75)] backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="min-w-0 truncate text-3xl font-semibold text-[color:var(--ink-strong)]">
            Flyer Builder
          </h1>

          <div className="inline-flex w-fit flex-wrap items-center gap-2 rounded-xl border border-[var(--field-border)] bg-[color:var(--field-bg)] p-1 sm:w-auto sm:shrink-0 sm:flex-nowrap">
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
            <button
              type="button"
              onClick={exportPNG}
              disabled={isExporting}
              aria-label="Download flyer as PNG"
              className="hover-lift inline-flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--ink-base)] transition hover:bg-[color:var(--surface-soft)] disabled:opacity-60"
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
            ref={flyerRef}
            formData={formData}
            images={images}
            template={template}
          />
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-[color:var(--ink-muted)]">
        Preview scales to your screen. Exports remain 1080×1350.
      </div>
    </div>
  );
}
