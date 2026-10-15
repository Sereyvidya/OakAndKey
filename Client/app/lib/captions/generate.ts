import type { CaptionVariant, ListingForm, ListingImage } from "../types";
import { cleanText, formatCurrency, toNumber } from "../listing/format";
import type { Lang } from "../i18n/strings";

function parseAreaFromAddress(address: string) {
  const parts = cleanText(address)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (parts.length >= 2) return parts[parts.length - 2] ?? ""; // city
  return parts[0] || "";
}

function detectPhotoTags(images: Pick<ListingImage, "name">[] = []) {
  const names = images
    .map((img) => cleanText(img?.name).toLowerCase())
    .filter(Boolean);

  const joined = names.join(" ");
  const tags = new Set<string>();

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

function makeHashtags({
  propertyType,
  area,
  photoTags,
  companyName,
  lang = "en",
}: {
  propertyType: string;
  area: string;
  photoTags: string[];
  companyName: string;
  lang?: Lang;
}) {
  const tags = new Set([
    "JustListed",
    "DreamHome",
    "HomeForSale",
    "RealEstate",
  ]);
  // Khmer posts keep English real-estate tags (widely searched) plus location.
  if (lang === "km") tags.add("CambodiaRealEstate");

  const type = cleanText(propertyType).toLowerCase();
  if (type === "house") tags.add("HouseForSale");
  if (type === "condo") tags.add("CondoForSale");

  if (area) {
    // Khmer place names are kept as-is; \p{M} keeps Khmer vowel/sign marks.
    const normalized =
      lang === "km"
        ? area.replace(/[^\p{L}\p{M}\p{N}]/gu, "")
        : area.replace(/[^a-zA-Z0-9]/g, "");
    if (normalized) tags.add(normalized);
  }

  const company = cleanText(companyName).replace(/[^a-zA-Z0-9]/g, "");
  if (company) tags.add(company);

  const map: Record<string, string> = {
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

function buildPropertyFacts(formData: Partial<ListingForm>) {
  const beds = toNumber(formData.bedrooms);
  const baths = toNumber(formData.bathrooms);
  const size = toNumber(formData.size);
  const sizeUnit = formData.sizeUnit ?? "";

  const facts = [];
  if (beds !== null) facts.push(`${beds} bed`);
  if (baths !== null) facts.push(`${baths} bath`);
  if (size !== null) facts.push(`${size} ${sizeUnit}`);

  return facts.join(" • ");
}

export function generateCaptionVariants(
  formData: Partial<ListingForm>,
  images: Pick<ListingImage, "name">[] = [],
  lang: Lang = "en"
): CaptionVariant[] {
  const title = cleanText(formData.propertyTitle) || "New listing";
  const area = parseAreaFromAddress(cleanText(formData.address));
  const type = cleanText(formData.propertyType) || "home";
  const price = formatCurrency(formData.price);
  const facts = buildPropertyFacts(formData);
  const photoTags = detectPhotoTags(images);

  const hashtags = makeHashtags({
    propertyType: type,
    area,
    photoTags,
    companyName: cleanText(formData.agentCompanyName),
    lang,
  });

  if (lang === "km") {
    return khmerVariants({
      formData,
      images,
      area,
      price,
      photoTags,
      hashtags,
    });
  }

  const lead = `${title}${area ? ` in ${area}` : ""}`;
  const factsLine = [type, facts].filter(Boolean).join(" • ");
  const priceLine = price
    ? `Listed at ${price}.`
    : "Price available on request.";

  const description = cleanText(formData.description);
  const descriptionLine = description
    ? description
    : "Thoughtfully designed layout with comfortable, everyday living in mind.";

  const photoLine =
    images.length > 0
      ? `Photo highlights: ${
          photoTags.length
            ? photoTags.join(", ")
            : `${images.length} listing photos`
        }.`
      : "Upload photos to generate photo-specific highlights.";

  return [
    {
      name: "Version 1 · Premium Listing",
      caption: `${lead}\n\n${priceLine} ${
        factsLine ? `Features: ${factsLine}. ` : ""
      }${descriptionLine}\n\nContact the listing agent for a private tour.`,
      hashtags,
      note: photoLine,
    },
    {
      name: "Version 2 · Warm Lifestyle",
      caption: `Welcome to ${lead}.\n\n${descriptionLine}\n\n${
        factsLine ? `${factsLine}. ` : ""
      }${priceLine}\nReach out for more details.`,
      hashtags,
      note: photoLine,
    },
    {
      name: "Version 3 · Short + Direct",
      caption: `Just listed: ${lead}.\n${
        factsLine ? `${factsLine}. ` : ""
      }${priceLine}\nContact for details.`,
      hashtags,
      note: photoLine,
    },
  ];
}

const KM_PHOTO_TAGS: Record<string, string> = {
  kitchen: "ផ្ទះបាយ",
  bedroom: "បន្ទប់គេង",
  bathroom: "បន្ទប់ទឹក",
  livingroom: "បន្ទប់ទទួលភ្ញៀវ",
  exterior: "ផ្នែកខាងក្រៅ",
  pool: "អាងហែលទឹក",
  garden: "សួនច្បារ",
  balcony: "យ៉រ",
};

const KM_TYPES: Record<string, string> = { house: "ផ្ទះ", condo: "ខុនដូ" };

/** Khmer versions of the three local caption templates. */
function khmerVariants({
  formData,
  images,
  area,
  price,
  photoTags,
  hashtags,
}: {
  formData: Partial<ListingForm>;
  images: Pick<ListingImage, "name">[];
  area: string;
  price: string;
  photoTags: string[];
  hashtags: string[];
}): CaptionVariant[] {
  const title = cleanText(formData.propertyTitle) || "បញ្ជីថ្មី";
  const type = cleanText(formData.propertyType);
  const beds = toNumber(formData.bedrooms);
  const baths = toNumber(formData.bathrooms);
  const size = toNumber(formData.size);
  const unit = formData.sizeUnit === "sqft" ? "ft²" : "m²";

  const facts = [
    KM_TYPES[type] ?? "",
    beds !== null ? `${beds} បន្ទប់គេង` : "",
    baths !== null ? `${baths} បន្ទប់ទឹក` : "",
    size !== null ? `${size} ${unit}` : "",
  ]
    .filter(Boolean)
    .join(" • ");

  const lead = `${title}${area ? ` នៅ ${area}` : ""}`;
  const priceLine = price ? `តម្លៃលក់ ${price}។` : "សូមទាក់ទងសួរតម្លៃ។";
  const description =
    cleanText(formData.description) ||
    "ប្លង់ដែលរចនាយ៉ាងប្រុងប្រយ័ត្ន សម្រាប់ការរស់នៅប្រចាំថ្ងៃប្រកបដោយផាសុកភាព។";

  const note =
    images.length > 0
      ? `ចំណុចពិសេសនៃរូបថត៖ ${
          photoTags.length
            ? photoTags.map((t) => KM_PHOTO_TAGS[t] ?? t).join(" ")
            : `រូបថតអចលនទ្រព្យ ${images.length} សន្លឹក`
        }។`
      : "សូមផ្ទុកឡើងរូបថត ដើម្បីបង្កើតចំណុចពិសេសតាមរូបថត។";

  return [
    {
      name: "ទម្រង់ 1 · បញ្ជីអចលនទ្រព្យពិសេស",
      caption: `${lead}\n\n${priceLine} ${
        facts ? `លក្ខណៈពិសេស៖ ${facts}។ ` : ""
      }${description}\n\nសូមទាក់ទងភ្នាក់ងារដើម្បីកក់ពេលទស្សនាផ្ទាល់។`,
      hashtags,
      note,
    },
    {
      name: "ទម្រង់ 2 · ជីវិតកក់ក្តៅ",
      caption: `សូមស្វាគមន៍មកកាន់ ${lead}។\n\n${description}\n\n${
        facts ? `${facts}។ ` : ""
      }${priceLine}\nទាក់ទងមកយើងដើម្បីដឹងព័ត៌មានបន្ថែម។`,
      hashtags,
      note,
    },
    {
      name: "ទម្រង់ 3 · ខ្លី និងត្រង់ៗ",
      caption: `ទើបតែដាក់លក់៖ ${lead}។\n${
        facts ? `${facts}។ ` : ""
      }${priceLine}\nទាក់ទងសម្រាប់ព័ត៌មានលម្អិត។`,
      hashtags,
      note,
    },
  ];
}
