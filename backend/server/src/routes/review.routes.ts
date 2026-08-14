import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  createReview,
  getReviewById,
  getDriverReviews,
  getParkingReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createReview,
);

router.get(
  "/:reviewId",
  getReviewById,
);

router.get(
  "/driver/:driverId",
  getDriverReviews,
);

router.get(
  "/parking/:parkingId",
  getParkingReviews,
);

router.patch(
  "/:reviewId",
  authMiddleware,
  updateReview,
);

router.delete(
  "/:reviewId",
  authMiddleware,
  deleteReview,
);

export default router;