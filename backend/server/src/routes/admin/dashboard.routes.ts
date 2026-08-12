import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/role.middleware.js";

import { USER_ROLES } from "../../constants/roles.js";

import {
  getDashboard,
} from "../../controllers/admin/dashboard.controller.js";

const router = Router();

router.use(
  authMiddleware,
  requireRole(USER_ROLES.ADMIN),
);

router.get(
  "/",
  getDashboard,
);

export default router;