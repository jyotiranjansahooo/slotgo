import { IParking } from "../models/Parking.js";
declare class ParkingRepository {
    create(data: Partial<IParking>): Promise<any>;
    findById(id: string): Promise<any>;
    findByOwner(ownerId: string): Promise<any[]>;
    findAll(): Promise<any[]>;
    update(id: string, data: Partial<IParking>): Promise<any>;
    deactivate(id: string): Promise<any>;
    delete(id: string): Promise<any>;
    approve(id: string): Promise<any>;
    reject(id: string): Promise<any>;
}
declare const _default: ParkingRepository;
export default _default;
