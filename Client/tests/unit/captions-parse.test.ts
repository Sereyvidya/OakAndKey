import { describe, expect, it } from "vitest";
import {
  formatPrice,
  parseDataUrl,
  parseJsonFromText,
  validateOutput,
} from "@/app/lib/captions/parse";

describe("parseJsonFromText", () => {
  it("parses plain JSON", () => {
    expect(parseJsonFromText('{"a":1}')).toEqual({ a: 1 });
  });
  it("parses JSON wrapped in code fences", () => {
    expect(parseJsonFromText('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseJsonFromText('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });
  it("returns null for malformed or empty text", () => {
    expect(parseJsonFromText("{not json")).toBeNull();
    expect(parseJsonFromText("")).toBeNull();
    expect(parseJsonFromText("Sorry, I can't do that.")).toBeNull();
  });
});

describe("validateOutput", () => {
  const good = {
    variants: [
      { name: "V1", caption: "Hello", hashtags: ["#a", "b"], note: "n" },
    ],
  };

  it("accepts good output", () => {
    expect(validateOutput(good)).toEqual([
      { name: "V1", caption: "Hello", hashtags: ["#a", "#b"], note: "n" },
    ]);
  });

  it("returns null when variants is missing or not an array", () => {
    expect(validateOutput(null)).toBeNull();
    expect(validateOutput({})).toBeNull();
    expect(validateOutput({ variants: "x" })).toBeNull();
  });

  it("rejects the reply if any variant has no caption", () => {
    expect(
      validateOutput({ variants: [{ name: "x", caption: "  " }] })
    ).toBeNull();
    expect(
      validateOutput({ variants: [{ caption: "" }, { caption: "Keep me" }] })
    ).toBeNull();
    expect(validateOutput({ variants: [] })).toBeNull();
  });

  it("rejects wrong types", () => {
    expect(validateOutput({ variants: [{ caption: 42 }] })).toBeNull();
    expect(validateOutput({ variants: [null] })).toBeNull();
  });

  it("preserves non-Latin (e.g. Khmer) text", () => {
    const out = validateOutput({
      variants: [{ caption: "ផ្ទះថ្មីសម្រាប់លក់", hashtags: ["ភ្នំពេញ"] }],
    })!;
    expect(out[0]!.caption).toBe("ផ្ទះថ្មីសម្រាប់លក់");
    expect(out[0]!.hashtags).toEqual(["#ភ្នំពេញ"]);
  });

  it("fills in defaults for missing fields", () => {
    expect(validateOutput({ variants: [{ caption: "Hi" }] })).toEqual([
      { name: "Version 1", caption: "Hi", hashtags: [], note: "" },
    ]);
  });

  it("keeps at most 3 variants", () => {
    const many = {
      variants: Array.from({ length: 5 }, (_, i) => ({ caption: `c${i}` })),
    };
    expect(validateOutput(many)).toHaveLength(3);
  });

  it("cleans hashtags: spaces, prefix, blanks, cap of 14", () => {
    const out = validateOutput({
      variants: [
        {
          caption: "x",
          hashtags: ["Just Listed", "#Home", "  ", 5, ...Array(20).fill("t")],
        },
      ],
    })!;
    expect(out[0]!.hashtags.slice(0, 3)).toEqual([
      "#JustListed",
      "#Home",
      "#5",
    ]);
    expect(out[0]!.hashtags).toHaveLength(14);
  });

  it("treats non-array hashtags as empty", () => {
    expect(
      validateOutput({ variants: [{ caption: "x", hashtags: "#a #b" }] })![0]!
        .hashtags
    ).toEqual([]);
  });
});

describe("parseDataUrl", () => {
  it("splits mime type and data", () => {
    expect(parseDataUrl("data:image/png;base64,AAAA")).toEqual({
      mimeType: "image/png",
      data: "AAAA",
    });
  });
  it("returns null for non-data URLs and non-strings", () => {
    expect(parseDataUrl("/dining.jpg")).toBeNull();
    expect(parseDataUrl("data:image/png,AAAA")).toBeNull();
    expect(parseDataUrl(undefined)).toBeNull();
    expect(parseDataUrl(42)).toBeNull();
  });
});

describe("formatPrice", () => {
  it("formats dollars", () => {
    expect(formatPrice("485000")).toBe("$485,000");
    expect(formatPrice("")).toBe("");
  });
});
