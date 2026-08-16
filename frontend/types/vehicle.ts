export const VEHICLE_TYPES = {
  TWO_WHEELER: "twoWheeler",
  FOUR_WHEELER: "fourWheeler",
  VAN_MINIBUS: "vanMinibus",
  HEAVY_VEHICLE: "heavyVehicle",
} as const;

export type VehicleType =
  (typeof VEHICLE_TYPES)[keyof typeof VEHICLE_TYPES];

export interface Vehicle {
  _id: string;
  ownerId: string;

  vehicleType: VehicleType;

  registrationNumber: string;

  brand: string;

  vehicleModel: string;

  color: string;

  isDefault: boolean;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface CreateVehicleData {
  vehicleType: VehicleType;
  registrationNumber: string;
  brand: string;
  vehicleModel: string;
  color: string;
}

export interface UpdateVehicleData {
  vehicleType?: VehicleType;
  brand?: string;
  vehicleModel?: string;
  color?: string;
  isDefault?: boolean;
}