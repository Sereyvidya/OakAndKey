import type { SupabaseClient } from "@supabase/supabase-js";

type Row = Record<string, unknown>;

/**
 * A tiny in-memory stand-in for the parts of supabase-js the app uses
 * (select/eq/order/limit/single/maybeSingle/upsert/delete, and storage).
 * It records calls so tests can assert what was uploaded and removed.
 */
export function createFakeSupabase(opts: { failUpsertOn?: string } = {}) {
  const tables = new Map<string, Row[]>();
  const files = new Map<string, Blob>();
  const removed: string[] = [];
  const uploads: string[] = [];

  const rowsOf = (t: string) => {
    if (!tables.has(t)) tables.set(t, []);
    return tables.get(t)!;
  };

  function from(table: string) {
    let filters: [string, unknown][] = [];
    let mode: "select" | "delete" = "select";
    let single: "none" | "single" | "maybe" = "none";
    let limit = Infinity;
    let order: { col: string; asc: boolean } | null = null;
    let upsertRow: Row | null = null;

    const run = () => {
      if (upsertRow) {
        if (opts.failUpsertOn === table) {
          return { data: null, error: { message: "boom" } };
        }
        const rows = rowsOf(table);
        const idx = rows.findIndex((r) => r.id === upsertRow!.id);
        if (idx >= 0) rows[idx] = { ...rows[idx], ...upsertRow };
        else rows.push({ ...upsertRow });
        return { data: null, error: null };
      }
      const match = (r: Row) => filters.every(([c, v]) => r[c] === v);
      if (mode === "delete") {
        tables.set(
          table,
          rowsOf(table).filter((r) => !match(r))
        );
        return { data: null, error: null };
      }
      let out = rowsOf(table).filter(match);
      if (order) {
        const { col, asc } = order;
        out = [...out].sort((a, b) =>
          String(a[col]) < String(b[col]) ? (asc ? -1 : 1) : asc ? 1 : -1
        );
      }
      out = out.slice(0, limit);
      if (single === "none") return { data: out, error: null };
      if (single === "maybe") return { data: out[0] ?? null, error: null };
      return out[0]
        ? { data: out[0], error: null }
        : { data: null, error: { message: "not found" } };
    };

    const builder: Record<string, unknown> = {
      select: () => builder,
      eq: (c: string, v: unknown) => (filters.push([c, v]), builder),
      order: (col: string, o?: { ascending?: boolean }) => (
        (order = { col, asc: o?.ascending ?? true }),
        builder
      ),
      limit: (n: number) => ((limit = n), builder),
      maybeSingle: () => ((single = "maybe"), builder),
      single: () => ((single = "single"), builder),
      upsert: (row: Row) => ((upsertRow = row), builder),
      delete: () => ((mode = "delete"), builder),
      then: (
        resolve: (v: unknown) => unknown,
        reject?: (e: unknown) => unknown
      ) => Promise.resolve(run()).then(resolve, reject),
    };
    return builder;
  }

  const storage = {
    from: (bucket: string) => ({
      upload: async (path: string, blob: Blob) => {
        uploads.push(path);
        files.set(path, blob);
        return { data: { path }, error: null };
      },
      remove: async (paths: string[]) => {
        removed.push(...paths);
        paths.forEach((p) => files.delete(p));
        return { data: [], error: null };
      },
      getPublicUrl: (path: string) => ({
        data: {
          publicUrl: `https://test.supabase.co/storage/v1/object/public/${bucket}/${path}`,
        },
      }),
    }),
  };

  const client = { from, storage } as unknown as SupabaseClient;
  return { client, tables, files, uploads, removed, rowsOf };
}

/** A 1x1 PNG as a data URL. */
export const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
