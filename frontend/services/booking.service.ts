import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";

import type {
  Booking,
  CreateBookingData,
  CreateBookingResponse,
  CreateOvertimePaymentResponse,
  VerifyOvertimePaymentResponse,
  CheckoutResponse,
} from "@/types/booking";

// ============================================================
// CREATE BOOKING
// ============================================================

export const createBooking = async (
  data: CreateBookingData,
): Promise<ApiResponse<CreateBookingResponse>> => {
  const response = await api.post<ApiResponse<CreateBookingResponse>>(
    "/bookings",
    data,
  );

  return response.data;
};

// ============================================================
// GET MY BOOKINGS
// ============================================================

export const getMyBookings = async (): Promise<ApiResponse<Booking[]>> => {
  const response = await api.get<ApiResponse<Booking[]>>("/bookings");

  return response.data;
};

// ============================================================
// GET SINGLE BOOKING
// ============================================================

export const getBooking = async (
  bookingId: string,
): Promise<ApiResponse<Booking>> => {
  const response = await api.get<ApiResponse<Booking>>(
    `/bookings/${bookingId}`,
  );

  return response.data;
};

// ============================================================
// CHECK OUT
//
// Backend decides whether overtime payment is required.
// ============================================================

export const checkOutBooking = async (
  bookingId: string,
): Promise<ApiResponse<CheckoutResponse>> => {
  const response = await api.post<ApiResponse<CheckoutResponse>>(
    `/bookings/${bookingId}/check-out`,
  );

  return response.data;
};

// ============================================================
// CREATE OVERTIME PAYMENT
// ============================================================

export const createOvertimePayment = async (
  bookingId: string,
): Promise<ApiResponse<CreateOvertimePaymentResponse>> => {
  const response = await api.post<ApiResponse<CreateOvertimePaymentResponse>>(
    `/bookings/${bookingId}/payment/overtime`,
  );

  return response.data;
};

export const verifyOvertimePayment = async (
  orderId: string,
  paymentId: string,
  signature: string,
): Promise<ApiResponse<VerifyOvertimePaymentResponse>> => {
  const response = await api.post<ApiResponse<VerifyOvertimePaymentResponse>>(
    "/bookings/payment/overtime/verify",
    {
      orderId,
      paymentId,
      signature,
    },
  );

  return response.data;
};
