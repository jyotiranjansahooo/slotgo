import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createParkingSchema,
} from "../validations/parking/create.validation.js";

import {
  updateParkingSchema,
} from "../validations/parking/update.validation.js";

import {
  createParking,
  getMyParkings,
  getParking,
  updateParking,
  deleteParking,
} from "../controllers/parking/parking.controller.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(createParkingSchema),
  createParking,
);

router.get(
  "/",
  getMyParkings,
);

router.get(
  "/:id",
  getParking,
);

router.patch(
  "/:id",
  validate(updateParkingSchema),
  updateParking,
);

router.delete(
  "/:id",
  deleteParking,
);

export default router;