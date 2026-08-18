import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";

// ============================================================
// VERIFY NORMAL PAYMENT
// ============================================================

export interface VerifyPaymentData {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  bookingId: string;
  paymentId: string;
  status: string;
}

export const verifyPayment = async (
  data: VerifyPaymentData,
): Promise<ApiResponse<VerifyPaymentResponse>> => {
  const response = await api.post<ApiResponse<VerifyPaymentResponse>>(
    "/bookings/payment/verify",
    data,
  );

  return response.data;
};

export interface VerifyOvertimePaymentData {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyOvertimePaymentResponse {
  booking: {
    _id: string;
    bookingNumber: string;
    bookingStatus: string;
    paymentStatus: string;
    overtimePaymentStatus: string;
  };

  payment: {
    orderId: string;
    paymentId: string;
    signature: string;
  };

  overtime: {
    overtimeMinutes: number;
    overtimeParkingAmount: number;
    overtimeFine: number;
    overtimeTotal: number;
  };
}

export const verifyOvertimePayment = async (
  data: VerifyOvertimePaymentData,
): Promise<ApiResponse<VerifyOvertimePaymentResponse>> => {
  const response = await api.post<ApiResponse<VerifyOvertimePaymentResponse>>(
    "/bookings/payment/overtime/verify",
    data,
  );

  return response.data;
};
