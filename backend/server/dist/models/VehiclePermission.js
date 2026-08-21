import mongoose, { Schema } from "mongoose";
const vehiclePermissionSchema = new Schema({
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
}, {
    timestamps: true,
    versionKey: false,
});
vehiclePermissionSchema.index({
    vehicleId: 1,
    userId: 1,
}, {
    unique: true,
});
const VehiclePermission = mongoose.models.VehiclePermission ||
    mongoose.model("VehiclePermission", vehiclePermissionSchema);
export default VehiclePermission;
//# sourceMappingURL=VehiclePermission.js.map