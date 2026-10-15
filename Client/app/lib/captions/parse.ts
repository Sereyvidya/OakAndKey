import { z } from "zod";
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

/** Hashtags are cosmetic, so bad entries are dropped instead of failing the reply. */
function cleanHashtags(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((h) => cleanText(h).replace(/\s+/g, ""))
    .filter(Boolean)
    .map((h) => (h.startsWith("#") ? h : `#${h}`));
}

const variantSchema = z.object({
  name: z.string().trim().optional(),
  caption: z.string().trim().min(1),
  hashtags: z.unknown().optional(),
  note: z.string().trim().optional(),
});

/** Schema for the model's reply; also the contract quoted in the strict retry prompt. */
export const captionOutputSchema = z.object({
  variants: z.array(variantSchema).min(1),
});

/** Human-readable form of the schema, for the stricter retry prompt. */
export const CAPTION_SCHEMA_TEXT = `{"variants":[{"name":string,"caption":non-empty string,"hashtags":[string],"note":string}]} with 1 to 3 variants`;

/** Validates model output into up to 3 caption variants; null if it does not match the schema. */
export function validateOutput(parsed: unknown): CaptionVariant[] | null {
  const result = captionOutputSchema.safeParse(parsed);
  if (!result.success) return null;
  return result.data.variants.slice(0, 3).map((v, idx) => ({
    name: v.name || `Version ${idx + 1}`,
    caption: v.caption,
    hashtags: cleanHashtags(v.hashtags).slice(0, 14),
    note: v.note ?? "",
  }));
}

/** Text -> variants, or null when the text is not valid JSON in the expected shape. */
export function parseCaptionReply(text: string): CaptionVariant[] | null {
  return validateOutput(parseJsonFromText(text));
}
