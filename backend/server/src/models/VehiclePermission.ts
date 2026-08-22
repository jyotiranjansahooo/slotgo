import mongoose, { Document, Schema } from "mongoose";

export const VEHICLE_PERMISSION_STATUS = {
  APPROVED: "approved",
  REVOKED: "revoked",
} as const;

export type VehiclePermissionStatus =
  (typeof VEHICLE_PERMISSION_STATUS)[keyof typeof VEHICLE_PERMISSION_STATUS];

export interface IVehiclePermission extends Document {
  vehicleId: mongoose.Types.ObjectId;

  ownerId: mongoose.Types.ObjectId;

  driverId: mongoose.Types.ObjectId;

  status: VehiclePermissionStatus;

  grantedAt: Date;

  revokedAt?: Date | null;
}

const vehiclePermissionSchema = new Schema<IVehiclePermission>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    driverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(VEHICLE_PERMISSION_STATUS),
      default: VEHICLE_PERMISSION_STATUS.APPROVED,
      required: true,
    },

    grantedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Prevent duplicate permission records
vehiclePermissionSchema.index(
  {
    vehicleId: 1,
    driverId: 1,
  },
  {
    unique: true,
  },
);

// Useful for checking a driver's permissions
vehiclePermissionSchema.index({
  driverId: 1,
  status: 1,
});

const VehiclePermission =
  mongoose.models.VehiclePermission ||
  mongoose.model<IVehiclePermission>(
    "VehiclePermission",
    vehiclePermissionSchema,
  );

export default VehiclePermission;
