import { CreateParkingBookingBlockInput } from "../../validations/parking-booking-block/create.validation.js";
declare class ParkingBookingBlockService {
    create(ownerId: string, parkingId: string, data: CreateParkingBookingBlockInput): Promise<any>;
    getMyBlocks(ownerId: string, parkingId: string): Promise<any[]>;
    delete(ownerId: string, blockId: string): Promise<any>;
}
declare const _default: ParkingBookingBlockService;
export default _default;
