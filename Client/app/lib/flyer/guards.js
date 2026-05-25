import { composeAddress, splitAddressParts } from "../address";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORTED_RESIDENTIAL_TYPES = new Set(["house", "condo"]);
const TITLE_MAX_CHARS = 35;

function normalizePhone(value = "") {
  return value.replace(/[^\d+]/g, "");
}

function isValidPhone(value = "") {
  const v = normalizePhone(value);
  if (!v) return false;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 9;
}

export function getFlyerValidationErrors({ formData = {}, images = [] }) {
  const errors = {};

  const title = (formData.propertyTitle || "").trim();
  const fallbackAddressParts = splitAddressParts(formData.address || "");
  const street = (
    formData.addressStreet ??
    fallbackAddressParts.street ??
    ""
  ).trim();
  const city = (formData.addressCity ?? fallbackAddressParts.city ?? "").trim();
  const state = (
    formData.addressState ??
    fallbackAddressParts.state ??
    ""
  ).trim();
  const address = composeAddress(street, city, state);

  const type = (formData.propertyType || "").trim();
  const description = (formData.description || "").trim();

  if (!title) errors.propertyTitle = "Property title is required.";
  else if (title.length < 6)
    errors.propertyTitle = "Title should be at least 6 characters.";
  else if (title.length > TITLE_MAX_CHARS)
    errors.propertyTitle = "Title is too long.";

  if (!street || !city || !state)
    errors.address = "Street, city, and state are required.";
  else if (address.length < 6)
    errors.address = "Address should be more specific.";

  const cleanedPrice = String(formData.price ?? "").replace(/[,\s]/g, "");
  const priceNum = Number(cleanedPrice);
  if (
    formData.price === "" ||
    formData.price === null ||
    formData.price === undefined
  ) {
    errors.price = "Price is required.";
  } else if (Number.isNaN(priceNum) || priceNum <= 0) {
    errors.price = "Price must be greater than 0.";
  }

  if (!type) errors.propertyType = "Property type is required.";
  else if (!SUPPORTED_RESIDENTIAL_TYPES.has(type))
    errors.propertyType = "Only House and Condo are supported.";

  const beds = formData.bedrooms === "" ? null : Number(formData.bedrooms);
  const baths = formData.bathrooms === "" ? null : Number(formData.bathrooms);
  const size = formData.size === "" ? null : Number(formData.size);

  if (beds === null) errors.bedrooms = "Bedrooms are required.";
  else if (Number.isNaN(beds) || beds < 0)
    errors.bedrooms = "Invalid bedrooms.";

  if (baths === null) errors.bathrooms = "Bathrooms are required.";
  else if (Number.isNaN(baths) || baths < 0)
    errors.bathrooms = "Invalid bathrooms.";

  if (size === null) errors.size = "Size is required.";
  else if (Number.isNaN(size) || size < 0) errors.size = "Invalid size.";

  if (!description) errors.description = "Description is required.";
  else if (description.length < 20)
    errors.description = "Description is too short.";

  if (!images || images.length < 4)
    errors.images = "At least 4 photos are required.";

  if (!formData.agentName?.trim()) errors.agentName = "Agent name is required.";
  if (!formData.agentCompanyName?.trim())
    errors.agentCompanyName = "Company name is required.";
  if (!formData.agentSocialLink?.trim())
    errors.agentSocialLink = "Website is required.";

  if (!formData.agentPhone?.trim()) errors.agentPhone = "Phone is required.";
  else if (!isValidPhone(formData.agentPhone))
    errors.agentPhone = "Phone is invalid.";

  if (!formData.agentEmail?.trim()) errors.agentEmail = "Email is required.";
  else if (!emailRegex.test(formData.agentEmail))
    errors.agentEmail = "Email is invalid.";

  if (
    !formData.agentCompanyLogo?.preview &&
    formData.agentCompanyLogo?.type !== "default-svg-logo"
  ) {
    errors.agentCompanyLogo = "Company logo is required.";
  }

  const agentPhotoPreview =
    typeof formData.agentPhoto === "string"
      ? formData.agentPhoto
      : formData.agentPhoto?.preview || "";

  if (!agentPhotoPreview) errors.agentPhoto = "Agent photo is required.";

  return errors;
}

export function hasCompleteFlyerData({ formData, images }) {
  return (
    Object.keys(getFlyerValidationErrors({ formData, images })).length === 0
  );
}

export function hasMinimumFlyerData({ formData, images }) {
  return Boolean(
    formData?.propertyTitle?.trim() ||
    formData?.address?.trim() ||
    images?.length > 0
  );
}
