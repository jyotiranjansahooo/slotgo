import Wallet, { IWallet } from "../models/Wallet.js";

class WalletRepository {
    // CREATE WALLET
  
  async create(data: Partial<IWallet>) {
    return Wallet.create(data);
  }

    // FIND BY ID
  
  async findById(id: string) {
    return Wallet.findById(id);
  }

    // FIND BY OWNER
  
  async findByOwnerId(ownerId: string) {
    return Wallet.findOne({
      ownerId,
    });
  }

    // UPDATE WALLET
  
  async update(
    id: string,
    data: Partial<IWallet>,
  ) {
    return Wallet.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      },
    );
  }

    // UPDATE BALANCE
  
  async updateBalance(
    id: string,
    data: {
      availableBalance?: number;
      pendingBalance?: number;
      totalEarnings?: number;
      totalWithdrawn?: number;
      lastWithdrawalAt?: Date;
    },
  ) {
    return Wallet.findByIdAndUpdate(
      id,
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
}

export default new WalletRepository();