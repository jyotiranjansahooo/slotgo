import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import requireRole from "../middleware/role.middleware.js";
import uploadParkingImages from "../middleware/uploadParkingImages.middleware.js";
import parseParkingFormData from "../middleware/parseParkingFormData.middleware.js";

import { USER_ROLES } from "../constants/roles.js";

import { createParkingSchema } from "../validations/parking/create.validation.js";
import { updateParkingSchema } from "../validations/parking/update.validation.js";

import {
  createParking,
  getMyParkings,
  getParking,
  updateParking,
  deleteParking,
} from "../controllers/parking/parking.controller.js";

const router = Router();

router.use(
  authMiddleware,
  requireRole(USER_ROLES.PARKING_OWNER),
);

/* ============================================================
   CREATE PARKING
============================================================ */

router.post(
  "/",

  // 1. Parse multipart/form-data
  uploadParkingImages.array("images", 5),

  // 2. Convert JSON strings into arrays/objects
  parseParkingFormData,

  // 3. Validate parsed data
  validate(createParkingSchema),

  // 4. Controller
  createParking,
);

/* ============================================================
   GET MY PARKINGS
============================================================ */

router.get("/", getMyParkings);

/* ============================================================
   GET SINGLE PARKING
============================================================ */

router.get("/:id", getParking);

/* ============================================================
   UPDATE PARKING
============================================================ */

router.patch(
  "/:id",

  uploadParkingImages.array("images", 5),

  parseParkingFormData,

  validate(updateParkingSchema),

  updateParking,
);

/* ============================================================
   DELETE PARKING
============================================================ */

router.delete("/:id", deleteParking);

export default router;