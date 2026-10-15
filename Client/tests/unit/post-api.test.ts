import { afterEach, describe, expect, it, vi } from "vitest";
import { postApi } from "@/app/lib/gemini/postApi";
import { USER_MESSAGES, USER_MESSAGES_KM } from "@/app/lib/gemini/errors";

afterEach(() => vi.unstubAllGlobals());

const stub = (res: Response | Error) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      if (res instanceof Error) throw res;
      return res;
    })
  );

describe("postApi (what the UI shows)", () => {
  it("returns the parsed body on success", async () => {
    stub(Response.json({ ok: 1 }));
    expect(await postApi("/x", {})).toEqual({ ok: 1 });
  });

  it("shows the route's friendly error text", async () => {
    stub(
      Response.json({ error: "Busy.", code: "RATE_LIMITED" }, { status: 429 })
    );
    await expect(postApi("/x", {})).rejects.toThrow("Busy.");
  });

  it("falls back to the code's message", async () => {
    stub(Response.json({ code: "TIMEOUT" }, { status: 504 }));
    await expect(postApi("/x", {})).rejects.toThrow(USER_MESSAGES.TIMEOUT);
  });

  it("handles a non-JSON error page (e.g. platform timeout) without leaking it", async () => {
    stub(new Response("<html>Gateway Timeout</html>", { status: 504 }));
    await expect(postApi("/x", {})).rejects.toThrow(USER_MESSAGES.TIMEOUT);
  });

  it("handles being offline", async () => {
    stub(new TypeError("Failed to fetch"));
    await expect(postApi("/x", {})).rejects.toThrow(/reach the server/);
  });
});

describe("postApi in Khmer", () => {
  it("shows Khmer text for offline and for non-JSON errors", async () => {
    stub(new TypeError("Failed to fetch"));
    await expect(postApi("/x", {}, "km")).rejects.toThrow(/[ក-៿]/);
    stub(new Response("<html/>", { status: 504 }));
    await expect(postApi("/x", {}, "km")).rejects.toThrow(
      USER_MESSAGES_KM.TIMEOUT
    );
  });
});
