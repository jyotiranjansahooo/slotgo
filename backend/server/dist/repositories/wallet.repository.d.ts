import { IWallet } from "../models/Wallet.js";
declare class WalletRepository {
    create(data: Partial<IWallet>): Promise<any>;
    findById(id: string): Promise<any>;
    findByOwner(ownerId: string): Promise<any>;
    update(id: string, data: Partial<IWallet>): Promise<any>;
    delete(id: string): Promise<any>;
    incrementPendingBalance(ownerId: string, amount: number): Promise<any>;
    transferPendingToAvailable(ownerId: string, amount: number): Promise<any>;
    withdraw(ownerId: string, amount: number): Promise<any>;
}
declare const _default: WalletRepository;
export default _default;
