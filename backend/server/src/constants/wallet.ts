export const WALLET_TRANSACTION_TYPE = {
  BOOKING_CREDIT: "bookingCredit",

  WITHDRAWAL: "withdrawal",

  REFUND: "refund",

  COMMISSION: "commission",

  PLATFORM_FEE: "platformFee",

  ADJUSTMENT: "adjustment",
} as const;

export const WALLET_TRANSACTION_STATUS = {
  PENDING: "pending",

  COMPLETED: "completed",

  FAILED: "failed",
} as const;

export type WalletTransactionType =
  (typeof WALLET_TRANSACTION_TYPE)[keyof typeof WALLET_TRANSACTION_TYPE];

export type WalletTransactionStatus =
  (typeof WALLET_TRANSACTION_STATUS)[keyof typeof WALLET_TRANSACTION_STATUS];

export const WALLET_TRANSACTION_TYPE_VALUES =
  Object.values(WALLET_TRANSACTION_TYPE);

export const WALLET_TRANSACTION_STATUS_VALUES =
  Object.values(WALLET_TRANSACTION_STATUS);