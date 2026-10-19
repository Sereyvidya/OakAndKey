import { afterEach, describe, expect, it, vi } from "vitest";
import {
  dataUrlToBlob,
  ensureDataUrl,
  fitWithin,
} from "@/app/lib/images/resize";
import { PIXEL } from "../fakeSupabase";

describe("fitWithin", () => {
  it("scales the longest edge down to the limit, keeping aspect ratio", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });
  it("never scales up", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(1600, 1000, 1600)).toEqual({ width: 1600, height: 1000 });
  });
  it("never produces a zero dimension", () => {
    expect(fitWithin(10000, 1, 100)).toEqual({ width: 100, height: 1 });
  });
  it("handles empty images", () => {
    expect(fitWithin(0, 0, 100)).toEqual({ width: 0, height: 0 });
  });
});

describe("dataUrlToBlob", () => {
  it("decodes base64 data URLs with the right type and bytes", async () => {
    const blob = dataUrlToBlob(PIXEL);
    expect(blob.type).toBe("image/png");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect([...bytes.slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]); // PNG magic
  });
  it("decodes plain-text data URLs", async () => {
    const blob = dataUrlToBlob("data:text/plain,hello%20world");
    expect(await blob.text()).toBe("hello world");
  });
  it("rejects things that are not data URLs", () => {
    expect(() => dataUrlToBlob("https://example.com/a.png")).toThrow();
  });
});

describe("ensureDataUrl", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("passes data URLs through without fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await ensureDataUrl(PIXEL)).toBe(PIXEL);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches remote images and returns a round-trippable data URL", async () => {
    const original = dataUrlToBlob(PIXEL);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(original, { status: 200 }))
    );
    const url = await ensureDataUrl("https://cdn.example.com/p.png");
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
    expect(url).toBe(PIXEL);
  });

  it("throws on a failed fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 404 }))
    );
    await expect(ensureDataUrl("https://x/y.png")).rejects.toThrow(/404/);
  });
});
