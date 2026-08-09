import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  createBooking,
  cancelBooking,
  checkIn,
  checkOut,
} from "../controllers/booking.controller.js";

const router = Router();

/*
 * Create a new booking
 * Driver must be authenticated.
 */
router.post(
  "/",
  authMiddleware,
  createBooking,
);


/*
 * Cancel booking
 * Driver must be authenticated.
 */
router.post(
  "/:bookingId/cancel",
  authMiddleware,
  cancelBooking,
);

/*
 * Check-in
 * Owner must ultimately be authorized by the service.
 */
router.post(
  "/:bookingId/check-in",
  authMiddleware,
  checkIn,
);

/*
 * Check-out
 * Owner must ultimately be authorized by the service.
 */
router.post(
  "/:bookingId/check-out",
  authMiddleware,
  checkOut,
);

export default router;