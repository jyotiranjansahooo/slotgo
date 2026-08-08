export const VEHICLE_TYPES = {
  TWO_WHEELER: "twoWheeler",
  FOUR_WHEELER: "fourWheeler",
  VAN_MINIBUS: "vanMinibus",
  HEAVY_VEHICLE: "heavyVehicle",
} as const;

export type VehicleType =
  (typeof VEHICLE_TYPES)[keyof typeof VEHICLE_TYPES];

export const VEHICLE_TYPE_VALUES = [
  VEHICLE_TYPES.TWO_WHEELER,
  VEHICLE_TYPES.FOUR_WHEELER,
  VEHICLE_TYPES.VAN_MINIBUS,
  VEHICLE_TYPES.HEAVY_VEHICLE,
] as const;

export const VEHICLE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
} as const;

export type VehicleStatus =
  (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

export const VEHICLE_STATUS_VALUES = [
  VEHICLE_STATUS.ACTIVE,
  VEHICLE_STATUS.INACTIVE,
  VEHICLE_STATUS.BLOCKED,
] as const;