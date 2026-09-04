import BookingCheckout from "../models/BookingCheckout.js";
class BookingCheckoutRepository {
    async create(data) {
        return BookingCheckout.create(data);
    }
    async findById(id) {
        return BookingCheckout.findById(id);
    }
    async findByOrderId(orderId) {
        return BookingCheckout.findOne({
            orderId,
        });
    }
    async findByDriver(driverId) {
        return BookingCheckout.find({
            driverId,
        }).sort({
            createdAt: -1,
        });
    }
    async delete(id) {
        return BookingCheckout.findByIdAndDelete(id);
    }
    async deleteByOrderId(orderId) {
        return BookingCheckout.findOneAndDelete({
            orderId,
        });
    }
    async findExpired(now) {
        return BookingCheckout.find({
            expiresAt: {
                $lte: now,
            },
        });
    }
}
export default new BookingCheckoutRepository();
//# sourceMappingURL=bookingCheckout.repository.js.map