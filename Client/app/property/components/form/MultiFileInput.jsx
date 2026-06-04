export default function MultiFileInput({
  icon: Icon,
  label,
  onChange,
  onClear,
  files,
  hasError,
}) {
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-input`;

  return (
    <div>
      <div className="mb-2 text-sm font-medium text-[color:var(--ink-base)]">
        {label}
      </div>

      <div className="flex justify-between gap-3">
        <div className="flex items-center gap-3">
          <label
            htmlFor={inputId}
            className={[
              "relative inline-flex cursor-pointer items-center rounded-md border bg-[color:var(--field-bg)] px-4 py-2 pl-10 text-sm font-medium text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]",
              hasError ? "field-error" : "border-[color:var(--field-border)]",
            ].join(" ")}
          >
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]">
              <Icon size={16} />
            </span>
            Choose file
          </label>

          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            onChange={onChange}
            className="hidden"
          />

          <span className="text-sm text-[color:var(--ink-muted)]">
            {files?.length
              ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
              : "No files chosen"}
          </span>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="mt-3 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!files?.length}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
