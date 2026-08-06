export const VEHICLE_TYPES = {
  TWO_WHEELER: "twoWheeler",
  FOUR_WHEELER: "fourWheeler",
  VAN_MINIBUS: "vanMinibus",
  HEAVY_VEHICLE: "heavyVehicle",
} as const;

export const VEHICLE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
} as const;

export type VehicleType = (typeof VEHICLE_TYPES)[keyof typeof VEHICLE_TYPES];
export type VehicleStatus = (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

export const VEHICLE_TYPE_VALUES = Object.values(VEHICLE_TYPES);
