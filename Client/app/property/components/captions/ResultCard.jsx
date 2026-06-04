"use client";

export default function CaptionResultCard({ variant, copied, copyVariant }) {
  return (
    <section className="form-section pt-5">
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

      <pre className="mt-3 font-sans text-sm leading-relaxed whitespace-pre-wrap text-[color:var(--ink-base)]">
        {variant.caption}
      </pre>

      <p className="mt-4 text-sm text-[color:var(--ink-soft)]">
        {variant.hashtags.join(" ")}
      </p>
    </section>
  );
}
