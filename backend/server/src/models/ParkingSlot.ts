import mongoose, { Schema, Types } from "mongoose";

import { VEHICLE_TYPE_VALUES, VehicleType } from "../constants/vehicle.js";

import {
  SLOT_STATUS,
  SLOT_STATUS_VALUES,
  SlotStatus,
} from "../constants/slot.js";

export interface IParkingSlot {
  parkingId: Types.ObjectId;

  slotNumber: string;

  floor: string;

  supportedVehicleTypes: VehicleType[];

  capacity: number;
  occupiedCount: number;
  reservedCount: number;

  status: SlotStatus;
  displayOrder: number;
  isActive: boolean;
  reservedUntil?: Date;

  lastOccupiedAt?: Date;
  notes?: string;
}

const parkingSlotSchema = new Schema<IParkingSlot>(
  {
    parkingId: {
      type: Schema.Types.ObjectId,
      ref: "Parking",
      required: true,
      immutable: true,
      index: true,
    },

    slotNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    floor: {
      type: String,
      default: "Ground",
      trim: true,
    },

    supportedVehicleTypes: {
      type: [
        {
          type: String,
          enum: VEHICLE_TYPE_VALUES,
        },
      ],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "At least one vehicle type is required.",
      },
    },

    capacity: {
      type: Number,
      required: true,
      default: 50,
      min: 1,
      max: 10000,
    },

    occupiedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    reservedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: SLOT_STATUS_VALUES,
      default: SLOT_STATUS.AVAILABLE,
    },

    reservedUntil: {
      type: Date,
      default: null,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastOccupiedAt: {
      type: Date,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

parkingSlotSchema.index(
  {
    parkingId: 1,
    slotNumber: 1,
  },
  {
    unique: true,
  },
);

parkingSlotSchema.index({
  parkingId: 1,
  status: 1,
});

parkingSlotSchema.index({
  supportedVehicleTypes: 1,
});

parkingSlotSchema.index({
  parkingId: 1,
  occupiedCount: 1,
  reservedCount: 1,
});

parkingSlotSchema.virtual("availableCount").get(function () {
  return Math.max(0, this.capacity - this.occupiedCount - this.reservedCount);
});

parkingSlotSchema.set("toJSON", {
  virtuals: true,
});

parkingSlotSchema.set("toObject", {
  virtuals: true,
});

const ParkingSlot =
  mongoose.models.ParkingSlot ||
  mongoose.model<IParkingSlot>("ParkingSlot", parkingSlotSchema);

export default ParkingSlot;
