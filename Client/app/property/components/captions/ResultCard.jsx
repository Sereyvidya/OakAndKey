"use client";

import { FiCheck, FiCopy } from "react-icons/fi";

export default function CaptionResultCard({ variant, copied, copyVariant }) {
  const isCopied = copied === variant.name;
  const hashtagText = variant.hashtags.join(" ");

  return (
    <section className="form-section group rounded-xl border border-transparent px-4 py-5 transition hover:border-[var(--card-border)] hover:bg-[color:var(--surface-soft)]/45">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--ink-strong)]">
            {variant.name}
          </h2>
          <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
            {variant.caption.length} characters · {variant.hashtags.length}{" "}
            hashtags
          </p>
        </div>

        <button
          type="button"
          onClick={() => copyVariant(variant)}
          className={[
            "hover-lift inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            isCopied
              ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--ink-strong)]"
              : "border-[var(--field-border)] bg-[color:var(--field-bg)] text-[color:var(--ink-base)] hover:bg-[color:var(--surface)]",
          ].join(" ")}
        >
          {isCopied ? (
            <>
              <FiCheck className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <FiCopy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-[color:var(--ink-base)]">
        {variant.caption}
      </pre>

      {hashtagText && (
        <p className="mt-4 rounded-lg bg-[color:var(--field-bg)] px-3 py-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
          {hashtagText}
        </p>
      )}
    </section>
  );
}
