export const BOOKING_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    ACTIVE: "active",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    EXPIRED: "expired",
};
export const PAYMENT_STATUS = {
    PENDING: "pending",
    PAID: "paid",
    REFUNDED: "refunded",
    FAILED: "failed",
};
export const BOOKING_MODE = {
    HOURLY: "hourly",
    DAILY: "daily",
    MONTHLY: "monthly",
};
export const CANCELLED_BY = {
    DRIVER: "driver",
    OWNER: "owner",
    ADMIN: "admin",
    SYSTEM: "system",
};
export const BOOKING_DURATION = {
    HOURLY: "hourly",
    DAILY: "daily",
    MONTHLY: "monthly",
};
export const BOOKING_DURATION_VALUES = Object.values(BOOKING_DURATION);
export const CANCELLED_BY_VALUES = Object.values(CANCELLED_BY);
export const BOOKING_MODE_VALUES = Object.values(BOOKING_MODE);
export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);
export const BOOKING_STATUS_VALUES = Object.values(BOOKING_STATUS);
//# sourceMappingURL=booking.js.map