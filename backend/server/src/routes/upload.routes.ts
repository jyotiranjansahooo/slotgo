import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import requireRole from "../middleware/role.middleware.js";

import { USER_ROLES } from "../constants/roles.js";

import upload from "../middleware/upload.middleware.js";

import {
  uploadParkingImage,
  deleteParkingImage,
} from "../controllers/upload/upload.controller.js";

const router = Router();

router.use(
  authMiddleware,
  requireRole(USER_ROLES.PARKING_OWNER),
);

router.post(
  "/parking",
  upload.single("image"),
  uploadParkingImage,
);

router.delete(
  "/parking",
  deleteParkingImage,
);

export default router;