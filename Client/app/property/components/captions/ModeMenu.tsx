import { useT } from "@/app/lib/i18n/store";
import { useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";

export type CaptionMode = "local" | "ai";

export default function ModeMenu({
  mode,
  setMode,
}: {
  mode: CaptionMode;
  setMode: (mode: CaptionMode) => void;
}) {
  const { t } = useT();
  const [rotation, setRotation] = useState(false);

  const toggleMode = () => {
    setRotation((r) => !r);
    setMode(mode === "local" ? "ai" : "local");
  };

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="form-input-focus form-field flex h-11 min-w-[180px] items-center justify-between rounded-[1rem] border border-[color:var(--field-border)] bg-[color:var(--field-bg)] px-4 text-sm font-semibold text-[color:var(--ink-base)] shadow-[0_10px_24px_-22px_rgba(15,23,42,0.45)] transition hover:bg-[color:var(--surface-soft)]"
    >
      <span>
        {mode === "local" ? t("captions.modeLocal") : t("captions.modeAi")}
      </span>

      <LuRefreshCcw
        className={[
          "h-4 w-4 text-[color:var(--ink-muted)] transition-transform duration-300",
          rotation ? "rotate-180" : "",
        ].join(" ")}
      />
    </button>
  );
}
