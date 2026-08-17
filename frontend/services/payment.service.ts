import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";

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
