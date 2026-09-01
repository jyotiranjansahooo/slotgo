import { UpdateParkingInput } from "../../validations/parking/update.validation.js";
import { CreateParkingInput } from "../../validations/parking/create.validation.js";
declare class ParkingService {
    createParking(ownerId: string, data: CreateParkingInput, files: Express.Multer.File[]): Promise<any>;
    getMyParkings(ownerId: string): Promise<any[]>;
    getParkingById(id: string): Promise<any>;
    getParkingForOwner(ownerId: string, parkingId: string): Promise<any>;
    approveParking(parkingId: string): Promise<any>;
    rejectParking(parkingId: string): Promise<any>;
    updateParking(ownerId: string, parkingId: string, data: UpdateParkingInput): Promise<any>;
    updateParkingAvailability(ownerId: string, parkingId: string, data: {
        isTemporarilyClosed: boolean;
        reason?: string;
        otp?: string;
    }): Promise<any>;
    deactivateParking(ownerId: string, parkingId: string, otp: string): Promise<any>;
}
declare const _default: ParkingService;
export default _default;
