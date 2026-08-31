import api from "@/lib/api";
export type AdminUserRole = "driver" | "parkingOwner" | "admin";

export interface AdminUser {
  _id: string;
  id?: string;

  name: {
    first: string;
    last: string;
  };

  email: string;

  phoneNumber?: string;

  role: AdminUserRole;

  isActive: boolean;

  isVerified: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface AdminDashboardStats {
  users: {
    totalUsers: number;
    drivers: number;
    parkingOwners: number;
    activeUsers: number;
  };

  parkings: {
    totalParkings: number;
    pendingParkings: number;
    approvedParkings: number;
    rejectedParkings: number;
    activeParkings: number;
  };

  bookings: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    expiredBookings: number;
  };

  payments: {
    totalPayments: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    refundedPayments: number;
    totalRevenue: number;
  };
}

export interface AdminParking {
  _id: string;

  parkingName: string;

  description?: string;

  parkingType: string;

  address: string;

  landmark?: string;

  city: string;

  state: string;

  pincode: string;

  ownerId:
    | string
    | {
        _id: string;

        name?: {
          first?: string;
          last?: string;
        };

        email?: string;
      };

  ownerName: string;

  contactNumber: string;

  parkingArea: number;

  supportedVehicleTypes?: string[];

  facilities: string[];

  rules: string[];

  entryInstructions?: string;

  bookingModes?: {
    hourly?: boolean;
    daily?: boolean;
    monthly?: boolean;
  };

  pricing?: {
    currency?: string;

    twoWheeler?: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    fourWheeler?: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    vanMinibus?: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    heavyVehicle?: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };
  };

  operatingHours?: {
    open?: string;
    close?: string;
  };

  status: "pending" | "approved" | "rejected";

  isActive: boolean;

  images?: {
    url: string;
    publicId: string;
  }[];

  createdAt?: string;

  updatedAt?: string;
}

export interface AdminBooking {
  _id: string;

  bookingNumber?: string;

  bookingStatus: string;

  parkingId?: string;

  userId?: string;

  slotId?: string;

  parkingAmount?: number;

  driverServiceFee?: number;

  totalAmount?: number;

  currency?: string;

  startTime?: string;

  endTime?: string;

  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export async function getAdminDashboard(): Promise<AdminDashboardStats> {
  const response =
    await api.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard");

  return response.data.data;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<ApiResponse<AdminUser[]>>("/admin/users");

  return response.data.data;
}

export async function getAdminUser(userId: string): Promise<AdminUser> {
  const response = await api.get<ApiResponse<AdminUser>>(
    `/admin/users/${userId}`,
  );

  return response.data.data;
}

export async function updateAdminUserStatus(
  userId: string,
  isActive: boolean,
): Promise<AdminUser> {
  const response = await api.patch<ApiResponse<AdminUser>>(
    `/admin/users/${userId}/status`,
    {
      isActive,
    },
  );

  return response.data.data;
}

export async function updateAdminUserRole(
  userId: string,
  role: AdminUserRole,
): Promise<AdminUser> {
  const response = await api.patch<ApiResponse<AdminUser>>(
    `/admin/users/${userId}/role`,
    {
      role,
    },
  );

  return response.data.data;
}

export async function getAdminParkings(): Promise<AdminParking[]> {
  const response =
    await api.get<ApiResponse<AdminParking[]>>("/admin/parkings");

  return response.data.data;
}

export async function approveAdminParking(
  parkingId: string,
): Promise<AdminParking> {
  const response = await api.patch<ApiResponse<AdminParking>>(
    `/admin/parkings/${parkingId}/approve`,
  );

  return response.data.data;
}

export async function rejectAdminParking(
  parkingId: string,
): Promise<AdminParking> {
  const response = await api.patch<ApiResponse<AdminParking>>(
    `/admin/parkings/${parkingId}/reject`,
  );

  return response.data.data;
}

export async function getAdminBookings(): Promise<AdminBooking[]> {
  const response =
    await api.get<ApiResponse<AdminBooking[]>>("/admin/bookings");

  return response.data.data;
}

export async function getAdminBooking(
  bookingId: string,
): Promise<AdminBooking> {
  const response = await api.get<ApiResponse<AdminBooking>>(
    `/admin/bookings/${bookingId}`,
  );

  return response.data.data;
}
