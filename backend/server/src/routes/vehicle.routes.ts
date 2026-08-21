import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import requireRole from "../middleware/role.middleware.js";

import { USER_ROLES } from "../constants/roles.js";

import { createVehicleSchema } from "../validations/vehicle/create.validation.js";

import { updateVehicleSchema } from "../validations/vehicle/update.validation.js";

import {
  createVehicle,
  deleteVehicle,
  getMyVehicles,
  getVehicle,
  setDefaultVehicle,
  updateVehicle,
} from "../controllers/vehicle/vehicle.controller.js";

const router = Router();

// Authentication
router.use(authMiddleware);

// Only drivers can manage vehicles
router.use(requireRole(USER_ROLES.DRIVER));

// Create
router.post("/", validate(createVehicleSchema), createVehicle);

// Get all my vehicles
router.get("/", getMyVehicles);

// Get single vehicle
router.get("/:id", getVehicle);

// Set default
router.patch("/:id/default", setDefaultVehicle);

// Update
router.patch("/:id", validate(updateVehicleSchema), updateVehicle);

// Delete
router.delete("/:id", deleteVehicle);

export default router;
