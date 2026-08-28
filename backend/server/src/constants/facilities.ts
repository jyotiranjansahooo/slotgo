export const FACILITY_VALUES = [
  "cctv",
  "securityGuard",
  "coveredParking",
  "evCharging",
  "lighting",
  "washroom",
  "drinkingWater",
  "valetParking",
  "disabledAccess",
  "carWash",
] as const;

export type Facility = (typeof FACILITY_VALUES)[number];