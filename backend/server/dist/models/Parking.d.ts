import mongoose, { Types } from "mongoose";
import { ParkingStatus } from "../constants/parking.js";
import { VehicleType } from "../constants/vehicle.js";
export interface IParkingImage {
    url: string;
    publicId: string;
}
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
    ownerName: string;
    contactNumber: string;
    parkingArea: number;
    facilities: string[];
    rules: string[];
    entryInstructions: string;
    supportedVehicleTypes: VehicleType[];
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
    images: IParkingImage[];
    operatingHours: {
        open: string;
        close: string;
    };
    averageRating: number;
    totalReviews: number;
    status: ParkingStatus;
    isActive: boolean;
    isTemporarilyClosed: boolean;
    temporaryClosedReason?: string;
    deletedAt?: Date | null;
}
export declare const PARKING_FACILITIES: readonly ["cctv", "security_guard", "covered_parking", "ev_charging", "lighting", "washroom", "drinking_water", "valet_parking", "disabled_access", "car_wash"];
export type ParkingFacility = (typeof PARKING_FACILITIES)[number];
declare const Parking: mongoose.Model<any, {}, {}, {}, any, any, any>;
export default Parking;
