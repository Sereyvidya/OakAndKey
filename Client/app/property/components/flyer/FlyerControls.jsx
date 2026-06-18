"use client";

import { useState } from "react";
import InlineSpinner from "../shared/InlineSpinner";
import { buildFlyerTheme, FLYER_THEME_PRESETS } from "@/app/lib/flyer/theme";
import { TEXT_FIELDS_BY_TEMPLATE } from "@/app/lib/flyer/templateCopy";
import {
  FiChevronUp,
  FiChevronDown,
  FiDownload,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { IoQrCode } from "react-icons/io5";
import { usePropertyStore } from "@/app/lib/propertyStore";
import FileInput from "../form/FileInput";

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
  onExportPDF,
  isExportingPDF,
  templateCopy = {},
  setTemplateCopy,
}) {
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [showColors, setShowColors] = useState(true);
  const [showText, setShowText] = useState(true);
  const [showPhotos, setShowPhotos] = useState(true);
  const [exportType, setExportType] = useState("png");

  const images = usePropertyStore((s) => s.images);
  const reorderImages = usePropertyStore((s) => s.reorderImages);
  const formData = usePropertyStore((s) => s.formData);
  const setFormData = usePropertyStore((s) => s.setFormData);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [customColors, setCustomColors] = useState({
    name: "Custom",
    primary: "#171c24",
    secondary: "#c8bd91",
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

  const fileToBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) =>
        resolve({ preview: event.target.result, name: file.name });
      reader.readAsDataURL(file);
    });

  const handleQrCodeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = await fileToBase64(file);
    setFormData({ agentQrCode: img });
  };

  const clearQrCode = () => {
    setFormData({ agentQrCode: null });
  };

  return (
    <aside className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/90 p-6 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.75)] backdrop-blur md:sticky md:top-24 md:h-fit">
      <h1 className="mb-6 text-3xl font-semibold text-[color:var(--ink-strong)]">
        Flyer Builder
      </h1>

      <div className="space-y-6">
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
                    ? "scale-[1.02] bg-[var(--brand)] text-[#0b0f14]"
                    : "border border-[var(--field-border)] text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold tracking-[0.16em] text-[color:var(--ink-muted)] uppercase">
              Photos
            </div>

            <button
              type="button"
              onClick={() => setShowPhotos((prev) => !prev)}
              className="text-[var(--brand)] hover:text-[var(--brand-strong)]"
            >
              <FiChevronDown
                className={[
                  "h-4 w-4 transition-transform duration-200",
                  showPhotos ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>
          </div>
          {showPhotos && images.length > 1 && (
            <p className="mb-3 text-xs text-[var(--ink-muted)]">
              Drag photos to reorder them on the flyer.
            </p>
          )}
          {showPhotos && (
            <div className="mb-3 grid grid-cols-4 gap-2 lg:grid-cols-3">
              {images.map((image, index) => {
                const src = image?.preview || image?.src || image?.url || "";

                return (
                  <div
                    key={src || index}
                    draggable
                    onDragStart={() => setDraggedIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedIndex === null || draggedIndex === index)
                        return;
                      reorderImages(draggedIndex, index);
                      setDraggedIndex(null);
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={[
                      "group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-[color:var(--field-bg)] transition",
                      draggedIndex === index
                        ? "scale-95 border-[var(--brand)] opacity-60"
                        : "border-[var(--field-border)] hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md",
                    ].join(" ")}
                  >
                    <img
                      src={src}
                      alt={`Property photo ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute top-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {showPhotos && (
            <div className="mt-4 border-t border-[var(--card-border)] pt-4">
              <p className="mb-3 text-xs text-[var(--ink-muted)]">
                Optional: Upload your own QR code. Otherwise, the flyer will
                generate one from your Social / Website link.
              </p>

              <FileInput
                icon={IoQrCode}
                label=""
                accept="image/*"
                file={formData.agentQrCode}
                onChange={handleQrCodeChange}
                onClear={clearQrCode}
              />
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold tracking-[0.16em] text-[color:var(--ink-muted)] uppercase">
              Colors
            </div>

            <button
              type="button"
              onClick={() => setShowColors((prev) => !prev)}
              className="text-[var(--brand)] hover:text-[var(--brand-strong)]"
            >
              <FiChevronDown
                className={[
                  "h-4 w-4 transition-transform duration-200",
                  showColors ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>
          </div>
          {showColors && (
            <>
              <p className="mb-3 text-xs text-[var(--ink-muted)]">
                Choose a color palette or define your own.
              </p>
              <div className="grid grid-cols-4 gap-1">
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
                        "group flex h-12 items-center justify-center transition-transform duration-200",
                        active ? "scale-110" : "hover:scale-110",
                      ].join(" ")}
                    >
                      <div
                        className="flex h-7 w-11 overflow-hidden rounded-md border transition-shadow duration-200"
                        style={{
                          borderColor: active
                            ? colors.primary
                            : `${colors.primary}55`,
                          boxShadow: active
                            ? `0 0 0 2px ${colors.primary}63`
                            : `0 0 0 0 ${colors.primary}00`,
                        }}
                      >
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
                  className="group flex h-12 items-center justify-center transition-transform duration-200 hover:scale-110"
                  title="Add custom preset"
                >
                  <div
                    className={[
                      "flex h-7 w-11 items-center justify-center rounded-md border transition",
                      showCustomTheme
                        ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                        : "border-dashed border-[var(--field-border)] bg-transparent",
                    ].join(" ")}
                  >
                    {showCustomTheme ? (
                      <FiX className="h-4 w-4 text-[var(--ink-soft)]" />
                    ) : (
                      <FiPlus className="h-4 w-4 text-[var(--ink-soft)]" />
                    )}
                  </div>
                </button>
              </div>
            </>
          )}

          {showColors && showCustomTheme && (
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
                {[
                  ["primary", "Main Color"],
                  ["secondary", "Accent Color"],
                  ["surface", "Background"],
                ].map(([field, label]) => (
                  <label
                    key={field}
                    className="flex items-center justify-between gap-3 text-sm font-medium text-[color:var(--ink-base)]"
                  >
                    <span>{label}</span>

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
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold tracking-[0.16em] text-[color:var(--ink-muted)] uppercase">
              Text
            </div>

            <button
              type="button"
              onClick={() => setShowText((prev) => !prev)}
              className="text-[var(--brand)] hover:text-[var(--brand-strong)]"
            >
              <FiChevronDown
                className={[
                  "h-4 w-4 transition-transform duration-200",
                  showText ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>
          </div>

          {showText && (
            <>
              <p className="mb-3 text-xs text-[var(--ink-muted)]">
                Adjust wording and font sizes for this template.
              </p>
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
            </>
          )}
        </section>

        <section>
          <div className="flex-col items-center justify-between space-y-3">
            <div className="text-xs font-semibold tracking-[0.16em] text-[color:var(--ink-muted)] uppercase">
              Download
            </div>
            <div className="grid grid-cols-[1fr_1fr_56px] gap-2">
              <button
                type="button"
                onClick={() => setExportType("png")}
                className={[
                  "hover-lift rounded-xl px-3 py-3 text-sm font-semibold transition",
                  exportType === "png"
                    ? "bg-[var(--brand)] text-[#0b0f14]"
                    : "border border-[var(--field-border)] text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]",
                ].join(" ")}
              >
                PNG
              </button>

              <button
                type="button"
                onClick={() => setExportType("pdf")}
                className={[
                  "hover-lift rounded-xl px-3 py-3 text-sm font-semibold transition",
                  exportType === "pdf"
                    ? "bg-[var(--brand)] text-[#0b0f14]"
                    : "border border-[var(--field-border)] text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]",
                ].join(" ")}
              >
                PDF
              </button>

              <button
                type="button"
                onClick={() =>
                  exportType === "pdf" ? onExportPDF() : onExportPNG()
                }
                disabled={isExportingPNG || isExportingPDF}
                className="hover-lift flex items-center justify-center rounded-xl bg-[var(--brand)] text-[#0b0f14] transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
              >
                {isExportingPNG || isExportingPDF ? (
                  <InlineSpinner />
                ) : (
                  <FiDownload className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
