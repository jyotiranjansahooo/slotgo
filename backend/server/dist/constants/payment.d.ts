export declare const PAYMENT_GATEWAY: {
    readonly RAZORPAY: "razorpay";
};
export declare const PAYMENT_STATUS: {
    readonly CREATED: "created";
    readonly PENDING: "pending";
    readonly SUCCESS: "success";
    readonly FAILED: "failed";
    readonly REFUNDED: "refunded";
    readonly PARTIALLY_REFUNDED: "partiallyRefunded";
};
export declare const REFUND_STATUS: {
    readonly NONE: "none";
    readonly PENDING: "pending";
    readonly SUCCESS: "success";
    readonly FAILED: "failed";
};
export type PaymentGateway = (typeof PAYMENT_GATEWAY)[keyof typeof PAYMENT_GATEWAY];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];
export declare const PAYMENT_GATEWAY_VALUES: "razorpay"[];
export declare const PAYMENT_STATUS_VALUES: ("created" | "failed" | "partiallyRefunded" | "pending" | "refunded" | "success")[];
export declare const REFUND_STATUS_VALUES: ("failed" | "none" | "pending" | "success")[];
