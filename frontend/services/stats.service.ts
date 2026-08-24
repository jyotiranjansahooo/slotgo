import api from "@/lib/api";

export interface PlatformStats {
  parkingSpots: number;
  drivers: number;
  parkingOwners: number;
  vehicles: number;
}

export interface StatsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PlatformStats;
}

export const getPlatformStats = async (): Promise<StatsResponse> => {
  const response = await api.get<StatsResponse>("/stats");

  return response.data;
};