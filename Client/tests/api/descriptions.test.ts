import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/descriptions/rewrite/route";
import { validForm } from "../fixtures";
import { geminiBody, jsonResponse, mockFetch, postRequest } from "./helpers";

beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "test-key");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const body = { formData: validForm, description: "Old text" };

describe("POST /api/descriptions/rewrite", () => {
  it("returns the rewritten description", async () => {
    const fetchMock = mockFetch(() =>
      jsonResponse(geminiBody("  A bright, welcoming home.  "))
    );
    const res = await POST(postRequest(body));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      description: "A bright, welcoming home.",
    });
    const prompt = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body))
      .contents[0].parts[0].text;
    expect(prompt).toContain("Current description: Old text");
  });

  it("truncates to 400 characters", async () => {
    mockFetch(() => jsonResponse(geminiBody("x".repeat(900))));
    const res = await POST(postRequest(body));
    expect((await res.json()).description).toHaveLength(400);
  });

  it("reports a Gemini error status", async () => {
    mockFetch(() => jsonResponse({ error: "down" }, 503));
    const res = await POST(postRequest(body));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toContain("Gemini request failed (503)");
  });

  it("reports an empty model response", async () => {
    mockFetch(() => jsonResponse({ candidates: [] }));
    const res = await POST(postRequest(body));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/empty description/);
  });

  it("fails clearly without an API key, and never calls Gemini", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const fetchMock = mockFetch(() => jsonResponse(geminiBody("x")));
    const res = await POST(postRequest(body));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/Missing GEMINI_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
