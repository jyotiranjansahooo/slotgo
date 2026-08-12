import Review from "../models/Review.js";
class ReviewRepository {
    async create(data) {
        return Review.create(data);
    }
    async findById(id) {
        return Review.findById(id);
    }
    async findByBookingId(bookingId) {
        return Review.findOne({
            bookingId,
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
    async update(id, data) {
        return Review.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    async delete(id) {
        return Review.findByIdAndUpdate(id, {
            isActive: false,
        }, {
            new: true,
        });
    }
}
export default new ReviewRepository();
//# sourceMappingURL=review.repository.js.map