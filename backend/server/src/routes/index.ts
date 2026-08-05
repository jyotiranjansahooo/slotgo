import { Router } from "express";
import ApiResponse from "../utils/ApiResponse.js";

const router = Router();

router.get("/health", (_req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, "SlotGo API is running 🚗"));
});

export default router;