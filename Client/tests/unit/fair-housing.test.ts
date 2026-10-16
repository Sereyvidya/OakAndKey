import { describe, expect, it } from "vitest";
import {
  fairHousingFeedback,
  findFairHousingIssues,
  FAIR_HOUSING_PROMPT_RULES,
} from "@/app/lib/fairHousing";

const terms = (text: string) =>
  findFairHousingIssues(text).map((i) => i.term.toLowerCase());

describe("findFairHousingIssues: flags problem wording", () => {
  it.each([
    ["Perfect for families who love to entertain.", "familial status"],
    ["Ideal for young professionals.", "familial status"],
    ["A great place for a growing family!", "familial status"],
    ["Perfect for a young couple.", "familial status"],
    ["Adults only community.", "familial status"],
    ["No children please.", "familial status"],
    ["Bachelor pad close to downtown.", "familial status"],
    ["Walking distance to church and shops.", "religion"],
    ["Near the synagogue.", "religion"],
    ["Located in a Christian community.", "religion"],
    ["A diverse neighborhood.", "race / national origin"],
    ["English speaking only.", "race / national origin"],
    ["No wheelchairs.", "disability"],
    ["For able-bodied buyers.", "disability"],
    ["Located in an exclusive neighborhood.", "neighborhood steering"],
    ["Quiet, safe neighborhood.", "neighborhood steering"],
    ["Crime-free area with great views.", "neighborhood steering"],
  ])("flags %j as %s", (text, category) => {
    const issues = findFairHousingIssues(text);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]!.category).toBe(category);
    expect(issues[0]!.advice.length).toBeGreaterThan(10);
  });

  it("returns the matched text as written", () => {
    expect(terms("PERFECT FOR FAMILIES")).toEqual(["perfect for families"]);
  });

  it("reports each distinct phrase once", () => {
    const issues = findFairHousingIssues(
      "Perfect for families. Yes, perfect for families! Adults only."
    );
    expect(issues).toHaveLength(2);
  });
});

describe("findFairHousingIssues: leaves normal property copy alone", () => {
  it.each([
    "Spacious family room with a gas fireplace.",
    "Bright kitchen with white cabinets and black granite counters.",
    "Wheelchair accessible entry and wide doorways.",
    "Beautifully updated 4-bedroom, 3-bath home with an open-concept living area.",
    "The primary suite includes a walk-in closet and spa-style bath.",
    "Minutes from Maple Park, Lincoln Elementary and the Blue Line station.",
    "Great for entertaining, with a covered patio and fenced backyard.",
    "Perfect for hosting dinners and weekend barbecues.",
    "Quiet cul-de-sac street with mature trees.",
    "Oak & Key — Just Listed in Austin, TX.",
    "",
  ])("does not flag %j", (text) => {
    expect(findFairHousingIssues(text)).toEqual([]);
  });

  it("does not flag the app's own sample listing", async () => {
    const { SAMPLE_AUTOFILL_FORM } =
      await import("@/app/property/components/form/propertyFormSampleData");
    expect(findFairHousingIssues(SAMPLE_AUTOFILL_FORM.description!)).toEqual(
      []
    );
  });
});

describe("prompt helpers", () => {
  it("states the core rule and example phrases", () => {
    expect(FAIR_HOUSING_PROMPT_RULES).toContain("never the people");
    expect(FAIR_HOUSING_PROMPT_RULES).toContain("perfect for families");
  });
  it("quotes the flagged phrases in retry feedback", () => {
    expect(
      fairHousingFeedback(["perfect for families", "safe neighborhood"])
    ).toBe(
      'Your previous reply used wording that can violate fair housing rules: "perfect for families", "safe neighborhood". Rewrite without these or similar phrases, describing only the property.'
    );
  });
});
