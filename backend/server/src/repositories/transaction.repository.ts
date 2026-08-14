import Transaction, { ITransaction } from "../models/Transaction.js";

class TransactionRepository {
  // ============================================================
  // CREATE TRANSACTION
  // ============================================================

  async create(data: Partial<ITransaction>) {
    return Transaction.create(data);
  }

  // ============================================================
  // FIND BY ID
  // ============================================================

  async findById(id: string) {
    return Transaction.findById(id);
  }

  // ============================================================
  // FIND BY REFERENCE
  // ============================================================

  async findByReferenceId(referenceId: string) {
    return Transaction.findOne({
      referenceId,
    });
  }

  // ============================================================
  // FIND WALLET TRANSACTIONS
  // ============================================================

  async findByWalletId(walletId: string) {
    return Transaction.find({
      walletId,
    }).sort({
      createdAt: -1,
    });
  }

  // ============================================================
  // FIND OWNER TRANSACTIONS
  // ============================================================

  async findByOwnerId(ownerId: string) {
    return Transaction.find({
      ownerId,
    }).sort({
      createdAt: -1,
    });
  }

  // ============================================================
  // FIND DRIVER TRANSACTIONS
  // ============================================================

  async findByDriverId(driverId: string) {
    return Transaction.find({
      driverId,
    }).sort({
      createdAt: -1,
    });
  }

  // ============================================================
  // UPDATE TRANSACTION
  // ============================================================

  async update(id: string, data: Partial<ITransaction>) {
    return Transaction.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
}

export default new TransactionRepository();
