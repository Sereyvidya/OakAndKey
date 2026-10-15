import { vi } from "vitest";

/** Builds a Gemini generateContent response body whose model text is `text`. */
export function geminiBody(text: string) {
  return { candidates: [{ content: { parts: [{ text }] } }] };
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Replaces global fetch so tests can never reach the real Gemini API. */
export function mockFetch(impl: (url: string, init?: RequestInit) => Response) {
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) =>
    impl(String(url), init)
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

export function postRequest(body: unknown) {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
