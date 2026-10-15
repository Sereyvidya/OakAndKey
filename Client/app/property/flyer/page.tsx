"use client";

import {
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Lang } from "@/app/lib/i18n/strings";
import Link from "next/link";
import { useT } from "@/app/lib/i18n/store";
import { usePropertyStore } from "@/app/lib/propertyStore";
import FlyerPreview from "../components/flyer/FlyerPreview";
import FlyerControls from "../components/flyer/FlyerControls";
import { hasCompleteFlyerData } from "@/app/lib/flyer/guards";
import { makeSafeFilename } from "@/app/lib/flyer/filename";
import { exportFlyerPNG, exportFlyerPDF } from "@/app/lib/flyer/export";
import { TEMPLATES } from "@/app/lib/flyer/templates";
import { buildFlyerTheme, type CustomFlyerTheme } from "@/app/lib/flyer/theme";
import type { FlyerTemplate, TemplateCopyState } from "@/app/lib/types";
import { supportedResidentialTypes } from "@/app/lib/listing/constants";

export default function FlyerPage() {
  const { t, lang } = useT();
  const [template, setTemplate] = useState<FlyerTemplate>("showcase");
  const [themePreset, setThemePreset] = useState("classic");

  const [customThemes, setCustomThemes] = useState<CustomFlyerTheme[]>([]);

  // Edited wording is kept per language so switching language shows that
  // language's defaults instead of stale text from the other one.
  const [copyByLang, setCopyByLang] = useState<Record<Lang, TemplateCopyState>>(
    { en: {}, km: {} }
  );
  const templateCopy = copyByLang[lang];
  const setTemplateCopy: Dispatch<SetStateAction<TemplateCopyState>> = (
    update
  ) =>
    setCopyByLang((prev) => ({
      ...prev,
      [lang]: typeof update === "function" ? update(prev[lang]) : update,
    }));

  const flyerTheme = useMemo(() => {
    const custom = customThemes.find((theme) => theme.key === themePreset);
    if (custom) return buildFlyerTheme("classic", custom);

    return buildFlyerTheme(themePreset);
  }, [themePreset, customThemes]);

  const formData = usePropertyStore((s) => s.formData);
  const images = usePropertyStore((s) => s.images);

  const flyerRef = useRef<HTMLDivElement>(null);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const hasData = useMemo(
    () => hasCompleteFlyerData({ formData, images }),
    [formData, images]
  );
  const hasUnsupportedType = useMemo(() => {
    const type = (formData.propertyType || "").trim();
    return Boolean(type) && !supportedResidentialTypes.has(type);
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
          {t("flyer.builder")}
        </h1>
        <p className="mb-6 text-[color:var(--ink-soft)]">
          {t("flyer.needData")}
        </p>
        <Link
          href="/property/general"
          className="hover-lift inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 font-semibold text-[#0b0f14] hover:bg-[var(--brand-strong)]"
        >
          {t("captions.goGeneral")}
        </Link>
      </div>
    );
  }

  if (hasUnsupportedType) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.7)]">
        <h1 className="mb-2 text-3xl font-semibold text-[color:var(--ink-strong)]">
          {t("flyer.residentialOnly")}
        </h1>
        <p className="mb-3 text-[color:var(--ink-soft)]">
          {t("flyer.residentialBody")}
        </p>
        <p className="mb-6 text-sm text-[color:var(--ink-muted)]">
          {t("flyer.residentialPick")}
        </p>
        <Link
          href="/property/general"
          className="hover-lift inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 font-semibold text-[#0b0f14] hover:bg-[var(--brand-strong)]"
        >
          {t("captions.goGeneral")}
        </Link>
      </div>
    );
  }

  return (
    <div className="interactive-form min-h-[calc(100vh-80px)]">
      <div className="grid items-start gap-6 sm:grid-cols-[340px_minmax(0,1fr)]">
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
          onExportPDF={exportPDF}
          isExportingPDF={isExportingPDF}
          templateCopy={templateCopy}
          setTemplateCopy={setTemplateCopy}
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
                templateCopy={templateCopy}
                lang={lang}
              />
            </div>
          </div>

          <div className="mt-3 text-center text-xs text-[color:var(--ink-muted)]">
            {t("flyer.previewNote")}
          </div>
        </section>
      </div>
    </div>
  );
}
