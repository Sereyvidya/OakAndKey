"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/app/lib/supabase/client";
import InlineSpinner from "../property/components/shared/InlineSpinner";

type Mode = "signin" | "signup";

/** Turns Supabase auth errors into plain language. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login"))
    return "That email and password don't match.";
  if (m.includes("already registered")) {
    return "An account with this email already exists. Try signing in.";
  }
  if (m.includes("password"))
    return "Choose a password with at least 6 characters.";
  if (m.includes("rate limit"))
    return "Too many attempts. Please wait a bit and try again.";
  if (m.includes("email not confirmed")) {
    return "Please confirm your email first (check your inbox), then sign in.";
  }
  return "Something went wrong. Please try again.";
}

/** Only allow same-site redirects after sign-in. */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/listings";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const sb = getSupabase();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sb) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "signup") {
        const { data, error: err } = await sb.auth.signUp({ email, password });
        if (err) throw err;
        if (!data.session) {
          // Email confirmation is on: no session until they click the link.
          setNotice("Check your email for a confirmation link, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        const { error: err } = await sb.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
      }
      router.push(safeNext(params.get("next")));
    } catch (err) {
      setError(
        friendlyAuthError(err instanceof Error ? err.message : String(err))
      );
    } finally {
      setBusy(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/95 p-6">
        <h1 className="mb-2 text-3xl font-semibold text-[color:var(--ink-strong)]">
          Accounts aren&apos;t enabled
        </h1>
        <p className="text-[color:var(--ink-soft)]">
          This copy of Oak &amp; Key isn&apos;t connected to an account service,
          so listings can&apos;t be saved. You can still build flyers and
          captions.
        </p>
      </div>
    );
  }

  const inputClass =
    "form-input-focus form-field h-11 w-full rounded-md border border-[color:var(--field-border)] px-4";

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/96 p-6 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.8)]">
      <h1 className="text-3xl font-semibold text-[color:var(--ink-strong)]">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-1 mb-6 text-sm text-[color:var(--ink-soft)]">
        Save listings and reuse your agent details and photos.
      </p>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error ? (
          <p role="alert" className="form-error-text text-sm">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="text-sm text-[color:var(--ink-soft)]">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || !email || !password}
          className="hover-lift inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] text-sm font-bold text-[#0b0f14] hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <InlineSpinner /> : null}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-[color:var(--ink-soft)]">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
            setNotice("");
          }}
          className="font-semibold text-[color:var(--ink-strong)] underline underline-offset-2"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </div>
      <div className="mt-3 text-center text-xs">
        <Link
          href="/"
          className="text-[color:var(--ink-muted)] hover:underline"
        >
          Continue without an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
