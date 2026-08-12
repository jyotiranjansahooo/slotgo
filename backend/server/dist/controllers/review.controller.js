import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import reviewService from "../services/review/review.service.js";
export const createReview = asyncHandler(async (req, res) => {
    const review = await reviewService.createReview(req.user._id.toString(), req.body);
    res.status(201).json(new ApiResponse(201, review, "Review created successfully."));
});
export const getParkingReviews = asyncHandler(async (req, res) => {
    const reviews = await reviewService.getParkingReviews(req.params.parkingId);
    res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully."));
});
//# sourceMappingURL=review.controller.js.map