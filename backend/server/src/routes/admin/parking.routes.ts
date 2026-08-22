import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/role.middleware.js";

import { USER_ROLES } from "../../constants/roles.js";

import {
  getAllParkings,
  approveParking,
  rejectParking,
} from "../../controllers/admin/parking.controller.js";

const router = Router();

router.use(authMiddleware, requireRole(USER_ROLES.ADMIN));

router.get("/", getAllParkings);

router.patch("/:id/approve", approveParking);

router.patch("/:id/reject", rejectParking);

export default router;
