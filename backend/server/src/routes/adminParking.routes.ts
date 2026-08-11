import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

import {
  approveParking,
  rejectParking,
} from "../controllers/parking/adminParking.controller.js";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.patch(
  "/:id/approve",
  approveParking,
);

router.patch(
  "/:id/reject",
  rejectParking,
);

export default router;