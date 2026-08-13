import { VehicleType } from "../../constants/vehicle.js";
declare class ParkingDiscoveryService {
    getApprovedParkings(): Promise<any[]>;
    searchParkings(filters: {
        city?: string;
        parkingType?: string;
    }): Promise<any[]>;
    getParkingDetails(parkingId: string): Promise<{
        parking: any;
        availability: {
            totalAvailableSlots: number;
            slots: any[];
        };
    }>;
    getAvailableSlots(parkingId: string, vehicleType: VehicleType): Promise<{
        parkingId: string;
        vehicleType: VehicleType;
        totalAvailableSlots: number;
        slots: any[];
    }>;
}
declare const _default: ParkingDiscoveryService;
export default _default;
