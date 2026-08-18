import Transaction from "../models/Transaction.js";
class TransactionRepository {
    // CREATE TRANSACTION
    async create(data) {
        return Transaction.create(data);
    }
    // FIND BY ID
    async findById(id) {
        return Transaction.findById(id);
    }
    // FIND BY REFERENCE
    async findByReferenceId(referenceId) {
        return Transaction.findOne({
            referenceId,
        });
    }
    // FIND WALLET TRANSACTIONS
    async findByWalletId(walletId) {
        return Transaction.find({
            walletId,
        }).sort({
            createdAt: -1,
        });
    }
    // FIND OWNER TRANSACTIONS
    async findByOwnerId(ownerId) {
        return Transaction.find({
            ownerId,
        }).sort({
            createdAt: -1,
        });
    }
    // FIND DRIVER TRANSACTIONS
    async findByDriverId(driverId) {
        return Transaction.find({
            driverId,
        }).sort({
            createdAt: -1,
        });
    }
    // UPDATE TRANSACTION
    async update(id, data) {
        return Transaction.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
}
export default new TransactionRepository();
//# sourceMappingURL=transaction.repository.js.map