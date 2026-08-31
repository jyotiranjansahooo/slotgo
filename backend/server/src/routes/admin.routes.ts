import { Router } from "express";

import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
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

router.use(authMiddleware, adminMiddleware);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.get("/parkings", getParkings);

router.patch("/parkings/:id/approve", approveParking);

router.patch("/parkings/:id/reject", rejectParking);

// BOOKINGS

router.get("/bookings", getBookings);

router.get("/bookings/:id", getBookingById);

router.get("/parkings/:parkingId/bookings", getParkingBookings);

// PAYMENTS

router.get("/payments/:id", getPaymentById);

router.get("/bookings/:bookingId/payment", getPaymentByBooking);
router.get("/dashboard", getDashboardStats);

export default router;
