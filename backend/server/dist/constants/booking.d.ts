export declare const BOOKING_STATUS: {
    readonly PENDING: "pending";
    readonly CONFIRMED: "confirmed";
    readonly ACTIVE: "active";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
    readonly EXPIRED: "expired";
};
export declare const PAYMENT_STATUS: {
    readonly PENDING: "pending";
    readonly PAID: "paid";
    readonly REFUNDED: "refunded";
    readonly FAILED: "failed";
};
export declare const BOOKING_MODE: {
    readonly HOURLY: "hourly";
    readonly DAILY: "daily";
    readonly MONTHLY: "monthly";
};
export declare const CANCELLED_BY: {
    readonly DRIVER: "driver";
    readonly OWNER: "owner";
    readonly ADMIN: "admin";
    readonly SYSTEM: "system";
};
export declare const BOOKING_DURATION: {
    readonly HOURLY: "hourly";
    readonly DAILY: "daily";
    readonly MONTHLY: "monthly";
};
export type BookingDuration = (typeof BOOKING_DURATION)[keyof typeof BOOKING_DURATION];
export declare const BOOKING_DURATION_VALUES: ("daily" | "hourly" | "monthly")[];
export type CancelledBy = (typeof CANCELLED_BY)[keyof typeof CANCELLED_BY];
export declare const CANCELLED_BY_VALUES: ("admin" | "driver" | "owner" | "system")[];
export type BookingMode = (typeof BOOKING_MODE)[keyof typeof BOOKING_MODE];
export declare const BOOKING_MODE_VALUES: ("daily" | "hourly" | "monthly")[];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export declare const PAYMENT_STATUS_VALUES: ("failed" | "paid" | "pending" | "refunded")[];
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
export declare const BOOKING_STATUS_VALUES: ("active" | "cancelled" | "completed" | "confirmed" | "expired" | "pending")[];
