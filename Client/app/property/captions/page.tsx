"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  CaptionRequest,
  CaptionResponse,
  CaptionVariant,
} from "@/app/lib/types";
import { useT } from "@/app/lib/i18n/store";
import LanguageToggle from "@/app/components/LanguageToggle";
import { postApi } from "@/app/lib/gemini/postApi";
import { usePropertyStore } from "@/app/lib/propertyStore";
import { generateCaptionVariants } from "@/app/lib/captions/generate";
import { hasMinimumListingData } from "@/app/lib/listing/validation";

import InlineSpinner from "../components/shared/InlineSpinner";
import ModeMenu, { type CaptionMode } from "../components/captions/ModeMenu";
import ImageSelector from "../components/captions/ImageSelector";
import ResultCard from "../components/captions/ResultCard";

export default function CaptionsPage() {
  const { t, lang } = useT();
  const formData = usePropertyStore((s) => s.formData);
  const images = usePropertyStore((s) => s.images);
  const [copied, setCopied] = useState("");
  const [aiVariants, setAiVariants] = useState<CaptionVariant[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [mode, setMode] = useState<CaptionMode>("local");
  const [selectedImageIndexes, setSelectedImageIndexes] = useState<number[]>(
    () => images.slice(0, 3).map((_, idx) => idx)
  );
  const [prevInputs, setPrevInputs] = useState({ formData, images, lang });

  const hasMinimumData = hasMinimumListingData({
    formData,
    images,
  });

  // The local generator is deterministic, so derive its output from the inputs.
  const localVariants = useMemo(
    () =>
      hasMinimumData
        ? generateCaptionVariants(formData, images, lang).slice(0, 3)
        : null,
    [hasMinimumData, formData, images, lang]
  );

  const variants = mode === "ai" ? aiVariants : localVariants;

  // Reset derived state during render when the listing inputs change.
  if (
    prevInputs.formData !== formData ||
    prevInputs.images !== images ||
    prevInputs.lang !== lang
  ) {
    setPrevInputs({ formData, images, lang });
    setAiVariants(null);
    setAiError("");
    if (prevInputs.images !== images) {
      const valid = selectedImageIndexes.filter(
        (i) => i >= 0 && i < images.length
      );
      setSelectedImageIndexes(
        valid.length > 0
          ? valid.slice(0, 3)
          : images.slice(0, 3).map((_, idx) => idx)
      );
    }
  }

  const copyVariant = async (variant: CaptionVariant) => {
    const payload = `${variant.caption}\n\n${variant.hashtags.join(" ")}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(variant.name);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied(t("captions.copyFailed"));
      window.setTimeout(() => setCopied(""), 1800);
    }
  };

  const generateWithAI = async () => {
    try {
      setIsGenerating(true);
      setAiError("");

      const payload: CaptionRequest = {
        formData,
        language: lang,
        images: selectedImageIndexes
          .map((idx) => images[idx])
          .filter(Boolean)
          .map((img) => ({
            name: img?.name || "",
            preview: img?.preview || "",
          })),
      };

      const data = await postApi<
        Extract<CaptionResponse, { variants: unknown }>
      >("/api/captions/generate", payload, lang);

      setAiVariants(data.variants.slice(0, 3));
    } catch (err) {
      setAiError(
        err instanceof Error && err.message
          ? err.message
          : t("captions.aiFailed")
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLocal = () => {
    setAiError("");
  };

  const handleGenerate = () => {
    if (mode === "ai") {
      generateWithAI();
      return;
    }
    generateLocal();
  };

  const toggleImageSelection = (idx: number) => {
    setSelectedImageIndexes((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= 3) return prev;
      return [...prev, idx];
    });
  };

  if (!hasMinimumData) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.7)]">
        <h1 className="mb-2 text-3xl font-semibold text-[color:var(--ink-strong)]">
          {t("captions.title")}
        </h1>
        <p className="mb-6 text-[color:var(--ink-soft)]">
          {t("captions.needData")}
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
    <div className="interactive-form space-y-6">
      <section
        key={mode}
        className="interactive-form relative z-20 rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.7)]"
      >
        <h1 className="text-3xl font-semibold text-[color:var(--ink-strong)]">
          {t("captions.title")}
        </h1>

        <p className="mt-2 text-[color:var(--ink-soft)]">
          {mode === "ai" ? t("captions.descAi") : t("captions.descLocal")}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ModeMenu mode={mode} setMode={setMode} />

          <div className="flex items-center gap-2 text-sm text-[color:var(--ink-soft)]">
            <span>{t("captions.language")}</span>
            <LanguageToggle />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              isGenerating ||
              (mode === "ai" && selectedImageIndexes.length === 0)
            }
            className="hover-lift inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-6 text-sm font-semibold text-[#0b0f14] shadow-[0_10px_24px_-22px_rgba(15,23,42,0.45)] hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <InlineSpinner />
                {t("captions.generating")}
              </>
            ) : mode === "ai" && variants ? (
              t("captions.regenerate")
            ) : (
              t("captions.generate")
            )}
          </button>
        </div>

        {mode === "ai" && images.length > 0 ? (
          <ImageSelector
            images={images}
            selectedImageIndexes={selectedImageIndexes}
            toggleImageSelection={toggleImageSelection}
          />
        ) : null}

        {mode === "ai" && aiError ? (
          <p className="mt-2 text-xs text-red-400">{aiError}</p>
        ) : null}
      </section>

      {variants?.length ? (
        <section className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/82 p-6 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.55)]">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold tracking-[0.16em] text-[var(--ink-muted)] uppercase">
              {t("captions.generated")}
            </div>

            <div className="text-xs text-[var(--ink-muted)]">
              {t("captions.versions", { n: variants.length })}
            </div>
          </div>

          <div className="space-y-6">
            {variants.map((variant) => (
              <ResultCard
                key={variant.name}
                variant={variant}
                copied={copied}
                copyVariant={copyVariant}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
