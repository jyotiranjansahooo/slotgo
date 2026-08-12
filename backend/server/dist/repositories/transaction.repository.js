import Transaction from "../models/Transaction.js";
class TransactionRepository {
    async create(data) {
        return Transaction.create(data);
    }
    async findById(id) {
        return Transaction.findById(id);
    }
    async findByBooking(bookingId) {
        return Transaction.find({
            bookingId,
        }).sort({
            createdAt: -1,
        });
    }
    async findByWallet(walletId) {
        return Transaction.find({
            walletId,
        }).sort({
            createdAt: -1,
        });
    }
    async findByOwner(ownerId) {
        return Transaction.find({
            ownerId,
        }).sort({
            createdAt: -1,
        });
    }
    async findByReference(referenceId) {
        return Transaction.findOne({
            referenceId,
        });
    }
}
export default new TransactionRepository();
//# sourceMappingURL=transaction.repository.js.map