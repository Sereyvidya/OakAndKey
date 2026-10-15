import { userMessage, type ErrorCode } from "./errors";
import { translate, type Lang } from "../i18n/strings";

/**
 * POSTs JSON to one of our API routes and returns the parsed body.
 * Throws an Error whose message is safe to show to the user: it covers
 * network failures, non-JSON responses (e.g. a platform timeout page) and
 * typed `{ error, code }` bodies from the routes.
 */
export async function postApi<T extends object>(
  url: string,
  body: unknown,
  lang: Lang = "en"
): Promise<T> {
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(translate(lang, "err.network"));
  }

  let data: unknown;
  try {
    data = await resp.json();
  } catch {
    throw new Error(
      userMessage(resp.status === 504 ? "TIMEOUT" : "INTERNAL", lang)
    );
  }

  if (!resp.ok) {
    const err = data as { error?: string; code?: ErrorCode };
    throw new Error(err.error || userMessage(err.code, lang));
  }
  return data as T;
}
