import type { FlyerViewModel, ListingForm, ListingImage } from "../types";
import type { Lang } from "../i18n/strings";
import { DEFAULT_DESCRIPTION } from "./labels";
import {
  cleanText,
  formatCurrency,
  joinParts,
  pickSrc,
  toNumber,
} from "../listing/format";

export function buildFlyerViewModel(
  formData: Partial<ListingForm> = {},
  images: ListingImage[] = [],
  options: { defaultDescription?: string; lang?: Lang } = {}
): FlyerViewModel {
  const address = joinParts([formData.addressCity, formData.addressState]);
  const fullAddress = cleanText(formData.address) || address;
  const description =
    cleanText(formData.description) ||
    options.defaultDescription ||
    DEFAULT_DESCRIPTION[options.lang ?? "en"];
  const priceText = formatCurrency(formData.price) || "Contact for price";

  const gallery = (images || []).map(pickSrc).filter(Boolean);
  const socialLink = cleanText(formData.agentSocialLink);

  return {
    address,
    fullAddress,
    description,
    priceText,
    beds: toNumber(formData.bedrooms),
    baths: toNumber(formData.bathrooms),
    size: toNumber(formData.size),
    sizeUnit: formData.sizeUnit ?? "sqm",
    gallery,
    hero: gallery[0] || "",
    galleryPhotos: gallery.slice(1, 7),
    agentName: cleanText(formData.agentName) || "Listing Agent",
    agentCompanyName: cleanText(formData.agentCompanyName),
    socialLink,
    phone: cleanText(formData.agentPhone),
    email: cleanText(formData.agentEmail),
    agentPhoto: pickSrc(formData.agentPhoto),
    companyLogo: pickSrc(formData.agentCompanyLogo),
    isDefaultLogo: formData.agentCompanyLogo?.type === "default-svg-logo",
    qrSrc:
      pickSrc(formData.agentQrCode) ||
      (socialLink
        ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
            socialLink
          )}`
        : ""),
  };
}
