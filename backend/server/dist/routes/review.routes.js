import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createReviewSchema, } from "../validations/review/create.validation.js";
import { createReview, getParkingReviews, } from "../controllers/review.controller.js";
const router = Router();
router.post("/", authMiddleware, validate(createReviewSchema), createReview);
router.get("/parking/:parkingId", getParkingReviews);
export default router;
//# sourceMappingURL=review.routes.js.map