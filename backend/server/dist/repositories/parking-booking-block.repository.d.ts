import { CreateParkingBookingBlockInput } from "../validations/parking-booking-block/create.validation.js";
declare class ParkingBookingBlockRepository {
    create(data: CreateParkingBookingBlockInput & {
        parkingId: string;
        createdBy: string;
    }): Promise<any>;
    findById(id: string): Promise<any>;
    findByParking(parkingId: string): Promise<any[]>;
    findOverlapping(parkingId: string, startTime: Date, endTime: Date): Promise<any>;
    delete(id: string): Promise<any>;
}
declare const _default: ParkingBookingBlockRepository;
export default _default;
