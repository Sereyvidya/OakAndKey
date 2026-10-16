"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/app/lib/auth/store";
import { usePropertyStore } from "@/app/lib/propertyStore";
import { getSupabase } from "@/app/lib/supabase/client";
import { loadProfile } from "@/app/lib/listings/repository";
import { applyProfileToForm } from "@/app/lib/listings/serialize";

/**
 * Keeps the auth store in step with the Supabase session and, after sign-in,
 * pre-fills empty agent fields from the saved agent profile.
 */
export default function AuthSync() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setReady = useAuthStore((s) => s.setReady);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady();
      return;
    }

    const toUser = (
      session: { user: { id: string; email?: string } } | null
    ) =>
      session ? { id: session.user.id, email: session.user.email ?? "" } : null;

    void sb.auth.getSession().then(({ data }) => setUser(toUser(data.session)));
    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session));
      if (!session) usePropertyStore.getState().setCurrentListingId(null);
    });
    return () => data.subscription.unsubscribe();
  }, [setUser, setReady]);

  const userId = user?.id;
  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !userId) return;
    let cancelled = false;
    loadProfile(sb, userId)
      .then((profile) => {
        if (cancelled || !profile) return;
        const { formData, setFormData } = usePropertyStore.getState();
        const patch = applyProfileToForm(profile, formData);
        if (Object.keys(patch).length > 0) setFormData(patch);
      })
      .catch(() => {
        // Pre-filling is a convenience; the form still works without it.
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
