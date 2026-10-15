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

export const USER_MESSAGES_KM: Record<ErrorCode, string> = {
  MISSING_API_KEY: "មុខងារ AI មិនទាន់ត្រូវបានតំឡើងនៅលើម៉ាស៊ីនមេនេះទេ។",
  BAD_REQUEST:
    "សំណើនេះហាក់ដូចជាមិនត្រឹមត្រូវ។ សូមពិនិត្យព័ត៌មានអចលនទ្រព្យ រួចព្យាយាមម្តងទៀត។",
  TIMEOUT: "AI ឆ្លើយតបយូរពេក។ សូមព្យាយាមម្តងទៀត។",
  RATE_LIMITED: "AI កំពុងមមាញឹក។ សូមរង់ចាំបន្តិច រួចព្យាយាមម្តងទៀត។",
  UPSTREAM_ERROR: "សេវា AI មានបញ្ហា។ សូមព្យាយាមម្តងទៀតក្នុងពេលឆាប់ៗ។",
  INVALID_OUTPUT:
    "AI បានឆ្លើយតបមកជាអ្វីដែលយើងមិនអាចប្រើបាន។ សូមព្យាយាមម្តងទៀត។",
  INTERNAL: "មានអ្វីមួយខុសប្រក្រតីនៅខាងយើង។ សូមព្យាយាមម្តងទៀត។",
};

export function userMessage(
  code: ErrorCode | undefined,
  lang: "en" | "km" = "en"
): string {
  const table = lang === "km" ? USER_MESSAGES_KM : USER_MESSAGES;
  return table[code ?? "INTERNAL"] ?? table.INTERNAL;
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
