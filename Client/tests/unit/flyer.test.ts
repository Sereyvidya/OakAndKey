import { describe, expect, it } from "vitest";
import { makeSafeFilename } from "@/app/lib/flyer/filename";
import { buildFlyerViewModel } from "@/app/lib/flyer/viewModel";
import {
  buildFlyerTheme,
  FLYER_COLORS,
  FLYER_THEME_PRESETS,
} from "@/app/lib/flyer/theme";
import { TEXT_FIELDS_BY_TEMPLATE } from "@/app/lib/flyer/templateCopy";
import { TEMPLATES } from "@/app/lib/flyer/templates";
import { validForm, validImages } from "../fixtures";

describe("makeSafeFilename", () => {
  it("slugifies the title", () => {
    expect(makeSafeFilename("Modern 4-Bedroom Family Home!")).toBe(
      "modern-4-bedroom-family-home"
    );
  });
  it("falls back when empty or fully stripped", () => {
    expect(makeSafeFilename("")).toBe("flyer");
    expect(makeSafeFilename(null)).toBe("flyer");
    expect(makeSafeFilename("!!!", "listing")).toBe("listing");
  });
});

describe("buildFlyerViewModel", () => {
  const vm = buildFlyerViewModel(validForm, validImages);

  it("formats price and numeric facts", () => {
    expect(vm.priceText).toBe("$485,000");
    expect(vm.beds).toBe(4);
    expect(vm.baths).toBe(3);
    expect(vm.size).toBe(2637);
    expect(vm.sizeUnit).toBe("sqft");
  });

  it("builds city/state and gallery", () => {
    expect(vm.address).toBe("Austin, TX");
    expect(vm.hero).toBe("/dining.jpg");
    expect(vm.galleryPhotos).toEqual([
      "/entry.jpg",
      "/lawn.jpg",
      "/living-room.jpg",
    ]);
  });

  it("flags the default logo and hides its src", () => {
    expect(vm.isDefaultLogo).toBe(true);
    expect(vm.companyLogo).toBe("");
  });

  it("generates a QR URL from the social link when no QR uploaded", () => {
    expect(vm.qrSrc).toContain("api.qrserver.com");
    expect(vm.qrSrc).toContain(encodeURIComponent("oakandkey.com"));
  });

  it("prefers an uploaded QR code", () => {
    const withQr = buildFlyerViewModel(
      { ...validForm, agentQrCode: { name: "qr.png", preview: "data:qr" } },
      validImages
    );
    expect(withQr.qrSrc).toBe("data:qr");
  });

  it("uses fallbacks for an empty listing", () => {
    const empty = buildFlyerViewModel({}, []);
    expect(empty.priceText).toBe("Contact for price");
    expect(empty.agentName).toBe("Listing Agent");
    expect(empty.hero).toBe("");
    expect(empty.qrSrc).toBe("");
    expect(empty.description.length).toBeGreaterThan(0);
  });

  it("uses the supplied default description", () => {
    expect(
      buildFlyerViewModel({}, [], { defaultDescription: "Custom" }).description
    ).toBe("Custom");
  });
});

describe("flyer theme", () => {
  it("returns the classic preset merged onto base colors by default", () => {
    const theme = buildFlyerTheme();
    expect(theme.primary).toBe(FLYER_THEME_PRESETS.classic!.colors.primary);
    expect(theme.textMain).toBe(FLYER_COLORS.textMain);
  });
  it("falls back to classic for unknown presets", () => {
    expect(buildFlyerTheme("nope")).toEqual(buildFlyerTheme("classic"));
  });
  it("lets custom colors override the preset", () => {
    expect(buildFlyerTheme("emeraldGold", { primary: "#000001" }).primary).toBe(
      "#000001"
    );
  });
});

describe("template copy", () => {
  it("defines editable fields for every template", () => {
    for (const { key } of TEMPLATES) {
      expect(TEXT_FIELDS_BY_TEMPLATE[key].length).toBeGreaterThan(0);
    }
  });
  it("has unique keys and positive sizes per template", () => {
    for (const fields of Object.values(TEXT_FIELDS_BY_TEMPLATE)) {
      const keys = fields.map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
      for (const f of fields) {
        expect(f.defaultSize).toBeGreaterThan(0);
        expect(f.defaultValue).not.toBe("");
      }
    }
  });
});
