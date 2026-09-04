import mongoose, { Types } from "mongoose";
import { BookingMode } from "../constants/booking.js";
import { VehicleType } from "../constants/vehicle.js";
export interface IBookingCheckout {
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
    orderId: string;
    reservedUntil: Date;
    expiresAt: Date;
}
declare const BookingCheckout: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default BookingCheckout;
