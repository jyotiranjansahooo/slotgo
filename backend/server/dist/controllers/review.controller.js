import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { createReviewSchema } from "../validations/review/create.validation.js";
import { updateReviewSchema } from "../validations/review/update.validation.js";
import reviewService from "../services/review/review.service.js";
// ============================================================
// CREATE REVIEW
// ============================================================
export const createReview = asyncHandler(async (req, res) => {
    const userId = req.user?._id.toString();
    if (!userId) {
        throw new ApiError(401, "Authentication required.");
    }
    const data = createReviewSchema.parse(req.body);
    const review = await reviewService.createReview(userId, data);
    res
        .status(201)
        .json(new ApiResponse(201, review, "Review created successfully."));
});
// ============================================================
// GET REVIEW BY ID
// ============================================================
export const getReviewById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const review = await reviewService.getReviewById(id);
    res
        .status(200)
        .json(new ApiResponse(200, review, "Review fetched successfully."));
});
// ============================================================
// GET PARKING REVIEWS
// ============================================================
export const getParkingReviews = asyncHandler(async (req, res) => {
    const { parkingId } = req.params;
    const reviews = await reviewService.getParkingReviews(parkingId);
    res
        .status(200)
        .json(new ApiResponse(200, reviews, "Parking reviews fetched successfully."));
});
// ============================================================
// GET OWNER REVIEWS
// ============================================================
export const getOwnerReviews = asyncHandler(async (req, res) => {
    const { ownerId } = req.params;
    const reviews = await reviewService.getOwnerReviews(ownerId);
    res
        .status(200)
        .json(new ApiResponse(200, reviews, "Owner reviews fetched successfully."));
});
// ============================================================
// GET MY REVIEWS
// ============================================================
export const getMyReviews = asyncHandler(async (req, res) => {
    const userId = req.user?._id.toString();
    if (!userId) {
        throw new ApiError(401, "Authentication required.");
    }
    const reviews = await reviewService.getDriverReviews(userId);
    res
        .status(200)
        .json(new ApiResponse(200, reviews, "Your reviews fetched successfully."));
});
// ============================================================
// UPDATE REVIEW
// ============================================================
// ============================================================
// UPDATE REVIEW
// ============================================================
export const updateReview = asyncHandler(async (req, res) => {
    const userId = req.user?._id.toString();
    if (!userId) {
        throw new ApiError(401, "Authentication required.");
    }
    const { id } = req.params;
    // Validate request body
    const data = updateReviewSchema.parse(req.body);
    // Update review
    const review = await reviewService.updateReview(userId, id, data);
    res
        .status(200)
        .json(new ApiResponse(200, review, "Review updated successfully."));
});
// ============================================================
// DELETE REVIEW
// ============================================================
export const deleteReview = asyncHandler(async (req, res) => {
    const userId = req.user?._id.toString();
    if (!userId) {
        throw new ApiError(401, "Authentication required.");
    }
    const { id } = req.params;
    const review = await reviewService.deleteReview(userId, id);
    res
        .status(200)
        .json(new ApiResponse(200, review, "Review deleted successfully."));
});
//# sourceMappingURL=review.controller.js.map