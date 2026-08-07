import Wallet, { IWallet } from "../models/Wallet.js";

class WalletRepository {
  async create(data: Partial<IWallet>) {
    return Wallet.create(data);
  }

  async findById(id: string) {
    return Wallet.findById(id);
  }

  async findByOwner(ownerId: string) {
    return Wallet.findOne({ ownerId });
  }

  async update(id: string, data: Partial<IWallet>) {
    return Wallet.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async delete(id: string) {
    return Wallet.findByIdAndDelete(id);
  }

  async incrementPendingBalance(ownerId: string, amount: number) {
    return Wallet.findOneAndUpdate(
      { ownerId },
      {
        $inc: {
          pendingBalance: amount,
          totalEarnings: amount,
        },
      },
      {
        new: true,
      },
    );
  }

  async transferPendingToAvailable(ownerId: string, amount: number) {
    return Wallet.findOneAndUpdate(
      { ownerId },
      {
        $inc: {
          pendingBalance: -amount,
          availableBalance: amount,
        },
      },
      {
        new: true,
      },
    );
  }

  async withdraw(ownerId: string, amount: number) {
    return Wallet.findOneAndUpdate(
      { ownerId },
      {
        $inc: {
          availableBalance: -amount,
          totalWithdrawn: amount,
        },
        lastWithdrawalAt: new Date(),
      },
      {
        new: true,
      },
    );
  }
}

export default new WalletRepository();
