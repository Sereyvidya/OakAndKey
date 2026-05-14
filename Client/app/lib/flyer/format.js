export function cleanText(v) {
  return (v ?? "").toString().trim();
}

export function formatPrice(price) {
  if (price === null || price === undefined || price === "") return "";

  const num = Number(price);
  if (Number.isNaN(num)) return String(price);

  return num.toLocaleString("en-US");
}

export function pickSrc(img) {
  if (img?.type === "default-svg-logo") return "";
  return img?.preview || img?.src || img?.url || "";
}

export function joinParts(parts) {
  return parts.map(cleanText).filter(Boolean).join(", ");
}
