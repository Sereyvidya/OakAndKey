import { describe, expect, it } from "vitest";
import { generateCaptionVariants } from "@/app/lib/captions/generate";
import { validForm } from "../fixtures";

const img = (name: string) => ({ name, preview: "x" });

describe("generateCaptionVariants", () => {
  it("returns three named variants", () => {
    const variants = generateCaptionVariants(validForm, []);
    expect(variants).toHaveLength(3);
    expect(variants.map((v) => v.name)).toEqual([
      "Version 1 · Premium Listing",
      "Version 2 · Warm Lifestyle",
      "Version 3 · Short + Direct",
    ]);
  });

  it("mentions title, area, price and facts", () => {
    const [v1] = generateCaptionVariants(validForm, []);
    expect(v1!.caption).toContain("Modern 4-Bedroom Family Home in Austin");
    expect(v1!.caption).toContain("Listed at $485,000.");
    expect(v1!.caption).toContain("4 bed • 3 bath • 2637 sqft");
  });

  it("falls back when price and description are missing", () => {
    const [v1] = generateCaptionVariants({ propertyTitle: "Cozy Flat" }, []);
    expect(v1!.caption).toContain("Price available on request.");
    expect(v1!.caption).toContain("Thoughtfully designed layout");
  });

  it("detects photo tags from file names", () => {
    const [v1] = generateCaptionVariants(validForm, [
      img("Kitchen-1.jpg"),
      img("master_bedroom.jpg"),
      img("backyard-pool.jpg"),
    ]);
    expect(v1!.note).toBe("Photo highlights: kitchen, bedroom, pool, garden.");
  });

  it("describes untagged photos by count, and no photos by prompt", () => {
    expect(
      generateCaptionVariants(validForm, [img("IMG_1.jpg")])[0]!.note
    ).toBe("Photo highlights: 1 listing photos.");
    expect(generateCaptionVariants(validForm, [])[0]!.note).toMatch(
      /Upload photos/
    );
  });

  describe("hashtags", () => {
    it("includes base, type, area and company tags", () => {
      const { hashtags } = generateCaptionVariants(validForm, [])[0]!;
      expect(hashtags).toEqual(
        expect.arrayContaining([
          "#JustListed",
          "#RealEstate",
          "#HouseForSale",
          "#Austin",
          "#OakKey",
        ])
      );
    });
    it("adds photo-derived tags and uses #-prefixed unique tags", () => {
      const { hashtags } = generateCaptionVariants(validForm, [
        img("kitchen.jpg"),
        img("balcony.jpg"),
      ])[0]!;
      expect(hashtags).toEqual(
        expect.arrayContaining(["#ModernKitchen", "#CityViews"])
      );
      expect(hashtags.every((h) => h.startsWith("#"))).toBe(true);
      expect(new Set(hashtags).size).toBe(hashtags.length);
    });
    it("uses condo tag for condos", () => {
      const { hashtags } = generateCaptionVariants(
        { ...validForm, propertyType: "condo" },
        []
      )[0]!;
      expect(hashtags).toContain("#CondoForSale");
    });
  });
});
