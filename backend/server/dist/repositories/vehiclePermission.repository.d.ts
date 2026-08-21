declare class VehiclePermissionRepository {
    findByVehicleAndUser(vehicleId: string, userId: string): Promise<any>;
    findApprovedByUser(userId: string): Promise<any[]>;
    findByVehicle(vehicleId: string): Promise<any[]>;
    create(data: {
        vehicleId: string;
        userId: string;
        grantedBy: string;
        status?: "pending" | "approved" | "revoked";
    }): Promise<any>;
    approve(vehicleId: string, userId: string): Promise<any>;
    revoke(vehicleId: string, userId: string): Promise<any>;
}
declare const _default: VehiclePermissionRepository;
export default _default;
