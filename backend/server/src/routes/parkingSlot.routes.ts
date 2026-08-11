import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import { createParkingSlotSchema } from "../validations/parkingslot/create.validation.js";

import {
  createSlot,
  getParkingSlots,
  getAvailableSlots,
  deleteSlot,
} from "../controllers/parkingSlot.controller.js";

const router = Router();

router.post("/", authMiddleware, validate(createParkingSlotSchema), createSlot);

router.get("/:parkingId", authMiddleware, getParkingSlots);
router.get("/:parkingId/available", getAvailableSlots);
router.delete("/:slotId", authMiddleware, deleteSlot);

export default router;
