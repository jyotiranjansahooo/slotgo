export declare const WALLET_TRANSACTION_TYPE: {
    readonly BOOKING_CREDIT: "bookingCredit";
    readonly WITHDRAWAL: "withdrawal";
    readonly REFUND: "refund";
    readonly COMMISSION: "commission";
    readonly PLATFORM_FEE: "platformFee";
    readonly ADJUSTMENT: "adjustment";
};
export declare const WALLET_TRANSACTION_STATUS: {
    readonly PENDING: "pending";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
};
export type WalletTransactionType = (typeof WALLET_TRANSACTION_TYPE)[keyof typeof WALLET_TRANSACTION_TYPE];
export type WalletTransactionStatus = (typeof WALLET_TRANSACTION_STATUS)[keyof typeof WALLET_TRANSACTION_STATUS];
export declare const WALLET_TRANSACTION_TYPE_VALUES: ("adjustment" | "bookingCredit" | "commission" | "platformFee" | "refund" | "withdrawal")[];
export declare const WALLET_TRANSACTION_STATUS_VALUES: ("completed" | "failed" | "pending")[];
