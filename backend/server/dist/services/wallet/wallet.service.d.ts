declare class WalletService {
    getOrCreateWallet(ownerId: string): Promise<any>;
    getWallet(ownerId: string): Promise<any>;
    creditOwnerEarnings(ownerId: string, amount: number, bookingId?: string, referenceId?: string, description?: string): Promise<{
        wallet: any;
        transaction: any;
    }>;
    reverseOwnerEarnings(ownerId: string, amount: number, bookingId: string, referenceId: string, description?: string): Promise<{
        wallet: any;
        transaction: any;
    }>;
    withdraw(ownerId: string, amount: number, referenceId?: string, description?: string): Promise<{
        wallet: any;
        transaction: any;
    }>;
    getTransactions(ownerId: string): Promise<any[]>;
    getTransaction(ownerId: string, transactionId: string): Promise<any>;
}
declare const _default: WalletService;
export default _default;
