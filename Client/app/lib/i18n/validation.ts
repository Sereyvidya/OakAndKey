import type { ListingErrors } from "../listing/validation";
import { TITLE_MAX_CHARS } from "../listing/constants";
import type { Lang } from "./strings";

/** Khmer text for each validation message, keyed by the English message. */
const KM_MESSAGES: Record<string, string> = {
  "Property title is required.": "សូមបញ្ចូលចំណងជើងអចលនទ្រព្យ។",
  "Title should be at least 6 characters.": "ចំណងជើងត្រូវមានយ៉ាងតិច 6 តួអក្សរ។",
  "Street, city, and state are required.": "សូមបញ្ចូលផ្លូវ ទីក្រុង និងរដ្ឋ។",
  "Address should be more specific.": "អាសយដ្ឋានគួរតែមានលម្អិតជាងនេះ។",
  "Price is required.": "សូមបញ្ចូលតម្លៃ។",
  "Price must be a number greater than 0.": "តម្លៃត្រូវតែជាលេខធំជាង 0។",
  "Please select a residential property type.":
    "សូមជ្រើសរើសប្រភេទអចលនទ្រព្យលំនៅដ្ឋាន។",
  "Only House and Condo are supported right now.":
    "បច្ចុប្បន្នគាំទ្រតែផ្ទះ និងខុនដូប៉ុណ្ណោះ។",
  "Bedrooms are required.": "សូមបញ្ចូលចំនួនបន្ទប់គេង។",
  "Bathrooms are required.": "សូមបញ្ចូលចំនួនបន្ទប់ទឹក។",
  "Size is required.": "សូមបញ្ចូលទំហំ។",
  "Must be 0 or more.": "ត្រូវតែ 0 ឬច្រើនជាងនេះ។",
  "Description is required.": "សូមបញ្ចូលការពិពណ៌នា។",
  "Description should be at least 20 characters.":
    "ការពិពណ៌នាត្រូវមានយ៉ាងតិច 20 តួអក្សរ។",
  "Please upload at least 4 property photos.":
    "សូមផ្ទុកឡើងរូបថតអចលនទ្រព្យយ៉ាងតិច 4 សន្លឹក។",
  "Agent name is required.": "សូមបញ្ចូលឈ្មោះភ្នាក់ងារ។",
  "Company name is required.": "សូមបញ្ចូលឈ្មោះក្រុមហ៊ុន។",
  "Social or website link is required.": "សូមបញ្ចូលតំណបណ្តាញសង្គម ឬគេហទំព័រ។",
  "Phone number is required.": "សូមបញ្ចូលលេខទូរស័ព្ទ។",
  "Phone number looks too short.": "លេខទូរស័ព្ទហាក់ដូចជាខ្លីពេក។",
  "Email is required.": "សូមបញ្ចូលអ៊ីមែល។",
  "Please enter a valid email address.":
    "សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលឱ្យត្រឹមត្រូវ។",
  "Company logo is required.": "សូមបញ្ចូលនិមិត្តសញ្ញាក្រុមហ៊ុន។",
  "Agent photo is required.": "សូមបញ្ចូលរូបថតភ្នាក់ងារ។",
  [`Title must be ${TITLE_MAX_CHARS} characters or less for flyers.`]: `ចំណងជើងត្រូវមិនលើស ${TITLE_MAX_CHARS} តួអក្សរសម្រាប់ខិត្តប័ណ្ណ។`,
};

/** Translates the (English) validation messages into the active language. */
export function translateErrors(
  errors: ListingErrors,
  lang: Lang
): ListingErrors {
  if (lang === "en") return errors;
  return Object.fromEntries(
    Object.entries(errors).map(([key, msg]) => [key, KM_MESSAGES[msg] ?? msg])
  ) as ListingErrors;
}

export { KM_MESSAGES };
