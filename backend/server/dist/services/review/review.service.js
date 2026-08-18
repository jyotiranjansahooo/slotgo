import ApiError from "../../utils/ApiError.js";
import reviewRepository from "../../repositories/review.repository.js";
import bookingRepository from "../../repositories/booking.repository.js";
import { BOOKING_STATUS, PAYMENT_STATUS as BOOKING_PAYMENT_STATUS, } from "../../constants/booking.js";
class ReviewService {
    // CREATE REVIEW
    async createReview(driverId, data) {
        // ----------------------------------------------------------
        // VALIDATE RATING
        // ----------------------------------------------------------
        if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
            throw new ApiError(400, "Rating must be an integer between 1 and 5.");
        }
        // ----------------------------------------------------------
        // FIND BOOKING
        // ----------------------------------------------------------
        const booking = await bookingRepository.findById(data.bookingId);
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        // ----------------------------------------------------------
        // DRIVER AUTHORIZATION
        // ----------------------------------------------------------
        if (booking.driverId.toString() !== driverId) {
            throw new ApiError(403, "You are not authorized to review this booking.");
        }
        // ----------------------------------------------------------
        // BOOKING MUST BE COMPLETED
        // ----------------------------------------------------------
        if (booking.bookingStatus !== BOOKING_STATUS.COMPLETED) {
            throw new ApiError(400, "Only completed bookings can be reviewed.");
        }
        // ----------------------------------------------------------
        // PAYMENT MUST BE COMPLETED
        // ----------------------------------------------------------
        if (booking.paymentStatus !== BOOKING_PAYMENT_STATUS.PAID) {
            throw new ApiError(400, "Only paid bookings can be reviewed.");
        }
        // ----------------------------------------------------------
        // PREVENT DUPLICATE REVIEW
        // ----------------------------------------------------------
        const existingReview = await reviewRepository.findByBookingId(data.bookingId);
        if (existingReview) {
            throw new ApiError(409, "A review already exists for this booking.");
        }
        // ----------------------------------------------------------
        // CREATE REVIEW
        // ----------------------------------------------------------
        const review = await reviewRepository.create({
            bookingId: booking._id,
            driverId: booking.driverId,
            ownerId: booking.ownerId,
            parkingId: booking.parkingId,
            rating: data.rating,
            comment: data.comment?.trim() ?? "",
            isActive: true,
        });
        return review;
    }
    // GET REVIEW BY ID
    async getReviewById(reviewId) {
        const review = await reviewRepository.findById(reviewId);
        if (!review) {
            throw new ApiError(404, "Review not found.");
        }
        return review;
    }
    // GET PARKING REVIEWS
    async getParkingReviews(parkingId) {
        return reviewRepository.findByParking(parkingId);
    }
    // GET OWNER REVIEWS
    async getOwnerReviews(ownerId) {
        return reviewRepository.findByOwner(ownerId);
    }
    // GET DRIVER REVIEWS
    async getDriverReviews(driverId) {
        return reviewRepository.findByDriver(driverId);
    }
    // UPDATE REVIEW
    async updateReview(driverId, reviewId, data) {
        const review = await reviewRepository.findById(reviewId);
        if (!review) {
            throw new ApiError(404, "Review not found.");
        }
        // ----------------------------------------------------------
        // DRIVER AUTHORIZATION
        // ----------------------------------------------------------
        if (review.driverId.toString() !== driverId) {
            throw new ApiError(403, "You are not authorized to update this review.");
        }
        // ----------------------------------------------------------
        // VALIDATE RATING
        // ----------------------------------------------------------
        if (data.rating !== undefined) {
            if (!Number.isInteger(data.rating) ||
                data.rating < 1 ||
                data.rating > 5) {
                throw new ApiError(400, "Rating must be an integer between 1 and 5.");
            }
        }
        // ----------------------------------------------------------
        // PREPARE UPDATE
        // ----------------------------------------------------------
        const updateData = {};
        if (data.rating !== undefined) {
            updateData.rating = data.rating;
        }
        if (data.comment !== undefined) {
            updateData.comment = data.comment.trim();
        }
        // ----------------------------------------------------------
        // UPDATE
        // ----------------------------------------------------------
        const updatedReview = await reviewRepository.update(reviewId, updateData);
        if (!updatedReview) {
            throw new ApiError(500, "Unable to update review.");
        }
        return updatedReview;
    }
    // DELETE REVIEW
    async deleteReview(driverId, reviewId) {
        const review = await reviewRepository.findById(reviewId);
        if (!review) {
            throw new ApiError(404, "Review not found.");
        }
        // ----------------------------------------------------------
        // DRIVER AUTHORIZATION
        // ----------------------------------------------------------
        if (review.driverId.toString() !== driverId) {
            throw new ApiError(403, "You are not authorized to delete this review.");
        }
        // ----------------------------------------------------------
        // SOFT DELETE
        // ----------------------------------------------------------
        const updatedReview = await reviewRepository.update(reviewId, {
            isActive: false,
        });
        if (!updatedReview) {
            throw new ApiError(500, "Unable to delete review.");
        }
        return updatedReview;
    }
}
export default new ReviewService();
//# sourceMappingURL=review.service.js.map