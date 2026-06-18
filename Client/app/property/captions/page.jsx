"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePropertyStore } from "@/app/lib/propertyStore";
import { generateCaptionVariants } from "@/app/lib/captions/generate";
import { hasMinimumListingData } from "@/app/lib/listing/validation";

import InlineSpinner from "../components/shared/InlineSpinner";
import ModeMenu from "../components/captions/ModeMenu";
import ImageSelector from "../components/captions/ImageSelector";
import ResultCard from "../components/captions/ResultCard";

export default function CaptionsPage() {
  const formData = usePropertyStore((s) => s.formData);
  const images = usePropertyStore((s) => s.images);
  const [copied, setCopied] = useState("");
  const [localVariants, setLocalVariants] = useState(null);
  const [aiVariants, setAiVariants] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [mode, setMode] = useState("local");
  const [selectedImageIndexes, setSelectedImageIndexes] = useState([]);

  const hasMinimumData = hasMinimumListingData({
    formData,
    images,
  });

  const variants = mode === "ai" ? aiVariants : localVariants;

  useEffect(() => {
    setSelectedImageIndexes((prev) => {
      const valid = prev.filter((i) => i >= 0 && i < images.length);
      if (valid.length > 0) return valid.slice(0, 3);
      return images.slice(0, 3).map((_, idx) => idx);
    });
  }, [images]);

  useEffect(() => {
    setLocalVariants(null);
    setAiVariants(null);
    setAiError("");
  }, [formData, images]);

  const copyVariant = async (variant) => {
    const payload = `${variant.caption}\n\n${variant.hashtags.join(" ")}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(variant.name);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("Copy failed");
      window.setTimeout(() => setCopied(""), 1800);
    }
  };

  const generateWithAI = async () => {
    try {
      setIsGenerating(true);
      setAiError("");

      const payload = {
        formData,
        images: selectedImageIndexes
          .map((idx) => images[idx])
          .filter(Boolean)
          .map((img) => ({
            name: img?.name || "",
            preview: img?.preview || "",
          })),
      };

      const resp = await fetch("/api/captions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "Failed to generate AI captions.");
      }

      if (!Array.isArray(data?.variants) || data.variants.length === 0) {
        throw new Error("AI returned no caption variants.");
      }

      setAiVariants(data.variants.slice(0, 3));
    } catch (err) {
      setAiError(err?.message || "Failed to generate AI captions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLocal = () => {
    setLocalVariants(generateCaptionVariants(formData, images).slice(0, 3));
    setAiError("");
  };

  const handleGenerate = () => {
    if (mode === "ai") {
      generateWithAI();
      return;
    }
    generateLocal();
  };

  const toggleImageSelection = (idx) => {
    setSelectedImageIndexes((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= 3) return prev;
      return [...prev, idx];
    });
  };

  useEffect(() => {
    if (!hasMinimumData) return;

    setLocalVariants(generateCaptionVariants(formData, images).slice(0, 3));
  }, [hasMinimumData, formData, images]);

  if (!hasMinimumData) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.7)]">
        <h1 className="mb-2 text-3xl font-semibold text-[color:var(--ink-strong)]">
          Social Captions
        </h1>
        <p className="mb-6 text-[color:var(--ink-soft)]">
          Add listing details and photos first, then generate caption versions.
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
    <div className="interactive-form space-y-6">
      <section
        key={mode}
        className="interactive-form relative z-20 rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.7)]"
      >
        <h1 className="text-3xl font-semibold text-[color:var(--ink-strong)]">
          Social Captions
        </h1>

        <p className="mt-2 text-[color:var(--ink-soft)]">
          {mode === "ai"
            ? "Use Gemini to generate 3 caption versions from your listing details and selected photos."
            : "Use the local generator to create 3 caption versions from your listing details."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ModeMenu mode={mode} setMode={setMode} />

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
                Generating...
              </>
            ) : mode === "ai" && variants ? (
              "Regenerate"
            ) : (
              "Generate"
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
              Generated Captions
            </div>

            <div className="text-xs text-[var(--ink-muted)]">
              {variants.length} versions
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
