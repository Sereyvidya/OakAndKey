import { create } from "zustand";

function splitAddressParts(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return { addressStreet: "", addressCity: "", addressState: "" };

  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const state = (parts.pop() || "").toUpperCase();
    const city = parts.pop() || "";
    const street = parts.join(", ");
    return { addressStreet: street, addressCity: city, addressState: state };
  }
  if (parts.length === 2) {
    return { addressStreet: parts[0], addressCity: parts[1], addressState: "" };
  }
  return { addressStreet: parts[0] || "", addressCity: "", addressState: "" };
}

function composeAddress(street = "", city = "", state = "") {
  return [street, city, state]
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .join(", ");
}

export const usePropertyStore = create((set) => ({
  formData: {
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
  },
  images: [], // store previews/base64 strings, not File objects

  setFormData: (partial) =>
    set((state) => {
      const merged = { ...state.formData, ...partial };
      const hasAddress = Object.prototype.hasOwnProperty.call(partial, "address");
      const hasAddressParts =
        Object.prototype.hasOwnProperty.call(partial, "addressStreet") ||
        Object.prototype.hasOwnProperty.call(partial, "addressCity") ||
        Object.prototype.hasOwnProperty.call(partial, "addressState");

      if (hasAddress && !hasAddressParts) {
        const parsed = splitAddressParts(merged.address);
        merged.addressStreet = parsed.addressStreet;
        merged.addressCity = parsed.addressCity;
        merged.addressState = parsed.addressState;
        merged.address = composeAddress(
          parsed.addressStreet,
          parsed.addressCity,
          parsed.addressState
        );
      } else if (hasAddressParts || hasAddress) {
        merged.addressStreet = String(merged.addressStreet || "").trim();
        merged.addressCity = String(merged.addressCity || "").trim();
        merged.addressState = String(merged.addressState || "")
          .trim()
          .toUpperCase();
        merged.address = composeAddress(
          merged.addressStreet,
          merged.addressCity,
          merged.addressState
        );
      }

      return { formData: merged };
    }),

  setImages: (images) => set({ images }),

  addImages: (newImages) =>
    set((state) => ({ images: [...state.images, ...newImages] })),

  removeImage: (index) =>
    set((state) => ({ images: state.images.filter((_, i) => i !== index) })),

  reset: () =>
    set({
      formData: {
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
      },
      images: [],
    }),
}));
