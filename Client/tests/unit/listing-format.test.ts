import { describe, expect, it } from "vitest";
import {
  cleanText,
  formatCurrency,
  formatNumber,
  joinParts,
  pickSrc,
  toNumber,
} from "@/app/lib/listing/format";

describe("cleanText", () => {
  it("trims and stringifies", () => {
    expect(cleanText("  hi ")).toBe("hi");
    expect(cleanText(42)).toBe("42");
  });
  it("returns empty string for null/undefined", () => {
    expect(cleanText(null)).toBe("");
    expect(cleanText(undefined)).toBe("");
  });
});

describe("toNumber", () => {
  it("parses numeric strings", () => {
    expect(toNumber("3")).toBe(3);
    expect(toNumber(0)).toBe(0);
  });
  it("returns null for empty or non-numeric input", () => {
    expect(toNumber("")).toBeNull();
    expect(toNumber(null)).toBeNull();
    expect(toNumber(undefined)).toBeNull();
    expect(toNumber("abc")).toBeNull();
  });
});

describe("formatNumber / formatCurrency", () => {
  it("adds thousands separators", () => {
    expect(formatNumber("485000")).toBe("485,000");
    expect(formatCurrency("485000")).toBe("$485,000");
  });
  it("returns empty string when not a number", () => {
    expect(formatNumber("")).toBe("");
    expect(formatCurrency("nope")).toBe("");
  });
});

describe("pickSrc", () => {
  it("prefers preview, then src, then url", () => {
    expect(pickSrc({ preview: "a", src: "b", url: "c" })).toBe("a");
    expect(pickSrc({ src: "b", url: "c" })).toBe("b");
    expect(pickSrc({ url: "c" })).toBe("c");
  });
  it("returns strings as-is and empty for nothing", () => {
    expect(pickSrc("/x.jpg")).toBe("/x.jpg");
    expect(pickSrc(null)).toBe("");
  });
  it("ignores the default SVG logo", () => {
    expect(
      pickSrc({ type: "default-svg-logo", preview: "__default_svg_logo__" })
    ).toBe("");
  });
});

describe("joinParts", () => {
  it("joins non-empty cleaned parts with commas", () => {
    expect(joinParts([" Austin ", "", null, "TX"])).toBe("Austin, TX");
  });
});
