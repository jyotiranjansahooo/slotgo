import { Router } from "express";

import ApiResponse from "../utils/ApiResponse.js";

import authRoutes from "./auth.routes.js";
import vehicleRoutes from "./vehicle.routes.js";

const router = Router();

router.use("/vehicles", vehicleRoutes);
router.get("/health", (_req, res) => {
  res.json(
    new ApiResponse(
      200,
      "SlotGo API is running 🚗"
    )
  );
});

router.use("/auth", authRoutes);

export default router;