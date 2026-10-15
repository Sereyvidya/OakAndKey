import type { ListingForm, ListingImage } from "../types";
import {
  getListingValidationErrors,
  hasCompleteListingData,
  hasMinimumListingData,
} from "../listing/validation";

interface FlyerInput {
  formData?: Partial<ListingForm>;
  images?: ListingImage[];
}

export function getFlyerValidationErrors({
  formData = {},
  images = [],
}: FlyerInput) {
  return getListingValidationErrors({ formData, images });
}

export function hasCompleteFlyerData({ formData, images }: FlyerInput) {
  return hasCompleteListingData({ formData, images });
}

export function hasMinimumFlyerData({ formData, images }: FlyerInput) {
  return hasMinimumListingData({ formData, images });
}
