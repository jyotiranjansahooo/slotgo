import { IWallet } from "../models/Wallet.js";
declare class WalletRepository {
    create(data: Partial<IWallet>): Promise<any>;
    findById(id: string): Promise<any>;
    findByOwnerId(ownerId: string): Promise<any>;
    update(id: string, data: Partial<IWallet>): Promise<any>;
    updateBalance(id: string, data: {
        availableBalance?: number;
        pendingBalance?: number;
        totalEarnings?: number;
        totalWithdrawn?: number;
        lastWithdrawalAt?: Date;
    }): Promise<any>;
}
declare const _default: WalletRepository;
export default _default;
