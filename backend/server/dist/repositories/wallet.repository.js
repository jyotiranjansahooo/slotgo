import Wallet from "../models/Wallet.js";
class WalletRepository {
    async create(data) {
        return Wallet.create(data);
    }
    async findById(id) {
        return Wallet.findById(id);
    }
    async findByOwner(ownerId) {
        return Wallet.findOne({ ownerId });
    }
    async update(id, data) {
        return Wallet.findByIdAndUpdate(id, data, {
            new: true,
        });
    }
    async delete(id) {
        return Wallet.findByIdAndDelete(id);
    }
    async incrementPendingBalance(ownerId, amount) {
        return Wallet.findOneAndUpdate({ ownerId }, {
            $inc: {
                pendingBalance: amount,
                totalEarnings: amount,
            },
        }, {
            new: true,
        });
    }
    async transferPendingToAvailable(ownerId, amount) {
        return Wallet.findOneAndUpdate({ ownerId }, {
            $inc: {
                pendingBalance: -amount,
                availableBalance: amount,
            },
        }, {
            new: true,
        });
    }
    async withdraw(ownerId, amount) {
        return Wallet.findOneAndUpdate({ ownerId }, {
            $inc: {
                availableBalance: -amount,
                totalWithdrawn: amount,
            },
            lastWithdrawalAt: new Date(),
        }, {
            new: true,
        });
    }
}
export default new WalletRepository();
//# sourceMappingURL=wallet.repository.js.map