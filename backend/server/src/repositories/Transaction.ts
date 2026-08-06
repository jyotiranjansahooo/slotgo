import mongoose, { Schema, Types } from "mongoose";

import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_STATUS_VALUES,
  WALLET_TRANSACTION_TYPE,
  WALLET_TRANSACTION_TYPE_VALUES,
  WalletTransactionStatus,
  WalletTransactionType,
} from "../constants/wallet.js";

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

const transactionSchema = new Schema<ITransaction>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },

    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      immutable: true,
      index: true,
    },

    driverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: WALLET_TRANSACTION_TYPE_VALUES,
      required: true,
    },

    status: {
      type: String,
      enum: WALLET_TRANSACTION_STATUS_VALUES,
      default: WALLET_TRANSACTION_STATUS.PENDING,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    referenceId: {
      type: String,
      default: "",
      index: true,
    },

    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* Indexes */

transactionSchema.index({
  walletId: 1,
  createdAt: -1,
});

transactionSchema.index({
  ownerId: 1,
  createdAt: -1,
});

transactionSchema.index({
  driverId: 1,
  createdAt: -1,
});

transactionSchema.index({
  bookingId: 1,
});

transactionSchema.index({
  type: 1,
  status: 1,
});

/* Model */

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>(
    "Transaction",
    transactionSchema,
  );

export default Transaction;