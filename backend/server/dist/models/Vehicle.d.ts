import mongoose, { Document } from "mongoose";
import { VehicleType } from "../constants/vehicle.js";
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
declare const Vehicle: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default Vehicle;
