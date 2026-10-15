import type { FlyerTemplate } from "../types";
import type { Lang } from "../i18n/strings";

export interface TemplateTextField {
  key: string;
  label: string;
  /** Control label in Khmer (the Flyer controls are translated too). */
  labelKm: string;
  defaultValue: Record<Lang, string>;
  defaultSize: number;
}

export const TEXT_FIELDS_BY_TEMPLATE: Record<
  FlyerTemplate,
  TemplateTextField[]
> = {
  showcase: [
    {
      key: "headline",
      label: "Info Card Title",
      labelKm: "ចំណងជើងកាតព័ត៌មាន",
      defaultValue: { en: "New Home For Sale", km: "ផ្ទះថ្មីសម្រាប់លក់" },
      defaultSize: 44,
    },
    {
      key: "sectionTitle",
      label: "Section Title",
      labelKm: "ចំណងជើងផ្នែក",
      defaultValue: {
        en: "Property Overview",
        km: "ទិដ្ឋភាពទូទៅនៃអចលនទ្រព្យ",
      },
      defaultSize: 32,
    },
    {
      key: "agentRole",
      label: "Agent Role",
      labelKm: "តួនាទីភ្នាក់ងារ",
      defaultValue: {
        en: "Residential Specialist",
        km: "អ្នកជំនាញលំនៅដ្ឋាន",
      },
      defaultSize: 14,
    },
  ],

  gallery: [
    {
      key: "priceLabel",
      label: "Price Label",
      labelKm: "ស្លាកតម្លៃ",
      defaultValue: { en: "Offered at", km: "តម្លៃលក់" },
      defaultSize: 20,
    },
    {
      key: "headlineScript",
      label: "Headline Script",
      labelKm: "ចំណងជើងអក្សរសរសេរ",
      defaultValue: { en: "New", km: "ថ្មី" },
      defaultSize: 100,
    },
    {
      key: "headlineMain",
      label: "Headline Main",
      labelKm: "ចំណងជើងមេ",
      defaultValue: { en: "Listing", km: "សម្រាប់លក់" },
      defaultSize: 70,
    },
    {
      key: "propertyTitle",
      label: "Property Section Title",
      labelKm: "ចំណងជើងផ្នែកអចលនទ្រព្យ",
      defaultValue: { en: "The Property", km: "អចលនទ្រព្យ" },
      defaultSize: 46,
    },
    {
      key: "agentRole",
      label: "Agent Role",
      labelKm: "តួនាទីភ្នាក់ងារ",
      defaultValue: {
        en: "Residential Specialist",
        km: "អ្នកជំនាញលំនៅដ្ឋាន",
      },
      defaultSize: 14,
    },
  ],

  modern: [
    {
      key: "headlineSmall",
      label: "Headline Small",
      labelKm: "ចំណងជើងតូច",
      defaultValue: { en: "Modern Home", km: "ផ្ទះទំនើប" },
      defaultSize: 64,
    },
    {
      key: "headlineLarge",
      label: "Headline Large",
      labelKm: "ចំណងជើងធំ",
      defaultValue: { en: "For Sale", km: "សម្រាប់លក់" },
      defaultSize: 78,
    },
    {
      key: "tagline",
      label: "Tagline",
      labelKm: "ពាក្យស្លោក",
      defaultValue: {
        en: "A Home That Fits Your Lifestyle",
        km: "ផ្ទះដែលសមនឹងរបៀបរស់នៅរបស់អ្នក",
      },
      defaultSize: 32,
    },
    {
      key: "taglineBody",
      label: "Tagline Body",
      labelKm: "អត្ថបទពាក្យស្លោក",
      defaultValue: {
        en: "Enjoy spacious interiors, modern touches, and a layout designed for convenience and comfort.",
        km: "រីករាយជាមួយទីធ្លាទូលាយ ការតុបតែងទំនើប និងប្លង់ដែលរចនាឡើងដើម្បីភាពងាយស្រួល និងផាសុកភាព។",
      },
      defaultSize: 19,
    },
    {
      key: "aboutTitle",
      label: "About Section Title",
      labelKm: "ចំណងជើងផ្នែកអំពី",
      defaultValue: {
        en: "About The Property",
        km: "អំពីអចលនទ្រព្យ",
      },
      defaultSize: 30,
    },
    {
      key: "priceLabel",
      label: "Price Label",
      labelKm: "ស្លាកតម្លៃ",
      defaultValue: { en: "Offered At", km: "តម្លៃលក់" },
      defaultSize: 30,
    },
    {
      key: "appointmentLabel",
      label: "Phone Label",
      labelKm: "ស្លាកទូរស័ព្ទ",
      defaultValue: {
        en: "Call for appointment",
        km: "ទូរស័ព្ទកក់ពេលជួប",
      },
      defaultSize: 12,
    },
    {
      key: "agentRole",
      label: "Agent Role",
      labelKm: "តួនាទីភ្នាក់ងារ",
      defaultValue: {
        en: "Residential Specialist",
        km: "អ្នកជំនាញលំនៅដ្ឋាន",
      },
      defaultSize: 14,
    },
  ],
};

/** Default flyer wording for a field in the given language. */
export function defaultText(
  template: FlyerTemplate,
  key: string,
  lang: Lang
): string {
  const field = TEXT_FIELDS_BY_TEMPLATE[template].find((f) => f.key === key);
  return field?.defaultValue[lang] ?? "";
}

/**
 * Khmer glyphs are taller and wider than the Latin type the templates were
 * designed around, so Khmer headlines default to a smaller size.
 */
const KM_SIZE_SCALE = 0.8;

export function defaultSizeFor(field: TemplateTextField, lang: Lang): number {
  // Only headline-sized text shrinks; small body text is already legible.
  return lang === "km" && field.defaultSize >= 30
    ? Math.round(field.defaultSize * KM_SIZE_SCALE)
    : field.defaultSize;
}

export function defaultSize(
  template: FlyerTemplate,
  key: string,
  lang: Lang
): number {
  const field = TEXT_FIELDS_BY_TEMPLATE[template].find((f) => f.key === key);
  return field ? defaultSizeFor(field, lang) : 0;
}
