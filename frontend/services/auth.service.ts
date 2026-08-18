import api from "@/lib/api";

export type UserRole = "driver" | "parkingOwner" | "admin";

export interface GoogleLoginData {
  credential: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: "driver" | "parkingOwner";
}

export interface AuthResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
}
export const googleLoginUser = async (
  credential: string,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/google", {
    credential,
  });

  return response.data;
};

export const registerUser = async (
  data: RegisterData,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", data);

  return response.data;
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data);

  return response.data;
};
