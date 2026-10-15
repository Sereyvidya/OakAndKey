import { useT } from "@/app/lib/i18n/store";
import type { ChangeEventHandler } from "react";
import type { IconType } from "react-icons";

export default function FileInput({
  icon: Icon,
  label,
  onChange,
  onClear,
  accept,
  file,
}: {
  icon: IconType;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onClear: () => void;
  accept?: string;
  file?: { name?: string } | string | null;
}) {
  const { t } = useT();
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-input`;

  return (
    <div>
      <div className="mb-2 text-sm font-medium text-[color:var(--ink-base)]">
        {label}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label
            htmlFor={inputId}
            className="relative inline-flex cursor-pointer items-center rounded-md border border-[color:var(--field-border)] bg-[color:var(--field-bg)] px-4 py-2 pl-10 text-sm font-medium text-[color:var(--ink-soft)] hover:bg-[color:var(--surface-soft)]"
          >
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]">
              <Icon size={16} />
            </span>
            {t("file.choose")}
          </label>
          <input
            id={inputId}
            type="file"
            accept={accept}
            onChange={onChange}
            className="hidden"
          />
          <span className="text-sm text-[color:var(--ink-muted)]">
            {(typeof file === "string" ? "" : file?.name) || t("file.none")}
          </span>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink-strong)]"
        >
          {t("file.clear")}
        </button>
      </div>
    </div>
  );
}
