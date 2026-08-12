import { ITransaction } from "../models/Transaction.js";
declare class TransactionRepository {
    create(data: Partial<ITransaction>): Promise<any>;
    findById(id: string): Promise<any>;
    findByBooking(bookingId: string): Promise<any[]>;
    findByWallet(walletId: string): Promise<any[]>;
    findByOwner(ownerId: string): Promise<any[]>;
    findByReference(referenceId: string): Promise<any>;
}
declare const _default: TransactionRepository;
export default _default;
