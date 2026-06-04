import {
  getListingValidationErrors,
  hasCompleteListingData,
  hasMinimumListingData,
} from "../listing/validation";

export function getFlyerValidationErrors({ formData = {}, images = [] }) {
  return getListingValidationErrors({ formData, images });
}

export function hasCompleteFlyerData({ formData, images }) {
  return hasCompleteListingData({ formData, images });
}

export function hasMinimumFlyerData({ formData, images }) {
  return hasMinimumListingData({ formData, images });
}
