"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePropertyStore } from "@/app/lib/propertyStore";
import FlyerPreview from "../components/FlyerPreview";
import FlyerControls from "../components/FlyerControls";
import { hasMinimumFlyerData } from "@/app/lib/flyer/guards";
import { makeSafeFilename } from "@/app/lib/flyer/filename";
import { exportFlyerPNG } from "@/app/lib/flyer/export";
import { buildFlyerTheme } from "@/app/lib/flyer/theme";

const TEMPLATES = [
  { key: "hero", label: "Showcase" },
  { key: "grid", label: "Gallery" },
  { key: "minimal", label: "Modern" },
];
const SUPPORTED_RESIDENTIAL_TYPES = new Set(["house", "condo"]);

export default function FlyerPage() {
  const [template, setTemplate] = useState("hero");
  const [themePreset, setThemePreset] = useState("classic");

  const [customThemes, setCustomThemes] = useState([]);

  const flyerTheme = useMemo(() => {
    const custom = customThemes.find((theme) => theme.key === themePreset);
    if (custom) return custom;

    return buildFlyerTheme(themePreset);
  }, [themePreset, customThemes]);

  const formData = usePropertyStore((s) => s.formData);
  const images = usePropertyStore((s) => s.images);

  const flyerRef = useRef(null);
  const [isExportingPNG, setIsExportingPNG] = useState(false);

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
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <FlyerControls
          template={template}
          setTemplate={setTemplate}
          themePreset={themePreset}
          setThemePreset={setThemePreset}
          customThemes={customThemes}
          setCustomThemes={setCustomThemes}
          templates={TEMPLATES}
          onExportPNG={exportPNG}
          isExportingPNG={isExportingPNG}
        />

        <section className="min-w-0">
          <div className="flex w-full justify-center overflow-auto">
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
        </section>
      </div>
    </div>
  );
}
