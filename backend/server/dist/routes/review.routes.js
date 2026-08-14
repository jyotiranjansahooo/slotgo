import { Router } from "express";
import { createReview, getReviewById, getParkingReviews, getOwnerReviews, getMyReviews, updateReview, deleteReview, } from "../controllers/review.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = Router();
// ============================================================
// PROTECTED REVIEW ROUTES
// ============================================================
// Create review
router.post("/", authMiddleware, createReview);
// Get my reviews
router.get("/my", authMiddleware, getMyReviews);
// Get parking reviews
router.get("/parking/:parkingId", getParkingReviews);
// Get owner reviews
router.get("/owner/:ownerId", getOwnerReviews);
// Get single review
router.get("/:id", getReviewById);
// Update review
router.patch("/:id", authMiddleware, updateReview);
// Delete review
router.delete("/:id", authMiddleware, deleteReview);
export default router;
//# sourceMappingURL=review.routes.js.map