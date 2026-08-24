export const PARKING_TYPES = {
  OPEN: "open",
  COVERED: "covered",
  BASEMENT: "basement",
  MULTI_LEVEL: "multiLevel",
  STREET: "street",
} as const;

export type ParkingType = (typeof PARKING_TYPES)[keyof typeof PARKING_TYPES];

export interface ParkingLocation {
  latitude: number;
  longitude: number;
}

export interface VehiclePricing {
  hourly?: number;
  daily?: number;
  monthly?: number;
}

export interface ParkingPricing {
  currency: string;
  twoWheeler: VehiclePricing;
  fourWheeler: VehiclePricing;
  vanMinibus: VehiclePricing;
  heavyVehicle: VehiclePricing;
}

export interface ParkingImage {
  url: string;
  publicId: string;
}

export interface OperatingHours {
  open: string;
  close: string;
}

export interface BookingModes {
  hourly: boolean;
  daily: boolean;
  monthly: boolean;
}

export interface Parking {
  _id: string;
  ownerId: string;

  parkingName: string;
  description: string;

  parkingType: ParkingType;

  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;

  location: {
    latitude: number;
    longitude: number;
  };

  ownerName?: string;
  contactNumber?: string;

  parkingArea?: number;

  facilities: string[];
  rules: string[];

  entryInstructions: string;

  bookingModes: BookingModes;

  pricing: ParkingPricing;

  images: ParkingImage[];

  operatingHours: {
    open: string;
    close: string;
  };

  averageRating: number;
  totalReviews: number;

  status: "pending" | "approved" | "rejected";

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ParkingDetails {
  parking: Parking;
  availability: Record<string, unknown>;
}

export interface ParkingDetailsResponse {
  parking: Parking;
  availability: Record<string, unknown>;
}
