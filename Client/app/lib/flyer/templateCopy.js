import { cleanText } from "./format";

export const TEXT_FIELDS_BY_TEMPLATE = {
  showcase: [
    {
      key: "headline",
      label: "Info Card Title",
      defaultValue: "New Home For Sale",
      defaultSize: 44,
    },
    {
      key: "sectionTitle",
      label: "Section Title",
      defaultValue: "Property Overview",
      defaultSize: 32,
    },
    {
      key: "agentRole",
      label: "Agent Role",
      defaultValue: "Residential Specialist",
      defaultSize: 14,
    },
  ],

  gallery: [
    {
      key: "priceLabel",
      label: "Price Label",
      defaultValue: "Offered at",
      defaultSize: 20,
    },
    {
      key: "headlineScript",
      label: "Headline Script",
      defaultValue: "New",
      defaultSize: 100,
    },
    {
      key: "headlineMain",
      label: "Headline Main",
      defaultValue: "Listing",
      defaultSize: 70,
    },
    {
      key: "propertyTitle",
      label: "Property Section Title",
      defaultValue: "The Property",
      defaultSize: 46,
    },
    {
      key: "agentRole",
      label: "Agent Role",
      defaultValue: "Residential Specialist",
      defaultSize: 14,
    },
  ],

  modern: [
    {
      key: "headlineSmall",
      label: "Headline Small",
      defaultValue: "Modern Home",
      defaultSize: 64,
    },
    {
      key: "headlineLarge",
      label: "Headline Large",
      defaultValue: "For Sale",
      defaultSize: 78,
    },
    {
      key: "tagline",
      label: "Tagline",
      defaultValue: "A Home That Fits Your Lifestyle",
      defaultSize: 32,
    },
    {
      key: "taglineBody",
      label: "Tagline Body",
      defaultValue:
        "Enjoy spacious interiors, modern touches, and a layout designed for convenience and comfort.",
      defaultSize: 19,
    },
    {
      key: "aboutTitle",
      label: "About Section Title",
      defaultValue: "About The Property",
      defaultSize: 30,
    },
    {
      key: "priceLabel",
      label: "Price Label",
      defaultValue: "Offered at",
      defaultSize: 30,
    },
    {
      key: "appointmentLabel",
      label: "Phone Label",
      defaultValue: "Call for Appointment",
      defaultSize: 12,
    },
    {
      key: "agentRole",
      label: "Agent Role",
      defaultValue: "Residential Specialist",
      defaultSize: 14,
    },
  ],
};

export function getTemplateCopyText(copy, field) {
  return cleanText(copy?.[field.key]?.text) || field.defaultValue;
}

export function getTemplateCopySize(copy, field) {
  return copy?.[field.key]?.size ?? field.defaultSize;
}
