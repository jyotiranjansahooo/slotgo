import type { CreateVehicleInput } from "../../validations/vehicle/create.validation.js";
interface CreateVehicleServiceInput extends CreateVehicleInput {
    ownerId: string;
}
export declare const createVehicleService: (data: CreateVehicleServiceInput) => Promise<any>;
export {};
