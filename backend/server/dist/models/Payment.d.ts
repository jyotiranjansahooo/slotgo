import mongoose, { Types } from "mongoose";
import { PaymentGateway, PaymentStatus, RefundStatus } from "../constants/payment.js";
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
declare const Payment: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default Payment;
