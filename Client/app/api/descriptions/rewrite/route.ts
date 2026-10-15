import { z } from "zod";
import type { DescriptionRequest } from "@/app/lib/types";
import {
  cleanText,
  formatCurrency as formatPrice,
  toNumber,
} from "@/app/lib/listing/format";
import { generateValidated } from "@/app/lib/gemini/client";
import type { Lang } from "@/app/lib/i18n/strings";
import { truncateGraphemes } from "@/app/lib/text";
import { readJson, respond } from "@/app/lib/gemini/respond";

export const maxDuration = 60;

const descriptionSchema = z.string().trim().min(1);

const STRICT_SUFFIX = `

Your previous reply was empty or unusable. Return ONLY the rewritten description as plain text (non-empty, at most 400 characters), with no preamble or quotes.`;

export async function POST(request: Request) {
  let lang: Lang = "en";
  return respond(
    "descriptions/rewrite",
    async () => {
      const body: Partial<DescriptionRequest> = await readJson(request);
      lang = body.language === "km" ? "km" : "en";
      const formData = body?.formData || {};

      const title = cleanText(formData.propertyTitle);
      const address = cleanText(formData.address);
      const type = cleanText(formData.propertyType);
      const price = formatPrice(formData.price);
      const beds = toNumber(formData.bedrooms);
      const baths = toNumber(formData.bathrooms);
      const size = toNumber(formData.size);
      const sourceDescription = cleanText(body?.description);

      const facts = [
        title ? `Title: ${title}` : "",
        address ? `Address: ${address}` : "",
        type ? `Type: ${type}` : "",
        price ? `Price: ${price}` : "",
        beds !== null ? `Bedrooms: ${beds}` : "",
        baths !== null ? `Bathrooms: ${baths}` : "",
        size !== null ? `Size: ${size} sqm` : "",
        sourceDescription ? `Current description: ${sourceDescription}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const prompt = `Rewrite the property description for a residential listing.
Constraints:
- Keep it clear and professional.
- Keep factual and do not invent details.
${
  lang === "km"
    ? "- Write in natural Khmer (ភាសាខ្មែរ), 3 to 5 short sentences. Keep prices ($), numbers and units in Latin characters."
    : "- 60 to 120 words."
}
- Maximum 400 characters total.
- Plain text only, no emojis, no hashtags.

Listing facts:
${facts}

Return only the rewritten description text.`;

      const description = await generateValidated({
        route: "descriptions/rewrite",
        buildPayload: (strict) => ({
          contents: [
            {
              role: "user",
              parts: [{ text: strict ? prompt + STRICT_SUFFIX : prompt }],
            },
          ],
          generationConfig: { temperature: strict ? 0.2 : 0.6 },
        }),
        parse: (text) => {
          const r = descriptionSchema.safeParse(text);
          return r.success ? r.data : null;
        },
      });

      return { description: truncateGraphemes(description, 400) };
    },
    () => lang
  );
}
