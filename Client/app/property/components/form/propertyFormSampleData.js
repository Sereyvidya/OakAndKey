export const SAMPLE_AUTOFILL_FORM = {
  propertyTitle: "Modern 4-Bedroom Family Home",
  address: "2716 Maple Grove Dr, Austin, TX",
  addressStreet: "2716 Maple Grove Dr",
  addressCity: "Austin",
  addressState: "TX",
  price: "485000",
  propertyType: "house",
  bedrooms: "4",
  bathrooms: "3",
  size: "2637",
  sizeUnit: "sqft",
  description:
    "Beautifully updated 4-bedroom, 3-bath home in North Austin with an open-concept living area, a large island kitchen, and abundant natural light. The primary suite includes a walk-in closet and spa-style bath, while the fenced backyard and covered patio are perfect for entertaining. Minutes from top schools, parks, and major commuter routes.",
  agentName: "John Carter",
  agentCompanyName: "Oak & Key",
  agentSocialLink: "oakandkey.com",
  agentPhone: "(512) 555-0147",
  agentEmail: "John.Carter@gmail.com",
};

export const SAMPLE_AUTOFILL = {
  formData: {
    ...SAMPLE_AUTOFILL_FORM,
    agentCompanyLogo: {
      name: "Default Logo",
      type: "default-svg-logo",
      preview: "__default_svg_logo__",
    },
    agentPhoto: {
      name: "headshot.jpg",
      preview: "/headshot.jpg",
    },
  },
  images: [
    {
      name: "dining.jpg",
      preview: "/dining.jpg",
    },
    {
      name: "entry.jpg",
      preview: "/entry.jpg",
    },
    {
      name: "lawn.jpg",
      preview: "/lawn.jpg",
    },
    {
      name: "living-room.jpg",
      preview: "/living-room.jpg",
    },
  ],
};
