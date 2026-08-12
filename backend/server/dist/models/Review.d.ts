import mongoose, { Types } from "mongoose";
export interface IReview {
    bookingId: Types.ObjectId;
    driverId: Types.ObjectId;
    ownerId: Types.ObjectId;
    parkingId: Types.ObjectId;
    rating: number;
    comment: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Review: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default Review;
