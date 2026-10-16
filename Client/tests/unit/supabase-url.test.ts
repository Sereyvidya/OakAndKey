import { describe, expect, it } from "vitest";
import { normalizeSupabaseUrl } from "@/app/lib/supabase/client";

describe("normalizeSupabaseUrl", () => {
  it("keeps a clean project URL", () => {
    expect(normalizeSupabaseUrl("https://abc.supabase.co")).toBe(
      "https://abc.supabase.co"
    );
  });
  it("strips paths pasted from the dashboard (e.g. the data API URL)", () => {
    expect(normalizeSupabaseUrl("https://abc.supabase.co/rest/v1/")).toBe(
      "https://abc.supabase.co"
    );
    expect(normalizeSupabaseUrl("https://abc.supabase.co/")).toBe(
      "https://abc.supabase.co"
    );
  });
  it("trims whitespace", () => {
    expect(normalizeSupabaseUrl("  https://abc.supabase.co \n")).toBe(
      "https://abc.supabase.co"
    );
  });
  it("returns undefined for empty or invalid values", () => {
    expect(normalizeSupabaseUrl(undefined)).toBeUndefined();
    expect(normalizeSupabaseUrl("")).toBeUndefined();
    expect(normalizeSupabaseUrl("not a url")).toBeUndefined();
  });
});
