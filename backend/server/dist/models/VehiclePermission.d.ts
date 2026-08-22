import mongoose, { Document } from "mongoose";
export declare const VEHICLE_PERMISSION_STATUS: {
    readonly APPROVED: "approved";
    readonly REVOKED: "revoked";
};
export type VehiclePermissionStatus = (typeof VEHICLE_PERMISSION_STATUS)[keyof typeof VEHICLE_PERMISSION_STATUS];
export interface IVehiclePermission extends Document {
    vehicleId: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    driverId: mongoose.Types.ObjectId;
    status: VehiclePermissionStatus;
    grantedAt: Date;
    revokedAt?: Date | null;
}
declare const VehiclePermission: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default VehiclePermission;
