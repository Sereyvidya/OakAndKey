import type { Page, Route } from "@playwright/test";

export const SUPABASE_URL = "http://127.0.0.1:54321";
export const ANON_KEY = "test-anon-key";

const USER = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "agent@example.com",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};

const b64url = (o: object) =>
  Buffer.from(JSON.stringify(o)).toString("base64url");
const fakeJwt = () =>
  `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({
    sub: USER.id,
    role: "authenticated",
    exp: 4102444800,
  })}.sig`;

// 1x1 PNG served for every public image URL.
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

type Row = Record<string, unknown>;

/**
 * An in-memory fake of the Supabase endpoints the app calls (auth, PostgREST,
 * storage), wired into Playwright's network layer. Lets e2e tests exercise the
 * real sign-in / save / list / open / delete flow without a Supabase project.
 */
export async function mockSupabase(page: Page) {
  const state = {
    listings: [] as Row[],
    profiles: [] as Row[],
    uploads: [] as string[],
    removed: [] as string[],
    signedIn: false,
    /** When true, writes to `listings` fail with a 500. */
    failListingWrites: false,
  };

  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "*",
    "access-control-expose-headers": "*",
  };
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({
      status,
      headers: { ...cors, "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  const filtered = (rows: Row[], params: URLSearchParams) => {
    let out = rows;
    for (const [key, value] of params) {
      if (value.startsWith("eq.")) {
        out = out.filter((r) => String(r[key]) === value.slice(3));
      }
    }
    return out;
  };

  await page.route(`${SUPABASE_URL}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    if (method === "OPTIONS") {
      return route.fulfill({ status: 204, headers: cors });
    }

    // ---- auth
    if (path === "/auth/v1/token") {
      const { password } = req.postDataJSON();
      if (password !== "correct-horse") {
        return json(
          route,
          {
            error: "invalid_grant",
            error_description: "Invalid login credentials",
          },
          400
        );
      }
      state.signedIn = true;
      return json(route, {
        access_token: fakeJwt(),
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: "refresh",
        user: USER,
      });
    }
    if (path === "/auth/v1/logout") {
      state.signedIn = false;
      return route.fulfill({ status: 204, headers: cors });
    }
    if (path === "/auth/v1/user") return json(route, USER);

    // ---- storage
    if (path.startsWith("/storage/v1/object/public/")) {
      return route.fulfill({
        status: 200,
        headers: { ...cors, "content-type": "image/png" },
        body: PIXEL,
      });
    }
    if (path.startsWith("/storage/v1/object/media/") && method === "POST") {
      state.uploads.push(path.replace("/storage/v1/object/media/", ""));
      return json(route, { Key: path });
    }
    if (path === "/storage/v1/object/media" && method === "DELETE") {
      state.removed.push(...(req.postDataJSON().prefixes as string[]));
      return json(route, []);
    }

    // ---- PostgREST
    const table = path.match(/^\/rest\/v1\/(listings|profiles)$/)?.[1];
    if (table) {
      const rows = table === "listings" ? state.listings : state.profiles;
      const asObject = (req.headers()["accept"] ?? "").includes("pgrst.object");

      if (method === "GET") {
        let out = filtered(rows, url.searchParams);
        if (url.searchParams.get("order")?.startsWith("updated_at")) {
          out = [...out].sort((a, b) =>
            String(b.updated_at).localeCompare(String(a.updated_at))
          );
        }
        if (asObject) {
          return out[0]
            ? json(route, out[0])
            : json(route, { message: "not found", code: "PGRST116" }, 406);
        }
        return json(route, out);
      }
      if (method === "POST") {
        if (table === "listings" && state.failListingWrites) {
          return json(route, { message: "boom" }, 500);
        }
        const row = req.postDataJSON() as Row;
        const i = rows.findIndex((r) => r.id === row.id);
        if (i >= 0) rows[i] = { ...rows[i], ...row };
        else rows.push(row);
        return route.fulfill({ status: 201, headers: cors });
      }
      if (method === "DELETE") {
        const keep = rows.filter(
          (r) => !filtered([r], url.searchParams).length
        );
        rows.splice(0, rows.length, ...keep);
        return route.fulfill({ status: 204, headers: cors });
      }
    }

    return json(route, { message: `unmocked ${method} ${path}` }, 404);
  });

  return state;
}
