"use client";

import { useState } from "react";
import InlineSpinner from "./InlineSpinner";
import { buildFlyerTheme, FLYER_THEME_PRESETS } from "@/app/lib/flyer/theme";
import { TEXT_FIELDS_BY_TEMPLATE } from "@/app/lib/flyer/templateCopy";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

export default function FlyerControls({
  template,
  setTemplate,
  themePreset,
  setThemePreset,
  customThemes = [],
  setCustomThemes,
  templates,
  onExportPNG,
  isExportingPNG,
  templateCopy = {},
  setTemplateCopy,
}) {
  const [showCustomTheme, setShowCustomTheme] = useState(false);

  const [customColors, setCustomColors] = useState({
    name: "Custom",
    primary: "#c8bd91",
    secondary: "#171c24",
    surface: "#f4efe6",
  });

  const allThemePresets = [
    ...Object.entries(FLYER_THEME_PRESETS).map(([key, preset]) => ({
      key,
      name: preset.name,
      colors: buildFlyerTheme(key),
    })),
    ...customThemes.map((theme) => ({
      key: theme.key,
      name: theme.name,
      colors: theme,
    })),
  ];

  const addCustomTheme = () => {
    const newTheme = {
      key: `custom-${Date.now()}`,
      name: customColors.name.trim() || "Custom",
      primary: customColors.primary,
      secondary: customColors.secondary,
      surface: customColors.surface,
    };

    setCustomThemes((prev) => [...prev, newTheme]);
    setThemePreset(newTheme.key);
    setShowCustomTheme(false);
  };

  const activeTextFields = TEXT_FIELDS_BY_TEMPLATE[template] || [];

  const updateTextField = (field, nextValue) => {
    setTemplateCopy((prev) => ({
      ...prev,
      [template]: {
        ...prev[template],
        [field.key]: {
          text:
            nextValue.text ??
            prev?.[template]?.[field.key]?.text ??
            field.defaultValue,
          size:
            nextValue.size ??
            prev?.[template]?.[field.key]?.size ??
            field.defaultSize,
        },
      },
    }));
  };

  return (
    <aside className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/90 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.75)] backdrop-blur lg:sticky lg:top-24 lg:h-fit">
      <h1 className="mb-6 text-3xl font-semibold text-[color:var(--ink-strong)]">
        Flyer Builder
      </h1>

      <div className="space-y-6">
        <section>
          <div className="mb-3 text-xs font-semibold tracking-[0.16em] text-[color:var(--ink-muted)] uppercase">
            Colors
          </div>

          <div className="grid grid-cols-4 gap-2">
            {allThemePresets.map(({ key, name, colors }) => {
              const active = themePreset === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setThemePreset(key)}
                  title={name}
                  aria-label={`Use ${name} theme`}
                  className={[
                    "hover-lift flex h-11 items-center justify-center rounded-xl border transition",
                    active
                      ? "border-[var(--brand)] bg-[color:var(--surface-soft)] ring-2 ring-[var(--brand)]"
                      : "border-[var(--field-border)] hover:bg-[color:var(--surface-soft)]",
                  ].join(" ")}
                >
                  <div className="flex h-5 w-8 overflow-hidden rounded-md border border-black/10">
                    <span
                      className="h-full flex-1"
                      style={{ background: colors.primary }}
                    />
                    <span
                      className="h-full flex-1"
                      style={{ background: colors.secondary }}
                    />
                    <span
                      className="h-full flex-1"
                      style={{ background: colors.surface }}
                    />
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowCustomTheme((open) => !open)}
              className="hover-lift flex h-11 items-center justify-center rounded-xl border border-dashed border-[var(--field-border)] text-lg font-semibold text-[color:var(--ink-muted)] transition hover:border-[var(--brand)] hover:text-[color:var(--ink-strong)]"
              title="Add custom preset"
            >
              +
            </button>
          </div>

          {showCustomTheme && (
            <div className="mt-4 rounded-2xl border border-[var(--field-border)] bg-[color:var(--field-bg)] p-4">
              <div className="mb-3 text-xs font-semibold tracking-[0.14em] text-[color:var(--ink-muted)] uppercase">
                Custom Theme
              </div>

              <input
                type="text"
                value={customColors.name}
                onChange={(e) =>
                  setCustomColors((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Preset name"
                className="mb-3 w-full rounded-xl border border-[var(--field-border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--ink-base)] outline-none focus:border-[var(--brand)]"
              />

              <div className="space-y-3">
                {["primary", "secondary", "surface"].map((field) => (
                  <label
                    key={field}
                    className="flex items-center justify-between gap-3 text-sm font-medium text-[color:var(--ink-base)]"
                  >
                    <span className="capitalize">{field}</span>

                    <input
                      type="color"
                      value={customColors[field]}
                      onChange={(e) =>
                        setCustomColors((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      className="h-9 w-12 cursor-pointer rounded border border-[var(--field-border)] bg-transparent"
                    />
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={addCustomTheme}
                className="mt-4 w-full rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[#0b0f14] hover:bg-[var(--brand-strong)]"
              >
                Add Custom Preset
              </button>
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 text-xs font-semibold tracking-[0.16em] text-[color:var(--ink-muted)] uppercase">
            Template
          </div>

          <div className="grid grid-cols-3 gap-2">
            {templates.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTemplate(key)}
                className={[
                  "hover-lift rounded-xl px-3 py-2 text-sm font-semibold transition",
                  template === key
                    ? "bg-[var(--brand)] text-[#0b0f14]"
                    : "border border-[var(--field-border)] text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 text-xs font-semibold tracking-[0.16em] text-[color:var(--ink-muted)] uppercase">
            Text
          </div>

          <div className="space-y-3">
            {activeTextFields.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]">
                  {field.label}
                </span>

                <div className="relative">
                  <input
                    type="text"
                    value={
                      templateCopy?.[template]?.[field.key]?.text ??
                      field.defaultValue
                    }
                    onChange={(e) =>
                      updateTextField(field, {
                        text: e.target.value,
                      })
                    }
                    className={[
                      "w-full rounded-xl border bg-[color:var(--field-bg)] px-3 py-2 pr-10 text-sm text-[color:var(--ink-base)] transition outline-none",
                      "border-[var(--field-border)]",
                      "focus:border-[var(--brand)] focus:bg-[color:var(--surface-soft)] focus:ring-2 focus:ring-[var(--brand)]",
                    ].join(" ")}
                  />

                  <div className="absolute top-1/2 right-3 flex -translate-y-1/2 flex-col items-center">
                    <button
                      type="button"
                      onClick={() =>
                        updateTextField(field, {
                          size:
                            (templateCopy?.[template]?.[field.key]?.size ??
                              field.defaultSize) + 2,
                        })
                      }
                      className="text-[11px] leading-none text-[var(--brand)] hover:text-[var(--brand-strong)]"
                    >
                      <FiChevronUp className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateTextField(field, {
                          size: Math.max(
                            10,
                            (templateCopy?.[template]?.[field.key]?.size ??
                              field.defaultSize) - 2
                          ),
                        })
                      }
                      className="-mt-1 text-[11px] leading-none text-[var(--brand)] hover:text-[var(--brand-strong)]"
                    >
                      <FiChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={onExportPNG}
          disabled={isExportingPNG}
          className="hover-lift flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 font-semibold text-[#0b0f14] hover:bg-[var(--brand-strong)] disabled:opacity-60"
        >
          {isExportingPNG ? <InlineSpinner /> : "Download PNG"}
        </button>
      </div>
    </aside>
  );
}
