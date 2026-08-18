import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import { createBookingSchema } from "../validations/booking/create.validation.js";
import { checkInSchema } from "../validations/booking/checkIn.validation.js";

import {
  createBooking,
  verifyPayment,
  createOvertimePayment,
  verifyOvertimePayment,
  getBooking,
  getDriverBookings,
  cancelBooking,
  checkIn,
  checkOut,
} from "../controllers/booking.controller.js";

const router = Router();

// ============================================================
// CREATE BOOKING
// ============================================================

router.post(
  "/",
  authMiddleware,
  validate(createBookingSchema),
  createBooking,
);

// ============================================================
// VERIFY NORMAL PAYMENT
// ============================================================

router.post(
  "/payment/verify",
  authMiddleware,
  verifyPayment,
);

// ============================================================
// CREATE OVERTIME PAYMENT
// ============================================================

router.post(
  "/:bookingId/payment/overtime",
  authMiddleware,
  createOvertimePayment,
);

// ============================================================
// VERIFY OVERTIME PAYMENT
// ============================================================

router.post(
  "/payment/overtime/verify",
  authMiddleware,
  verifyOvertimePayment,
);

// ============================================================
// DRIVER BOOKINGS
// ============================================================

router.get(
  "/",
  authMiddleware,
  getDriverBookings,
);

// ============================================================
// SINGLE BOOKING
// ============================================================

router.get(
  "/:bookingId",
  authMiddleware,
  getBooking,
);

// ============================================================
// CANCEL BOOKING
// ============================================================

router.post(
  "/:bookingId/cancel",
  authMiddleware,
  cancelBooking,
);

// ============================================================
// CHECK-IN
// ============================================================

router.post(
  "/:bookingId/check-in",
  authMiddleware,
  validate(checkInSchema),
  checkIn,
);

// ============================================================
// CHECK-OUT
// ============================================================

router.post(
  "/:bookingId/check-out",
  authMiddleware,
  checkOut,
);

export default router;