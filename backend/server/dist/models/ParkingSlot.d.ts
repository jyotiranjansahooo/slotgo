import mongoose, { Types } from "mongoose";
import { VehicleType } from "../constants/vehicle.js";
import { SlotStatus } from "../constants/slot.js";
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
declare const ParkingSlot: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default ParkingSlot;
