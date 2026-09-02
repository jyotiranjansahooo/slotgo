import api from "@/lib/api";
import type { Parking, VehicleType } from "@/types/parking";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface VehiclePricing {
  hourly?: number;
  daily?: number;
  monthly?: number;
}

export interface CreateParkingPayload {
  parkingName: string;
  description?: string;
  parkingType: string;

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

  supportedVehicleTypes: VehicleType[];

  facilities: string[];
  rules: string[];
  entryInstructions?: string;

  bookingModes: {
    hourly: boolean;
    daily: boolean;
    monthly: boolean;
  };

  pricing: {
    currency: string;
    twoWheeler: VehiclePricing;
    fourWheeler: VehiclePricing;
    vanMinibus: VehiclePricing;
    heavyVehicle: VehiclePricing;
  };

  operatingHours: {
    open: string;
    close: string;
  };
}

export interface UpdateParkingPayload extends CreateParkingPayload {
  removeImagePublicIds?: string[];
}

export type ParkingAction = "temporary-close" | "delete";

export interface ParkingActionVerificationResponse {
  message: string;
}

export interface GetAvailableSlotsResponse {
  parkingId: string;
  vehicleType: VehicleType;
  totalAvailableSlots: number;
  slots: unknown[];
}

export async function getParkings(): Promise<Parking[]> {
  const response = await api.get<ApiResponse<Parking[]>>("/parkings");

  return response.data.data;
}

export async function getMyParkings(): Promise<Parking[]> {
  return getParkings();
}

export async function getParking(parkingId: string): Promise<Parking> {
  const response = await api.get<ApiResponse<Parking>>(
    `/parkings/${parkingId}`,
  );

  return response.data.data;
}

export async function getApprovedParkings(): Promise<Parking[]> {
  const response = await api.get<ApiResponse<Parking[]>>("/parking-discovery");

  return response.data.data;
}

export async function searchApprovedParkings(params?: {
  city?: string;
  parkingType?: string;
}): Promise<Parking[]> {
  const response = await api.get<ApiResponse<Parking[]>>(
    "/parking-discovery/search",
    {
      params,
    },
  );

  return response.data.data;
}

export async function getParkingDetails(parkingId: string): Promise<Parking> {
  const response = await api.get<ApiResponse<Parking>>(
    `/parking-discovery/${parkingId}`,
  );

  return response.data.data;
}

export async function getAvailableParkingSlots(
  parkingId: string,
  vehicleType: VehicleType,
): Promise<GetAvailableSlotsResponse> {
  const response = await api.get<ApiResponse<GetAvailableSlotsResponse>>(
    `/parking-discovery/${parkingId}/available-slots`,
    {
      params: {
        vehicleType,
      },
    },
  );

  return response.data.data;
}

export async function requestParkingActionVerification(
  parkingId: string,
  action: ParkingAction,
): Promise<ParkingActionVerificationResponse> {
  const response = await api.post<
    ApiResponse<ParkingActionVerificationResponse>
  >(`/parkings/${parkingId}/action-verification`, {
    action,
  });

  return response.data.data;
}

export async function updateParkingAvailability(
  parkingId: string,
  data: {
    isTemporarilyClosed: boolean;
    reason?: string;
    otp: string;
  },
): Promise<Parking> {
  const response = await api.patch<ApiResponse<Parking>>(
    `/parkings/${parkingId}/availability`,
    data,
  );

  return response.data.data;
}

export async function deleteOwnerParking(
  parkingId: string,
  otp: string,
): Promise<void> {
  await api.delete(`/parkings/${parkingId}`, {
    data: {
      otp,
    },
  });
}

export async function createParking(
  payload: CreateParkingPayload,
  images: File[],
): Promise<Parking> {
  const formData = new FormData();

  formData.append("parkingName", payload.parkingName);

  formData.append("description", payload.description ?? "");

  formData.append("parkingType", payload.parkingType);

  formData.append("address", payload.address);

  formData.append("landmark", payload.landmark ?? "");

  formData.append("city", payload.city);

  formData.append("state", payload.state);

  formData.append("pincode", payload.pincode);

  formData.append("location", JSON.stringify(payload.location));

  formData.append("ownerName", payload.ownerName);

  formData.append("contactNumber", payload.contactNumber);

  formData.append("parkingArea", String(payload.parkingArea));

  formData.append(
    "supportedVehicleTypes",
    JSON.stringify(payload.supportedVehicleTypes),
  );

  formData.append("facilities", JSON.stringify(payload.facilities));

  formData.append("rules", JSON.stringify(payload.rules));

  formData.append("entryInstructions", payload.entryInstructions ?? "");

  formData.append("bookingModes", JSON.stringify(payload.bookingModes));

  formData.append("pricing", JSON.stringify(payload.pricing));

  formData.append("operatingHours", JSON.stringify(payload.operatingHours));

  images.forEach((file) => {
    formData.append("images", file, file.name);
  });

  const response = await api.post<ApiResponse<Parking>>("/parkings", formData);

  return response.data.data;
}

export async function updateParking(
  parkingId: string,
  payload: UpdateParkingPayload,
  images: File[] = [],
): Promise<Parking> {
  const formData = new FormData();

  formData.append("parkingName", payload.parkingName);

  formData.append("description", payload.description ?? "");

  formData.append("parkingType", payload.parkingType);

  formData.append("address", payload.address);

  formData.append("landmark", payload.landmark ?? "");

  formData.append("city", payload.city);

  formData.append("state", payload.state);

  formData.append("pincode", payload.pincode);

  formData.append("location", JSON.stringify(payload.location));

  formData.append("ownerName", payload.ownerName);

  formData.append("contactNumber", payload.contactNumber);

  formData.append("parkingArea", String(payload.parkingArea));

  formData.append(
    "supportedVehicleTypes",
    JSON.stringify(payload.supportedVehicleTypes),
  );

  formData.append("facilities", JSON.stringify(payload.facilities));

  formData.append("rules", JSON.stringify(payload.rules));

  formData.append("entryInstructions", payload.entryInstructions ?? "");

  formData.append("bookingModes", JSON.stringify(payload.bookingModes));

  formData.append("pricing", JSON.stringify(payload.pricing));

  formData.append("operatingHours", JSON.stringify(payload.operatingHours));

  if (payload.removeImagePublicIds && payload.removeImagePublicIds.length > 0) {
    formData.append(
      "removeImagePublicIds",
      JSON.stringify(payload.removeImagePublicIds),
    );
  }

  images.forEach((file) => {
    formData.append("images", file, file.name);
  });

  const response = await api.patch<ApiResponse<Parking>>(
    `/parkings/${parkingId}`,
    formData,
  );

  return response.data.data;
}

export async function deleteParking(parkingId: string): Promise<void> {
  await api.delete(`/parkings/${parkingId}`);
}
