import { CreateParkingSlotInput } from "../../validations/parkingslot/create.validation.js";
declare class ParkingSlotService {
    createSlot(ownerId: string, data: CreateParkingSlotInput): Promise<any>;
    getAvailableSlots(parkingId: string): Promise<any[]>;
    getParkingSlots(parkingId: string): Promise<any[]>;
    deleteSlot(ownerId: string, slotId: string): Promise<any>;
}
declare const _default: ParkingSlotService;
export default _default;
