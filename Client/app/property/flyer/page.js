"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePropertyStore } from "@/app/lib/propertyStore";
import FlyerPreview from "../components/FlyerPreview";
import { hasMinimumFlyerData } from "@/app/lib/flyer/guards";
import { makeSafeFilename } from "@/app/lib/flyer/filename";
import { exportFlyerPNG, exportFlyerPDF } from "@/app/lib/flyer/export";

const TEMPLATES = [
  { key: "hero", label: "Hero" },
  { key: "grid", label: "Grid" },
  { key: "minimal", label: "Minimal" },
];
const SUPPORTED_RESIDENTIAL_TYPES = new Set(["house", "condo"]);

export default function FlyerPage() {
  const [template, setTemplate] = useState("hero");

  const formData = usePropertyStore((s) => s.formData);
  const images = usePropertyStore((s) => s.images);

  const flyerRef = useRef(null);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const isExporting = isExportingPNG || isExportingPDF;

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
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_16px_32px_-28px_rgba(15,23,42,0.8)]">
        <h1 className="mb-2 text-2xl font-semibold text-[color:var(--ink-strong)]">
          Flyer Builder
        </h1>
        <p className="mb-6 text-[color:var(--ink-base)]">
          No listing data yet. Start with General Info.
        </p>
        <Link
          href="/property/general"
          className="hover-lift inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 font-medium text-[#0b0f14] hover:bg-[var(--brand-strong)]"
        >
          Go to General Info
        </Link>
      </div>
    );
  }

  if (hasUnsupportedType) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_16px_32px_-28px_rgba(15,23,42,0.8)]">
        <h1 className="mb-2 text-2xl font-semibold text-[color:var(--ink-strong)]">
          Residential Templates Only
        </h1>
        <p className="mb-3 text-[color:var(--ink-base)]">
          Current flyer templates are optimized for residential listings.
        </p>
        <p className="mb-6 text-sm text-[color:var(--ink-muted)]">
          Please select <span className="font-semibold">House</span> or{" "}
          <span className="font-semibold">Condo</span> in General Information.
        </p>
        <Link
          href="/property/general"
          className="hover-lift inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 font-medium text-[#0b0f14] hover:bg-[var(--brand-strong)]"
        >
          Go to General Info
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div>
        {/* Top controls bar */}
        <div className="sticky top-[76px] z-20 rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/90 px-4 py-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.75)] backdrop-blur lg:static">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title + template */}
            <div className="min-w-0">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-6">
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold text-[color:var(--ink-strong)]">
                    Flyer Builder
                  </h1>
                  <p className="text-sm text-[color:var(--ink-muted)]">Portrait (1080×1350)</p>
                </div>

                <div className="flex gap-1 rounded-xl border border-[var(--field-border)] bg-[color:var(--field-bg)] p-1">
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
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={exportPNG}
                disabled={isExporting}
                className="hover-lift inline-flex w-full justify-center rounded-xl border border-[var(--card-border)] bg-white px-4 py-2 text-sm font-semibold text-[#1a2230] hover:bg-[#eef2f8] disabled:opacity-60 sm:w-auto"
              >
                {isExportingPNG ? "Exporting..." : "Export PNG"}
              </button>

              <button
                type="button"
                onClick={exportPDF}
                disabled={isExporting}
                className="hover-lift inline-flex w-full justify-center rounded-xl border border-[var(--card-border)] bg-white px-4 py-2 text-sm font-semibold text-[#1a2230] hover:bg-[#eef2f8] disabled:opacity-60 sm:w-auto"
              >
                {isExportingPDF ? "Exporting..." : "Export PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* Flyer preview below */}
        <div className="mt-8 flex w-full justify-center overflow-auto">
          <div className="w-full rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/70 p-4 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.7)] sm:p-6">
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
    </div>
  );
}
