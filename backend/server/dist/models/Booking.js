import mongoose, { Schema } from "mongoose";
import { BOOKING_STATUS, BOOKING_STATUS_VALUES, PAYMENT_STATUS as BOOKING_PAYMENT_STATUS, PAYMENT_STATUS_VALUES as BOOKING_PAYMENT_STATUS_VALUES, BOOKING_MODE_VALUES, CANCELLED_BY_VALUES, } from "../constants/booking.js";
import { PAYMENT_STATUS as GATEWAY_PAYMENT_STATUS, PAYMENT_STATUS_VALUES as GATEWAY_PAYMENT_STATUS_VALUES, } from "../constants/payment.js";
/* ============================================================
   DRIVER SNAPSHOT SCHEMA
   ============================================================ */
const driverSnapshotSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    _id: false,
});
/* ============================================================
   PARKING SNAPSHOT SCHEMA
   ============================================================ */
const parkingSnapshotSchema = new Schema({
    parkingName: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    _id: false,
});
/* ============================================================
   VEHICLE SNAPSHOT SCHEMA
   ============================================================ */
const vehicleSnapshotSchema = new Schema({
    registrationNumber: {
        type: String,
        required: true,
        trim: true,
    },
    brand: {
        type: String,
        required: true,
        trim: true,
    },
    vehicleModel: {
        type: String,
        required: true,
        trim: true,
    },
    vehicleType: {
        type: String,
        required: true,
    },
}, {
    _id: false,
});
/* ============================================================
   CANCELLATION SCHEMA
   ============================================================ */
