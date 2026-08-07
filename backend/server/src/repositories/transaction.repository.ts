import Transaction, { ITransaction } from "../models/Transaction.js";

class TransactionRepository {
  async create(data: Partial<ITransaction>) {
    return Transaction.create(data);
  }

  async findById(id: string) {
    return Transaction.findById(id);
  }

  async findByBooking(bookingId: string) {
    return Transaction.find({
      bookingId,
    }).sort({
      createdAt: -1,
    });
  }

  async findByWallet(walletId: string) {
    return Transaction.find({
      walletId,
    }).sort({
      createdAt: -1,
    });
  }

  async findByOwner(ownerId: string) {
    return Transaction.find({
      ownerId,
    }).sort({
      createdAt: -1,
    });
  }

  async findByReference(referenceId: string) {
    return Transaction.findOne({
      referenceId,
    });
  }
}

export default new TransactionRepository();
