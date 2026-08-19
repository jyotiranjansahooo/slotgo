import mongoose, { Types } from "mongoose";
export interface IPendingRegistration {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
    role: "driver" | "parkingOwner";
    otpHash: string;
    otpExpiresAt: Date;
    otpAttempts: number;
    lastOtpSentAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const PendingRegistration: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default PendingRegistration;
