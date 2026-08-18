import Wallet from "../models/Wallet.js";
class WalletRepository {
    // CREATE WALLET
    async create(data) {
        return Wallet.create(data);
    }
    // FIND BY ID
    async findById(id) {
        return Wallet.findById(id);
    }
    // FIND BY OWNER
    async findByOwnerId(ownerId) {
        return Wallet.findOne({
            ownerId,
        });
    }
    // UPDATE WALLET
    async update(id, data) {
        return Wallet.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    // UPDATE BALANCE
    async updateBalance(id, data) {
        return Wallet.findByIdAndUpdate(id, {
            $set: data,
        }, {
            new: true,
            runValidators: true,
        });
    }
}
export default new WalletRepository();
//# sourceMappingURL=wallet.repository.js.map