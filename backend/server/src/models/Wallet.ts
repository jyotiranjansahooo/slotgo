import mongoose, { Schema, Types } from "mongoose";

export interface IWallet {
  ownerId: Types.ObjectId;

  availableBalance: number;

  pendingBalance: number;

  totalEarnings: number;

  totalWithdrawn: number;

  lastWithdrawalAt?: Date;

  isActive: boolean;
}

const walletSchema = new Schema<IWallet>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },

    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastWithdrawalAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Wallet =
  mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", walletSchema);

export default Wallet;
