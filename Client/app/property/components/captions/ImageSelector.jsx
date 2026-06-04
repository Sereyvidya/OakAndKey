"use client";

export default function ImageSelector({
  images,
  selectedImageIndexes,
  toggleImageSelection,
}) {
  return (
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
  );
}
