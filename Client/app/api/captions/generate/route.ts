import type { CaptionRequest, GeminiResponse } from "@/app/lib/types";
import { cleanText, toNumber } from "@/app/lib/listing/format";
import {
  formatPrice,
  parseDataUrl,
  parseJsonFromText,
  validateOutput,
} from "@/app/lib/captions/parse";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing GEMINI_API_KEY in environment." },
        { status: 500 }
      );
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const body: Partial<CaptionRequest> = await request.json();
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

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, ...imageParts],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
      },
    };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const t = await resp.text();
      return Response.json(
        { error: `Gemini request failed (${resp.status}): ${t}` },
        { status: 500 }
      );
    }

    const data: GeminiResponse = await resp.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p?.text || "")
        .join("\n")
        .trim() || "";

    const parsed = parseJsonFromText(text);
    const variants = validateOutput(parsed);

    if (!variants) {
      return Response.json(
        { error: "Gemini returned an invalid JSON payload for captions." },
        { status: 500 }
      );
    }

    return Response.json({ variants });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    return Response.json(
      {
        error: message || "Unexpected server error while generating captions.",
      },
      { status: 500 }
    );
  }
}
