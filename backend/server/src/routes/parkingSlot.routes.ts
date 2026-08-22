import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import requireRole from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";

import { USER_ROLES } from "../constants/roles.js";

import {
  createSlot,
  getAvailableSlots,
  getParkingSlots,
  deleteSlot,
} from "../controllers/parkingSlot.controller.js";

import { createParkingSlotSchema } from "../validations/parkingslot/create.validation.js";

const router = Router();

router.use(authMiddleware);

// ==========================================================
// DELETE SLOT
// ==========================================================

router.delete(
  "/slot/:slotId",
  requireRole(USER_ROLES.PARKING_OWNER),
  deleteSlot,
);

// ==========================================================
// GET AVAILABLE SLOTS
// ==========================================================

router.get(
  "/:parkingId/available",
  getAvailableSlots,
);

// ==========================================================
// GET ALL SLOTS
// ==========================================================

router.get(
  "/:parkingId",
  getParkingSlots,
);

// ==========================================================
// CREATE SLOT
// ==========================================================

router.post(
  "/:parkingId",
  requireRole(USER_ROLES.PARKING_OWNER),
  validate(createParkingSlotSchema),
  createSlot,
);

export default router;