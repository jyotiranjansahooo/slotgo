import Review from "../models/Review.js";
class ReviewRepository {
    // ============================================================
    // CREATE REVIEW
    // ============================================================
    async create(data) {
        return Review.create(data);
    }
    // ============================================================
    // FIND BY ID
    // ============================================================
    async findById(id) {
        return Review.findById(id);
    }
    // ============================================================
    // FIND BY BOOKING
    // ============================================================
    async findByBookingId(bookingId) {
        return Review.findOne({
            bookingId,
        });
    }
    // ============================================================
    // FIND BY DRIVER
    // ============================================================
    async findByDriver(driverId) {
        return Review.find({
            driverId,
            isActive: true,
        }).sort({
            createdAt: -1,
        });
    }
    // ============================================================
    // FIND BY PARKING
    // ============================================================
    async findByParking(parkingId) {
        return Review.find({
            parkingId,
            isActive: true,
        }).sort({
            createdAt: -1,
        });
    }
    // ============================================================
    // UPDATE REVIEW
    // ============================================================
    async update(id, data) {
        return Review.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    // ============================================================
    // DELETE REVIEW
    // ============================================================
    async delete(id) {
        return Review.findByIdAndDelete(id);
    }
}
export default new ReviewRepository();
//# sourceMappingURL=review.repository.js.map