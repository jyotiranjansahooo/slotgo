import mongoose, { Schema } from "mongoose";
import { BOOKING_MODE_VALUES } from "../constants/booking.js";
const bookingCheckoutSchema = new Schema({
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
    },
    parkingId: {
        type: Schema.Types.ObjectId,
        ref: "Parking",
        required: true,
        immutable: true,
        index: true,
    },
    slotId: {
        type: Schema.Types.ObjectId,
        ref: "ParkingSlot",
        required: true,
        immutable: true,
        index: true,
    },
    vehicleId: {
        type: Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true,
        immutable: true,
        index: true,
    },
    vehicleType: {
        type: String,
        required: true,
    },
    bookingMode: {
        type: String,
        enum: BOOKING_MODE_VALUES,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    parkingAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    actualAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    ownerCommission: {
        type: Number,
        required: true,
        min: 0,
    },
    driverServiceFee: {
        type: Number,
        required: true,
        min: 0,
    },
    ownerReceives: {
        type: Number,
        required: true,
        min: 0,
    },
    driverPays: {
        type: Number,
        required: true,
        min: 0,
    },
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    reservedUntil: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
bookingCheckoutSchema.index({
    driverId: 1,
    createdAt: -1,
});
bookingCheckoutSchema.index({
    expiresAt: 1,
});
const BookingCheckout = mongoose.models.BookingCheckout ||
    mongoose.model("BookingCheckout", bookingCheckoutSchema);
export default BookingCheckout;
//# sourceMappingURL=BookingCheckout.js.map