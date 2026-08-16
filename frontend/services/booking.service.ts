import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";
import type {
  Booking,
  CreateBookingData,
  CreateBookingResponse,
} from "@/types/booking";

export const createBooking = async (
  data: CreateBookingData,
): Promise<
  ApiResponse<CreateBookingResponse>
> => {
  const response =
    await api.post<
      ApiResponse<CreateBookingResponse>
    >("/bookings", data);

  return response.data;
};

export const getMyBookings = async (): Promise<
  ApiResponse<Booking[]>
> => {
  const response =
    await api.get<ApiResponse<Booking[]>>(
      "/bookings",
    );

  return response.data;
};

export const getBooking = async (
  bookingId: string,
): Promise<ApiResponse<Booking>> => {
  const response =
    await api.get<ApiResponse<Booking>>(
      `/bookings/${bookingId}`,
    );

  return response.data;
};