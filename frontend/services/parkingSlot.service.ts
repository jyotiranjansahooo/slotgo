import api from "@/lib/api";
import type { ParkingSlot } from "@/types/parkingSlot";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export async function getParkingSlots(
  parkingId: string,
): Promise<ParkingSlot[]> {
  const response = await api.get<ApiResponse<ParkingSlot[]>>(
    `/parkings/${parkingId}/slots`,
  );

  return response.data.data;
}

export async function getAvailableParkingSlots(
  parkingId: string,
): Promise<ParkingSlot[]> {
  const response = await api.get<ApiResponse<ParkingSlot[]>>(
    `/parkings/${parkingId}/slots/available`,
  );

  return response.data.data;
}

export async function createParkingSlot(
  parkingId: string,
  payload: {
    slotNumber: string;
    floor: string;
    capacity: number;
    supportedVehicleTypes: string[];
    displayOrder?: number;
    notes?: string;
  },
): Promise<ParkingSlot> {
  const response = await api.post<ApiResponse<ParkingSlot>>(
    `/parkings/${parkingId}/slots`,
    payload,
  );

  return response.data.data;
}

export async function deleteParkingSlot(
  parkingId: string,
  slotId: string,
): Promise<void> {
  await api.delete(`/parkings/${parkingId}/slots/slot/${slotId}`);
}