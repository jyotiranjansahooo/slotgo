export const SLOT_STATUS = {
  AVAILABLE: "available",

  RESERVED: "reserved",

  OCCUPIED: "occupied",

  MAINTENANCE: "maintenance",
} as const;

export type SlotStatus =
  (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS];

export const SLOT_STATUS_VALUES =
  Object.values(SLOT_STATUS);