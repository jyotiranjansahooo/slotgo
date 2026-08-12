import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/role.middleware.js";

import { USER_ROLES } from "../../constants/roles.js";

import {
  getAllUsers,
  getUser,
  updateUserStatus,
} from "../../controllers/admin/user.controller.js";

const router = Router();

router.use(
  authMiddleware,
  requireRole(USER_ROLES.ADMIN),
);

router.get(
  "/",
  getAllUsers,
);

router.get(
  "/:id",
  getUser,
);

router.patch(
  "/:id/status",
  updateUserStatus,
);

export default router;