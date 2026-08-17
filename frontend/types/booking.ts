export const BOOKING_MODES = {
  HOURLY: "hourly",
  DAILY: "daily",
  MONTHLY: "monthly",
} as const;

export type BookingMode = (typeof BOOKING_MODES)[keyof typeof BOOKING_MODES];

export interface CreateBookingData {
  parkingId: string;
  vehicleId: string;
  bookingMode: BookingMode;
  startTime: string;
  endTime: string;
}

export interface Booking {
  _id: string;
  bookingNumber: string;

  driverId: string;
  ownerId: string;
  parkingId: string;
  slotId: string;
  vehicleId: string;
  vehicleType: string;

  bookingMode: BookingMode;

  startTime: string;
  endTime: string;

  parkingAmount: number;
  discountAmount: number;
  actualAmount: number;
  ownerCommission: number;
  driverServiceFee: number;
  ownerReceives: number;
  driverPays: number;

  paymentStatus: string;
  bookingStatus: string;

  verificationPin?: string;
  qrCode?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  payment: {
    _id: string;
    bookingId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export interface Payment {
  _id: string;
  bookingId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  payment: Payment;
}
