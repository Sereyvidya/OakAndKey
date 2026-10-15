import "./setup";
import { describe, expect, it, vi } from "vitest";
import { POST as captions } from "@/app/api/captions/generate/route";
import { POST as descriptions } from "@/app/api/descriptions/rewrite/route";
import { USER_MESSAGES } from "@/app/lib/gemini/errors";
import { validForm } from "../fixtures";
import {
  geminiBody,
  jsonResponse,
  mockFetchSequence,
  postRequest,
  promptOfCall,
} from "./helpers";

const goodCaptions = JSON.stringify({
  variants: [{ name: "V1", caption: "Welcome home", hashtags: [], note: "" }],
});

const routes = [
  {
    name: "captions",
    post: captions,
    route: "captions/generate",
    body: { formData: validForm, images: [] },
    good: () => jsonResponse(geminiBody(goodCaptions)),
    garbage: () => jsonResponse(geminiBody("Sorry, I can't help with that.")),
  },
  {
    name: "descriptions",
    post: descriptions,
    route: "descriptions/rewrite",
    body: { formData: validForm, description: "Old" },
    good: () => jsonResponse(geminiBody("A fine home.")),
    garbage: () => jsonResponse({ candidates: [{ finishReason: "SAFETY" }] }),
  },
];

describe.each(routes)("$name route: Gemini failure paths", (r) => {
  describe("rate limiting (429)", () => {
    it("retries with backoff and recovers", async () => {
      const fetchMock = mockFetchSequence(jsonResponse({}, 429), r.good());
      const res = await r.post(postRequest(r.body));
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("gives up after 3 attempts with RATE_LIMITED / 429", async () => {
      const fetchMock = mockFetchSequence(jsonResponse({}, 429));
      const res = await r.post(postRequest(r.body));
      expect(res.status).toBe(429);
      expect(await res.json()).toEqual({
        error: USER_MESSAGES.RATE_LIMITED,
        code: "RATE_LIMITED",
      });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  describe("server errors (5xx)", () => {
    it("retries and recovers", async () => {
      const fetchMock = mockFetchSequence(
        jsonResponse({}, 503),
        jsonResponse({}, 500),
        r.good()
      );
      const res = await r.post(postRequest(r.body));
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("returns UPSTREAM_ERROR / 502 and hides the provider's raw body", async () => {
      mockFetchSequence(
        jsonResponse({ secret: "internal provider detail" }, 503)
      );
      const res = await r.post(postRequest(r.body));
      expect(res.status).toBe(502);
      const json = await res.json();
      expect(json.code).toBe("UPSTREAM_ERROR");
      expect(JSON.stringify(json)).not.toContain("internal provider detail");
    });
  });

  describe("client errors (4xx other than 429)", () => {
    it("does not retry", async () => {
      const fetchMock = mockFetchSequence(jsonResponse({}, 400));
      const res = await r.post(postRequest(r.body));
      expect(res.status).toBe(502);
      expect((await res.json()).code).toBe("UPSTREAM_ERROR");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("timeouts", () => {
    it("passes an abort signal to fetch", async () => {
      const fetchMock = mockFetchSequence(r.good());
      await r.post(postRequest(r.body));
      expect(fetchMock.mock.calls[0]![1]!.signal).toBeInstanceOf(AbortSignal);
    });

    it("aborts a hung request and returns TIMEOUT / 504 after retries", async () => {
      vi.stubEnv("GEMINI_TIMEOUT_MS", "20");
      // A fetch that never resolves on its own, only when its signal aborts.
      const hang = (_url: string, init?: RequestInit) =>
        new Promise<Response>((_, reject) =>
          init!.signal!.addEventListener("abort", () =>
            reject(init!.signal!.reason)
          )
        );
      const fn = vi.fn(hang as unknown as typeof fetch);
      vi.stubGlobal("fetch", fn);

      const res = await r.post(postRequest(r.body));

      expect(res.status).toBe(504);
      expect((await res.json()).code).toBe("TIMEOUT");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("recovers if a retry after a timeout succeeds", async () => {
      const timeout = Object.assign(new Error("timed out"), {
        name: "TimeoutError",
      });
      const fetchMock = mockFetchSequence(timeout, r.good());
      const res = await r.post(postRequest(r.body));
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("network failure", () => {
    it("maps to UPSTREAM_ERROR after retries", async () => {
      const fetchMock = mockFetchSequence(new TypeError("fetch failed"));
      const res = await r.post(postRequest(r.body));
      expect(res.status).toBe(502);
      expect((await res.json()).code).toBe("UPSTREAM_ERROR");
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  describe("garbage output", () => {
    it("retries once with a stricter prompt, then succeeds", async () => {
      const fetchMock = mockFetchSequence(r.garbage(), r.good());
      const res = await r.post(postRequest(r.body));
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(promptOfCall(fetchMock, 1).length).toBeGreaterThan(
        promptOfCall(fetchMock, 0).length
      );
      expect(promptOfCall(fetchMock, 1)).toContain("ONLY");
    });

    it("returns INVALID_OUTPUT / 502 when the retry is garbage too", async () => {
      const fetchMock = mockFetchSequence(r.garbage());
      const res = await r.post(postRequest(r.body));
      expect(res.status).toBe(502);
      expect(await res.json()).toEqual({
        error: USER_MESSAGES.INVALID_OUTPUT,
        code: "INVALID_OUTPUT",
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("logging", () => {
    it("logs one structured failure line with route, code and latency", async () => {
      mockFetchSequence(jsonResponse({}, 429));
      await r.post(postRequest(r.body));

      const lines = vi
        .mocked(console.error)
        .mock.calls.map((c) => JSON.parse(String(c[0])));
      expect(lines).toHaveLength(1);
      expect(lines[0]).toMatchObject({
        event: "gemini_failure",
        route: r.route,
        code: "RATE_LIMITED",
      });
      expect(typeof lines[0].latencyMs).toBe("number");
    });

    it("logs each retry as a warning and never logs the API key", async () => {
      mockFetchSequence(jsonResponse({}, 503), r.good());
      await r.post(postRequest(r.body));
      const warns = vi.mocked(console.warn).mock.calls.map((c) => String(c[0]));
      expect(warns).toHaveLength(1);
      expect(warns[0]).toContain("gemini_retry");
      expect(warns.join()).not.toContain("test-key");
    });

    it("does not log on success", async () => {
      mockFetchSequence(r.good());
      await r.post(postRequest(r.body));
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
