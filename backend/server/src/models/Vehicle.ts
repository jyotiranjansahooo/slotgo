import mongoose, { Schema, Document } from "mongoose";

import {
  VEHICLE_TYPE_VALUES,
  VehicleType,
} from "../constants/vehicle.js";

export interface IVehicle extends Document {
  // Permanent/original owner of the physical vehicle
  ownerId: mongoose.Types.ObjectId;

  vehicleType: VehicleType;

  registrationNumber: string;

  brand: string;

  vehicleModel: string;

  color: string;

  isDefault: boolean;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    // =====================================================
    // ORIGINAL OWNER
    // =====================================================

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    // =====================================================
    // VEHICLE TYPE
    // =====================================================

    vehicleType: {
      type: String,
      enum: VEHICLE_TYPE_VALUES,
      required: true,
    },

    // =====================================================
    // REGISTRATION NUMBER
    // =====================================================

    registrationNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,

      // IMPORTANT:
      // Keep this unique.
      //
      // One physical vehicle must have only ONE
      // Vehicle document.
      //
      // Other drivers will receive permission to use
      // this vehicle instead of creating another Vehicle.
      unique: true,

      index: true,

      match: [
        /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/,
        "Invalid registration number",
      ],
    },

    // =====================================================
    // BRAND
    // =====================================================

    brand: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    // =====================================================
    // MODEL
    // =====================================================

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    // =====================================================
    // COLOR
    // =====================================================

    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    // =====================================================
    // DEFAULT
    // =====================================================

    isDefault: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // ACTIVE
    // =====================================================

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  },
);

// =========================================================
// INDEXES
// =========================================================

vehicleSchema.index({
  ownerId: 1,
  isDefault: 1,
});

// =========================================================
// MODEL
// =========================================================

const Vehicle =
  mongoose.models.Vehicle ||
  mongoose.model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;