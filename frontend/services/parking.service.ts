import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";
import type { Parking } from "@/types/parking";

export interface ParkingDetailsResponse {
  parking: Parking;

  availability?: {
    available: boolean;
    [key: string]: unknown;
  };
}

export interface CreateParkingPayload {
  parkingName: string;
  description: string;
  parkingType: Parking["parkingType"];

  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;

  location: {
    latitude: number;
    longitude: number;
  };

  ownerName: string;
  contactNumber: string;
  parkingArea: number;

  facilities: string[];
  rules: string[];

  entryInstructions: string;

  bookingModes: {
    hourly: boolean;
    daily: boolean;
    monthly: boolean;
  };

  pricing: {
    currency: string;

    twoWheeler: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    fourWheeler: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    vanMinibus: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    heavyVehicle: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };
  };

  images: {
    url: string;
    publicId: string;
  }[];

  operatingHours: {
    open: string;
    close: string;
  };
}

export const createParking = async (
  payload: CreateParkingPayload,
): Promise<ApiResponse<Parking>> => {
  const response = await api.post<ApiResponse<Parking>>(
    "/parkings",
    payload,
  );

  return response.data;
};

export const getParkings = async (): Promise<ApiResponse<Parking[]>> => {
  const response = await api.get<ApiResponse<Parking[]>>("/parkings");

  return response.data;
};

export const getParking = async (
  parkingId: string,
): Promise<ApiResponse<ParkingDetailsResponse>> => {
  const response = await api.get<ApiResponse<ParkingDetailsResponse>>(
    `/parkings/${parkingId}`,
  );

  return response.data;
};