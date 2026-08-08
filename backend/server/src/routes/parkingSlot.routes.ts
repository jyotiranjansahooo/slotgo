import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  createSlot,
  getParkingSlots,
  deleteSlot,
} from "../controllers/parkingSlot.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createSlot,
);

router.get(
  "/:parkingId",
  getParkingSlots,
);

router.delete(
  "/:slotId",
  authMiddleware,
  deleteSlot,
);

export default router;