import { Router } from "express";

import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserStatus,
  getParkings,
  approveParking,
  rejectParking,
  getBookings,
  getBookingById,
  getParkingBookings,
  getPaymentById,
  getPaymentByBooking,
} from "../controllers/admin.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
const router = Router();

// ============================================================
// ADMIN ROUTES
// ============================================================

// All routes require authentication.
// Admin-role protection should be applied by your auth middleware
// or a separate role middleware if your project has one.

router.use(
  authMiddleware,
  adminMiddleware,
);

// ============================================================
// USERS
// ============================================================

router.get(
  "/users",
  getUsers,
);

router.get(
  "/users/:id",
  getUserById,
);

router.patch(
  "/users/:id/status",
  updateUserStatus,
);

// ============================================================
// PARKINGS
// ============================================================

router.get(
  "/parkings",
  getParkings,
);

router.patch(
  "/parkings/:id/approve",
  approveParking,
);

router.patch(
  "/parkings/:id/reject",
  rejectParking,
);

// ============================================================
// BOOKINGS
// ============================================================

router.get(
  "/bookings",
  getBookings,
);

router.get(
  "/bookings/:id",
  getBookingById,
);

router.get(
  "/parkings/:parkingId/bookings",
  getParkingBookings,
);

// ============================================================
// PAYMENTS
// ============================================================

router.get(
  "/payments/:id",
  getPaymentById,
);

router.get(
  "/bookings/:bookingId/payment",
  getPaymentByBooking,
);
router.get(
  "/dashboard",
  getDashboardStats,
);

export default router;