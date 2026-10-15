import { SAMPLE_AUTOFILL } from "@/app/property/components/form/propertyFormSampleData";
import type { ListingForm, ListingImage } from "@/app/lib/types";

/** A fully valid listing, built from the app's own sample data. */
export const validForm = {
  ...SAMPLE_AUTOFILL.formData,
} as ListingForm;

export const validImages: ListingImage[] = [...SAMPLE_AUTOFILL.images];
