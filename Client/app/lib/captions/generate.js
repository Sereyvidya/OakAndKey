function cleanText(v) {
  return (v ?? "").toString().trim();
}

function toNumber(v) {
  if (v === "" || v === null || v === undefined) return null;
  const num = Number(v);
  return Number.isNaN(num) ? null : num;
}

function formatPrice(price) {
  const n = toNumber(price);
  if (n === null) return null;
  return `$${n.toLocaleString("en-US")}`;
}

function parseAreaFromAddress(address) {
  const a = cleanText(address);
  if (!a) return "";
  const parts = a.split(",").map((x) => x.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
}

function detectPhotoTags(images = []) {
  const names = images
    .map((img) => cleanText(img?.name).toLowerCase())
    .filter(Boolean);
  const joined = names.join(" ");
  const tags = new Set();

  if (/kitchen/.test(joined)) tags.add("kitchen");
  if (/bed|bedroom|master/.test(joined)) tags.add("bedroom");
  if (/bath|bathroom/.test(joined)) tags.add("bathroom");
  if (/living|lounge|family/.test(joined)) tags.add("livingroom");
  if (/front|exterior|outside|facade/.test(joined)) tags.add("exterior");
  if (/pool/.test(joined)) tags.add("pool");
  if (/garden|yard|backyard/.test(joined)) tags.add("garden");
  if (/balcony|terrace/.test(joined)) tags.add("balcony");

  return [...tags];
}

function makeHashtags({ propertyType, area, photoTags }) {
  const tags = new Set([
    "JustListed",
    "DreamHome",
    "HomeForSale",
    "RealEstate",
    "AngkorListing",
  ]);

  const type = cleanText(propertyType).toLowerCase();
  if (type === "house") tags.add("HouseForSale");
  if (type === "condo") tags.add("CondoForSale");

  if (area) {
    const normalized = area.replace(/[^a-zA-Z0-9]/g, "");
    if (normalized) tags.add(normalized);
  }

  const map = {
    kitchen: "ModernKitchen",
    bedroom: "CozyBedroom",
    bathroom: "LuxuryBathroom",
    livingroom: "LivingRoom",
    exterior: "CurbAppeal",
    pool: "PoolHome",
    garden: "GardenHome",
    balcony: "CityViews",
  };
  photoTags.forEach((tag) => {
    if (map[tag]) tags.add(map[tag]);
  });

  return [...tags].slice(0, 12).map((t) => `#${t}`);
}

function buildPropertyFacts(formData) {
  const beds = toNumber(formData.bedrooms);
  const baths = toNumber(formData.bathrooms);
  const size = toNumber(formData.size);
  const facts = [];
  if (beds !== null) facts.push(`${beds} bed`);
  if (baths !== null) facts.push(`${baths} bath`);
  if (size !== null) facts.push(`${size} sqm`);
  return facts.join(" • ");
}

export function generateCaptionVariants(formData, images = []) {
  const title = cleanText(formData.propertyTitle) || "New listing";
  const area = parseAreaFromAddress(formData.address);
  const type = cleanText(formData.propertyType) || "home";
  const price = formatPrice(formData.price);
  const facts = buildPropertyFacts(formData);
  const photoTags = detectPhotoTags(images);
  const hashtags = makeHashtags({ propertyType: type, area, photoTags });

  const lead = `${title}${area ? ` in ${area}` : ""}`;
  const factsLine = [type, facts].filter(Boolean).join(" • ");
  const priceLine = price ? `Listed at ${price}.` : "Price available on request.";
  const description = cleanText(formData.description);
  const descriptionLine = description
    ? description
    : "Thoughtfully designed layout with comfortable, everyday living in mind.";

  const photoLine =
    images.length > 0
      ? `Photo highlights: ${
          photoTags.length ? photoTags.join(", ") : `${images.length} listing photos`
        }.`
      : "Upload photos to generate photo-specific highlights.";

  return [
    {
      name: "Version 1 · Premium Listing",
      caption: `${lead}\n\n${priceLine} ${factsLine ? `Features: ${factsLine}. ` : ""}${descriptionLine}\n\nDM for a private tour.`,
      hashtags,
      note: photoLine,
    },
    {
      name: "Version 2 · Warm Lifestyle",
      caption: `Welcome to ${lead}.\n\n${descriptionLine}\n\n${
        factsLine ? `${factsLine}. ` : ""
      }${priceLine}\nSchedule your viewing today.`,
      hashtags,
      note: photoLine,
    },
    {
      name: "Version 3 · Short + Direct",
      caption: `Just listed: ${lead}.\n${factsLine ? `${factsLine}. ` : ""}${priceLine}\nMessage us for details.`,
      hashtags,
      note: photoLine,
    },
  ];
}
