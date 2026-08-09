import { Router } from "express";

import ApiResponse from "../utils/ApiResponse.js";
import paymentRoutes from "./payment.routes.js";
import authRoutes from "./auth.routes.js";
import vehicleRoutes from "./vehicle.routes.js";
import parkingSlotRoutes from "./parkingSlot.routes.js";
import bookingRoutes from "./booking.routes.js";

const router = Router();

router.use("/vehicles", vehicleRoutes);
router.use("/bookings", bookingRoutes);
router.get("/health", (_req, res) => {
  res.json(new ApiResponse(200, "SlotGo API is running 🚗"));
});
router.use("/payments", paymentRoutes);
router.use("/auth", authRoutes);
router.use("/parking-slots", parkingSlotRoutes);

export default router;
