import { VehicleType } from "../../constants/vehicle.js";
declare class SlotAllocatorService {
    findAvailableSlot(parkingId: string, vehicleType: VehicleType): Promise<any>;
    confirmReservation(slotId: string): Promise<any>;
    reserveAvailableSlot(parkingId: string, vehicleType: VehicleType): Promise<any>;
    releaseSlot(slotId: string): Promise<any>;
    occupySlot(slotId: string): Promise<any>;
}
declare const _default: SlotAllocatorService;
export default _default;
