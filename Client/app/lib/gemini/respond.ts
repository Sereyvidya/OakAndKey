import {
  GeminiError,
  HTTP_STATUS,
  userMessage,
  type ErrorCode,
} from "./errors";
import { logFailure } from "./log";

/** Runs a route handler, turning any failure into a typed JSON error + log line. */
export async function respond<T extends object>(
  route: string,
  run: () => Promise<T>
): Promise<Response> {
  const startedAt = Date.now();
  try {
    return Response.json(await run());
  } catch (err) {
    const code: ErrorCode = err instanceof GeminiError ? err.code : "INTERNAL";
    logFailure({
      route,
      code,
      latencyMs: Date.now() - startedAt,
      detail:
        err instanceof Error
          ? err instanceof GeminiError
            ? err.detail
            : err.message
          : String(err),
    });
    return Response.json(
      { error: userMessage(code), code },
      { status: HTTP_STATUS[code] }
    );
  }
}

/** Reads a JSON body or throws BAD_REQUEST. */
export async function readJson(
  request: Request
): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object")
      return body as Record<string, unknown>;
  } catch {
    // fall through
  }
  throw new GeminiError("BAD_REQUEST", "body is not a JSON object");
}
