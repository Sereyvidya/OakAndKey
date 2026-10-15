import type { Lang } from "../i18n/strings";
import type { SizeUnit } from "../types";

/** Beds / baths / size line shown on flyers, e.g. "4 BED | 3 BATH | 2637 sqft". */
export function factsLine(
  lang: Lang,
  {
    beds,
    baths,
    size,
    sizeUnit,
    upper = false,
  }: {
    beds: number | null;
    baths: number | null;
    size: number | null;
    sizeUnit: SizeUnit;
    /** English templates differ in case: "BED" vs "Bed". */
    upper?: boolean;
  }
): string {
  if (lang === "km") {
    // m² / ft² are the units normally written in Cambodian listings.
    const unit = sizeUnit === "sqft" ? "ft²" : "m²";
    return `${beds} បន្ទប់គេង | ${baths} បន្ទប់ទឹក | ${size} ${unit}`;
  }
  return upper
    ? `${beds} BED | ${baths} BATH | ${size} ${sizeUnit}`
    : `${beds} Bed | ${baths} Bath | ${size} ${sizeUnit}`;
}

export const DEFAULT_DESCRIPTION: Record<Lang, string> = {
  en: "Beautifully updated residence with open living spaces, refined finishes, and a layout designed for modern everyday living.",
  km: "ផ្ទះដែលបានកែលម្អយ៉ាងស្រស់ស្អាត មានទីធ្លាបើកចំហ ការតុបតែងប្រណិត និងប្លង់សមស្របសម្រាប់ការរស់នៅទំនើបប្រចាំថ្ងៃ។",
};
