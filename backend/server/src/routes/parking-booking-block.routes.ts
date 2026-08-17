import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import requireRole from "../middleware/role.middleware.js";

import { USER_ROLES } from "../constants/roles.js";

import {
  createParkingBookingBlock,
  getParkingBookingBlocks,
  deleteParkingBookingBlock,
} from "../controllers/parking-booking-block.controller.js";

import {
  createParkingBookingBlockSchema,
} from "../validations/parking-booking-block/create.validation.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/:parkingId",
  requireRole(USER_ROLES.PARKING_OWNER),
  validate(createParkingBookingBlockSchema),
  createParkingBookingBlock,
);

router.get(
  "/:parkingId",
  requireRole(USER_ROLES.PARKING_OWNER),
  getParkingBookingBlocks,
);

router.delete(
  "/block/:blockId",
  requireRole(USER_ROLES.PARKING_OWNER),
  deleteParkingBookingBlock,
);

export default router;