import mongoose, { Types } from "mongoose";
import { WalletTransactionStatus, WalletTransactionType } from "../constants/wallet.js";
export interface ITransaction {
    bookingId?: Types.ObjectId;
    walletId: Types.ObjectId;
    driverId?: Types.ObjectId;
    ownerId?: Types.ObjectId;
    amount: number;
    type: WalletTransactionType;
    status: WalletTransactionStatus;
    description: string;
    referenceId: string;
    balanceBefore: number;
    balanceAfter: number;
}
declare const Transaction: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default Transaction;
