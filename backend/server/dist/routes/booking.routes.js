import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createBookingSchema, } from "../validations/booking/create.validation.js";
import { createBooking, verifyPayment, getBooking, getDriverBookings, cancelBooking, checkIn, checkOut, } from "../controllers/booking.controller.js";
import { checkInSchema } from "../validations/booking/checkIn.validation.js";
const router = Router();
/**
 * Create a new booking
 * Driver must be authenticated.
 */
router.post("/", authMiddleware, validate(createBookingSchema), createBooking);
/**
 * Verify Razorpay payment
 * User must be authenticated.
 */
router.post("/payment/verify", authMiddleware, verifyPayment);
router.get("/", authMiddleware, getDriverBookings);
router.get("/:bookingId", authMiddleware, getBooking);
/**
 * Cancel booking
 * Driver must be authenticated.
 */
router.post("/:bookingId/cancel", authMiddleware, cancelBooking);
/**
 * Check-in
 * Owner authorization is handled by the service.
 */
router.post("/:bookingId/check-in", authMiddleware, validate(checkInSchema), checkIn);
/**
 * Check-out
 * Owner authorization is handled by the service.
 */
router.post("/:bookingId/check-out", authMiddleware, checkOut);
export default router;
//# sourceMappingURL=booking.routes.js.map