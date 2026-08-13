import { VehicleType } from "../../constants/vehicle.js";
import { BookingMode } from "../../constants/booking.js";
import { IParking } from "../../models/Parking.js";
export interface PricingResult {
    parkingAmount: number;
    discountAmount: number;
    actualAmount: number;
    ownerCommission: number;
    driverServiceFee: number;
    ownerReceives: number;
    driverPays: number;
}
declare class PricingService {
    calculate(parking: IParking, vehicleType: VehicleType, bookingMode: BookingMode, startTime: Date, endTime: Date): PricingResult;
}
declare const _default: PricingService;
export default _default;
