function cleanText(v) {
  return (v ?? "").toString().trim();
}

function toNumber(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function formatPrice(v) {
  const n = toNumber(v);
  if (n === null) return "";
  return `$${n.toLocaleString("en-US")}`;
}

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing GEMINI_API_KEY in environment." },
        { status: 500 }
      );
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const body = await request.json();
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
- 60 to 120 words.
- Maximum 400 characters total.
- Plain text only, no emojis, no hashtags.

Listing facts:
${facts}

Return only the rewritten description text.`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
          },
        }),
      }
    );

    if (!resp.ok) {
      const t = await resp.text();
      return Response.json(
        { error: `Gemini request failed (${resp.status}): ${t}` },
        { status: 500 }
      );
    }

    const data = await resp.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p?.text || "")
        .join("\n")
        .trim() || "";

    if (!text) {
      return Response.json(
        { error: "Gemini returned an empty description." },
        { status: 500 }
      );
    }

    return Response.json({ description: text.slice(0, 400) });
  } catch (err) {
    return Response.json(
      { error: err?.message || "Unexpected error while rewriting description." },
      { status: 500 }
    );
  }
}
