import type { CaptionVariant } from "../types";
import { cleanText, formatCurrency } from "../listing/format";

/** Price as shown in prompts, e.g. "$485,000"; empty when not a number. */
export const formatPrice = formatCurrency;

/** Splits a `data:<mime>;base64,<data>` URL; null for anything else. */
export function parseDataUrl(
  dataUrl: unknown
): { mimeType: string; data: string } | null {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const m = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!m) return null;
  return { mimeType: m[1] ?? "", data: m[2] ?? "" };
}

/** Parses model text as JSON, tolerating ```json fences; null if invalid. */
export function parseJsonFromText(text: string): unknown {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/** Loosely-typed shape of one variant as the model returns it, before validation. */
interface RawVariant {
  name?: unknown;
  caption?: unknown;
  hashtags?: unknown;
  note?: unknown;
}

/** Normalizes model output into up to 3 caption variants; null if none usable. */
export function validateOutput(parsed: unknown): CaptionVariant[] | null {
  const raw = (parsed as { variants?: unknown } | null)?.variants;
  if (!Array.isArray(raw)) return null;
  const variants = (raw as RawVariant[])
    .slice(0, 3)
    .map((v, idx) => ({
      name: cleanText(v?.name) || `Version ${idx + 1}`,
      caption: cleanText(v?.caption),
      hashtags: Array.isArray(v?.hashtags)
        ? v.hashtags
            .map((h) => cleanText(h).replace(/\s+/g, ""))
            .filter(Boolean)
            .map((h) => (h.startsWith("#") ? h : `#${h}`))
            .slice(0, 14)
        : [],
      note: cleanText(v?.note),
    }))
    .filter((v) => v.caption);

  if (variants.length === 0) return null;
  return variants;
}
