import mongoose, { Types } from "mongoose";
import { BookingMode, BookingStatus, PaymentStatus, CancelledBy } from "../constants/booking.js";
import { VehicleType } from "../constants/vehicle.js";
export interface IBooking {
    bookingNumber: string;
    driverId: Types.ObjectId;
    ownerId: Types.ObjectId;
    parkingId: Types.ObjectId;
    slotId: Types.ObjectId;
    vehicleId: Types.ObjectId;
    vehicleType: VehicleType;
    bookingMode: BookingMode;
    startTime: Date;
    endTime: Date;
    parkingAmount: number;
    discountAmount: number;
    actualAmount: number;
    ownerCommission: number;
    driverServiceFee: number;
    ownerReceives: number;
    driverPays: number;
    payment: {
        method: string;
        gateway: string;
        transactionId: string;
        paidAt?: Date;
    };
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
    qrCode: string;
    verificationPin: string;
    checkedInAt?: Date;
    checkedOutAt?: Date;
    driverSnapshot: {
        name: string;
        phoneNumber: string;
    };
    parkingSnapshot: {
        parkingName: string;
        address: string;
    };
    vehicleSnapshot: {
        registrationNumber: string;
        brand: string;
        vehicleModel: string;
        vehicleType: VehicleType;
    };
    cancellation?: {
        cancelledBy: CancelledBy;
        reason: string;
        cancelledAt: Date;
        refundAmount: number;
        penaltyAmount: number;
    };
}
declare const Booking: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default Booking;
