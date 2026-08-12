import { CreateVehicleInput } from "../../validations/vehicle/create.validation.js";
import { UpdateVehicleInput } from "../../validations/vehicle/update.validation.js";
declare class VehicleService {
    create(ownerId: string, data: CreateVehicleInput): Promise<any>;
    getAll(ownerId: string): Promise<any[]>;
    getById(ownerId: string, vehicleId: string): Promise<any>;
    update(ownerId: string, vehicleId: string, data: UpdateVehicleInput): Promise<any>;
    delete(ownerId: string, vehicleId: string): Promise<any>;
    setDefault(ownerId: string, vehicleId: string): Promise<any>;
}
declare const _default: VehicleService;
export default _default;
