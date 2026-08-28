export const PARKING_SLOT_VEHICLE_TYPES = {
  TWO_WHEELER: "two_wheeler",
  FOUR_WHEELER: "four_wheeler",
  VAN_MINIBUS: "van_minibus",
  HEAVY_VEHICLE: "heavy_vehicle",
} as const;

export const PARKING_SLOT_VEHICLE_TYPE_VALUES = Object.values(
  PARKING_SLOT_VEHICLE_TYPES,
);

export type ParkingSlotVehicleType =
  (typeof PARKING_SLOT_VEHICLE_TYPES)[keyof typeof PARKING_SLOT_VEHICLE_TYPES];

export const PARKING_SLOT_STATUS = {
  AVAILABLE: "available",
  MAINTENANCE: "maintenance",
  INACTIVE: "inactive",
} as const;

export const PARKING_SLOT_STATUS_VALUES = Object.values(
  PARKING_SLOT_STATUS,
);

export type ParkingSlotStatus =
  (typeof PARKING_SLOT_STATUS)[keyof typeof PARKING_SLOT_STATUS];