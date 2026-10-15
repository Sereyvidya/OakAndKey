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

type Step = Response | Error | ((url: string, init?: RequestInit) => Response);

/**
 * Replaces global fetch so tests can never reach the real Gemini API.
 * Each call consumes the next step; the last step repeats.
 */
export function mockFetchSequence(...steps: Step[]) {
  let i = 0;
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const step = steps[Math.min(i++, steps.length - 1)]!;
    if (step instanceof Error) throw step;
    if (typeof step === "function") return step(String(url), init);
    return step.clone();
  });
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

/** Prompt text sent on the nth fetch call. */
export function promptOfCall(
  fn: ReturnType<typeof mockFetchSequence>,
  n: number
) {
  const init = fn.mock.calls[n]![1]!;
  return JSON.parse(String(init.body)).contents[0].parts[0].text as string;
}
