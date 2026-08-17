import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";

export interface ParkingBookingBlock {
  _id: string;
  parkingId: string;
  createdBy: string;
  startTime: string;
  endTime: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParkingBookingBlockData {
  startTime: string;
  endTime: string;
  reason?: string;
}

export const createParkingBookingBlock = async (
  parkingId: string,
  data: CreateParkingBookingBlockData,
): Promise<ApiResponse<ParkingBookingBlock>> => {
  const response = await api.post<ApiResponse<ParkingBookingBlock>>(
    `/parking-booking-blocks/${parkingId}`,
    data,
  );

  return response.data;
};

export const getParkingBookingBlocks = async (
  parkingId: string,
): Promise<ApiResponse<ParkingBookingBlock[]>> => {
  const response = await api.get<ApiResponse<ParkingBookingBlock[]>>(
    `/parking-booking-blocks/${parkingId}`,
  );

  return response.data;
};

export const deleteParkingBookingBlock = async (
 blockId: string,
): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(
    `/parking-booking-blocks/block/${blockId}`,
  );

  return response.data;
};