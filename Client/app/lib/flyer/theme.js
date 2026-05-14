export const FLYER_COLORS = {
  page: "#ffffff",

  primary: "#191d24",
  secondary: "#beb491",
  surface: "#ffffff",

  dark: "#191d24",
  darkAlt: "#171c24",
  beige: "#beb491",

  textMain: "#141414",
  textBody: "#2e3138",
  textSection: "#1c1f26",
  mutedBg: "#ececec",
  white: "#ffffff",
  black: "#000000",
};

export const FLYER_THEME_PRESETS = {
  classic: {
    name: "Classic Beige",
    colors: {
      primary: "#191d24",
      secondary: "#beb491",
      surface: "#ffffff",
    },
  },

  emeraldGold: {
    name: "Emerald Gold",
    colors: {
      primary: "#17382f",
      secondary: "#c6a15b",
      surface: "#fffaf0",
    },
  },

  navyCopper: {
    name: "Navy Copper",
    colors: {
      primary: "#10233f",
      secondary: "#c97945",
      surface: "#f8f3ed",
    },
  },

  charcoalSage: {
    name: "Charcoal Sage",
    colors: {
      primary: "#20252b",
      secondary: "#9caf88",
      surface: "#f7f5ef",
    },
  },

  burgundyCream: {
    name: "Burgundy Cream",
    colors: {
      primary: "#4a1720",
      secondary: "#d6b36a",
      surface: "#fff8e8",
    },
  },

  forestIvory: {
    name: "Forest Ivory",
    colors: {
      primary: "#1f3a2e",
      secondary: "#e2c16f",
      surface: "#fbf6e8",
    },
  },

  slateTerracotta: {
    name: "Slate Terracotta",
    colors: {
      primary: "#263238",
      secondary: "#c86b4f",
      surface: "#f6efe7",
    },
  },

  midnightAqua: {
    name: "Midnight Aqua",
    colors: {
      primary: "#111827",
      secondary: "#18b7b9",
      surface: "#f5f7f6",
    },
  },

  plumChampagne: {
    name: "Plum Champagne",
    colors: {
      primary: "#2d1f36",
      secondary: "#d8b76e",
      surface: "#faf5ee",
    },
  },
};

export function buildFlyerTheme(presetKey = "classic", customColors = {}) {
  const preset = FLYER_THEME_PRESETS[presetKey] || FLYER_THEME_PRESETS.classic;

  return {
    ...FLYER_COLORS,
    ...preset.colors,
    ...customColors,
  };
}
