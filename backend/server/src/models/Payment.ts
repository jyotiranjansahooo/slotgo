import mongoose, { Schema, Types } from "mongoose";

import {
  PAYMENT_GATEWAY,
  PAYMENT_GATEWAY_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
  REFUND_STATUS,
  REFUND_STATUS_VALUES,
  PaymentGateway,
  PaymentStatus,
  RefundStatus,
} from "../constants/payment.js";

export interface IPayment {
  bookingId: Types.ObjectId;

  driverId: Types.ObjectId;

  ownerId: Types.ObjectId;

  gateway: PaymentGateway;

  orderId: string;

  paymentId?: string;

  signature?: string;

  amount: number;

  currency: string;

  status: PaymentStatus;

  refundId?: string;

  refundAmount: number;

  refundStatus: RefundStatus;

  paidAt?: Date;

  refundedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      immutable: true,
      index: true,
    },

    driverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    gateway: {
      type: String,
      enum: PAYMENT_GATEWAY_VALUES,
      default: PAYMENT_GATEWAY.RAZORPAY,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentId: {
      type: String,
      default: "",
    },

    signature: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.CREATED,
    },

    refundId: {
      type: String,
      default: "",
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundStatus: {
      type: String,
      enum: REFUND_STATUS_VALUES,
      default: REFUND_STATUS.NONE,
    },

    paidAt: {
      type: Date,
    },

    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

paymentSchema.index({
  driverId: 1,
  createdAt: -1,
});

paymentSchema.index({
  ownerId: 1,
  createdAt: -1,
});

const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
