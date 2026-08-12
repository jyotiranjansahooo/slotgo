import { UpdateParkingInput } from "../../validations/parking/update.validation.js";
import { CreateParkingInput } from "../../validations/parking/create.validation.js";
declare class ParkingService {
    createParking(ownerId: string, data: CreateParkingInput): Promise<any>;
    getMyParkings(ownerId: string): Promise<any[]>;
    approveParking(parkingId: string): Promise<any>;
    rejectParking(parkingId: string): Promise<any>;
    getParkingById(id: string): Promise<any>;
    updateParking(ownerId: string, parkingId: string, data: UpdateParkingInput): Promise<any>;
    deactivateParking(ownerId: string, parkingId: string): Promise<any>;
}
declare const _default: ParkingService;
export default _default;
