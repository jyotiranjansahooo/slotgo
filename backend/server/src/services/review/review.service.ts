import ApiError from "../../utils/ApiError.js";

import reviewRepository from "../../repositories/review.repository.js";
import bookingRepository from "../../repositories/booking.repository.js";

import {
  BOOKING_STATUS,
} from "../../constants/booking.js";

import { CreateReviewInput } from "../../validations/review/create.validation.js";
import { UpdateReviewInput } from "../../validations/review/update.validation.js";

class ReviewService {
  // ============================================================
  // CREATE REVIEW
  // ============================================================

  async createReview(
    driverId: string,
    data: CreateReviewInput,
  ) {
    // ----------------------------------------------------------
    // FIND BOOKING
    // ----------------------------------------------------------

    const booking =
      await bookingRepository.findById(
        data.bookingId,
      );

    if (!booking) {
      throw new ApiError(
        404,
        "Booking not found.",
      );
    }

    // ----------------------------------------------------------
    // DRIVER AUTHORIZATION
    // ----------------------------------------------------------

    if (
      booking.driverId.toString() !==
      driverId
    ) {
      throw new ApiError(
        403,
        "You are not authorized to review this booking.",
      );
    }

    // ----------------------------------------------------------
    // BOOKING STATUS
    // ----------------------------------------------------------

    if (
      booking.bookingStatus !==
      BOOKING_STATUS.COMPLETED
    ) {
      throw new ApiError(
        400,
        "You can only review a completed booking.",
      );
    }

    // ----------------------------------------------------------
    // CHECK EXISTING REVIEW
    // ----------------------------------------------------------

    const existingReview =
      await reviewRepository.findByBookingId(
        data.bookingId,
      );

    if (existingReview) {
      throw new ApiError(
        409,
        "This booking has already been reviewed.",
      );
    }

    // ----------------------------------------------------------
    // CREATE REVIEW
    // ----------------------------------------------------------

    const review =
      await reviewRepository.create({
        bookingId:
          booking._id,

        driverId:
          booking.driverId,

        ownerId:
          booking.ownerId,

        parkingId:
          booking.parkingId,

        rating:
          data.rating,

        comment:
          data.comment ?? "",

        isActive: true,
      });

    return review;
  }

  // ============================================================
  // GET REVIEW BY ID
  // ============================================================

  async getReviewById(
    reviewId: string,
  ) {
    const review =
      await reviewRepository.findById(
        reviewId,
      );

    if (
      !review ||
      !review.isActive
    ) {
      throw new ApiError(
        404,
        "Review not found.",
      );
    }

    return review;
  }

  // ============================================================
  // GET DRIVER REVIEWS
  // ============================================================

  async getDriverReviews(
    driverId: string,
  ) {
    return reviewRepository.findByDriver(
      driverId,
    );
  }

  // ============================================================
  // GET PARKING REVIEWS
  // ============================================================

  async getParkingReviews(
    parkingId: string,
  ) {
    return reviewRepository.findByParking(
      parkingId,
    );
  }

  // ============================================================
  // UPDATE REVIEW
  // ============================================================

  async updateReview(
    driverId: string,
    reviewId: string,
    data: UpdateReviewInput,
  ) {
    const review =
      await reviewRepository.findById(
        reviewId,
      );

    if (
      !review ||
      !review.isActive
    ) {
      throw new ApiError(
        404,
        "Review not found.",
      );
    }

    // ----------------------------------------------------------
    // DRIVER AUTHORIZATION
    // ----------------------------------------------------------

    if (
      review.driverId.toString() !==
      driverId
    ) {
      throw new ApiError(
        403,
        "You are not authorized to update this review.",
      );
    }

    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------

    const updatedReview =
      await reviewRepository.update(
        reviewId,
        data,
      );

    if (!updatedReview) {
      throw new ApiError(
        500,
        "Unable to update review.",
      );
    }

    return updatedReview;
  }

  // ============================================================
  // DELETE REVIEW
  // ============================================================

  async deleteReview(
    driverId: string,
    reviewId: string,
  ) {
    const review =
      await reviewRepository.findById(
        reviewId,
      );

    if (
      !review ||
      !review.isActive
    ) {
      throw new ApiError(
        404,
        "Review not found.",
      );
    }

    // ----------------------------------------------------------
    // DRIVER AUTHORIZATION
    // ----------------------------------------------------------

    if (
      review.driverId.toString() !==
      driverId
    ) {
      throw new ApiError(
        403,
        "You are not authorized to delete this review.",
      );
    }

    // ----------------------------------------------------------
    // SOFT DELETE
    // ----------------------------------------------------------

    const deletedReview =
      await reviewRepository.update(
        reviewId,
        {
          isActive: false,
        },
      );

    if (!deletedReview) {
      throw new ApiError(
        500,
        "Unable to delete review.",
      );
    }

    return deletedReview;
  }
}

export default new ReviewService();