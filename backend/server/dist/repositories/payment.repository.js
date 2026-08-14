import Payment from "../models/Payment.js";
class PaymentRepository {
    async create(data) {
        return Payment.create(data);
    }
    async findById(id) {
        return Payment.findById(id);
    }
    async findByBookingId(bookingId) {
        return Payment.findOne({
            bookingId,
        });
    }
    async findByOrderId(orderId) {
        return Payment.findOne({
            orderId,
        });
    }
    async findByPaymentId(paymentId) {
        return Payment.findOne({
            paymentId,
        });
    }
    async update(id, data) {
        return Payment.findByIdAndUpdate(id, data, {
            new: true,
        });
    }
    async findAll() {
        return Payment.find().sort({
            createdAt: -1,
        });
    }
    async updateStatus(id, status) {
        return Payment.findByIdAndUpdate(id, {
            status,
        }, {
            new: true,
        });
    }
}
export default new PaymentRepository();
//# sourceMappingURL=payment.repository.js.map