const cancellationSchema = new Schema({
    cancelledBy: {
        type: String,
        enum: CANCELLED_BY_VALUES,
        required: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    cancelledAt: {
        type: Date,
        required: true,
    },
    refundAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    penaltyAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    _id: false,
});
/* ============================================================
   PAYMENT SNAPSHOT SCHEMA
   ============================================================ */
const paymentSchema = new Schema({
    method: {
        type: String,
        default: "",
    },
    gateway: {
        type: String,
        default: "",
    },
    transactionId: {
        type: String,
        default: "",
    },
    paidAt: {
        type: Date,
    },
}, {
    _id: false,
});
/* ============================================================
   BOOKING SCHEMA
   ============================================================ */
const bookingSchema = new Schema({
    /* ==========================================================
       BOOKING NUMBER
       ========================================================== */
    bookingNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    },
    /* ==========================================================
       DRIVER
       ========================================================== */
    driverId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        immutable: true,
        index: true,
    },
    /* ==========================================================
       OWNER
       ========================================================== */
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        immutable: true,
        index: true,
    },
    /* ==========================================================
       PARKING
       ========================================================== */
    parkingId: {
        type: Schema.Types.ObjectId,
        ref: "Parking",
        required: true,
        immutable: true,
        index: true,
    },
    /* ==========================================================
       SLOT
       ========================================================== */
    slotId: {
        type: Schema.Types.ObjectId,
        ref: "ParkingSlot",
        required: true,
        immutable: true,
        index: true,
    },
    /* ==========================================================
       VEHICLE
       ========================================================== */
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
    /* ==========================================================
       BOOKING MODE
       ========================================================== */
    bookingMode: {
        type: String,
        enum: BOOKING_MODE_VALUES,
        required: true,
    },
    /* ==========================================================
       TIME
       ========================================================== */
    startTime: {
        type: Date,
        required: true,
        index: true,
    },
    endTime: {
        type: Date,
        required: true,
        index: true,
    },
    /* ==========================================================
       NORMAL PRICING
       ========================================================== */
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
    /* ==========================================================
       OVERTIME
       ========================================================== */
    overtimeMinutes: {
        type: Number,
        default: 0,
        min: 0,
    },
    overtimeParkingAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    overtimeFine: {
        type: Number,
        default: 0,
        min: 0,
    },
    overtimeTotal: {
        type: Number,
        default: 0,
        min: 0,
    },
    /* ==========================================================
       OVERTIME RAZORPAY PAYMENT
       ========================================================== */
    overtimePaymentOrderId: {
        type: String,
        default: "",
    },
    overtimePaymentId: {
        type: String,
        default: "",
    },
    overtimePaymentStatus: {
        type: String,
        enum: GATEWAY_PAYMENT_STATUS_VALUES,
        default: GATEWAY_PAYMENT_STATUS.CREATED,
        required: true,
    },
    overtimePaidAt: {
        type: Date,
    },
    /* ==========================================================
       NORMAL BOOKING PAYMENT STATUS
       ========================================================== */
    paymentStatus: {
        type: String,
        enum: BOOKING_PAYMENT_STATUS_VALUES,
        default: BOOKING_PAYMENT_STATUS.PENDING,
        required: true,
    },
    /* ==========================================================
       BOOKING STATUS
       ========================================================== */
    bookingStatus: {
        type: String,
        enum: BOOKING_STATUS_VALUES,
        default: BOOKING_STATUS.PENDING,
        required: true,
        index: true,
    },
    /* ==========================================================
       PAYMENT DETAILS
       ========================================================== */
    payment: {
        type: paymentSchema,
        default: undefined,
    },
    /* ==========================================================
       QR CODE
       ========================================================== */
    qrCode: {
        type: String,
        default: "",
    },
    /* ==========================================================
       VERIFICATION PIN
       ========================================================== */
    verificationPin: {
        type: String,
        required: true,
        trim: true,
    },
    /* ==========================================================
       CHECK-IN / CHECK-OUT
       ========================================================== */
    checkedInAt: {
        type: Date,
    },
    checkedOutAt: {
        type: Date,
    },
    /* ==========================================================
       DRIVER SNAPSHOT
       ========================================================== */
    driverSnapshot: {
        type: driverSnapshotSchema,
        required: true,
    },
    /* ==========================================================
       PARKING SNAPSHOT
       ========================================================== */
    parkingSnapshot: {
        type: parkingSnapshotSchema,
        required: true,
    },
    /* ==========================================================
       VEHICLE SNAPSHOT
       ========================================================== */
    vehicleSnapshot: {
        type: vehicleSnapshotSchema,
        required: true,
    },
    /* ==========================================================
       CANCELLATION
       ========================================================== */
    cancellation: {
        type: cancellationSchema,
        default: undefined,
    },
}, {
    timestamps: true,
    versionKey: false,
});
/* ==============================================================
   INDEXES
   ============================================================== */
/*
 * Driver booking lookup
 */
bookingSchema.index({
    driverId: 1,
    bookingStatus: 1,
    createdAt: -1,
});
/*
 * Owner booking lookup
 */
bookingSchema.index({
    ownerId: 1,
    bookingStatus: 1,
    createdAt: -1,
});
/*
 * Parking booking lookup
 */
bookingSchema.index({
    parkingId: 1,
    bookingStatus: 1,
});
/*
 * Slot booking lookup
 */
bookingSchema.index({
    slotId: 1,
    bookingStatus: 1,
});
/*
 * Vehicle overlap lookup
 */
bookingSchema.index({
    vehicleId: 1,
    bookingStatus: 1,
    startTime: 1,
    endTime: 1,
});
/*
 * Time overlap lookup
 */
bookingSchema.index({
    startTime: 1,
    endTime: 1,
});
/*
 * Normal payment lookup
 */
bookingSchema.index({
    paymentStatus: 1,
});
/*
 * Overtime payment order lookup
 */
bookingSchema.index({
    overtimePaymentOrderId: 1,
});
/*
 * Overtime payment status lookup
 */
bookingSchema.index({
    overtimePaymentStatus: 1,
});
/* ==============================================================
   MODEL
   ============================================================== */
const Booking = mongoose.models.Booking ||
    mongoose.model("Booking", bookingSchema);
export default Booking;
//# sourceMappingURL=Booking.js.map