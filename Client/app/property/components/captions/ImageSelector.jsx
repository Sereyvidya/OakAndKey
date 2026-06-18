"use client";

import { FiCheck } from "react-icons/fi";

export default function ImageSelector({
  images,
  selectedImageIndexes,
  toggleImageSelection,
}) {
  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="text-xs font-semibold tracking-[0.16em] text-[color:var(--ink-muted)] uppercase">
          Select up to 3 photos
        </div>

        <span className="rounded-full border border-[var(--card-border)] bg-[var(--field-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--ink-soft)]">
          {selectedImageIndexes.length}/3
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">
        {images.map((img, idx) => {
          const selected = selectedImageIndexes.includes(idx);

          return (
            <button
              key={`${img?.name || "image"}-${idx}`}
              type="button"
              onClick={() => toggleImageSelection(idx)}
              className={[
                "group relative overflow-hidden rounded-xl border bg-[var(--field-bg)] transition",
                selected
                  ? "border-[var(--brand)] shadow-[0_10px_24px_rgba(190,180,145,0.22)]"
                  : "border-[var(--field-border)] hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md",
              ].join(" ")}
            >
              <img
                src={img?.preview}
                alt={`Listing image ${idx + 1}`}
                className="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

              {selected ? (
                <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-[var(--brand)] px-2 py-1 text-[10px] font-semibold text-[#0b0f14] shadow">
                  <FiCheck className="h-3 w-3" />
                  Selected
                </div>
              ) : (
                <div className="absolute right-2 bottom-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  Select
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
