import { describe, expect, it } from "vitest";
import { composeAddress, splitAddressParts } from "@/app/lib/address";

describe("splitAddressParts", () => {
  it("splits street, city and uppercase state", () => {
    expect(splitAddressParts("2716 Maple Grove Dr, Austin, tx")).toEqual({
      street: "2716 Maple Grove Dr",
      city: "Austin",
      state: "TX",
    });
  });

  it("keeps extra leading parts in the street", () => {
    expect(splitAddressParts("Unit 4, 12 Oak St, Dallas, TX")).toEqual({
      street: "Unit 4, 12 Oak St",
      city: "Dallas",
      state: "TX",
    });
  });

  it("treats two parts as street and city", () => {
    expect(splitAddressParts("12 Oak St, Dallas")).toEqual({
      street: "12 Oak St",
      city: "Dallas",
      state: "",
    });
  });

  it("handles one part and empty input", () => {
    expect(splitAddressParts("12 Oak St")).toEqual({
      street: "12 Oak St",
      city: "",
      state: "",
    });
    expect(splitAddressParts("   ")).toEqual({
      street: "",
      city: "",
      state: "",
    });
  });
});

describe("composeAddress", () => {
  it("joins non-empty trimmed parts", () => {
    expect(composeAddress(" 12 Oak St ", "Dallas", "TX")).toBe(
      "12 Oak St, Dallas, TX"
    );
  });

  it("skips empty parts", () => {
    expect(composeAddress("12 Oak St", "", "TX")).toBe("12 Oak St, TX");
    expect(composeAddress()).toBe("");
  });
});
