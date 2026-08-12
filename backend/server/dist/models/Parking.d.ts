import mongoose, { Types } from "mongoose";
import { ParkingStatus } from "../constants/parking.js";
export interface IParking {
    ownerId: Types.ObjectId;
    parkingName: string;
    description: string;
    parkingType: string;
    address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    location: {
        latitude: number;
        longitude: number;
    };
    facilities: string[];
    rules: string[];
    entryInstructions: string;
    bookingModes: {
        hourly: boolean;
        daily: boolean;
        monthly: boolean;
    };
    pricing: {
        currency: string;
        twoWheeler: {
            hourly?: number;
            daily?: number;
            monthly?: number;
        };
        fourWheeler: {
            hourly?: number;
            daily?: number;
            monthly?: number;
        };
        vanMinibus: {
            hourly?: number;
            daily?: number;
            monthly?: number;
        };
        heavyVehicle: {
            hourly?: number;
            daily?: number;
            monthly?: number;
        };
    };
    images: {
        url: string;
        publicId: string;
    }[];
    operatingHours: {
        open: string;
        close: string;
    };
    averageRating: number;
    totalReviews: number;
    status: ParkingStatus;
    isActive: boolean;
}
declare const Parking: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default Parking;
