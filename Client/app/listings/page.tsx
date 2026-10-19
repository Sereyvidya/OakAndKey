"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/lib/auth/store";
import { usePropertyStore } from "@/app/lib/propertyStore";
import { getSupabase, isSupabaseConfigured } from "@/app/lib/supabase/client";
import {
  deleteListing,
  listListings,
  loadListing,
  loadProfile,
} from "@/app/lib/listings/repository";
import { applyProfileToForm } from "@/app/lib/listings/serialize";
import { formatCurrency } from "@/app/lib/listing/format";
import type { ListingSummary } from "@/app/lib/types";

const cardButton =
  "rounded-lg border border-[var(--field-border)] bg-[color:var(--field-bg)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)] disabled:opacity-60";

export default function MyListingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);

  const [listings, setListings] = useState<ListingSummary[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    setError("");
    try {
      setListings(await listListings(sb));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load listings.");
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !ready) return;
    if (!user) {
      router.replace("/login?next=/listings");
      return;
    }
    // Async load; state is set after the awaited request, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [ready, user, router, refresh]);

  const open = async (id: string) => {
    const sb = getSupabase();
    if (!sb || !user) return;
    setBusyId(id);
    setError("");
    try {
      const saved = await loadListing(sb, id);
      const store = usePropertyStore.getState();
      store.loadListing({
        id: saved.id,
        formData: saved.form,
        images: saved.images,
      });
      const profile = await loadProfile(sb, user.id).catch(() => null);
      if (profile) {
        const patch = applyProfileToForm(
          profile,
          usePropertyStore.getState().formData
        );
        usePropertyStore.getState().setFormData(patch);
      }
      router.push("/property/general");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not open the listing."
      );
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    const sb = getSupabase();
    if (!sb) return;
    setBusyId(id);
    setError("");
    try {
      await deleteListing(sb, id);
      if (usePropertyStore.getState().currentListingId === id) {
        usePropertyStore.getState().reset();
      }
      setListings((prev) => prev?.filter((l) => l.id !== id) ?? prev);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete the listing."
      );
    } finally {
      setBusyId(null);
      setConfirmingId(null);
    }
  };

  const startNew = () => {
    usePropertyStore.getState().reset();
    router.push("/property/general");
  };

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <p className="text-[color:var(--ink-soft)]">
          Accounts aren&apos;t enabled in this copy of the app, so there are no
          saved listings.
        </p>
      </Shell>
    );
  }

  if (!ready || !user) {
    return (
      <Shell>
        <p className="text-[color:var(--ink-soft)]">Loading…</p>
      </Shell>
    );
  }

  return (
    <Shell
      action={
        <button
          type="button"
          onClick={startNew}
          className="hover-lift rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[#0b0f14] hover:bg-[var(--brand-strong)]"
        >
          New listing
        </button>
      }
    >
      {error ? (
        <p role="alert" className="form-error-text mb-4 text-sm">
          {error}{" "}
          <button type="button" onClick={refresh} className="underline">
            Retry
          </button>
        </p>
      ) : null}

      {listings === null && !error ? (
        <p className="text-[color:var(--ink-soft)]">Loading your listings…</p>
      ) : null}

      {listings?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] p-8 text-center">
          <p className="text-[color:var(--ink-soft)]">
            No saved listings yet. Build one and press{" "}
            <span className="font-semibold">Save listing</span>.
          </p>
          <Link
            href="/property/general"
            className="mt-4 inline-block text-sm font-semibold underline"
          >
            Start a listing
          </Link>
        </div>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2">
        {listings?.map((l) => (
          <li
            key={l.id}
            className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[color:var(--field-bg)]"
          >
            <div className="aspect-[16/10] bg-[var(--surface-soft)]">
              {l.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={l.cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="p-4">
              <h2 className="truncate text-lg font-semibold text-[color:var(--ink-strong)]">
                {l.title}
              </h2>
              <p className="mt-0.5 truncate text-sm text-[color:var(--ink-soft)]">
                {[formatCurrency(l.price), l.address]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
                Updated {new Date(l.updatedAt).toLocaleDateString()}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => open(l.id)}
                  disabled={busyId === l.id}
                  className={cardButton}
                >
                  {busyId === l.id ? "Working…" : "Open"}
                </button>
                {confirmingId === l.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => remove(l.id)}
                      disabled={busyId === l.id}
                      className={`${cardButton} !border-red-300 !text-red-700`}
                    >
                      Confirm delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className={cardButton}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(l.id)}
                    className={cardButton}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function Shell({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6">
      <div className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/96 p-6 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.8)]">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-[color:var(--ink-strong)]">
            My Listings
          </h1>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
