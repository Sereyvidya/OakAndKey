import { create } from "zustand";
import { composeAddress, splitAddressParts } from "./address";

const initialFormData = {
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
  agentPhone: "",
  agentEmail: "",
  agentPhoto: null,
};

export const usePropertyStore = create((set) => ({
  formData: { ...initialFormData },
  images: [],

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
    }),
}));
