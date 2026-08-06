export const AUTH = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 32,
  },

  ACCESS_TOKEN: {
    EXPIRES_IN: "15m",
  },

  REFRESH_TOKEN: {
    EXPIRES_IN: "7d",
  },
} as const;