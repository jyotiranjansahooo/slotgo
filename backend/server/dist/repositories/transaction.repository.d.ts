import { ITransaction } from "../models/Transaction.js";
declare class TransactionRepository {
    create(data: Partial<ITransaction>): Promise<any>;
    findById(id: string): Promise<any>;
    findByReferenceId(referenceId: string): Promise<any>;
    findByWalletId(walletId: string): Promise<any[]>;
    findByOwnerId(ownerId: string): Promise<any[]>;
    findByDriverId(driverId: string): Promise<any[]>;
    update(id: string, data: Partial<ITransaction>): Promise<any>;
}
declare const _default: TransactionRepository;
export default _default;
