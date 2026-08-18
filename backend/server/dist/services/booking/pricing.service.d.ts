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
export interface OvertimePricingResult {
    overtimeMinutes: number;
    overtimeHours: number;
    overtimeParkingAmount: number;
    overtimeFine: number;
    overtimeTotal: number;
    ownerCommission: number;
    ownerReceives: number;
}
declare class PricingService {
    getHourlyRate(parking: IParking, vehicleType: VehicleType): number;
    calculate(parking: IParking, vehicleType: VehicleType, bookingMode: BookingMode, startTime: Date, endTime: Date): PricingResult;
    calculateOvertime(parking: IParking, vehicleType: VehicleType, bookedEndTime: Date, checkoutTime: Date): OvertimePricingResult;
}
declare const _default: PricingService;
export default _default;
