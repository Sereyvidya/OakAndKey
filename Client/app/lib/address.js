const clean = (v) => String(v || "").trim();

export function splitAddressParts(value = "") {
  const raw = clean(value);
  if (!raw) return { street: "", city: "", state: "" };

  const parts = raw.split(",").map(clean).filter(Boolean);

  if (parts.length >= 3) {
    const state = parts.pop() || "";
    const city = parts.pop() || "";
    const street = parts.join(", ");
    return { street, city, state };
  }

  if (parts.length === 2) {
    return { street: parts[0], city: parts[1], state: "" };
  }

  return { street: parts[0] || "", city: "", state: "" };
}

export function composeAddress(street = "", city = "", state = "") {
  return [street, city, state].map(clean).filter(Boolean).join(", ");
}
