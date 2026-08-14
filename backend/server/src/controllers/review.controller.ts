import { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import reviewService from "../services/review/review.service.js";

import { createReviewSchema } from "../validations/review/create.validation.js";
import { updateReviewSchema } from "../validations/review/update.validation.js";

// ============================================================
// CREATE REVIEW
// ============================================================

export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const data = createReviewSchema.parse(
      req.body,
    );

    const driverId = req.user!._id.toString();

    const review =
      await reviewService.createReview(
        driverId,
        data,
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        review,
        "Review created successfully.",
      ),
    );
  },
);

// ============================================================
// GET REVIEW BY ID
// ============================================================

export const getReviewById = asyncHandler(
  async (req: Request, res: Response) => {
    const reviewId =
      req.params.reviewId as string;

    const review =
      await reviewService.getReviewById(
        reviewId,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        review,
        "Review fetched successfully.",
      ),
    );
  },
);

// ============================================================
// GET DRIVER REVIEWS
// ============================================================

export const getDriverReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const driverId =
      req.params.driverId as string;

    const reviews =
      await reviewService.getDriverReviews(
        driverId,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        reviews,
        "Driver reviews fetched successfully.",
      ),
    );
  },
);

// ============================================================
// GET PARKING REVIEWS
// ============================================================

export const getParkingReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const parkingId =
      req.params.parkingId as string;

    const reviews =
      await reviewService.getParkingReviews(
        parkingId,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        reviews,
        "Parking reviews fetched successfully.",
      ),
    );
  },
);

// ============================================================
// UPDATE REVIEW
// ============================================================

export const updateReview = asyncHandler(
  async (req: Request, res: Response) => {
    const data =
      updateReviewSchema.parse(
        req.body,
      );

    const driverId = req.user!._id.toString();

    const reviewId =
      req.params.reviewId as string;

    const review =
      await reviewService.updateReview(
        driverId,
        reviewId,
        data,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        review,
        "Review updated successfully.",
      ),
    );
  },
);

// ============================================================
// DELETE REVIEW
// ============================================================

export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    const driverId = req.user!._id.toString();

    const reviewId =
      req.params.reviewId as string;

    const review =
      await reviewService.deleteReview(
        driverId,
        reviewId,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        review,
        "Review deleted successfully.",
      ),
    );
  },
);