import type { ErrorCode } from "./errors";

interface FailureLog {
  route: string;
  code: ErrorCode;
  latencyMs: number;
  attempts?: number;
  detail?: string;
}

/**
 * One structured JSON line per failure, so a log drain (Vercel logs, Datadog)
 * can filter on `event:"gemini_failure"` and chart code/route/latency.
 */
export function logFailure(entry: FailureLog) {
  console.error(
    JSON.stringify({
      event: "gemini_failure",
      ...entry,
      detail: entry.detail?.slice(0, 300),
    })
  );
}

export function logRetry(entry: {
  route: string;
  attempt: number;
  reason: string;
}) {
  console.warn(JSON.stringify({ event: "gemini_retry", ...entry }));
}
