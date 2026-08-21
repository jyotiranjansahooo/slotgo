import { IVehicle } from "../models/Vehicle.js";
export interface CreateVehicleData {
    ownerId: string;
    vehicleType: IVehicle["vehicleType"];
    registrationNumber: string;
    brand: string;
    vehicleModel: string;
    color: string;
    isDefault: boolean;
}
declare class VehicleRepository {
    create(vehicleData: CreateVehicleData): Promise<any>;
    findById(id: string): Promise<any>;
    findByOwnerId(ownerId: string): Promise<any[]>;
    findByRegistrationNumber(registrationNumber: string): Promise<any>;
    update(id: string, data: Partial<Omit<CreateVehicleData, "ownerId">>): Promise<any>;
    delete(id: string): Promise<any>;
    clearDefault(ownerId: string): Promise<import("mongoose").UpdateWriteOpResult>;
    setDefault(id: string): Promise<any>;
}
declare const _default: VehicleRepository;
export default _default;
