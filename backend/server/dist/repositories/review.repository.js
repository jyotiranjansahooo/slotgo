import Review from "../models/Review.js";
class ReviewRepository {
    async create(data) {
        return Review.create(data);
    }
    async findById(reviewId) {
        return Review.findById(reviewId);
    }
    async findByBookingId(bookingId) {
        return Review.findOne({
            bookingId,
        });
    }
    async findByDriver(driverId) {
        return Review.find({
            driverId,
            isActive: true,
        }).sort({
            createdAt: -1,
        });
    }
    async findByOwner(ownerId) {
        return Review.find({
            ownerId,
            isActive: true,
        }).sort({
            createdAt: -1,
        });
    }
    async findByParking(parkingId) {
        return Review.find({
            parkingId,
            isActive: true,
        }).sort({
            createdAt: -1,
        });
    }
    async update(reviewId, data) {
        return Review.findByIdAndUpdate(reviewId, data, {
            new: true,
            runValidators: true,
        });
    }
    async delete(reviewId) {
        return Review.findByIdAndDelete(reviewId);
    }
}
export default new ReviewRepository();
//# sourceMappingURL=review.repository.js.map