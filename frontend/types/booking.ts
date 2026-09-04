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
export interface CreateBookingCheckoutData {
  parkingId: string;

  vehicleId: string;

  bookingMode: BookingMode;

  startTime: string;

  endTime: string;
}

export interface BookingCheckout {
  _id: string;

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

  orderId: string;

  reservedUntil: string;

  expiresAt: string;

  createdAt: string;

  updatedAt: string;
}

export interface CreateBookingCheckoutResponse {
  checkout: BookingCheckout;

  razorpayOrder: {
    id: string;

    amount: number;

    currency: string;
  };
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

  checkedInAt?: string;

  checkedOutAt?: string;

  overtimeMinutes: number;

  overtimeParkingAmount: number;

  overtimeFine: number;

  overtimeTotal: number;

  driverSnapshot: {
    name: string;
    phoneNumber: string;
  };

  parkingSnapshot: {
    parkingName: string;
    address: string;
  };

  vehicleSnapshot: {
    registrationNumber: string;
    brand: string;
    vehicleModel: string;
    vehicleType: string;
  };

  createdAt: string;

  updatedAt: string;
}

export interface Payment {
  _id: string;

  bookingId: string;

  orderId: string;

  amount: number;

  currency: string;

  status: string;

  paymentId?: string;

  signature?: string;

  paidAt?: string;
}

export interface CreateBookingResponse {
  booking: Booking;

  payment: Payment;

  razorpayOrder?: {
    id: string;
    amount: number;
    currency: string;
  };
}

export interface OvertimeDetails {
  overtimeMinutes: number;

  overtimeParkingAmount: number;

  overtimeFine: number;

  overtimeTotal: number;
}

export interface CreateOvertimePaymentResponse {
  booking: Booking;

  razorpayOrder: {
    id: string;

    amount: number;

    currency: string;
  };
}

export interface VerifyOvertimePaymentResponse {
  booking: Booking;

  payment: {
    orderId: string;

    paymentId: string;

    signature?: string;
  };

  overtime: OvertimeDetails;

  wallet?: unknown;

  transaction?: unknown;
}

export interface CheckoutResponse {
  requiresAdditionalPayment: boolean;

  booking: Booking;

  overtime?: OvertimeDetails;
}