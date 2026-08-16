import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";
import type { ParkingSlot } from "@/types/parking-slot";

export const getParkingSlots = async (
  parkingId: string,
): Promise<ApiResponse<ParkingSlot[]>> => {
  const response =
    await api.get<ApiResponse<ParkingSlot[]>>(
      `/parking-slots/${parkingId}`,
    );

  return response.data;
};

export const getAvailableParkingSlots =
  async (
    parkingId: string,
  ): Promise<ApiResponse<ParkingSlot[]>> => {
    const response =
      await api.get<ApiResponse<ParkingSlot[]>>(
        `/parking-slots/${parkingId}/available`,
      );

    return response.data;
  };