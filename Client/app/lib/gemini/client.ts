import type { GeminiResponse } from "../types";
import { GeminiError } from "./errors";
import { logRetry } from "./log";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/** Tunables, read at call time so tests can override them via env. */
function config() {
  return {
    attemptTimeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 12_000,
    totalBudgetMs: Number(process.env.GEMINI_TOTAL_BUDGET_MS) || 30_000,
    backoffMs: Number(process.env.GEMINI_BACKOFF_MS ?? 400),
    maxAttempts: 3,
  };
}

const sleep = (ms: number) =>
  ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();

function textFrom(data: GeminiResponse): string {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text || "")
      .join("\n")
      .trim() || ""
  );
}

/**
 * Calls Gemini once logically: per-attempt timeout, and up to 3 attempts with
 * exponential backoff on timeouts, network errors, 429 and 5xx. Other 4xx
 * responses fail immediately. Returns the model's text.
 */
export async function callGemini(
  route: string,
  payload: unknown
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiError("MISSING_API_KEY");

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const cfg = config();
  const startedAt = Date.now();
  let lastError: GeminiError = new GeminiError("INTERNAL");

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      const resp = await fetch(`${API_BASE}/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Header (not ?key=) so the key never appears in URLs or logs.
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(cfg.attemptTimeoutMs),
      });

      if (resp.ok) return textFrom((await resp.json()) as GeminiResponse);

      const body = await resp.text().catch(() => "");
      const detail = `HTTP ${resp.status}: ${body}`;
      if (resp.status === 429)
        lastError = new GeminiError("RATE_LIMITED", detail);
      else if (resp.status >= 500)
        lastError = new GeminiError("UPSTREAM_ERROR", detail);
      else throw new GeminiError("UPSTREAM_ERROR", detail); // non-retryable 4xx
    } catch (err) {
      if (err instanceof GeminiError) {
        throw err; // non-retryable (bad 4xx)
      } else if (err instanceof Error && err.name === "TimeoutError") {
        lastError = new GeminiError(
          "TIMEOUT",
          `no response in ${cfg.attemptTimeoutMs}ms`
        );
      } else {
        lastError = new GeminiError(
          "UPSTREAM_ERROR",
          err instanceof Error ? err.message : "network error"
        );
      }
    }

    const wait = cfg.backoffMs * 2 ** (attempt - 1);
    const outOfBudget = Date.now() - startedAt + wait >= cfg.totalBudgetMs;
    if (attempt === cfg.maxAttempts || outOfBudget) break;
    logRetry({ route, attempt, reason: lastError.code });
    await sleep(wait);
  }

  throw lastError;
}

/**
 * Generate-then-validate. If the first reply fails validation, or `check`
 * reports problems with it, ask once more with a stricter prompt (plus
 * `feedback` describing the problems). If that second reply cannot be parsed,
 * throw INVALID_OUTPUT; if it parses but still has `check` problems it is
 * returned anyway so the UI can warn instead of failing the request.
 */
export async function generateValidated<T>(options: {
  route: string;
  buildPayload: (strict: boolean, feedback?: string[]) => unknown;
  parse: (text: string) => T | null;
  /** Returns human-readable problems with a parsed reply; empty when fine. */
  check?: (parsed: T) => string[];
}): Promise<T> {
  let feedback: string[] | undefined;
  for (const strict of [false, true]) {
    const text = await callGemini(
      options.route,
      options.buildPayload(strict, feedback)
    );
    const parsed = options.parse(text);
    const problems = parsed !== null ? (options.check?.(parsed) ?? []) : [];

    if (parsed !== null && (problems.length === 0 || strict)) return parsed;
    if (strict) {
      throw new GeminiError(
        "INVALID_OUTPUT",
        `unparseable: ${text.slice(0, 200)}`
      );
    }
    feedback = problems.length > 0 ? problems : undefined;
    logRetry({
      route: options.route,
      attempt: 1,
      reason: parsed === null ? "INVALID_OUTPUT" : "FLAGGED_OUTPUT",
    });
  }
  throw new GeminiError("INVALID_OUTPUT");
}
