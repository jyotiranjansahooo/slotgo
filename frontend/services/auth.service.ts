import api from "@/lib/api";

import type { ApiResponse } from "@/types/api";
export type UserRole = "driver" | "parkingOwner" | "admin";
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: "driver" | "parkingOwner" | "admin";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: "driver" | "parkingOwner";
}

export interface RegisterResponse {
  requiresVerification: boolean;
  email: string;
  message: string;
}

export const loginUser = async (
  data: LoginData,
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await api.post<ApiResponse<AuthResponseData>>(
    "/auth/login",
    data,
  );

  return response.data;
};

export const googleLoginUser = async (
  credential: string,
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await api.post<ApiResponse<AuthResponseData>>(
    "/auth/google",
    {
      credential,
    },
  );

  return response.data;
};

export const verifyOtp = async (
  data: VerifyOtpData,
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await api.post<ApiResponse<AuthResponseData>>(
    "/auth/verify-otp",
    data,
  );

  return response.data;
};

export const registerUser = async (
  data: RegisterData,
): Promise<ApiResponse<RegisterResponse>> => {
  const response = await api.post<ApiResponse<RegisterResponse>>(
    "/auth/register",
    data,
  );

  return response.data;
};
