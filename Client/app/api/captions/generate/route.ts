import type { CaptionRequest } from "@/app/lib/types";
import { cleanText, toNumber } from "@/app/lib/listing/format";
import {
  CAPTION_SCHEMA_TEXT,
  formatPrice,
  parseCaptionReply,
  parseDataUrl,
} from "@/app/lib/captions/parse";
import { generateValidated } from "@/app/lib/gemini/client";
import {
  FAIR_HOUSING_PROMPT_RULES,
  fairHousingFeedback,
  findFairHousingIssues,
} from "@/app/lib/fairHousing";
import { readJson, respond } from "@/app/lib/gemini/respond";

export const maxDuration = 60;

const STRICT_SUFFIX = `

Your previous reply could not be used. Return ONLY a JSON object matching this schema, with no markdown fences and no commentary:
${CAPTION_SCHEMA_TEXT}`;

export async function POST(request: Request) {
  return respond("captions/generate", async () => {
    const body: Partial<CaptionRequest> = await readJson(request);
    const formData = body?.formData || {};
    const images = Array.isArray(body?.images) ? body.images : [];

    const title =
      cleanText(formData.propertyTitle) || "New residential listing";
    const address = cleanText(formData.address);
    const type = cleanText(formData.propertyType) || "house";
    const price = formatPrice(formData.price);
    const beds = toNumber(formData.bedrooms);
    const baths = toNumber(formData.bathrooms);
    const size = toNumber(formData.size);
    const sizeUnit = cleanText(formData.sizeUnit);
    const description = cleanText(formData.description);
    const agentName = cleanText(formData.agentName);
    const agentPhone = cleanText(formData.agentPhone);
    const agentEmail = cleanText(formData.agentEmail);

    const listingSummary = [
      `Title: ${title}`,
      address ? `Address: ${address}` : "",
      `Property type: ${type}`,
      price ? `Price: ${price}` : "",
      beds !== null ? `Bedrooms: ${beds}` : "",
      baths !== null ? `Bathrooms: ${baths}` : "",
      size !== null ? `Size: ${size} ${sizeUnit}` : "",
      description ? `Description: ${description}` : "",
      agentName ? `Agent name: ${agentName}` : "",
      agentPhone ? `Agent phone: ${agentPhone}` : "",
      agentEmail ? `Agent email: ${agentEmail}` : "",
      `Uploaded photos: ${images.length}`,
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `You are writing social media captions for a residential real-estate listing.
Use the listing details and image context to produce exactly 3 distinct caption versions.
The tone should be natural, specific, and suitable for Facebook/Instagram.

Rules:
- Keep each caption concise (50-120 words).
- Do not invent facts.
- If image details are unclear, say "photo highlights" generally.
- Include a clear call-to-action in each caption.
- Return JSON only using this schema:
{
  "variants": [
    {
      "name": "Version 1",
      "caption": "...",
      "hashtags": ["#tag1", "#tag2"],
      "note": "One short sentence on how photos influenced this version."
    }
  ]
}

${FAIR_HOUSING_PROMPT_RULES}

Listing details:
${listingSummary}`;

    const imageParts = images
      .slice(0, 3)
      .map((img) => parseDataUrl(img?.preview))
      .filter((img): img is NonNullable<typeof img> => img !== null)
      .map((img) => ({
        inline_data: {
          mime_type: img.mimeType,
          data: img.data,
        },
      }));

    const payload = (strict: boolean, feedback?: string[]) => ({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: strict
                ? prompt +
                  STRICT_SUFFIX +
                  (feedback ? `\n${fairHousingFeedback(feedback)}` : "")
                : prompt,
            },
            ...imageParts,
          ],
        },
      ],
      generationConfig: {
        temperature: strict ? 0.2 : 0.8,
        responseMimeType: "application/json",
      },
    });

    const variants = await generateValidated({
      route: "captions/generate",
      buildPayload: payload,
      parse: parseCaptionReply,
      check: (variants) =>
        findFairHousingIssues(variants.map((v) => v.caption).join("\n")).map(
          (i) => i.term
        ),
    });

    return { variants };
  });
}
