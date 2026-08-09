import mongoose, { Schema, Document } from "mongoose";
import { VEHICLE_TYPE_VALUES, VehicleType } from "../constants/vehicle.js";

export interface IVehicle extends Document {
  ownerId: mongoose.Types.ObjectId;

  vehicleType: VehicleType;

  registrationNumber: string;

  brand: string;

  vehicleModel: string;

  color: string;

  isDefault: boolean;

  isActive: boolean;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    vehicleType: {
      type: String,
      enum: VEHICLE_TYPE_VALUES,
      required: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
      match: [
        /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/,
        "Invalid registration number",
      ],
    },

    brand: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

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

vehicleSchema.index({
  ownerId: 1,
  isDefault: 1,
});

const Vehicle =
  mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;
