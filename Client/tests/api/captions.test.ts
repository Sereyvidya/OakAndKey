import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/captions/generate/route";
import { validForm } from "../fixtures";
import { geminiBody, jsonResponse, mockFetch, postRequest } from "./helpers";

const goodModelOutput = JSON.stringify({
  variants: [
    {
      name: "V1",
      caption: "Welcome home",
      hashtags: ["JustListed"],
      note: "n",
    },
  ],
});

beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "test-key");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/captions/generate", () => {
  it("returns validated variants on success", async () => {
    const fetchMock = mockFetch(() =>
      jsonResponse(geminiBody(goodModelOutput))
    );

    const res = await POST(postRequest({ formData: validForm, images: [] }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      variants: [
        {
          name: "V1",
          caption: "Welcome home",
          hashtags: ["#JustListed"],
          note: "n",
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("generativelanguage.googleapis.com");
    expect(JSON.parse(String(init!.body)).contents[0].parts[0].text).toContain(
      "Modern 4-Bedroom Family Home"
    );
  });

  it("accepts model output wrapped in code fences", async () => {
    mockFetch(() =>
      jsonResponse(geminiBody("```json\n" + goodModelOutput + "\n```"))
    );
    const res = await POST(postRequest({ formData: validForm }));
    expect(res.status).toBe(200);
  });

  it("sends at most 3 data-URL images as inline_data", async () => {
    const fetchMock = mockFetch(() =>
      jsonResponse(geminiBody(goodModelOutput))
    );
    const images = Array.from({ length: 5 }, (_, i) => ({
      name: `${i}.png`,
      preview: "data:image/png;base64,AAAA",
    }));
    images.push({ name: "bad", preview: "/not-a-data-url.jpg" });

    await POST(postRequest({ formData: validForm, images }));

    const parts = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body))
      .contents[0].parts;
    expect(parts.filter((p: object) => "inline_data" in p)).toHaveLength(3);
  });

  it("reports a Gemini error status", async () => {
    mockFetch(() => jsonResponse({ error: "quota" }, 429));
    const res = await POST(postRequest({ formData: validForm }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toContain("Gemini request failed (429)");
  });

  it("reports malformed model output", async () => {
    mockFetch(() => jsonResponse(geminiBody("this is not json")));
    const res = await POST(postRequest({ formData: validForm }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/invalid JSON/);
  });

  it("reports valid JSON with no usable captions", async () => {
    mockFetch(() =>
      jsonResponse(geminiBody(JSON.stringify({ variants: [{ caption: "" }] })))
    );
    const res = await POST(postRequest({ formData: validForm }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/invalid JSON/);
  });

  it("fails clearly without an API key, and never calls Gemini", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const fetchMock = mockFetch(() =>
      jsonResponse(geminiBody(goodModelOutput))
    );
    const res = await POST(postRequest({ formData: validForm }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/Missing GEMINI_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("turns a network failure into an error response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));
    const res = await POST(postRequest({ formData: validForm }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("boom");
  });
});
