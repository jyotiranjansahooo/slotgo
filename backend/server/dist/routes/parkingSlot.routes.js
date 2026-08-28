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
router.delete(
  "/slot/:slotId",
  requireRole(USER_ROLES.PARKING_OWNER),
  deleteSlot,
);
router.get("/:parkingId/available", getAvailableSlots);
router.get("/:parkingId", getParkingSlots);
router.post(
  "/:parkingId",
  requireRole(USER_ROLES.PARKING_OWNER),
  validate(createParkingSlotSchema),
  createSlot,
);
export default router;
