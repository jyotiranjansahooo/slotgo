import mongoose, { Document, Schema } from "mongoose";

export interface IVehiclePermission extends Document {
  vehicleId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  status: "pending" | "approved" | "revoked";

  grantedBy: mongoose.Types.ObjectId;

  grantedAt?: Date;
  revokedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const vehiclePermissionSchema = new Schema<IVehiclePermission>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      immutable: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "revoked"],
      default: "pending",
      required: true,
    },

    grantedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    grantedAt: {
      type: Date,
    },

    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

vehiclePermissionSchema.index(
  {
    vehicleId: 1,
    userId: 1,
  },
  {
    unique: true,
  },
);

const VehiclePermission =
  mongoose.models.VehiclePermission ||
  mongoose.model<IVehiclePermission>(
    "VehiclePermission",
    vehiclePermissionSchema,
  );

export default VehiclePermission;