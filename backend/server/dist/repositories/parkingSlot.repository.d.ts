import { IParkingSlot } from "../models/ParkingSlot.js";
import { SlotStatus } from "../constants/slot.js";
import { VehicleType } from "../constants/vehicle.js";
declare class ParkingSlotRepository {
    create(data: Partial<IParkingSlot>): Promise<any>;
    findById(id: string): Promise<any>;
    findByParkingAndSlotNumber(parkingId: string, slotNumber: string): Promise<any>;
    findByParking(parkingId: string): Promise<any[]>;
    findAvailableByVehicleType(parkingId: string, vehicleType: VehicleType): Promise<any[]>;
    findAvailable(parkingId: string): Promise<any[]>;
    findFirstAvailable(parkingId: string, vehicleType: VehicleType): Promise<any>;
    reserve(parkingId: string, vehicleType: VehicleType, reservedUntil: Date): Promise<any>;
    occupy(slotId: string): Promise<any>;
    finalizeReservation(slotId: string, reservedUntil: Date): Promise<any>;
    confirmReservation(slotId: string): Promise<any>;
    release(slotId: string): Promise<any>;
    update(id: string, data: Partial<IParkingSlot>): Promise<any>;
    updateStatus(id: string, status: SlotStatus): Promise<any>;
    releaseExpiredReservations(): Promise<import("mongoose").UpdateWriteOpResult>;
    delete(id: string): Promise<any>;
}
declare const _default: ParkingSlotRepository;
export default _default;
