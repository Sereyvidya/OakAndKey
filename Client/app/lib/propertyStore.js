import { create } from "zustand";

const clean = (v) => String(v || "").trim();

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
  description: "",
  agentName: "",
  agentCompanyName: "",
  agentSocialLink: "",
  agentCompanyLogo: null,
  agentPhone: "",
  agentEmail: "",
  agentPhoto: null,
};

function splitAddressParts(value = "") {
  const raw = clean(value);
  if (!raw) return { addressStreet: "", addressCity: "", addressState: "" };

  const parts = raw.split(",").map(clean).filter(Boolean);

  if (parts.length >= 3) {
    const state = parts.pop().toUpperCase();
    const city = parts.pop();
    const street = parts.join(", ");
    return { addressStreet: street, addressCity: city, addressState: state };
  }

  if (parts.length === 2) {
    return { addressStreet: parts[0], addressCity: parts[1], addressState: "" };
  }

  return { addressStreet: parts[0] || "", addressCity: "", addressState: "" };
}

function composeAddress(street = "", city = "", state = "") {
  return [street, city, state].map(clean).filter(Boolean).join(", ");
}

export const usePropertyStore = create((set) => ({
  formData: initialFormData,
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
        Object.assign(merged, splitAddressParts(merged.address));
      } else {
        merged.addressStreet = clean(merged.addressStreet);
        merged.addressCity = clean(merged.addressCity);
        merged.addressState = clean(merged.addressState).toUpperCase();
      }

      merged.address = composeAddress(
        merged.addressStreet,
        merged.addressCity,
        merged.addressState
      );

      return { formData: merged };
    }),

  setImages: (images) => set({ images }),

  addImages: (newImages) =>
    set((state) => ({ images: [...state.images, ...newImages] })),

  removeImage: (index) =>
    set((state) => ({ images: state.images.filter((_, i) => i !== index) })),

  reorderImages: (fromIndex, toIndex) =>
    set((state) => {
      const nextImages = [...state.images];

      const [movedImage] = nextImages.splice(fromIndex, 1);

      nextImages.splice(toIndex, 0, movedImage);

      return { images: nextImages };
    }),

  reset: () =>
    set({
      formData: initialFormData,
      images: [],
    }),
}));
