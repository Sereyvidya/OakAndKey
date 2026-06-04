import { composeAddress, splitAddressParts } from "../address";
import { supportedResidentialTypes, TITLE_MAX_CHARS } from "./constants";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value = "") {
  return value.replace(/[^\d+]/g, "");
}

function isValidPhone(value = "") {
  const normalized = normalizePhone(value);
  if (!normalized) return false;
  return normalized.replace(/\D/g, "").length >= 9;
}

export function getListingValidationErrors({ formData = {}, images = [] }) {
  const errors = {};

  const title = (formData.propertyTitle || "").trim();
  const fallbackAddressParts = splitAddressParts(formData.address || "");
  const street = (
    formData.addressStreet ??
    fallbackAddressParts.addressStreet ??
    ""
  ).trim();
  const city = (
    formData.addressCity ??
    fallbackAddressParts.addressCity ??
    ""
  ).trim();
  const state = (
    formData.addressState ??
    fallbackAddressParts.addressState ??
    ""
  ).trim();
  const address = composeAddress(street, city, state);
  const type = (formData.propertyType || "").trim();
  const agentName = (formData.agentName || "").trim();
  const companyName = (formData.agentCompanyName || "").trim();
  const socialLink = (formData.agentSocialLink || "").trim();
  const phone = (formData.agentPhone || "").trim();
  const email = (formData.agentEmail || "").trim();
  const description = (formData.description || "").trim();

  if (!title) errors.propertyTitle = "Property title is required.";
  else if (title.length < 6)
    errors.propertyTitle = "Title should be at least 6 characters.";
  else if (title.length > TITLE_MAX_CHARS)
    errors.propertyTitle = `Title must be ${TITLE_MAX_CHARS} characters or less for flyers.`;

  if (!street || !city || !state) {
    errors.address = "Street, city, and state are required.";
  } else if (address.length < 6) {
    errors.address = "Address should be more specific.";
  }

  const priceRaw = formData.price;
  const cleanedPrice = String(priceRaw ?? "").replace(/[,\s]/g, "");
  const priceNum = Number(cleanedPrice);
  if (priceRaw === "" || priceRaw === null || priceRaw === undefined) {
    errors.price = "Price is required.";
  } else if (Number.isNaN(priceNum) || priceNum <= 0) {
    errors.price = "Price must be a number greater than 0.";
  }

  if (!type) errors.propertyType = "Please select a residential property type.";
  else if (!supportedResidentialTypes.has(type)) {
    errors.propertyType = "Only House and Condo are supported right now.";
  }

  const beds = formData.bedrooms === "" ? null : Number(formData.bedrooms);
  const baths = formData.bathrooms === "" ? null : Number(formData.bathrooms);
  const size = formData.size === "" ? null : Number(formData.size);

  if (beds === null) errors.bedrooms = "Bedrooms are required.";
  else if (Number.isNaN(beds) || beds < 0)
    errors.bedrooms = "Must be 0 or more.";

  if (baths === null) errors.bathrooms = "Bathrooms are required.";
  else if (Number.isNaN(baths) || baths < 0)
    errors.bathrooms = "Must be 0 or more.";

  if (size === null) errors.size = "Size is required.";
  else if (Number.isNaN(size) || size < 0) errors.size = "Must be 0 or more.";

  if (!description) errors.description = "Description is required.";
  else if (description.length < 20)
    errors.description = "Description should be at least 20 characters.";

  if (!images || images.length < 4) {
    errors.images = "Please upload at least 4 property photos.";
  }

  if (!agentName) errors.agentName = "Agent name is required.";
  if (!companyName) errors.agentCompanyName = "Company name is required.";
  if (!socialLink)
    errors.agentSocialLink = "Social or website link is required.";

  if (!phone) {
    errors.agentPhone = "Phone number is required.";
  } else if (!isValidPhone(phone)) {
    errors.agentPhone = "Phone number looks too short.";
  }

  if (!email) {
    errors.agentEmail = "Email is required.";
  } else if (!emailRegex.test(email)) {
    errors.agentEmail = "Please enter a valid email address.";
  }

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

  if (!agentPhotoPreview) {
    errors.agentPhoto = "Agent photo is required.";
  }

  return errors;
}

export function hasCompleteListingData({ formData, images }) {
  return (
    Object.keys(getListingValidationErrors({ formData, images })).length === 0
  );
}

export function hasMinimumListingData({ formData, images }) {
  return Boolean(
    formData?.propertyTitle?.trim() ||
      formData?.address?.trim() ||
      formData?.addressStreet?.trim() ||
      formData?.addressCity?.trim() ||
      formData?.addressState?.trim() ||
      images?.length > 0
  );
}
