export const BOOKING_STATUS = {
  PENDING: "pending",

  CONFIRMED: "confirmed",

  ACTIVE: "active",

  COMPLETED: "completed",

  CANCELLED: "cancelled",

  EXPIRED: "expired",
} as const;
export const PAYMENT_STATUS = {
  PENDING: "pending",

  PAID: "paid",

  REFUNDED: "refunded",

  FAILED: "failed",
} as const;

export const BOOKING_MODE = {
  HOURLY: "hourly",

  DAILY: "daily",

  MONTHLY: "monthly",
} as const;

export const CANCELLED_BY = {
  DRIVER: "driver",

  OWNER: "owner",

  ADMIN: "admin",

  SYSTEM: "system",
} as const;

export const BOOKING_DURATION = {
  HOURLY: "hourly",

  DAILY: "daily",

  MONTHLY: "monthly",
} as const;

export type BookingDuration =
  (typeof BOOKING_DURATION)[keyof typeof BOOKING_DURATION];

export const BOOKING_DURATION_VALUES =
  Object.values(BOOKING_DURATION);

export type CancelledBy =
  (typeof CANCELLED_BY)[keyof typeof CANCELLED_BY];

export const CANCELLED_BY_VALUES =
  Object.values(CANCELLED_BY);

export type BookingMode = (typeof BOOKING_MODE)[keyof typeof BOOKING_MODE];

export const BOOKING_MODE_VALUES = Object.values(BOOKING_MODE);

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_VALUES = Object.values(BOOKING_STATUS);
