import { Router } from "express";

import {
  createPayment,
  verifyPayment,
  refundPayment,
} from "../controllers/payment.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  createPayment,
);

router.post(
  "/verify",
  authMiddleware,
  verifyPayment,
);

router.post(
  "/refund",
  authMiddleware,
  refundPayment,
);

export default router;