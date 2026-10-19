"use client";

import { useState } from "react";
import { useAuthStore } from "@/app/lib/auth/store";
import { usePropertyStore } from "@/app/lib/propertyStore";
import { getSupabase, isSupabaseConfigured } from "@/app/lib/supabase/client";
import { saveListing, saveProfile } from "@/app/lib/listings/repository";

export type SaveStatus = "idle" | "saving" | "error";

/**
 * Saving the working listing (and the agent's details) to the signed-in
 * account. `save()` resolves true on success; when accounts are off or nobody
 * is signed in there is nothing to save and callers should just continue.
 */
export function useListingSaver() {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");

  /** True when Save & Continue should save to the account. */
  const enabled = isSupabaseConfigured && ready && Boolean(user);
  /** True when accounts exist but the agent hasn't signed in (show a hint). */
  const offerSignIn = isSupabaseConfigured && ready && !user;

  const save = async (): Promise<boolean> => {
    const sb = getSupabase();
    if (!sb || !user) return true;

    const { formData, images, currentListingId } = usePropertyStore.getState();
    setStatus("saving");
    setError("");
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

      setStatus("idle");
      return true;
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error && err.name === "AccountError"
          ? err.message
          : "Couldn't save. Check your connection and try again."
      );
      return false;
    }
  };

  return { enabled, offerSignIn, status, error, save };
}
