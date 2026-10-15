import "./setup";
import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/descriptions/rewrite/route";
import { validForm } from "../fixtures";
import {
  geminiBody,
  jsonResponse,
  mockFetchSequence,
  postRequest,
  promptOfCall,
} from "./helpers";

const body = { formData: validForm, description: "Old text" };

describe("POST /api/descriptions/rewrite", () => {
  it("returns the rewritten description", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse(geminiBody("  A bright, welcoming home.  "))
    );
    const res = await POST(postRequest(body));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      description: "A bright, welcoming home.",
    });
    expect(promptOfCall(fetchMock, 0)).toContain(
      "Current description: Old text"
    );
  });

  it("truncates to 400 characters", async () => {
    mockFetchSequence(jsonResponse(geminiBody("x".repeat(900))));
    const res = await POST(postRequest(body));
    expect((await res.json()).description).toHaveLength(400);
  });

  it("retries once with a stricter prompt when the reply is empty", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ candidates: [] }),
      jsonResponse(geminiBody("Second try works."))
    );
    const res = await POST(postRequest(body));
    expect(res.status).toBe(200);
    expect((await res.json()).description).toBe("Second try works.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(promptOfCall(fetchMock, 1)).toContain("empty or unusable");
  });

  it("returns INVALID_OUTPUT if the retry is also empty", async () => {
    const fetchMock = mockFetchSequence(jsonResponse({ candidates: [] }));
    const res = await POST(postRequest(body));
    expect(res.status).toBe(502);
    expect((await res.json()).code).toBe("INVALID_OUTPUT");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fails clearly without an API key, and never calls Gemini", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const fetchMock = mockFetchSequence(jsonResponse(geminiBody("x")));
    const res = await POST(postRequest(body));
    expect((await res.json()).code).toBe("MISSING_API_KEY");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
