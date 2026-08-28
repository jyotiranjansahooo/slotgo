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

const router = Router({ mergeParams: true });

router.use(authMiddleware);

/* GET ALL SLOTS */

router.get("/", getParkingSlots);

/* GET AVAILABLE SLOTS */

router.get("/available", getAvailableSlots);

/* CREATE SLOT */

router.post(
  "/",
  requireRole(USER_ROLES.PARKING_OWNER),
  validate(createParkingSlotSchema),
  createSlot,
);

/* DELETE SLOT */

router.delete(
  "/slot/:slotId",
  requireRole(USER_ROLES.PARKING_OWNER),
  deleteSlot,
);

export default router;
