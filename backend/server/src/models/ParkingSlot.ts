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

    supportedVehicleTypes: [
      {
        type: String,
        enum: VEHICLE_TYPE_VALUES,
        required: true,
      },
    ],

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

/* One slot number cannot repeat inside the same parking */
parkingSlotSchema.index(
  {
    parkingId: 1,
    slotNumber: 1,
  },
  {
    unique: true,
  },
);

/* Fast lookup for available slots */
parkingSlotSchema.index({
  parkingId: 1,
  status: 1,
});

/* Fast lookup by vehicle type */
parkingSlotSchema.index({
  supportedVehicleTypes: 1,
});

const ParkingSlot =
  mongoose.models.ParkingSlot ||
  mongoose.model<IParkingSlot>("ParkingSlot", parkingSlotSchema);

export default ParkingSlot;
