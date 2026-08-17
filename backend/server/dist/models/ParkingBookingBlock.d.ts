import mongoose, { Document } from "mongoose";
export interface IParkingBookingBlock extends Document {
    parkingId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const ParkingBookingBlock: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default ParkingBookingBlock;
