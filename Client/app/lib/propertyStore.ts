import { create } from "zustand";
import { composeAddress, splitAddressParts } from "./address";
import type { ListingForm, ListingImage } from "./types";

const initialFormData: ListingForm = {
  propertyTitle: "",
  address: "",
  addressStreet: "",
  addressCity: "",
  addressState: "",
  price: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  size: "",
  sizeUnit: "sqm",
  description: "",
  agentName: "",
  agentCompanyName: "",
  agentSocialLink: "",
  agentCompanyLogo: null,
  agentQrCode: null,
  agentPhone: "",
  agentEmail: "",
  agentPhoto: null,
};

interface PropertyState {
  formData: ListingForm;
  images: ListingImage[];
  /** Id of the saved listing being edited; null for a new, unsaved one. */
  currentListingId: string | null;
  setCurrentListingId: (id: string | null) => void;
  /** Replaces the whole working listing (used when opening a saved one). */
  loadListing: (listing: {
    id: string | null;
    formData: Partial<ListingForm>;
    images: ListingImage[];
  }) => void;
  setFormData: (partial: Partial<ListingForm>) => void;
  setImages: (images: ListingImage[]) => void;
  addImages: (newImages: ListingImage[]) => void;
  removeImage: (index: number) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  reset: () => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  formData: { ...initialFormData },
  images: [],
  currentListingId: null,

  setCurrentListingId: (id) => set({ currentListingId: id }),

  loadListing: ({ id, formData, images }) =>
    set({
      currentListingId: id,
      formData: { ...initialFormData, ...formData },
      images,
    }),

  setFormData: (partial) =>
    set((state) => {
      const merged = { ...state.formData, ...partial };

      const hasAddress = "address" in partial;
      const hasAddressParts =
        "addressStreet" in partial ||
        "addressCity" in partial ||
        "addressState" in partial;

      if (hasAddress && !hasAddressParts) {
        const { street, city, state } = splitAddressParts(merged.address);

        merged.addressStreet = street;
        merged.addressCity = city;
        merged.addressState = state.toUpperCase();
      }

      if (hasAddressParts) {
        merged.address = composeAddress(
          merged.addressStreet,
          merged.addressCity,
          merged.addressState
        );
      }

      merged.addressState = String(merged.addressState || "")
        .trim()
        .toUpperCase();

      return { formData: merged };
    }),

  setImages: (images) => set({ images }),

  addImages: (newImages) =>
    set((state) => ({ images: [...state.images, ...newImages] })),

  removeImage: (index) =>
    set((state) => ({ images: state.images.filter((_, i) => i !== index) })),

  reorderImages: (fromIndex, toIndex) =>
    set((state) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.images.length ||
        toIndex >= state.images.length
      ) {
        return state;
      }

      const nextImages = [...state.images];
      const [movedImage] = nextImages.splice(fromIndex, 1);

      nextImages.splice(toIndex, 0, movedImage);

      return { images: nextImages };
    }),

  reset: () =>
    set({
      formData: { ...initialFormData },
      images: [],
      currentListingId: null,
    }),
}));
