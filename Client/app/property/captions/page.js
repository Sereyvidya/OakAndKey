"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePropertyStore } from "@/app/lib/propertyStore";
import InlineSpinner from "../components/InlineSpinner";
import { generateCaptionVariants } from "@/app/lib/captions/generate";

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

  const hasMinimumData = Boolean(
    formData.propertyTitle?.trim() ||
      formData.address?.trim() ||
      images?.length > 0
  );

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
        images: selectedImageIndexes.map((idx) => images[idx]).filter(Boolean).map((img) => ({
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
    <div className="interactive-form rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.7)]">
      <section className="mb-6">
        <h1 className="text-3xl font-semibold text-[color:var(--ink-strong)]">
          Social Captions
        </h1>
        <p className="mt-2 text-[color:var(--ink-soft)]">
          {mode === "ai"
            ? "Use Gemini to generate 3 caption versions from your listing details and selected photos."
            : "Use the local generator to create 3 caption versions from your listing details."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("local")}
            className={[
              "hover-lift rounded-xl px-4 py-2 text-sm font-semibold transition",
              mode === "local"
                ? "bg-[var(--brand)] text-[#0b0f14] hover:bg-[var(--brand-strong)]"
                : "border border-[var(--field-border)] bg-[color:var(--field-bg)] text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]",
            ].join(" ")}
          >
            Use Local Generator
          </button>
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={[
              "hover-lift rounded-xl px-4 py-2 text-sm font-semibold transition",
              mode === "ai"
                ? "bg-[var(--brand)] text-[#0b0f14] hover:bg-[var(--brand-strong)]"
                : "border border-[var(--field-border)] bg-[color:var(--field-bg)] text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]",
            ].join(" ")}
          >
            Use Gemini
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || (mode === "ai" && selectedImageIndexes.length === 0)}
            className="hover-lift ml-auto inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[#0b0f14] hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <InlineSpinner />
                Generating...
              </>
            ) : variants ? (
              "Regenerate"
            ) : (
              "Generate"
            )}
          </button>
        </div>
        {mode === "ai" && images.length > 0 ? (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold tracking-wide text-[color:var(--ink-muted)] uppercase">
              <span>Choose up to 3 photos for Gemini</span>
              <span>{selectedImageIndexes.length}/3</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {images.map((img, idx) => {
                const selected = selectedImageIndexes.includes(idx);
                return (
                  <button
                    key={`${img?.name || "image"}-${idx}`}
                    type="button"
                    onClick={() => toggleImageSelection(idx)}
                    className={[
                      "relative overflow-hidden rounded-xl border transition",
                      selected
                        ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/40"
                        : "border-[var(--field-border)] hover:border-[var(--field-border-hover)]",
                    ].join(" ")}
                  >
                    <img
                      src={img?.preview}
                      alt={`Listing image ${idx + 1}`}
                      className="h-20 w-full object-cover"
                    />
                    <div className="absolute right-1 bottom-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {selected ? "Selected" : "Tap"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        {mode === "ai" && aiError ? (
          <p className="mt-2 text-xs text-red-400">{aiError}</p>
        ) : null}
      </section>

      {variants?.length ? (
        <div className="space-y-6">
          {variants.map((variant) => (
            <section key={variant.name} className="form-section pt-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-[color:var(--ink-strong)]">
                  {variant.name}
                </h2>
                <button
                  type="button"
                  onClick={() => copyVariant(variant)}
                  className="hover-lift rounded-lg border border-[var(--field-border)] bg-[color:var(--field-bg)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ink-base)] hover:bg-[color:var(--surface)]"
                >
                  {copied === variant.name ? "Copied" : "Copy"}
                </button>
              </div>

              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[color:var(--ink-base)]">
                {variant.caption}
              </pre>

              <p className="mt-4 text-sm text-[color:var(--ink-soft)]">
                {variant.hashtags.join(" ")}
              </p>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
