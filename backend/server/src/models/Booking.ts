import mongoose, { Schema, Types } from "mongoose";

import {
  BOOKING_MODE,
  BOOKING_MODE_VALUES,
  BOOKING_STATUS,
  BOOKING_STATUS_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
  CANCELLED_BY,
  CANCELLED_BY_VALUES,
  BookingMode,
  BookingStatus,
  PaymentStatus,
  CancelledBy,
} from "../constants/booking.js";

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
    manufacturer: string;
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

const driverSnapshotSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const parkingSnapshotSchema = new Schema(
  {
    parkingName: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const vehicleSnapshotSchema = new Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
    },

    manufacturer: {
      type: String,
      required: true,
    },

    vehicleModel: {
      type: String,
      required: true,
    },

    vehicleType: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const cancellationSchema = new Schema(
  {
    cancelledBy: {
      type: String,
      enum: CANCELLED_BY_VALUES,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    cancelledAt: {
      type: Date,
      required: true,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    penaltyAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const paymentSchema = new Schema(
  {
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
  },
  {
    _id: false,
  },
);

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
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

    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.PENDING,
    },

    bookingStatus: {
      type: String,
      enum: BOOKING_STATUS_VALUES,
      default: BOOKING_STATUS.PENDING,
    },

    payment: paymentSchema,

    qrCode: {
      type: String,
      default: "",
    },

    verificationPin: {
      type: String,
      required: true,
    },

    checkedInAt: Date,

    checkedOutAt: Date,

    driverSnapshot: {
      type: driverSnapshotSchema,
      required: true,
    },

    parkingSnapshot: {
      type: parkingSnapshotSchema,
      required: true,
    },
    vehicleSnapshot: {
      type: vehicleSnapshotSchema,
      required: true,
    },

    cancellation: cancellationSchema,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
bookingSchema.index({
  driverId: 1,
  bookingStatus: 1,
});

bookingSchema.index({
  parkingId: 1,
  bookingStatus: 1,
});

bookingSchema.index({
  slotId: 1,
  bookingStatus: 1,
});

bookingSchema.index({
  startTime: 1,
  endTime: 1,
});

bookingSchema.index({
  paymentStatus: 1,
});

const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
