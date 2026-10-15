import { describe, expect, it } from "vitest";
import { STRINGS, translate } from "@/app/lib/i18n/strings";
import { KM_MESSAGES, translateErrors } from "@/app/lib/i18n/validation";
import { getListingValidationErrors } from "@/app/lib/listing/validation";
import { TITLE_MAX_CHARS } from "@/app/lib/listing/constants";
import { truncateGraphemes } from "@/app/lib/text";
import { factsLine } from "@/app/lib/flyer/labels";
import {
  defaultSize,
  defaultText,
  TEXT_FIELDS_BY_TEMPLATE,
} from "@/app/lib/flyer/templateCopy";
import {
  USER_MESSAGES,
  USER_MESSAGES_KM,
  userMessage,
} from "@/app/lib/gemini/errors";
import { validForm, validImages } from "../fixtures";

const KHMER = /[ក-៿]/;
const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

describe("UI strings", () => {
  const keys = Object.keys(STRINGS.en) as (keyof typeof STRINGS.en)[];

  it("has a non-empty Khmer string for every English key", () => {
    for (const key of keys) {
      expect(STRINGS.km[key], key).toBeTruthy();
    }
    expect(Object.keys(STRINGS.km).sort()).toEqual([...keys].sort());
  });

  it("uses the same {placeholders} in both languages", () => {
    for (const key of keys) {
      expect(placeholders(STRINGS.km[key]), key).toEqual(
        placeholders(STRINGS.en[key])
      );
    }
  });

  it("contains Khmer script in Khmer strings (except pure-symbol ones)", () => {
    for (const key of keys) {
      if (/^\{\w+\}\/\d+/.test(STRINGS.km[key])) continue;
      expect(STRINGS.km[key], key).toMatch(KHMER);
    }
  });

  it("interpolates variables", () => {
    expect(translate("en", "captions.versions", { n: 3 })).toBe("3 versions");
    expect(translate("km", "captions.versions", { n: 3 })).toContain("3");
  });
});

describe("validation messages in Khmer", () => {
  it("translates every message the validator can produce", () => {
    const messages = new Set<string>();
    const cases: Record<string, unknown>[] = [
      {},
      {
        propertyTitle: "Hi",
        price: "0",
        propertyType: "land",
        bedrooms: "-1",
        bathrooms: "-1",
        size: "-1",
        description: "short",
        agentPhone: "12",
        agentEmail: "x",
        addressStreet: "a",
        addressCity: "b",
        addressState: "c",
      },
      { propertyTitle: "x".repeat(TITLE_MAX_CHARS + 1) },
      { price: "abc" },
    ];
    for (const patch of cases) {
      const errors = getListingValidationErrors({
        formData: { ...patch } as never,
        images: [],
      });
      Object.values(errors).forEach((m) => messages.add(m));
    }
    expect(messages.size).toBeGreaterThan(15);
    for (const message of messages) {
      expect(KM_MESSAGES[message], message).toMatch(KHMER);
    }
  });

  it("leaves English untouched and maps Khmer", () => {
    const errors = getListingValidationErrors({ formData: {}, images: [] });
    expect(translateErrors(errors, "en")).toBe(errors);
    expect(translateErrors(errors, "km").propertyTitle).toMatch(KHMER);
  });
});

describe("truncateGraphemes", () => {
  it("returns short text unchanged", () => {
    expect(truncateGraphemes("abc", 10)).toBe("abc");
  });
  it("truncates Latin text by length", () => {
    expect(truncateGraphemes("abcdef", 3)).toBe("abc");
  });
  it("never leaves a dangling coeng or a stranded Khmer sign", () => {
    // "ក្រុម" = ក + ្ + រ + ុ + ម. Cutting after "ក្" or "ក្រ" would split it.
    const text = "ក្រុម";
    for (let max = 0; max < text.length; max++) {
      const cut = truncateGraphemes(text, max);
      expect(cut.length).toBeLessThanOrEqual(max);
      expect(cut.endsWith("\u17D2")).toBe(false);
      expect(text.startsWith(cut)).toBe(true);
      // the next char must not be a vowel/sign/coeng continuing the cut cluster
      const next = text[cut.length];
      expect(next === undefined || !/[\u17B6-\u17D3]/.test(next)).toBe(true);
    }
  });
});

describe("flyer Khmer copy", () => {
  it("formats the facts line in Khmer with m²/ft²", () => {
    const line = factsLine("km", {
      beds: 4,
      baths: 3,
      size: 120,
      sizeUnit: "sqm",
    });
    expect(line).toBe("4 បន្ទប់គេង | 3 បន្ទប់ទឹក | 120 m²");
    expect(
      factsLine("km", { beds: 1, baths: 1, size: 9, sizeUnit: "sqft" })
    ).toContain("ft²");
  });
  it("keeps the English facts lines unchanged", () => {
    const f = { beds: 4, baths: 3, size: 2637, sizeUnit: "sqft" as const };
    expect(factsLine("en", { ...f, upper: true })).toBe(
      "4 BED | 3 BATH | 2637 sqft"
    );
    expect(factsLine("en", f)).toBe("4 Bed | 3 Bath | 2637 sqft");
  });
  it("defines Khmer defaults for every template field", () => {
    for (const [template, fields] of Object.entries(TEXT_FIELDS_BY_TEMPLATE)) {
      for (const f of fields) {
        expect(
          defaultText(template as "modern", f.key, "km"),
          `${template}.${f.key}`
        ).toMatch(KHMER);
        expect(f.labelKm).toMatch(KHMER);
      }
    }
  });
  it("shrinks only headline-sized Khmer text", () => {
    expect(defaultSize("modern", "headlineLarge", "en")).toBe(78);
    expect(defaultSize("modern", "headlineLarge", "km")).toBeLessThan(78);
    expect(defaultSize("modern", "agentRole", "km")).toBe(14);
  });
});

describe("API error messages", () => {
  it("has Khmer text for every error code", () => {
    for (const code of Object.keys(
      USER_MESSAGES
    ) as (keyof typeof USER_MESSAGES)[]) {
      expect(USER_MESSAGES_KM[code]).toMatch(KHMER);
      expect(userMessage(code, "km")).toBe(USER_MESSAGES_KM[code]);
      expect(userMessage(code)).toBe(USER_MESSAGES[code]);
    }
  });
});

describe("sample data is valid", () => {
  it("still passes validation", () => {
    expect(
      getListingValidationErrors({ formData: validForm, images: validImages })
    ).toEqual({});
  });
});
