import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export type UserRole =
  | "driver"
  | "parkingOwner"
  | "admin";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
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

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  email: string;
  message: string;
}

export interface VerifyPasswordResetOtpData {
  email: string;
  otp: string;
}

export interface VerifyPasswordResetOtpResponse {
  email: string;
  verified: boolean;
  message: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
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
  role?: UserRole,
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await api.post<ApiResponse<AuthResponseData>>(
    "/auth/google",
    {
      credential,
      role,
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

export const forgotPassword = async (
  data: ForgotPasswordData,
): Promise<ApiResponse<ForgotPasswordResponse>> => {
  const response = await api.post<ApiResponse<ForgotPasswordResponse>>(
    "/auth/forgot-password",
    data,
  );

  return response.data;
};

export const verifyPasswordResetOtp = async (
  data: VerifyPasswordResetOtpData,
): Promise<ApiResponse<VerifyPasswordResetOtpResponse>> => {
  const response = await api.post<
    ApiResponse<VerifyPasswordResetOtpResponse>
  >(
    "/auth/forgot-password/verify",
    data,
  );

  return response.data;
};

export const resetPassword = async (
  data: ResetPasswordData,
): Promise<ApiResponse<ResetPasswordResponse>> => {
  const response = await api.post<ApiResponse<ResetPasswordResponse>>(
    "/auth/reset-password",
    data,
  );

  return response.data;
};