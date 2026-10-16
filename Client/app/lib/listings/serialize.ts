import type {
  AgentProfile,
  ListingForm,
  ListingImage,
  ListingSummary,
  SavedListing,
} from "../types";

/** Image-valued form fields live on the agent profile, not in the listing row. */
const PROFILE_ASSET_KEYS = [
  "agentCompanyLogo",
  "agentQrCode",
  "agentPhoto",
] as const;

export type StoredForm = SavedListing["form"];

/** The text fields of a listing, safe to store as JSON (no image blobs). */
export function formToStored(form: ListingForm): StoredForm {
  const stored: Partial<ListingForm> = { ...form };
  for (const key of PROFILE_ASSET_KEYS) delete stored[key];
  // The built-in default logo is just a marker (no image data), so it stays
  // with the listing; otherwise reopening would lose the agent's choice.
  if (form.agentCompanyLogo?.type === "default-svg-logo") {
    stored.agentCompanyLogo = form.agentCompanyLogo;
  }
  return stored as StoredForm;
}

export interface ListingRow {
  id: string;
  title: string;
  form: StoredForm;
  images: { name: string; path: string }[];
  updated_at: string;
}

/** `{name, path}` pairs for the images that are already in storage. */
export function imagesToStored(
  images: ListingImage[]
): { name: string; path: string }[] {
  return images.flatMap((img) =>
    img.path ? [{ name: img.name, path: img.path }] : []
  );
}

export function rowToSaved(
  row: ListingRow,
  urlFor: (path: string) => string
): SavedListing {
  return {
    id: row.id,
    form: row.form,
    images: (row.images ?? []).map((img) => ({
      name: img.name,
      path: img.path,
      preview: urlFor(img.path),
    })),
  };
}

export function rowToSummary(
  row: ListingRow,
  urlFor: (path: string) => string
): ListingSummary {
  const first = row.images?.[0];
  return {
    id: row.id,
    title: row.title || "Untitled listing",
    price: String(row.form?.price ?? ""),
    address: String(row.form?.address ?? ""),
    cover: first ? urlFor(first.path) : "",
    updatedAt: row.updated_at,
  };
}

export interface ProfileRow {
  agent_name: string;
  company_name: string;
  social_link: string;
  phone: string;
  email: string;
  logo_path: string | null;
  photo_path: string | null;
  qr_path: string | null;
}

export function profileToRow(
  profile: Pick<
    AgentProfile,
    | "agentName"
    | "agentCompanyName"
    | "agentSocialLink"
    | "agentPhone"
    | "agentEmail"
  >,
  paths: { logo: string | null; photo: string | null; qr: string | null }
): ProfileRow {
  return {
    agent_name: profile.agentName,
    company_name: profile.agentCompanyName,
    social_link: profile.agentSocialLink,
    phone: profile.agentPhone,
    email: profile.agentEmail,
    logo_path: paths.logo,
    photo_path: paths.photo,
    qr_path: paths.qr,
  };
}

export function rowToProfile(
  row: ProfileRow,
  urlFor: (path: string) => string
): AgentProfile {
  const asset = (name: string, path: string | null): ListingImage | null =>
    path ? { name, path, preview: urlFor(path) } : null;
  return {
    agentName: row.agent_name,
    agentCompanyName: row.company_name,
    agentSocialLink: row.social_link,
    agentPhone: row.phone,
    agentEmail: row.email,
    agentCompanyLogo: asset("logo", row.logo_path),
    agentPhoto: asset("photo", row.photo_path),
    agentQrCode: asset("qr", row.qr_path),
  };
}

/**
 * Fills the agent fields of `form` from the saved profile, but only where the
 * form is still empty: it never overwrites what the agent has typed.
 */
export function applyProfileToForm(
  profile: AgentProfile,
  form: ListingForm
): Partial<ListingForm> {
  const patch: Partial<ListingForm> = {};
  const textKeys = [
    "agentName",
    "agentCompanyName",
    "agentSocialLink",
    "agentPhone",
    "agentEmail",
  ] as const;
  for (const key of textKeys) {
    if (!form[key].trim() && profile[key]) patch[key] = profile[key];
  }
  if (!form.agentCompanyLogo && profile.agentCompanyLogo) {
    patch.agentCompanyLogo = profile.agentCompanyLogo;
  }
  if (!form.agentPhoto && profile.agentPhoto) {
    patch.agentPhoto = profile.agentPhoto;
  }
  if (!form.agentQrCode && profile.agentQrCode) {
    patch.agentQrCode = profile.agentQrCode;
  }
  return patch;
}
