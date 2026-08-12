import { Router } from "express";

// import ApiResponse from "../utils/ApiResponse.js";
import paymentRoutes from "./payment.routes.js";
import authRoutes from "./auth.routes.js";
import vehicleRoutes from "./vehicle.routes.js";
import parkingRoutes from "./parking.routes.js";
import parkingSlotRoutes from "./parkingSlot.routes.js";
import bookingRoutes from "./booking.routes.js";
import adminParkingRoutes from "./adminParking.routes.js";

const router = Router();

router.use("/vehicles", vehicleRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/auth", authRoutes);
router.use("/parking-slots", parkingSlotRoutes);
router.use("/parkings", parkingRoutes);
router.use("/admin/parkings", adminParkingRoutes);

export default router;
