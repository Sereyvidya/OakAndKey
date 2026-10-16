"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/lib/auth/store";
import { isSupabaseConfigured, getSupabase } from "@/app/lib/supabase/client";
import { usePropertyStore } from "@/app/lib/propertyStore";

/** Sign in / sign out control for the header. Hidden when accounts aren't configured. */
export default function AccountMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);

  if (!isSupabaseConfigured || !ready) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="shrink-0 rounded-full border border-[var(--card-border)] bg-[var(--field-bg)] px-3.5 py-1.5 text-xs font-semibold text-[var(--ink-base)] transition-colors hover:bg-[var(--surface-soft)]"
      >
        Sign in
      </Link>
    );
  }

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
    usePropertyStore.getState().reset();
    router.push("/");
  };

  return (
    <div className="flex shrink-0 items-center gap-2 text-xs">
      <button
        type="button"
        onClick={signOut}
        title={`Signed in as ${user.email}`}
        className="rounded-full border border-[var(--card-border)] bg-[var(--field-bg)] px-3.5 py-1.5 font-semibold text-[var(--ink-base)] transition-colors hover:bg-[var(--surface-soft)]"
      >
        Sign out
      </button>
    </div>
  );
}
