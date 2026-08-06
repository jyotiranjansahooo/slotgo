import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createVehicleSchema,
} from "../validations/vehicle/create.validation.js";

import {
  updateVehicleSchema,
} from "../validations/vehicle/update.validation.js";

import {
  createVehicle,
  deleteVehicle,
  getMyVehicles,
  getVehicle,
  setDefaultVehicle,
  updateVehicle,
} from "../controllers/vehicle/vehicle.controller.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(createVehicleSchema),
  createVehicle
);

router.get("/", getMyVehicles);

router.get("/:id", getVehicle);

router.patch(
  "/:id",
  validate(updateVehicleSchema),
  updateVehicle
);

router.delete("/:id", deleteVehicle);

router.patch("/:id/default", setDefaultVehicle);

export default router;