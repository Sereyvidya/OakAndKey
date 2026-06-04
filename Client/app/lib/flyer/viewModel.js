import {
  cleanText,
  formatCurrency,
  joinParts,
  pickSrc,
  toNumber,
} from "../listing/format";

export function buildFlyerViewModel(formData = {}, images = [], options = {}) {
  const address = joinParts([formData.addressCity, formData.addressState]);
  const fullAddress = cleanText(formData.address) || address;
  const description =
    cleanText(formData.description) ||
    options.defaultDescription ||
    "Beautifully updated residence with open living spaces, refined finishes, and a layout designed for modern everyday living.";
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
    sizeUnit: formData.sizeUnit,
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
    qrSrc: socialLink
      ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
          socialLink
        )}`
      : "",
  };
}
