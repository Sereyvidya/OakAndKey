"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/app/lib/auth/store";
import { usePropertyStore } from "@/app/lib/propertyStore";
import { getSupabase, isSupabaseConfigured } from "@/app/lib/supabase/client";
import { saveListing, saveProfile } from "@/app/lib/listings/repository";
import InlineSpinner from "../shared/InlineSpinner";

type Status = "idle" | "saving" | "saved" | "error";

const buttonClass =
  "hover-lift inline-flex items-center gap-2 rounded-xl border border-[var(--field-border)] bg-[color:var(--field-bg)] px-5 py-2.5 text-sm font-semibold text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60";

/** Saves the working listing (and the agent's details) to the signed-in account. */
export default function SaveListingButton() {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  if (!isSupabaseConfigured || !ready) return null;

  if (!user) {
    return (
      <Link href="/login?next=/property/general" className={buttonClass}>
        Sign in to save
      </Link>
    );
  }

  const save = async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { formData, images, currentListingId } = usePropertyStore.getState();

    if (!formData.propertyTitle.trim()) {
      setStatus("error");
      setMessage("Add a title before saving.");
      return;
    }

    setStatus("saving");
    setMessage("");
    try {
      // Agent details first, so the listing can rely on stored logo/photo paths.
      const profile = await saveProfile(sb, user.id, formData);
      const saved = await saveListing(sb, user.id, {
        id: currentListingId,
        form: formData,
        images,
      });

      const { setFormData, setImages, setCurrentListingId } =
        usePropertyStore.getState();
      // Point images at storage so the next save uploads nothing. Keep the
      // built-in default logo (the profile doesn't store it).
      setFormData({
        ...(profile.agentCompanyLogo && {
          agentCompanyLogo: profile.agentCompanyLogo,
        }),
        ...(profile.agentPhoto && { agentPhoto: profile.agentPhoto }),
        ...(profile.agentQrCode && { agentQrCode: profile.agentQrCode }),
      });
      setImages(saved.images);
      setCurrentListingId(saved.id);

      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error && err.name === "AccountError"
          ? err.message
          : "Couldn't save. Check your connection and try again."
      );
    }
  };

  return (
    <div className="flex items-center gap-3">
      {status === "error" ? (
        <span role="alert" className="form-error-text text-sm">
          {message}
        </span>
      ) : null}
      {status === "saved" ? (
        <span role="status" className="text-sm text-[color:var(--ink-soft)]">
          Saved ✓
        </span>
      ) : null}
      <button
        type="button"
        onClick={save}
        disabled={status === "saving"}
        className={buttonClass}
      >
        {status === "saving" ? <InlineSpinner /> : null}
        {status === "saving" ? "Saving..." : "Save listing"}
      </button>
    </div>
  );
}
