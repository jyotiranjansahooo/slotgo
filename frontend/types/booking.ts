export const BOOKING_MODES = {
  HOURLY: "hourly",
  DAILY: "daily",
  MONTHLY: "monthly",
} as const;

export type BookingMode = (typeof BOOKING_MODES)[keyof typeof BOOKING_MODES];

// ============================================================
// CREATE BOOKING
// ============================================================

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

  checkedInAt?: string;

  checkedOutAt?: string;

  overtimeMinutes: number;

  overtimeParkingAmount: number;

  overtimeFine: number;

  overtimeTotal: number;

  vehicleSnapshot: {
    brand: string;

    vehicleModel: string;

    registrationNumber: string;

    vehicleType: string;
  };

  parkingSnapshot: {
    parkingName: string;

    address: string;
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

// ============================================================
// CREATE BOOKING RESPONSE
// ============================================================

export interface CreateBookingResponse {
  booking: Booking;

  payment: Payment;

  razorpayOrder?: {
    id: string;
    amount: number;
    currency: string;
  };
}

// ============================================================
// OVERTIME DETAILS
// ============================================================

export interface OvertimeDetails {
  overtimeMinutes: number;

  overtimeParkingAmount: number;

  overtimeFine: number;

  overtimeTotal: number;
}

// ============================================================
// CREATE OVERTIME PAYMENT RESPONSE
// ============================================================

export interface CreateOvertimePaymentResponse {
  booking: Booking;

  razorpayOrder: {
    id: string;

    amount: number;

    currency: string;
  };
}

// ============================================================
// VERIFY OVERTIME PAYMENT RESPONSE
// ============================================================

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

// ============================================================
// CHECKOUT RESPONSE
// ============================================================

export interface CheckoutResponse {
  requiresAdditionalPayment: boolean;

  booking: Booking;

  overtime?: OvertimeDetails;
}
