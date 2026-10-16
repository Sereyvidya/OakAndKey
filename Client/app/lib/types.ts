import type { ErrorCode } from "./gemini/errors";

export type SizeUnit = "sqm" | "sqft";

/** An uploaded or sample image; `preview` is a data URL or public path. */
export interface ListingImage {
  name: string;
  /** A data URL (just picked) or a public storage URL (saved). */
  preview: string;
  type?: "default-svg-logo";
  /** Storage path once the image has been saved to the account. */
  path?: string;
}

export interface ListingForm {
  propertyTitle: string;
  address: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  price: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
  sizeUnit: SizeUnit;
  description: string;
  agentName: string;
  agentCompanyName: string;
  agentSocialLink: string;
  agentCompanyLogo: ListingImage | null;
  agentQrCode: ListingImage | null;
  agentPhone: string;
  agentEmail: string;
  agentPhoto: ListingImage | string | null;
}

export type FlyerTemplate = "showcase" | "gallery" | "modern";

export interface FlyerTheme {
  page: string;
  primary: string;
  secondary: string;
  surface: string;
  dark: string;
  darkAlt: string;
  beige: string;
  textMain: string;
  textBody: string;
  textSection: string;
  mutedBg: string;
  white: string;
  black: string;
}

export interface FlyerViewModel {
  address: string;
  fullAddress: string;
  description: string;
  priceText: string;
  beds: number | null;
  baths: number | null;
  size: number | null;
  sizeUnit: SizeUnit;
  gallery: string[];
  hero: string;
  galleryPhotos: string[];
  agentName: string;
  agentCompanyName: string;
  socialLink: string;
  phone: string;
  email: string;
  agentPhoto: string;
  companyLogo: string;
  isDefaultLogo: boolean;
  qrSrc: string;
}

export interface CaptionVariant {
  name: string;
  caption: string;
  hashtags: string[];
  note: string;
}

export interface CaptionRequest {
  formData: Partial<ListingForm>;
  images: Pick<ListingImage, "name" | "preview">[];
}

export type CaptionResponse = { variants: CaptionVariant[] } | ApiError;

/** Error body returned by the Gemini-backed routes; `error` is already user-friendly. */
export interface ApiError {
  error: string;
  code: ErrorCode;
}

export interface DescriptionRequest {
  formData: Partial<ListingForm>;
  description: string;
}

export type DescriptionResponse = { description: string } | ApiError;

/** The subset of Gemini's generateContent response these routes read. */
export interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
  }[];
}

/** User overrides for a template's editable text, keyed by field key. */
export type TemplateFieldCopy = Record<
  string,
  { text?: string; size?: number }
>;
export type TemplateCopyState = Partial<
  Record<FlyerTemplate, TemplateFieldCopy>
>;

export interface FlyerTemplateProps {
  formData: ListingForm;
  images: ListingImage[];
  theme?: FlyerTheme;
  templateCopy?: TemplateCopyState;
}

/** An agent's reusable details, saved once and applied to every listing. */
export interface AgentProfile {
  agentName: string;
  agentCompanyName: string;
  agentSocialLink: string;
  agentPhone: string;
  agentEmail: string;
  agentCompanyLogo: ListingImage | null;
  agentPhoto: ListingImage | null;
  agentQrCode: ListingImage | null;
}

/** A listing as shown in the "My listings" grid. */
export interface ListingSummary {
  id: string;
  title: string;
  price: string;
  address: string;
  /** Public URL of the first photo, if any. */
  cover: string;
  updatedAt: string;
}

/** A fully loaded saved listing. */
export interface SavedListing {
  id: string;
  /**
   * Text fields only. Uploaded logo/photo/QR live on the agent profile; just
   * the built-in default logo marker is kept here.
   */
  form: Omit<ListingForm, "agentCompanyLogo" | "agentQrCode" | "agentPhoto"> &
    Partial<Pick<ListingForm, "agentCompanyLogo">>;
  images: ListingImage[];
}
