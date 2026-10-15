/** Machine-readable failure reasons returned by the Gemini-backed API routes. */
export type ErrorCode =
  | "MISSING_API_KEY"
  | "BAD_REQUEST"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "INVALID_OUTPUT"
  | "INTERNAL";

export const HTTP_STATUS: Record<ErrorCode, number> = {
  MISSING_API_KEY: 500,
  BAD_REQUEST: 400,
  TIMEOUT: 504,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  INVALID_OUTPUT: 502,
  INTERNAL: 500,
};

/** Friendly text shown in the UI; never contains raw provider errors. */
export const USER_MESSAGES: Record<ErrorCode, string> = {
  MISSING_API_KEY: "AI features aren't set up on this server yet.",
  BAD_REQUEST:
    "That request looked invalid. Please check your listing and try again.",
  TIMEOUT: "The AI took too long to respond. Please try again.",
  RATE_LIMITED: "The AI is busy right now. Please wait a moment and try again.",
  UPSTREAM_ERROR: "The AI service had a problem. Please try again shortly.",
  INVALID_OUTPUT:
    "The AI returned something we couldn't use. Please try again.",
  INTERNAL: "Something went wrong on our side. Please try again.",
};

export function userMessage(code: ErrorCode | undefined): string {
  return USER_MESSAGES[code ?? "INTERNAL"] ?? USER_MESSAGES.INTERNAL;
}

export class GeminiError extends Error {
  constructor(
    readonly code: ErrorCode,
    /** Internal detail for logs only (never sent to the client). */
    readonly detail?: string
  ) {
    super(detail ?? code);
    this.name = "GeminiError";
  }
}
