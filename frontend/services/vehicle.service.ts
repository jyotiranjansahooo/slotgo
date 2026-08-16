import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";

import type {
  CreateVehicleData,
  UpdateVehicleData,
  Vehicle,
} from "@/types/vehicle";
export const createVehicle = async (
  data: CreateVehicleData,
): Promise<ApiResponse<Vehicle>> => {
  const response = await api.post<ApiResponse<Vehicle>>("/vehicles", data);

  return response.data;
};

export const getMyVehicles = async (): Promise<ApiResponse<Vehicle[]>> => {
  const response = await api.get<ApiResponse<Vehicle[]>>("/vehicles");

  return response.data;
};

export const getVehicle = async (
  vehicleId: string,
): Promise<ApiResponse<Vehicle>> => {
  const response = await api.get<ApiResponse<Vehicle>>(
    `/vehicles/${vehicleId}`,
  );

  return response.data;
};

export const updateVehicle = async (
  vehicleId: string,
  data: UpdateVehicleData,
): Promise<ApiResponse<Vehicle>> => {
  const response = await api.patch<ApiResponse<Vehicle>>(
    `/vehicles/${vehicleId}`,
    data,
  );

  return response.data;
};

export const setDefaultVehicle = async (
  vehicleId: string,
): Promise<ApiResponse<Vehicle>> => {
  const response = await api.patch<ApiResponse<Vehicle>>(
    `/vehicles/${vehicleId}/default`,
  );

  return response.data;
};

export const deleteVehicle = async (
  vehicleId: string,
): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(
    `/vehicles/${vehicleId}`,
  );

  return response.data;
};
