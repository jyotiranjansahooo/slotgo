import mongoose, { Types } from "mongoose";
export interface IWallet {
    ownerId: Types.ObjectId;
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    totalWithdrawn: number;
    lastWithdrawalAt?: Date;
    isActive: boolean;
}
declare const Wallet: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default Wallet;
