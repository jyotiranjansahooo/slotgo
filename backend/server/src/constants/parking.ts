export const PARKING_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const PARKING_FACILITIES = {
  CCTV: "cctv",

  SECURITY_GUARD: "securityGuard",

  COVERED: "covered",

  OPEN: "open",

  LIGHTING: "lighting",

  WASHROOM: "washroom",

  CAR_WASH: "carWash",

  DISABLED_ACCESS: "disabledAccess",
} as const;

export const PARKING_TYPES = {
  OPEN: "open",

  COVERED: "covered",

  BASEMENT: "basement",

  MULTI_LEVEL: "multiLevel",

  STREET: "street",
} as const;

export const PARKING_TYPE_VALUES = Object.values(PARKING_TYPES);

export const PARKING_FACILITY_VALUES = Object.values(PARKING_FACILITIES);

export type ParkingStatus =
  (typeof PARKING_STATUS)[keyof typeof PARKING_STATUS];

export const PARKING_STATUS_VALUES = Object.values(PARKING_STATUS);
