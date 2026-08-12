import bookingService from "../services/booking/booking.service.js";
export const runBookingExpiryJob = async () => {
    try {
        const result = await bookingService.expireBooking();
        console.log("[BOOKING EXPIRY]", result);
    }
    catch (error) {
        console.error("[BOOKING EXPIRY ERROR]", error);
    }
};
//# sourceMappingURL=bookingExpiry.job.js.map