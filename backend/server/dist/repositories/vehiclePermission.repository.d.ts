export interface CreateVehiclePermissionData {
    vehicleId: string;
    ownerId: string;
    driverId: string;
}
declare class VehiclePermissionRepository {
    create(data: CreateVehiclePermissionData): Promise<any>;
    findByVehicleAndDriver(vehicleId: string, driverId: string): Promise<any>;
    findActivePermission(vehicleId: string, driverId: string): Promise<any>;
    findByVehicleId(vehicleId: string): Promise<any[]>;
    findByDriverId(driverId: string): Promise<any[]>;
    revoke(id: string): Promise<any>;
    revokeByVehicleAndDriver(vehicleId: string, driverId: string): Promise<any>;
}
declare const _default: VehiclePermissionRepository;
export default _default;
