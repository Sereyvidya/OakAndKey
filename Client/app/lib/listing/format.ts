/** Anything that may carry an image source: an image object, a raw URL, or nothing. */
type ImageLike =
  | { type?: string; preview?: string; src?: string; url?: string }
  | string
  | null
  | undefined;

export function cleanText(value: unknown): string {
  return (value ?? "").toString().trim();
}

export function toNumber(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

export function formatNumber(value: unknown): string {
  const num = toNumber(value);
  if (num === null) return "";
  return num.toLocaleString("en-US");
}

export function formatCurrency(value: unknown): string {
  const formatted = formatNumber(value);
  return formatted ? `$${formatted}` : "";
}

export function pickSrc(img: ImageLike): string {
  if (typeof img === "string") return img;
  if (img?.type === "default-svg-logo") return "";
  return img?.preview || img?.src || img?.url || "";
}

export function joinParts(parts: unknown[]): string {
  return parts.map(cleanText).filter(Boolean).join(", ");
}
