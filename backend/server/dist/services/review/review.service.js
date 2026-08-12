import ApiError from "../../utils/ApiError.js";
import reviewRepository from "../../repositories/review.repository.js";
import bookingRepository from "../../repositories/booking.repository.js";
import parkingRepository from "../../repositories/parking.repository.js";
import { BOOKING_STATUS, } from "../../constants/booking.js";
class ReviewService {
    async createReview(driverId, data) {
        const booking = await bookingRepository.findById(data.bookingId);
        if (!booking) {
            throw new ApiError(404, "Booking not found.");
        }
        // Only the driver who made the booking
        // can review it.
        if (booking.driverId.toString() !==
            driverId) {
            throw new ApiError(403, "You are not authorized to review this booking.");
        }
        // Review only after completion
        if (booking.bookingStatus !==
            BOOKING_STATUS.COMPLETED) {
            throw new ApiError(400, "Only completed bookings can be reviewed.");
        }
        // Prevent duplicate review
        const existingReview = await reviewRepository.findByBookingId(data.bookingId);
        if (existingReview) {
            throw new ApiError(409, "This booking has already been reviewed.");
        }
        const review = await reviewRepository.create({
            bookingId: booking._id,
            driverId: booking.driverId,
            ownerId: booking.ownerId,
            parkingId: booking.parkingId,
            rating: data.rating,
            comment: data.comment ?? "",
            isActive: true,
        });
        // Update parking rating
        const reviews = await reviewRepository.findByParking(booking.parkingId.toString());
        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = totalReviews > 0
            ? Number((totalRating /
                totalReviews).toFixed(2))
            : 0;
        await parkingRepository.update(booking.parkingId.toString(), {
            averageRating,
            totalReviews,
        });
        return review;
    }
    async getParkingReviews(parkingId) {
        const parking = await parkingRepository.findById(parkingId);
        if (!parking) {
            throw new ApiError(404, "Parking not found.");
        }
        return reviewRepository.findByParking(parkingId);
    }
}
export default new ReviewService();
//# sourceMappingURL=review.service.js.map