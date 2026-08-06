export const PAYMENT_GATEWAY = {
  RAZORPAY: "razorpay",
} as const;

export const PAYMENT_STATUS = {
  CREATED: "created",

  PENDING: "pending",

  SUCCESS: "success",

  FAILED: "failed",

  REFUNDED: "refunded",

  PARTIALLY_REFUNDED: "partiallyRefunded",
} as const;

export const REFUND_STATUS = {
  NONE: "none",

  PENDING: "pending",

  SUCCESS: "success",

  FAILED: "failed",
} as const;

export type PaymentGateway =
  (typeof PAYMENT_GATEWAY)[keyof typeof PAYMENT_GATEWAY];

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export type RefundStatus =
  (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];

export const PAYMENT_GATEWAY_VALUES =
  Object.values(PAYMENT_GATEWAY);

export const PAYMENT_STATUS_VALUES =
  Object.values(PAYMENT_STATUS);

export const REFUND_STATUS_VALUES =
  Object.values(REFUND_STATUS);