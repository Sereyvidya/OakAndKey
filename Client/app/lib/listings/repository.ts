import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET } from "../supabase/client";
import { dataUrlToBlob, ensureDataUrl } from "../images/resize";
import type {
  AgentProfile,
  ListingForm,
  ListingImage,
  ListingSummary,
  SavedListing,
} from "../types";
import {
  formToStored,
  imagesToStored,
  profileToRow,
  rowToProfile,
  rowToSaved,
  rowToSummary,
  type ListingRow,
  type ProfileRow,
} from "./serialize";

/** Friendly error for the UI; `cause` keeps the original for debugging. */
export class AccountError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "AccountError";
  }
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function publicUrl(sb: SupabaseClient) {
  return (path: string) =>
    sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Uploads one image (data URL, or a URL we can fetch) and returns its storage path. */
async function uploadImage(
  sb: SupabaseClient,
  folder: string,
  prefix: string,
  preview: string
): Promise<string> {
  const blob = dataUrlToBlob(await ensureDataUrl(preview));
  const path = `${folder}/${prefix}${crypto.randomUUID()}.${EXT[blob.type] ?? "jpg"}`;
  const { error } = await sb.storage
    .from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (error) throw new AccountError("Could not upload a photo.", error);
  return path;
}

async function removeFiles(sb: SupabaseClient, paths: string[]) {
  if (paths.length === 0) return;
  // Best effort: a leftover file is harmless, a failed save is not. But say so
  // when storage deleted fewer files than asked (e.g. a missing policy), since
  // that otherwise fails silently.
  const { data, error } = await sb.storage.from(MEDIA_BUCKET).remove(paths);
  if (error || (data?.length ?? 0) < paths.length) {
    console.warn(
      JSON.stringify({
        event: "storage_remove_incomplete",
        requested: paths.length,
        removed: data?.length ?? 0,
        error: error?.message,
      })
    );
  }
}

export async function listListings(
  sb: SupabaseClient
): Promise<ListingSummary[]> {
  const { data, error } = await sb
    .from("listings")
    .select("id,title,form,images,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new AccountError("Could not load your listings.", error);
  const urlFor = publicUrl(sb);
  return (data as ListingRow[]).map((row) => rowToSummary(row, urlFor));
}

export async function loadListing(
  sb: SupabaseClient,
  id: string
): Promise<SavedListing> {
  const { data, error } = await sb
    .from("listings")
    .select("id,title,form,images,updated_at")
    .eq("id", id)
    .single();
  if (error || !data)
    throw new AccountError("Could not open that listing.", error);
  return rowToSaved(data as ListingRow, publicUrl(sb));
}

/**
 * Saves a listing: uploads any photos not yet in storage, upserts the row,
 * then deletes photos that were removed since the last save. Returns the
 * listing with every image now pointing at storage, so a second save uploads
 * nothing.
 */
export async function saveListing(
  sb: SupabaseClient,
  userId: string,
  input: { id: string | null; form: ListingForm; images: ListingImage[] }
): Promise<SavedListing> {
  const id = input.id ?? crypto.randomUUID();
  const urlFor = publicUrl(sb);

  let previousPaths: string[] = [];
  if (input.id) {
    const { data } = await sb
      .from("listings")
      .select("images")
      .eq("id", input.id)
      .maybeSingle();
    previousPaths = ((data?.images ?? []) as { path: string }[]).map(
      (i) => i.path
    );
  }

  const uploaded: string[] = [];
  const saved: ListingImage[] = [];
  try {
    for (const img of input.images) {
      if (img.path) {
        saved.push(img);
        continue;
      }
      const path = await uploadImage(sb, `${userId}/${id}`, "", img.preview);
      uploaded.push(path);
      saved.push({ name: img.name, path, preview: urlFor(path) });
    }

    const row = {
      id,
      user_id: userId,
      title: input.form.propertyTitle.trim(),
      form: formToStored(input.form),
      images: imagesToStored(saved),
      updated_at: new Date().toISOString(),
    };
    const { error } = await sb.from("listings").upsert(row);
    if (error) throw new AccountError("Could not save the listing.", error);
  } catch (err) {
    await removeFiles(sb, uploaded);
    throw err;
  }

  const keep = new Set(saved.map((i) => i.path));
  await removeFiles(
    sb,
    previousPaths.filter((p) => !keep.has(p))
  );

  return { id, form: formToStored(input.form), images: saved };
}

export async function deleteListing(
  sb: SupabaseClient,
  id: string
): Promise<void> {
  const { data } = await sb
    .from("listings")
    .select("images")
    .eq("id", id)
    .maybeSingle();
  const { error } = await sb.from("listings").delete().eq("id", id);
  if (error) throw new AccountError("Could not delete the listing.", error);
  await removeFiles(
    sb,
    ((data?.images ?? []) as { path: string }[]).map((i) => i.path)
  );
}

export async function loadProfile(
  sb: SupabaseClient,
  userId: string
): Promise<AgentProfile | null> {
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new AccountError("Could not load your profile.", error);
  return data ? rowToProfile(data as ProfileRow, publicUrl(sb)) : null;
}

type AssetKind = "logo" | "photo" | "qr";

/**
 * Saves the agent's reusable details (and their logo/photo/QR images) so they
 * pre-fill every future listing. Images already in storage are reused; the
 * built-in default logo is not stored.
 */
export async function saveProfile(
  sb: SupabaseClient,
  userId: string,
  form: ListingForm
): Promise<AgentProfile> {
  const urlFor = publicUrl(sb);
  const { data: existing } = await sb
    .from("profiles")
    .select("logo_path,photo_path,qr_path")
    .eq("id", userId)
    .maybeSingle();
  const previous: Record<AssetKind, string | null> = {
    logo: existing?.logo_path ?? null,
    photo: existing?.photo_path ?? null,
    qr: existing?.qr_path ?? null,
  };

  const sources: Record<AssetKind, ListingForm["agentPhoto"]> = {
    logo: form.agentCompanyLogo,
    photo: form.agentPhoto,
    qr: form.agentQrCode,
  };

  const paths: Record<AssetKind, string | null> = {
    logo: null,
    photo: null,
    qr: null,
  };
  const uploaded: string[] = [];
  try {
    for (const kind of ["logo", "photo", "qr"] as const) {
      const src = sources[kind];
      if (!src || typeof src === "string" || src.type === "default-svg-logo") {
        continue;
      }
      if (src.path) {
        paths[kind] = src.path;
        continue;
      }
      paths[kind] = await uploadImage(
        sb,
        `${userId}/profile`,
        `${kind}-`,
        src.preview
      );
      uploaded.push(paths[kind]!);
    }

    const { error } = await sb.from("profiles").upsert({
      id: userId,
      ...profileToRow(
        {
          agentName: form.agentName,
          agentCompanyName: form.agentCompanyName,
          agentSocialLink: form.agentSocialLink,
          agentPhone: form.agentPhone,
          agentEmail: form.agentEmail,
        },
        paths
      ),
      updated_at: new Date().toISOString(),
    });
    if (error) throw new AccountError("Could not save your profile.", error);
  } catch (err) {
    await removeFiles(sb, uploaded);
    throw err;
  }

  const stale = (Object.keys(previous) as AssetKind[])
    .map((k) => previous[k])
    .filter(
      (p): p is string => Boolean(p) && !Object.values(paths).includes(p)
    );
  await removeFiles(sb, stale);

  const asset = (name: string, path: string | null): ListingImage | null =>
    path ? { name, path, preview: urlFor(path) } : null;
  return {
    agentName: form.agentName,
    agentCompanyName: form.agentCompanyName,
    agentSocialLink: form.agentSocialLink,
    agentPhone: form.agentPhone,
    agentEmail: form.agentEmail,
    agentCompanyLogo: asset("logo", paths.logo),
    agentPhoto: asset("photo", paths.photo),
    agentQrCode: asset("qr", paths.qr),
  };
}
