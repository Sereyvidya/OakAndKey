import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Name of the public storage bucket created by supabase/schema.sql. */
export const MEDIA_BUCKET = "media";

/**
 * Accounts are optional: without these two env vars the app runs exactly as
 * before (no sign-in, no saving). That keeps local dev, CI and previews
 * working without a Supabase project.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** The browser Supabase client, or null when accounts aren't configured. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  client ??= createClient(url!, anonKey!);
  return client;
}
