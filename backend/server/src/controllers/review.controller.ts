import {
  Request,
  Response,
} from "express";

import asyncHandler from "../utils/asyncHandler.js";

import ApiResponse from "../utils/ApiResponse.js";

import reviewService from "../services/review/review.service.js";

export const createReview =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const review =
        await reviewService.createReview(
          req.user!._id.toString(),
          req.body,
        );

      res.status(201).json(
        new ApiResponse(
          201,
          review,
          "Review created successfully.",
        ),
      );
    },
  );

export const getParkingReviews =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const reviews =
        await reviewService.getParkingReviews(
          req.params.parkingId as string,
        );

      res.status(200).json(
        new ApiResponse(
          200,
          reviews,
          "Reviews fetched successfully.",
        ),
      );
    },
  );