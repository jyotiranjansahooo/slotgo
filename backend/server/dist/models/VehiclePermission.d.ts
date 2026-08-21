import mongoose, { Document } from "mongoose";
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
declare const VehiclePermission: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default VehiclePermission;
