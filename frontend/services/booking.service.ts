import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";

import type {
  Booking,
  CreateBookingData,
  CreateBookingResponse,
  CreateOvertimePaymentResponse,
  VerifyOvertimePaymentResponse,
  CheckoutResponse,
  BookingCheckout,
  CreateBookingCheckoutData,
  CreateBookingCheckoutResponse,
} from "@/types/booking";

export const createBooking = async (
  data: CreateBookingData,
): Promise<ApiResponse<CreateBookingResponse>> => {
  const response = await api.post<ApiResponse<CreateBookingResponse>>(
    "/bookings",
    data,
  );

  return response.data;
};

export const createBookingCheckout = async (
  data: CreateBookingCheckoutData,
): Promise<ApiResponse<CreateBookingCheckoutResponse>> => {
  const response = await api.post<ApiResponse<CreateBookingCheckoutResponse>>(
    "/bookings/checkout",
    data,
  );

  return response.data;
};

export const getBookingCheckout = async (
  checkoutId: string,
): Promise<ApiResponse<BookingCheckout>> => {
  const response = await api.get<ApiResponse<BookingCheckout>>(
    `/bookings/checkout/${checkoutId}`,
  );

  return response.data;
};

export const getMyBookings = async (): Promise<ApiResponse<Booking[]>> => {
  const response = await api.get<ApiResponse<Booking[]>>("/bookings");

  return response.data;
};
export const cancelBooking = async (
  bookingId: string,
  reason: string,
): Promise<ApiResponse<unknown>> => {
  const response = await api.post<ApiResponse<unknown>>(
    `/bookings/${bookingId}/cancel`,
    {
      reason,
    },
  );

  return response.data;
};
export const getOwnerBookings = async (): Promise<ApiResponse<Booking[]>> => {
  const response = await api.get<ApiResponse<Booking[]>>("/bookings/owner");

  return response.data;
};

export const getBooking = async (
  bookingId: string,
): Promise<ApiResponse<Booking>> => {
  const response = await api.get<ApiResponse<Booking>>(
    `/bookings/${bookingId}`,
  );

  return response.data;
};
export const verifyPayment = async (
  data: {
    checkoutId: string;
    orderId: string;
    paymentId: string;
    signature: string;
  },
): Promise<ApiResponse<{
  booking: {
    _id: string;
    bookingNumber?: string;
  };
}>> => {
  const response = await api.post<
    ApiResponse<{
      booking: {
        _id: string;
        bookingNumber?: string;
      };
    }>
  >("/bookings/payment/verify", data);

  return response.data;
};
export const checkOutBooking = async (
  bookingId: string,
): Promise<ApiResponse<CheckoutResponse>> => {
  const response = await api.post<ApiResponse<CheckoutResponse>>(
    `/bookings/${bookingId}/check-out`,
  );

  return response.data;
};

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
