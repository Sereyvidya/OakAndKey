export function cleanText(value) {
  return (value ?? "").toString().trim();
}

export function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

export function formatNumber(value) {
  const num = toNumber(value);
  if (num === null) return "";
  return num.toLocaleString("en-US");
}

export function formatCurrency(value) {
  const formatted = formatNumber(value);
  return formatted ? `$${formatted}` : "";
}

export function pickSrc(img) {
  if (img?.type === "default-svg-logo") return "";
  return img?.preview || img?.src || img?.url || "";
}

export function joinParts(parts) {
  return parts.map(cleanText).filter(Boolean).join(", ");
}
