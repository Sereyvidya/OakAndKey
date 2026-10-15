import { describe, expect, it } from "vitest";
import {
  getListingValidationErrors,
  hasCompleteListingData,
  hasMinimumListingData,
} from "@/app/lib/listing/validation";
import { TITLE_MAX_CHARS } from "@/app/lib/listing/constants";
import { validForm, validImages } from "../fixtures";

const errorsFor = (patch: Record<string, unknown>, images = validImages) =>
  getListingValidationErrors({
    formData: { ...validForm, ...patch },
    images,
  });

describe("getListingValidationErrors", () => {
  it("passes the sample listing", () => {
    expect(
      getListingValidationErrors({ formData: validForm, images: validImages })
    ).toEqual({});
  });

  it("requires everything on an empty form", () => {
    const errors = getListingValidationErrors({ formData: {}, images: [] });
    expect(Object.keys(errors).sort()).toEqual(
      [
        "address",
        "agentCompanyLogo",
        "agentCompanyName",
        "agentEmail",
        "agentName",
        "agentPhone",
        "agentPhoto",
        "agentSocialLink",
        "bathrooms",
        "bedrooms",
        "description",
        "images",
        "price",
        "propertyTitle",
        "propertyType",
        "size",
      ].sort()
    );
  });

  it("validates title length", () => {
    expect(errorsFor({ propertyTitle: "Hi" }).propertyTitle).toMatch(
      /at least 6/
    );
    expect(
      errorsFor({ propertyTitle: "x".repeat(TITLE_MAX_CHARS + 1) })
        .propertyTitle
    ).toMatch(/or less/);
  });

  it("validates price", () => {
    expect(errorsFor({ price: "" }).price).toMatch(/required/);
    expect(errorsFor({ price: "0" }).price).toMatch(/greater than 0/);
    expect(errorsFor({ price: "abc" }).price).toMatch(/greater than 0/);
    expect(errorsFor({ price: "1,200,000" }).price).toBeUndefined();
  });

  it("only allows house and condo", () => {
    expect(errorsFor({ propertyType: "land" }).propertyType).toMatch(
      /House and Condo/
    );
    expect(errorsFor({ propertyType: "condo" }).propertyType).toBeUndefined();
  });

  it("rejects negative bedroom/bath/size values", () => {
    const errors = errorsFor({ bedrooms: "-1", bathrooms: "-2", size: "-3" });
    expect(errors.bedrooms).toBeDefined();
    expect(errors.bathrooms).toBeDefined();
    expect(errors.size).toBeDefined();
  });

  it("requires at least 4 photos", () => {
    expect(errorsFor({}, validImages.slice(0, 3)).images).toMatch(/at least 4/);
  });

  it("validates phone and email", () => {
    expect(errorsFor({ agentPhone: "12345" }).agentPhone).toMatch(/too short/);
    expect(errorsFor({ agentEmail: "nope" }).agentEmail).toMatch(/valid email/);
  });

  it("accepts the default logo but requires some logo", () => {
    expect(errorsFor({}).agentCompanyLogo).toBeUndefined();
    expect(
      errorsFor({ agentCompanyLogo: null }).agentCompanyLogo
    ).toBeDefined();
  });

  it("accepts an agent photo given as a string", () => {
    expect(
      errorsFor({ agentPhoto: "/headshot.jpg" }).agentPhoto
    ).toBeUndefined();
    expect(errorsFor({ agentPhoto: null }).agentPhoto).toBeDefined();
  });

  it("requires street, city and state", () => {
    expect(errorsFor({ addressCity: "" }).address).toMatch(/required/);
  });

  it("falls back to splitting `address` when parts are missing", () => {
    const { addressStreet, addressCity, addressState, ...rest } = validForm;
    (void addressStreet, void addressCity, void addressState);
    const errors = getListingValidationErrors({
      formData: rest,
      images: validImages,
    });
    expect(errors.address).toBeUndefined();
  });
});

describe("hasCompleteListingData / hasMinimumListingData", () => {
  it("reports completeness", () => {
    expect(
      hasCompleteListingData({ formData: validForm, images: validImages })
    ).toBe(true);
    expect(hasCompleteListingData({ formData: {}, images: [] })).toBe(false);
  });

  it("needs at least a title, an address part or a photo", () => {
    expect(hasMinimumListingData({ formData: {}, images: [] })).toBe(false);
    expect(
      hasMinimumListingData({ formData: { propertyTitle: " x " }, images: [] })
    ).toBe(true);
    expect(
      hasMinimumListingData({ formData: {}, images: [validImages[0]!] })
    ).toBe(true);
  });
});
