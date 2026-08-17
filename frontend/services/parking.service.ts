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
